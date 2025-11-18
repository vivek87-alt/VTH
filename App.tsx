import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, ArrowLeft, ChevronRight, Activity, Calendar } from 'lucide-react';
import { PREDEFINED_HABITS } from './constants';
import { UserHabit, HabitStatus, HabitDefinition } from './types';
import Heatmap from './components/Heatmap';
import HabitLogger from './components/HabitLogger';
import { getHabitMotivation } from './services/geminiService';

const STORAGE_KEY = 'painkiller_habits_v1';

export default function App() {
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [view, setView] = useState<'dashboard' | 'select' | 'habit-detail'>('dashboard');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHabits(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse habits", e);
      }
    } else {
        // First time user, go to selection
        setView('select');
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const addHabit = (def: HabitDefinition) => {
    if (habits.find(h => h.name === def.name)) return; // Prevent duplicates by name for simplicity

    const newHabit: UserHabit = {
      id: crypto.randomUUID(),
      name: def.name,
      logs: {},
      notes: {},
      createdAt: new Date().toISOString()
    };
    setHabits(prev => [...prev, newHabit]);
    setView('dashboard');
  };

  const removeHabit = (id: string) => {
    if (window.confirm("Are you sure you want to delete this habit and all its data?")) {
        setHabits(prev => prev.filter(h => h.id !== id));
        if (selectedHabitId === id) {
            setView('dashboard');
            setSelectedHabitId(null);
        }
    }
  };

  const updateLog = (habitId: string, status: HabitStatus, dateStr: string) => {
    setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
            return {
                ...h,
                logs: { ...h.logs, [dateStr]: status }
            };
        }
        return h;
    }));
  };

  const updateNote = (habitId: string, note: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
            const currentNotes = h.notes || {};
            return {
                ...h,
                notes: { ...currentNotes, [dateStr]: note }
            };
        }
        return h;
    }));
  };

  const handleGetAdvice = async (habit: UserHabit) => {
    setIsLoadingAdvice(true);
    setAiAdvice(null);
    const advice = await getHabitMotivation(habit);
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const getStreak = (habit: UserHabit) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStatus = habit.logs[todayStr] || HabitStatus.NONE;
    
    let streak = 0;
    const d = new Date();
    
    // Normalize to yesterday to start checking backward unless today is already logged
    if (todayStatus === HabitStatus.NONE) {
       d.setDate(d.getDate() - 1); 
    }
    
    while (true) {
        const ds = d.toISOString().split('T')[0];
        const st = habit.logs[ds];
        if (st === HabitStatus.SUCCESS || st === HabitStatus.PARTIAL) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const openHabitDetail = (habitId: string) => {
    setSelectedHabitId(habitId);
    setSelectedDate(new Date().toISOString().split('T')[0]); // Reset to today
    setAiAdvice(null); // Reset previous advice
    setView('habit-detail');
  };

  const renderSelectionScreen = () => {
    const categories = Array.from(new Set(PREDEFINED_HABITS.map(h => h.category)));
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl overflow-y-auto h-full">
            <div className="flex items-center mb-8">
               {habits.length > 0 && (
                   <button onClick={() => setView('dashboard')} className="mr-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
                       <ArrowLeft size={24} />
                   </button>
               )}
               <h1 className="text-3xl font-bold text-white">Select a Painkiller</h1>
            </div>
            <p className="text-slate-400 mb-8">Choose a habit to track from the list below. You can track multiple habits.</p>

            <div className="space-y-8 pb-20">
                {categories.map(cat => (
                    <div key={cat}>
                        <h3 className="text-xl font-semibold text-indigo-400 mb-4 capitalize border-b border-slate-800 pb-2">{cat}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {PREDEFINED_HABITS.filter(h => h.category === cat).map(habit => {
                                const isAdded = habits.some(h => h.name === habit.name);
                                return (
                                    <button
                                        key={habit.id}
                                        disabled={isAdded}
                                        onClick={() => addHabit(habit)}
                                        className={`p-4 rounded-lg border text-left transition-all ${
                                            isAdded 
                                            ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed' 
                                            : 'border-slate-700 bg-slate-800 hover:border-indigo-500 hover:bg-slate-750 text-slate-200 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                        }`}
                                    >
                                        <span className="font-medium">{habit.name}</span>
                                        {isAdded && <span className="block text-xs mt-1 text-slate-600">Added</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const renderDashboard = () => {
    if (habits.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-4">No Habits Tracked Yet</h2>
                <p className="text-slate-400 mb-8 max-w-md">Start your journey by selecting a habit to track.</p>
                <button 
                    onClick={() => setView('select')}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Your First Habit
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">My Habits</h1>
                <button 
                    onClick={() => setView('select')}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Habit</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-20">
                {habits.map(habit => {
                    const streak = getStreak(habit);
                    const todayStr = new Date().toISOString().split('T')[0];
                    const status = habit.logs[todayStr] || HabitStatus.NONE;

                    return (
                        <div 
                            key={habit.id} 
                            onClick={() => openHabitDetail(habit.id)}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer group relative"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                                        status === HabitStatus.SUCCESS ? 'bg-habit-success text-black' :
                                        status === HabitStatus.PARTIAL ? 'bg-habit-partial text-black' :
                                        status === HabitStatus.FAIL ? 'bg-habit-fail text-white' :
                                        'bg-slate-800 text-slate-500'
                                    }`}>
                                        {status === HabitStatus.SUCCESS ? '✓' : 
                                         status === HabitStatus.FAIL ? '✕' : 
                                         status === HabitStatus.PARTIAL ? '!' : '•'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{habit.name}</h2>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Activity size={12} /> Streak: {streak} days
                                            </span>
                                            {status !== HabitStatus.NONE && (
                                                <span className="text-slate-400">• Today logged</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeHabit(habit.id);
                                        }}
                                        className="p-2 text-slate-700 hover:text-red-500 hover:bg-slate-950 rounded-full transition-colors z-10"
                                        title="Delete Habit"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderHabitDetail = () => {
    const habit = habits.find(h => h.id === selectedHabitId);
    if (!habit) return renderDashboard();

    const streak = getStreak(habit);
    const currentStatus = habit.logs[selectedDate] || HabitStatus.NONE;
    const currentNote = habit.notes?.[selectedDate] || '';

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl h-full overflow-y-auto">
             {/* Navigation Header */}
             <div className="flex items-center justify-between mb-6">
                <button 
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleGetAdvice(habit)}
                        className="p-2 text-indigo-400 hover:bg-indigo-950 rounded-lg transition-colors flex items-center gap-1 text-sm"
                        title="Get AI Insight"
                    >
                        <Sparkles size={18} />
                        <span className="hidden sm:inline">AI Coach</span>
                    </button>
                    <button 
                        onClick={() => removeHabit(habit.id)}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Habit"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        {habit.name}
                        {streak > 2 && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 font-normal">🔥 {streak} day streak</span>}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} />
                        <span>Select a block below to view or edit that day</span>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="mb-8 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                    <Heatmap 
                        logs={habit.logs} 
                        onDayClick={setSelectedDate}
                        selectedDate={selectedDate}
                    />
                </div>

                {/* Logger Controls */}
                <div className="flex flex-col md:flex-row gap-6 justify-center items-start md:items-stretch">
                    <div className="w-full md:w-80 flex-col gap-4 flex-shrink-0 flex">
                        <HabitLogger 
                            dateStr={selectedDate}
                            currentStatus={currentStatus}
                            onLog={(s) => updateLog(habit.id, s, selectedDate)}
                        />
                        {/* Note Input */}
                        <div className="w-full">
                             <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 block pl-1">Day Note</label>
                             <textarea
                                className="w-full bg-slate-950 text-slate-200 p-3 rounded-lg border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none text-sm placeholder:text-slate-600 transition-all"
                                placeholder="Add a note for this day..."
                                rows={3}
                                value={currentNote}
                                onChange={(e) => updateNote(habit.id, e.target.value, selectedDate)}
                            />
                        </div>
                    </div>

                    {/* AI Advice Section */}
                    {aiAdvice || isLoadingAdvice ? (
                         <div className="flex-grow w-full bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-5 relative min-h-[120px]">
                            <div className="absolute -top-3 left-4">
                                <span className="bg-slate-900 text-indigo-400 text-xs px-2 py-1 border border-indigo-500/30 rounded-full flex items-center gap-1">
                                    <Sparkles size={10} /> AI Coach
                                </span>
                            </div>
                            <div className="pt-1 h-full flex items-center">
                                {isLoadingAdvice ? (
                                    <div className="flex items-center gap-3 text-slate-400 text-sm animate-pulse">
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        Analyzing your performance patterns...
                                    </div>
                                ) : (
                                    <p className="text-indigo-100 text-base italic leading-relaxed">"{aiAdvice}"</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden md:flex flex-grow items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-sm p-4">
                            Click "AI Coach" for personalized motivation based on your history.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
        {view === 'select' ? renderSelectionScreen() : 
         view === 'habit-detail' ? renderHabitDetail() : 
         renderDashboard()}
    </div>
  );
}