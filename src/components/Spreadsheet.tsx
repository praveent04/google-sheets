import React, { useState, useRef, useEffect } from 'react';

interface SpreadsheetProps {
  cellData: Record<string, any>;
  activeCell: string | null;
  setActiveCell: (cellId: string | null) => void;
  onCellChange: (cellId: string, value: string, isFormula?: boolean) => void;
  selectedRange: string[];
  setSelectedRange: (range: string[]) => void;
}

const Spreadsheet: React.FC<SpreadsheetProps> = ({
  cellData,
  activeCell,
  setActiveCell,
  onCellChange,
  selectedRange,
  setSelectedRange
}) => {
  const [rows, setRows] = useState(30);
  const [columns, setColumns] = useState(15);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  
  // Generate column headers (A, B, C, ...)
  const getColumnLabel = (index: number): string => {
    let label = '';
    while (index >= 0) {
      label = String.fromCharCode(65 + (index % 26)) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  };
  
  // Handle cell click
  const handleCellClick = (cellId: string, event: React.MouseEvent) => {
    if (isResizing) return;
    
    if (event.shiftKey && activeCell) {
      // Handle range selection with shift key
      const range = getCellRange(activeCell, cellId);
      setSelectedRange(range);
    } else {
      setActiveCell(cellId);
      setSelectedRange([cellId]);
    }
    
    // Start editing on double click
    if (event.detail === 2) {
      startEditing(cellId);
    }
  };
  
  // Get all cells in a range between two cells
  const getCellRange = (start: string, end: string): string[] => {
    const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
    const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
    const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
    const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
    
    const startColIndex = colToIndex(startCol);
    const endColIndex = colToIndex(endCol);
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);
    
    const range: string[] = [];
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        range.push(`${indexToCol(col)}${row}`);
      }
    }
    
    return range;
  };
  
  const colToIndex = (col: string): number => {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + col.charCodeAt(i) - 64;
    }
    return index;
  };
  
  const indexToCol = (index: number): string => {
    let col = '';
    while (index > 0) {
      const remainder = (index - 1) % 26;
      col = String.fromCharCode(65 + remainder) + col;
      index = Math.floor((index - 1) / 26);
    }
    return col;
  };
  
  // Start editing a cell
  const startEditing = (cellId: string) => {
    setEditingCell(cellId);
    setEditValue(cellData[cellId]?.formula || cellData[cellId]?.value || '');
    
    // Focus the input after it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };
  
  // Handle cell edit completion
  const finishEditing = () => {
    if (editingCell) {
      const isFormula = editValue.startsWith('=');
      onCellChange(editingCell, editValue, isFormula);
    }
    setEditingCell(null);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    
    const col = activeCell.match(/[A-Z]+/)?.[0] || 'A';
    const row = parseInt(activeCell.match(/\d+/)?.[0] || '1');
    const colIndex = colToIndex(col);
    
    if (editingCell) {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEditing();
        // Move to the cell below
        if (row < rows) {
          setActiveCell(`${col}${row + 1}`);
          setSelectedRange([`${col}${row + 1}`]);
        }
      } else if (e.key === 'Escape') {
        setEditingCell(null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        finishEditing();
        // Move to the next cell
        if (colIndex < columns) {
          const nextCol = indexToCol(colIndex + 1);
          setActiveCell(`${nextCol}${row}`);
          setSelectedRange([`${nextCol}${row}`]);
        }
      }
    } else {
      if (e.key === 'ArrowUp' && row > 1) {
        e.preventDefault();
        setActiveCell(`${col}${row - 1}`);
        setSelectedRange([`${col}${row - 1}`]);
      } else if (e.key === 'ArrowDown' && row < rows) {
        e.preventDefault();
        setActiveCell(`${col}${row + 1}`);
        setSelectedRange([`${col}${row + 1}`]);
      } else if (e.key === 'ArrowLeft' && colIndex > 1) {
        e.preventDefault();
        const prevCol = indexToCol(colIndex - 1);
        setActiveCell(`${prevCol}${row}`);
        setSelectedRange([`${prevCol}${row}`]);
      } else if (e.key === 'ArrowRight' && colIndex < columns) {
        e.preventDefault();
        const nextCol = indexToCol(colIndex + 1);
        setActiveCell(`${nextCol}${row}`);
        setSelectedRange([`${nextCol}${row}`]);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        startEditing(activeCell);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        // Start editing with the pressed key
        startEditing(activeCell);
        setEditValue(e.key);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        // Clear the selected cells
        const newCellData = { ...cellData };
        selectedRange.forEach(cellId => {
          newCellData[cellId] = { value: '', formula: null };
        });
        onCellChange(activeCell, '', false);
      }
    }
  };
  
  // Handle column resize
  const startResize = (columnIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(columnIndex);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnIndex] || 100);
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };
  
  const handleResize = (e: MouseEvent) => {
    if (!isResizing || resizingColumn === null) return;
    
    const width = Math.max(50, startWidth + (e.clientX - startX));
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: width
    }));
  };
  
  const stopResize = () => {
    setIsResizing(false);
    setResizingColumn(null);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
  };
  
  // Handle cell drag
  const startDrag = (cellId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartCell(cellId);
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
  };
  
  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !dragStartCell || !spreadsheetRef.current) return;
    
    // Find the cell under the mouse
    const rect = spreadsheetRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find the cell at this position
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const cellElement = elements.find(el => el.classList.contains('cell'));
    
    if (cellElement) {
      const cellId = cellElement.getAttribute('data-cell-id');
      if (cellId && cellId !== dragStartCell) {
        // Highlight the target cell
        document.querySelectorAll('.cell').forEach(el => {
          el.classList.remove('drag-target');
        });
        cellElement.classList.add('drag-target');
      }
    }
  };
  
  const stopDrag = (e: MouseEvent) => {
    if (!isDragging || !dragStartCell) {
      setIsDragging(false);
      setDragStartCell(null);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', stopDrag);
      return;
    }
    
    // Find the cell under the mouse
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const cellElement = elements.find(el => el.classList.contains('cell'));
    
    if (cellElement) {
      const targetCellId = cellElement.getAttribute('data-cell-id');
      if (targetCellId && targetCellId !== dragStartCell) {
        // Copy the value from the start cell to the target cell
        const startCellData = cellData[dragStartCell];
        if (startCellData) {
          onCellChange(
            targetCellId, 
            startCellData.formula || startCellData.value || '', 
            !!startCellData.formula
          );
        }
      }
    }
    
    // Clean up
    document.querySelectorAll('.cell').forEach(el => {
      el.classList.remove('drag-target');
    });
    
    setIsDragging(false);
    setDragStartCell(null);
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  };
  
  // Add a row
  const addRow = () => {
    setRows(rows + 1);
  };
  
  // Add a column
  const addColumn = () => {
    setColumns(columns + 1);
  };
  
  // Focus handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        spreadsheetRef.current && 
        !spreadsheetRef.current.contains(e.target as Node)
      ) {
        if (editingCell) {
          finishEditing();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingCell]);
  
  // Render cell content with formatting
  const renderCellContent = (cellId: string) => {
    const cell = cellData[cellId];
    if (!cell) return null;
    
    const value = cell.value !== undefined ? cell.value : '';
    const formatting = cell.formatting || {};
    
    const classNames = [
      'cell-content',
      formatting.bold ? 'bold' : '',
      formatting.italic ? 'italic' : '',
      formatting.align ? `align-${formatting.align}` : ''
    ].filter(Boolean).join(' ');
    
    return <div className={classNames}>{value}</div>;
  };
  
  return (
    <div 
      className="spreadsheet" 
      ref={spreadsheetRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="spreadsheet-container">
        <div className="spreadsheet-header">
          <div className="row-header"></div>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="column-header"
              style={{ width: columnWidths[colIndex] || 100 }}
            >
              {getColumnLabel(colIndex)}
              <div 
                className="column-resize-handle"
                onMouseDown={(e) => startResize(colIndex, e)}
              ></div>
            </div>
          ))}
        </div>
        
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            <div className="row-label">{rowIndex + 1}</div>
            {Array.from({ length: columns }).map((_, colIndex) => {
              const cellId = `${getColumnLabel(colIndex)}${rowIndex + 1}`;
              const isActive = activeCell === cellId;
              const isSelected = selectedRange.includes(cellId);
              
              return (
                <div 
                  key={colIndex}
                  className={`cell ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                  data-cell-id={cellId}
                  onClick={(e) => handleCellClick(cellId, e)}
                  style={{ width: columnWidths[colIndex] || 100 }}
                >
                  {editingCell === cellId ? (
                    <input
                      ref={inputRef}
                      className="cell-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={finishEditing}
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    renderCellContent(cellId)
                  )}
                  {isActive && (
                    <div 
                      className="cell-drag-handle"
                      onMouseDown={(e) => startDrag(cellId, e)}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Spreadsheet;