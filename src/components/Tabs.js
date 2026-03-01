import React from 'react';
import './css/Tabs.css';

/**
 * Tabs
 * Props:
 *   tabs        [{id, label, type}]
 *   activeTab   {string}
 *   onSelect    fn(id)
 *   tabTextSize {number}  px
 *   user        {object}  user info from session
 *   onLogout    fn()
 */
export default function Tabs({ tabs, activeTab, onSelect, tabTextSize = 13, user, onLogout }) {
  return (
    <div className="tabs-bar">
      <div className="tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn tab-btn--${tab.type}${activeTab === tab.id ? ' tab-btn--active' : ''}`}
            style={{ fontSize: tabTextSize }}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tabs-user">
        {user && (
          <>
            <span className="tabs-user-name">
              <span className="tabs-user-ico">◉</span>
              {user.login}
            </span>
            <button className="tabs-logout-btn" onClick={onLogout}>
              ⏻ LOGOUT
            </button>
          </>
        )}
      </div>
    </div>
  );
}
