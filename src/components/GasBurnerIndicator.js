import React from 'react';
import './css/GasBurnerIndicator.css';

/**
 * GasBurnerIndicator  –  gas burner symbol with 6 operating modes
 *
 * Registry config fields:
 *   ind_id  {string}
 *   bg_id   {string}
 *   label   {string}
 *   top     {number}  0–2000
 *   left    {number}  0–2000
 *   size    {number}  overall size in px (default 72)
 *
 * Value / mode mapping:
 *   0 | "off"       – Off            dark burner body, no flame
 *   1 | "on"        – On / normal    orange flame, running
 *   2 | "alarm"     – Alarm/Failure  red pulsing, ⚠ overlay
 *   3 | "nodata"    – No data        grey, question mark
 *   4 | "fullpower" – Full power     tall bright yellow/white flame
 *   5 | "minpower"  – Min power      small blue flame
 *   null            – OFFLINE        same as nodata style
 */

function resolveMode(value) {
  if (value === null || value === undefined) return 'nodata';
  const map = {
    0: 'off', off: 'off',
    1: 'on',  on: 'on',
    2: 'alarm', alarm: 'alarm',
    3: 'nodata', nodata: 'nodata',
    4: 'fullpower', fullpower: 'fullpower',
    5: 'minpower', minpower: 'minpower',
  };
  return map[value] ?? 'nodata';
}

// Flame SVG paths (relative to burner centre)
function FlameShape({ cx, cy, r, mode }) {
  if (mode === 'off' || mode === 'nodata') return null;

  const configs = {
    on:        { h: r * 1.2, w: r * 0.55, color1: '#ff6d00', color2: '#ff9100', id: 'fl-on' },
    fullpower: { h: r * 1.9, w: r * 0.72, color1: '#ffe000', color2: '#fff176', id: 'fl-fp' },
    minpower:  { h: r * 0.65, w: r * 0.38, color1: '#1565c0', color2: '#42a5f5', id: 'fl-mp' },
    alarm:     { h: r * 1.0, w: r * 0.5,  color1: '#d50000', color2: '#ff5252', id: 'fl-al' },
  };
  const c = configs[mode] || configs.on;

  const bx = cx, by = cy - r * 0.75;
  const pts = `
    ${bx},${by - c.h}
    ${bx - c.w * 0.5},${by - c.h * 0.4}
    ${bx - c.w * 0.3},${by}
    ${bx + c.w * 0.3},${by}
    ${bx + c.w * 0.5},${by - c.h * 0.4}
  `;

  return (
    <>
      <defs>
        <linearGradient id={c.id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={c.color2} />
          <stop offset="100%" stopColor={c.color1} />
        </linearGradient>
      </defs>
      <polygon
        points={pts}
        fill={`url(#${c.id})`}
        opacity="0.9"
        style={{ filter: `drop-shadow(0 0 ${mode === 'fullpower' ? 10 : 6}px ${c.color1})` }}
      />
    </>
  );
}

export default function GasBurnerIndicator({ config, value }) {
  const { label = 'Burner', size = 72 } = config;
  const mode = resolveMode(value);
  const cx = size / 2, cy = size / 2;
  const r  = size * 0.32;

  const bodyColors = {
    off:       { fill: '#1e2a36', stroke: '#2e3e4e' },
    on:        { fill: '#1a2a1a', stroke: '#2e6e3e' },
    alarm:     { fill: '#3a0808', stroke: '#cc2222' },
    nodata:    { fill: '#1a1a1a', stroke: '#333333' },
    fullpower: { fill: '#2a1a00', stroke: '#cc7700' },
    minpower:  { fill: '#0a0a2a', stroke: '#2244aa' },
  };
  const bc = bodyColors[mode] || bodyColors.nodata;

  const modeLabels = {
    off:       'OFF',
    on:        'ON',
    alarm:     'ALARM',
    nodata:    'NO DATA',
    fullpower: 'FULL PWR',
    minpower:  'MIN PWR',
  };
  const modeColors = {
    off:       '#445566',
    on:        '#00e676',
    alarm:     '#ff1744',
    nodata:    '#445566',
    fullpower: '#ffab00',
    minpower:  '#42a5f5',
  };

  // Burner body: a trapezoid at bottom of the SVG
  const bTop  = cy + r * 0.2;
  const bBot  = cy + r * 1.7;
  const bTopW = r * 0.7;
  const bBotW = r * 0.9;
  const burnerPts = `
    ${cx - bTopW},${bTop}
    ${cx + bTopW},${bTop}
    ${cx + bBotW},${bBot}
    ${cx - bBotW},${bBot}
  `;

  // Nozzle circle
  const nozzleR = r * 0.22;

  return (
    <div className={`burner-wrap${mode === 'alarm' ? ' burner-alarm' : ''}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Flame */}
        <FlameShape cx={cx} cy={cy} r={r} mode={mode} />

        {/* Body */}
        <polygon points={burnerPts} fill={bc.fill} stroke={bc.stroke} strokeWidth="1.5" />

        {/* Nozzle circle */}
        <circle cx={cx} cy={bTop} r={nozzleR} fill={bc.fill} stroke={bc.stroke} strokeWidth="1.5" />

        {/* Overlay icons */}
        {mode === 'alarm' && (
          <text x={cx} y={bTop - r * 0.1} textAnchor="middle" dominantBaseline="middle"
            fontSize={r * 0.9} fill="#ff5252" style={{ pointerEvents: 'none' }}>
            !
          </text>
        )}
        {mode === 'nodata' && (
          <text x={cx} y={bTop - r * 0.1} textAnchor="middle" dominantBaseline="middle"
            fontSize={r * 0.85} fill="#556677" style={{ pointerEvents: 'none' }}>
            ?
          </text>
        )}
      </svg>

      <div className="burner-label">{label}</div>
      <div className="burner-mode" style={{ color: modeColors[mode] }}>
        {modeLabels[mode]}
      </div>
    </div>
  );
}
