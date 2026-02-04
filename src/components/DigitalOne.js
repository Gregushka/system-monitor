// src/components/DigitalOne.js
import React from 'react';
import './DigitalOne.css';

const DigitalOne = ({ 
  top, 
  left, 
  label, 
  value, 
  unit, 
  on, 
  // 1. New Props with defaults
  fontSize = 30, 
  color = '#00ff00' 
}) => {
  
  if (on !== true) return null;

  const positionStyle = {
    top: `${top / 10}%`,
    left: `${left / 10}%`,
    // We pass the dynamic properties as CSS variables.
    // This allows DigitalOne.css to calculate sizes based on these values.
    '--d1-size': `${fontSize}px`,
    '--d1-color': color,
  };

  const isAvailable = value !== null && value !== undefined;
  const displayValue = isAvailable ? value : "N/A";

  return (
    <div className="d1-wrapper" style={positionStyle}>
      
      {/* Label: Above the box */}
      <div className="d1-label">{label}</div>

      <div className="d1-row">
        {/* Box: Only digits inside. Size is calculated by font-size + padding */}
        <div className={`d1-box ${!isAvailable ? 'd1-na' : ''}`}>
          {displayValue}
        </div>

        {/* Unit: To the right */}
        {isAvailable && <span className="d1-unit">{unit}</span>}
      </div>

    </div>
  );
};

export default DigitalOne;