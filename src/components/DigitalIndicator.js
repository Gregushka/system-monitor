import React from 'react';
import './css/DigitalIndicator.css';

/**
 * DigitalIndicator
 *
 * Registry config fields:
 *   ind_id   {string}  – sensor id
 *   bg_id    {string}  – background id
 *   label    {string}  – text label above the readout
 *   unit     {string}  – engineering unit string, e.g. "°C"
 *   top      {number}  – 0–2000 vertical position
 *   left     {number}  – 0–2000 horizontal position
 *   fontSize {number}  – value font size in px (default 22)
 *   color    {string}  – explicit value colour; if omitted, threshold colouring applies
 *
 * Props (from BackgroundView):
 *   config  {object}  – registry config
 *   value   {number|null}  – current value from API; null → "OFFLINE"
 */
export default function DigitalIndicator({ config, value }) {
  const { label = '', unit = '', fontSize = 22, color } = config;

  const isOffline = value === null || value === undefined;
  const numVal    = isOffline ? null : parseFloat(value);

  // Default threshold colouring (override with config.color)
  let valueColor = color || '#00e676';
  if (!color && !isOffline) {
    if (numVal > 90 || numVal < 5) valueColor = '#ff1744';
    else if (numVal > 75 || numVal < 15) valueColor = '#ffab00';
  }

  const displayText = isOffline
    ? 'OFFLINE'
    : isNaN(numVal) ? String(value) : numVal.toFixed(1);

  return (
    <div className="di-wrap">
      <div className="di-label">{label}</div>
      <div className="di-display">
        <span
          className={`di-value${isOffline ? ' di-value--offline' : ''}`}
          style={{ fontSize, color: isOffline ? '#445566' : valueColor }}
        >
          {displayText}
        </span>
        {!isOffline && <span className="di-unit">{unit}</span>}
      </div>
    </div>
  );
}
