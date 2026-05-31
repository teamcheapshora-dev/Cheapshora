/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Coffee, Check, BellRing } from 'lucide-react';
import { useCheapshora } from '../context/CheapshoraContext';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const Pomodoro: React.FC = () => {
  const { state } = useCheapshora();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(state.settings.pomodoroWorkTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalsCompleted, setIntervalsCompleted] = useState(0);

  // Keep ref to avoid sync lag
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with state settings when settings change
  useEffect(() => {
    if (!isRunning) {
      resetTimer(mode);
    }
  }, [state.settings]);

  // Handle countdown trigger
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  // Native synthesised Audio Notification - Zero network/file fetches
  const triggerAlarmSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      // High-quality triple-tone chime chord (C5 -> E5 -> G5)
      playTone(523.25, now, 0.4); // C5
      playTone(659.25, now + 0.15, 0.4); // E5
      playTone(783.99, now + 0.3, 0.6); // G5
    } catch (e) {
      console.error('Audio synthesizer blocked or un-instantiated:', e);
    }
  };

  const handleTimerExpiry = () => {
    setIsRunning(false);
    triggerAlarmSound();

    if (mode === 'work') {
      setIntervalsCompleted((prev) => prev + 1);
      // Auto toggle to shortBreak as smart default
      const nextMode = (intervalsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      resetTimer(nextMode);
    } else {
      setMode('work');
      resetTimer('work');
    }
  };

  const resetTimer = (newMode: TimerMode = mode) => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let durationMins = state.settings.pomodoroWorkTime;
    if (newMode === 'shortBreak') durationMins = state.settings.pomodoroShortBreak;
    if (newMode === 'longBreak') durationMins = state.settings.pomodoroLongBreak;

    setTimeLeft(durationMins * 60);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    resetTimer(newMode);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatMinSec = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Compute percentage for dashboard visual ring
  const totalDuration = (mode === 'work' ? state.settings.pomodoroWorkTime :
                        mode === 'shortBreak' ? state.settings.pomodoroShortBreak :
                        state.settings.pomodoroLongBreak) * 60;
  const progressRatio = totalDuration > 0 ? (timeLeft / totalDuration) : 0;
  const strokeDashoffset = 220 - (220 * progressRatio);

  return (
    <div id="cheapshora-pomodoro-widget" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">
            Focus Interval
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
          <span>Stretches: {intervalsCompleted}</span>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl mb-6">
        <button
          onClick={() => handleModeChange('work')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'work'
              ? 'bg-white dark:bg-zinc-800 text-orange-500 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Work
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'shortBreak'
              ? 'bg-white dark:bg-zinc-800 text-teal-500 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Short
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            mode === 'longBreak'
              ? 'bg-white dark:bg-zinc-800 text-indigo-500 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Long
        </button>
      </div>

      {/* Main Clock Face Display */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Circular Countdown Progress SVG */}
          <svg className="absolute -rotate-90 w-full h-full" viewBox="0 0 100 100">
            {/* Background static circle */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-zinc-100 dark:text-zinc-800"
            />
            {/* Countdown dynamic progress */}
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeDasharray="220"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                mode === 'work' ? 'text-orange-500' : mode === 'shortBreak' ? 'text-teal-500' : 'text-indigo-500'
              }`}
            />
          </svg>

          {/* Central timer textual countdown */}
          <div className="flex flex-col items-center justify-center z-10">
            <span className="font-mono text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {formatMinSec(timeLeft)}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest font-bold uppercase mt-1">
              {mode === 'work' ? 'FOCUS' : mode === 'shortBreak' ? 'BREAK' : 'RELAX'}
            </span>
          </div>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Play / pause */}
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-11 h-11 rounded-xl text-white transition-all transform active:scale-90 shadow-md ${
            isRunning
              ? 'bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-650 shadow-zinc-800/20'
              : mode === 'work'
              ? 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/25'
              : mode === 'shortBreak'
              ? 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25'
              : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/25'
          }`}
          title={isRunning ? 'Pause Session' : 'Start Session'}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
        </button>

        {/* Reset */}
        <button
          onClick={() => resetTimer(mode)}
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50 transition-all transform active:scale-90 shadow-sm"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
