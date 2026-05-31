/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Sliders, Database, Terminal, Clock, Sparkles } from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onOpenAddShortcut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchQuery,
  onOpenCommandPalette,
  onOpenSettings,
  onOpenAddShortcut,
}) => {
  const { state, updateSettings } = useCheapshora();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    updateSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const formatTime = (t: Date) => {
    return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (t: Date) => {
    return t.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const completedCount = state.tasks.filter((t) => t.completed).length;
  const activeCount = state.tasks.filter((t) => !t.completed).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-sm overflow-hidden select-none">
            {/* Direct Logo Loader */}
            <img
              id="cheapshora-logo-img"
              src="https://i.postimg.cc/R6xTW320/cheapshora-logo-1.png"
              alt="Cheapshora Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain transition-transform"
              onError={(e) => {
                // If it fails, degrade gracefully replacing image with nice SVG-like label letter C
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallbackEl = parent.querySelector('#cheapshora-logo-fallback');
                  if (fallbackEl) fallbackEl.classList.remove('hidden');
                }
              }}
            />
            {/* Fallback visual letter badge */}
            <div
              id="cheapshora-logo-fallback"
              className="hidden absolute inset-0 flex items-center justify-center font-bold text-lg text-theme-indigo bg-gradient-to-tr from-indigo-500 to-violet-600 text-white w-full h-full"
            >
              C
            </div>
          </div>
          
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-extrabold tracking-tight text-lg text-zinc-900 dark:text-white">
                Cheapshora
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold border border-indigo-500/20">
                OS
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Daily Starting Desk
            </p>
          </div>
        </div>

        {/* Center: Search & Command Palette Gateway */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search shortcuts, groups, notes... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onClick={onOpenCommandPalette}
              className="w-full bg-zinc-100/80 dark:bg-zinc-900/85 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-transparent focus:border-indigo-500/80 rounded-xl pl-9 pr-20 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 transition-all shadow-inner"
            />
            {/* Keyboard hint badge */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-md">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Clock & Quick Utilities */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Stat (Visible on larger screen) */}
          <div className="hidden lg:flex items-center gap-3 font-mono text-xs text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 pr-4">
            <div className="text-right">
              <div className="text-zinc-400">TASKS</div>
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                {completedCount}/{state.tasks.length} Done
              </div>
            </div>
            <div className="text-right">
              <div className="text-zinc-400">SHORTCUTS</div>
              <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                {state.shortcuts.length} links
              </div>
            </div>
          </div>

          {/* Time & Date Display */}
          <div className="hidden sm:flex flex-col items-end shrink-0 font-mono select-none">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              {formatTime(time)}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">
              {formatDate(time)}
            </span>
          </div>

          {/* Action Buttons Hub */}
          <div className="flex items-center gap-1.5">
            {/* Command Line Launcher (Mobile-only search trigger) */}
            <button
              onClick={onOpenCommandPalette}
              title="Search OS & Actions"
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-950 hover:text-indigo-500 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 active:scale-95 transition-all"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={state.settings.theme === 'dark' ? 'Theme: Light' : 'Theme: Dark'}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 active:scale-95 transition-all"
            >
              {state.settings.theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600 transition-transform hover:scale-110" />
              )}
            </button>

            {/* Quick backup / settings trigger */}
            <button
              onClick={onOpenSettings}
              title="Cheapshora Settings"
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 active:scale-95 transition-all"
            >
              <Sliders className="h-5 w-5 hover:text-indigo-500 transition-colors" />
            </button>

            {/* Direct quick-add shortcut button */}
            <button
              onClick={onOpenAddShortcut}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all shadow-md active:scale-95 shadow-indigo-500/10 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-100 animate-bounce" />
              <span>Add Launcher v2</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
