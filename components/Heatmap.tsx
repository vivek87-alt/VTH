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
  // We deliberately exclude 'months' from deps to prevent scrolling when data updates.
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const getCellColor = (status: HabitStatus, isFuture: boolean) => {
    if (isFuture) return 'bg-slate-900 opacity-50 cursor-not-allowed';
    
    switch (status) {
      case HabitStatus.SUCCESS:
        return 'bg-habit-success hover:bg-green-400 shadow-[0_0_5px_rgba(34,197,94,0.4)]';
      case HabitStatus.PARTIAL:
        return 'bg-habit-partial hover:bg-yellow-400';
      case HabitStatus.FAIL:
        return 'bg-habit-fail hover:bg-red-400';
      case HabitStatus.NONE:
      default:
        return 'bg-habit-empty hover:bg-slate-700';
    }
  };

  return (
    <div className="w-full">
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
        >
            {months.map((month, mIndex) => (
                <div key={`${month.year}-${mIndex}`} className="flex flex-col min-w-max select-none">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        {month.name} <span className="text-slate-700 font-normal">{month.year}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
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
                                        w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] transition-all duration-200 
                                        ${getCellColor(cell.status, cell.isFuture)}
                                        ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 z-10 scale-110' : ''}
                                        ${!cell.isFuture ? 'cursor-pointer' : ''}
                                    `}
                                    title={`${cell.dateStr}: ${cell.status === HabitStatus.NONE ? 'No Data' : cell.status === HabitStatus.SUCCESS ? 'Success' : cell.status === HabitStatus.FAIL ? 'Failed' : 'Partial'}`}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-xs text-slate-500 mt-2 px-1 border-t border-slate-800 pt-3">
            <span className="hidden sm:inline">Yearly Overview</span>
            <div className="flex gap-3 items-center">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-habit-empty"></div>
                    <span>None</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-habit-fail"></div>
                    <span>Fail</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-habit-partial"></div>
                    <span>Partial</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-habit-success"></div>
                    <span>Done</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Heatmap;