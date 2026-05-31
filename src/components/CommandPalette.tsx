/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bookmark,
  CheckSquare,
  FileText,
  Sparkles,
  Command,
  CornerDownLeft,
  X,
  HelpCircle,
  HelpCircle as HelpIcon,
  Moon,
  Laptop,
  ArrowRight,
  Database,
  Plus,
  Terminal
} from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, showToast }) => {
  const {
    state,
    addShortcut,
    addGroup,
    addTask,
    addNote,
    updateSettings,
    setActiveNoteId,
    exportData,
    resetToDefaults
  } = useCheapshora();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Trap focus and close on outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 1. Filter our lists based on the query, excluding commands
  const queryLower = query.toLowerCase().trim();
  const isCommandMode = query.startsWith('/');

  const matchedShortcuts = isCommandMode
    ? []
    : state.shortcuts.filter(
        (s) => s.title.toLowerCase().includes(queryLower) || s.url.toLowerCase().includes(queryLower)
      );

  const matchedTasks = isCommandMode
    ? []
    : state.tasks.filter((t) => t.text.toLowerCase().includes(queryLower));

  const matchedNotes = isCommandMode
    ? []
    : state.notes.filter(
        (n) => n.title.toLowerCase().includes(queryLower) || n.content.toLowerCase().includes(queryLower)
      );

  // Group matched results
  const results: Array<{
    type: 'shortcut' | 'task' | 'note' | 'action';
    title: string;
    subtitle?: string;
    action: () => void;
    id: string;
  }> = [];

  // Generate Quick Actions
  const basicActions = [
    {
      id: 'act-theme',
      type: 'action' as const,
      title: '🌓 Toggle Dark/Light Theme',
      subtitle: 'Switch application color palette',
      action: () => {
        updateSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' });
        showToast('App theme changed successfully!', 'success');
        onClose();
      },
    },
    {
      id: 'act-export',
      type: 'action' as const,
      title: '💾 Export OS JSON Backup',
      subtitle: 'Download your config and bookmarks as JSON',
      action: () => {
        exportData();
        showToast('Local database backup exported!', 'success');
        onClose();
      },
    },
    {
      id: 'act-reset',
      type: 'action' as const,
      title: '⚠️ Restore Factory Demo Defaults',
      subtitle: 'Overwrites current custom records with defaults',
      action: () => {
        resetToDefaults();
        onClose();
      },
    },
  ];

  // Populate search results
  matchedShortcuts.forEach((s) => {
    results.push({
      id: s.id,
      type: 'shortcut',
      title: s.title,
      subtitle: s.url,
      action: () => {
        window.open(s.url, '_blank', 'noopener,noreferrer');
        showToast(`Launching ${s.title}...`, 'info');
        onClose();
      },
    });
  });

  matchedTasks.forEach((t) => {
    results.push({
      id: t.id,
      type: 'task',
      title: `${t.completed ? '✓' : '☐'} ${t.text}`,
      subtitle: `Task Priorities | ${t.priority.toUpperCase()}`,
      action: () => {
        showToast(`Located Task: "${t.text.substring(0, 20)}..."`, 'info');
        onClose();
      },
    });
  });

  matchedNotes.forEach((n) => {
    results.push({
      id: n.id,
      type: 'note',
      title: n.title,
      subtitle: 'View custom markdown document',
      action: () => {
        setActiveNoteId(n.id);
        const el = document.getElementById('cheapshora-notes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        showToast(`Note centered: "${n.title}"`, 'info');
        onClose();
      },
    });
  });

  // Always append matching generic system actions
  basicActions.forEach((act) => {
    if (queryLower === '' || act.title.toLowerCase().includes(queryLower) || act.subtitle.toLowerCase().includes(queryLower)) {
      results.push(act);
    }
  });

  // Handle command interpretation if starts with "/"
  const commandHelp = {
    valid: false,
    text: '',
    example: '',
    execute: () => {},
  };

  if (isCommandMode) {
    const cleanCmd = query.substring(1).trim();
    const parts = cleanCmd.split(' ');
    const commandName = parts[0].toLowerCase();
    const argsString = parts.slice(1).join(' ');

    if (commandName === 'add') {
      commandHelp.valid = true;
      if (!argsString) {
        commandHelp.text = 'Add a new shortcut bookmark';
        commandHelp.example = '/add [Title] [URL]';
      } else {
        const spaceIdx = argsString.indexOf(' ');
        const urlPart = spaceIdx !== -1 ? argsString.substring(spaceIdx + 1) : argsString;
        const titlePart = spaceIdx !== -1 ? argsString.substring(0, spaceIdx) : 'Bookmark';

        commandHelp.text = `Add shortcut "${titlePart}" pointing to "${urlPart}"`;
        commandHelp.example = 'Press ENTER to write into layout';
        commandHelp.execute = () => {
          // Put in first group available
          const defaultGroupId = state.groups[0]?.id || 'g-quick';
          addShortcut(titlePart, urlPart, defaultGroupId);
          showToast(`Added shortcut "${titlePart}"!`, 'success');
          onClose();
        };
      }
    } else if (commandName === 'group' || (commandName === 'create' && parts[1]?.toLowerCase() === 'group')) {
      commandHelp.valid = true;
      const groupName = commandName === 'group' ? argsString : parts.slice(2).join(' ');
      if (!groupName) {
        commandHelp.text = 'Deconstruct workspace categories';
        commandHelp.example = '/group [Group Name]';
      } else {
        commandHelp.text = `Create workspace group "${groupName}"`;
        commandHelp.example = 'Press ENTER to create group';
        commandHelp.execute = () => {
          addGroup(groupName);
          showToast(`Created workspace group "${groupName}"!`, 'success');
          onClose();
        };
      }
    } else if (commandName === 'task') {
      commandHelp.valid = true;
      if (!argsString) {
        commandHelp.text = 'Insert a new item to Checklist';
        commandHelp.example = '/task [Task instructions]';
      } else {
        commandHelp.text = `Append high priority task: "${argsString}"`;
        commandHelp.example = 'Press ENTER to append checklist';
        commandHelp.execute = () => {
          addTask(argsString, 'medium');
          showToast(`Added checklist task: "${argsString.substring(0, 25)}..."`, 'success');
          onClose();
        };
      }
    } else if (commandName === 'note') {
      commandHelp.valid = true;
      if (!argsString) {
        commandHelp.text = 'Instantiate a fresh scratch note';
        commandHelp.example = '/note [Note Title]';
      } else {
        commandHelp.text = `Create note titled "${argsString}"`;
        commandHelp.example = 'Press ENTER to instantiate note';
        commandHelp.execute = () => {
          const newId = addNote(argsString, `### ${argsString}\nCreated via Cheapshora CLI\n\nStart writing notes here...`);
          showToast(`Instantiated Note "${argsString}"`, 'success');
          onClose();
        };
      }
    } else if (commandName === 'theme') {
      commandHelp.valid = true;
      commandHelp.text = 'Switch Light/Dark themes';
      commandHelp.example = 'Press ENTER to invoke toggle';
      commandHelp.execute = () => {
        updateSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' });
        showToast('Toggled display scheme!', 'success');
        onClose();
      };
    } else {
      commandHelp.valid = false;
      commandHelp.text = 'Command unrecognized or incomplete.';
      commandHelp.example = 'Type /add, /group, /task, /note, or /theme';
    }
  }

  // Set up Keyboard Handler inside palette
  const handleKeyDown = (e: React.KeyboardEventHTMLOrButtonElement & any) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isCommandMode) {
        if (commandHelp.valid && commandHelp.execute) {
          commandHelp.execute();
        }
      } else if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 md:pt-[10vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/70 backdrop-blur-sm cursor-zoom-out"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            ref={containerRef}
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] md:max-h-[600px]"
            onKeyDown={handleKeyDown}
          >
            {/* Input wrap */}
            <div className="relative border-b border-zinc-100 dark:border-zinc-800 flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isCommandMode ? (
                  <Terminal className="h-5 w-5 text-indigo-500 animate-pulse" />
                ) : (
                  <Search className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type command /add, /task, /group, /theme, or search everything..."
                className="w-full h-14 bg-transparent outline-none pl-11 pr-12 text-sm text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500"
              />
              <button
                onClick={onClose}
                className="absolute right-3 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {/* Command CLI Prompt Preview Card */}
              {isCommandMode && (
                <div className="p-3 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-900/30 rounded-xl mb-2">
                  <div className="flex items-center gap-2 mb-1.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive Keyboard Console
                  </div>
                  <div className="text-sm font-semibold">{commandHelp.text}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-1 flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                    {commandHelp.example}
                  </div>
                </div>
              )}

              {/* No items indicator */}
              {!isCommandMode && results.length === 0 && (
                <div className="py-12 px-4 text-center">
                  <HelpCircle className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                    No matching shortcuts, files, or settings found.
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
                    Type `/add google.com` or similar to quickly create shortcuts.
                  </p>
                </div>
              )}

              {/* Results List */}
              {!isCommandMode && results.length > 0 && (
                <div className="space-y-1">
                  {results.map((res, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={res.id}
                        onClick={res.action}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 shadow-sm'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950/55'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            {res.type === 'shortcut' && <Bookmark className="w-4 h-4 text-emerald-500" />}
                            {res.type === 'task' && <CheckSquare className="w-4 h-4 text-blue-500" />}
                            {res.type === 'note' && <FileText className="w-4 h-4 text-amber-500" />}
                            {res.type === 'action' && <Command className="w-4 h-4 text-indigo-500" />}
                          </div>
                          <div>
                            <span className="text-sm font-medium block leading-tight">{res.title}</span>
                            {res.subtitle && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-tight mt-0.5 block truncate max-w-sm md:max-w-md">
                                {res.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-600 font-bold shrink-0">
                            <span>Open</span>
                            <CornerDownLeft className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer containing quick action tips */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 py-2.5 px-4 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 select-none font-mono font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white dark:bg-zinc-800 px-1 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-md">↑↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white dark:bg-zinc-800 px-1  py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-md">⏎</kbd>
                  to select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-white dark:bg-zinc-800 px-1  py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-md">ESC</kbd>
                to dismiss
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
