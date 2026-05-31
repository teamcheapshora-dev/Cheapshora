/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, CheckCircle2, Circle, AlertCircle, Save, Undo2 } from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';
import { Task } from '../types';

export const TaskManager: React.FC = () => {
  const { state, addTask, toggleTask, updateTask, deleteTask } = useCheapshora();

  // Create task states
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editDueDate, setEditDueDate] = useState('');

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addTask(newText, newPriority, newDueDate || undefined);
    setNewText('');
    setNewDueDate('');
    setNewPriority('medium');
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || '');
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    updateTask(id, editText, editPriority, editDueDate || undefined);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Sort tasks: Active first, sorted by creation date descending, then completed
  const sortedTasks = [...state.tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return b.createdAt - a.createdAt; // Newer tasks first
    }
    return a.completed ? 1 : -1; // Completed goes to the bottom
  });

  const filteredTasks = sortedTasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getPriorityStyles = (p: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high':
        return 'text-red-600 bg-red-500/10 border-red-500/25 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/25 dark:text-amber-400';
      case 'low':
        return 'text-sky-600 bg-sky-500/10 border-sky-500/25 dark:text-sky-450';
    }
  };

  const getDueDateLabel = (dateStr?: string) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split('T')[0];
    const itemDate = new Date(dateStr).toISOString().split('T')[0];
    
    if (itemDate === today) return 'Today';
    
    const tomorrow = new Date(Date.now() + 86450000).toISOString().split('T')[0];
    if (itemDate === tomorrow) return 'Tomorrow';

    if (itemDate < today) return 'Overdue';

    return dateStr;
  };

  return (
    <div id="cheapshora-tasks-widget" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[500px]">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-indigo-500" />
          <span className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">
            Checklist Tasks
          </span>
        </div>
        
        {/* Filters */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg text-[10px] font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-1.5 py-0.5 rounded-md cursor-pointer ${filter === 'all' ? 'bg-white dark:bg-zinc-805 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-1.5 py-0.5 rounded-md cursor-pointer ${filter === 'active' ? 'bg-white dark:bg-zinc-805 text-orange-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-1.5 py-0.5 rounded-md cursor-pointer ${filter === 'completed' ? 'bg-white dark:bg-zinc-805 text-teal-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Checklist input form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2 shrink-0">
        <input
          type="text"
          placeholder="New task... press enter or plus"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-800 dark:text-zinc-200"
        />
        
        <div className="flex items-center justify-between gap-2">
          {/* Priority picker & Due Date */}
          <div className="flex items-center gap-1.5">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 focus:outline-none"
            >
              <option value="high">High (!)</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="relative flex items-center bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg px-2 py-1 text-[10px] text-zinc-650 font-medium">
              <Calendar className="w-2.5 h-2.5 mr-1 text-zinc-400" />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="bg-transparent outline-none border-none text-[10px] font-bold text-zinc-500 dark:text-zinc-400 w-24 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Task Rows Scroll area */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-zinc-450 dark:text-zinc-500 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mb-2" />
            <span className="text-xs font-medium">No tasks found.</span>
            <span className="text-[10px] mt-0.5 text-zinc-400">All caught up!</span>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isEditing = editingId === t.id;
            const dueLabel = getDueDateLabel(t.dueDate);
            
            return (
              <div
                key={t.id}
                className={`group flex items-start gap-2.5 p-3 rounded-xl border border-zinc-100/80 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/25 hover:bg-zinc-50 dark:hover:bg-zinc-950/45 transition-colors ${
                  t.completed ? 'opacity-60' : ''
                }`}
              >
                {/* 1. Uncompleted Checkbox circle button */}
                {!isEditing && (
                  <button
                    onClick={() => toggleTask(t.id)}
                    className="mt-0.5 shrink-0 text-zinc-400 hover:text-indigo-600 dark:text-zinc-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {t.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* 2. Text body / Edit input fields */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg px-2.5 py-1 text-xs text-zinc-850 dark:text-zinc-100 focus:outline-none"
                      />
                      <div className="flex gap-1.5 items-center">
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as any)}
                          className="bg-zinc-100 dark:bg-zinc-800 border border-transparent rounded px-1.5 py-0.5 text-[9px] font-bold"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-800 border border-transparent rounded px-1.5 py-0.5 text-[9px] w-24 font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-tight break-words ${t.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : ''}`}>
                        {t.text}
                      </p>
                      
                      {/* Priority and due date badges row */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {/* Priority Badge */}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${getPriorityStyles(t.priority)}`}>
                          {t.priority}
                        </span>

                        {/* Due Date Indicator */}
                        {dueLabel && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex items-center ${
                            dueLabel === 'Overdue'
                              ? 'text-red-500 bg-red-500/10 border-red-500/20'
                              : dueLabel === 'Today'
                              ? 'text-orange-500 bg-orange-500/10 border-orange-500/20'
                              : 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-750 dark:text-zinc-400'
                          }`}>
                            <Calendar className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                            {dueLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Action edit/delete controls */}
                <div className="flex items-center gap-1 shrink-0 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveEdit(t.id)}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-teal-600 dark:text-teal-400"
                        title="Save adjustments"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                        title="Cancel"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                        title="Edit task text"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1 rounded hover:bg-red-100 hover:text-red-650 dark:hover:bg-red-950/40 text-zinc-400 dark:text-zinc-650 hover:text-red-500"
                        title="Delete task permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
