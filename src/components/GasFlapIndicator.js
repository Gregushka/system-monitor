import React from 'react';
import './css/GasFlapIndicator.css';

/**
 * GasFlapIndicator  –  2-position flap / damper valve
 *
 * Registry config fields:
 *   ind_id        {string}
 *   bg_id         {string}
 *   label         {string}  overall label (e.g. "Exhaust Flap")
 *   top           {number}  0–2000
 *   left          {number}  0–2000
 *   size          {number}  overall size px (default 72)
 *   labelChimney  {string}  mode label when chimney position (default "CHIMNEY")
 *   labelBypass   {string}  mode label when bypass position  (default "BYPASS")
 *
 * Value / mode mapping:
 *   0 | "chimney"  →  flap open to chimney  (blade vertical)
 *   1 | "bypass"   →  flap open to bypass   (blade horizontal)
 *   null           →  OFFLINE
 */

function resolveMode(value) {
  if (value === null || value === undefined) return 'offline';
  if (value === 0 || value === 'chimney') return 'chimney';
  if (value === 1 || value === 'bypass')  return 'bypass';
  return 'offline';
}

export default function GasFlapIndicator({ config, value }) {
  const {
    label        = 'Flap',
    size         = 72,
    labelChimney = 'CHIMNEY',
    labelBypass  = 'BYPASS',
  } = config;

  const mode = resolveMode(value);
  const cx   = size / 2, cy = size / 2;
  const r    = size * 0.4;

  // ── Duct body (two parallel lines forming a duct) ──
  const ductW = r * 1.8;
  const ductH = r * 0.55;

  // ── Blade position ──
  // Chimney: blade stands vertically in the duct (flow goes up the chimney)
  // Bypass:  blade lies horizontally (duct open, bypassing chimney)
  const bladeLen  = r * 0.9;
  const bladeW    = r * 0.1;
  const bladeAngle = mode === 'bypass' ? 0 : 90;

  const modeColor = {
    chimney: '#00b4d8',
    bypass:  '#ffab00',
    offline: '#445566',
  }[mode];

  const modeText = {
    chimney: labelChimney,
    bypass:  labelBypass,
    offline: 'OFFLINE',
  }[mode];

  // Blade as a rotated rect centred at cx, cy
  // CSS transform approach for clean animation
  const bladeStyle = {
    transformOrigin: `${cx}px ${cy}px`,
    transform: `rotate(${bladeAngle}deg)`,
    transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
  };

  return (
    <div className="flap-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Duct outline */}
        <rect
          x={cx - ductW / 2} y={cy - ductH / 2}
          width={ductW} height={ductH}
          rx="3"
          fill="#0d1820" stroke="#2e5580" strokeWidth="1.5"
        />

        {/* Flow arrows (faint) */}
        <g stroke="#1e3248" strokeWidth="1" fill="none" strokeLinecap="round">
          <polyline points={`${cx - ductW * 0.35},${cy} ${cx + ductW * 0.35},${cy}`} />
          <polyline points={`${cx + ductW * 0.22},${cy - 5} ${cx + ductW * 0.35},${cy} ${cx + ductW * 0.22},${cy + 5}`} />
        </g>

        {/* Actuator stem (top centre) */}
        <line
          x1={cx} y1={cy - ductH / 2}
          x2={cx} y2={cy - ductH / 2 - r * 0.5}
          stroke="#2e5580" strokeWidth="2"
        />
        <rect
          x={cx - r * 0.22} y={cy - ductH / 2 - r * 0.85}
          width={r * 0.44} height={r * 0.38}
          rx="2"
          fill="#0d1820" stroke={modeColor} strokeWidth="1.5"
        />

        {/* Blade */}
        <rect
          x={cx - bladeLen / 2} y={cy - bladeW / 2}
          width={bladeLen} height={bladeW}
          rx="1"
          fill={modeColor}
          style={bladeStyle}
          opacity={mode === 'offline' ? 0.3 : 0.9}
        />

        {/* Pivot */}
        <circle cx={cx} cy={cy} r={bladeW * 0.8} fill="#ccc" />

        {/* Offline X */}
        {mode === 'offline' && (
          <g stroke="#445566" strokeWidth="1.5" strokeLinecap="round">
            <line x1={cx-12} y1={cy-12} x2={cx+12} y2={cy+12} />
            <line x1={cx+12} y1={cy-12} x2={cx-12} y2={cy+12} />
          </g>
        )}
      </svg>

      <div className="flap-label">{label}</div>
      <div className="flap-mode" style={{ color: modeColor }}>{modeText}</div>
    </div>
  );
}
