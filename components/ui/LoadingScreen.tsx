'use client';

import React from 'react';
import AppLogo from './AppLogo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080a10]">
      {/* Animated background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e05297]/[0.05] blur-[120px] rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#4a90e2]/[0.05] blur-[80px] rounded-full animate-pulse delay-700" />

      <div className="relative flex flex-col items-center">
        {/* Logo with pulse effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#e05297]/20 blur-xl rounded-full animate-ping" />
          <div className="relative bg-[#0d1017] p-6 rounded-3xl border border-white/[0.05] shadow-2xl">
            <AppLogo size={48} />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold text-white mb-2 tracking-tight">
          Wave Spectrum
        </h1>
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          Setting the mood...
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-48 h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#e05297] to-[#4a90e2] animate-loading-bar" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
