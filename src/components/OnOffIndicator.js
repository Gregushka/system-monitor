import React from 'react';
import './css/OnOffIndicator.css';

/**
 * OnOffIndicator  –  a glowing bulb
 *
 * Registry config fields:
 *   ind_id  {string}
 *   bg_id   {string}
 *   label   {string}
 *   top     {number}  0–2000
 *   left    {number}  0–2000
 *   radius  {number}  circle radius in px (default 28)
 *   color   {string}  "on" colour (default "#00ff41")
 *
 * Value from API:
 *   0 / false / "off" / "0"  →  off (dark grey)
 *   any other truthy          →  on  (config.color)
 *   null                      →  OFFLINE
 */
export default function OnOffIndicator({ config, value }) {
  const { label = '', radius = 28, color = '#00e676' } = config;

  const isOffline = value === null || value === undefined;
  const numVal    = Number(value);
  // Any non-zero number = ON; zero = OFF; explicit string aliases supported
  const isOn = !isOffline && value !== 0 && value !== false &&
               value !== 'off' && value !== '0' &&
               !(typeof value === 'number' && value === 0) &&
               !(typeof value === 'string' && Number(value) === 0);

  const size = radius * 2;

  let fillColor = '#1e2a36';
  let glowColor = 'none';
  let borderColor = '#2a3a4a';

  if (isOffline) {
    fillColor   = '#131f2a';
    borderColor = '#1e2a36';
  } else if (isOn) {
    fillColor   = color;
    glowColor   = `0 0 ${radius * 0.8}px ${color}88, 0 0 ${radius * 0.3}px ${color}`;
    borderColor = color;
  }

  return (
    <div className="onoff-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle
          cx={radius} cy={radius} r={radius - 2}
          fill={fillColor}
          stroke={borderColor}
          strokeWidth="2"
          style={{ filter: glowColor !== 'none' ? `drop-shadow(0 0 ${radius * 0.4}px ${color})` : 'none', transition: 'fill 0.4s, filter 0.4s' }}
        />
        {/* Highlight */}
        <ellipse
          cx={radius * 0.72} cy={radius * 0.68}
          rx={radius * 0.3} ry={radius * 0.2}
          fill="rgba(255,255,255,0.18)"
          style={{ pointerEvents: 'none' }}
        />
        {/* Centre dot */}
        <circle
          cx={radius} cy={radius} r={radius * 0.15}
          fill={isOffline ? '#2a3a4a' : isOn ? 'rgba(255,255,255,0.8)' : '#2a3a4a'}
          style={{ transition: 'fill 0.3s' }}
        />
        {/* OFFLINE cross */}
        {isOffline && (
          <g stroke="#445566" strokeWidth="1.5" strokeLinecap="round">
            <line x1={radius * 0.65} y1={radius * 0.65} x2={radius * 1.35} y2={radius * 1.35} />
            <line x1={radius * 1.35} y1={radius * 0.65} x2={radius * 0.65} y2={radius * 1.35} />
          </g>
        )}
      </svg>
      <div className="onoff-label">{label}</div>
      <div className={`onoff-state${isOffline ? ' onoff-state--offline' : isOn ? ' onoff-state--on' : ' onoff-state--off'}`}>
        {isOffline ? 'OFFLINE' : isOn ? 'ON' : 'OFF'}
      </div>
    </div>
  );
}
