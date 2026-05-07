'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AppLogo from './ui/AppLogo';

interface LandingProps {
  onDiveIn: () => void;
}

interface PetalData {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const Petal = ({ delay, left, duration, size }: Omit<PetalData, 'id'>) => (
  <motion.div
    className="petal"
    style={{ left: `${left}%`, width: `${size}px`, height: `${size}px` }}
    initial={{ y: '-10vh', rotate: 0, opacity: 0 }}
    animate={{
      y: '110vh',
      x: [0, 40, -40, 0],
      rotate: 360,
      opacity: [0, 0.8, 0.8, 0],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
  />
);

export default function Landing({ onDiveIn }: LandingProps) {
  const [petals, setPetals] = useState<PetalData[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: Math.random() * 8 + 12,
        size: Math.random() * 12 + 8,
      }))
    );
  }, []);


  return (
    <div className="relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden animated-gradient">
      {/* Petals */}
      <div className="absolute inset-0 pointer-events-none">
        {petals.map((p) => (
          <Petal key={p.id} {...p} />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 px-6 flex flex-col items-center"
      >
        {/* Logo icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <AppLogo size={40} />
        </motion.div>

        <h1
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-3 tracking-tight text-white"
          style={{ textShadow: '0 0 40px rgba(124, 58, 237, 0.3)' }}
        >
          Wave Spectrum
        </h1>
        <motion.p
          className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 font-light max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Feel the music. Drift into sound.
        </motion.p>

        <div className="mt-6 backdrop-blur-md rounded-full">
          <button
            onClick={onDiveIn}
            className="
              relative
              px-10 py-4
              rounded-full
              font-bold
              text-white
              bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500
              shadow-lg shadow-purple-500/30
              transition-all duration-300
              hover:scale-105
              hover:shadow-xl hover:shadow-pink-500/40
              active:scale-95
              overflow-hidden
              flex items-center justify-center
            "
          >
            <span className="relative z-10">Dive-In</span>
            <span className="
              absolute inset-0
              bg-white/10
              opacity-0
              hover:opacity-100
              transition
              rounded-full
            "></span>
          </button>
        </div>
      </motion.div>

      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#e05297]/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
