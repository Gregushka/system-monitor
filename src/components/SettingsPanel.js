import React, { useState } from 'react';
import { saveSettings } from '../settingsManager';
import { apiSaveSettings } from '../api';
import './css/AdminPanel.css';

const MESSAGE_COLORS = [
  { value: '#ffffff', label: 'White'        },
  { value: '#e0e0e0', label: 'Light Grey'   },
  { value: '#7ec8e3', label: 'Cyan'         },
  { value: '#39ff14', label: 'Green'        },
  { value: '#ffaa00', label: 'Amber'        },
  { value: '#ff4444', label: 'Red'          },
  { value: '#00e676', label: 'Bright Green' },
  { value: '#ff80ab', label: 'Pink'         },
  { value: '#82b1ff', label: 'Blue'         },
  { value: '#ffd740', label: 'Yellow'       },
];

export default function SettingsPanel({ token, settings, onSaved, isAdmin }) {
  const [form,      setForm]      = useState({ ...settings });
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  function change(key, val) { setSaved(false); setSaveError(''); setForm((f) => ({ ...f, [key]: val })); }

  async function handleSave() {
    setSaving(true); setSaveError('');
    const userFields = {
      message_text_size:    form.message_text_size,
      message_text_color:   form.message_text_color,
      message_window_lines: form.message_window_lines,
    };
    const apiResult = await apiSaveSettings(token, userFields).catch(() => ({ ok: false }));
    if (!apiResult.ok) { setSaveError('Failed to save settings to server.'); setSaving(false); return; }
    saveSettings(form);
    setSaved(true); setSaving(false); onSaved(form);
  }

  return (
    <div className="ap-root">
      <div className="ap-header">
        <h1 className="ap-title">⚙ Настройки</h1>
        <p className="ap-subtitle">Персональные настройки автоматически синхронизируются с сервером.</p>
      </div>
      {saveError && <div className="ap-status ap-status--error">⚠ {saveError}</div>}
      <div className="ap-body">
        <div className="ap-section">
          <h2 className="ap-section-title">Окно сообщений</h2>
          <div className="ap-field">
            <label className="ap-label">Размер текста (px)</label>
            <input className="ap-input" type="number" min={10} max={100} step={1}
              value={form.message_text_size}
              onChange={(e) => change('message_text_size', Number(e.target.value))} />
            <span className="ap-hint">Размер шрифта сообщений (10–100 px)</span>
          </div>
          <div className="ap-field">
            <label className="ap-label">Цвет текста</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select className="ap-select" value={form.message_text_color}
                onChange={(e) => change('message_text_color', e.target.value)}>
                {MESSAGE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <span style={{ display: 'inline-block', width: 24, height: 24,
                background: form.message_text_color, border: '1px solid #333',
                borderRadius: 3, flexShrink: 0 }} />
            </div>
            <span className="ap-hint">Цвет основного текста сообщений</span>
          </div>
          <div className="ap-field">
            <label className="ap-label">Размер окна (строк)</label>
            <input className="ap-input" type="number" min={1} max={200} step={1}
              value={form.message_window_lines}
              onChange={(e) => change('message_window_lines', Number(e.target.value))} />
            <span className="ap-hint">Количество видимых строк в буфере сообщений (1–200)</span>
          </div>
        </div>
        {isAdmin && (
          <div className="ap-section">
            <h2 className="ap-section-title">Системные настройки</h2>
            <div className="ap-field">
              <label className="ap-label">Интервал опроса (мс)</label>
              <input className="ap-input" type="number" min={0} step={500}
                value={form.enq_freq}
                onChange={(e) => change('enq_freq', Number(e.target.value))} />
              <span className="ap-hint">0 = использовать случайные тестовые данные</span>
            </div>
            <div className="ap-field">
              <label className="ap-label">Размер текста вкладок (px)</label>
              <input className="ap-input" type="number" min={8} max={24} step={1}
                value={form.tab_text_size}
                onChange={(e) => change('tab_text_size', Number(e.target.value))} />
            </div>
          </div>
        )}
        <div className="ap-actions">
          <button className="ap-btn ap-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ СОХРАНЕНИЕ…' : '💾 СОХРАНИТЬ'}
          </button>
          {saved && <span className="ap-saved">✓ Настройки сохранены</span>}
        </div>
      </div>
    </div>
  );
}
