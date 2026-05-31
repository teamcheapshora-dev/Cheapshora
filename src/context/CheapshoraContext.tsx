/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Shortcut, Group, Task, Note, AppSettings } from '../types';
import { INITIAL_STATE } from '../lib/initialData';

interface CheapshoraContextType {
  state: AppState;
  addShortcut: (title: string, url: string, groupId: string) => void;
  updateShortcut: (id: string, title: string, url: string, groupId: string) => void;
  deleteShortcut: (id: string) => void;
  incrementShortcutClick: (id: string) => void;
  addGroup: (name: string, description?: string) => void;
  updateGroup: (id: string, name: string, description?: string) => void;
  deleteGroup: (id: string) => void;
  addTask: (text: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, text: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => void;
  deleteTask: (id: string) => void;
  addNote: (title: string, content: string) => string;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  importData: (jsonString: string) => { success: boolean; error?: string };
  exportData: () => void;
  resetToDefaults: () => void;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
}

const CheapshoraContext = createContext<CheapshoraContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cheapshora_os_state_v1';

export const CheapshoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        // Basic schema validator / merger
        return {
          groups: parsed.groups || INITIAL_STATE.groups,
          shortcuts: parsed.shortcuts || INITIAL_STATE.shortcuts,
          tasks: parsed.tasks || INITIAL_STATE.tasks,
          notes: parsed.notes || INITIAL_STATE.notes,
          settings: { ...INITIAL_STATE.settings, ...parsed.settings },
        };
      }
    } catch (e) {
      console.error('Error loading Cheapshora state from localStorage:', e);
    }
    return INITIAL_STATE;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return state.notes.length > 0 ? state.notes[0].id : null;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving Cheapshora state to localStorage:', e);
    }
  }, [state]);

  // Sync index.css document root for Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  const addShortcut = (title: string, url: string, groupId: string) => {
    // Format URL beautifully (ensure it has a protocol)
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newShortcut: Shortcut = {
      id: `s-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim() || 'New Bookmark',
      url: formattedUrl,
      groupId,
      clickCount: 0,
      createdAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      shortcuts: [...prev.shortcuts, newShortcut],
    }));
  };

  const updateShortcut = (id: string, title: string, url: string, groupId: string) => {
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setState((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.map((sh) =>
        sh.id === id ? { ...sh, title: title.trim(), url: formattedUrl, groupId } : sh
      ),
    }));
  };

  const deleteShortcut = (id: string) => {
    setState((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.filter((sh) => sh.id !== id),
    }));
  };

  const incrementShortcutClick = (id: string) => {
    setState((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.map((sh) =>
        sh.id === id ? { ...sh, clickCount: sh.clickCount + 1 } : sh
      ),
    }));
  };

  const addGroup = (name: string, description?: string) => {
    const newGroup: Group = {
      id: `g-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim() || 'New Workspace Group',
      description: description?.trim() || '',
      order: state.groups.length + 1,
    };

    setState((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
  };

  const updateGroup = (id: string, name: string, description?: string) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === id ? { ...g, name: name.trim(), description: description?.trim() || '' } : g
      ),
    }));
  };

  const deleteGroup = (id: string) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== id),
      // Orphaned shortcuts go to the first group, or are deleted
      shortcuts: prev.shortcuts.filter((sh) => sh.groupId !== id),
    }));
  };

  const addTask = (text: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => {
    const newTask: Task = {
      id: `t-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim() || 'Focus session task',
      completed: false,
      priority,
      dueDate,
      createdAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const toggleTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const updateTask = (id: string, text: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, text: text.trim(), priority, dueDate } : t
      ),
    }));
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const addNote = (title: string, content: string): string => {
    const newId = `n-${Math.random().toString(36).substr(2, 9)}`;
    const newNote: Note = {
      id: newId,
      title: title.trim() || 'Untitled Note',
      content,
      updatedAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    setActiveNoteId(newId);
    return newId;
  };

  const updateNote = (id: string, title: string, content: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, title: title.trim(), content, updatedAt: Date.now() } : n
      ),
    }));
  };

  const deleteNote = (id: string) => {
    setState((prev) => {
      const filteredNotes = prev.notes.filter((n) => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
      }
      return {
        ...prev,
        notes: filteredNotes,
      };
    });
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const importData = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        const validatedState: AppState = {
          groups: Array.isArray(parsed.groups) ? parsed.groups : INITIAL_STATE.groups,
          shortcuts: Array.isArray(parsed.shortcuts) ? parsed.shortcuts : INITIAL_STATE.shortcuts,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : INITIAL_STATE.tasks,
          notes: Array.isArray(parsed.notes) ? parsed.notes : INITIAL_STATE.notes,
          settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
        };

        setState(validatedState);
        if (validatedState.notes.length > 0) {
          setActiveNoteId(validatedState.notes[0].id);
        } else {
          setActiveNoteId(null);
        }
        return { success: true };
      }
      return { success: false, error: 'Parsed JSON is not an object.' };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Invalid JSON format.' };
    }
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cheapshora_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting data:', e);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you absolutely sure you want to reset Cheapshora OS back to factory demo defaults? Your custom changes will be overwritten.')) {
      setState(INITIAL_STATE);
      setActiveNoteId(INITIAL_STATE.notes[0].id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_STATE));
    }
  };

  return (
    <CheapshoraContext.Provider
      value={{
        state,
        addShortcut,
        updateShortcut,
        deleteShortcut,
        incrementShortcutClick,
        addGroup,
        updateGroup,
        deleteGroup,
        addTask,
        toggleTask,
        updateTask,
        deleteTask,
        addNote,
        updateNote,
        deleteNote,
        updateSettings,
        importData,
        exportData,
        resetToDefaults,
        activeNoteId,
        setActiveNoteId,
      }}
    >
      {children}
    </CheapshoraContext.Provider>
  );
};

export const useCheapshora = () => {
  const context = useContext(CheapshoraContext);
  if (context === undefined) {
    throw new Error('useCheapshora must be used within a CheapshoraProvider');
  }
  return context;
};
