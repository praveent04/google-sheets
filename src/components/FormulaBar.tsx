import React from 'react';

interface FormulaBarProps {
  value: string;
  onChange: (value: string) => void;
  activeCell: string | null;
}

const FormulaBar: React.FC<FormulaBarProps> = ({ value, onChange, activeCell }) => {
  return (
    <div className="formula-bar">
      <div className="formula-bar-cell">{activeCell || ''}</div>
      <input
        className="formula-bar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter a value or formula starting with ="
      />
    </div>
  );
};

export default FormulaBar;