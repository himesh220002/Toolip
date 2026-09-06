'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Table as TableIcon,
  Download,
  Copy,
  Check,
  Upload,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  ArrowRightLeft,
  Filter,
  Type,
  Code,
  Eye,
  FileSpreadsheet,
  FileCode,
  Search,
  Settings2,
  FileJson,
  FileText,
  Bookmark,
  Save,
  FolderOpen,
  Layers,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

type DelimiterType = 'auto' | 'tab' | 'comma' | 'semicolon' | 'pipe' | 'spaces';

export interface TableSnapshot {
  id: string;
  title: string;
  createdAt: string;
  rowCount: number;
  colCount: number;
  headersPeek: string[];
  gridData: string[][];
  hasHeader: boolean;
}

const SAMPLE_TAB_DATA = `Company\tContact\tCountry
Alfreds Futterkiste\tMaria Anders\tGermany
Centro comercial Moctezuma\tFrancisco Chang\tMexico
Ernst Handel\tRoland Mendel\tAustria
Island Trading\tHelen Bennett\tUK
Laughing Bacchus Winecellars\tYoshi Tannamuri\tCanada
Magazzini Alimentari Riuniti\tGiovanni Rovelli\tItaly`;

export const TableToCsv: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_TAB_DATA);
  const [delimiter, setDelimiter] = useState<DelimiterType>('auto');
  const [detectedDelimiter, setDetectedDelimiter] = useState<string>('Tab (\\t)');
  const [hasHeader, setHasHeader] = useState<boolean>(true);

  // Interactive Table Grid state (2D array)
  const [grid, setGrid] = useState<string[][]>([]);

  // HTML Output options
  const [htmlClass, setHtmlClass] = useState<string>('styled-table');
  const [includeThead, setIncludeThead] = useState<boolean>(true);

  // Search & Replace state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');

  // Active Output View
  const [activeTab, setActiveTab] = useState<'grid' | 'html_code' | 'html_preview' | 'csv' | 'markdown' | 'json'>('grid');

  // Copy feedback state
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Live JSON Editor state & syntax validation
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isEditingJson, setIsEditingJson] = useState<boolean>(false);

  // Live Editable HTML Code & CSV state
  const [htmlCodeText, setHtmlCodeText] = useState<string>('');
  const [isEditingHtmlCode, setIsEditingHtmlCode] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [isEditingCsv, setIsEditingCsv] = useState<boolean>(false);

  // Source Area Safeguard state
  const [lastAppliedSource, setLastAppliedSource] = useState<string>(SAMPLE_TAB_DATA);
  const [isWorkspaceCustomized, setIsWorkspaceCustomized] = useState<boolean>(false);

  // Saved Snapshots (localStorage) state
  const [savedSnapshots, setSavedSnapshots] = useState<TableSnapshot[]>([]);
  const [newSnapshotTitle, setNewSnapshotTitle] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitializedRef = useRef<boolean>(false);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const markCustomized = () => {
    setIsWorkspaceCustomized(true);
  };

  // Restore Active Workspace State & Saved Snapshots from localStorage on mount
  useEffect(() => {
    try {
      const storedSnapshots = localStorage.getItem('toolip_table_snapshots');
      if (storedSnapshots) {
        setSavedSnapshots(JSON.parse(storedSnapshots));
      }

      const savedGrid = localStorage.getItem('toolip_table_active_grid');
      const savedRaw = localStorage.getItem('toolip_table_raw_input');
      const savedHasHeader = localStorage.getItem('toolip_table_has_header');
      const savedCustomized = localStorage.getItem('toolip_table_is_customized');
      const savedLastSource = localStorage.getItem('toolip_table_last_source');

      if (savedGrid) {
        setGrid(JSON.parse(savedGrid));
      }
      if (savedRaw !== null) {
        setRawInput(savedRaw);
      }
      if (savedHasHeader !== null) {
        setHasHeader(savedHasHeader === 'true');
      }
      if (savedCustomized !== null) {
        setIsWorkspaceCustomized(savedCustomized === 'true');
      }
      if (savedLastSource !== null) {
        setLastAppliedSource(savedLastSource);
      }
    } catch (e) {
      console.error('Failed to load active table workspace state from localStorage', e);
    } finally {
      isInitializedRef.current = true;
    }
  }, []);

  // Helper to parse line based on detected or specified delimiter
  const parseLine = (line: string, activeDelim: string): string[] => {
    if (activeDelim === '\t') {
      return line.split('\t').map((s) => s.trim().replace(/^"(.*)"$/, '$1'));
    }
    if (activeDelim === ';') {
      return line.split(';').map((s) => s.trim().replace(/^"(.*)"$/, '$1'));
    }
    if (activeDelim === '|') {
      return line
        .split('|')
        .map((s) => s.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1 || arr.length <= 2);
    }
    if (activeDelim === 'spaces') {
      return line.split(/\s{2,}/).map((s) => s.trim().replace(/^"(.*)"$/, '$1'));
    }
    // Default Comma parsing (handles quotes)
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Parse Raw Text to 2D Grid
  const parseRawToGrid = (inputStr: string, delimSetting: DelimiterType) => {
    if (!inputStr.trim()) {
      setGrid([['', ''], ['', '']]);
      return;
    }

    // Check if input is HTML <table>
    if (inputStr.toLowerCase().includes('<table')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(inputStr, 'text/html');
        const rows = Array.from(doc.querySelectorAll('tr'));
        if (rows.length > 0) {
          const parsedRows: string[][] = rows.map((tr) => {
            const cells = Array.from(tr.querySelectorAll('th, td'));
            return cells.map((cell) => cell.textContent?.trim() || '');
          });
          setGrid(parsedRows);
          setDetectedDelimiter('HTML Table');
          return;
        }
      } catch (e) {
        console.warn('HTML parsing fallback to text parsing', e);
      }
    }

    const lines = inputStr.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setGrid([['']]);
      return;
    }

    let activeDelimChar = ',';
    let label = 'Comma (,)';

    if (delimSetting === 'auto') {
      if (inputStr.includes('\t')) {
        activeDelimChar = '\t';
        label = 'Tab (\\t)';
      } else if (lines.some((l) => l.includes('|') && l.split('|').length >= 3)) {
        activeDelimChar = '|';
        label = 'Pipe (|)';
      } else if (inputStr.includes(';')) {
        activeDelimChar = ';';
        label = 'Semicolon (;)';
      } else if (lines.some((l) => /\s{2,}/.test(l))) {
        activeDelimChar = 'spaces';
        label = 'Multiple Spaces (\\s{2+})';
      } else {
        activeDelimChar = ',';
        label = 'Comma (,)';
      }
    } else {
      switch (delimSetting) {
        case 'tab': activeDelimChar = '\t'; label = 'Tab (\\t)'; break;
        case 'comma': activeDelimChar = ','; label = 'Comma (,)'; break;
        case 'semicolon': activeDelimChar = ';'; label = 'Semicolon (;)'; break;
        case 'pipe': activeDelimChar = '|'; label = 'Pipe (|)'; break;
        case 'spaces': activeDelimChar = 'spaces'; label = 'Multiple Spaces (\\s{2+})'; break;
      }
    }

    setDetectedDelimiter(label);

    // Skip Markdown divider row like |---|---|
    const validLines = lines.filter((line) => !/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(line.trim()));

    const rowsData = validLines.map((line) => parseLine(line, activeDelimChar));

    // Normalize max columns across all rows
    const maxCols = Math.max(...rowsData.map((r) => r.length), 1);
    const normalizedGrid = rowsData.map((row) => {
      const padded = [...row];
      while (padded.length < maxCols) {
        padded.push('');
      }
      return padded;
    });

    setGrid(normalizedGrid);
  };

  // Trigger parse on input change or delimiter selection with safeguard
  useEffect(() => {
    if (isInitializedRef.current && !isWorkspaceCustomized) {
      parseRawToGrid(rawInput, delimiter);
      setLastAppliedSource(rawInput);
    }
  }, [rawInput, delimiter, isWorkspaceCustomized]);

  // Persist Active Workspace State to localStorage whenever state changes
  useEffect(() => {
    if (isInitializedRef.current && grid.length > 0) {
      try {
        localStorage.setItem('toolip_table_active_grid', JSON.stringify(grid));
        localStorage.setItem('toolip_table_raw_input', rawInput);
        localStorage.setItem('toolip_table_has_header', String(hasHeader));
        localStorage.setItem('toolip_table_is_customized', String(isWorkspaceCustomized));
        localStorage.setItem('toolip_table_last_source', lastAppliedSource);
      } catch (e) {
        console.error('Failed to persist active workspace state to localStorage', e);
      }
    }
  }, [grid, rawInput, hasHeader, isWorkspaceCustomized, lastAppliedSource]);

  // Sync jsonText when grid changes if not currently editing JSON
  useEffect(() => {
    if (!isEditingJson && grid.length > 0) {
      setJsonText(generateJson());
      setJsonError(null);
    }
  }, [grid, hasHeader, isEditingJson]);

  // Sync htmlCodeText when grid changes if not currently editing HTML Code
  useEffect(() => {
    if (!isEditingHtmlCode && grid.length > 0) {
      setHtmlCodeText(generateHtmlTable());
    }
  }, [grid, htmlClass, includeThead, hasHeader, isEditingHtmlCode]);

  // Sync csvText when grid changes if not currently editing CSV
  useEffect(() => {
    if (!isEditingCsv && grid.length > 0) {
      setCsvText(generateCsv());
    }
  }, [grid, isEditingCsv]);

  const handleHtmlCodeChange = (val: string) => {
    setHtmlCodeText(val);
    setIsEditingHtmlCode(true);
    markCustomized();
    if (val.toLowerCase().includes('<table')) {
      parseRawToGrid(val, 'auto');
    }
  };

  const handleCsvChange = (val: string) => {
    setCsvText(val);
    setIsEditingCsv(true);
    markCustomized();
    if (val.trim()) {
      parseRawToGrid(val, 'comma');
    }
  };

  // Snapshot Handlers
  const handleSaveSnapshot = () => {
    if (grid.length === 0) {
      triggerNotification('Cannot save empty table snapshot');
      return;
    }
    const defaultTitle = newSnapshotTitle.trim() || `Snapshot #${savedSnapshots.length + 1} (${grid.length}×${grid[0]?.length || 0})`;
    const headers = hasHeader && grid[0] ? grid[0] : grid[0]?.map((_, idx) => `Col ${idx + 1}`) || [];

    const newSnap: TableSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: defaultTitle,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      rowCount: grid.length,
      colCount: grid[0]?.length || 0,
      headersPeek: headers.slice(0, 4),
      gridData: JSON.parse(JSON.stringify(grid)),
      hasHeader
    };

    const updated = [newSnap, ...savedSnapshots];
    setSavedSnapshots(updated);
    try {
      localStorage.setItem('toolip_table_snapshots', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving snapshot to localStorage:', e);
    }
    setNewSnapshotTitle('');
    setShowSaveModal(false);
    triggerNotification(`Saved snapshot: "${defaultTitle}"`);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = savedSnapshots.filter((s) => s.id !== id);
    setSavedSnapshots(updated);
    try {
      localStorage.setItem('toolip_table_snapshots', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving snapshot to localStorage:', e);
    }
    triggerNotification('Deleted saved snapshot');
  };

  const handleLoadSnapshot = (snap: TableSnapshot) => {
    setGrid(JSON.parse(JSON.stringify(snap.gridData)));
    setHasHeader(snap.hasHeader);
    setIsWorkspaceCustomized(true);
    triggerNotification(`Loaded snapshot "${snap.title}" into Grid Editor!`);
  };

  const handleJsonChange = (newVal: string) => {
    setJsonText(newVal);
    setIsEditingJson(true);
    markCustomized();

    if (!newVal.trim()) {
      setJsonError(null);
      return;
    }

    try {
      const parsed = JSON.parse(newVal);
      setJsonError(null);

      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'object' && parsed[0] !== null && !Array.isArray(parsed[0])) {
          const keys = Array.from(
            new Set(parsed.flatMap((obj) => (obj && typeof obj === 'object' ? Object.keys(obj) : [])))
          );
          if (keys.length > 0) {
            const rows: string[][] = [keys];
            parsed.forEach((item) => {
              if (item && typeof item === 'object') {
                const r = keys.map((k) => (item[k] !== undefined && item[k] !== null ? String(item[k]) : ''));
                rows.push(r);
              }
            });
            setGrid(rows);
            setHasHeader(true);
          }
        } else if (Array.isArray(parsed[0])) {
          const rows: string[][] = parsed.map((r) =>
            Array.isArray(r) ? r.map((cell) => (cell !== undefined && cell !== null ? String(cell) : '')) : [String(r)]
          );
          setGrid(rows);
        }
      }
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  // Grid Manipulation Handlers
  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    markCustomized();
    const updated = grid.map((r, rIdx) => {
      if (rIdx === rowIndex) {
        const rowCopy = [...r];
        rowCopy[colIndex] = val;
        return rowCopy;
      }
      return r;
    });
    setGrid(updated);
  };

  const handleAddRow = () => {
    markCustomized();
    const colCount = grid[0] ? grid[0].length : 3;
    const newRow = new Array(colCount).fill('');
    setGrid([...grid, newRow]);
    triggerNotification('Added new row');
  };

  const handleAddColumn = () => {
    markCustomized();
    const updated = grid.map((r) => [...r, '']);
    setGrid(updated);
    triggerNotification('Added new column');
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (grid.length <= 1) {
      triggerNotification('Cannot delete only row');
      return;
    }
    markCustomized();
    setGrid(grid.filter((_, idx) => idx !== rowIndex));
    triggerNotification(`Deleted row ${rowIndex + 1}`);
  };

  const handleDeleteColumn = (colIndex: number) => {
    if (grid[0] && grid[0].length <= 1) {
      triggerNotification('Cannot delete only column');
      return;
    }
    markCustomized();
    const updated = grid.map((row) => row.filter((_, cIdx) => cIdx !== colIndex));
    setGrid(updated);
    triggerNotification(`Deleted column ${getColLabel(colIndex)}`);
  };

  const handleInsertRowAt = (targetIdx: number, position: 'above' | 'below') => {
    markCustomized();
    const insertIndex = position === 'above' ? targetIdx : targetIdx + 1;
    const colCount = grid[0] ? grid[0].length : 3;
    const newRow = new Array(colCount).fill('');
    const updated = [...grid];
    updated.splice(insertIndex, 0, newRow);
    setGrid(updated);
    triggerNotification(`Inserted row ${position} Row ${targetIdx + 1}`);
  };

  const handleInsertColAt = (targetIdx: number, position: 'left' | 'right') => {
    markCustomized();
    const insertIndex = position === 'left' ? targetIdx : targetIdx + 1;
    const updated = grid.map((row) => {
      const r = [...row];
      r.splice(insertIndex, 0, '');
      return r;
    });
    setGrid(updated);
    triggerNotification(`Inserted column ${position} Column ${getColLabel(targetIdx)}`);
  };

  const handleTranspose = () => {
    if (grid.length === 0) return;
    markCustomized();
    const rowCount = grid.length;
    const colCount = grid[0].length;
    const transposed: string[][] = [];

    for (let c = 0; c < colCount; c++) {
      const newRow: string[] = [];
      for (let r = 0; r < rowCount; r++) {
        newRow.push(grid[r][c] || '');
      }
      transposed.push(newRow);
    }
    setGrid(transposed);
    triggerNotification('Transposed rows and columns!');
  };

  const handleDeleteEmptyRows = () => {
    markCustomized();
    const filtered = grid.filter((row) => row.some((cell) => cell.trim() !== ''));
    setGrid(filtered.length > 0 ? filtered : [['']]);
    triggerNotification('Removed empty rows');
  };

  const handleDeduplicate = () => {
    markCustomized();
    const seen = new Set<string>();
    const unique: string[][] = [];
    grid.forEach((row) => {
      const key = row.join('___');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      }
    });
    setGrid(unique);
    triggerNotification(`Removed ${grid.length - unique.length} duplicate rows`);
  };

  const handleTextTransform = (mode: 'upper' | 'lower' | 'capitalize') => {
    markCustomized();
    const updated = grid.map((row, rIdx) => {
      // Don't modify header row if header option active
      if (hasHeader && rIdx === 0) return row;
      return row.map((cell) => {
        if (mode === 'upper') return cell.toUpperCase();
        if (mode === 'lower') return cell.toLowerCase();
        if (mode === 'capitalize') {
          return cell.replace(/\b\w/g, (char) => char.toUpperCase());
        }
        return cell;
      });
    });
    setGrid(updated);
    triggerNotification(`Applied ${mode} text transformation`);
  };

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    markCustomized();
    let count = 0;
    const updated = grid.map((row) =>
      row.map((cell) => {
        if (cell.includes(searchQuery)) {
          count++;
          return cell.replaceAll(searchQuery, replaceQuery);
        }
        return cell;
      })
    );
    setGrid(updated);
    triggerNotification(`Replaced ${count} occurrences`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setRawInput(text);
        triggerNotification(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Convert Grid to Output Formats
  const getColLabel = (index: number): string => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  const generateCsv = (): string => {
    return grid
      .map((row) =>
        row
          .map((c) => {
            const str = c || '';
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');
  };

  const generateHtmlTable = (): string => {
    if (grid.length === 0) return '<table></table>';

    const indent = '  ';
    let html = `<table class="${htmlClass}">\n`;

    if (hasHeader && includeThead && grid.length > 0) {
      html += `${indent}<thead>\n${indent}${indent}<tr>\n`;
      grid[0].forEach((headerCell) => {
        html += `${indent}${indent}${indent}<th>${escapeHtml(headerCell)}</th>\n`;
      });
      html += `${indent}${indent}</tr>\n${indent}</thead>\n`;
    }

    const bodyRows = hasHeader && includeThead ? grid.slice(1) : grid;

    html += `${indent}<tbody>\n`;
    bodyRows.forEach((row) => {
      html += `${indent}${indent}<tr>\n`;
      row.forEach((cell) => {
        html += `${indent}${indent}${indent}<td>${escapeHtml(cell)}</td>\n`;
      });
      html += `${indent}${indent}</tr>\n`;
    });
    html += `${indent}</tbody>\n</table>`;

    return html;
  };

  const generateMarkdownTable = (): string => {
    if (grid.length === 0) return '';
    const headerRow = hasHeader ? grid[0] : grid[0].map((_, i) => `Column ${i + 1}`);
    const bodyRows = hasHeader ? grid.slice(1) : grid;

    let md = `| ${headerRow.join(' | ')} |\n`;
    md += `| ${headerRow.map(() => '---').join(' | ')} |\n`;
    bodyRows.forEach((row) => {
      md += `| ${row.join(' | ')} |\n`;
    });
    return md;
  };

  const generateJson = (): string => {
    if (grid.length === 0) return '[]';
    if (!hasHeader) {
      return JSON.stringify(grid, null, 2);
    }
    const headers = grid[0];
    const dataRows = grid.slice(1);
    const jsonObjects = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const key = h.trim() || `column_${idx + 1}`;
        obj[key] = row[idx] || '';
      });
      return obj;
    });
    return JSON.stringify(jsonObjects, null, 2);
  };

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const copyContent = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    triggerNotification(`Copied ${formatName} to clipboard!`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotification(`Downloaded ${filename}`);
  };
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    setValue: (val: string) => void,
    currentValue: string,
    onValueChange?: (val: string) => void
  ) => {
    if (e.key === 'Tab' || e.keyCode === 9) {
      e.preventDefault();
      e.stopPropagation();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabSpaces = '    '; // 4 spaces for code indentation practice

      const updated = currentValue.substring(0, start) + tabSpaces + currentValue.substring(end);
      setValue(updated);
      if (onValueChange) {
        onValueChange(updated);
      }

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
      });
    }
  };

  const handleConvertSpacesToTabs = () => {
    // Convert 2 or more consecutive spaces into a single tab \t
    const converted = rawInput.replace(/[ \t]{2,}/g, '\t');
    setRawInput(converted);
    setDelimiter('tab');
    triggerNotification('Converted multiple spaces to Tabs (\\t)!');
  };

  const handleInsertTabAtCursor = () => {
    setRawInput((prev) => prev + '\t');
    triggerNotification('Inserted Tab (\\t) character');
  };

  return (
    <div className="space-y-6 text-gray-100 font-sans">
      {/* Top Banner / Raw Input Panel */}
      <div className="p-5 bg-gunmetal-900 border border-white/10 clip-chamfer space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-halo-cyan/20 border border-halo-cyan/40 clip-chamfer-sm flex items-center justify-center text-halo-cyan">
              <TableIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold tracking-wider text-white">DATA SOURCE INPUT</h3>
              <p className="font-mono text-[10px] text-white/50">Supports Copied Tables (Excel/Sheets), CSV, TSV, Markdown, &amp; HTML &lt;table&gt; Code</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleInsertTabAtCursor}
              className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-emerald-400/20 border border-white/10 hover:border-emerald-400/40 clip-chamfer-sm font-mono text-xs font-bold text-emerald-400 transition-colors flex items-center gap-1"
              title="Insert a Tab (\t) separator"
            >
              + Insert Tab (\t)
            </button>

            <button
              onClick={handleConvertSpacesToTabs}
              className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 clip-chamfer-sm font-mono text-xs font-bold text-amber-400 transition-colors flex items-center gap-1"
              title="Convert 2+ consecutive spaces into Tabs (\t)"
            >
              Spaces ➔ Tabs
            </button>

            <button
              onClick={() => {
                setRawInput(SAMPLE_TAB_DATA);
                triggerNotification('Loaded sample tab-separated dataset');
              }}
              className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-halo-cyan/20 border border-white/10 hover:border-halo-cyan/40 clip-chamfer-sm font-mono text-xs font-bold text-halo-cyan transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Load Sample
            </button>

            <button
              onClick={() => {
                setRawInput(SAMPLE_TAB_DATA);
                setLastAppliedSource(SAMPLE_TAB_DATA);
                setIsWorkspaceCustomized(false);
                parseRawToGrid(SAMPLE_TAB_DATA, delimiter);
                try {
                  localStorage.removeItem('toolip_table_active_grid');
                  localStorage.removeItem('toolip_table_raw_input');
                  localStorage.removeItem('toolip_table_has_header');
                  localStorage.removeItem('toolip_table_is_customized');
                  localStorage.removeItem('toolip_table_last_source');
                } catch (e) {}
                triggerNotification('Reset workspace to default sample data');
              }}
              className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-red-400/20 border border-white/10 hover:border-red-400/40 clip-chamfer-sm font-mono text-xs font-bold text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset active table workspace to default sample data"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-vice-pink/20 border border-white/10 hover:border-vice-pink/40 clip-chamfer-sm font-mono text-xs font-bold text-vice-pink transition-colors flex items-center gap-1"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.tsv,.txt,.html,.htm,.json"
              className="hidden"
            />
          </div>
        </div>

        {/* Input Textarea */}
        <div className="relative">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            onKeyDown={(e) => handleTextareaKeyDown(e, setRawInput, rawInput)}
            rows={6}
            placeholder="Paste raw data here (Press Tab key inside text box to insert 4-space code indentation)..."
            className="w-full p-4 !bg-[#060913] border border-white/10 clip-chamfer-sm font-mono text-xs text-halo-cyan focus:outline-none focus:border-halo-cyan/50 resize-y leading-relaxed"
          />
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-gunmetal-900/90 border border-white/10 clip-chamfer-sm font-mono text-[9px] font-bold text-white/40">
            Detected: <span className="text-emerald-400 font-bold">{detectedDelimiter}</span>
          </div>
        </div>

        {/* Source Safeguard Warning Banner */}
        {isWorkspaceCustomized && rawInput !== lastAppliedSource && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 clip-chamfer-sm space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="font-mono text-xs text-amber-200">
                <strong className="font-bold text-amber-400">Source Input Modified:</strong> You have active workspace table edits. Changing source text will not overwrite your workspace until you apply it.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-7">
              <button
                onClick={() => {
                  parseRawToGrid(rawInput, delimiter);
                  setLastAppliedSource(rawInput);
                  setIsWorkspaceCustomized(false);
                  triggerNotification('Applied source text changes to workspace table');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gunmetal-900 clip-chamfer-sm font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Apply Source to Workspace
              </button>

              <button
                onClick={() => {
                  const csvData = generateCsv();
                  setRawInput(csvData);
                  setLastAppliedSource(csvData);
                  setIsWorkspaceCustomized(false);
                  triggerNotification('Synced source text from workspace table');
                }}
                className="px-3 py-1.5 bg-gunmetal-800 hover:bg-white/10 border border-white/20 text-white clip-chamfer-sm font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-halo-cyan" />
                Sync Source from Table
              </button>

              <button
                onClick={() => {
                  setRawInput(lastAppliedSource);
                  triggerNotification('Reverted source text');
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 clip-chamfer-sm font-mono text-xs transition-colors cursor-pointer"
              >
                Revert Source Text
              </button>
            </div>
          </div>
        )}

        {/* Parsing Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <label className="font-mono text-xs font-bold text-white/70 flex items-center gap-1.5">
              <Settings2 className="h-3.5 w-3.5 text-halo-cyan" />
              Delimiter:
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as DelimiterType)}
              className="bg-gunmetal-800 border border-white/10 clip-chamfer-sm px-3 py-1.5 font-mono text-xs font-bold text-white focus:outline-none focus:border-halo-cyan cursor-pointer"
            >
              <option value="auto">Auto-Detect</option>
              <option value="tab">Tab (\t)</option>
              <option value="comma">Comma (,)</option>
              <option value="semicolon">Semicolon (;)</option>
              <option value="pipe">Pipe (|)</option>
              <option value="spaces">{"Multiple Spaces (\\s{2+})"}</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer select-none font-mono text-xs font-bold text-white/80">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="h-4 w-4 rounded accent-halo-cyan cursor-pointer"
              />
              First Row is Header
            </label>
          </div>

          <div className="font-mono text-xs font-bold text-white/40">
            Dimensions: <span className="text-halo-cyan">{grid.length} Rows</span> × <span className="text-halo-cyan">{grid[0]?.length || 0} Cols</span>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-3.5 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'grid'
              ? 'bg-halo-cyan text-gunmetal-900 shadow-md'
              : 'bg-gunmetal-800 hover:bg-white/10 text-white/70'
              }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Grid Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('html_code')}
            className={`px-3.5 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'html_code'
              ? 'bg-vice-pink text-white shadow-md'
              : 'bg-gunmetal-800 hover:bg-white/10 text-white/70'
              }`}
          >
            <Code className="h-4 w-4" />
            <span>HTML Code (&lt;table&gt;)</span>
          </button>

          <button
            onClick={() => setActiveTab('html_preview')}
            className={`px-3.5 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'html_preview'
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-gunmetal-800 hover:bg-white/10 text-white/70'
              }`}
          >
            <Eye className="h-4 w-4" />
            <span>Live HTML Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3.5 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'csv'
              ? 'bg-emerald-500 text-gunmetal-900 shadow-md'
              : 'bg-gunmetal-800 hover:bg-white/10 text-white/70'
              }`}
          >
            <FileText className="h-4 w-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-2 clip-chamfer-sm font-mono text-xs font-bold tracking-wider transition-colors flex items-center gap-2 ${activeTab === 'json'
              ? 'bg-amber-500 text-gunmetal-900 shadow-md'
              : 'bg-gunmetal-800 hover:bg-white/10 text-white/70'
              }`}
          >
            <FileJson className="h-4 w-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE SPREADSHEET GRID EDITOR */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          {/* Grid Toolbar Controls */}
          <div className="p-3 bg-gunmetal-900 border border-white/10 clip-chamfer flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAddRow}
                className="px-2.5 py-1.5 bg-gunmetal-800 hover:bg-halo-cyan/20 border border-white/10 hover:border-halo-cyan/40 clip-chamfer-sm font-mono text-xs font-bold text-white transition-colors flex items-center gap-1"
                title="Add new empty row at bottom"
              >
                <Plus className="h-3.5 w-3.5 text-halo-cyan" />
                Add Row
              </button>

              <button
                onClick={handleAddColumn}
                className="px-2.5 py-1.5 bg-gunmetal-800 hover:bg-halo-cyan/20 border border-white/10 hover:border-halo-cyan/40 clip-chamfer-sm font-mono text-xs font-bold text-white transition-colors flex items-center gap-1"
                title="Add new column at right"
              >
                <Plus className="h-3.5 w-3.5 text-halo-cyan" />
                Add Column
              </button>

              <button
                onClick={handleTranspose}
                className="px-2.5 py-1.5 bg-gunmetal-800 hover:bg-vice-pink/20 border border-white/10 hover:border-vice-pink/40 clip-chamfer-sm font-mono text-xs font-bold text-white transition-colors flex items-center gap-1"
                title="Swap rows and columns"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-vice-pink" />
                Transpose
              </button>

              <button
                onClick={handleDeduplicate}
                className="px-2.5 py-1.5 bg-gunmetal-800 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 clip-chamfer-sm font-mono text-xs font-bold text-white transition-colors flex items-center gap-1"
                title="Deduplicate: Scans table and removes identical duplicate rows"
              >
                <Filter className="h-3.5 w-3.5 text-amber-400" />
                Deduplicate (Remove Duplicate Rows)
              </button>

              <button
                onClick={handleDeleteEmptyRows}
                className="px-2.5 py-1.5 bg-gunmetal-800 hover:bg-red-400/20 border border-white/10 hover:border-red-400/40 clip-chamfer-sm font-mono text-xs font-bold text-white transition-colors flex items-center gap-1"
                title="Remove all empty rows"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                Delete Empty Rows
              </button>

              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-400 border border-emerald-500/40 text-emerald-300 hover:text-gunmetal-900 clip-chamfer-sm font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ml-auto sm:ml-0"
                title="Save table snapshot to local storage with custom title & header preview"
              >
                <Save className="h-3.5 w-3.5" />
                Save Snapshot
              </button>
            </div>

            {/* Text Transform dropdown */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white/50 hidden sm:inline">Transform:</span>
              <button
                onClick={() => handleTextTransform('upper')}
                className="px-2 py-1 bg-gunmetal-800 hover:bg-white/10 border border-white/10 clip-chamfer-sm font-mono text-xs font-bold text-white"
                title="Convert cells to UPPERCASE"
              >
                AA
              </button>
              <button
                onClick={() => handleTextTransform('lower')}
                className="px-2 py-1 bg-gunmetal-800 hover:bg-white/10 border border-white/10 clip-chamfer-sm font-mono text-xs font-bold text-white"
                title="Convert cells to lowercase"
              >
                aa
              </button>
              <button
                onClick={() => handleTextTransform('capitalize')}
                className="px-2 py-1 bg-gunmetal-800 hover:bg-white/10 border border-white/10 clip-chamfer-sm font-mono text-xs font-bold text-white"
                title="Capitalize Words"
              >
                Aa
              </button>
            </div>
          </div>

          {/* Quick Search & Replace Toolbar */}
          <div className="p-3 bg-gunmetal-900 border border-white/10 clip-chamfer flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-halo-cyan shrink-0" />
              <input
                type="text"
                placeholder="Find in table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gunmetal-800 border border-white/10 clip-chamfer-sm px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-halo-cyan"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="w-full bg-gunmetal-800 border border-white/10 clip-chamfer-sm px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-halo-cyan"
              />
            </div>
            <button
              onClick={handleSearchReplace}
              className="px-4 py-1.5 bg-halo-cyan text-gunmetal-900 clip-chamfer-sm font-mono text-xs font-black tracking-wider hover:bg-halo-cyan/90 transition-colors"
            >
              Replace All
            </button>
          </div>

          {/* Table Spreadsheet View */}
          <div className="border border-white/10 clip-chamfer overflow-x-auto bg-gunmetal-950 max-h-[550px] overflow-y-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-gunmetal-900 border-b border-white/10">
                  <th className="w-16 px-2 py-2 text-center text-[10px] font-bold text-white/40 bg-gunmetal-950 border-r border-white/10 select-none">
                    Row #
                  </th>
                  {grid[0]?.map((_, colIdx) => (
                    <th key={colIdx} className="px-3 py-2 text-left text-xs font-bold text-halo-cyan border-r border-white/10 min-w-[160px] group select-none">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-halo-cyan font-bold">{getColLabel(colIdx)}</span>
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleInsertColAt(colIdx, 'left')}
                            className="px-1.5 py-0.5 bg-white/10 hover:bg-halo-cyan/30 text-[9px] text-white rounded transition-colors font-mono"
                            title={`Insert column to the left of Column ${getColLabel(colIdx)}`}
                          >
                            +L
                          </button>
                          <button
                            onClick={() => handleInsertColAt(colIdx, 'right')}
                            className="px-1.5 py-0.5 bg-white/10 hover:bg-halo-cyan/30 text-[9px] text-white rounded transition-colors font-mono"
                            title={`Insert column to the right of Column ${getColLabel(colIdx)}`}
                          >
                            +R
                          </button>
                          <button
                            onClick={() => handleDeleteColumn(colIdx)}
                            className="p-1 text-white/40 hover:text-red-400 transition-colors"
                            title={`Delete column ${getColLabel(colIdx)}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="w-10 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {grid.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`border-b border-white/5 hover:bg-white/[0.02] ${hasHeader && rowIdx === 0 ? 'bg-halo-cyan/5 font-bold' : ''
                      }`}
                  >
                    <td className="px-2 py-1.5 text-center text-[10px] font-bold text-white/40 bg-gunmetal-900/50 border-r border-white/10 select-none group min-w-[70px]">
                      <div className="flex items-center justify-between gap-1">
                        <span>{rowIdx + 1}</span>
                        <div className="flex items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleInsertRowAt(rowIdx, 'above')}
                            className="px-1 py-0.5 bg-white/10 hover:bg-halo-cyan/30 text-[9px] text-white rounded transition-colors font-mono"
                            title={`Insert new row above row ${rowIdx + 1}`}
                          >
                            +A
                          </button>
                          <button
                            onClick={() => handleInsertRowAt(rowIdx, 'below')}
                            className="px-1 py-0.5 bg-white/10 hover:bg-halo-cyan/30 text-[9px] text-white rounded transition-colors font-mono"
                            title={`Insert new row below row ${rowIdx + 1}`}
                          >
                            +B
                          </button>
                        </div>
                      </div>
                    </td>
                    {row.map((cellValue, colIdx) => (
                      <td key={colIdx} className="p-0 border-r border-white/5 min-w-[160px]">
                        <input
                          type="text"
                          value={cellValue}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          className={`w-full px-3 py-2 bg-transparent text-xs focus:outline-none focus:bg-gunmetal-800/80 focus:ring-1 focus:ring-halo-cyan ${hasHeader && rowIdx === 0 ? 'text-halo-cyan font-bold' : 'text-gray-200'
                            }`}
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => handleDeleteRow(rowIdx)}
                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                        title={`Delete row ${rowIdx + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EDITABLE HTML CODE <table> */}
      {activeTab === 'html_code' && (
        <div className="space-y-4">
          <div className="p-4 bg-gunmetal-900 border border-white/10 clip-chamfer flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="font-mono text-xs font-bold text-white/70">Table CSS Class:</label>
              <input
                type="text"
                value={htmlClass}
                onChange={(e) => setHtmlClass(e.target.value)}
                placeholder="e.g. styled-table, border"
                className="bg-gunmetal-800 border border-white/10 clip-chamfer-sm px-3 py-1 font-mono text-xs text-white focus:outline-none focus:border-halo-cyan"
              />

              <label className="flex items-center gap-2 cursor-pointer font-mono text-xs font-bold text-white/80">
                <input
                  type="checkbox"
                  checked={includeThead}
                  onChange={(e) => setIncludeThead(e.target.checked)}
                  className="h-4 w-4 rounded accent-vice-pink"
                />
                Include &lt;thead&gt; block
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyContent(generateHtmlTable(), 'HTML Code')}
                className="px-4 py-2 bg-vice-pink text-white font-mono text-xs font-bold clip-chamfer-sm hover:bg-vice-pink/90 transition-colors flex items-center gap-1.5"
              >
                {copiedFormat === 'HTML Code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedFormat === 'HTML Code' ? 'Copied HTML!' : 'Copy HTML Code'}</span>
              </button>

              <button
                onClick={() => downloadFile(generateHtmlTable(), `table_export_${Date.now()}.html`, 'text/html')}
                className="px-4 py-2 bg-emerald-600 text-white font-mono text-xs font-bold clip-chamfer-sm hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Download .HTML</span>
              </button>
            </div>
          </div>

          {/* Directly Editable HTML Code Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-white/50 px-1">
              <span>Directly edit HTML table code below (Updates Grid &amp; Preview live | Press Tab for 4 spaces):</span>
            </div>
            <textarea
              value={isEditingHtmlCode ? htmlCodeText : generateHtmlTable()}
              onChange={(e) => handleHtmlCodeChange(e.target.value)}
              onFocus={() => setIsEditingHtmlCode(true)}
              onBlur={() => setIsEditingHtmlCode(false)}
              onKeyDown={(e) =>
                handleTextareaKeyDown(e, setHtmlCodeText, isEditingHtmlCode ? htmlCodeText : generateHtmlTable(), handleHtmlCodeChange)
              }
              rows={14}
              placeholder="Directly edit <table> HTML code..."
              className="w-full p-4 !bg-[#060913] border border-white/10 clip-chamfer-sm font-mono text-xs text-vice-pink focus:outline-none focus:border-vice-pink/60 resize-y leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* TAB 3: LIVE RENDERED HTML PREVIEW */}
      {activeTab === 'html_preview' && (
        <div className="space-y-4">
          <div className="p-4 bg-gunmetal-900 border border-white/10 clip-chamfer flex items-center justify-between">
            <div className="font-mono text-xs font-bold text-white/70">
              Live HTML Table Preview (<span className="text-purple-400">Rendered in Browser</span>)
            </div>
            <button
              onClick={() => copyContent(generateHtmlTable(), 'Rendered HTML')}
              className="px-3 py-1.5 bg-purple-600 text-white font-mono text-xs font-bold clip-chamfer-sm hover:bg-purple-500 transition-colors flex items-center gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Code
            </button>
          </div>

          <div className="p-6 bg-gunmetal-950 border border-white/10 clip-chamfer overflow-x-auto max-h-[120vh] overflow-y-auto">
            {/* Inline CSS styling for the preview table */}
            <style>{`
              .preview-table-container table {
                width: 100%;
                border-collapse: collapse;
                font-family: ui-sans-serif, system-ui, sans-serif;
                font-size: 13px;
                color: #e2e8f0;
                background-color: #0f172a;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
              }
              .preview-table-container th {
                background-color: #1e293b;
                color: #38bdf8;
                font-weight: 700;
                text-align: left;
                padding: 12px 16px;
                border-bottom: 2px solid #334155;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-size: 11px;
              }
              .preview-table-container td {
                padding: 10px 16px;
                border-bottom: 1px solid #1e293b;
              }
              .preview-table-container tr:hover {
                background-color: rgba(56, 189, 248, 0.05);
              }
            `}</style>

            <div
              className="preview-table-container"
              dangerouslySetInnerHTML={{ __html: generateHtmlTable() }}
            />
          </div>
        </div>
      )}

      {/* TAB 4: EDITABLE CSV OUTPUT */}
      {activeTab === 'csv' && (
        <div className="space-y-4">
          <div className="p-4 bg-gunmetal-900 border border-white/10 clip-chamfer flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-xs font-bold text-white/70 flex items-center gap-2">
              <span>CSV Format Editor</span>
              <span className="text-emerald-400 font-normal text-[11px] hidden sm:inline">(Edit CSV text below to update Grid, JSON &amp; HTML live)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyContent(isEditingCsv ? csvText : generateCsv(), 'CSV')}
                className="px-4 py-2 bg-emerald-500 text-gunmetal-900 font-mono text-xs font-bold clip-chamfer-sm hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
              >
                {copiedFormat === 'CSV' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedFormat === 'CSV' ? 'Copied CSV!' : 'Copy CSV'}</span>
              </button>

              <button
                onClick={() => downloadFile(isEditingCsv ? csvText : generateCsv(), `table_export_${Date.now()}.csv`, 'text/csv')}
                className="px-4 py-2 bg-emerald-600 text-white font-mono text-xs font-bold clip-chamfer-sm hover:bg-emerald-500 transition-colors flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Download .CSV File</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={isEditingCsv ? csvText : generateCsv()}
              onChange={(e) => handleCsvChange(e.target.value)}
              onFocus={() => setIsEditingCsv(true)}
              onBlur={() => setIsEditingCsv(false)}
              onKeyDown={(e) =>
                handleTextareaKeyDown(e, setCsvText, isEditingCsv ? csvText : generateCsv(), handleCsvChange)
              }
              rows={14}
              placeholder="Directly edit CSV text here (Press Tab for 4 spaces)..."
              className="w-full p-4 !bg-[#060913] border border-white/10 clip-chamfer-sm font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-400/60 resize-y leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* TAB 5: EDITABLE JSON ARRAY WITH LIVE SYNTAX ERROR ALERTS */}
      {activeTab === 'json' && (
        <div className="space-y-4">
          <div className="p-4 bg-gunmetal-900 border border-white/10 clip-chamfer flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono text-xs font-bold text-white/70 flex items-center gap-2">
              <span>JSON Array Editor</span>
              <span className="text-amber-400 font-normal text-[11px] hidden sm:inline">(Edit JSON below to update Grid, CSV &amp; HTML live)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyContent(jsonText || generateJson(), 'JSON')}
                className="px-4 py-2 bg-amber-500 text-gunmetal-900 font-mono text-xs font-bold clip-chamfer-sm hover:bg-amber-400 transition-colors flex items-center gap-1.5"
              >
                {copiedFormat === 'JSON' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedFormat === 'JSON' ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={() => downloadFile(jsonText || generateJson(), `table_export_${Date.now()}.json`, 'application/json')}
                className="px-4 py-2 bg-amber-600 text-white font-mono text-xs font-bold clip-chamfer-sm hover:bg-amber-500 transition-colors flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Download .JSON</span>
              </button>
            </div>
          </div>

          {/* Syntax Error Alert Banner */}
          {jsonError && (
            <div className="p-3.5 bg-red-950/90 border border-red-500/80 clip-chamfer-sm text-red-300 font-mono text-xs flex items-center justify-between gap-3 shadow-xl animate-pulse">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">⚠️</span>
                <span className="truncate"><strong className="font-bold text-red-400">JSON Syntax Error:</strong> {jsonError}</span>
              </div>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest bg-red-900/60 px-2 py-0.5 border border-red-500/40 clip-chamfer-sm shrink-0">Syntax Alert</span>
            </div>
          )}

          {/* Live Editable JSON Textarea */}
          <div className="space-y-2">
            <textarea
              value={jsonText || generateJson()}
              onChange={(e) => handleJsonChange(e.target.value)}
              onFocus={() => setIsEditingJson(true)}
              onBlur={() => setIsEditingJson(false)}
              onKeyDown={(e) =>
                handleTextareaKeyDown(e, setJsonText, jsonText || generateJson(), handleJsonChange)
              }
              rows={14}
              placeholder="Paste or edit JSON array code here..."
              className={`w-full p-4 !bg-[#060913] border clip-chamfer-sm font-mono text-xs text-amber-300 focus:outline-none resize-y leading-relaxed transition-colors ${jsonError ? 'border-red-500/80 focus:border-red-400' : 'border-white/10 focus:border-amber-400/60'
                }`}
            />
          </div>
        </div>
      )}

      {/* SAVED TABLE SNAPSHOTS SECTION */}
      <div className="p-5 bg-gunmetal-900 border border-white/10 clip-chamfer space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-400/20 border border-emerald-400/40 clip-chamfer-sm flex items-center justify-center text-emerald-400">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold tracking-wider text-white flex items-center gap-2">
                SAVED TABLE SNAPSHOTS
                <span className="px-3 py-0 bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 font-mono text-[8px] rounded-full">
                  {savedSnapshots.length} Saved
                </span>
              </h3>
              <p className="font-mono text-[8px] text-white/50">
                Snapshots persist in cards &amp; quick load into Grid Editor without touching source text.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-gunmetal-900 font-mono text-xs font-black clip-chamfer-sm transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            + Save Current Table
          </button>
        </div>

        {/* Save Snapshot Inline Modal */}
        {showSaveModal && (
          <div className="p-4 bg-gunmetal-950 border border-halo-cyan/40 clip-chamfer-sm space-y-3">
            <div className="font-mono text-xs font-bold text-halo-cyan flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Table Snapshot (localStorage)
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newSnapshotTitle}
                onChange={(e) => setNewSnapshotTitle(e.target.value)}
                placeholder={`e.g. Sales Report Q3 (${grid.length} rows)`}
                className="flex-1 min-w-[200px] px-3 py-2 bg-gunmetal-900 border border-white/10 clip-chamfer-sm font-mono text-xs text-white focus:outline-none focus:border-halo-cyan"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSnapshot();
                }}
                autoFocus
              />
              <button
                onClick={handleSaveSnapshot}
                className="px-4 py-2 bg-halo-cyan text-gunmetal-900 font-mono text-xs font-black clip-chamfer-sm hover:bg-halo-cyan/90 transition-colors cursor-pointer"
              >
                Confirm Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs clip-chamfer-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Snapshots Card Grid */}
        {savedSnapshots.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 clip-chamfer-sm space-y-2">
            <FolderOpen className="h-8 w-8 text-white/20 mx-auto" />
            <div className="font-mono text-xs text-white/50">No saved table snapshots yet.</div>
            <p className="font-mono text-[8px] text-white/30">
              Custom workspace edits stay safe in grid. Click <strong>"Save Snapshot"</strong> to preserve reusable table snapshots!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSnapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-4 bg-gunmetal-950/80 border border-white/10 hover:border-halo-cyan/50 clip-chamfer-sm space-y-3 transition-all group hover:shadow-xl relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-tech text-sm font-bold text-white group-hover:text-halo-cyan transition-colors truncate">
                      {snap.title}
                    </h4>
                    <span className="font-mono text-[10px] text-white/40 block">
                      Saved: {snap.createdAt}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteSnapshot(snap.id)}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                    title="Delete Snapshot from localStorage"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Peek Header Badges */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 bg-halo-cyan/10 border border-halo-cyan/30 text-halo-cyan clip-chamfer-sm font-bold">
                      {snap.rowCount} Rows
                    </span>
                    <span className="px-1.5 py-0.5 bg-vice-pink/10 border border-vice-pink/30 text-vice-pink clip-chamfer-sm font-bold">
                      {snap.colCount} Cols
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {snap.headersPeek.map((head, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/70 font-mono text-[10px] clip-chamfer-sm truncate max-w-[110px]"
                      >
                        {head || `Col ${idx + 1}`}
                      </span>
                    ))}
                    {snap.colCount > 4 && (
                      <span className="px-1.5 py-0.5 text-white/40 font-mono text-[10px]">
                        +{snap.colCount - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button: Load Snapshot */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleLoadSnapshot(snap)}
                    className="w-full py-1.5 bg-halo-cyan/10 hover:bg-halo-cyan border border-halo-cyan/40 hover:text-gunmetal-900 text-halo-cyan font-mono text-xs font-bold clip-chamfer-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Open in Grid Editor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[100000] bg-halo-cyan text-gunmetal-900 px-4 py-2.5 clip-chamfer-sm font-mono text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
