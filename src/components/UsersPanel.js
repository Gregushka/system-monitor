import React, { useState } from 'react';
import { apiCreateUser, apiDeleteUser, apiSetPassword, apiUpdateUser } from '../api';
import './css/AdminPanel.css';

/**
 * UsersPanel  –  User management (Admin / Almighty)
 *
 * Props:
 *   token           {string}
 *   users           [{id, login, role_id}]
 *   roles           [{id, role_name, role_description}]
 *   onUsersChanged  fn()  – call to refresh user list from parent
 */
export default function UsersPanel({ token, users, roles, onUsersChanged }) {
  const [status,  setStatus]  = useState('');
  const [isError, setIsError] = useState(false);
  const [newUser, setNewUser] = useState({ login: '', password: '', role_id: 1 });
  const [editing, setEditing] = useState({});      // { [login]: { role_id, newPwd } }
  const [confirm, setConfirm] = useState(null);    // login to confirm deletion

  function msg(text, err = false) { setStatus(text); setIsError(err); }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newUser.login || !newUser.password) return msg('Login and password required.', true);
    const res = await apiCreateUser(token, newUser.login, newUser.password, Number(newUser.role_id));
    if (res.ok) { msg('User created successfully.'); setNewUser({ login: '', password: '', role_id: 1 }); onUsersChanged(); }
    else msg(res.message || 'Failed to create user.', true);
  }

  async function handleDelete(login) {
    const res = await apiDeleteUser(token, login);
    if (res.ok) { msg(`User "${login}" deleted.`); setConfirm(null); onUsersChanged(); }
    else msg(res.message || 'Failed to delete user.', true);
  }

  async function handleSetPassword(login) {
    const pwd = editing[login]?.newPwd || '';
    if (!pwd) return msg('Password cannot be empty.', true);
    const res = await apiSetPassword(token, login, pwd);
    if (res.ok) { msg(`Password updated for "${login}".`); setEditing((e) => ({ ...e, [login]: { ...e[login], newPwd: '' } })); }
    else msg(res.message || 'Failed to set password.', true);
  }

  async function handleUpdateRole(login, role_id) {
    const res = await apiUpdateUser(token, login, Number(role_id));
    if (res.ok) { msg(`Role updated for "${login}".`); onUsersChanged(); }
    else msg(res.message || 'Failed to update role.', true);
  }

  function editField(login, key, val) {
    setEditing((e) => ({ ...e, [login]: { ...e[login], [key]: val } }));
  }

  function roleName(role_id) {
    return roles.find((r) => r.id === role_id)?.role_name || `role #${role_id}`;
  }

  return (
    <div className="ap-root">
      <div className="ap-header">
        <h1 className="ap-title">👤 User Management</h1>
        <p className="ap-subtitle">Add, remove and manage users and their roles.</p>
      </div>

      {status && (
        <div className={`ap-status${isError ? ' ap-status--error' : ' ap-status--ok'}`}>
          {isError ? '⚠ ' : '✓ '}{status}
        </div>
      )}

      <div className="ap-body">
        {/* ── Create new user ── */}
        <div className="ap-section">
          <h2 className="ap-section-title">Add New User</h2>
          <form className="ap-form-row" onSubmit={handleCreate}>
            <input
              className="ap-input ap-input--sm"
              placeholder="Username"
              value={newUser.login}
              onChange={(e) => setNewUser((u) => ({ ...u, login: e.target.value }))}
            />
            <input
              className="ap-input ap-input--sm"
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
            />
            <select
              className="ap-select ap-input--sm"
              value={newUser.role_id}
              onChange={(e) => setNewUser((u) => ({ ...u, role_id: e.target.value }))}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </select>
            <button className="ap-btn ap-btn--primary" type="submit">＋ CREATE</button>
          </form>
        </div>

        {/* ── User list ── */}
        <div className="ap-section">
          <h2 className="ap-section-title">Existing Users ({users.length})</h2>
          {users.length === 0 && <p className="ap-empty">No users found or loading…</p>}
          <div className="ap-table">
            {users.map((u) => {
              const ed = editing[u.login] || {};
              return (
                <div className="ap-table-row" key={u.login}>
                  <div className="ap-table-cell ap-cell--login">
                    <span className="ap-user-ico">◉</span> {u.login}
                  </div>
                  <div className="ap-table-cell ap-cell--role">
                    <select
                      className="ap-select ap-select--inline"
                      defaultValue={u.role_id}
                      onChange={(e) => editField(u.login, 'role_id', e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.role_name}</option>
                      ))}
                    </select>
                    <button
                      className="ap-btn ap-btn--sm ap-btn--secondary"
                      onClick={() => handleUpdateRole(u.login, ed.role_id ?? u.role_id)}
                    >
                      ↑ ROLE
                    </button>
                  </div>
                  <div className="ap-table-cell ap-cell--pwd">
                    <input
                      className="ap-input ap-input--sm"
                      type="password"
                      placeholder="New password"
                      value={ed.newPwd || ''}
                      onChange={(e) => editField(u.login, 'newPwd', e.target.value)}
                    />
                    <button
                      className="ap-btn ap-btn--sm ap-btn--secondary"
                      onClick={() => handleSetPassword(u.login)}
                    >
                      ⟳ PWD
                    </button>
                  </div>
                  <div className="ap-table-cell ap-cell--del">
                    {confirm === u.login ? (
                      <>
                        <span className="ap-confirm-text">Sure?</span>
                        <button className="ap-btn ap-btn--sm ap-btn--danger"  onClick={() => handleDelete(u.login)}>YES</button>
                        <button className="ap-btn ap-btn--sm ap-btn--ghost"   onClick={() => setConfirm(null)}>NO</button>
                      </>
                    ) : (
                      <button className="ap-btn ap-btn--sm ap-btn--danger" onClick={() => setConfirm(u.login)}>✕ DEL</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
