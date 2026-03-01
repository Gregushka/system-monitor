import React, { useState, useEffect } from 'react';
import { apiGetSensorRoles, apiUpdateSensorPermissions } from '../api';
import './css/AdminPanel.css';

/**
 * SensorsPanel  –  Sensor permission management (Almighty only)
 *
 * Displays a tree:
 *   Role
 *     └─ sensor ind_id  (description)
 *           ☐ read  ☐ write  ☐ update  ☐ delete
 *
 * Props:
 *   token             {string}
 *   sensors           [{id, ind_id, name, description, permissions: {create,read,update,delete: [role_ids]}}]
 *   roles             [{id, role_name, role_description}]
 *   onSensorsChanged  fn()
 */
export default function SensorsPanel({ token, sensors, roles, onSensorsChanged }) {
  const [sensorRoles, setSensorRoles] = useState([]);
  const [perms, setPerms]             = useState({});    // { [sensor_id]: { create, read, update, delete: Set<role_id> } }
  const [status, setStatus]           = useState('');
  const [isError, setIsError]         = useState(false);
  const [dirty, setDirty]             = useState({});    // { [sensor_id]: true }

  useEffect(() => {
    apiGetSensorRoles(token).then((data) => {
      setSensorRoles(data);
      // Build initial perms map
      const p = {};
      data.forEach((s) => {
        p[s.id] = {
          create: new Set(s.permissions?.create || []),
          read:   new Set(s.permissions?.read   || []),
          update: new Set(s.permissions?.update || []),
          delete: new Set(s.permissions?.delete || []),
        };
      });
      setPerms(p);
    });
  }, [token, sensors]);

  function msg(text, err = false) { setStatus(text); setIsError(err); }

  function togglePerm(sensorId, action, roleId) {
    setPerms((prev) => {
      const sp = { ...prev };
      const set = new Set(sp[sensorId]?.[action] || []);
      if (set.has(roleId)) set.delete(roleId);
      else set.add(roleId);
      sp[sensorId] = { ...sp[sensorId], [action]: set };
      return sp;
    });
    setDirty((d) => ({ ...d, [sensorId]: true }));
  }

  async function saveSensor(sensorId) {
    const p = perms[sensorId];
    if (!p) return;
    const payload = {
      create: [...p.create],
      read:   [...p.read],
      update: [...p.update],
      delete: [...p.delete],
    };
    const res = await apiUpdateSensorPermissions(token, sensorId, payload);
    if (res.ok) {
      msg(`Sensor #${sensorId} permissions updated.`);
      setDirty((d) => { const dd = { ...d }; delete dd[sensorId]; return dd; });
      onSensorsChanged();
    } else {
      msg(res.message || 'Failed to update permissions.', true);
    }
  }

  const ACTIONS = ['read', 'create', 'update', 'delete'];

  return (
    <div className="ap-root">
      <div className="ap-header">
        <h1 className="ap-title">📡 Sensor Permissions</h1>
        <p className="ap-subtitle">
          Manage per-role access for every sensor. Changes must be saved individually.
        </p>
      </div>

      {status && (
        <div className={`ap-status${isError ? ' ap-status--error' : ' ap-status--ok'}`}>
          {isError ? '⚠ ' : '✓ '}{status}
        </div>
      )}

      {/* ── Tree: Role → Sensors → Permissions ── */}
      <div className="ap-body ap-sensors-body">
        {sensorRoles.length === 0 && (
          <p className="ap-empty">No sensors found or loading…</p>
        )}

        {/* Flat list grouped by sensor, showing all roles as columns */}
        <div className="sensors-grid">
          {/* Header */}
          <div className="sensors-grid-header">
            <span className="sg-col sg-col--name">Sensor / ind_id</span>
            {ACTIONS.map((a) => (
              <span key={a} className="sg-col sg-col--action">{a.toUpperCase()}</span>
            ))}
            <span className="sg-col sg-col--save" />
          </div>

          {sensorRoles.map((s) => (
            <React.Fragment key={s.id}>
              {/* Sensor header row */}
              <div className="sg-sensor-header">
                <span className="sg-sensor-id">{s.ind_id}</span>
                <span className="sg-sensor-name">{s.name}</span>
              </div>

              {/* One row per role */}
              {roles.map((role) => {
                const sp = perms[s.id] || {};
                return (
                  <div className="sg-role-row" key={role.id}>
                    <span className="sg-col sg-col--name sg-role-name">{role.role_name}</span>
                    {ACTIONS.map((action) => (
                      <span key={action} className="sg-col sg-col--action">
                        <input
                          type="checkbox"
                          className="sg-checkbox"
                          checked={sp[action]?.has(role.id) ?? false}
                          onChange={() => togglePerm(s.id, action, role.id)}
                        />
                      </span>
                    ))}
                    {/* Save button only on last role row */}
                    <span className="sg-col sg-col--save">
                      {role.id === roles[roles.length - 1]?.id && dirty[s.id] && (
                        <button
                          className="ap-btn ap-btn--sm ap-btn--primary"
                          onClick={() => saveSensor(s.id)}
                        >
                          ↑ SAVE
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
