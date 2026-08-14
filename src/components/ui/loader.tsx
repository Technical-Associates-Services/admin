import React from 'react';

export const Loader = () => {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[400px]">
      <div className="relative flex flex-col items-center justify-center">
        {/* Pulsing glow effect behind logo */}
        <div className="absolute h-32 w-32 animate-glow-pulse rounded-full bg-red-500 blur-xl"></div>
        
        {/* Bouncing Logo */}
        <img 
          src="/logo.png" 
          alt="TAS Loading" 
          className="relative z-10 h-16 object-contain animate-gentle-bounce drop-shadow-md" 
        />
        
      </div>
    </div>
  );
};
