import React from 'react'

/**
 * Reusable ClimaScore logo component.
 * - Uses image at public/climascore.png (available at "/climascore.png").
 * - Rounded corners by default; customizable via props.
 * - Can optionally render brand text next to the mark.
 */
export default function ClimaScoreLogo({
  size = 28,
  rounded = true,
  withText = false,
  className = '',
  textClass = '',
  imgClass = '',
  title = 'ClimaScore',
}) {
  const radiusClass = rounded ? 'rounded-lg' : ''
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src="/climascore.png"
        alt={title}
        width={size}
        height={size}
        className={`${radiusClass} ${imgClass}`}
        style={{ objectFit: 'cover' }}
      />
      {withText && (
        <span className={`font-semibold tracking-wide ${textClass}`}>{title}</span>
      )}
    </div>
  )
}
