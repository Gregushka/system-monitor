import React from 'react';
import './css/BackgroundView.css';

import { getIndicatorsForBg } from '../indicatorRegistry';
import DigitalIndicator   from './DigitalIndicator';
import OnOffIndicator     from './OnOffIndicator';
import PumpIndicator      from './PumpIndicator';
import GasBurnerIndicator from './GasBurnerIndicator';
import GasFlapIndicator   from './GasFlapIndicator';
import TempIndicator      from './TempIndicator';

/**
 * BackgroundView
 * Props:
 *   background { id, label, backgroundImage, backgroundColor }
 *   values     { [ind_id]: value }  – live sensor values from polling
 *
 * Coordinate system:
 *   top / left in the registry are 0–2000.
 *   Mapped to CSS: 0% – 100% via (x / 2000) * 100 + '%'
 */
function toPercent(v) { return `${(v / 2000) * 100}%`; }

const INDICATOR_MAP = {
  DigitalIndicator:   DigitalIndicator,
  OnOffIndicator:     OnOffIndicator,
  PumpIndicator:      PumpIndicator,
  GasBurnerIndicator: GasBurnerIndicator,
  GasFlapIndicator:   GasFlapIndicator,
  TempIndicator:      TempIndicator,
};

export default function BackgroundView({ background, values }) {
  const indicators = getIndicatorsForBg(background.id);

  const bgStyle = {
    backgroundImage:    background.backgroundImage ? `url(${background.backgroundImage})` : 'none',
    backgroundColor:    background.backgroundColor || '#0d1820',
    backgroundSize:     'cover',
    backgroundPosition: 'center',
    backgroundRepeat:   'no-repeat',
  };

  return (
    <div className="bgview-root" style={bgStyle}>
      {indicators.map((cfg) => {
        const Component = INDICATOR_MAP[cfg._type];
        if (!Component) return null;

        // ind_id NOT in received values → hide entirely
        // ind_id in values but value === null → pass null (component shows OFFLINE)
        if (!(cfg.ind_id in values)) return null;

        const posStyle = {
          position: 'absolute',
          top:  toPercent(cfg.top  ?? 0),
          left: toPercent(cfg.left ?? 0),
          transform: 'translate(-50%, -50%)',
        };

        return (
          <div key={cfg.ind_id} style={posStyle}>
            <Component config={cfg} value={values[cfg.ind_id]} />
          </div>
        );
      })}
    </div>
  );
}
