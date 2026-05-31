/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  groupId: string;
  clickCount: number;
  createdAt: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface AppSettings {
  calendarUrl: string;
  theme: 'light' | 'dark';
  pomodoroWorkTime: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  bgGlass: boolean;
}

export interface AppState {
  shortcuts: Shortcut[];
  groups: Group[];
  tasks: Task[];
  notes: Note[];
  settings: AppSettings;
}
