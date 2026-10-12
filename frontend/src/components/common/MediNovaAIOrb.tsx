import React from 'react';
import { motion } from 'framer-motion';

interface MediNovaAIOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isThinking?: boolean;
  showStatusText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MediNovaAIOrb: React.FC<MediNovaAIOrbProps> = ({
  size = 'md',
  isThinking = false,
  showStatusText = false,
  className = '',
  onClick,
}) => {
  // Size dimensions
  const dimensions = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    hero: 'w-36 h-36 md:w-44 md:h-44',
  }[size];

  const ringDimensions = {
    sm: 'inset-[-4px]',
    md: 'inset-[-8px]',
    lg: 'inset-[-12px]',
    hero: 'inset-[-18px]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Outer ambient glow */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.25, 1] : [1, 1.12, 1],
          opacity: isThinking ? [0.6, 0.9, 0.6] : [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: isThinking ? 1.5 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 blur-xl ${
          isThinking ? 'opacity-90' : 'opacity-40'
        }`}
      />

      {/* Rotating outer orbital ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isThinking ? 6 : 18, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${ringDimensions} rounded-full border border-dashed border-teal-300/40 pointer-events-none`}
      />

      {/* Counter-rotating inner orbital ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: isThinking ? 8 : 24, repeat: Infinity, ease: 'linear' }}
        className={`absolute ${ringDimensions} rounded-full border border-cyan-400/25 pointer-events-none scale-90`}
      >
        {/* Orbital particle dots */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-glow-cyan" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-1 rounded-full bg-emerald-300 shadow-glow-emerald" />
      </motion.div>

      {/* Core orb body */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          scale: isThinking ? [1, 1.06, 1] : [1, 1.03, 1],
          boxShadow: isThinking
            ? '0 0 45px rgba(6, 182, 212, 0.8), 0 0 20px rgba(16, 185, 129, 0.6)'
            : '0 0 28px rgba(20, 184, 166, 0.4), 0 0 10px rgba(6, 182, 212, 0.3)',
        }}
        transition={{
          duration: isThinking ? 1.2 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative ${dimensions} rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] overflow-hidden flex items-center justify-center`}
      >
        {/* Liquid reflection overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.45),_transparent_70%)]" />

        {/* Pulse ECG Line and Medical Cross Symbol */}
        <div className="relative z-10 flex flex-col items-center justify-center text-white">
          {/* Medical Cross */}
          <div className="relative flex items-center justify-center mb-0.5">
            <div className={`${size === 'sm' ? 'w-2 h-0.5' : size === 'hero' ? 'w-6 h-1.5' : 'w-3.5 h-1'} bg-white rounded-full shadow-sm`} />
            <div className={`absolute ${size === 'sm' ? 'w-0.5 h-2' : size === 'hero' ? 'w-1.5 h-6' : 'w-1 h-3.5'} bg-white rounded-full shadow-sm`} />
          </div>

          {/* ECG Pulse Wave Vector */}
          {size !== 'sm' && (
            <svg
              className={`${size === 'hero' ? 'w-16 h-6' : 'w-8 h-3'} text-white/90 stroke-current fill-none stroke-[1.8]`}
              viewBox="0 0 50 16"
            >
              <path d="M 0 8 L 12 8 L 16 2 L 20 14 L 24 6 L 27 10 L 30 8 L 50 8" />
            </svg>
          )}
        </div>
      </motion.div>

      {/* Thinking Status Text if requested */}
      {showStatusText && isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50/90 backdrop-blur-md px-3 py-1 rounded-full border border-teal-200/60 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span>MediNova AI is thinking…</span>
        </motion.div>
      )}
    </div>
  );
};
