import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = 'Anime Poster',
  className = '',
  fallbackType = 'poster', // 'poster' | 'backdrop'
  ...props
}) {
  const [hasError, setHasError] = useState(!src);

  if (hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-slate-900/90 border border-slate-800 text-slate-500 p-4 text-center select-none ${className}`}
      >
        <div className="p-3 rounded-xl bg-slate-800/80 mb-2">
          <ImageOff className="w-6 h-6 text-slate-500" />
        </div>
        <span className="text-[11px] font-medium text-slate-400 line-clamp-1">
          {alt || 'Image unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
}