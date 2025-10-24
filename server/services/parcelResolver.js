// Mock parcel resolver service. Replace driver with authoritative provider when available.
const crypto = require('crypto')

function normalizeNumber(input) {
  return String(input || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/^LR\.?/i, '')
    .replace(/^NO\.?/i, '')
}

function hashToCoord(str) {
  const h = crypto.createHash('md5').update(str).digest('hex')
  const a = parseInt(h.slice(0, 8), 16)
  const b = parseInt(h.slice(8, 16), 16)
  // Kenya approx bbox: lat [-4.7, 5.2], lon [33.9, 41.9]
  const lat = -4.7 + (a / 0xffffffff) * (5.2 - -4.7)
  const lon = 33.9 + (b / 0xffffffff) * (41.9 - 33.9)
  return { lat, lon }
}

function makeSquare(center, meters = 150) {
  // rough meters/deg conversion at equator-ish
  const dLat = meters / 111320
  const dLon = meters / (111320 * Math.cos((center.lat * Math.PI) / 180))
  const poly = [
    [center.lon - dLon, center.lat - dLat],
    [center.lon + dLon, center.lat - dLat],
    [center.lon + dLon, center.lat + dLat],
    [center.lon - dLon, center.lat + dLat],
    [center.lon - dLon, center.lat - dLat],
  ]
  return {
    type: 'Polygon',
    coordinates: [poly],
  }
}

async function resolveParcel({ number, county, registryMapSheet }) {
  const norm = normalizeNumber(number)
  if (!norm) throw new Error('Parcel number required')
  // MOCK: derive a small square polygon from hash
  const ctr = hashToCoord(`${norm}|${county || ''}|${registryMapSheet || ''}`)
  const geometry = makeSquare(ctr, 150)
  const attributes = {
    number: norm,
    county: county || '',
    registryMapSheet: registryMapSheet || '',
    source: 'mock',
    acreageFromCadastre: 0.0225, // ~0.0225 ha for ~150m square rough
  }
  return { geometry, attributes }
}

module.exports = { resolveParcel }
