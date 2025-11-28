import React, { useState, useEffect, useRef } from 'react';
import { VolumeIcon, MuteIcon } from './Icons';

const AmbientSound: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context on user interaction (first play)
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
  };

  const createBrownNoise = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 5; // 5 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Create a LowPass filter to turn white noise into brown-ish noise
    // Brown noise is deep and rumbling, very soothing
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Cutoff frequency

    noiseSource.connect(filter);
    
    return { source: noiseSource, output: filter };
  };

  const toggleSound = () => {
    initAudio();
    const ctx = audioContextRef.current;
    
    if (!ctx) return;

    if (isPlaying) {
      // Fade out and stop
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      }
      setTimeout(() => {
        sourceNodeRef.current?.stop();
        sourceNodeRef.current = null;
      }, 500);
      setIsPlaying(false);
    } else {
      // Resume context if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const { source, output } = createBrownNoise(ctx);
      const gainNode = ctx.createGain();
      
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 1); // Fade in

      output.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
      
      sourceNodeRef.current = source;
      gainNodeRef.current = gainNode;
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (gainNodeRef.current && isPlaying && audioContextRef.current) {
        // Smooth transition for volume change
        gainNodeRef.current.gain.setTargetAtTime(newVol, audioContextRef.current.currentTime, 0.1);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center bg-black/30 backdrop-blur-md rounded-full border border-white/10 shadow-lg transition-all duration-300 overflow-hidden">
      <div className={`flex items-center transition-all duration-300 ease-in-out ${isPlaying ? 'pr-4 pl-3' : 'px-3'} py-3`}>
        <button 
            onClick={toggleSound}
            className={`text-white hover:text-indigo-300 transition-colors focus:outline-none flex items-center justify-center ${isPlaying ? 'text-indigo-400' : ''}`}
            aria-label={isPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
        >
            {isPlaying ? <VolumeIcon className="w-6 h-6" /> : <MuteIcon className="w-6 h-6" />}
        </button>

        {/* Volume Slider - Always visible when playing */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isPlaying ? 'w-24 ml-3 opacity-100' : 'w-0 ml-0 opacity-0'}`}>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
        </div>
      </div>
    </div>
  );
};

export default AmbientSound;