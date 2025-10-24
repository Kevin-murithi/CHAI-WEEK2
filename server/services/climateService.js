// services/climateService.js
// Baseline risk model using Open-Meteo daily data (no API key required)
// Computes drought, flood, and heat stress risks over recent 30 days and 7-day outlook.

// Simple in-memory TTL cache (per-process). Good enough for hackathon demo.
const _CACHE = new Map(); // key -> { value, expires }
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function _getCache(key) {
  const item = _CACHE.get(key);
  if (item && item.expires > Date.now()) return item.value;
  if (item) _CACHE.delete(key);
  return null;
}

function _setCache(key, value, ttlMs = CACHE_TTL_MS) {
  _CACHE.set(key, { value, expires: Date.now() + ttlMs });
}

async function fetchOpenMeteo({ lat, lon }) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('daily', [
    'precipitation_sum',
    'temperature_2m_max',
    'temperature_2m_min'
  ].join(','));
  url.searchParams.set('past_days', '30');
  url.searchParams.set('forecast_days', '7');
  url.searchParams.set('timezone', 'auto');

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`Open-Meteo fetch failed: ${resp.status}`);
  const data = await resp.json();
  return data;
}

// ERA5 reanalysis via Open-Meteo Archive API (daily). We'll use the same 30-day window.
async function fetchEra5({ lat, lon, start, end }) {
  const url = new URL('https://archive-api.open-meteo.com/v1/era5');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('start_date', start);
  url.searchParams.set('end_date', end);
  url.searchParams.set('daily', ['precipitation_sum', 'temperature_2m_max'].join(','));
  url.searchParams.set('timezone', 'auto');

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`ERA5 fetch failed: ${resp.status}`);
  const data = await resp.json();
  return data;
}

// NASA POWER: historical daily only (no forecast). We'll use last 30 days.
// Docs: https://power.larc.nasa.gov/docs/services/api/parameters/
// Parameters: PRECTOTCORR (mm/day), T2M_MAX (C)
async function fetchNasaPower({ lat, lon }) {
  const today = new Date();
  // POWER daily data is available up to yesterday
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);

  function fmt(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${da}`;
  }

  const url = new URL('https://power.larc.nasa.gov/api/temporal/daily/point');
  url.searchParams.set('parameters', 'PRECTOTCORR,T2M_MAX');
  url.searchParams.set('start', fmt(start));
  url.searchParams.set('end', fmt(end));
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('community', 'AG');
  url.searchParams.set('format', 'JSON');

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`NASA POWER fetch failed: ${resp.status}`);
  const data = await resp.json();
  return data;
}

// Transform NASA POWER response into a structure similar to Open-Meteo daily
function dailyFromNasa(powerJson) {
  const params = powerJson?.properties?.parameter || {};
  const precipMap = params.PRECTOTCORR || params.PRECTOT || {};
  const tmaxMap = params.T2M_MAX || {};
  const dates = Object.keys(precipMap).sort();

  const daily = {
    time: [],
    precipitation_sum: [],
    temperature_2m_max: []
  };
  for (const date of dates) {
    daily.time.push(date);
    const rawP = Number(precipMap[date] ?? 0);
    const p = Number.isFinite(rawP) && rawP > 0 ? rawP : 0; // NASA uses -999 for missing; clamp negatives to 0
    daily.precipitation_sum.push(p);

    const rawT = Number(tmaxMap[date] ?? 0);
    const t = Number.isFinite(rawT) ? rawT : 0; // if missing, set 0 (won't count as heat stress)
    daily.temperature_2m_max.push(t);
  }
  return daily;
}

function summarizeRisks(daily) {
  const precip = daily.precipitation_sum || [];
  const tmax = daily.temperature_2m_max || [];
  const dates = daily.time || [];

  // Split last 30 days and next 7 days based on available length
  const n = dates.length;
  const last30 = Math.min(30, n);
  const last30Precip = precip.slice(n - last30);
  const last30Tmax = tmax.slice(n - last30);

  // Simple drought heuristic: total precip in last 30 days
  const total30 = last30Precip.reduce((a, b) => a + (b || 0), 0);
  let droughtRiskScore; // 0 (low) to 1 (high)
  if (total30 >= 150) droughtRiskScore = 0.1; // wet
  else if (total30 >= 100) droughtRiskScore = 0.3;
  else if (total30 >= 60) droughtRiskScore = 0.6;
  else droughtRiskScore = 0.85; // very dry

  // Consecutive dry days in last 30 days
  let maxDryStreak = 0, curStreak = 0;
  for (const p of last30Precip) {
    if ((p || 0) < 1) { curStreak += 1; maxDryStreak = Math.max(maxDryStreak, curStreak); }
    else curStreak = 0;
  }
  droughtRiskScore = Math.min(1, droughtRiskScore + Math.max(0, (maxDryStreak - 5) * 0.03));

  // Flood heuristic: count of heavy rain days (>30mm) in last 30 days
  const heavyRainDays = last30Precip.filter(p => (p || 0) >= 30).length;
  let floodRiskScore = Math.min(1, heavyRainDays * 0.15);

  // Heat stress heuristic: days with Tmax > 34C in last 30 days
  const heatStressDays = last30Tmax.filter(t => (t || 0) >= 34).length;
  let heatRiskScore = Math.min(1, heatStressDays * 0.07);

  // Categorize risks
  function toBand(x) { return x < 0.33 ? 'low' : x < 0.66 ? 'medium' : 'high'; }

  return {
    droughtRiskScore,
    floodRiskScore,
    heatRiskScore,
    risk_breakdown: {
      drought_risk: toBand(droughtRiskScore),
      flood_risk: toBand(floodRiskScore),
      heat_stress_risk: toBand(heatRiskScore),
    },
    debug: {
      total30_precip_mm: total30,
      max_dry_streak_days: maxDryStreak,
      heavy_rain_days_30mm: heavyRainDays,
      heat_stress_days_gt34c: heatStressDays,
      days_count: n
    }
  };
}

function scoreAndRecommendation({ droughtRiskScore, floodRiskScore, heatRiskScore, crop }) {
  // Simple weighted risk aggregation. For maize default weights below.
  const weightsByCrop = {
    maize: { drought: 0.5, flood: 0.3, heat: 0.2 },
    default: { drought: 0.45, flood: 0.3, heat: 0.25 }
  };
  const w = weightsByCrop[crop] || weightsByCrop.default;

  const riskSum = w.drought * droughtRiskScore + w.flood * floodRiskScore + w.heat * heatRiskScore;
  const climascore = Math.max(0, Math.min(100, Math.round(100 - riskSum * 100)));

  // Very simple loan heuristic: scale amount and rate by score
  const baseAmount = 500; // USD
  const baseRate = 0.11; // 11%
  const amount = Math.round(baseAmount * (0.6 + climascore / 200)); // 60% to 110%
  const interest_rate = Math.round((baseRate + (0.2 - climascore / 1000)) * 1000) / 10; // ~9% to 25%

  // Confidence based on data recency/coverage; here static medium-high
  const confidence = Math.round((0.7 + (climascore / 100) * 0.3) * 100) / 100; // 0.7–1.0

  return {
    climascore,
    recommended_loan_terms: { amount, interest_rate: Math.max(5, Math.min(30, interest_rate)), confidence }
  };
}

async function computeClimaScore({ lat, lon, crop, planting_date, source }) {
  const data_sources_used = [];
  let debug = {};
  try {
    const cacheKey = `single:${source || 'default'}:${lat.toFixed(4)},${lon.toFixed(4)}:${crop}`;
    const cached = _getCache(cacheKey);
    if (cached) {
      return { ...cached, debug: { ...cached.debug, cache_hit: true } };
    }

    let daily;
    if (source === 'nasa' || source === 'power' || source === 'nasa-power') {
      const power = await fetchNasaPower({ lat, lon });
      data_sources_used.push('nasa-power');
      daily = dailyFromNasa(power);
    } else {
      const meteo = await fetchOpenMeteo({ lat, lon });
      data_sources_used.push('open-meteo');
      daily = meteo.daily || {};
    }

    if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
      throw new Error('No daily data available from selected source');
    }

    const { droughtRiskScore, floodRiskScore, heatRiskScore, risk_breakdown, debug: dbg } = summarizeRisks(daily);
    debug = { ...debug, ...dbg };

    const { climascore, recommended_loan_terms } = scoreAndRecommendation({ droughtRiskScore, floodRiskScore, heatRiskScore, crop });

    try {
      console.log('SAT_DATA', {
        source: data_sources_used[0] || 'unknown',
        lat: Number(lat.toFixed ? lat.toFixed(4) : lat),
        lon: Number(lon.toFixed ? lon.toFixed(4) : lon),
        days: debug?.days_count ?? (daily?.time?.length || 0),
        total30_precip_mm: debug?.total30_precip_mm,
        heavy_rain_days_30mm: debug?.heavy_rain_days_30mm,
        heat_stress_days_gt34c: debug?.heat_stress_days_gt34c,
        climascore
      });
    } catch {}

    const result = { climascore, risk_breakdown, recommended_loan_terms, data_sources_used, debug };
    _setCache(cacheKey, result);
    return result;
  } catch (e) {
    // Fallback: if API fails, return a degraded response
    debug.error = e.message;
    return {
      climascore: 50,
      risk_breakdown: { drought_risk: 'medium', flood_risk: 'medium', heat_stress_risk: 'medium' },
      recommended_loan_terms: { amount: 500, interest_rate: 12, confidence: 0.5 },
      data_sources_used,
      debug
    };
  }
}

// Compare multiple sources side-by-side for the same coordinates and crop
async function compareClimaScores({ lat, lon, crop, planting_date }) {
  // Build a consistent 30-day window ending yesterday
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const startISO = fmt(start);
  const endISO = fmt(end);

  const cacheKey = `compare:${lat.toFixed(4)},${lon.toFixed(4)}:${crop}:${startISO}-${endISO}`;
  const cached = _getCache(cacheKey);
  if (cached) return { ...cached, cache_hit: true };

  const results = [];

  // Run sources in parallel
  const tasks = {
    'nasa-power': (async () => {
      try {
        const power = await fetchNasaPower({ lat, lon });
        const daily = dailyFromNasa(power);
        if (!daily?.time?.length) throw new Error('No NASA daily data');
        const s = summarizeRisks(daily);
        const agg = scoreAndRecommendation({ droughtRiskScore: s.droughtRiskScore, floodRiskScore: s.floodRiskScore, heatRiskScore: s.heatRiskScore, crop });
        results.push({ source: 'nasa-power', climascore: agg.climascore, risk_breakdown: s.risk_breakdown, recommended_loan_terms: agg.recommended_loan_terms, debug: s.debug });
      } catch (e) {
        results.push({ source: 'nasa-power', error: e.message });
      }
    })(),
    'open-meteo': (async () => {
      try {
        const meteo = await fetchOpenMeteo({ lat, lon });
        const daily = meteo.daily || {};
        if (!daily?.time?.length) throw new Error('No Open-Meteo daily data');
        const s = summarizeRisks(daily);
        const agg = scoreAndRecommendation({ droughtRiskScore: s.droughtRiskScore, floodRiskScore: s.floodRiskScore, heatRiskScore: s.heatRiskScore, crop });
        results.push({ source: 'open-meteo', climascore: agg.climascore, risk_breakdown: s.risk_breakdown, recommended_loan_terms: agg.recommended_loan_terms, debug: s.debug });
      } catch (e) {
        results.push({ source: 'open-meteo', error: e.message });
      }
    })(),
    'era5': (async () => {
      try {
        const era = await fetchEra5({ lat, lon, start: startISO, end: endISO });
        const daily = era.daily || {};
        if (!daily?.time?.length) throw new Error('No ERA5 daily data');
        const s = summarizeRisks(daily);
        const agg = scoreAndRecommendation({ droughtRiskScore: s.droughtRiskScore, floodRiskScore: s.floodRiskScore, heatRiskScore: s.heatRiskScore, crop });
        results.push({ source: 'era5', climascore: agg.climascore, risk_breakdown: s.risk_breakdown, recommended_loan_terms: agg.recommended_loan_terms, debug: s.debug });
      } catch (e) {
        results.push({ source: 'era5', error: e.message });
      }
    })()
  };

  await Promise.all(Object.values(tasks));

  // Choose two closest sources by precipitation total (or climascore if precip missing)
  const valid = results.filter(r => !r.error && r?.debug);
  let suggested_sources = [];
  let rationale = '';
  if (valid.length >= 2) {
    // Build pairwise differences
    const pairs = [];
    for (let i = 0; i < valid.length; i++) {
      for (let j = i + 1; j < valid.length; j++) {
        const a = valid[i], b = valid[j];
        const da = Number(a.debug?.total30_precip_mm ?? NaN);
        const db = Number(b.debug?.total30_precip_mm ?? NaN);
        let diff = Number.isFinite(da) && Number.isFinite(db) ? Math.abs(da - db) : Math.abs(a.climascore - b.climascore);
        pairs.push({ a: a.source, b: b.source, diff, da, db });
      }
    }
    pairs.sort((x, y) => x.diff - y.diff);
    if (pairs.length) {
      suggested_sources = [pairs[0].a, pairs[0].b];
      rationale = `Closest by 30-day precipitation difference (${pairs[0].diff.toFixed(2)} mm)`;
    }
  }

  const payload = {
    compare: true,
    coordinates: { lat, lon },
    window_days: 30,
    period: { start: startISO, end: endISO },
    sources: results,
    suggested_sources,
    rationale
  };
  try {
    console.log('SAT_DATA_COMPARE', {
      lat: Number(lat.toFixed ? lat.toFixed(4) : lat),
      lon: Number(lon.toFixed ? lon.toFixed(4) : lon),
      period: { start: startISO, end: endISO },
      sources: results.map(r => ({ source: r.source, climascore: r.climascore, total30_precip_mm: r?.debug?.total30_precip_mm, error: r.error || undefined }))
    });
  } catch {}
  _setCache(cacheKey, payload);
  return payload;
}

module.exports = { computeClimaScore, compareClimaScores };
