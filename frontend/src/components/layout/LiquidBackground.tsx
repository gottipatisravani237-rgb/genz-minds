import React from 'react';

export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50">
      {/* Subtle background mesh gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/60 via-slate-50 to-slate-100" />

      {/* Emerald liquid blob */}
      <div className="absolute -top-32 -left-32 w-96 md:w-[32rem] h-96 md:h-[32rem] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-300/10 blur-3xl animate-blob-1" />

      {/* Cyan liquid blob */}
      <div className="absolute top-1/3 -right-28 w-80 md:w-[30rem] h-80 md:h-[30rem] rounded-full bg-gradient-to-bl from-cyan-400/20 to-teal-400/10 blur-3xl animate-blob-2" />

      {/* Soft blue glow */}
      <div className="absolute -bottom-32 left-1/4 w-[34rem] h-[34rem] rounded-full bg-gradient-to-tr from-sky-400/15 via-teal-300/10 to-transparent blur-3xl animate-blob-3" />

      {/* Subtle grid pattern overlay for futuristic clinical tech precision */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};
