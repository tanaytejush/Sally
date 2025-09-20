import React from 'react';

function Toast({ items, onClose }) {
  if (!items?.length) return null;
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.type || 'info'}`}>
          <span>{t.text}</span>
          <button className="toast-close" onClick={() => onClose?.(t.id)} aria-label="Close">×</button>
        </div>
      ))}
    </div>
  );
}

export default Toast;

