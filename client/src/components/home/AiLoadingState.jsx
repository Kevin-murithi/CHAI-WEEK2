import React, { useState, useEffect } from 'react';

const RobotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-300" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 00-2 2v2H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zM9 12a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z" />
    <path d="M12 14a3 3 0 00-3 3h6a3 3 0 00-3-3z" />
  </svg>
);

const AiLoadingState = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="absolute inset-0 pointer-events-none opacity-70 [background:radial-gradient(900px_300px_at_0%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(900px_300px_at_120%_10%,rgba(59,130,246,0.1),transparent),radial-gradient(900px_300px_at_0%_110%,rgba(34,197,94,0.08),transparent)]" />
      <div className="relative flex flex-col items-center justify-center py-8">
        <div className="animate-pulse">
          <RobotIcon />
        </div>
        <p className="mt-4 text-slate-300 font-semibold">AI is analyzing your portfolio...</p>
        <div className="w-full max-w-xs bg-slate-700 rounded-full h-2.5 mt-4">
          <div className="bg-sky-400 h-2.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Loading insights ({progress}%)</p>
      </div>
    </div>
  );
};

export default AiLoadingState;
