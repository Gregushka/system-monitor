import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// ─── Definitions (must be imported before any rendering) ──────────────────────
import './indicatorDefinitions';

// ─── Infrastructure ───────────────────────────────────────────────────────────
import { apiLogin, apiReadData, apiGetSensors, apiGetRoles, apiGetUsers } from './api';
import { loadSettings } from './settingsManager';
import { buildValuesFromApiData } from './indicatorRegistry';
import { generateMockData } from './mockData';

// ─── Components ───────────────────────────────────────────────────────────────
import LoginScreen    from './components/LoginScreen';
import Tabs           from './components/Tabs';
import BackgroundView from './components/BackgroundView';
import FooterPanel    from './components/FooterPanel';
import SettingsPanel  from './components/SettingsPanel';
import UsersPanel     from './components/UsersPanel';
import SensorsPanel   from './components/SensorsPanel';

// ─── Background definitions ───────────────────────────────────────────────────
export const BACKGROUNDS = [
  { id: 'diagram1', label: 'Diagram 1', backgroundImage: process.env.PUBLIC_URL + '/backgrounds/diagram1.png', backgroundColor: '#0d1b2a' },
  { id: 'diagram2', label: 'Diagram 2', backgroundImage: process.env.PUBLIC_URL + '/backgrounds/diagram2.png', backgroundColor: '#0d1b2a' },
];

// ─── Role helpers ─────────────────────────────────────────────────────────────
export function isAdmin(roleName)   { return roleName === 'admin' || roleName === 'almighty'; }
export function isAlmighty(roleName){ return roleName === 'almighty'; }

// ─── Auth persistence ─────────────────────────────────────────────────────────
const SESSION_KEY = 'scada_session';
function loadSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
  catch (_) { return null; }
}
function saveSession(s) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [session,         setSession]         = useState(loadSession);
  const [loginError,      setLoginError]       = useState('');
  const [activeTab,       setActiveTab]        = useState(BACKGROUNDS[0].id);
  const [settings,        setSettings]         = useState(loadSettings);
  const [sensorValues,    setSensorValues]      = useState({});
  const [hasPolled,       setHasPolled]        = useState(false);   // true after ≥1 successful poll
  const [footerMessages,  setFooterMessages]   = useState([]);
  const [footerStatus,    setFooterStatus]     = useState({ status: 0, text: 'Waiting…' });
  const [allSensors,      setAllSensors]       = useState([]);
  const [allRoles,        setAllRoles]         = useState([]);
  const [allUsers,        setAllUsers]         = useState([]);
  const pollTimer = useRef(null);
  const msgId     = useRef(0);

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(async (username, password) => {
    setLoginError('');
    const result = await apiLogin(username, password);
    if (result.ok) {
      // result.token is always non-null when result.ok is true (see api.js)
      const s = { token: result.token, user: result.user, role: result.role?.role_name };
      saveSession(s);
      setSession(s);
    } else {
      setLoginError(result.message || 'Authentication failed');
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
    setSensorValues({});
    setHasPolled(false);
    setFooterMessages([]);
    if (pollTimer.current) clearInterval(pollTimer.current);
  }, []);

  // ── Process poll response ────────────────────────────────────────────────────
  const processPollData = useCallback((response, currentSettings) => {
    if (!response) return;
    const { hdr = {}, data = [] } = response;

    // bg_id switching temporarily disabled — tab is controlled by user only
    // if (hdr.bg_id && BACKGROUNDS.some((b) => b.id === hdr.bg_id)) {
    //   setActiveTab((prev) => prev !== hdr.bg_id ? hdr.bg_id : prev);
    // }

    setFooterStatus({ status: hdr.status ?? 0, text: hdr.status_text || '—' });
    setSensorValues(buildValuesFromApiData(data));
    setHasPolled(true);

    if (data.length > 0) {
      const tsMs = (data[0].ts || 0) * 1000;
      const d    = new Date(tsMs);
      const pad  = (n, w = 2) => String(n).padStart(w, '0');
      const stamp = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}  ${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
      const sz   = currentSettings?.message_text_size ?? 13;

      setFooterMessages((prev) => [
        ...prev.slice(-199),
        { id: ++msgId.current, text: `Last enquiry at ${stamp}`, color: '#7ec8e3', size: sz },
        ...data.slice(0, 8).map((item) => ({
          id:    ++msgId.current,
          text:  `  · ${item.name}: ${item.value ?? 'OFFLINE'}`,
          color: '#445566',
          size:  Math.max(10, sz - 1),
        })),
      ]);
    }
  }, []);

  // ── Polling ──────────────────────────────────────────────────────────────────
  const doPoll = useCallback(async (currentSettings) => {
    let response;
    if (currentSettings.enq_freq === 0) {
      response = await generateMockData(activeTab);
    } else {
      response = await apiReadData(session?.token).catch(() => null);
    }
    processPollData(response, currentSettings);
  }, [session, activeTab, processPollData]);

  useEffect(() => {
    if (!session) return;
    const s    = loadSettings();
    const freq = s.enq_freq === 0 ? 2000 : s.enq_freq;
    if (pollTimer.current) clearInterval(pollTimer.current);
    doPoll(s);
    pollTimer.current = setInterval(() => doPoll(loadSettings()), freq);
    return () => clearInterval(pollTimer.current);
  }, [session, settings.enq_freq]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Admin data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    Promise.all([
      apiGetSensors(session.token),
      apiGetRoles(session.token),
      isAdmin(session.role) ? apiGetUsers(session.token) : Promise.resolve([]),
    ]).then(([sensors, roles, users]) => {
      setAllSensors(sensors);
      setAllRoles(roles);
      setAllUsers(users);
    });
  }, [session]);

  const handleSettingsSaved = () => setSettings(loadSettings());

  // ─── Login screen ────────────────────────────────────────────────────────────
  if (!session) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  const tabs = [
    ...BACKGROUNDS.map((b) => ({ id: b.id, label: b.label, type: 'diagram' })),
    { id: '__settings__', label: '⚙ Settings', type: 'settings' },
    ...(isAdmin(session.role)    ? [{ id: '__users__',   label: '👤 Users',   type: 'users'   }] : []),
    ...(isAlmighty(session.role) ? [{ id: '__sensors__', label: '📡 Sensors', type: 'sensors' }] : []),
  ];

  const activeBg       = BACKGROUNDS.find((b) => b.id === activeTab);
  const activeTabType  = tabs.find((t) => t.id === activeTab)?.type || 'diagram';

  return (
    <div className="app-root">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
        tabTextSize={settings.tab_text_size}
        user={session.user}
        onLogout={handleLogout}
      />
      <div className="app-main">
        {activeTabType === 'diagram' && activeBg && (
          <BackgroundView background={activeBg} values={sensorValues} hasPolled={hasPolled} />
        )}
        {activeTabType === 'settings' && (
          <SettingsPanel settings={settings} onSaved={handleSettingsSaved} isAdmin={isAdmin(session.role)} />
        )}
        {activeTabType === 'users' && (
          <UsersPanel
            token={session.token}
            users={allUsers}
            roles={allRoles}
            onUsersChanged={() => apiGetUsers(session.token).then(setAllUsers)}
          />
        )}
        {activeTabType === 'sensors' && (
          <SensorsPanel
            token={session.token}
            sensors={allSensors}
            roles={allRoles}
            onSensorsChanged={() => apiGetSensors(session.token).then(setAllSensors)}
          />
        )}
      </div>
      <FooterPanel
        messages={footerMessages}
        status={footerStatus.status}
        statusText={footerStatus.text}
        msgTextSize={settings.message_text_size}
      />
    </div>
  );
}
