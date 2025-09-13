/* Minimal inline SVG icon set for advisory UI */
export const OverviewIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/>
  </svg>
)

export const SatelliteIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <path d="M10 7l7 7"/>
  </svg>
)

export const SoilIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17h18"/>
    <path d="M5 17c3-4 11-4 14 0"/>
    <path d="M12 7c2 0 4 2 4 4 0 0-2-1-4-1s-4 1-4 1c0-2 2-4 4-4z"/>
  </svg>
)

export const FertilizerIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="3" width="10" height="18" rx="2"/>
    <path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h6"/>
  </svg>
)

export const PlantingIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20v-6"/>
    <path d="M5 9c2-4 6-4 7-4 0 2-2 6-6 6"/>
    <path d="M19 9c-2-4-6-4-7-4 0 2 2 6 6 6"/>
  </svg>
)

export const AIIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="14" rx="2"/>
    <path d="M7 8h4v8"/><path d="M13 12h4"/>
  </svg>
)

export const AlertIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
)

export const CalendarIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

// Recommendation type icons
export const DropIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 6 9 6 13a6 6 0 1 0 12 0c0-4-6-11-6-11z"/>
  </svg>
)

export const LeafIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20s4-9 14-9c0 10-9 11-14 9z"/>
    <path d="M2 20c8-4 10-8 10-8"/>
  </svg>
)

export const SunCloudIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/>
    <path d="M6 1v2M6 9v2M1 6h2M9 6h2M4 4l1 1M8 8l1 1M8 4 7 5M4 8 5 7"/>
    <path d="M13 16h6a3 3 0 0 0 0-6 4 4 0 0 0-7-1"/>
  </svg>
)

export const BugIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="8" width="10" height="8" rx="4"/>
    <path d="M3 13h4M17 13h4M12 8V4M7 8 5 6M17 8l2-2M7 16l-2 2M17 16l2 2"/>
  </svg>
)

export const ClipboardIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="3" width="8" height="4" rx="1"/>
    <rect x="5" y="7" width="14" height="14" rx="2"/>
  </svg>
)

export const HarvestIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16a8 8 0 0 0 16 0"/>
    <path d="M12 3v9"/>
    <path d="M9 6h6"/>
  </svg>
)

export default {
  OverviewIcon,
  SatelliteIcon,
  SoilIcon,
  FertilizerIcon,
  PlantingIcon,
  AIIcon,
  AlertIcon,
  CalendarIcon,
  DropIcon,
  LeafIcon,
  SunCloudIcon,
  BugIcon,
  ClipboardIcon,
  HarvestIcon,
}
