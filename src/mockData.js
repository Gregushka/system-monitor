/**
 * mockData.js
 * ───────────
 * Produces a realistic fake /read_data response for development / offline use.
 * Activated when settings.enq_freq === 0.
 *
 * Add more mock entries to MOCK_SENSORS to cover all your ind_ids.
 */

// ─── Mock sensor definitions ──────────────────────────────────────────────────
// type: 'analog' | 'onoff' | 'pump' | 'burner' | 'flap' | 'temp'
const MOCK_SENSORS = [
  { name: 'di-temp',      type: 'analog',  base: 75,   noise: 5,   min: 0,   max: 120  },
  { name: 'di-pressure',  type: 'analog',  base: 4.2,  noise: 0.3, min: 0,   max: 10   },
  { name: 'di-flow',      type: 'analog',  base: 135,  noise: 12,  min: 0,   max: 300  },
  { name: 'pump-main',    type: 'pump'                                                   },
  { name: 'pump-feed',    type: 'pump'                                                   },
  { name: 'valve-main',   type: 'onoff'                                                  },
  { name: 'burner-main',  type: 'burner'                                                 },
  { name: 'burner-pilot', type: 'burner'                                                 },
  { name: 'flap-exhaust', type: 'flap'                                                   },
  { name: 'temp-flue',    type: 'temp'                                                   },
  { name: 'temp-ambient', type: 'temp'                                                   },
];

const PUMP_STATES   = ['grey', 'green', 'green', 'green', 'red'];
const BURNER_STATES = [0, 1, 1, 1, 4, 5, 2];   // weighted toward 'on'
const FLAP_STATES   = [0, 1];
const TEMP_STATES   = [0, 1, 1, 1, 2, 3, 4];   // weighted toward 'normal'

// Persistent slow-drift state
const _state = {};
MOCK_SENSORS.forEach((s) => {
  if (s.type === 'analog') _state[s.name] = s.base;
});

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr)       { return arr[Math.floor(Math.random() * arr.length)]; }

/**
 * generateMockData()
 * Async so callers can await it exactly like the real API call.
 * Returns the same shape as /read_data response.
 */
export async function generateMockData(activeBgId = 'diagram1') {
  // Simulate a brief network delay
  await new Promise((r) => setTimeout(r, rand(50, 120)));

  const now = Date.now();
  const data = MOCK_SENSORS.map((s) => {
    let value;
    switch (s.type) {
      case 'analog':
        // Brownian drift clamped to [min, max]
        _state[s.name] += rand(-s.noise, s.noise);
        _state[s.name] = Math.max(s.min, Math.min(s.max, _state[s.name]));
        value = parseFloat(_state[s.name].toFixed(2));
        break;
      case 'pump':   value = pick(PUMP_STATES);   break;
      case 'onoff':  value = Math.random() > 0.3 ? 1 : 0; break;
      case 'burner': value = pick(BURNER_STATES); break;
      case 'flap':   value = pick(FLAP_STATES);   break;
      case 'temp':   value = pick(TEMP_STATES);   break;
      default:       value = null;
    }
    return { ts: Math.floor(now / 1000), name: s.name, value };
  });

  return {
    hdr: {
      bg_id:       activeBgId,
      status:      0,
      status_text: 'MOCK DATA — enq_freq = 0',
    },
    data,
  };
}
