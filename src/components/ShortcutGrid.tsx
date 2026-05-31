/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  FolderPlus,
  Sparkles,
  Bookmark,
  Shuffle,
  ChevronUp,
  X
} from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';
import { Group, Shortcut } from '../types';

interface ShortcutGridProps {
  searchQuery: string;
  isAddShortcutOpen: boolean;
  onCloseAddShortcut: () => void;
}

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({
  searchQuery,
  isAddShortcutOpen,
  onCloseAddShortcut,
}) => {
  const {
    state,
    addShortcut,
    updateShortcut,
    deleteShortcut,
    incrementShortcutClick,
    addGroup,
    updateGroup,
    deleteGroup,
  } = useCheapshora();

  // Collapsed status map: { [groupId]: boolean }
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Shortcut modals
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [sTitle, setSTitle] = useState('');
  const [sUrl, setSUrl] = useState('');
  const [sGroupId, setSGroupId] = useState('');

  // Group modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');

  // Floating adding states
  const [tempTitle, setTempTitle] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [tempGroupId, setTempGroupId] = useState('');

  const toggleGroupCollapse = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAddNewShortcut = (gId: string) => {
    setTempTitle('');
    setTempUrl('');
    setTempGroupId(gId);
    // Trigger callback or show internal drawer
  };

  const handleShortcutLaunch = (shortcut: Shortcut) => {
    incrementShortcutClick(shortcut.id);
    window.open(shortcut.url, '_blank', 'noopener,noreferrer');
  };

  // Group Form submission
  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim()) return;
    if (editingGroup) {
      updateGroup(editingGroup.id, gName, gDesc);
    } else {
      addGroup(gName, gDesc);
    }
    // Reset Form
    setGName('');
    setGDesc('');
    setEditingGroup(null);
    setIsGroupModalOpen(false);
  };

  // Shortcut Form submission
  const handleShortcutUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShortcut || !sTitle.trim() || !sUrl.trim()) return;
    updateShortcut(editingShortcut.id, sTitle, sUrl, sGroupId);
    setEditingShortcut(null);
  };

  // Quick Inline Shortcut add to a specific group
  const handleQuickAddShortcut = (groupId: string) => {
    if (!tempTitle.trim() || !tempUrl.trim()) return;
    addShortcut(tempTitle, tempUrl, groupId);
    // Reset
    setTempTitle('');
    setTempUrl('');
    setTempGroupId('');
  };

  // Helper: Extract favicon safely
  const getFaviconUrl = (urlStr: string) => {
    try {
      // Extract hostname
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return `https://s2.googleusercontent.com/s2/favicons?domain_url=${encodeURIComponent(parsed.origin)}&sz=64`;
    } catch {
      return `https://s2.googleusercontent.com/s2/favicons?domain_url=${encodeURIComponent(urlStr)}&sz=64`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="font-sans font-extrabold text-sm text-zinc-900 dark:text-white">
            Workspace Launchers
          </h2>
          <p className="text-[11px] text-zinc-500 font-medium">
            Collapsible groups sorting URLs dynamically by clicks frequency.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add Group */}
          <button
            onClick={() => {
              setEditingGroup(null);
              setGName('');
              setGDesc('');
              setIsGroupModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-505" />
            <span>New Group</span>
          </button>
        </div>
      </div>

      {/* Main Groups Render Section */}
      <div className="space-y-5">
        {state.groups.map((group) => {
          // Filter shortcuts for this group
          const groupShortcuts = state.shortcuts.filter((s) => s.groupId === group.id);
          
          // Match Search Queries
          const matchedShortcuts = groupShortcuts.filter(
            (sh) =>
              sh.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              sh.url.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          // Sort items inside group: Clicks frequency descending (most frequent first)
          const sortedShortcuts = [...matchedShortcuts].sort((a, b) => b.clickCount - a.clickCount);

          const isCollapsed = collapsedGroups[group.id] || false;
          
          // Skip drawing group if search results empty and searching
          if (searchQuery && matchedShortcuts.length === 0) return null;

          return (
            <div
              key={group.id}
              className={`bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all duration-300 ${isCollapsed ? 'pb-0' : 'pb-4'}`}
            >
              {/* Group Title bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-805/80 bg-zinc-50/50 dark:bg-zinc-950/25">
                <button
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="flex items-center gap-2.5 text-left cursor-pointer select-none group"
                >
                  <div className="text-zinc-400 group-hover:text-zinc-650 transition-colors">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-sans font-extrabold text-sm text-zinc-800 dark:text-zinc-100 block">
                      {group.name}
                    </span>
                    {group.description && (
                      <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">
                        {group.description}
                      </span>
                    )}
                  </div>
                </button>

                {/* Group Management icons */}
                <div className="flex items-center gap-1">
                  {/* Plus shortcut launcher */}
                  <button
                    onClick={() => {
                      setTempGroupId(tempGroupId === group.id ? '' : group.id);
                      setTempTitle('');
                      setTempUrl('');
                    }}
                    className="p-1.5 rounded-lg text-zinc-550 hover:text-indigo-505 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Quick-add shortcut inside group"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Edit group */}
                  <button
                    onClick={() => {
                      setEditingGroup(group);
                      setGName(group.name);
                      setGDesc(group.description || '');
                      setIsGroupModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-505 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Edit group identity"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Trash group */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete workspace group "${group.name}"? All shortcuts inside will be cleaned up too.`)) {
                        deleteGroup(group.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    title="Delete group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Inline Add input line */}
              {tempGroupId === group.id && (
                <div className="px-5 py-3 border-b border-zinc-100/55 dark:border-zinc-850/50 bg-indigo-50/10 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1">
                    <Bookmark className="w-3.5 h-3.5 text-zinc-450" />
                    <input
                      type="text"
                      placeholder="App Title (e.g., GitHub)"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="bg-transparent border-none text-xs outline-none py-1 flex-1 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div className="flex-1 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1">
                    <input
                      type="text"
                      placeholder="URL Link (e.g., github.com)"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      className="bg-transparent border-none text-xs outline-none py-1 w-full text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleQuickAddShortcut(group.id)}
                      disabled={!tempTitle.trim() || !tempUrl.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg px-3.5 py-2 sm:py-1.5 text-xs font-bold w-full sm:w-auto transition-colors cursor-pointer"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setTempGroupId('')}
                      className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350 rounded-lg px-3 py-2 sm:py-1.5 text-xs font-bold transition-all"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Shortcuts Grid body list */}
              {!isCollapsed && (
                <div className="px-5 pt-4">
                  {sortedShortcuts.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs font-medium">
                      <span>No launchers loaded inside.</span>
                      <button
                        onClick={() => setTempGroupId(group.id)}
                        className="text-indigo-505 font-bold hover:underline ml-1 cursor-pointer"
                      >
                        Create launcher
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sortedShortcuts.map((shortcut) => {
                        return (
                          <div
                            key={shortcut.id}
                            className="group/item relative bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-950/60 border border-zinc-100/80 dark:border-zinc-805/50 hover:border-zinc-205 dark:hover:border-zinc-750 p-3 h-[76px] rounded-xl transition-all duration-200 flex items-center gap-3 shadow-xs hover:shadow-xs"
                          >
                            {/* Launch link trigger */}
                            <button
                              onClick={() => handleShortcutLaunch(shortcut)}
                              className="absolute inset-0 z-10 w-full h-full text-left"
                            />

                            {/* Shortcut Favicon icon */}
                            <div className="relative z-20 shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 flex items-center justify-center overflow-hidden shadow-xs">
                              <img
                                src={getFaviconUrl(shortcut.url)}
                                alt={shortcut.title}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  // Fallback badge
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector('.letter-fallback');
                                    if (fallback) fallback.classList.remove('hidden');
                                  }
                                }}
                              />
                              {/* Letter visual fallback code */}
                              <div className="letter-fallback hidden absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-zinc-500 to-zinc-600 font-bold text-sm text-white capitalize w-full h-full font-sans select-none">
                                {shortcut.title.charAt(0)}
                              </div>
                            </div>

                            {/* Label textual values */}
                            <div className="min-w-0 pr-4">
                              <span className="font-sans font-bold text-xs text-zinc-800 dark:text-zinc-200 leading-tight block truncate">
                                {shortcut.title}
                              </span>
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate block leading-normal mt-0.5">
                                {shortcut.url.replace(/^https?:\/\/(www\.)?/i, '')}
                              </span>
                              
                              {/* Click counts badge */}
                              {shortcut.clickCount > 0 && (
                                <span className="inline-block mt-1 text-[9px] font-mono bg-zinc-100 dark:bg-zinc-805 text-zinc-400 dark:text-zinc-550 border border-zinc-200/30 dark:border-zinc-750 pr-1 pl-1 py-0.5 rounded-md leading-none font-bold">
                                  {shortcut.clickCount} uses
                                </span>
                              )}
                            </div>

                            {/* Individual edit-delete overlay controls on hover */}
                            <div className="absolute right-2 top-2 z-20 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              {/* Edit bookmark */}
                              <button
                                onClick={() => {
                                  setEditingShortcut(shortcut);
                                  setSTitle(shortcut.title);
                                  setSUrl(shortcut.url);
                                  setSGroupId(shortcut.groupId);
                                }}
                                className="p-1 rounded bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 border border-zinc-200/40 dark:border-zinc-800/80 transition-colors shadow-xs cursor-pointer"
                                title="Edit bookmark details"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>

                              {/* Remove bookmark */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete shortcut "${shortcut.title}" permanently?`)) {
                                    deleteShortcut(shortcut.id);
                                  }
                                }}
                                className="p-1 rounded bg-white hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/40 text-zinc-405 hover:text-red-500 border border-zinc-200/40 dark:border-zinc-800/80 transition-colors shadow-xs cursor-pointer"
                                title="Delete bookmark"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Add Floating Window inside Grid Trigger (Standard Portal Settings modal layout) */}
      {isAddShortcutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs cursor-zoom-out" onClick={onCloseAddShortcut} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-sans font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Add Launcher Shortcut
              </h3>
              <button onClick={onCloseAddShortcut} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!sTitle.trim() || !sUrl.trim() || !sGroupId) return;
                addShortcut(sTitle, sUrl, sGroupId);
                onCloseAddShortcut();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Title Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub"
                  value={sTitle}
                  onChange={(e) => setSTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Web Link URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. github.com"
                  value={sUrl}
                  onChange={(e) => setSUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Workspace Group</label>
                <select
                  required
                  value={sGroupId}
                  onChange={(e) => setSGroupId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-800 dark:text-zinc-200"
                >
                  <option value="">-- Choose Category --</option>
                  {state.groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  disabled={!sTitle.trim() || !sUrl.trim() || !sGroupId}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Create Bookmark Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Shortcut Overlay */}
      {editingShortcut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs cursor-zoom-out" onClick={() => setEditingShortcut(null)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-sans font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-indigo-505" />
                Edit Shortcut
              </h3>
              <button onClick={() => setEditingShortcut(null)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShortcutUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Title Name</label>
                <input
                  type="text"
                  required
                  value={sTitle}
                  onChange={(e) => setSTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Web Link URL</label>
                <input
                  type="text"
                  required
                  value={sUrl}
                  onChange={(e) => setSUrl(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Workspace Group</label>
                <select
                  required
                  value={sGroupId}
                  onChange={(e) => setSGroupId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
                >
                  {state.groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingShortcut(null)}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-350 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Group Create/Edit Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs cursor-zoom-out" onClick={() => setIsGroupModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl p-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
              <h3 className="font-sans font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-indigo-500" />
                {editingGroup ? 'Edit Group parameters' : 'Create Workspace Group'}
              </h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGroupSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5 font-sans">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Personal Works"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-405 dark:text-zinc-500 uppercase tracking-wide mb-1.5 font-sans">Brief Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Spreadsheets, logs, documents"
                  value={gDesc}
                  onChange={(e) => setGDesc(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingGroup ? 'Save Updates' : 'Add Group'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-305 rounded-xl px-4 py-2 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
