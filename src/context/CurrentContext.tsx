'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TOOLS, ToolItem, ToolStatus, ToolCategory } from '@/lib/toolsData';

export type { ToolStatus, ToolCategory, ToolItem };
export { INITIAL_TOOLS };

interface CurrentContextType {
  tools: ToolItem[];
  updateToolStatus: (id: string, newStatus: ToolStatus, note?: string) => void;
  updateToolNotes: (id: string, note: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  selectedToolId: string;
  setSelectedToolId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: ToolStatus | 'all';
  setStatusFilter: (filter: ToolStatus | 'all') => void;
  stats: Record<ToolStatus | 'total', number>;
  resetToDefaults: () => void;
}

const CurrentContext = createContext<CurrentContextType | undefined>(undefined);

const STORAGE_KEY = 'toolip_tools_status_v4';

export const CurrentContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedToolId, setSelectedToolId] = useState<string>('pdf-merger');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ToolStatus | 'all'>('all');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTools(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load local tool state', e);
    }
  }, []);

  const saveState = (updated: ToolItem[]) => {
    setTools(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save tool state', e);
    }
  };

  const updateToolStatus = (id: string, newStatus: ToolStatus, note?: string) => {
    const updated = tools.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          notes: note !== undefined ? note : t.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    saveState(updated);
  };

  const updateToolNotes = (id: string, note: string) => {
    const updated = tools.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          notes: note,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    saveState(updated);
  };

  const resetToDefaults = () => {
    saveState(INITIAL_TOOLS);
  };

  const stats = tools.reduce(
    (acc, tool) => {
      acc[tool.status] = (acc[tool.status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    {
      planned: 0,
      working: 0,
      completed: 0,
      'review needed': 0,
      'upgrade needed': 0,
      upgraded: 0,
      dropped: 0,
      total: 0,
    } as Record<ToolStatus | 'total', number>
  );

  return (
    <CurrentContext.Provider
      value={{
        tools,
        updateToolStatus,
        updateToolNotes,
        activeCategory,
        setActiveCategory,
        selectedToolId,
        setSelectedToolId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        stats,
        resetToDefaults,
      }}
    >
      {children}
    </CurrentContext.Provider>
  );
};

export const useCurrentContext = () => {
  const context = useContext(CurrentContext);
  if (!context) {
    throw new Error('useCurrentContext must be used within a CurrentContextProvider');
  }
  return context;
};

export default CurrentContext;
