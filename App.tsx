import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, ArrowLeft, ChevronRight, Zap, Calendar, Info, X } from 'lucide-react';
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
  const [animateView, setAnimateView] = useState(false);

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

  // Handle view transitions
  const changeView = (newView: 'dashboard' | 'select' | 'habit-detail') => {
    setAnimateView(false);
    setTimeout(() => {
        setView(newView);
        setAnimateView(true);
    }, 50);
  };

  useEffect(() => {
      setAnimateView(true);
  }, []);

  const addHabit = (def: HabitDefinition) => {
    if (habits.find(h => h.name === def.name)) return;

    const newHabit: UserHabit = {
      id: crypto.randomUUID(),
      name: def.name,
      logs: {},
      notes: {},
      createdAt: new Date().toISOString()
    };
    setHabits(prev => [...prev, newHabit]);
    changeView('dashboard');
  };

  const removeHabit = (id: string) => {
    if (window.confirm("Delete this habit?")) {
        setHabits(prev => prev.filter(h => h.id !== id));
        if (selectedHabitId === id) {
            changeView('dashboard');
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
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setAiAdvice(null);
    changeView('habit-detail');
  };

  // -- Views --

  const renderSelectionScreen = () => {
    const categories = Array.from(new Set(PREDEFINED_HABITS.map(h => h.category)));
    
    return (
        <div className={`container mx-auto px-4 py-8 max-w-6xl overflow-y-auto h-full transition-all duration-500 ease-out ${animateView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-between mb-12 sticky top-0 bg-bg-main/80 backdrop-blur-xl py-4 z-20">
               <div className="flex items-center">
                 {habits.length > 0 && (
                     <button onClick={() => changeView('dashboard')} className="mr-6 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all hover:scale-110">
                         <ArrowLeft size={28} />
                     </button>
                 )}
                 <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1">Protocol <span className="text-primary">Select</span></h1>
                    <p className="text-zinc-400 font-medium">Choose your weapon. Build your character.</p>
                 </div>
               </div>
            </div>

            <div className="space-y-12 pb-24">
                {categories.map(cat => (
                    <div key={cat}>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6 pl-1 opacity-80">{cat}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {PREDEFINED_HABITS.filter(h => h.category === cat).map(habit => {
                                const isAdded = habits.some(h => h.name === habit.name);
                                return (
                                    <button
                                        key={habit.id}
                                        disabled={isAdded}
                                        onClick={() => addHabit(habit)}
                                        className={`
                                            group relative p-5 rounded-2xl text-left transition-all duration-300 overflow-hidden
                                            ${isAdded 
                                            ? 'bg-zinc-900/50 border border-white/5 text-zinc-600 opacity-50 cursor-not-allowed' 
                                            : 'bg-bg-card/60 border border-white/5 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1'
                                            }
                                        `}
                                    >
                                        {!isAdded && <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                                        <span className={`text-lg font-bold relative z-10 ${isAdded ? '' : 'text-zinc-200 group-hover:text-white'}`}>{habit.name}</span>
                                        {isAdded ? (
                                            <span className="block text-xs mt-2 text-zinc-500 font-mono relative z-10">ACTIVE</span>
                                        ) : (
                                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 text-primary">
                                                <Plus size={20} />
                                            </div>
                                        )}
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
            <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <Sparkles size={40} className="text-primary" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Zero Habits</h2>
                <p className="text-zinc-400 mb-10 max-w-md text-lg leading-relaxed">Your dashboard is empty. It's time to define who you want to be.</p>
                <button 
                    onClick={() => changeView('select')}
                    className="group relative px-8 py-4 bg-primary hover:bg-primary-glow text-white font-bold rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 flex items-center gap-3 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Plus size={20} strokeWidth={3} />
                        INITIATE PROTOCOL
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                </button>
            </div>
        );
    }

    return (
        <div className={`container mx-auto px-4 py-8 max-w-4xl h-full overflow-y-auto transition-all duration-500 ease-out ${animateView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex justify-between items-end mb-10 sticky top-0 bg-bg-main/80 backdrop-blur-xl py-4 z-20 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 font-medium mt-1 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <button 
                    onClick={() => changeView('select')}
                    className="p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg border border-white/5"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline font-bold text-sm">New Habit</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 pb-24">
                {habits.map((habit, index) => {
                    const streak = getStreak(habit);
                    const todayStr = new Date().toISOString().split('T')[0];
                    const status = habit.logs[todayStr] || HabitStatus.NONE;

                    return (
                        <div 
                            key={habit.id} 
                            className="group relative bg-bg-card/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-bg-card/80"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex items-stretch min-h-[100px]">
                                {/* Main Click Area */}
                                <div 
                                    onClick={() => openHabitDetail(habit.id)}
                                    className="flex-grow p-6 flex items-center gap-5 cursor-pointer z-10"
                                >
                                    {/* Status Indicator */}
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl transition-all duration-300 shadow-lg
                                        ${status === HabitStatus.SUCCESS ? 'bg-habit-success text-black rotate-3 scale-110 shadow-habit-success/20' :
                                          status === HabitStatus.PARTIAL ? 'bg-habit-partial text-black rotate-0' :
                                          status === HabitStatus.FAIL ? 'bg-habit-fail text-white -rotate-3' :
                                          'bg-zinc-800 text-zinc-600'
                                        }
                                    `}>
                                        {status === HabitStatus.SUCCESS ? <Zap size={28} fill="currentColor" /> : 
                                         status === HabitStatus.FAIL ? <X size={28} strokeWidth={3} /> : 
                                         status === HabitStatus.PARTIAL ? <span className="font-black text-2xl">~</span> : 
                                         <div className="w-3 h-3 bg-zinc-600 rounded-full" />}
                                    </div>

                                    <div className="flex-grow">
                                        <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{habit.name}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 mt-2">
                                            <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${streak > 0 ? 'bg-primary/10 text-primary' : 'bg-zinc-800/50'}`}>
                                                <Zap size={12} className={streak > 0 ? 'fill-primary' : ''} /> 
                                                {streak} day streak
                                            </span>
                                            {status !== HabitStatus.NONE && (
                                                <span className="text-zinc-400 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span> Today logged
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Area */}
                                <div className="flex flex-col border-l border-white/5 z-20 bg-zinc-900/30 backdrop-blur-sm">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeHabit(habit.id);
                                        }}
                                        className="flex-1 px-5 flex items-center justify-center text-zinc-600 hover:text-habit-fail hover:bg-habit-fail/10 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="h-[1px] bg-white/5 w-full" />
                                    <button
                                        onClick={() => openHabitDetail(habit.id)}
                                        className="flex-1 px-5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors hover:bg-white/5"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
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
        <div className={`container mx-auto px-4 py-6 max-w-5xl h-full overflow-y-auto transition-all duration-500 ease-out ${animateView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
             {/* Navigation Header */}
             <div className="flex items-center justify-between mb-8 sticky top-0 bg-bg-main/90 backdrop-blur-lg py-4 z-20 border-b border-white/5">
                <button 
                    onClick={() => changeView('dashboard')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors pr-4 py-2 rounded-lg hover:bg-white/5"
                >
                    <ArrowLeft size={20} />
                    <span className="font-bold text-sm uppercase tracking-wide">Back</span>
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleGetAdvice(habit)}
                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all flex items-center gap-2 text-sm font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    >
                        <Sparkles size={16} />
                        <span className="hidden sm:inline">AI Insight</span>
                    </button>
                    <button 
                        onClick={() => removeHabit(habit.id)}
                        className="p-2 text-zinc-500 hover:text-habit-fail hover:bg-habit-fail/10 rounded-xl transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Left Column: Stats & Heatmap */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-bg-card/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                            <Zap size={120} />
                         </div>
                         
                         <div className="relative z-10 mb-8">
                            <h1 className="text-4xl font-black text-white mb-2">{habit.name}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Zap size={14} className="text-habit-partial" fill="currentColor" />
                                    <span className="text-sm font-bold text-zinc-300">{streak} day streak</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 overflow-hidden">
                            <Heatmap 
                                logs={habit.logs} 
                                onDayClick={setSelectedDate}
                                selectedDate={selectedDate}
                            />
                        </div>
                        <p className="text-xs text-zinc-500 mt-4 flex items-center gap-2">
                            <Info size={12} />
                            <span>Select a dot above to log historic data</span>
                        </p>
                    </div>
                    
                    {/* AI Section */}
                    {(aiAdvice || isLoadingAdvice) && (
                         <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 relative animate-slide-up">
                            <div className="absolute -top-3 left-8">
                                <span className="bg-bg-main text-primary text-xs font-bold px-3 py-1 border border-primary/30 rounded-full flex items-center gap-1 shadow-lg">
                                    <Sparkles size={12} /> AI COACH
                                </span>
                            </div>
                            <div className="pt-2">
                                {isLoadingAdvice ? (
                                    <div className="flex items-center gap-3 text-primary/70 text-sm font-medium">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        Crunching the numbers...
                                    </div>
                                ) : (
                                    <p className="text-zinc-100 text-lg leading-relaxed font-medium">"{aiAdvice}"</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Controls */}
                <div className="space-y-6">
                    <HabitLogger 
                        dateStr={selectedDate}
                        currentStatus={currentStatus}
                        onLog={(s) => updateLog(habit.id, s, selectedDate)}
                    />

                    <div className="bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5">
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 block flex items-center gap-2">
                            <Calendar size={12} />
                            Daily Journal
                        </label>
                        <textarea
                            className="w-full bg-zinc-900/50 text-zinc-200 p-4 rounded-xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:bg-zinc-900 outline-none resize-none text-sm placeholder:text-zinc-700 transition-all min-h-[150px]"
                            placeholder="How did it go? What triggered you? What went well?"
                            value={currentNote}
                            onChange={(e) => updateNote(habit.id, e.target.value, selectedDate)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen w-full font-sans selection:bg-primary selection:text-white overflow-hidden">
        {view === 'select' ? renderSelectionScreen() : 
         view === 'habit-detail' ? renderHabitDetail() : 
         renderDashboard()}
    </div>
  );
}