import React from 'react';
import { HabitStatus } from '../types';
import { X, Check, Minus } from 'lucide-react';

interface HabitLoggerProps {
  onLog: (status: HabitStatus) => void;
  currentStatus: HabitStatus;
  dateStr: string;
}

const HabitLogger: React.FC<HabitLoggerProps> = ({ onLog, currentStatus, dateStr }) => {
  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const dateObj = new Date(dateStr);
  const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
  const dayNum = dateObj.toLocaleDateString(undefined, { day: 'numeric' });
  const month = dateObj.toLocaleDateString(undefined, { month: 'short' });

  const handleLog = (status: HabitStatus) => {
    if (currentStatus === status) {
      onLog(HabitStatus.NONE);
    } else {
      onLog(status);
    }
  };

  return (
    <div className="flex flex-col w-full p-5 bg-bg-card/50 backdrop-blur-sm rounded-2xl border border-white/5">
      <div className="flex justify-between items-end mb-4">
         <div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Log Status</p>
            <p className="text-xl font-bold text-zinc-200">
                {isToday ? 'Today' : <span className="capitalize">{dayName}, {month} {dayNum}</span>}
            </p>
         </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Fail Button */}
        <button
          onClick={() => handleLog(HabitStatus.FAIL)}
          className={`
            relative group flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 border
            ${currentStatus === HabitStatus.FAIL
              ? 'bg-habit-fail/20 border-habit-fail text-habit-fail shadow-[0_0_15px_rgba(248,113,113,0.3)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-habit-fail hover:text-habit-fail hover:bg-habit-fail/10'
            }
          `}
        >
          <X size={24} className={`mb-1 transition-transform duration-300 ${currentStatus === HabitStatus.FAIL ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Missed</span>
        </button>

        {/* Partial Button */}
        <button
          onClick={() => handleLog(HabitStatus.PARTIAL)}
          className={`
            relative group flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 border
            ${currentStatus === HabitStatus.PARTIAL
              ? 'bg-habit-partial/20 border-habit-partial text-habit-partial shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-habit-partial hover:text-habit-partial hover:bg-habit-partial/10'
            }
          `}
        >
          <Minus size={24} className={`mb-1 transition-transform duration-300 ${currentStatus === HabitStatus.PARTIAL ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Meh</span>
        </button>

        {/* Success Button */}
        <button
          onClick={() => handleLog(HabitStatus.SUCCESS)}
          className={`
            relative group flex flex-col items-center justify-center py-4 rounded-xl transition-all duration-300 border
            ${currentStatus === HabitStatus.SUCCESS
              ? 'bg-habit-success/20 border-habit-success text-habit-success shadow-[0_0_15px_rgba(74,222,128,0.3)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-habit-success hover:text-habit-success hover:bg-habit-success/10'
            }
          `}
        >
          <Check size={24} className={`mb-1 transition-transform duration-300 ${currentStatus === HabitStatus.SUCCESS ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="text-xs font-bold uppercase tracking-wider">Done</span>
        </button>
      </div>
    </div>
  );
};

export default HabitLogger;