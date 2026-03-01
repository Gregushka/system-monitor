import React from 'react';
import './css/RoundStatusIndicator.css';

/**
 * RoundStatusIndicator
 *
 * Props:
 *   status  {number}   0 = OK (green), 1 = warning (yellow), 2 = alarm (red)
 *   text    {string}   status text shown below
 *   size    {number}   lamp diameter px (default 52)
 */
const STATUS = [
  { color: '#00e676', glow: '0 0 18px #00e67688, 0 0 4px #00e676', label: 'OK'      },
  { color: '#ffab00', glow: '0 0 18px #ffab0088, 0 0 4px #ffab00', label: 'WARNING' },
  { color: '#ff1744', glow: '0 0 18px #ff174488, 0 0 4px #ff1744', label: 'ALARM'   },
];

export default function RoundStatusIndicator({ status = 0, text, size = 52 }) {
  const s = STATUS[Math.min(status, 2)] || STATUS[0];

  return (
    <div className="rsi-wrap">
      <div
        className="rsi-lamp"
        style={{
          width:     size,
          height:    size,
          background: s.color,
          boxShadow:  s.glow,
        }}
      />
      <div className="rsi-label">{text || s.label}</div>
    </div>
  );
}
