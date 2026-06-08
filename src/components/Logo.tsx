import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  iconSize = 'md', 
  showText = true 
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-Fidelity Vector Interlocking Logo Mark */}
      <div className={`relative ${sizeMap[iconSize]} shrink-0 transition-transform hover:scale-105 duration-300`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full filter drop-shadow-[0_0_12px_rgba(255,0,170,0.4)] drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Neon Gradients Definition */}
          <defs>
            <linearGradient id="neon-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff00cc" />
              <stop offset="50%" stopColor="#bd00ff" />
              <stop offset="100%" stopColor="#7a00ff" />
            </linearGradient>
            
            <linearGradient id="neon-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f3ff" />
              <stop offset="100%" stopColor="#0066ff" />
            </linearGradient>

            <linearGradient id="neon-purple-blue" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0099" />
              <stop offset="60%" stopColor="#8c00ff" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>

            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND LAYER SHADOW */}
          <path
            d="M 38 15 L 12 85 H 24 L 38 48 L 41 48 L 56 85 H 68 Z"
            fill="#090a12"
            opacity="0.9"
          />

          {/* STYLIZED LETTER 'A' (Neon Magenta & Purple Glow) */}
          {/* Main 'A' Left leg and sharp peak */}
          <path
            d="M 38 14 L 10 82 H 24 L 38 45 L 53 82 H 67 Z"
            fill="none"
            stroke="url(#neon-magenta)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inside accent overlay for 'A' */}
          <path
            d="M 38 24 L 18 73 H 26"
            stroke="#ff00cc"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* INTERLOCKING LETTER 'C' (Magenta with a sweeping loop to Blue) */}
          <path
            d="M 68 46 C 45 46, 34 58, 34 71 C 34 84, 45 92, 68 92 C 78 92, 85 86, 85 86 L 76 76 C 76 76, 73 80, 68 80 C 56 80, 50 75, 50 71 C 50 67, 56 61, 68 61 C 73 61, 76 65, 76 65 L 85 55 C 85 55, 78 46, 68 46 Z"
            fill="none"
            stroke="url(#neon-purple-blue)"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* STYLIZED LETTER 'i' (Neon Blue bar aligned perfectly inside the Intersect) */}
          <rect
            x="64"
            y="36"
            width="6"
            height="38"
            rx="3"
            fill="url(#neon-blue)"
            stroke="#00ffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Glowing dot for 'i' */}
          <circle
            cx="67"
            cy="18"
            r="4.5"
            fill="#00ffff"
            filter="url(#neon-glow)"
          />
        </svg>
      </div>

      {/* TYPOGRAPHY (Tailwind blended & glowing in place) */}
      {showText && (
        <span className="text-xl font-bold tracking-tight flex items-center leading-none">
          <span className="text-white hover:text-white transition-colors uppercase font-sans tracking-wide">
            AICalculator
          </span>
          <span className="text-[#00f3ff] italic ml-0.5 font-sans lowercase">
            .shop
          </span>
        </span>
      )}
    </div>
  );
};
