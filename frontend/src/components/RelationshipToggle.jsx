import React from 'react';

const OPTIONS = ['Brother', 'Sister', 'Husband', 'Wife', 'Girlfriend', 'Boyfriend'];

function RelationshipToggle({ value, onChange }) {
  return (
    <div className="toggle" role="tablist" aria-label="Relationship mode">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          role="tab"
          aria-selected={value === opt}
          className={`toggle-btn ${value === opt ? 'active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default RelationshipToggle;
