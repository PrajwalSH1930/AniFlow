import React from 'react';

export default function AniFlowLogo({ className = "w-8 h-8", withText = false }) {
  return (
    <div className="inline-flex items-center gap-2.5 group select-none">
      {/* Dynamic Animated SVG Icon */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
      >
        <defs>
          {/* Main Gradient */}
          <linearGradient id="aniflow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />    {/* Brand Primary (Indigo) */}
            <stop offset="50%" stopColor="#8b5cf6" />   {/* Violet */}
            <stop offset="100%" stopColor="#ec4899" />  {/* Brand Accent (Pink) */}
          </linearGradient>

          {/* Glow / Shadow Filter */}
          <filter id="aniflow-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Rounded Shield / Frame */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          fill="#0f172a"
          stroke="url(#aniflow-grad)"
          strokeWidth="3.5"
          className="transition-all duration-300 group-hover:stroke-[4.5px]"
        />

        {/* Ambient Glow Backplate */}
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="18"
          fill="url(#aniflow-grad)"
          opacity="0.08"
        />

        {/* Stylized "A" + "Flow" Kinetic Ribbons */}
        <g filter="url(#aniflow-glow)">
          {/* Upper Dynamic Swish */}
          <path
            d="M 28 68 C 34 32, 54 22, 74 26 C 60 36, 48 46, 42 68 Z"
            fill="url(#aniflow-grad)"
            opacity="0.95"
          />

          {/* Central Streaming Play Arrow */}
          <path
            d="M 44 40 L 66 52 L 44 64 Z"
            fill="#ffffff"
            className="transition-transform duration-300 origin-center group-hover:scale-110"
          />

          {/* Lower Speed Stream Wave */}
          <path
            d="M 26 73 C 44 73, 62 64, 76 50 C 66 68, 48 76, 26 73 Z"
            fill="url(#aniflow-grad)"
          />
        </g>

        {/* Sparkle Accent Dot */}
        <circle cx="72" cy="28" r="3" fill="#ec4899" />
      </svg>

      {/* Optional Integrated Typography */}
      {withText && (
        <span className="text-xl font-black tracking-tight text-white flex items-center">
          Ani<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Flow</span>
        </span>
      )}
    </div>
  );
}