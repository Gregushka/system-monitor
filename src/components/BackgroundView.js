import React, { useState, useEffect, useRef } from 'react';
import './css/BackgroundView.css';

import { getIndicatorsForBg } from '../indicatorRegistry';
import DigitalIndicator   from './DigitalIndicator';
import DigitalRound       from './DigitalRound';
import OnOffIndicator     from './OnOffIndicator';
import PumpIndicator      from './PumpIndicator';
import GasBurnerIndicator from './GasBurnerIndicator';
import GasFlapIndicator   from './GasFlapIndicator';
import TempIndicator      from './TempIndicator';

const VIRTUAL_W = 2560;
const VIRTUAL_H = 1440;

const INDICATOR_MAP = {
  DigitalIndicator, DigitalRound, OnOffIndicator,
  PumpIndicator, GasBurnerIndicator, GasFlapIndicator, TempIndicator,
};

export default function BackgroundView({ background, values, hasPolled, positionOverrides = {} }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale({ x: el.clientWidth / VIRTUAL_W, y: el.clientHeight / VIRTUAL_H });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const indicators = getIndicatorsForBg(background.id);

  const bgStyle = {
    backgroundImage:    background.backgroundImage ? `url(${background.backgroundImage})` : 'none',
    backgroundColor:    background.backgroundColor || '#0d0d0d',
    backgroundSize:     '100% 100%',
    backgroundPosition: 'top left',
    backgroundRepeat:   'no-repeat',
  };

  return (
    <div className="bgview-root" ref={containerRef} style={bgStyle}>
      {indicators.map((cfg) => {
        const Component = INDICATOR_MAP[cfg._type];
        if (!Component) return null;
        const dataKey = cfg.data_id || cfg.ind_id;
        if (hasPolled && !(dataKey in values)) return null;
        const value = dataKey in values ? values[dataKey] : null;
        const override = positionOverrides[cfg.ind_id];
        const top  = override?.top  ?? cfg.top  ?? 0;
        const left = override?.left ?? cfg.left ?? 0;
        const posStyle = {
          position: 'absolute',
          left:     Math.round(left * scale.x) + 'px',
          top:      Math.round(top  * scale.y) + 'px',
          transform: 'translate(-50%, -50%)',
        };
        return (
          <div key={cfg._key} style={posStyle}>
            <Component config={cfg} value={value} />
          </div>
        );
      })}
    </div>
  );
}
