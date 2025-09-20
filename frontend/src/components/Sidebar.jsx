import React from 'react';

function Sidebar({ sessions = [], currentId, onSelect, onClearChat, onNewChat, onRename, onDelete, aura = 'default', onCycleAura }) {
  return (
    <aside className="sidebar" aria-label="Chat sessions">
      <div className="sidebar-header">
        <button className="clear-btn" onClick={onClearChat} aria-label="Clear current chat messages">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 7h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M10 3h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <rect x="6" y="7" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
          </svg>
          <span>Clear Chat</span>
        </button>
        <button className="new-btn" onClick={onNewChat} aria-label="Start a new chat session">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span>New Chat</span>
        </button>
      </div>
      <div className="sidebar-subheader">
        <button className="aura-btn" onClick={onCycleAura} aria-label="Cycle aura intensity">
          <span className="aura-indicator" data-variant={aura} aria-hidden="true" />
          <span className="aura-label">Aura: {aura === 'calm' ? 'Calm' : aura === 'vivid' ? 'Vivid' : 'Default'}</span>
        </button>
      </div>
      <div className="sidebar-section-label">Recent Sessions</div>
      <ul className="session-list" role="listbox" aria-label="Recent chat sessions">
        {sessions.map((s) => (
          <li key={s.id}>
            <div className={`session-item-wrap ${currentId === s.id ? 'active' : ''}`}>
              <button
                className={`session-item`}
                role="option"
                aria-selected={currentId === s.id}
                onClick={() => onSelect?.(s.id)}
              >
                <div className="session-name">{s.userDisplayName || 'You'}</div>
                <div className="session-meta">{new Date(s.updatedAt || s.createdAt).toLocaleString()}</div>
              </button>
              <div className="session-actions">
                <button
                  className="icon-btn"
                  aria-label="Rename session"
                  title="Rename session"
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = window.prompt('Set a name for this session (e.g., your username for it):', s.userDisplayName || '');
                    if (name != null) onRename?.(s.id, name.trim());
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M14.06 6.19l3.75 3.75L20.5 7.25 16.75 3.5 14.06 6.19Z" stroke="currentColor" strokeWidth="1.6"/>
                  </svg>
                </button>
                <button
                  className="icon-btn danger"
                  aria-label="Delete session"
                  title="Delete session"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this session? This cannot be undone.')) onDelete?.(s.id);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4 7h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    <rect x="6" y="7" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </li>
        ))}
        {sessions.length === 0 && (
          <li className="session-empty">No sessions yet</li>
        )}
      </ul>
    </aside>
  );
}

export default Sidebar;
