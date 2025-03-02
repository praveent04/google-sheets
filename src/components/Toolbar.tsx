import React from 'react';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  Trash2, 
  Search,
  FileText,
  ChevronDown
} from 'lucide-react';

interface ToolbarProps {
  onFormat: (format: string) => void;
  onRemoveDuplicates: () => void;
  onShowFindReplace: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onFormat, 
  onRemoveDuplicates,
  onShowFindReplace
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={() => onFormat('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          className="toolbar-button"
          onClick={() => onFormat('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={() => onFormat('alignLeft')}
          title="Align left"
        >
          <AlignLeft size={16} />
        </button>
        <button 
          className="toolbar-button"
          onClick={() => onFormat('alignCenter')}
          title="Align center"
        >
          <AlignCenter size={16} />
        </button>
        <button 
          className="toolbar-button"
          onClick={() => onFormat('alignRight')}
          title="Align right"
        >
          <AlignRight size={16} />
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button"
          onClick={onRemoveDuplicates}
          title="Remove duplicates"
        >
          <Trash2 size={16} />
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Remove Duplicates</span>
        </button>
        
        <button 
          className="toolbar-button"
          onClick={onShowFindReplace}
          title="Find and replace"
        >
          <Search size={16} />
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Find & Replace</span>
        </button>
      </div>
      
      <div className="toolbar-divider"></div>
      
      <div className="toolbar-group">
        <div style={{ fontSize: '12px', color: '#5f6368', marginRight: '8px' }}>Functions:</div>
        <select 
          style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: '1px solid #dadce0',
            fontSize: '12px'
          }}
        >
          <optgroup label="Mathematical">
            <option value="sum">SUM</option>
            <option value="average">AVERAGE</option>
            <option value="max">MAX</option>
            <option value="min">MIN</option>
            <option value="count">COUNT</option>
          </optgroup>
          <optgroup label="Data Quality">
            <option value="trim">TRIM</option>
            <option value="upper">UPPER</option>
            <option value="lower">LOWER</option>
          </optgroup>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;