import React from 'react';
import RelationshipToggle from './RelationshipToggle.jsx';
import Aura from './Aura.jsx';

function Header({ role, onChangeRole, thinking = false, onOpenProfile, onTestConnection, auraVariant = 'default', activeName = '', theme = 'light', onToggleTheme }) {
  const firstLetter = String(activeName || '').trim().slice(0, 1).toUpperCase();
  const badgeLetter = firstLetter || 'U';
  return (
    <header className="header">
      <div className="header-left">
        <div className="avatar-wrap">
          <Aura className="avatar-aura" size={56} animated={thinking} variant={auraVariant} />
        </div>
        <div className="title-wrap">
          <h1 className="title">Sally is here to listen and support you.</h1>
        </div>
      </div>
      <div className="header-actions">
        <RelationshipToggle value={role} onChange={onChangeRole} />
        <button
          className="test-btn"
          onClick={onTestConnection}
          aria-label={`Test connection${activeName ? ` for ${activeName}` : ''}`}
        >
          <span className="btn-label">
            <span className="btn-text">Test</span>
          </span>
        </button>
        <button
          className="theme-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          title={`${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            // Sun icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          ) : (
            // Moon icon
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8Z" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
          )}
        </button>
        <button
          className="profile-btn user-badge-btn"
          onClick={onOpenProfile}
          aria-label={`Open profile settings${activeName ? ` for ${activeName}` : ''}`}
          title={activeName || 'Profile settings'}
        >
          {badgeLetter}
        </button>
      </div>
    </header>
  );
}

export default Header;
