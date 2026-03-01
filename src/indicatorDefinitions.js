/**
 * indicatorDefinitions.js
 * ═══════════════════════
 * Edit this file to add, move, or remove indicators on any background.
 *
 * Rules:
 *  • ind_id   MUST exactly match the "name" field returned by /read_data
 *  • bg_id    must match one of the background keys in BACKGROUNDS (App.js)
 *  • top/left are in the range 0–2000  (0 = top/left edge, 2000 = bottom/right edge)
 *
 * Actual ind_ids returned by this installation's /read_data:
 *   di-temp, di-pressure, pump1, pump2, pds1   → background: diagram1
 *   di-flow, pump1-d2, di-vol, pds2            → background: diagram2
 */

import {
  DigitalIndicatorCreate,
  OnOffIndicatorCreate,
  PumpIndicatorCreate,
} from './indicatorRegistry';

// ─── Diagram 1 ────────────────────────────────────────────────────────────────

DigitalIndicatorCreate({
  ind_id:   'di-temp',
  bg_id:    'diagram1',
  label:    'Temperature',
  unit:     '°C',
  top:      300,
  left:     200,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'di-pressure',
  bg_id:    'diagram1',
  label:    'Pressure',
  unit:     'bar',
  top:      300,
  left:     600,
  fontSize: 26,
  color:    '#00ffff',
});

PumpIndicatorCreate({
  ind_id: 'pump1',
  bg_id:  'diagram1',
  label:  'PumpOne',
  top:    700,
  left:   300,
  size:   90,
});

PumpIndicatorCreate({
  ind_id: 'pump2',
  bg_id:  'diagram1',
  label:  'PumpTwo',
  top:    700,
  left:   700,
  size:   90,
});

OnOffIndicatorCreate({
  ind_id: 'pds1',
  bg_id:  'diagram1',
  label:  'PDS 1',
  top:    500,
  left:   900,
  radius: 36,
  color:  '#00e676',
});

// ─── Diagram 2 ────────────────────────────────────────────────────────────────

DigitalIndicatorCreate({
  ind_id:   'di-flow',
  bg_id:    'diagram2',
  label:    'Flow Rate',
  unit:     'm³/h',
  top:      300,
  left:     600,
  fontSize: 26,
});

PumpIndicatorCreate({
  ind_id: 'pump1-d2',
  bg_id:  'diagram2',
  label:  'PumpOne',
  top:    600,
  left:   400,
  size:   90,
});

DigitalIndicatorCreate({
  ind_id:   'di-vol',
  bg_id:    'diagram2',
  label:    'Volume',
  unit:     'L',
  top:      400,
  left:     200,
  fontSize: 26,
});

OnOffIndicatorCreate({
  ind_id: 'pds2',
  bg_id:  'diagram2',
  label:  'PDS 2',
  top:    600,
  left:   800,
  radius: 36,
  color:  '#00e676',
});
