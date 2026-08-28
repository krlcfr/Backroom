"use client";

import React, { useMemo } from 'react';

export function PulseBackground() {
  // Generamos líneas SVG desde los bordes hacia el centro (donde estará el video).
  // ViewBox: 1000 x 600. Centro aprox: X(250 a 750), Y(150 a 450)
  
  const lines = useMemo(() => {
    const paths = [];
    // Función para generar un camino bezier cuadrático
    const createPath = (startX: number, startY: number, endX: number, endY: number, curveX: number, curveY: number) => {
      return `M ${startX} ${startY} Q ${curveX} ${curveY} ${endX} ${endY}`;
    };

    // Generamos 24 líneas (6 por lado)
    for (let i = 0; i < 6; i++) {
      // Desde la Izquierda
      paths.push(createPath(0, Math.random() * 600, 250, 150 + Math.random() * 300, 125, Math.random() * 600));
      // Desde la Derecha
      paths.push(createPath(1000, Math.random() * 600, 750, 150 + Math.random() * 300, 875, Math.random() * 600));
      // Desde Arriba
      paths.push(createPath(Math.random() * 1000, 0, 250 + Math.random() * 500, 150, Math.random() * 1000, 75));
      // Desde Abajo
      paths.push(createPath(Math.random() * 1000, 600, 250 + Math.random() * 500, 450, Math.random() * 1000, 525));
    }
    return paths;
  }, []);

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

        {lines.map((d, i) => (
          <g key={i}>
            {/* Línea base sutil (ruta de la luz) */}
            <path
              d={d}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.5"
              strokeOpacity="0.05"
            />
            {/* Pulso de luz animado */}
            <path
              d={d}
              fill="none"
              stroke="url(#pulseGradient)"
              strokeWidth="1.5"
              strokeDasharray="150 1000"
              strokeDashoffset="1150"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="1150; -150"
                dur={`${2 + Math.random() * 3}s`}
                begin={`${Math.random() * 2}s`}
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
