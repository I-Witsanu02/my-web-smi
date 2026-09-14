import React from 'react';

interface BrandMarkProps {
  className?: string;
  inverse?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'h-11 w-11', inverse = false }) => (
  <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Skeleton Bone Age logo">
    <defs>
      <linearGradient id="boneage-mark" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor={inverse ? '#ffffff' : '#002e6f'} />
        <stop offset="1" stopColor="#29c3b6" />
      </linearGradient>
    </defs>
    <path d="M32 4a28 28 0 1 1-19.8 8.2" fill="none" stroke="url(#boneage-mark)" strokeWidth="4" strokeLinecap="round" />
    <path d="M19 31V18a3 3 0 0 1 6 0v9-14a3 3 0 0 1 6 0v14-17a3 3 0 0 1 6 0v17-12a3 3 0 0 1 6 0v19c0 11-7 18-17 18-8 0-13-5-13-12v-6a3 3 0 0 1 6-3Z" fill="none" stroke="url(#boneage-mark)" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="31" cy="34" r="3.2" fill="#9deee5" stroke={inverse ? '#ffffff' : '#002e6f'} strokeWidth="1.6" />
    <path d="m27.5 42 3 3 6-7" fill="none" stroke="#29c3b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
