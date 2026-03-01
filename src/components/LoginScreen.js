import React, { useState } from 'react';
import '../components/css/LoginScreen.css';

/**
 * LoginScreen
 * Props:
 *   onLogin(username, password) – called when user submits
 *   error {string}              – error message to display
 */
export default function LoginScreen({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password || loading) return;
    setLoading(true);
    await onLogin(username, password);
    setLoading(false);
  }

  return (
    <div className="login-root">
      {/* Scan-line overlay */}
      <div className="login-scanlines" />

      <div className="login-card">
        {/* Logo / system name */}
        <div className="login-logo">
          <div className="login-logo-ring">
            <svg viewBox="0 0 64 64" width="64" height="64">
              <circle cx="32" cy="32" r="28" stroke="var(--accent)" strokeWidth="2" fill="none" />
              <circle cx="32" cy="32" r="20" stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.4" />
              <line x1="32" y1="10" x2="32" y2="54" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
              <line x1="10" y1="32" x2="54" y2="32" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
              <circle cx="32" cy="32" r="4" fill="var(--accent)" />
            </svg>
          </div>
          <div className="login-logo-text">
            <span className="login-sys">SYSMON</span>
            <span className="login-sub">PROCESS CONTROL v2.0</span>
          </div>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider-label">AUTHENTICATION REQUIRED</span>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="login-field">
            <label className="login-label" htmlFor="l-user">USERNAME</label>
            <input
              id="l-user"
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
              spellCheck={false}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="l-pass">PASSWORD</label>
            <input
              id="l-pass"
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-ico">⚠</span> {error}
            </div>
          )}

          <button
            className={`login-btn${loading ? ' login-btn--loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING…' : 'LOGIN'}
          </button>
        </form>

        <div className="login-footer-text">
          Unauthorised access is prohibited and will be prosecuted.
        </div>
      </div>
    </div>
  );
}
