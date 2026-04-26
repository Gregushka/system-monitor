import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import {
  apiLogin, apiReadData, apiGetSettings,
  apiGetUsers, apiGetScreens,
} from './api';
import { loadSettings, saveSettings, mergeApiSettings } from './settingsManager';
import { loadFromAuthScreens, buildValuesFromApiData } from './indicatorRegistry';

import LoginScreen      from './components/LoginScreen';
import Tabs             from './components/Tabs';
import BackgroundView   from './components/BackgroundView';
import FooterPanel      from './components/FooterPanel';
import SettingsPanel    from './components/SettingsPanel';
import UsersPanel       from './components/UsersPanel';
import PositioningPanel from './components/PositioningPanel';

export function isAdmin(roleName)    { return roleName === 'admin' || roleName === 'almighty'; }
export function isAlmighty(roleName) { return roleName === 'almighty'; }

const SESSION_KEY = 'scada_session';
function loadSession() { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch (_) { return null; } }
function saveSession(s) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { sessionStorage.removeItem(SESSION_KEY); }

function buildBackgrounds(screens) {
  return (screens || [])
    .filter((s) => s.type === 'indicators' && s.background && s.background !== 'default')
    .map((s) => ({
      id:              s.background.replace(/\.[^.]+$/, ''),
      label:           s.tab_header || s.name,
      backgroundImage: `${process.env.PUBLIC_URL}/backgrounds/${s.background}`,
      backgroundColor: '#0d1b2a',
      screenId:        s.id,
      screenName:      s.name,
    }));
}

export default function App() {
  const [session,           setSession]          = useState(loadSession);
  const [loginError,        setLoginError]        = useState('');
  const [backgrounds,       setBackgrounds]       = useState(() => buildBackgrounds(loadSession()?.screens));
  const [activeTab,         setActiveTab]         = useState(() => {
    const bgs = buildBackgrounds(loadSession()?.screens);
    return bgs.length > 0 ? bgs[0].id : '__settings__';
  });
  const [settings,          setSettings]          = useState(loadSettings);
  const [sensorValues,      setSensorValues]      = useState({});
  const [hasPolled,         setHasPolled]         = useState(false);
  const [footerMessages,    setFooterMessages]    = useState([]);
  const [footerStatus,      setFooterStatus]      = useState({ status: 0, text: 'Waiting…' });
  const [allUsers,          setAllUsers]          = useState([]);
  const [allRoles,          setAllRoles]          = useState([]);
  const [allGroups,         setAllGroups]         = useState([]);
  const [positionOverrides, setPositionOverrides] = useState({});
  const pollTimer = useRef(null);
  const msgId     = useRef(0);

  useEffect(() => {
    const s = loadSession();
    if (s?.screens) loadFromAuthScreens(s.screens);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = useCallback(async (username, password) => {
    setLoginError('');
    const result = await apiLogin(username, password);
    if (result.ok) {
      loadFromAuthScreens(result.screens);
      const s = {
        token:   result.token,
        user:    result.user,
        role:    result.role?.role_name || result.role?.name || 'operator',
        screens: result.screens,
      };
      saveSession(s);
      setSession(s);
      const bgs = buildBackgrounds(result.screens);
      setBackgrounds(bgs);
      setActiveTab(bgs.length > 0 ? bgs[0].id : '__settings__');
      const apiSettings = await apiGetSettings(result.token);
      setSettings(mergeApiSettings(loadSettings(), apiSettings));
    } else {
      setLoginError(result.message || 'Authentication failed');
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearSession(); setSession(null); setSensorValues({}); setHasPolled(false);
    setFooterMessages([]); setPositionOverrides({});
    if (pollTimer.current) clearInterval(pollTimer.current);
  }, []);

  const processPollData = useCallback((response, currentSettings) => {
    if (!response) return;
    const { hdr = {}, indicators = {} } = response;

    setFooterStatus({ status: hdr.status ?? 0, text: hdr.status_text || '—' });
    setSensorValues(buildValuesFromApiData(indicators));
    setHasPolled(true);

    const entries = Object.entries(indicators);
    if (entries.length > 0) {
      const sz    = currentSettings?.message_text_size    ?? 13;
      const color = currentSettings?.message_text_color   ?? '#7ec8e3';
      const lines = currentSettings?.message_window_lines ?? 20;
      const now   = new Date();
      const pad   = (n, w = 2) => String(n).padStart(w, '0');
      const stamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${pad(now.getDate())}-${pad(now.getMonth()+1)}-${now.getFullYear()}`;

      setFooterMessages((prev) => [
        ...prev.slice(-(lines * 10)),
        { id: ++msgId.current, text: `Poll at ${stamp}`, color, size: sz },
        ...entries.slice(0, 8).map(([ind_id, value]) => ({
          id:    ++msgId.current,
          text:  `  · ${ind_id}: ${value ?? 'OFFLINE'}`,
          color: '#445566',
          size:  Math.max(10, sz - 1),
        })),
      ]);
    }
  }, []);

  const doPoll = useCallback(async (currentSettings) => {
    const response = await apiReadData(session?.token).catch(() => null);
    processPollData(response, currentSettings);
  }, [session, processPollData]);

  useEffect(() => {
    if (!session) return;
    const s = loadSettings();
    const freq = s.enq_freq > 0 ? s.enq_freq : 500;
    if (pollTimer.current) clearInterval(pollTimer.current);
    doPoll(s);
    pollTimer.current = setInterval(() => doPoll(loadSettings()), freq);
    return () => clearInterval(pollTimer.current);
  }, [session, settings.enq_freq]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!session || !isAdmin(session.role)) return;
    apiGetUsers(session.token).then(({ users, roles, groups }) => {
      setAllUsers(users); setAllRoles(roles); setAllGroups(groups);
    });
  }, [session]);

  const handleSettingsSaved = useCallback((newSettings) => {
    saveSettings(newSettings); setSettings(newSettings);
  }, []);

  const handlePositionTry = useCallback((ind_id, top, left) => {
    setPositionOverrides((prev) => ({ ...prev, [ind_id]: { top, left } }));
  }, []);

  const handlePositionSaved = useCallback(async (ind_id) => {
    setPositionOverrides((prev) => { const next = { ...prev }; delete next[ind_id]; return next; });
    const newScreens = await apiGetScreens(session?.token);
    if (newScreens.length > 0) {
      loadFromAuthScreens(newScreens);
      const updated = { ...loadSession(), screens: newScreens };
      saveSession(updated);
      setSession(updated);
      setBackgrounds(buildBackgrounds(newScreens));
    }
  }, [session]);

  const refreshUsers = useCallback(() => {
    apiGetUsers(session?.token).then(({ users, roles, groups }) => {
      setAllUsers(users); setAllRoles(roles); setAllGroups(groups);
    });
  }, [session]);

  if (!session) return <LoginScreen onLogin={handleLogin} error={loginError} />;

  const screenTypes = new Set((session.screens || []).map((s) => s.type));
  const tabs = [
    ...backgrounds.map((b) => ({ id: b.id, label: b.label, type: 'diagram' })),
    { id: '__settings__', label: '⚙ Настройки', type: 'settings' },
    ...(isAdmin(session.role) && screenTypes.has('users')
        ? [{ id: '__users__', label: '👤 Пользователи', type: 'users' }] : []),
    ...(isAlmighty(session.role) && screenTypes.has('positioning')
        ? [{ id: '__positioning__', label: '📐 Позиционирование', type: 'positioning' }] : []),
  ];

  const activeBg      = backgrounds.find((b) => b.id === activeTab);
  const activeTabType = tabs.find((t) => t.id === activeTab)?.type || 'diagram';

  return (
    <div className="app-root">
      <Tabs tabs={tabs} activeTab={activeTab} onSelect={setActiveTab}
        tabTextSize={settings.tab_text_size} user={session.user} onLogout={handleLogout} />
      <div className="app-main">
        {activeTabType === 'diagram' && activeBg && (
          <>
            <BackgroundView background={activeBg} values={sensorValues}
              hasPolled={hasPolled} positionOverrides={positionOverrides} />
            {isAlmighty(session.role) && (
              <PositioningPanel token={session.token} background={activeBg}
                onTry={handlePositionTry} onSaved={handlePositionSaved} />
            )}
          </>
        )}
        {activeTabType === 'settings' && (
          <SettingsPanel token={session.token} settings={settings}
            onSaved={handleSettingsSaved} isAdmin={isAdmin(session.role)} />
        )}
        {activeTabType === 'users' && (
          <UsersPanel token={session.token} users={allUsers} roles={allRoles}
            groups={allGroups} onUsersChanged={refreshUsers} />
        )}
        {activeTabType === 'positioning' && (
          <div className="ap-root">
            <p style={{ padding: '2rem', color: 'var(--text-dim)' }}>
              Switch to a diagram tab to use the positioning overlay.
            </p>
          </div>
        )}
      </div>
      <FooterPanel messages={footerMessages} status={footerStatus.status}
        statusText={footerStatus.text} msgTextSize={settings.message_text_size} />
    </div>
  );
}
