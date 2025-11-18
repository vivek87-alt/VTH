import React from 'react';
import { HabitStatus } from '../types';

interface HabitLoggerProps {
  onLog: (status: HabitStatus) => void;
  currentStatus: HabitStatus;
  dateStr: string;
}

const HabitLogger: React.FC<HabitLoggerProps> = ({ onLog, currentStatus, dateStr }) => {
  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const dateDisplay = new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const handleLog = (status: HabitStatus) => {
    // Toggle behavior: if clicking the same status, revert to NONE (undo)
    if (currentStatus === status) {
      onLog(HabitStatus.NONE);
    } else {
      onLog(status);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-slate-900 rounded-lg border border-slate-800">
      <p className="text-sm text-slate-400 font-medium">
        Log for <span className="text-slate-200 font-bold">{isToday ? 'Today' : dateDisplay}</span>
      </p>
      <div className="flex space-x-3">
        <button
          onClick={() => handleLog(HabitStatus.FAIL)}
          className={`px-4 py-2 rounded-md font-bold text-sm transition-all transform active:scale-95 ${
            currentStatus === HabitStatus.FAIL
              ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] ring-2 ring-red-400/20'
              : 'bg-slate-800 text-red-500 hover:bg-slate-700'
          }`}
        >
          Fail
        </button>
        <button
          onClick={() => handleLog(HabitStatus.PARTIAL)}
          className={`px-4 py-2 rounded-md font-bold text-sm transition-all transform active:scale-95 ${
            currentStatus === HabitStatus.PARTIAL
              ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)] ring-2 ring-yellow-400/20'
              : 'bg-slate-800 text-yellow-500 hover:bg-slate-700'
          }`}
        >
          Partial
        </button>
        <button
          onClick={() => handleLog(HabitStatus.SUCCESS)}
          className={`px-4 py-2 rounded-md font-bold text-sm transition-all transform active:scale-95 ${
            currentStatus === HabitStatus.SUCCESS
              ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)] ring-2 ring-green-400/20'
              : 'bg-slate-800 text-green-500 hover:bg-slate-700'
          }`}
        >
          Success
        </button>
      </div>
    </div>
  );
};

export default HabitLogger;