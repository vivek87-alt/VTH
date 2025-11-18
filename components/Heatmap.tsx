import React, { useMemo, useEffect, useRef } from 'react';
import { DailyLog, HabitStatus, DayCell } from '../types';

interface HeatmapProps {
  logs: DailyLog;
  onDayClick?: (dateStr: string) => void;
  selectedDate?: string;
}

interface MonthData {
  name: string;
  year: number;
  days: (DayCell & { isFuture: boolean } | null)[]; // null for empty spacer cells at start of month
}

const Heatmap: React.FC<HeatmapProps> = ({ logs, onDayClick, selectedDate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    const today = new Date();
    const result: MonthData[] = [];

    // Generate last 12 months (including current)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthName = d.toLocaleString('default', { month: 'short' });

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const startDayOfWeek = new Date(year, monthIndex, 1).getDay();

      const days: (DayCell & { isFuture: boolean } | null)[] = [];

      // Add empty slots for alignment
      for (let j = 0; j < startDayOfWeek; j++) {
        days.push(null);
      }

      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDayDate = new Date(year, monthIndex, day);
        const dateStr = currentDayDate.toISOString().split('T')[0];
        
        // Check if future
        const checkDate = new Date(currentDayDate);
        checkDate.setHours(0,0,0,0);
        const todayCheck = new Date(today);
        todayCheck.setHours(0,0,0,0);
        
        const isFuture = checkDate > todayCheck;
        const status = logs[dateStr] || HabitStatus.NONE;

        days.push({
          date: currentDayDate,
          dateStr,
          status: isFuture ? HabitStatus.NONE : status,
          isFuture
        });
      }

      result.push({
        name: monthName,
        year,
        days
      });
    }

    return result;
  }, [logs]);

  // Auto-scroll to the end (current month) on mount only.
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const getCellColor = (status: HabitStatus, isFuture: boolean) => {
    if (isFuture) return 'bg-zinc-800/30 opacity-30';
    
    switch (status) {
      case HabitStatus.SUCCESS:
        return 'bg-habit-success shadow-[0_0_8px_rgba(74,222,128,0.6)] scale-105';
      case HabitStatus.PARTIAL:
        return 'bg-habit-partial shadow-[0_0_6px_rgba(251,191,36,0.5)]';
      case HabitStatus.FAIL:
        return 'bg-habit-fail shadow-[0_0_6px_rgba(248,113,113,0.5)] opacity-80';
      case HabitStatus.NONE:
      default:
        return 'bg-habit-empty hover:bg-zinc-700';
    }
  };

  return (
    <div className="w-full">
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 pb-6 pt-2 px-1 scroll-smooth mask-linear-fade"
            style={{ scrollbarWidth: 'none' }} // Hide scrollbar for cleaner look
        >
            {months.map((month, mIndex) => (
                <div key={`${month.year}-${mIndex}`} className="flex flex-col min-w-max select-none">
                    <div className="text-[10px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">
                        {month.name}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                        {month.days.map((cell, dIndex) => {
                            if (!cell) {
                                return <div key={`empty-${dIndex}`} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
                            }
                            
                            const isSelected = selectedDate === cell.dateStr;

                            return (
                                <div
                                    key={cell.dateStr}
                                    onClick={() => !cell.isFuture && onDayClick?.(cell.dateStr)}
                                    className={`
                                        w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 ease-out
                                        ${getCellColor(cell.status, cell.isFuture)}
                                        ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black z-10 scale-125' : ''}
                                        ${!cell.isFuture ? 'cursor-pointer hover:scale-125' : ''}
                                    `}
                                    title={`${cell.dateStr}`}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        {/* Legend - Minimalist */}
        <div className="flex justify-end items-center text-[10px] font-medium text-zinc-500 mt-2 gap-4 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-habit-empty"></div>
                <span>None</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-habit-fail"></div>
                <span>Miss</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-habit-partial"></div>
                <span>Meh</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-habit-success shadow-[0_0_4px_rgba(74,222,128,0.5)]"></div>
                <span>Done</span>
            </div>
        </div>
    </div>
  );
};

export default Heatmap;