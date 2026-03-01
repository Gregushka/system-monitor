import React, { useEffect, useRef } from 'react';
import './css/FooterPanel.css';
import RoundStatusIndicator from './RoundStatusIndicator';

/**
 * FooterPanel  –  always visible lower 25% of screen
 *
 * Props:
 *   messages     [{id, text, color, size}]
 *   status       {number}  0=OK, 1=warning, 2=alarm
 *   statusText   {string}
 *   msgTextSize  {number}  px
 */
export default function FooterPanel({ messages = [], status = 0, statusText = '—', msgTextSize = 13 }) {
  const listRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="footer-root">
      {/* ── Status lamp ── */}
      <div className="footer-lamp-col">
        <RoundStatusIndicator status={status} text={statusText} />
      </div>

      {/* ── Vertical divider ── */}
      <div className="footer-divider" />

      {/* ── Message log ── */}
      <div className="footer-log" ref={listRef}>
        {messages.length === 0 && (
          <span className="footer-log-empty">Waiting for data…</span>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="footer-msg"
            style={{ color: msg.color || '#8899aa', fontSize: msg.size || msgTextSize }}
          >
            <span className="footer-msg-arrow">▶</span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
