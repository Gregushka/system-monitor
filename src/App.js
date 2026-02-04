import React, { useState, useEffect } from 'react';
import './App.css'; 
import diagram from './diagram.png'; 
import DigitalOne from './components/DigitalOne';
import OnOff from './components/OnOff';

const App = () => {
  // ---------------------------------------------------------
  // CONFIGURATION
  // Note: Coordinates are now 0-1000 (0.0% to 100.0%)
  // "on: true" is required for the item to show up.
  // ---------------------------------------------------------
  
// src/App.js (partial update)

const digitalConfig = [
  // volt1: Standard green, size 30px
  { id: 'volt1',  on: false,  label: 'Main Voltage', unit: 'V',   top: 150, left: 100, fontSize: 30, color: '#00ff00' },
  
  // press1: Smaller (20px), Cyan color
  { id: 'press1', on: true,  label: 'Boiler P',     unit: 'bar', top: 455, left: 655, fontSize: 30, color: '#00ffff' },
  
  // temp1: Large (40px), Orange color (As seen in your image snippet)
  { id: 'temp1',  on: true,  label: 'Core Temp',    unit: '°C',  top: 455, left: 720, fontSize: 30, color: '#ffaa00' },
  
  // curr1: Standard
  { id: 'curr1',  on: true,  label: 'Valve',    unit: '%',   top: 300, left: 600, fontSize: 30, color: '#00ff00' },
];

  const onOffConfig = [
    { id: 'status1', on: true, top: 151, left: 448 }, 
    { id: 'pressureSW',  on: true, top: 131, left: 399 }, 
  ];

  const [sensorData, setSensorData] = useState({});

  const updateValues = async () => {
    try {
      // Mock data
      const mockData = {
        volt1:  (230 + Math.random() * 5).toFixed(1),
        press1: (Math.random() > 0.1) ? (3 + Math.random()).toFixed(2) : null,
        temp1:  (60 + Math.random() * 2).toFixed(1),
        curr1:  (Math.random() * 100).toFixed(1),
        status1: (Math.random() > 0.5) ? 'green' : ((Math.random() > 0.8) ? 'red' : 'white'),
        pressureSW:  Math.random() > 0.2 ? 'green' : 'red',
      };
      setSensorData(mockData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    updateValues(); 
    const interval = setInterval(updateValues, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <div className="diagram-wrapper">
        <img src={diagram} alt="System Diagram" className="diagram-image" />

        {digitalConfig.map((conf) => (
          <DigitalOne
            key={conf.id}
            {...conf} // Passes top, left, label, unit, on
            value={sensorData[conf.id]}
          />
        ))}

        {onOffConfig.map((conf) => (
          <OnOff
            key={conf.id}
            {...conf}
            color={sensorData[conf.id] || 'white'}
          />
        ))}

      </div>
    </div>
  );
};

export default App;