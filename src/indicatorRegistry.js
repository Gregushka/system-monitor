const _registry = {};
let   _seq      = 0;

function _register(type, config) {
  if (!config.ind_id) { console.error(`[Registry] Missing ind_id`, config); return; }
  const key = `${config.ind_id}::${_seq++}`;
  _registry[key] = { ...config, _type: type, _key: key };
}

export function loadFromAuthScreens(screens) {
  Object.keys(_registry).forEach((k) => delete _registry[k]);
  _seq = 0;

  for (const screen of screens) {
    if (screen.type !== 'indicators') continue;
    const bgId = screen.background
      ? screen.background.replace(/\.[^.]+$/, '')
      : screen.name.toLowerCase().replace(/\s+/g, '_');

    for (const [aggName, aggData] of Object.entries(screen.aggregates || {})) {
      for (const ind of (aggData.indicators || [])) {
        const settings = ind.settings || {};
        _register(ind.type, {
          ind_id:    ind.ind_id,
          data_id:   ind.data_id  || null,
          bg_id:     bgId,
          label:     ind.label,
          unit:      ind.unit     || null,
          top:       ind.top      ?? 0,
          left:      ind.left     ?? 0,
          radius:    ind.radius   ?? undefined,
          size:      ind.size     ?? undefined,
          box:       ind.box      ?? undefined,
          aggregate: aggName,
          screen:    screen.name,
          ...settings,
        });
      }
    }
  }
}

export function DigitalIndicatorCreate(config)   { _register('DigitalIndicator',   config); }
export function DigitalRoundCreate(config)        { _register('DigitalRound',        config); }
export function OnOffIndicatorCreate(config)      { _register('OnOffIndicator',      config); }
export function PumpIndicatorCreate(config)       { _register('PumpIndicator',       config); }
export function GasBurnerIndicatorCreate(config)  { _register('GasBurnerIndicator',  config); }
export function GasFlapIndicatorCreate(config)    { _register('GasFlapIndicator',    config); }
export function TempIndicatorCreate(config)       { _register('TempIndicator',       config); }

export function updateIndicatorPosition(ind_id, bgId, top, left) {
  for (const key of Object.keys(_registry)) {
    const ind = _registry[key];
    if (ind.ind_id === ind_id && ind.bg_id === bgId) {
      _registry[key] = { ...ind, top, left };
      return true;
    }
  }
  return false;
}

export function getIndicatorsForBg(bgId) {
  return Object.values(_registry).filter((i) => i.bg_id === bgId);
}

export function getIndicator(ind_id) {
  return Object.values(_registry).find((i) => i.ind_id === ind_id) || null;
}

export function getRegistry() { return { ..._registry }; }

export function buildValuesFromApiData(dataArray = []) {
  const map = {};
  dataArray.forEach(({ ind_id, value }) => { map[ind_id] = value !== undefined ? value : null; });
  return map;
}
