/**
 * indicatorRegistry.js
 *
 * Central registry for all SCADA indicators.
 *
 * Usage pattern
 * ─────────────
 *   1. Call a *Create() function once (at app start) to register an indicator.
 *   2. The rendering layer (BackgroundView) calls getIndicatorsForBg(bg_id)
 *      to get all indicators for the active background.
 *   3. When polling data arrives, App.js builds a values map { [ind_id]: value }
 *      and passes it to BackgroundView.  The *Update() helper functions can be
 *      used explicitly for programmatic / websocket updates.
 *
 * Indicator types
 * ───────────────
 *   DigitalIndicator   – numeric readout
 *   DigitalRound       – circular numeric readout with coloured fill
 *   OnOffIndicator     – coloured bulb (on/off)
 *   PumpIndicator      – P&ID centrifugal pump symbol
 *   GasBurnerIndicator – burner flame with 6 operating modes
 *   GasFlapIndicator   – 2-position flap / damper valve
 *   TempIndicator      – temperature state indicator (no numeric value)
 *
 * Coordinate system
 * ─────────────────
 *   top  / left are 0–2000, mapped to 0–100 % of the main area.
 *   This gives ~0.05 % resolution ( ≈ 1 px on a 2000 px canvas ).
 */

// ─── Internal registry ────────────────────────────────────────────────────────
const _registry = {};
let   _seq      = 0;   // monotonic counter for unique internal keys

// ─── Shared create helper ─────────────────────────────────────────────────────
function _register(type, config) {
  if (!config.ind_id) {
    console.error(`[Registry] Missing ind_id in ${type} definition`, config);
    return;
  }
  // Use a unique internal key so multiple indicators can bind to the same ind_id.
  // The ind_id field is kept for value-map lookup; _key is only used internally.
  const key = `${config.ind_id}::${_seq++}`;
  _registry[key] = { ...config, _type: type, _key: key };
}

// ─── DigitalIndicator ─────────────────────────────────────────────────────────
/**
 * DigitalIndicatorCreate(config)
 *
 * @param {object} config
 * @param {string} config.ind_id     Unique sensor id (matches API name)
 * @param {string} config.bg_id      Background this indicator belongs to
 * @param {string} config.label      Human-readable label
 * @param {string} [config.unit]     Engineering unit string, e.g. "°C"
 * @param {number} config.top        Vertical position 0–2000
 * @param {number} config.left       Horizontal position 0–2000
 * @param {number} [config.fontSize] Value font size in px (default 22)
 * @param {string} [config.color]    Value colour override (default: threshold-based)
 */
export function DigitalIndicatorCreate(config) { _register('DigitalIndicator', config); }

/**
 * DigitalIndicatorUpdate(valuesMap, ind_id, value)
 * Returns a new values map with the updated value.
 */
export function DigitalIndicatorUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}

// ─── DigitalRound ─────────────────────────────────────────────────────────────
/**
 * DigitalRoundCreate(config)
 *
 * @param {string} config.ind_id      Unique sensor id (matches API name)
 * @param {string} config.bg_id       Background id
 * @param {string} config.label       Text shown below the circle (e.g. "Pressure")
 * @param {string} [config.unit]      Measurement unit shown next to label (e.g. "bar")
 * @param {number} config.top         Vertical position 0–2000
 * @param {number} config.left        Horizontal position 0–2000
 * @param {number} [config.radius]    Circle radius in px (default 48)
 * @param {number} [config.fontSize]  Value font size in px (default radius * 0.42)
 * @param {string} [config.defaultBg] Default circle fill colour (default '#0d1820')
 *
 * Value from API — two supported formats:
 *   [number, cssColour]  e.g. [4.2, '#0a2a0a']   → value + explicit fill colour
 *   number               e.g. 4.2                 → value, fill = config.defaultBg
 *   null / undefined     → OFFLINE state
 */
export function DigitalRoundCreate(config) { _register('DigitalRound', config); }
export function DigitalRoundUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}
/**
 * OnOffIndicatorCreate(config)
 *
 * @param {string} config.ind_id
 * @param {string} config.bg_id
 * @param {string} config.label
 * @param {number} config.top
 * @param {number} config.left
 * @param {number} [config.radius]   Circle radius in px (default 28)
 * @param {string} [config.color]    "On" colour (default "#00ff41")
 *
 * Value  (from API):  0 / false / "off" → off (grey);  any other truthy → on (config.color)
 */
export function OnOffIndicatorCreate(config) { _register('OnOffIndicator', config); }
export function OnOffIndicatorUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}

// ─── PumpIndicator ────────────────────────────────────────────────────────────
/**
 * PumpIndicatorCreate(config)
 *
 * @param {string} config.ind_id
 * @param {string} config.bg_id
 * @param {string} config.label
 * @param {number} config.top
 * @param {number} config.left
 * @param {number} [config.size]     SVG size in px (default 80)
 *
 * Value: "grey" | "red" | "green"  (or 0=grey, 1=green, 2=red)
 */
export function PumpIndicatorCreate(config) { _register('PumpIndicator', config); }
export function PumpIndicatorUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}

// ─── GasBurnerIndicator ───────────────────────────────────────────────────────
/**
 * GasBurnerIndicatorCreate(config)
 *
 * Operating modes (value):
 *   0 | "off"       – Burner off            (dark circle, no flame)
 *   1 | "on"        – Burner on / normal    (orange flame)
 *   2 | "alarm"     – Alarm / failure       (red, exclamation)
 *   3 | "nodata"    – No data / comms lost  (grey, question mark)
 *   4 | "fullpower" – Full power            (bright yellow/white flame, wide)
 *   5 | "minpower"  – Minimum power         (small blue flame)
 *
 * @param {string} config.ind_id
 * @param {string} config.bg_id
 * @param {string} config.label
 * @param {number} config.top
 * @param {number} config.left
 * @param {number} [config.size]    Indicator size in px (default 72)
 */
export function GasBurnerIndicatorCreate(config) { _register('GasBurnerIndicator', config); }
export function GasBurnerIndicatorUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}

// ─── GasFlapIndicator ────────────────────────────────────────────────────────
/**
 * GasFlapIndicatorCreate(config)
 *
 * Two-position flap / damper:
 *   0 | "chimney"  – Flap open to chimney  (vertical blade)
 *   1 | "bypass"   – Flap open to bypass   (horizontal blade)
 *
 * @param {string} config.ind_id
 * @param {string} config.bg_id
 * @param {string} config.label
 * @param {number} config.top
 * @param {number} config.left
 * @param {number} [config.size]    Indicator size in px (default 72)
 * @param {string} [config.labelChimney]  Label for chimney mode (default "CHIMNEY")
 * @param {string} [config.labelBypass]   Label for bypass mode  (default "BYPASS")
 */
export function GasFlapIndicatorCreate(config) { _register('GasFlapIndicator', config); }
export function GasFlapIndicatorUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}

// ─── TempIndicator ───────────────────────────────────────────────────────────
/**
 * TempIndicatorCreate(config)
 *
 * Temperature state indicator – no numeric value, only a mode:
 *   0 | "off"     – Sensor/system off    (grey ring)
 *   1 | "normal"  – Temperature normal   (green ring)
 *   2 | "high"    – Temperature high     (red ring, ↑ arrow)
 *   3 | "low"     – Temperature low      (blue ring, ↓ arrow)
 *   4 | "nodata"  – No data              (grey, ? mark)
 *
 * @param {string} config.ind_id
 * @param {string} config.bg_id
 * @param {string} config.label
 * @param {number} config.top
 * @param {number} config.left
 * @param {number} [config.size]    Indicator size in px (default 68)
 */
export function TempIndicatorCreate(config) { _register('TempIndicator', config); }
export function TempIndicatorUpdate(valuesMap, ind_id, value) {
  return { ...valuesMap, [ind_id]: value };
}

// ─── Registry queries ─────────────────────────────────────────────────────────
/** Returns all indicator configs for a given background id */
export function getIndicatorsForBg(bg_id) {
  return Object.values(_registry).filter((i) => i.bg_id === bg_id);
}

/** Returns a single indicator config by ind_id */
export function getIndicator(ind_id) {
  return _registry[ind_id] || null;
}

/** Returns the full registry (for admin / debug views) */
export function getRegistry() {
  return { ..._registry };
}

/**
 * Builds a values map { [ind_id]: value } from the raw API data array.
 * Entries where value is null/undefined are stored as null (→ "OFFLINE" display).
 */
export function buildValuesFromApiData(dataArray = []) {
  const map = {};
  dataArray.forEach(({ name, value }) => {
    map[name] = value !== undefined ? value : null;
  });
  return map;
}
