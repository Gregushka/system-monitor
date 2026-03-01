/**
 * indicatorDefinitions.js
 * ═══════════════════════
 * Edit this file to add, move, or remove indicators on any background.
 *
 * Rules:
 *  • ind_id   must match the "name" field returned by /sensor and /read_data
 *  • bg_id    must match one of the background keys defined in BACKGROUNDS (App.js)
 *  • top/left are in the range 0–2000  (0 = top/left edge, 2000 = bottom/right edge)
 *
 * Import the *Create helpers you need; unused ones can be omitted.
 */

import {
  DigitalIndicatorCreate,
  OnOffIndicatorCreate,
  PumpIndicatorCreate,
  GasBurnerIndicatorCreate,
  GasFlapIndicatorCreate,
  TempIndicatorCreate,
} from './indicatorRegistry';

// ─── Diagram 1 ────────────────────────────────────────────────────────────────

DigitalIndicatorCreate({
  ind_id:   'di-temp',
  bg_id:    'diagram1',
  label:    'Boiler Temp',
  unit:     '°C',
  top:      220,
  left:     120,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'di-pressure',
  bg_id:    'diagram1',
  label:    'Boiler P',
  unit:     'bar',
  top:      220,
  left:     500,
  fontSize: 26,
  color:    '#00ffff',
});

PumpIndicatorCreate({
  ind_id: 'pump-main',
  bg_id:  'diagram1',
  label:  'PumpOne',
  top:    550,
  left:   200,
  size:   90,
});

PumpIndicatorCreate({
  ind_id: 'pump-feed',
  bg_id:  'diagram1',
  label:  'PumpTwo',
  top:    550,
  left:   600,
  size:   90,
});

GasBurnerIndicatorCreate({
  ind_id: 'burner-main',
  bg_id:  'diagram1',
  label:  'Main Burner',
  top:    400,
  left:   900,
  size:   80,
});

GasFlapIndicatorCreate({
  ind_id:        'flap-exhaust',
  bg_id:         'diagram1',
  label:         'Exhaust Flap',
  top:           700,
  left:          900,
  size:          80,
  labelChimney:  'CHIMNEY',
  labelBypass:   'BYPASS',
});

// ─── Diagram 2 ────────────────────────────────────────────────────────────────

DigitalIndicatorCreate({
  ind_id:   'di-flow',
  bg_id:    'diagram2',
  label:    'Flow Rate',
  unit:     'm³/h',
  top:      180,
  left:     700,
  fontSize: 24,
});

OnOffIndicatorCreate({
  ind_id: 'valve-main',
  bg_id:  'diagram2',
  label:  'Main Valve',
  top:    450,
  left:   300,
  radius: 32,
  color:  '#00ff41',
});

TempIndicatorCreate({
  ind_id: 'temp-flue',
  bg_id:  'diagram2',
  label:  'Flue Temp',
  top:    450,
  left:   700,
  size:   72,
});

TempIndicatorCreate({
  ind_id: 'temp-ambient',
  bg_id:  'diagram2',
  label:  'Ambient',
  top:    700,
  left:   700,
  size:   72,
});

GasBurnerIndicatorCreate({
  ind_id: 'burner-pilot',
  bg_id:  'diagram2',
  label:  'Pilot Burner',
  top:    700,
  left:   300,
  size:   72,
});
