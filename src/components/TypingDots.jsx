import React from 'react';

function TypingDots({ className = '' }) {
  return (
    <div className={`typing-bubble ${className}`} aria-label="Sally is typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

export default TypingDots;

