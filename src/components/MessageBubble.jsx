import React from 'react';
import Aura from './Aura.jsx';

function MessageBubble({ sender, kind, children, onRetry, auraVariant = 'default' }) {
  const isSally = sender === 'sally';
  const side = isSally ? 'sally' : 'user';
  const type = kind ? ` ${kind}` : '';
  return (
    <div className={`msg ${side}`}>
      {isSally && (
        <div className="avatar-col" aria-hidden="true">
          <Aura size={44} variant={auraVariant} />
        </div>
      )}
      <div className={`bubble ${side}${type}`}>
        <span>{children}</span>
        {kind === 'error' && onRetry && (
          <span className="retry">
            <button onClick={onRetry} aria-label="Retry sending message">Retry</button>
          </span>
        )}
      </div>
      {!isSally && <div className="avatar-col spacer" aria-hidden="true" />}
    </div>
  );
}

export default MessageBubble;
