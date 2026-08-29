"use client";

import React, { useEffect, useState } from 'react';

export function PulseBackground() {
  const [lines, setLines] = useState<{path: string, dur: string, begin: string}[]>([]);
  
  useEffect(() => {
    const newLines = [];
    const createPath = (startX: number, startY: number, endX: number, endY: number, curveX: number, curveY: number) => {
      return `M ${startX} ${startY} Q ${curveX} ${curveY} ${endX} ${endY}`;
    };

    for (let i = 0; i < 6; i++) {
      const p1 = createPath(0, Math.random() * 600, 250, 150 + Math.random() * 300, 125, Math.random() * 600);
      const p2 = createPath(1000, Math.random() * 600, 750, 150 + Math.random() * 300, 875, Math.random() * 600);
      const p3 = createPath(Math.random() * 1000, 0, 250 + Math.random() * 500, 150, Math.random() * 1000, 75);
      const p4 = createPath(Math.random() * 1000, 600, 250 + Math.random() * 500, 450, Math.random() * 1000, 525);
      
      [p1, p2, p3, p4].forEach(p => {
        newLines.push({
          path: p,
          dur: `${2 + Math.random() * 3}s`,
          begin: `${Math.random() * 2}s`
        });
      });
    }
    setLines(newLines);
  }, []);

  // Evitamos renderizar svg en el servidor si depende de Math.random()
  if (lines.length === 0) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
      <svg 
        viewBox="0 0 1000 600" 
        preserveAspectRatio="none" 
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {lines.map((l, i) => (
          <g key={i}>
            {/* Línea base sutil (ruta de la luz) */}
            <path
              d={l.path}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
              strokeOpacity="0.05"
            />
            {/* Pulso de luz animado */}
            <path
              d={l.path}
              fill="none"
              stroke="url(#pulseGradient)"
              strokeWidth="1.5"
              strokeDasharray="150 1000"
              strokeDashoffset="1150"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="1150; -150"
                dur={l.dur}
                begin={l.begin}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}
      </svg>
      {/* Sombras difuminadas en los bordes para que los pulsos se desvanezcan elegantemente */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#000000_100%)]"></div>
    </div>
  );
}
