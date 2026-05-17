import React from 'react';

interface ShieldIconProps {
  size?: number;
  color?: string;
}

// Same shield shape used in icon.png — consistent branding everywhere
export const ShieldIcon: React.FC<ShieldIconProps> = ({ size = 16, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shield outline */}
    <path
      d="M64 100 L32 70 L28 38 L44 28 L64 32 L84 28 L100 38 L96 70 Z"
      fill={color}
    />
    {/* Inner cutout */}
    <path
      d="M64 90 L42 65 L38 42 L50 36 L64 40 L78 36 L90 42 L86 65 Z"
      fill="rgba(30,30,50,0.85)"
    />
    {/* Center dot */}
    <circle cx="64" cy="59" r="9" fill={color} />
  </svg>
);