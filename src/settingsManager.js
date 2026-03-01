// ─── Default settings ─────────────────────────────────────────────────────────
const DEFAULTS = {
  message_text_size: 13,   // px – footer message text size
  tab_text_size: 13,       // px – tab button text size
  enq_freq: 3000,          // ms – polling interval; 0 = use mock data
};

const STORAGE_KEY = 'scada_settings';

// ─── Load ─────────────────────────────────────────────────────────────────────
export function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULTS, ...JSON.parse(stored) };
    }
  } catch (_) { /* corrupted – fall through */ }
  return { ...DEFAULTS };
}

// ─── Save ─────────────────────────────────────────────────────────────────────
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULTS, ...settings }));
    return true;
  } catch (_) {
    return false;
  }
}

// ─── Single-field helper ──────────────────────────────────────────────────────
export function updateSetting(key, value) {
  const current = loadSettings();
  return saveSettings({ ...current, [key]: value });
}
