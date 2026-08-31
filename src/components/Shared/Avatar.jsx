/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';

export default function Avatar({
  src,
  name = 'User',
  status,
  size = 'md',
  className = '',
  showStatus = true,
  ring = false
}) {
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-3xl'
  };

  const statusSizeClasses = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border-[1.5px]',
    md: 'w-3.5 h-3.5 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-2',
    '2xl': 'w-6 h-6 border-4'
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-emerald-500/20',
    busy: 'bg-rose-500 ring-rose-500/20',
    away: 'bg-amber-500 ring-amber-500/20',
    offline: 'bg-slate-500 ring-slate-500/20'
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-bold font-sans select-none bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-purple text-white transition-transform duration-300 ${
          sizeClasses[size] || sizeClasses.md
        } ${
          ring
            ? 'ring-2 ring-brand-500/50 ring-offset-2 ring-offset-background-deep shadow-glow-brand'
            : 'border border-white/10'
        }`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-background-deep ring-2 ${
            statusSizeClasses[size] || statusSizeClasses.md
          } ${statusColors[status] || statusColors.offline} animate-pulse-subtle`}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
