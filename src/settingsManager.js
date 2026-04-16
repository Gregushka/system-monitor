export const DEFAULTS = {
  enq_freq:             500,
  tab_text_size:        13,
  message_text_size:    13,
  message_text_color:   '#7ec8e3',
  message_window_lines: 20,
};

const STORAGE_KEY = 'scada_settings';

export function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch (_) {}
  return { ...DEFAULTS };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULTS, ...settings }));
    return true;
  } catch (_) { return false; }
}

export function mergeApiSettings(localSettings, apiSettings) {
  return { ...localSettings, ...apiSettings };
}

export function updateSetting(key, value) {
  const current = loadSettings();
  return saveSettings({ ...current, [key]: value });
}
