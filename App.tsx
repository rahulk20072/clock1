import React, { useState, useCallback, useEffect } from 'react';
import ClockDisplay from './components/ClockDisplay';
import Stopwatch from './components/Stopwatch';
import AmbientSound from './components/AmbientSound';
import { ClockIcon, StopwatchIcon, SparklesIcon, TimerIcon } from './components/Icons';
import { AppMode, AIInsightState } from './types';
import { generateTimeInsight } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CLOCK);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [dateInfo, setDateInfo] = useState<{ day: string; fullDate: string }>({ day: '', fullDate: '' });
  const [insight, setInsight] = useState<AIInsightState>({
    text: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDateInfo({
        day: now.toLocaleDateString('en-US', { weekday: 'long' }),
        fullDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    };
    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Optimized to have a stable reference, preventing ClockDisplay from re-rendering unnecessarily
  const handleTimeUpdate = useCallback((timeStr: string) => {
    setCurrentTimeStr(prev => {
        if (prev !== timeStr) return timeStr;
        return prev;
    });
  }, []);

  const handleGetInsight = async () => {
    if (insight.loading) return;

    setInsight(prev => ({ ...prev, loading: true, error: null }));
    try {
      const text = await generateTimeInsight(currentTimeStr);
      setInsight({ text, loading: false, error: null });
    } catch (err) {
      setInsight({ text: null, loading: false, error: "Unable to reach the stars." });
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-slate-950 animate-gradient text-white selection:bg-indigo-500 selection:text-white overflow-hidden font-inter">
      
      {/* Ambient Sound Control */}
      <AmbientSound />

      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#050b14] to-slate-950 z-0" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 relative z-10 w-full h-full min-h-screen">
        
        {/* Dynamic Content based on Mode */}
        <div className="w-full flex items-center justify-center transition-all duration-500 ease-in-out h-full">
          
          {mode === AppMode.CLOCK && (
            <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1800px] px-4 lg:px-12 gap-12 lg:gap-0">
               
               {/* Left Panel: Day & Date */}
               <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 animate-fade-in-left">
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-3xl font-medium text-indigo-400/80 tracking-[0.25em] uppercase pl-1">
                      {dateInfo.day}
                    </h2>
                    <div className="flex flex-col">
                        <span className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-400">
                           {dateInfo.fullDate.split(',')[0]}
                        </span>
                        <span className="text-3xl md:text-4xl lg:text-5xl font-light text-slate-500 tracking-wide mt-2">
                           {dateInfo.fullDate.split(',')[1] || ''}
                        </span>
                    </div>
                  </div>
               </div>

               {/* Center Panel: Clock */}
               <div className="flex-none order-1 lg:order-2 z-20 scale-90 md:scale-100 xl:scale-110">
                  <ClockDisplay onTimeUpdate={handleTimeUpdate} />
               </div>

               {/* Right Panel: AI Insight */}
               <div className="flex-1 flex flex-col items-center lg:items-end text-center lg:text-right order-3 animate-fade-in-right">
                  <div className="max-w-md w-full flex flex-col items-center lg:items-end space-y-8">
                      <div className="min-h-[8rem] flex items-center justify-center lg:justify-end">
                        {insight.loading ? (
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        ) : insight.text ? (
                            <p className="text-xl md:text-2xl font-light text-indigo-100 italic leading-relaxed text-balance">
                                "{insight.text}"
                            </p>
                        ) : (
                            <div className="text-white/20 text-lg font-light">
                                Ask the cosmos for a thought...
                            </div>
                        )}
                      </div>

                      <button
                        onClick={handleGetInsight}
                        disabled={insight.loading}
                        className="group flex items-center space-x-3 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:border-indigo-400/30 active:scale-95 disabled:opacity-50 backdrop-blur-sm"
                        >
                        <span className="text-base font-medium tracking-wide text-indigo-100">AI Insight</span>
                        <SparklesIcon className={`w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform ${insight.loading ? 'animate-spin' : ''}`} />
                      </button>
                  </div>
               </div>

            </div>
          )}

          {mode === AppMode.STOPWATCH && (
             <div className="w-full flex justify-center py-20">
               <Stopwatch />
             </div>
          )}
          
          {mode === AppMode.TIMER && (
             <div className="w-full max-w-5xl flex flex-col items-center justify-center space-y-12 animate-fade-in py-20">
                 <div className="p-16 md:p-24 bg-white/5 rounded-[3rem] backdrop-blur-md border border-white/10 shadow-2xl w-full flex justify-center">
                    <div className="flex items-baseline space-x-2 font-mono text-white opacity-50">
                        <span className="text-7xl md:text-9xl lg:text-[10rem] font-medium leading-none">00</span>
                        <span className="text-6xl md:text-8xl lg:text-[8rem] text-white/30 leading-none">:</span>
                        <span className="text-7xl md:text-9xl lg:text-[10rem] font-medium leading-none">00</span>
                        <span className="text-6xl md:text-8xl lg:text-[8rem] text-white/30 leading-none">:</span>
                        <span className="text-7xl md:text-9xl lg:text-[10rem] font-medium leading-none">00</span>
                    </div>
                 </div>
                 <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-light text-indigo-200">Timer Mode</h2>
                    <p className="text-white/40 text-lg">Coming soon</p>
                 </div>
             </div>
          )}
        </div>

      </main>

      {/* Navigation Dock */}
      <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-6">
        <div className="flex items-center justify-between p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5">
          <NavButton 
            active={mode === AppMode.CLOCK} 
            onClick={() => setMode(AppMode.CLOCK)} 
            icon={<ClockIcon />} 
            label="Clock" 
          />
          <NavButton 
            active={mode === AppMode.STOPWATCH} 
            onClick={() => setMode(AppMode.STOPWATCH)} 
            icon={<StopwatchIcon />} 
            label="Stopwatch" 
          />
          <NavButton 
             active={mode === AppMode.TIMER}
             onClick={() => setMode(AppMode.TIMER)}
             icon={<TimerIcon />}
             label="Timer"
          />
        </div>
      </nav>

    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`relative group flex flex-col items-center justify-center w-full h-14 mx-1 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
          : 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white/80'
      }`}
      aria-label={label}
    >
      <div className={`w-5 h-5 mb-1 transition-transform duration-300 ${active ? 'scale-110 text-indigo-300' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-medium tracking-wider uppercase ${active ? 'opacity-100 text-indigo-200' : 'opacity-0 group-hover:opacity-100'}`}>
        {label}
      </span>
    </button>
  );
};

export default App;