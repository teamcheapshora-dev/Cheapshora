/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, BookOpen, Eye, Save, Sparkles, Search, FileText } from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';

export const NotesArea: React.FC = () => {
  const { state, addNote, updateNote, deleteNote, activeNoteId, setActiveNoteId } = useCheapshora();

  const [searchQuery, setSearchQuery] = useState('');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');

  const activeNote = state.notes.find((n) => n.id === activeNoteId) || state.notes[0] || null;

  const handleCreateNote = () => {
    const freshId = addNote('✍️ Untitled Notepad', '### New Note\nType your thoughts here...');
    setEditorMode('edit');
  };

  const filteredNotes = state.notes.filter(
    (n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom high-performance inline Markdown-to-HTML parser safe for React 19
  const parseMarkdownToHtml = (markdownText: string) => {
    if (!markdownText) return '';
    
    let html = markdownText
      // Escape HTML chars
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      
      // H3
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-extrabold text-zinc-900 dark:text-white mt-4 mb-2 tracking-tight">$1</h3>')
      // H2
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-zinc-900 dark:text-white mt-5 mb-2.5 tracking-tight border-b border-zinc-100 dark:border-zinc-800 pb-1">$1</h2>')
      // H1
      .replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-zinc-900 dark:text-white mt-6 mb-3 tracking-tight">$1</h1>')
      
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-zinc-900 dark:text-white">$1</strong>')
      // Italics *text*
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code tags `code`
      .replace(/`(.*?)`/g, '<code class="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 text-indigo-500 rounded px-1 py-0.5">$1</code>')
      
      // List items * list items
      .replace(/^\*\s(.*$)/gim, '<li class="ml-4 list-disc text-xs text-zinc-700 dark:text-zinc-350 my-1">$1</li>')
      // List items - list items
      .replace(/^-\s(.*$)/gim, '<li class="ml-4 list-disc text-xs text-zinc-700 dark:text-zinc-350 my-1">$1</li>')
      
      // Links [text](url)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-500">$1</a>')
      
      // Double returns to paragraph
      .replace(/\n\n/g, '<div class="h-3"></div>')
      // Single breaks
      .replace(/\n/g, '<br/>');

    // Return encapsulated in a styled layout
    return `<div class="space-y-1.5">${html}</div>`;
  };

  return (
    <section id="cheapshora-notes-section" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Visual Title */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">
            Workspace Notes
          </span>
        </div>
        <button
          onClick={handleCreateNote}
          className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-505" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[480px]">
        {/* Left: Notes sidebar */}
        <div className="md:col-span-4 flex flex-col border-r border-zinc-100 dark:border-zinc-805/80 pr-4 h-full overflow-hidden">
          {/* List Search */}
          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Notes Scroller list */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs font-medium">
                No notes match filter.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = activeNote && note.id === activeNote.id;
                // Grab snippet
                const snippet = note.content
                  .replace(/[#*`\-]/g, '')
                  .substring(0, 45) + '...';

                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setEditorMode('edit');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer block ${
                      isActive
                        ? 'bg-zinc-50 dark:bg-zinc-805 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700 shadow-sm'
                        : 'border-transparent text-zinc-650 hover:bg-zinc-50/70 dark:hover:bg-zinc-950/40'
                    }`}
                  >
                    <span className="font-sans font-bold text-xs truncate block">
                      {note.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate block mt-1 leading-normal">
                      {snippet}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Focused Note Active Canvas */}
        <div className="md:col-span-8 flex flex-col h-full overflow-hidden">
          {activeNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Note Sub-Header (title editing and view toggle) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-805/80 mb-3 shrink-0">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, e.target.value, activeNote.content)}
                  className="bg-transparent font-sans font-extrabold text-base text-zinc-900 dark:text-white outline-none border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-750 pb-0.5 max-w-xs sm:max-w-md"
                  placeholder="Note Title"
                />

                {/* Switch Modes */}
                <div className="flex items-center gap-1.5">
                  <div className="flex bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => setEditorMode('edit')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer ${
                        editorMode === 'edit'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      <Edit3 className="w-3 h-3 text-indigo-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setEditorMode('preview')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer ${
                        editorMode === 'preview'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                          : 'text-zinc-505'
                      }`}
                    >
                      <BookOpen className="w-3 h-3 text-teal-500" />
                      <span>Read</span>
                    </button>
                  </div>

                  {/* Delete note */}
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 shrink-0 cursor-pointer"
                    title="Delete note permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Textarea or formatted viewer */}
              <div className="flex-1 overflow-hidden">
                {editorMode === 'edit' ? (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, activeNote.title, e.target.value)}
                    className="w-full h-full bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/80 rounded-xl p-3.5 text-xs font-mono outline-none resize-none focus:ring-1 focus:ring-indigo-500/20 text-zinc-800 dark:text-zinc-300 leading-relaxed overflow-y-auto scrollbar-thin"
                    placeholder="Provide standard markdown: # H1, ## H2, **bold**, *italics*, `code`, - bullets..."
                  />
                ) : (
                  <div
                    className="w-full h-full bg-zinc-50/50 dark:bg-zinc-950/25 border border-zinc-100 dark:border-zinc-800/80 rounded-xl p-4.5 overflow-y-auto scrollbar-thin text-zinc-800 dark:text-zinc-350 leading-relaxed text-xs max-h-full font-sans break-words select-text"
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(activeNote.content) }}
                  />
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <FileText className="w-10 h-10 text-zinc-200 dark:text-zinc-800 mb-3" />
              <p className="text-sm font-medium">No notes available.</p>
              <button
                onClick={handleCreateNote}
                className="mt-3 px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition shadow-md cursor-pointer"
              >
                Create Scratch Note
              </button>
            </div>
          )}
        </div>
      </div>

    </section>
  );
};
