import React, { useState, useMemo } from 'react';
import { getIndicatorsForBg } from '../indicatorRegistry';
import { apiSetPosition } from '../api';
import './css/PositioningPanel.css';

export default function PositioningPanel({ token, background, onTry, onSaved }) {
  const indicators = useMemo(() => getIndicatorsForBg(background.id), [background.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedKey, setSelectedKey] = useState('');
  const [top,         setTop]         = useState('');
  const [left,        setLeft]        = useState('');
  const [status,      setStatus]      = useState('');
  const [isError,     setIsError]     = useState(false);
  const [saving,      setSaving]      = useState(false);

  const selected = indicators.find((i) => i._key === selectedKey) || null;

  function handleSelect(key) {
    setSelectedKey(key);
    const ind = indicators.find((i) => i._key === key);
    if (ind) { setTop(String(ind.top ?? 0)); setLeft(String(ind.left ?? 0)); }
    setStatus('');
  }

  function handleTry() {
    if (!selected) return;
    const t = Math.max(0, Math.min(1440, Number(top)  || 0));
    const l = Math.max(0, Math.min(2560, Number(left) || 0));
    onTry(selected.ind_id, t, l);
    setStatus(`Preview: top=${t}, left=${l}`); setIsError(false);
  }

  async function handleSave() {
    if (!selected) return;
    const t = Math.max(0, Math.min(1440, Number(top)  || 0));
    const l = Math.max(0, Math.min(2560, Number(left) || 0));
    setSaving(true);
    const res = await apiSetPosition(token, selected.ind_id, {
      ind_id:    selected.ind_id,
      screen:    selected.screen    || background.screenName || background.label,
      aggregate: selected.aggregate || '',
      top: t, left: l,
    });
    setSaving(false);
    if (res.ok) { setStatus(`Saved: ${selected.ind_id} → top=${t}, left=${l}`); setIsError(false); onSaved(selected.ind_id); }
    else { setStatus(res.message || 'Save failed.'); setIsError(true); }
  }

  return (
    <div className="pos-panel">
      <div className="pos-panel-title">📐 Позиционирование</div>
      <div className="pos-field">
        <label className="pos-label">Индикатор</label>
        <select className="pos-select" value={selectedKey} onChange={(e) => handleSelect(e.target.value)}>
          <option value="">— выбрать —</option>
          {indicators.map((ind) => (
            <option key={ind._key} value={ind._key}>
              {ind.ind_id}{ind.label ? ` (${ind.label})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="pos-coords">
        <div className="pos-field">
          <label className="pos-label">Top (0–1440)</label>
          <input className="pos-input" type="number" min={0} max={1440} step={1}
            value={top} onChange={(e) => setTop(e.target.value)} disabled={!selected} />
        </div>
        <div className="pos-field">
          <label className="pos-label">Left (0–2560)</label>
          <input className="pos-input" type="number" min={0} max={2560} step={1}
            value={left} onChange={(e) => setLeft(e.target.value)} disabled={!selected} />
        </div>
      </div>
      <div className="pos-actions">
        <button className="pos-btn pos-btn--try" onClick={handleTry} disabled={!selected}>▶ Прим.</button>
        <button className="pos-btn pos-btn--save" onClick={handleSave} disabled={!selected || saving}>
          {saving ? '⏳' : '💾 Сохр.'}
        </button>
      </div>
      {status && <div className={`pos-status${isError ? ' pos-status--error' : ''}`}>{status}</div>}
    </div>
  );
}
