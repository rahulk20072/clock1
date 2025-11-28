import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';

const Stopwatch: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    let intervalId: number;

    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime;
      intervalId = window.setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10);
    }

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return (
      <div className="flex items-baseline space-x-2 font-mono text-white tracking-tight">
        <span className="text-7xl md:text-9xl lg:text-[10rem] font-medium w-[2ch] text-right leading-none">
            {minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-6xl md:text-8xl lg:text-[8rem] text-white/50 leading-none">:</span>
        <span className="text-7xl md:text-9xl lg:text-[10rem] font-medium w-[2ch] text-right leading-none">
            {seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-5xl md:text-6xl lg:text-[6rem] text-indigo-300 self-end mb-4 md:mb-8">.</span>
        <span className="text-5xl md:text-6xl lg:text-[6rem] w-[2ch] text-indigo-300 self-end mb-4 md:mb-8 leading-none">
            {milliseconds.toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-16 animate-fade-in w-full">
      <div className="p-8 md:p-16 w-full max-w-6xl flex justify-center bg-white/5 rounded-[3rem] backdrop-blur-sm border border-white/10 shadow-2xl">
        {formatTime(elapsedTime)}
      </div>
      
      <div className="flex space-x-8 md:space-x-12">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`p-8 md:p-10 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
            isRunning 
              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 ring-1 ring-rose-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40'
          }`}
        >
          {isRunning ? <PauseIcon className="w-10 h-10 md:w-12 md:h-12" /> : <PlayIcon className="w-10 h-10 md:w-12 md:h-12 ml-1" />}
        </button>
        
        <button
          onClick={() => {
            setIsRunning(false);
            setElapsedTime(0);
          }}
          className="p-8 md:p-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110 shadow-lg ring-1 ring-white/20"
        >
          <ResetIcon className="w-10 h-10 md:w-12 md:h-12" />
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;