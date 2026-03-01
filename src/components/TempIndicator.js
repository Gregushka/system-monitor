import React from 'react';
import './css/TempIndicator.css';

/**
 * TempIndicator  –  temperature state with no numeric value
 *
 * Registry config fields:
 *   ind_id  {string}
 *   bg_id   {string}
 *   label   {string}
 *   top     {number}  0–2000
 *   left    {number}  0–2000
 *   size    {number}  overall size px (default 68)
 *
 * Value / mode mapping:
 *   0 | "off"    – System/sensor off     (grey ring, dash)
 *   1 | "normal" – Temperature normal    (green ring, ✓)
 *   2 | "high"   – Temperature high      (red ring, ↑)
 *   3 | "low"    – Temperature low       (blue ring, ↓)
 *   4 | "nodata" – No data               (grey, ?)
 *   null         – OFFLINE               (same as nodata)
 */

const MODES = {
  off:    { ring: '#445566', fill: '#0d1820', icon: '─', iconColor: '#445566', text: 'OFF'    },
  normal: { ring: '#00e676', fill: '#0a2a14', icon: '✓', iconColor: '#00e676', text: 'NORMAL' },
  high:   { ring: '#ff1744', fill: '#2a0a0a', icon: '↑', iconColor: '#ff5252', text: 'HI TEMP'},
  low:    { ring: '#2979ff', fill: '#0a0a2a', icon: '↓', iconColor: '#5592ff', text: 'LO TEMP'},
  nodata: { ring: '#2a3a4a', fill: '#0d1820', icon: '?', iconColor: '#445566', text: 'NO DATA'},
};

function resolveMode(value) {
  if (value === null || value === undefined) return 'nodata';
  const map = {
    0: 'off',    off: 'off',
    1: 'normal', normal: 'normal',
    2: 'high',   high: 'high',
    3: 'low',    low: 'low',
    4: 'nodata', nodata: 'nodata',
  };
  return map[value] ?? 'nodata';
}

export default function TempIndicator({ config, value }) {
  const { label = 'Temp', size = 68 } = config;
  const mode = resolveMode(value);
  const m    = MODES[mode];
  const cx   = size / 2, cy = size / 2;
  const outerR = size / 2 - 3;
  const innerR = outerR - 6;
  const iconSize = innerR * 1.1;

  const glowFilter = mode !== 'off' && mode !== 'nodata'
    ? `drop-shadow(0 0 8px ${m.ring}88)`
    : 'none';

  // Thermometer bulb as subtle decoration
  const bulbCX = cx, bulbCY = cy + innerR * 0.1;
  const stemH  = innerR * 0.45;
  const stemW  = innerR * 0.12;
  const bulbR  = innerR * 0.22;

  return (
    <div className="temp-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle
          cx={cx} cy={cy} r={outerR}
          fill={m.fill} stroke={m.ring} strokeWidth="3"
          style={{ filter: glowFilter, transition: 'fill 0.4s, stroke 0.4s, filter 0.4s' }}
        />
        {/* Inner tick ring segments */}
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1  = cx + Math.cos(rad) * (outerR - 8);
          const y1  = cy + Math.sin(rad) * (outerR - 8);
          const x2  = cx + Math.cos(rad) * (outerR - 4);
          const y2  = cy + Math.sin(rad) * (outerR - 4);
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={m.ring} strokeWidth="1.5" opacity="0.5" />;
        })}

        {/* Thermometer icon */}
        <g opacity={mode === 'off' || mode === 'nodata' ? 0.3 : 0.7}>
          {/* Stem */}
          <rect
            x={bulbCX - stemW / 2} y={bulbCY - stemH - bulbR}
            width={stemW} height={stemH + bulbR}
            rx={stemW / 2}
            fill={m.ring}
          />
          {/* Bulb */}
          <circle cx={bulbCX} cy={bulbCY + bulbR * 0.3} r={bulbR} fill={m.ring} />
        </g>

        {/* Arrow / icon overlay */}
        <text
          x={cx - innerR * 0.48}
          y={cy + innerR * 0.05}
          fontSize={iconSize}
          fill={m.iconColor}
          fontFamily="monospace"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontWeight: 'bold', pointerEvents: 'none' }}
        >
          {m.icon}
        </text>
      </svg>

      <div className="temp-label">{label}</div>
      <div className="temp-mode" style={{ color: m.ring }}>{m.text}</div>
    </div>
  );
}
