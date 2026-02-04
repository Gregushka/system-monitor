import React from 'react';
import './OnOff.css';

const OnOff = ({ top, left, color = 'white', on }) => {
  
  // Visibility Check
  if (on !== true) return null;

  const positionStyle = {
    top: `${top / 10}%`,
    left: `${left / 10}%`
  };

  const colorClass = `light-${color}`;

  return (
    <div 
      className={`onoff-indicator ${colorClass}`} 
      style={positionStyle}
    >
      <div className="onoff-glare"></div>
    </div>
  );
};

export default OnOff;