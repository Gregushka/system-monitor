// ─── API Configuration ────────────────────────────────────────────────────────
export const API_BASE = 'https://perelandra.ru/scada/sysmon/';

// ─── Crypto helpers ───────────────────────────────────────────────────────────
/**
 * SHA-256 hash compatible with PHP's password_verify when the backend
 * stores sha256 hashes (as demonstrated by the API example).
 * Returns lowercase hex string.
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Internal fetch wrapper ───────────────────────────────────────────────────
async function apiFetch(path, { method = 'GET', token = null, body = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Auth-Token'] = token;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  // Capture auth token from login response header
  const newToken = res.headers.get('X-Auth-Token');
  const data = await res.json().catch(() => ({}));

  return { data, token: newToken, status: res.status, ok: res.ok };
}

// ─── Authentication ───────────────────────────────────────────────────────────
/**
 * Login: GET /auth?login={username}&password={sha256_hash}
 * Returns { ok, code, message, user, role, token }
 */
export async function apiLogin(username, password) {
  const hash = await sha256(password);
/**  
 console.log('Password:', password);
  console.log('Hash:', hash);
  throw new Error(`Debug - Script terminated. Password: ${password}, Hash: ${hash}`);  
  */
  
  
  const { data, token, ok } = await apiFetch(
    `auth?login=${encodeURIComponent(username)}&password=${hash}`
  );
  return {
    ok: ok && data.code === 0,
    code: data.code,
    message: data.message,
    user: data.data?.user || null,
    role: data.data?.role || null,
    token: token || null,
  };
}

// ─── Sensor endpoints ─────────────────────────────────────────────────────────
/** GET /sensor  →  array of sensor objects */
export async function apiGetSensors(token) {
  const { data, ok } = await apiFetch('sensor', { token });
  return ok ? (Array.isArray(data) ? data : [data]) : [];
}

/** GET /sensor/{id} */
export async function apiGetSensor(token, id) {
  const { data, ok } = await apiFetch(`sensor/${id}`, { token });
  return ok ? data : null;
}

/** GET /sensor_roles  →  array with role names in permissions */
export async function apiGetSensorRoles(token) {
  const { data, ok } = await apiFetch('sensor_roles', { token });
  return ok ? (Array.isArray(data) ? data : [data]) : [];
}

/** GET /sensor_roles/{id} */
export async function apiGetSensorRolesById(token, id) {
  const { data, ok } = await apiFetch(`sensor_roles/${id}`, { token });
  return ok ? data : null;
}

/**
 * POST /sensor/{id}/update  — update sensor permissions
 * permissions: { create:[role_ids], read:[role_ids], update:[role_ids], delete:[role_ids] }
 */
export async function apiUpdateSensorPermissions(token, id, permissions) {
  const { data, ok } = await apiFetch(`sensor/${id}/update`, {
    method: 'POST',
    token,
    body: { id, permissions },
  });
  return { ok: ok && data.code === 0, message: data.message };
}

// ─── Data polling ─────────────────────────────────────────────────────────────
/**
 * GET /read_data
 * Returns { hdr: { bg_id, status, status_text }, data: [{ ts, name, value }] }
 */
export async function apiReadData(token) {
  const { data, ok } = await apiFetch('read_data', { token });
  return ok ? data : null;
}

// ─── Role endpoints ───────────────────────────────────────────────────────────
/** GET /role  →  array of all roles */
export async function apiGetRoles(token) {
  const { data, ok } = await apiFetch('role', { token });
  return ok ? (Array.isArray(data) ? data : [data]) : [];
}

/** GET /role/{id} */
export async function apiGetRole(token, id) {
  const { data, ok } = await apiFetch(`role/${id}`, { token });
  return ok ? data : null;
}

// ─── User management (Admin/Almighty only) ────────────────────────────────────
/**
 * GET /user  →  array of all users
 * (Extended endpoint not in original doc – assumed to exist following API pattern)
 */
export async function apiGetUsers(token) {
  const { data, ok } = await apiFetch('user', { token });
  return ok ? (Array.isArray(data) ? data : [data]) : [];
}

/**
 * POST /user_create
 * body: { login, password (sha256), role_id }
 */
export async function apiCreateUser(token, login, password, role_id) {
  const hash = await sha256(password);
  const { data, ok } = await apiFetch('user_create', {
    method: 'POST',
    token,
    body: { login, password: hash, role_id },
  });
  return { ok: ok && data.code === 0, message: data.message };
}

/**
 * POST /user_delete
 * body: { login }
 */
export async function apiDeleteUser(token, login) {
  const { data, ok } = await apiFetch('user_delete', {
    method: 'POST',
    token,
    body: { login },
  });
  return { ok: ok && data.code === 0, message: data.message };
}

/**
 * POST /password_set
 * body: { login, password (sha256) }
 */
export async function apiSetPassword(token, login, password) {
  const hash = await sha256(password);
  const { data, ok } = await apiFetch('password_set', {
    method: 'POST',
    token,
    body: { login, password: hash },
  });
  return { ok: ok && data.code === 0, message: data.message };
}

/**
 * POST /user_update  (extended endpoint – update user role)
 * body: { login, role_id }
 */
export async function apiUpdateUser(token, login, role_id) {
  const { data, ok } = await apiFetch('user_update', {
    method: 'POST',
    token,
    body: { login, role_id },
  });
  return { ok: ok && data.code === 0, message: data.message };
}
