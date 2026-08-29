import React from 'react';

export default function Badge({ children, variant = 'primary', count, className = '' }) {
  const variantStyles = {
    primary: 'bg-brand-500 text-white shadow-glow-brand',
    emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    cyan: 'bg-accent-cyan/20 text-cyan-300 border border-cyan-500/30',
    muted: 'bg-slate-800 text-slate-400 border border-slate-700/60'
  };

  if (count !== undefined) {
    if (count <= 0) return null;
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
          variantStyles[variant] || variantStyles.primary
        } ${className}`}
      >
        {count > 99 ? '99+' : count}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
    >
      {children}
    </span>
  );
}
