/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, HelpCircle, Eye, EyeOff, Layout } from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';

export const CalendarEmbed: React.FC = () => {
  const { state } = useCheapshora();
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  // Validate URL to avoid parsing crashes
  const calendarSrc = state.settings.calendarUrl || 'https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York';

  return (
    <div id="cheapshora-calendar-widget" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[500px]">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">
            Agenda Calendar
          </span>
        </div>
        
        {/* Toggle Helpers */}
        <button
          onClick={() => setShowConfigHelper(!showConfigHelper)}
          className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 px-2 py-1 rounded-lg cursor-pointer"
          title="See setup instructions"
        >
          {showConfigHelper ? <EyeOff className="w-3 h-3 text-zinc-400" /> : <HelpCircle className="w-3 h-3 text-indigo-500" />}
          <span>Setup Guide</span>
        </button>
      </div>

      {/* Main embed frame or config instructions */}
      <div className="flex-1 overflow-hidden relative rounded-xl border border-zinc-100 dark:border-zinc-805/80 bg-zinc-50 dark:bg-zinc-950">
        {showConfigHelper ? (
          <div className="absolute inset-0 p-4.5 overflow-y-auto scrollbar-thin text-zinc-750 dark:text-zinc-350 bg-white/95 dark:bg-zinc-900/95 leading-relaxed text-xs space-y-4 select-text">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
              <Layout className="w-4 h-4 text-indigo-500" />
              Connect Your Google Calendar
            </h4>
            <p className="font-medium text-zinc-500">
              Integrate your live Google Calendar agenda directly inside Cheapshora with 3 quick clicks:
            </p>
            <ol className="list-decimal list-inside space-y-2 font-medium">
              <li>
                Open <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-505 underline font-semibold">Google Calendar</a> in your desktop browser.
              </li>
              <li>
                Click the <strong>Settings Cog</strong> in the top-right, then select <strong>Settings</strong>.
              </li>
              <li>
                In the left sidebar, click the name of the calendar you wish to display.
              </li>
              <li>
                Scroll down to the <strong>Integrate calendar</strong> section.
              </li>
              <li>
                Locate the field labeled <strong>"Embed code"</strong> or <strong>"Public URL to this calendar"</strong>.
              </li>
              <li>
                Copy that iframe URL (only the `src` attribute string inside double quotes starting with `https://calendar.google.com/calendar/embed...`).
              </li>
              <li>
                Click <strong>Settings Cog (Sliders)</strong> in top-right of Cheapshora Header, paste the link in the calendar input field, then save!
              </li>
            </ol>
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-2 rounded-lg text-[10px] font-bold">
              Tip: Ensure calendar permission settings are configured to public (or custom invite) if it refuses to render on layout frames.
            </div>
          </div>
        ) : null}

        {/* Real iframe loader */}
        <iframe
          src={calendarSrc}
          style={{ border: '0', width: '100%', height: '100%' }}
          frameBorder="0"
          scrolling="no"
          className="bg-transparent rounded-xl dark:invert dark:hue-rotate-180 dark:opacity-85"
          title="Google Calendar Embed View"
        />
      </div>

    </div>
  );
};
