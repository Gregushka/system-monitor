import React from 'react';
import './css/DigitalRound.css';

/**
 * DigitalRound  –  circular numeric indicator
 * ═══════════════════════════════════════════
 *
 * Registry config fields (via DigitalRoundCreate in indicatorRegistry.js):
 *   ind_id    {string}   Sensor id — must match /read_data "name" field
 *   bg_id     {string}   Background id
 *   label     {string}   Text shown outside the circle (e.g. "Pressure")
 *   unit      {string}   Measurement unit shown outside (e.g. "bar")
 *   top       {number}   0–2000 vertical position
 *   left      {number}   0–2000 horizontal position
 *   radius    {number}   Circle radius in px (default 48)
 *   fontSize  {number}   Value font size in px (default auto = radius * 0.42)
 *
 * Value received from API:
 *   A two-element array  [value, bgColor]
 *     value    {number}   – numeric reading to display
 *     bgColor  {string}   – CSS colour string for the circle fill
 *                           e.g. "#1a3a1a" (dark green) or "#3a0a0a" (dark red)
 *
 *   OR a plain number — in that case the circle fill defaults to config.defaultBg
 *   (fallback: '#0d1820').
 *
 *   null / undefined → OFFLINE state, grey circle, "—" text.
 *
 * Example definition:
 *   DigitalRoundCreate({
 *     ind_id:  'boiler-pressure',
 *     bg_id:   'diagram1',
 *     label:   'Pressure',
 *     unit:    'bar',
 *     top:     600,
 *     left:    400,
 *     radius:  56,
 *     fontSize: 22,
 *   });
 *
 * Example update (from mock or API):
 *   // API sends: { name: 'boiler-pressure', value: [4.2, '#0a2a0a'] }
 *   // OR plain:  { name: 'boiler-pressure', value: 4.2 }
 */
export default function DigitalRound({ config, value }) {
  const {
    label      = '',
    unit       = '',
    radius     = 48,
    fontSize,
    defaultBg  = '#0d1820',
  } = config;

  // ── Parse value ──────────────────────────────────────────────────────────
  const isOffline = value === null || value === undefined;

  let numVal   = null;
  let circleBg = defaultBg;

  if (!isOffline) {
    if (Array.isArray(value)) {
      numVal   = parseFloat(value[0]);
      circleBg = value[1] || defaultBg;
    } else {
      numVal   = parseFloat(value);
    }
  }

  const displayText = isOffline
    ? '—'
    : isNaN(numVal) ? '?' : numVal.toFixed(1);

  const autoFontSize = fontSize || Math.round(radius * 0.42);
  const unitFontSize = Math.round(autoFontSize * 0.48);

  // ── SVG geometry ─────────────────────────────────────────────────────────
  // SVG viewport: square, side = 2*radius + stroke allowance
  const stroke  = 2.5;
  const size    = radius * 2 + stroke * 2;
  const cx      = size / 2;
  const cy      = size / 2;

  // Label + unit sit below the circle, outside the SVG
  const borderColor = isOffline ? '#2a3a4a' : '#3a5a7a';
  const glowColor   = isOffline ? 'none'    : circleBg;

  return (
    <div className="dr-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="dr-svg"
        style={{ filter: isOffline ? 'none' : `drop-shadow(0 0 ${radius * 0.18}px ${glowColor})` }}
      >
        {/* Circle fill */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill={isOffline ? '#111a22' : circleBg}
          stroke={borderColor}
          strokeWidth={stroke}
          style={{ transition: 'fill 0.5s, stroke 0.4s' }}
        />

        {/* Subtle inner highlight arc at top */}
        <ellipse
          cx={cx} cy={cy - radius * 0.38}
          rx={radius * 0.55} ry={radius * 0.22}
          fill="rgba(255,255,255,0.06)"
        />

        {/* Numeric value */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="dr-value"
          style={{
            fontSize:   autoFontSize,
            fill:       isOffline ? '#445566' : '#e8f4ff',
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 'bold',
            letterSpacing: '0.04em',
          }}
        >
          {displayText}
        </text>
      </svg>

      {/* Label and unit outside the circle */}
      <div className="dr-meta">
        <span className="dr-label">{label}</span>
        {unit && <span className="dr-unit">{unit}</span>}
      </div>
    </div>
  );
}
