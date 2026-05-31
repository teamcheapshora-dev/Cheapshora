/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Sliders,
  Calendar,
  Timer,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, showToast }) => {
  const { state, updateSettings, exportData, importData, resetToDefaults } = useCheapshora();

  const [calUrl, setCalUrl] = useState(state.settings.calendarUrl);
  const [workTime, setWorkTime] = useState(state.settings.pomodoroWorkTime);
  const [shortTime, setShortTime] = useState(state.settings.pomodoroShortBreak);
  const [longTime, setLongTime] = useState(state.settings.pomodoroLongBreak);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      calendarUrl: calUrl.trim(),
      pomodoroWorkTime: Number(workTime),
      pomodoroShortBreak: Number(shortTime),
      pomodoroLongBreak: Number(longTime),
    });
    showToast('System settings updated!', 'success');
    onClose();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (typeof contents === 'string') {
        const res = importData(contents);
        if (res.success) {
          showToast('Database imported successfully!', 'success');
          onClose();
        } else {
          showToast(`Import error: ${res.error}`, 'warning');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (typeof contents === 'string') {
        const res = importData(contents);
        if (res.success) {
          showToast('Database imported successfully!', 'success');
          onClose();
        } else {
          showToast(`Import parsing failed: ${res.error}`, 'warning');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/75 backdrop-blur-sm cursor-zoom-out"
      />

      {/* Dialog box wrapper */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span className="font-sans font-bold text-sm text-zinc-900 dark:text-white">
              Cheapshora System Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Container */}
        <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {/* Section 1: Dashboard Theme Settings */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Display Scheme
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  state.settings.theme === 'light'
                    ? 'border-indigo-505 bg-indigo-50/20 text-indigo-500 dark:text-indigo-400 text-indigo-600 font-extrabold ring-1 ring-indigo-505/20'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-950/50'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  state.settings.theme === 'dark'
                    ? 'border-indigo-505 bg-indigo-950/20 text-indigo-400 font-extrabold ring-1 ring-indigo-505/25'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-950/50'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Section 2: Calendar embed configs */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Calendar Settings
            </h4>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300">
                Google Calendar Shareable URL
              </label>
              <input
                type="text"
                placeholder="https://calendar.google.com/calendar/embed?src=..."
                value={calUrl}
                onChange={(e) => setCalUrl(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-800 dark:text-zinc-200"
              />
              <p className="text-[10px] text-zinc-400 font-medium leading-normal mt-1">
                Paste the customized iframe target link (src attribute) from your Google Calendar configuration workspace. Check the "Setup Guide" inside the Calendar widget.
              </p>
            </div>
          </div>

          {/* Section 3: Pomodoro timer sliders */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-orange-500" />
              Pomodoro focus timing configurations
            </h4>
            
            <div className="space-y-4">
              {/* Focus session length */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  <span>Work Session Length</span>
                  <span className="font-mono text-indigo-505 font-extrabold">{workTime} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={workTime}
                  onChange={(e) => setWorkTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Short break length */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  <span>Short Break Length</span>
                  <span className="font-mono text-teal-500 font-extrabold">{shortTime} mins</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={shortTime}
                  onChange={(e) => setShortTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-555"
                />
              </div>

              {/* Long break length */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  <span>Long Break Length</span>
                  <span className="font-mono text-indigo-505 font-extrabold">{longTime} mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={longTime}
                  onChange={(e) => setLongTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Backup Export and Restore File Drop list */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              Local DB Portability
            </h4>

            <div className="grid grid-cols-2 gap-3.5">
              {/* JSON export button */}
              <button
                type="button"
                onClick={exportData}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/60 leading-none transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export JSON Config</span>
              </button>

              {/* JSON import file element */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/60 leading-none transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-505" />
                <span>Import JSON Config</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                className="hidden"
              />
            </div>

            {/* Drag and Drop Box area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-xl p-5 text-center transition-colors select-none"
            >
              <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                Drag & Drop JSON file here
              </p>
              <p className="text-[9px] text-zinc-400 mt-0.5">
                to instant-restore all workspace layout variables
              </p>
            </div>
          </div>

          {/* Section 5: Recovery factory defaults */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 p-4.5 rounded-xl">
            <div className="flex gap-2 max-w-xs select-none">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-350 block">Deconstruct & Reset Defaults</span>
                <span className="text-[9px] text-zinc-400 leading-normal block mt-0.5">Lose all current custom dashboard entries and reload core demo sets.</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={resetToDefaults}
              className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 border border-red-500/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset OS</span>
            </button>
          </div>

          {/* Action trigger footer */}
          <div className="flex gap-2.5 pt-4 border-t border-zinc-150 dark:border-zinc-850 shrink-0">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Save settings
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-100 dark:bg-zinc-805 text-zinc-600 dark:text-zinc-350 rounded-xl px-4 py-2 text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer"
            >
              Discard
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
