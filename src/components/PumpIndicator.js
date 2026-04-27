import React from 'react';
import './css/PumpIndicator.css';

/**
 * PumpIndicator  –  P&ID centrifugal pump symbol
 *
 * Registry config fields:
 *   ind_id     {string}
 *   bg_id      {string}
 *   label      {string}
 *   top        {number}  0–2000
 *   left       {number}  0–2000
 *   size       {number}  SVG diameter px (default 80)
 *   direction  {number}  Rotation in degrees: 0/360/null = up (default), 90 = right, 180 = down, 270 = left
 *
 * Value from API:
 *   "grey"  / 0  →  offline / stopped
 *   "green" / 1  →  running OK
 *   "red"   / 2  →  fault / alarm
 *   null         →  OFFLINE (same as grey + label)
 */
const STATES = {
  grey:    { fill: '#2a3a4a', border: '#3a4a5a', glow: 'none',                        label: 'STOPPED'  },
  green:   { fill: '#0a3a1a', border: '#00e676', glow: '0 0 14px #00e67666',           label: 'RUNNING'  },
  red:     { fill: '#3a0a0a', border: '#ff1744', glow: '0 0 14px #ff174466',           label: 'FAULT'    },
  offline: { fill: '#131f2a', border: '#1e2a36', glow: 'none',                        label: 'OFFLINE'  },
};

function resolveState(value) {
  if (value === null || value === undefined) return 'offline';
  // Explicit string states
  if (value === 'grey'  || value === 'stopped') return 'grey';
  if (value === 'green' || value === 'running') return 'green';
  if (value === 'red'   || value === 'fault')   return 'red';
  // Numeric convention from this API:
  //   0        → stopped (grey)
  //   positive → running (green)
  //   negative → fault/alarm (red)
  const n = Number(value);
  if (!isNaN(n)) {
    if (n > 0)  return 'green';
    if (n < 0)  return 'red';
    return 'grey';
  }
  return 'grey';
}

export default function PumpIndicator({ config, value }) {
  const { label = 'Pump', size = 80, direction = 0 } = config;
  const stateName = resolveState(value);
  const s   = STATES[stateName];
  const cx  = size / 2;
  const cy  = size / 2;
  const r   = size / 2 - 3;

  // Triangle
  const th = r * 0.62, tw = r * 0.72;
  const ty = cy - th * 0.44, by = ty + th;
  const tl = cx - tw / 2, tr2 = cx + tw / 2;

  const dotR    = size * 0.063;
  const rotateDeg = direction == null ? 0 : direction;

  return (
    <div className="pump-wrap">
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: s.glow !== 'none' ? `drop-shadow(${s.glow})` : 'none', transition: 'filter 0.4s' }}
      >
        <g transform={`rotate(${rotateDeg}, ${cx}, ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill={s.fill} stroke={s.border} strokeWidth="2.5" style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
          <polygon points={`${cx},${ty} ${tl},${by} ${tr2},${by}`} fill="#000" opacity="0.5" />
          {/* Connection dots */}
          <circle cx={cx} cy={3}        r={dotR} fill="#ff2222" stroke="#111" strokeWidth="1" />
          <circle cx={cx} cy={size - 3} r={dotR} fill="#ff2222" stroke="#111" strokeWidth="1" />
          {/* Offline X */}
          {stateName === 'offline' && (
            <g stroke="#445566" strokeWidth="2" strokeLinecap="round">
              <line x1={cx - r*0.35} y1={cy - r*0.35} x2={cx + r*0.35} y2={cy + r*0.35} />
              <line x1={cx + r*0.35} y1={cy - r*0.35} x2={cx - r*0.35} y2={cy + r*0.35} />
            </g>
          )}
        </g>
      </svg>
      <div className="pump-label">{label}</div>
      <div className={`pump-state pump-state--${stateName}`}>{s.label}</div>
    </div>
  );
}
