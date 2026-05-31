/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheapshoraProvider, useCheapshora } from './context/CheapshoraContext';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { Pomodoro } from './components/Pomodoro';
import { TaskManager } from './components/TaskManager';
import { NotesArea } from './components/NotesArea';
import { CalendarEmbed } from './components/CalendarEmbed';
import { ShortcutGrid } from './components/ShortcutGrid';
import { SettingsModal } from './components/SettingsModal';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, ShieldCheck, Flame, Compass, HelpCircle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

function MainAppContent() {
  const { state } = useCheapshora();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals Visibility
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);

  // Dynamic Toast Alerts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast after 3.2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Listen for Global Hotkey (Ctrl + K or Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`min-h-screen pb-16 flex flex-col font-sans transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950`}>
      
      {/* 1. Header Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddShortcut={() => {
          setIsAddShortcutOpen(true);
        }}
      />

      {/* 2. Main Double-columns Board Canvas */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8 flex-1 w-full flex flex-col gap-6 md:gap-8">
        
        {/* Top Notification Announcement (Dismissible style, highly aesthetic) */}
        <div className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent border border-indigo-500/15 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-zinc-700 dark:text-zinc-350 select-none">
          <div className="flex gap-2.5">
            <Compass className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-extrabold text-xs text-zinc-900 dark:text-white block">
                Command Console CLI is fully activated!
              </span>
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
                Press <kbd className="bg-zinc-100 dark:bg-zinc-850 px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-750 text-zinc-600 font-mono text-[9px] font-bold">Ctrl + K</kbd> to launch bookmarks, append checklists, draft scratch notes, and toggle themes.
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer shrink-0"
          >
            Launch Command Palette &rarr;
          </button>
        </div>

        {/* Dashboard grid partitioning */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT: Productivity tools column (Takes 4 spans on lg specs) */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8 lg:sticky lg:top-22 z-10">
            {/* Pomodoro widget */}
            <Pomodoro />
            
            {/* To-Do task checklist */}
            <TaskManager />
          </div>

          {/* RIGHT: Website Shortcut grids workspace category launcher (Takes 8 spans on lg specs) */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            <ShortcutGrid
              searchQuery={searchQuery}
              isAddShortcutOpen={isAddShortcutOpen}
              onCloseAddShortcut={() => setIsAddShortcutOpen(false)}
            />
          </div>

        </div>

        {/* BOTTOM SECTION: Full-width heavy widgets (Calendar embed & Notepad) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Note Area pad container */}
          <div className="lg:col-span-7 h-full">
            <NotesArea />
          </div>

          {/* Agenda google Calendar embed */}
          <div className="lg:col-span-5 h-full">
            <CalendarEmbed />
          </div>

        </div>

      </main>

      {/* 3. Command Palette Dialog Panel Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        showToast={showToast}
      />

      {/* 4. Settings Configuration Management Drawer Overlay */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />

      {/* 5. Elegant Sliding Toast Toast notifications queue */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full select-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl border flex items-center gap-3 shadow-lg pointer-events-auto ${
                t.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-900/60'
                  : t.type === 'warning'
                  ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/90 dark:text-red-100 dark:border-red-900/60'
                  : 'bg-zinc-900 text-white border-zinc-750 dark:bg-zinc-800 dark:text-zinc-50'
              }`}
            >
              <div className="shrink-0">
                {t.type === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                {t.type === 'warning' && <Terminal className="w-4 h-4 text-red-500" />}
                {t.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="text-xs font-semibold leading-relaxed">
                {t.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <CheapshoraProvider>
      <MainAppContent />
    </CheapshoraProvider>
  );
}
