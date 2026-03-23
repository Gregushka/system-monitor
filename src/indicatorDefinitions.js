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
  DigitalRoundCreate,
  OnOffIndicatorCreate,
  PumpIndicatorCreate,
  GasBurnerIndicatorCreate,
  GasFlapIndicatorCreate,
} from './indicatorRegistry';

// ─── Diagram 1 ────────────────────────────────────────────────────────────────

DigitalIndicatorCreate({
  ind_id:   'te_1-1',
  bg_id:    'diagram1',
  label:    'TE1',
  unit:     '°C',
  top:      830,
  left:     1760,
  fontSize: 26,
});

DigitalRoundCreate({
  ind_id:    'pe_1-1',   // unique registry key
  data_id:   'pe_1-1',         // which API name to read the value from
  bg_id:     'diagram1',
  label:     'PE1',
  unit:      'bar',
  top:       790,
  left:      1580,
  radius:    45,
  fontSize:  30,
  defaultBg: '#0a1a2a',
});

DigitalIndicatorCreate({
  ind_id:   'te_1-2',
  bg_id:    'diagram1',
  label:    'TE2',
  unit:     '°C',
  top:      1270,
  left:     1425,
  fontSize: 26,
});

DigitalRoundCreate({
  ind_id:    'pe_1-2',   // unique registry key
  data_id:   'pe_1-2',         // which API name to read the value from
  bg_id:     'diagram1',
  label:     'PE2',
  unit:      'bar',
  top:       1300,
  left:      1250,
  radius:    45,
  fontSize:  30,
  defaultBg: '#0a1a2a',
});

DigitalIndicatorCreate({
  ind_id:   'te_1-3',
  bg_id:    'diagram1',
  label:    'TE3',
  unit:     '°C',
  top:      130,
  left:     1860,
  fontSize: 26,
});

DigitalRoundCreate({
  ind_id:    'pe_1-3',   // unique registry key
  data_id:   'pe_1-3',         // which API name to read the value from
  bg_id:     'diagram1',
  label:     'PE3',
  unit:      'bar',
  top:       190,
  left:      1680,
  radius:    45,
  fontSize:  30,
  defaultBg: '#0a1a2a',
});

DigitalIndicatorCreate({
  ind_id:   'te_1-4',
  bg_id:    'diagram1',
  label:    'TE4',
  unit:     '°C',
  top:      445,
  left:     1870,
  fontSize: 26,
});

DigitalRoundCreate({
  ind_id:    'pe_1-4',   // unique registry key
  data_id:   'pe_1-4',         // which API name to read the value from
  bg_id:     'diagram1',
  label:     'PE4',
  unit:      'bar',
  top:       640,
  left:      1810,
  radius:    45,
  fontSize:  30,
  defaultBg: '#0a1a2a',
});


DigitalIndicatorCreate({
  ind_id:   'te_1-5',
  bg_id:    'diagram1',
  label:    'TE5',
  unit:     '°C',
  top:      380,
  left:     540,
  fontSize: 26,
});

DigitalRoundCreate({
  ind_id:    'pe_1-5',   // unique registry key
  data_id:   'pe_1-5',         // which API name to read the value from
  bg_id:     'diagram1',
  label:     'PE5',
  unit:      'bar',
  top:       400,
  left:      440,
  radius:    45,
  fontSize:  30,
  defaultBg: '#0a1a2a',
});

DigitalRoundCreate({
  ind_id:    'pe_1-6',   // unique registry key
  data_id:   'pe_1-6',         // which API name to read the value from
  bg_id:     'diagram1',
  label:     'PE6',
  unit:      'bar',
  top:       1200,
  left:      410,
  radius:    45,
  fontSize:  30,
  defaultBg: '#0a1a2a',
});

DigitalIndicatorCreate({
  ind_id:   'te_1-6',
  bg_id:    'diagram1',
  label:    'TE6',
  unit:     '°C',
  top:      1180,
  left:     510,
  fontSize: 26,
});



DigitalIndicatorCreate({
  ind_id:   'te_1-7',
  bg_id:    'diagram1',
  label:    'TE7',
  unit:     '°C',
  top:      450,
  left:     90,
  fontSize: 26,
});


/*
DigitalIndicatorCreate({
  ind_id:   'di-pressure',
  bg_id:    'diagram1',
  label:    'Pressure',
  unit:     'bar',
  top:      1270,
  left:     1290,
  fontSize: 26,
  color:    '#00ffff',
});
*/


DigitalIndicatorCreate({
  ind_id:   'di-valve',
  bg_id:    'diagram1',
  label:    'Valve',
  unit:     '%',
  top:      800,
  left:     1180,
  fontSize: 26,
  color:    '#00ffff',
});

PumpIndicatorCreate({
  ind_id: 'pump1',
  bg_id:  'diagram1',
  label:  'PumpOne',
  top:    435,
  left:   895,
  size:   60,
});

PumpIndicatorCreate({
  ind_id: 'pds3',
  bg_id:  'diagram1',
  label:  'PDS3',
  fontSize: 26,
  top:    385,
  left:   803,
  size:   60,
});
/*
OnOffIndicatorCreate({
  ind_id: 'pds1',
  bg_id:  'diagram1',
  label:  'PDS 1',
  top:    500,
  left:   900,
  radius: 36,
  color:  '#00e676',
});
*/
// ─── Diagram 2 ────────────────────────────────────────────────────────────────

OnOffIndicatorCreate({
  ind_id: 'cooling',
  bg_id:  'diagram2',
  label:  'Cooling',
  top:    1495,
  left:   548,
  radius: 36,
  color:  '#00e676',
});

OnOffIndicatorCreate({
  ind_id: 'chimney',
  bg_id:  'diagram2',
  label:  'Chimney',
  top:    1210,
  left:   1160,
  radius: 36,
  color:  '#00e676',
});

OnOffIndicatorCreate({
  ind_id: 'cyclon',
  bg_id:  'diagram2',
  label:  'Cyclon',
  top:    1240,
  left:   1035,
  radius: 36,
  color:  '#00e676',
});

DigitalIndicatorCreate({
  ind_id:   'te_2-1',
  bg_id:    'diagram2',
  label:    'TE1',
  unit:     '°C',
  top:      1215,
  left:     240,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'te_2-2',
  bg_id:    'diagram2',
  label:    'TE2',
  unit:     '°C',
  top:      1645,
  left:     335,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'te_2-3',
  bg_id:    'diagram2',
  label:    'TE3',
  unit:     '°C',
  top:      100,
  left:     1660,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'te_2-4',
  bg_id:    'diagram2',
  label:    'TE4',
  unit:     '°C',
  top:      860,
  left:     560,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'te_2-5',
  bg_id:    'diagram2',
  label:    'TE5',
  unit:     '°C',
  top:      860,
  left:     1035,
  fontSize: 26,
});

DigitalIndicatorCreate({
  ind_id:   'te_2-6',
  bg_id:    'diagram2',
  label:    'TE6',
  unit:     '°C',
  top:      550,
  left:     1150,
  fontSize: 26,
});

GasBurnerIndicatorCreate({
  ind_id:   'burner_one',
  bg_id:    'diagram2',
  label:    'Burner1',
  top:      1325,
  left:     260,
  fontsize: 26,
  burnerType: 'small',
  scale:      0.9,  
});

GasBurnerIndicatorCreate({
  ind_id:   'burner_two',
  bg_id:    'diagram2',
  label:    'Burner2',
  top:      1550,
  left:     260,
  fontsize: 26,
  burnerType: 'small',
  scale:      0.9,  
});

GasBurnerIndicatorCreate({
  ind_id:   'burner_three',
  bg_id:    'diagram2',
  label:    'Burner3',
  top:      430,
  left:     1190,
  fontsize: 26,
  burnerType: 'small',
  scale:      0.9,  
});

GasFlapIndicatorCreate({
  ind_id:   'burner_flap',
  bg_id:    'diagram2',
  label:    'Заслонка',
  top:      900,
  left:     650,
  fontsize: 26,
  labelChimney: 'Выхлоп',
  labelBypass: 'Мимо',
  size: 100,
});

/*
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
*/