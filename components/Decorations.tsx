import React from 'react';

interface CornerDecorationProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const CornerDecoration: React.FC<CornerDecorationProps> = ({ position }) => {
  const positionClasses: { [key: string]: string } = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2 transform scale-x-[-1]',
    'bottom-left': 'bottom-2 left-2 transform scale-y-[-1]',
    'bottom-right': 'bottom-2 right-2 transform scale-x-[-1] scale-y-[-1]',
  };

  return (
    <div className={`absolute ${positionClasses[position]} w-8 h-8 pointer-events-none z-10 opacity-30`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-primary)]/50 dark:text-[var(--color-primary)]/30">
        <path d="M0 50C0 22.3858 22.3858 0 50 0V20C33.4315 20 20 33.4315 20 50H0Z" fill="currentColor"/>
        <path d="M0 80C0 74.4772 4.47715 70 10 70H30C35.5228 70 40 74.4772 40 80V100H20V80C20 78.8954 19.1046 78 18 78H12C10.8954 78 10 78.8954 10 80V100H0V80Z" fill="currentColor"/>
      </svg>
    </div>
  );
};
