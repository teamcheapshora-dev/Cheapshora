/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState } from '../types';

export const INITIAL_STATE: AppState = {
  groups: [
    { id: 'g-quick', name: '🚀 Quick Access', description: 'Your most visited digital launching pads', order: 1 },
    { id: 'g-dev', name: '📚 Tech & Development', description: 'Documentation, design tools, and code guides', order: 2 },
    { id: 'g-social', name: '🎬 Media & Personal', description: 'Relaxation and stay up to date', order: 3 },
  ],
  shortcuts: [
    {
      id: 's-google',
      title: 'Google',
      url: 'https://www.google.com',
      groupId: 'g-quick',
      clickCount: 12,
      createdAt: Date.now() - 5000000,
    },
    {
      id: 's-github',
      title: 'GitHub',
      url: 'https://github.com',
      groupId: 'g-quick',
      clickCount: 25,
      createdAt: Date.now() - 4000000,
    },
    {
      id: 's-aistudio',
      title: 'Google AI Studio',
      url: 'https://aistudio.google.com',
      groupId: 'g-quick',
      clickCount: 42,
      createdAt: Date.now() - 3000000,
    },
    {
      id: 's-react',
      title: 'React Docs',
      url: 'https://react.dev',
      groupId: 'g-dev',
      clickCount: 8,
      createdAt: Date.now() - 2000000,
    },
    {
      id: 's-tailwind',
      title: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
      groupId: 'g-dev',
      clickCount: 15,
      createdAt: Date.now() - 1000000,
    },
    {
      id: 's-mdn',
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      groupId: 'g-dev',
      clickCount: 4,
      createdAt: Date.now() - 800000,
    },
    {
      id: 's-youtube',
      title: 'YouTube',
      url: 'https://youtube.com',
      groupId: 'g-social',
      clickCount: 19,
      createdAt: Date.now() - 700000,
    },
    {
      id: 's-spotify',
      title: 'Spotify Web Player',
      url: 'https://open.spotify.com',
      groupId: 'g-social',
      clickCount: 31,
      createdAt: Date.now() - 600000,
    },
    {
      id: 's-wikipedia',
      title: 'Wikipedia',
      url: 'https://wikipedia.org',
      groupId: 'g-dev',
      clickCount: 3,
      createdAt: Date.now() - 500000,
    }
  ],
  tasks: [
    {
      id: 't-1',
      text: 'Draft the development roadmap for future features',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 't-2',
      text: 'Conduct deep clean of browser configuration cache',
      completed: true,
      priority: 'medium',
      createdAt: Date.now() - 3600000 * 8,
    },
    {
      id: 't-3',
      text: 'Establish Pomodoro focus intervals for personal writing',
      completed: false,
      priority: 'low',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      createdAt: Date.now() - 3600000 * 12,
    }
  ],
  notes: [
    {
      id: 'n-1',
      title: '💡 Cheapshora Web OS Welcomer',
      content: `### Welcome to **Cheapshora** Productivity OS!

This is your unified browser-based operating desk. All your shortcuts, workflows, tasks, and focus statistics are preserved locally in your browser's \`localStorage\` — meaning maximum privacy.

**⚡ Essential Shortcuts:**
*   **Search / Command Console:** Click the search bar at the top, or press \`Ctrl + K\` (or \`Cmd + K\`) to search bookmarks, toggle screens, or create quick shortcuts.
*   **Pomodoro Engine:** Click the **Start** button in the focus card to run targeted intervals, equipped with high-fidelity acoustic notification beeps (powered natively via Web Audio).
*   **Flexible Grouping:** Collapsible panels allow you to arrange, sort, and launch your workflows at high speed.

Enjoy a fully distraction-free workspace!`,
      updatedAt: Date.now() - 1000000,
    },
    {
      id: 'n-2',
      title: '✍️ Personal Learning Backlog',
      content: `### 🎯 Core Objectives for Q2
*   Familiarize with standard Web Synthesizers and Web Audio APIs.
*   Configure Google Calendars integrations for visual workflow mapping.
*   Refine responsive column boundaries during ultra-wide desktop rendering.
*   Review PWA stand-alone manifests for mobile launcher testing.

### Ref Links
- [Vite Documentation](https://vite.dev)
- [React Hooks Guide](https://react.dev/reference/react)
- [Lucide Icons Guide](https://lucide.dev)`,
      updatedAt: Date.now() - 200000,
    }
  ],
  settings: {
    calendarUrl: 'https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York',
    theme: 'dark',
    pomodoroWorkTime: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    bgGlass: true,
  },
};
