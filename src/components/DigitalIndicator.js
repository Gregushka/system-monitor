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

  // Threshold class — CSS handles the actual colours (green default, amber low, red high)
  // Override entirely if config.color is set (inline style wins over class)
  let thresholdClass = '';
  if (!isOffline && !color) {
    if (numVal > 90 || numVal < 5) thresholdClass = 'di-value--high';
    else if (numVal > 75 || numVal < 15) thresholdClass = 'di-value--low';
  }

  const displayText = isOffline
    ? 'OFFLINE'
    : isNaN(numVal) ? String(value) : numVal.toFixed(1);

  return (
    <div className="di-wrap">
      <div className="di-label">{label}</div>
      <div className="di-display">
        <span
          className={`di-value${isOffline ? ' di-value--offline' : ''}${thresholdClass ? ' ' + thresholdClass : ''}`}
          style={{ fontSize, ...(color && !isOffline ? { color, textShadow: `0 0 6px ${color}88` } : {}) }}
        >
          {displayText}
        </span>
        {!isOffline && <span className="di-unit">{unit}</span>}
      </div>
    </div>
  );
}
