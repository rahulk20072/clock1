import React, { useEffect, useRef } from 'react';

interface ClockDisplayProps {
  onTimeUpdate: (timeStr: string) => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({ onTimeUpdate }) => {
  const hourHandRef = useRef<SVGLineElement>(null);
  const minuteHandRef = useRef<SVGLineElement>(null);
  const secondHandRef = useRef<SVGLineElement>(null);
  const secondHandTailRef = useRef<SVGLineElement>(null);
  const lastTimeStr = useRef<string>("");

  useEffect(() => {
    let frameId: number;

    const updateClock = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();
      const millis = now.getMilliseconds();

      // Continuous sweep for seconds: (seconds + millis/1000) * 6 degrees
      // 0 degrees is 12 o'clock
      const secDeg = (seconds + millis / 1000) * 6;
      // Minutes move slightly with seconds
      const minDeg = (minutes + seconds / 60) * 6;
      // Hours move with minutes
      const hourDeg = ((hours % 12) + minutes / 60) * 30;

      if (secondHandRef.current) {
        secondHandRef.current.style.transform = `rotate(${secDeg}deg)`;
      }
      if (secondHandTailRef.current) {
        secondHandTailRef.current.style.transform = `rotate(${secDeg}deg)`;
      }
      if (minuteHandRef.current) {
        minuteHandRef.current.style.transform = `rotate(${minDeg}deg)`;
      }
      if (hourHandRef.current) {
        hourHandRef.current.style.transform = `rotate(${hourDeg}deg)`;
      }

      // Throttle string updates to parent (for AI context)
      const currentSecondCheck = `${hours}:${minutes}:${seconds}`;
      if (currentSecondCheck !== lastTimeStr.current) {
         lastTimeStr.current = currentSecondCheck;
         
         const period = hours >= 12 ? 'PM' : 'AM';
         const displayHours = hours % 12 || 12;
         const formattedTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
         onTimeUpdate(formattedTime);
      }

      frameId = requestAnimationFrame(updateClock);
    };

    frameId = requestAnimationFrame(updateClock);
    return () => cancelAnimationFrame(frameId);
  }, [onTimeUpdate]);

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in select-none">
      <div className="relative w-72 h-72 md:w-[450px] md:h-[450px]">
        
        {/* Outer Glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10 blur-3xl animate-pulse-slow"></div>
        
        {/* Gradient Border/Ring */}
        <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-cyan-300/50 via-indigo-500/50 to-fuchsia-500/50 shadow-2xl backdrop-blur-3xl">
            {/* Clock Face Background */}
            <div className="w-full h-full rounded-full bg-[#050b14]/90 relative overflow-hidden flex items-center justify-center border border-white/5">
                {/* Subtle Radial Gradient */}
                <div className="absolute inset-0 bg-radial-gradient from-indigo-900/20 to-transparent pointer-events-none"></div>
                
                <svg className="w-full h-full p-6" viewBox="0 0 100 100">
                    {/* Definitions for gradients/shadows */}
                    <defs>
                        <filter id="hand-shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="black" floodOpacity="0.5" />
                        </filter>
                        <linearGradient id="rim-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Inner Rim Detail */}
                    <circle cx="50" cy="50" r="49" stroke="url(#rim-gradient)" strokeWidth="0.5" fill="none" />

                    {/* Markers */}
                    {[...Array(60)].map((_, i) => {
                        const isHour = i % 5 === 0;
                        const isCardinal = i % 15 === 0;
                        return (
                        <line 
                            key={i}
                            x1="50" y1={isHour ? "6" : "6"} x2="50" y2={isHour ? (isCardinal ? "12" : "10") : "8"} 
                            stroke={isHour ? (isCardinal ? "#ffffff" : "#94a3b8") : "#334155"}
                            strokeWidth={isHour ? (isCardinal ? "2" : "1.5") : "0.5"}
                            strokeOpacity={isHour ? "1" : "0.5"}
                            strokeLinecap="round"
                            transform={`rotate(${i * 6} 50 50)`}
                        />
                        );
                    })}

                    {/* Hands Group */}
                    <g filter="url(#hand-shadow)">
                        {/* Hour Hand */}
                        <line
                            ref={hourHandRef}
                            x1="50" y1="50" x2="50" y2="28"
                            stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round"
                            className="opacity-100"
                            style={{ transformOrigin: '50px 50px', willChange: 'transform' }}
                        />

                        {/* Minute Hand */}
                        <line
                            ref={minuteHandRef}
                            x1="50" y1="50" x2="50" y2="16"
                            stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"
                            className="opacity-90"
                            style={{ transformOrigin: '50px 50px', willChange: 'transform' }}
                        />

                        {/* Second Hand Tail */}
                        <line
                            ref={secondHandTailRef}
                            x1="50" y1="50" x2="50" y2="60"
                            stroke="#f43f5e" strokeWidth="1.5"
                            style={{ transformOrigin: '50px 50px', willChange: 'transform' }}
                        />

                        {/* Second Hand */}
                        <line
                            ref={secondHandRef}
                            x1="50" y1="50" x2="50" y2="10"
                            stroke="#f43f5e" strokeWidth="1.5"
                            style={{ transformOrigin: '50px 50px', willChange: 'transform' }}
                        />

                        {/* Center Cap */}
                        <circle cx="50" cy="50" r="3.5" fill="#0f172a" stroke="#e2e8f0" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="2" fill="#f43f5e" />
                    </g>
                </svg>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ClockDisplay;