import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Plus, 
  Trash2, 
  Search,
  FileSpreadsheet
} from 'lucide-react';
import Spreadsheet from './components/Spreadsheet';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import './App.css';

function App() {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [cellData, setCellData] = useState<Record<string, any>>({});
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [selectedRange, setSelectedRange] = useState<string[]>([]);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Update formula bar when active cell changes
  useEffect(() => {
    if (activeCell && cellData[activeCell]) {
      setFormulaBarValue(cellData[activeCell].formula || cellData[activeCell].value || '');
    } else {
      setFormulaBarValue('');
    }
  }, [activeCell, cellData]);

  const handleCellChange = (cellId: string, value: string, isFormula: boolean = false) => {
    const newCellData = { ...cellData };
    
    if (isFormula) {
      newCellData[cellId] = {
        ...newCellData[cellId],
        formula: value,
        value: evaluateFormula(value, newCellData)
      };
    } else {
      newCellData[cellId] = {
        ...newCellData[cellId],
        value: value,
        formula: null
      };
    }
    
    // Update dependent cells
    updateDependentCells(newCellData);
    
    setCellData(newCellData);
  };

  const updateDependentCells = (data: Record<string, any>) => {
    // Find cells with formulas and update them
    Object.keys(data).forEach(cellId => {
      if (data[cellId]?.formula) {
        data[cellId].value = evaluateFormula(data[cellId].formula, data);
      }
    });
  };

  const evaluateFormula = (formula: string, data: Record<string, any>): string | number => {
    if (!formula || !formula.startsWith('=')) return formula;
    
    try {
      // Extract function name and arguments
      const functionMatch = formula.match(/^=([A-Z_]+)\((.+)\)$/);
      
      if (!functionMatch) {
        // Handle simple cell references like =A1
        const cellRef = formula.substring(1);
        return data[cellRef]?.value || 0;
      }
      
      const [_, functionName, args] = functionMatch;
      const argArray = parseArguments(args);
      
      switch (functionName.toUpperCase()) {
        case 'SUM':
          return calculateSum(argArray, data);
        case 'AVERAGE':
          return calculateAverage(argArray, data);
        case 'MAX':
          return calculateMax(argArray, data);
        case 'MIN':
          return calculateMin(argArray, data);
        case 'COUNT':
          return calculateCount(argArray, data);
        case 'TRIM':
          return trimText(argArray, data);
        case 'UPPER':
          return upperText(argArray, data);
        case 'LOWER':
          return lowerText(argArray, data);
        default:
          return '#ERROR!';
      }
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR!';
    }
  };

  const parseArguments = (argsString: string): string[] => {
    // Handle range notation (e.g., A1:B3)
    if (argsString.includes(':')) {
      const [start, end] = argsString.split(':');
      return expandRange(start, end);
    }
    
    // Handle comma-separated list of arguments
    return argsString.split(',').map(arg => arg.trim());
  };

  const expandRange = (start: string, end: string): string[] => {
    const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
    const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
    const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
    const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
    
    const startColIndex = colToIndex(startCol);
    const endColIndex = colToIndex(endCol);
    
    const cells: string[] = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startColIndex; col <= endColIndex; col++) {
        cells.push(`${indexToCol(col)}${row}`);
      }
    }
    
    return cells;
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

  // Mathematical functions
  const calculateSum = (cells: string[], data: Record<string, any>): number => {
    return cells.reduce((sum, cell) => {
      const value = parseFloat(data[cell]?.value);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const calculateAverage = (cells: string[], data: Record<string, any>): number => {
    const sum = calculateSum(cells, data);
    const count = cells.filter(cell => {
      const value = parseFloat(data[cell]?.value);
      return !isNaN(value);
    }).length;
    return count > 0 ? sum / count : 0;
  };

  const calculateMax = (cells: string[], data: Record<string, any>): number => {
    const values = cells
      .map(cell => parseFloat(data[cell]?.value))
      .filter(value => !isNaN(value));
    return values.length > 0 ? Math.max(...values) : 0;
  };

  const calculateMin = (cells: string[], data: Record<string, any>): number => {
    const values = cells
      .map(cell => parseFloat(data[cell]?.value))
      .filter(value => !isNaN(value));
    return values.length > 0 ? Math.min(...values) : 0;
  };

  const calculateCount = (cells: string[], data: Record<string, any>): number => {
    return cells.filter(cell => {
      const value = parseFloat(data[cell]?.value);
      return !isNaN(value);
    }).length;
  };

  // Data quality functions
  const trimText = (cells: string[], data: Record<string, any>): string => {
    if (cells.length === 0) return '';
    const cellValue = data[cells[0]]?.value || '';
    return typeof cellValue === 'string' ? cellValue.trim() : cellValue.toString();
  };

  const upperText = (cells: string[], data: Record<string, any>): string => {
    if (cells.length === 0) return '';
    const cellValue = data[cells[0]]?.value || '';
    return typeof cellValue === 'string' ? cellValue.toUpperCase() : cellValue.toString().toUpperCase();
  };

  const lowerText = (cells: string[], data: Record<string, any>): string => {
    if (cells.length === 0) return '';
    const cellValue = data[cells[0]]?.value || '';
    return typeof cellValue === 'string' ? cellValue.toLowerCase() : cellValue.toString().toLowerCase();
  };

  const removeDuplicates = () => {
    if (!selectedRange || selectedRange.length === 0) return;
    
    // Group cells by row
    const rowGroups: Record<number, string[]> = {};
    selectedRange.forEach(cellId => {
      const row = parseInt(cellId.match(/\d+/)?.[0] || '0');
      if (!rowGroups[row]) rowGroups[row] = [];
      rowGroups[row].push(cellId);
    });
    
    // Get row values
    const rowValues: Record<number, string> = {};
    Object.entries(rowGroups).forEach(([row, cells]) => {
      rowValues[parseInt(row)] = cells.map(cell => cellData[cell]?.value || '').join('|');
    });
    
    // Find duplicates
    const uniqueValues = new Set();
    const duplicateRows: number[] = [];
    
    Object.entries(rowValues).forEach(([row, value]) => {
      if (uniqueValues.has(value)) {
        duplicateRows.push(parseInt(row));
      } else {
        uniqueValues.add(value);
      }
    });
    
    // Clear duplicate rows
    const newCellData = { ...cellData };
    duplicateRows.forEach(row => {
      rowGroups[row].forEach(cellId => {
        newCellData[cellId] = { value: '', formula: null };
      });
    });
    
    setCellData(newCellData);
  };

  const findAndReplace = () => {
    if (!findText) return;
    
    const newCellData = { ...cellData };
    const cellsToUpdate = selectedRange.length > 0 ? selectedRange : Object.keys(cellData);
    
    cellsToUpdate.forEach(cellId => {
      if (newCellData[cellId]?.value?.toString().includes(findText)) {
        const newValue = newCellData[cellId].value.toString().replaceAll(findText, replaceText);
        newCellData[cellId] = {
          ...newCellData[cellId],
          value: newValue,
          formula: newCellData[cellId].formula
        };
      }
    });
    
    setCellData(newCellData);
    setShowFindReplace(false);
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBarValue(value);
    
    if (activeCell) {
      const isFormula = value.startsWith('=');
      handleCellChange(activeCell, value, isFormula);
    }
  };

  const handleCellFormat = (format: string) => {
    if (!activeCell) return;
    
    const newCellData = { ...cellData };
    if (!newCellData[activeCell]) {
      newCellData[activeCell] = { value: '', formula: null, formatting: {} };
    }
    
    if (!newCellData[activeCell].formatting) {
      newCellData[activeCell].formatting = {};
    }
    
    switch (format) {
      case 'bold':
        newCellData[activeCell].formatting.bold = !newCellData[activeCell].formatting.bold;
        break;
      case 'italic':
        newCellData[activeCell].formatting.italic = !newCellData[activeCell].formatting.italic;
        break;
      case 'alignLeft':
        newCellData[activeCell].formatting.align = 'left';
        break;
      case 'alignCenter':
        newCellData[activeCell].formatting.align = 'center';
        break;
      case 'alignRight':
        newCellData[activeCell].formatting.align = 'right';
        break;
    }
    
    setCellData(newCellData);
  };

  return (
    <div className="app">
      <div className="app-header">
        <div className="app-logo">
          <FileSpreadsheet size={24} />
          <span>Praveen Sheet</span>
        </div>
      </div>
      
      <Toolbar 
        onFormat={handleCellFormat} 
        onRemoveDuplicates={removeDuplicates}
        onShowFindReplace={() => setShowFindReplace(true)}
      />
      
      <FormulaBar 
        value={formulaBarValue} 
        onChange={handleFormulaBarChange} 
        activeCell={activeCell}
      />
      
      <Spreadsheet 
        cellData={cellData}
        activeCell={activeCell}
        setActiveCell={setActiveCell}
        onCellChange={handleCellChange}
        selectedRange={selectedRange}
        setSelectedRange={setSelectedRange}
      />
      
      {showFindReplace && (
        <div className="find-replace-modal">
          <div className="find-replace-content">
            <h3>Find and Replace</h3>
            <div className="find-replace-form">
              <div className="form-group">
                <label>Find:</label>
                <input 
                  type="text" 
                  value={findText} 
                  onChange={(e) => setFindText(e.target.value)} 
                  placeholder="Text to find"
                />
              </div>
              <div className="form-group">
                <label>Replace with:</label>
                <input 
                  type="text" 
                  value={replaceText} 
                  onChange={(e) => setReplaceText(e.target.value)} 
                  placeholder="Replacement text"
                />
              </div>
              <div className="form-actions">
                <button onClick={findAndReplace}>Replace All</button>
                <button onClick={() => setShowFindReplace(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;