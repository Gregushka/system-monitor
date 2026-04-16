export const API_BASE = process.env.REACT_APP_API_BASE || '/sysmon-api/v1';

export async function sha256(message) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function apiFetch(path, { method = 'GET', token = null, body = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Auth-Token'] = token;
  const opts = { method, headers };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}/${path}`, opts);
  const newToken = res.headers.get('X-Auth-Token');
  const data = await res.json().catch(() => ({}));
  return { data, token: newToken, status: res.status, ok: res.ok };
}

export async function apiLogin(username, password) {
  const hash = await sha256(password);
  const { data, token: headerToken, ok } = await apiFetch(
    `auth?login=${encodeURIComponent(username)}&password=${hash}`
  );
  const success  = ok && data?.auth?.code === 0;
  const authData = data?.auth?.data || {};
  const resolvedToken = headerToken || authData?.user?.last_token || null;
  return {
    ok:      success,
    code:    data?.auth?.code,
    message: data?.auth?.message,
    user:    authData.user || null,
    role:    authData.role || null,
    token:   resolvedToken,
    screens: data?.data?.screens || [],
    hdr:     data?.data?.hdr     || {},
  };
}

export async function apiReadData(token, screenId = null) {
  const path = screenId != null ? `data/${screenId}` : 'data';
  const { data, ok } = await apiFetch(path, { token });
  if (!ok) return null;
  return {
    hdr:        data?.data?.hdr || {},
    indicators: data?.data?.indicators || {},
  };
}

export async function apiGetSettings(token) {
  const { data, ok } = await apiFetch('settings', { token });
  return ok ? (data?.settings || {}) : {};
}

export async function apiSaveSettings(token, settings) {
  const { data, ok } = await apiFetch('settings', { method: 'POST', token, body: settings });
  return { ok: ok && data?.status_code === 0, settings: data?.settings || {} };
}

export async function apiGetUsers(token) {
  const { data, ok } = await apiFetch('users', { token });
  return ok ? { users: data?.users || [], roles: data?.roles || [], groups: data?.groups || [] }
            : { users: [], roles: [], groups: [] };
}

export async function apiCreateUser(token, { login, password, roles = [], groups = [] }) {
  const hash = await sha256(password);
  const { data, ok } = await apiFetch('users', {
    method: 'POST', token, body: { login, password: hash, roles, groups },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message, user: data?.user || null };
}

export async function apiUpdateUser(token, userId, { login, password } = {}) {
  const body = {};
  if (login    !== undefined) body.login    = login;
  if (password !== undefined) body.password = await sha256(password);
  const { data, ok } = await apiFetch(`users/${userId}`, { method: 'PUT', token, body });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiDeleteUser(token, userId) {
  const { data, ok } = await apiFetch(`users/${userId}`, { method: 'DELETE', token });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiAssignRoles(token, userId, roleIds) {
  const { data, ok } = await apiFetch(`users/${userId}/roles`, {
    method: 'POST', token, body: { roles: roleIds },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiAssignGroups(token, userId, groupIds) {
  const { data, ok } = await apiFetch(`users/${userId}/groups`, {
    method: 'POST', token, body: { groups: groupIds },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiGetRoles(token) {
  const { data, ok } = await apiFetch('roles', { token });
  return ok ? (data?.roles || []) : [];
}

export async function apiCreateRole(token, { name, description = '' }) {
  const { data, ok } = await apiFetch('roles', {
    method: 'POST', token, body: { name, description },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiUpdateRole(token, roleId, { name, description }) {
  const { data, ok } = await apiFetch(`roles/${roleId}`, {
    method: 'PUT', token, body: { name, description },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiDeleteRole(token, roleId) {
  const { data, ok } = await apiFetch(`roles/${roleId}`, { method: 'DELETE', token });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiGetGroups(token) {
  const { data, ok } = await apiFetch('groups', { token });
  return ok ? (data?.groups || []) : [];
}

export async function apiCreateGroup(token, { name, description = '' }) {
  const { data, ok } = await apiFetch('groups', {
    method: 'POST', token, body: { name, description },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiUpdateGroup(token, groupId, { name, description }) {
  const { data, ok } = await apiFetch(`groups/${groupId}`, {
    method: 'PUT', token, body: { name, description },
  });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiDeleteGroup(token, groupId) {
  const { data, ok } = await apiFetch(`groups/${groupId}`, { method: 'DELETE', token });
  return { ok: ok && data?.status_code === 0, message: data?.message };
}

export async function apiSetPosition(token, indId, { ind_id, screen, aggregate, top, left }) {
  const { data, ok } = await apiFetch(`position/${encodeURIComponent(indId)}`, {
    method: 'POST', token, body: { ind_id, screen, aggregate, top, left },
  });
  return { ok: ok && data?.status_code === 0, message: data?.status_text, data };
}
