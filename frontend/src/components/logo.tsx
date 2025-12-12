import * as React from "react"
import Image from "next/image"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  showText?: boolean
}

export function Logo({ size = 24, showText = false, className, ...props }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Dome/Cúpula */}
        <path
          d="M50 15 C35 15, 25 25, 25 35 L25 35 L75 35 C75 25, 65 15, 50 15"
          fill="#1e3a8a"
          stroke="#fff"
          strokeWidth="1.5"
        />
        
        {/* Arcos da cúpula */}
        <path d="M35 20 Q35 27, 40 27" stroke="#fff" strokeWidth="1.5" fill="none"/>
        <path d="M45 18 Q45 27, 50 27" stroke="#fff" strokeWidth="1.5" fill="none"/>
        <path d="M55 18 Q55 27, 60 27" stroke="#fff" strokeWidth="1.5" fill="none"/>
        <path d="M65 20 Q65 27, 60 27" stroke="#fff" strokeWidth="1.5" fill="none"/>
        
        {/* Torre central */}
        <rect x="48" y="8" width="4" height="8" fill="#1e3a8a"/>
        <circle cx="50" cy="7" r="2" fill="#1e3a8a"/>
        
        {/* Frontão/Triângulo */}
        <path
          d="M30 35 L50 45 L70 35"
          fill="#1e3a8a"
          stroke="#fff"
          strokeWidth="1.5"
        />
        
        {/* Colunas */}
        <rect x="32" y="45" width="6" height="35" fill="#fff" stroke="#1e3a8a" strokeWidth="1"/>
        <rect x="47" y="45" width="6" height="35" fill="#fff" stroke="#1e3a8a" strokeWidth="1"/>
        <rect x="62" y="45" width="6" height="35" fill="#fff" stroke="#1e3a8a" strokeWidth="1"/>
        
        {/* Janelas nas colunas */}
        <rect x="33.5" y="50" width="3" height="4" fill="#1e3a8a"/>
        <rect x="33.5" y="58" width="3" height="4" fill="#1e3a8a"/>
        <rect x="33.5" y="66" width="3" height="4" fill="#1e3a8a"/>
        
        <rect x="48.5" y="50" width="3" height="4" fill="#1e3a8a"/>
        <rect x="48.5" y="58" width="3" height="4" fill="#1e3a8a"/>
        <rect x="48.5" y="66" width="3" height="4" fill="#1e3a8a"/>
        
        <rect x="63.5" y="50" width="3" height="4" fill="#1e3a8a"/>
        <rect x="63.5" y="58" width="3" height="4" fill="#1e3a8a"/>
        <rect x="63.5" y="66" width="3" height="4" fill="#1e3a8a"/>
        
        {/* Base do prédio */}
        <rect x="25" y="80" width="50" height="3" fill="#1e3a8a"/>
        <rect x="20" y="83" width="60" height="4" fill="#1e3a8a"/>
        <line x1="20" y1="85" x2="80" y2="85" stroke="#fff" strokeWidth="0.5"/>
      </svg>
      
      {showText && (
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-[#1e3a8a]">The</span>
          <span className="text-lg font-bold text-[#b91c1c]">House</span>
        </div>
      )}
    </div>
  )
}
