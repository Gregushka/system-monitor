import React, { useState } from 'react';
import {
  apiCreateUser, apiUpdateUser, apiDeleteUser,
  apiAssignRoles, apiAssignGroups,
  apiCreateRole, apiUpdateRole, apiDeleteRole,
  apiCreateGroup, apiUpdateGroup, apiDeleteGroup,
} from '../api';
import './css/AdminPanel.css';

export default function UsersPanel({ token, users, roles, groups, onUsersChanged }) {
  const [activeSection, setActiveSection] = useState('users');
  const [status,  setStatus]  = useState('');
  const [isError, setIsError] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [newUser, setNewUser] = useState({ login: '', password: '', roleIds: [], groupIds: [] });
  const [editing, setEditing] = useState({});

  const [newRole,   setNewRole]   = useState({ name: '', description: '' });
  const [newGroup,  setNewGroup]  = useState({ name: '', description: '' });
  const [editRole,  setEditRole]  = useState({});
  const [editGroup, setEditGroup] = useState({});

  function msg(text, err = false) { setStatus(text); setIsError(err); }

  // ── User operations ──────────────────────────────────────────────────────────
  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUser.login || !newUser.password) return msg('Login and password are required.', true);
    const res = await apiCreateUser(token, {
      login: newUser.login, password: newUser.password,
      roles: newUser.roleIds.map(Number), groups: newUser.groupIds.map(Number),
    });
    if (res.ok) { msg('User created.'); setNewUser({ login: '', password: '', roleIds: [], groupIds: [] }); onUsersChanged(); }
    else msg(res.message || 'Failed to create user.', true);
  }

  async function handleDeleteUser(userId, login) {
    const res = await apiDeleteUser(token, userId);
    if (res.ok) { msg(`User "${login}" deleted.`); setConfirm(null); onUsersChanged(); }
    else msg(res.message || 'Failed to delete.', true);
  }

  async function handleSetPassword(userId, login) {
    const pwd = editing[userId]?.newPwd || '';
    if (!pwd) return msg('Password cannot be empty.', true);
    const res = await apiUpdateUser(token, userId, { password: pwd });
    if (res.ok) { msg(`Password updated for "${login}".`); editUser(userId, 'newPwd', ''); }
    else msg(res.message || 'Failed to update password.', true);
  }

  async function handleAssignRoles(userId, login) {
    const roleIds = (editing[userId]?.roleIds ?? userRoleIds(userId)).map(Number);
    const res = await apiAssignRoles(token, userId, roleIds);
    if (res.ok) { msg(`Roles updated for "${login}".`); onUsersChanged(); }
    else msg(res.message || 'Failed to update roles.', true);
  }

  async function handleAssignGroups(userId, login) {
    const groupIds = (editing[userId]?.groupIds ?? userGroupIds(userId)).map(Number);
    const res = await apiAssignGroups(token, userId, groupIds);
    if (res.ok) { msg(`Groups updated for "${login}".`); onUsersChanged(); }
    else msg(res.message || 'Failed to update groups.', true);
  }

  function editUser(userId, key, val) {
    setEditing((e) => ({ ...e, [userId]: { ...e[userId], [key]: val } }));
  }

  function userRoleIds(userId) {
    const u = users.find((u) => u.id === userId);
    return (u?.roles || []).map((r) => (typeof r === 'object' ? r.id : r));
  }

  function userGroupIds(userId) {
    const u = users.find((u) => u.id === userId);
    return (u?.groups || []).map((g) => (typeof g === 'object' ? g.id : g));
  }

  function toggleMulti(arr, id) {
    const idN = Number(id);
    return arr.includes(idN) ? arr.filter((x) => x !== idN) : [...arr, idN];
  }

  // ── Role operations ──────────────────────────────────────────────────────────
  async function handleCreateRole(e) {
    e.preventDefault();
    if (!newRole.name) return msg('Role name is required.', true);
    const res = await apiCreateRole(token, newRole);
    if (res.ok) { msg('Role created.'); setNewRole({ name: '', description: '' }); onUsersChanged(); }
    else msg(res.message || 'Failed to create role.', true);
  }

  async function handleUpdateRole(roleId) {
    const data = editRole[roleId];
    if (!data?.name) return msg('Role name is required.', true);
    const res = await apiUpdateRole(token, roleId, data);
    if (res.ok) { msg('Role updated.'); setEditRole((e) => { const n = { ...e }; delete n[roleId]; return n; }); onUsersChanged(); }
    else msg(res.message || 'Failed to update role.', true);
  }

  async function handleDeleteRole(roleId) {
    const res = await apiDeleteRole(token, roleId);
    if (res.ok) { msg('Role deleted.'); setConfirm(null); onUsersChanged(); }
    else msg(res.message || 'Failed to delete role.', true);
  }

  // ── Group operations ─────────────────────────────────────────────────────────
  async function handleCreateGroup(e) {
    e.preventDefault();
    if (!newGroup.name) return msg('Group name is required.', true);
    const res = await apiCreateGroup(token, newGroup);
    if (res.ok) { msg('Group created.'); setNewGroup({ name: '', description: '' }); onUsersChanged(); }
    else msg(res.message || 'Failed to create group.', true);
  }

  async function handleUpdateGroup(groupId) {
    const data = editGroup[groupId];
    if (!data?.name) return msg('Group name is required.', true);
    const res = await apiUpdateGroup(token, groupId, data);
    if (res.ok) { msg('Group updated.'); setEditGroup((e) => { const n = { ...e }; delete n[groupId]; return n; }); onUsersChanged(); }
    else msg(res.message || 'Failed to update group.', true);
  }

  async function handleDeleteGroup(groupId) {
    const res = await apiDeleteGroup(token, groupId);
    if (res.ok) { msg('Group deleted.'); setConfirm(null); onUsersChanged(); }
    else msg(res.message || 'Failed to delete group.', true);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="ap-root">
      <div className="ap-header">
        <h1 className="ap-title">👤 Управление пользователями</h1>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['users', 'roles', 'groups'].map((s) => (
            <button key={s}
              className={`ap-btn ${activeSection === s ? 'ap-btn--primary' : 'ap-btn--ghost'}`}
              onClick={() => { setActiveSection(s); msg(''); }}>
              {s === 'users' ? '👤 Пользователи' : s === 'roles' ? '🔑 Роли' : '🏷 Группы'}
            </button>
          ))}
        </div>
      </div>

      {status && (
        <div className={`ap-status${isError ? ' ap-status--error' : ' ap-status--ok'}`}>
          {isError ? '⚠ ' : '✓ '}{status}
        </div>
      )}

      <div className="ap-body">

        {/* ══ USERS ══ */}
        {activeSection === 'users' && (
          <>
            <div className="ap-section">
              <h2 className="ap-section-title">Добавить пользователя</h2>
              <form className="ap-form-col" onSubmit={handleCreateUser}>
                <div className="ap-form-row">
                  <input className="ap-input ap-input--sm" placeholder="Имя пользователя"
                    value={newUser.login}
                    onChange={(e) => setNewUser((u) => ({ ...u, login: e.target.value }))} />
                  <input className="ap-input ap-input--sm" type="password" placeholder="Пароль"
                    value={newUser.password}
                    onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} />
                </div>
                <div className="ap-form-row ap-form-row--wrap">
                  <span className="ap-label" style={{ marginRight: 8 }}>Роли:</span>
                  {roles.map((r) => (
                    <label key={r.id} className="ap-checkbox-label">
                      <input type="checkbox"
                        checked={newUser.roleIds.includes(Number(r.id))}
                        onChange={() => setNewUser((u) => ({ ...u, roleIds: toggleMulti(u.roleIds, r.id) }))}
                      /> {r.name}
                    </label>
                  ))}
                </div>
                <div className="ap-form-row ap-form-row--wrap">
                  <span className="ap-label" style={{ marginRight: 8 }}>Группы:</span>
                  {groups.map((g) => (
                    <label key={g.id} className="ap-checkbox-label">
                      <input type="checkbox"
                        checked={newUser.groupIds.includes(Number(g.id))}
                        onChange={() => setNewUser((u) => ({ ...u, groupIds: toggleMulti(u.groupIds, g.id) }))}
                      /> {g.name}
                    </label>
                  ))}
                </div>
                <button className="ap-btn ap-btn--primary" type="submit">＋ СОЗДАТЬ</button>
              </form>
            </div>

            <div className="ap-section">
              <h2 className="ap-section-title">Пользователи ({users.length})</h2>
              {users.length === 0 && <p className="ap-empty">Нет пользователей…</p>}
              <div className="ap-table">
                {users.map((u) => {
                  const ed = editing[u.id] || {};
                  const curRoleIds  = ed.roleIds  ?? userRoleIds(u.id);
                  const curGroupIds = ed.groupIds ?? userGroupIds(u.id);
                  return (
                    <div className="ap-table-row" key={u.id} style={{ flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="ap-user-ico">◉</span>
                        <strong style={{ color: 'var(--accent)' }}>{u.login}</strong>
                        <span className="ap-hint" style={{ marginLeft: 'auto' }}>ID: {u.id}</span>
                      </div>
                      <div className="ap-form-row ap-form-row--wrap">
                        <span className="ap-label" style={{ marginRight: 8, minWidth: 60 }}>Роли:</span>
                        {roles.map((r) => (
                          <label key={r.id} className="ap-checkbox-label">
                            <input type="checkbox"
                              checked={curRoleIds.includes(Number(r.id))}
                              onChange={() => editUser(u.id, 'roleIds', toggleMulti(curRoleIds, r.id))}
                            /> {r.name}
                          </label>
                        ))}
                        <button className="ap-btn ap-btn--sm ap-btn--secondary"
                          onClick={() => handleAssignRoles(u.id, u.login)}>↑ Роли</button>
                      </div>
                      <div className="ap-form-row ap-form-row--wrap">
                        <span className="ap-label" style={{ marginRight: 8, minWidth: 60 }}>Группы:</span>
                        {groups.map((g) => (
                          <label key={g.id} className="ap-checkbox-label">
                            <input type="checkbox"
                              checked={curGroupIds.includes(Number(g.id))}
                              onChange={() => editUser(u.id, 'groupIds', toggleMulti(curGroupIds, g.id))}
                            /> {g.name}
                          </label>
                        ))}
                        <button className="ap-btn ap-btn--sm ap-btn--secondary"
                          onClick={() => handleAssignGroups(u.id, u.login)}>↑ Группы</button>
                      </div>
                      <div className="ap-form-row">
                        <input className="ap-input ap-input--sm" type="password" placeholder="Новый пароль"
                          value={ed.newPwd || ''}
                          onChange={(e) => editUser(u.id, 'newPwd', e.target.value)} />
                        <button className="ap-btn ap-btn--sm ap-btn--secondary"
                          onClick={() => handleSetPassword(u.id, u.login)}>⟳ Пароль</button>
                        {confirm === `user-${u.id}` ? (
                          <>
                            <span className="ap-confirm-text">Удалить?</span>
                            <button className="ap-btn ap-btn--sm ap-btn--danger"
                              onClick={() => handleDeleteUser(u.id, u.login)}>ДА</button>
                            <button className="ap-btn ap-btn--sm ap-btn--ghost"
                              onClick={() => setConfirm(null)}>НЕТ</button>
                          </>
                        ) : (
                          <button className="ap-btn ap-btn--sm ap-btn--danger"
                            onClick={() => setConfirm(`user-${u.id}`)}>✕ Удалить</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ══ ROLES ══ */}
        {activeSection === 'roles' && (
          <>
            <div className="ap-section">
              <h2 className="ap-section-title">Добавить роль</h2>
              <form className="ap-form-row" onSubmit={handleCreateRole}>
                <input className="ap-input ap-input--sm" placeholder="Название"
                  value={newRole.name}
                  onChange={(e) => setNewRole((r) => ({ ...r, name: e.target.value }))} />
                <input className="ap-input ap-input--sm" placeholder="Описание"
                  value={newRole.description}
                  onChange={(e) => setNewRole((r) => ({ ...r, description: e.target.value }))} />
                <button className="ap-btn ap-btn--primary" type="submit">＋ Создать</button>
              </form>
            </div>
            <div className="ap-section">
              <h2 className="ap-section-title">Роли ({roles.length})</h2>
              <div className="ap-table">
                {roles.map((r) => {
                  const ed = editRole[r.id] || { name: r.name, description: r.description };
                  return (
                    <div className="ap-table-row" key={r.id}>
                      <div className="ap-table-cell" style={{ flex: 1 }}>
                        <input className="ap-input ap-input--sm" value={ed.name}
                          onChange={(e) => setEditRole((prev) => ({ ...prev, [r.id]: { ...ed, name: e.target.value } }))} />
                      </div>
                      <div className="ap-table-cell" style={{ flex: 2 }}>
                        <input className="ap-input ap-input--sm" placeholder="Описание"
                          value={ed.description || ''}
                          onChange={(e) => setEditRole((prev) => ({ ...prev, [r.id]: { ...ed, description: e.target.value } }))} />
                      </div>
                      <div className="ap-table-cell">
                        <button className="ap-btn ap-btn--sm ap-btn--secondary"
                          onClick={() => handleUpdateRole(r.id)}>↑ Сохранить</button>
                        {confirm === `role-${r.id}` ? (
                          <>
                            <button className="ap-btn ap-btn--sm ap-btn--danger"
                              onClick={() => handleDeleteRole(r.id)}>ДА</button>
                            <button className="ap-btn ap-btn--sm ap-btn--ghost"
                              onClick={() => setConfirm(null)}>НЕТ</button>
                          </>
                        ) : (
                          <button className="ap-btn ap-btn--sm ap-btn--danger"
                            onClick={() => setConfirm(`role-${r.id}`)}>✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ══ GROUPS ══ */}
        {activeSection === 'groups' && (
          <>
            <div className="ap-section">
              <h2 className="ap-section-title">Добавить группу</h2>
              <form className="ap-form-row" onSubmit={handleCreateGroup}>
                <input className="ap-input ap-input--sm" placeholder="Название"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup((g) => ({ ...g, name: e.target.value }))} />
                <input className="ap-input ap-input--sm" placeholder="Описание"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((g) => ({ ...g, description: e.target.value }))} />
                <button className="ap-btn ap-btn--primary" type="submit">＋ Создать</button>
              </form>
            </div>
            <div className="ap-section">
              <h2 className="ap-section-title">Группы ({groups.length})</h2>
              <div className="ap-table">
                {groups.map((g) => {
                  const ed = editGroup[g.id] || { name: g.name, description: g.description };
                  return (
                    <div className="ap-table-row" key={g.id}>
                      <div className="ap-table-cell" style={{ flex: 1 }}>
                        <input className="ap-input ap-input--sm" value={ed.name}
                          onChange={(e) => setEditGroup((prev) => ({ ...prev, [g.id]: { ...ed, name: e.target.value } }))} />
                      </div>
                      <div className="ap-table-cell" style={{ flex: 2 }}>
                        <input className="ap-input ap-input--sm" placeholder="Описание"
                          value={ed.description || ''}
                          onChange={(e) => setEditGroup((prev) => ({ ...prev, [g.id]: { ...ed, description: e.target.value } }))} />
                      </div>
                      <div className="ap-table-cell">
                        <button className="ap-btn ap-btn--sm ap-btn--secondary"
                          onClick={() => handleUpdateGroup(g.id)}>↑ Сохранить</button>
                        {confirm === `group-${g.id}` ? (
                          <>
                            <button className="ap-btn ap-btn--sm ap-btn--danger"
                              onClick={() => handleDeleteGroup(g.id)}>ДА</button>
                            <button className="ap-btn ap-btn--sm ap-btn--ghost"
                              onClick={() => setConfirm(null)}>НЕТ</button>
                          </>
                        ) : (
                          <button className="ap-btn ap-btn--sm ap-btn--danger"
                            onClick={() => setConfirm(`group-${g.id}`)}>✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
