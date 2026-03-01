import React, { useState } from 'react';
import { saveSettings } from '../settingsManager';
import './css/AdminPanel.css';

/**
 * SettingsPanel  –  accessible to Admin and Almighty roles only
 *
 * Props:
 *   settings  {object}   current settings from loadSettings()
 *   onSaved   fn()       called after settings are persisted
 *   isAdmin   {boolean}
 */
export default function SettingsPanel({ settings, onSaved, isAdmin }) {
  const [form, setForm]   = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  if (!isAdmin) {
    return (
      <div className="ap-root">
        <div className="ap-restricted">
          <span style={{ fontSize: 28 }}>⛔</span>
          <p>Settings are accessible to Admin / Almighty roles only.</p>
        </div>
      </div>
    );
  }

  function change(key, val) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSave() {
    saveSettings(form);
    setSaved(true);
    onSaved();
  }

  const fields = [
    {
      key:   'enq_freq',
      label: 'Polling Interval (ms)',
      hint:  'Set to 0 to use randomly generated mock data instead of live API',
      type:  'number',
      min:   0,
      step:  500,
    },
    {
      key:   'message_text_size',
      label: 'Footer Message Text Size (px)',
      hint:  'Font size for messages in the footer log area',
      type:  'number',
      min:   8,
      max:   32,
      step:  1,
    },
    {
      key:   'tab_text_size',
      label: 'Tab Text Size (px)',
      hint:  'Font size for tab labels at the top of the screen',
      type:  'number',
      min:   8,
      max:   24,
      step:  1,
    },
  ];

  return (
    <div className="ap-root">
      <div className="ap-header">
        <h1 className="ap-title">⚙ System Settings</h1>
        <p className="ap-subtitle">Changes are applied immediately and persist across power cycles.</p>
      </div>

      <div className="ap-body">
        <div className="ap-section">
          {fields.map((f) => (
            <div className="ap-field" key={f.key}>
              <label className="ap-label">{f.label}</label>
              <input
                className="ap-input"
                type={f.type}
                min={f.min}
                max={f.max}
                step={f.step}
                value={form[f.key]}
                onChange={(e) =>
                  change(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)
                }
              />
              <span className="ap-hint">{f.hint}</span>
            </div>
          ))}
        </div>

        <div className="ap-actions">
          <button className="ap-btn ap-btn--primary" onClick={handleSave}>
            💾 SAVE &amp; APPLY
          </button>
          {saved && <span className="ap-saved">✓ Settings saved</span>}
        </div>

        <div className="ap-section ap-section--info">
          <div className="ap-info-row">
            <span className="ap-info-key">MOCK DATA</span>
            <span className="ap-info-val">{form.enq_freq === 0 ? 'ACTIVE (enq_freq = 0)' : 'OFF'}</span>
          </div>
          <div className="ap-info-row">
            <span className="ap-info-key">STORAGE</span>
            <span className="ap-info-val">localStorage (browser persistent)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
