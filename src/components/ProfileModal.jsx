import React, { useEffect, useState } from 'react';

function ProfileModal({ open, onClose, value, onSave }) {
  const [name, setName] = useState(value?.name || '');
  const [mode, setMode] = useState(value?.mode || 'first');
  const [nickname, setNickname] = useState(value?.nickname || '');

  useEffect(() => {
    if (open) {
      setName(value?.name || '');
      setMode(value?.mode || 'first');
      setNickname(value?.nickname || '');
    }
  }, [open]);

  if (!open) return null;

  const save = () => {
    onSave({ name, mode, nickname });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Profile settings">
      <div className="modal">
        <div className="modal-header">
          <h2>Profile Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <label className="field">
            <div className="label">Your Name</div>
            <input
              className="text-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex Rivera"
            />
          </label>
          <div className="label" style={{marginTop:12}}>How should Sally address you?</div>
          <div className="radio-group">
            <label className="radio">
              <input type="radio" name="name-mode" checked={mode==='first'} onChange={() => setMode('first')} />
              <span>First name only</span>
            </label>
            <label className="radio">
              <input type="radio" name="name-mode" checked={mode==='full'} onChange={() => setMode('full')} />
              <span>Full name</span>
            </label>
            <label className="radio">
              <input type="radio" name="name-mode" checked={mode==='custom'} onChange={() => setMode('custom')} />
              <span>Custom nickname</span>
            </label>
          </div>
          {mode === 'custom' && (
            <label className="field" style={{marginTop:8}}>
              <div className="label">Nickname</div>
              <input
                className="text-input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., Lex"
              />
            </label>
          )}

          {/* Background animation is always on now for a cohesive experience */}
        </div>
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
