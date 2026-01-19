
import React from 'react';

const WhatsAppButton: React.FC = () => {
  return (
    <a 
      href="https://wa.me/5586998091058" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform z-[80] md:p-4"
    >
      <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 6.172c-2.32 0-4.591.398-6.758 1.187-.217.078-.34.297-.305.525l.842 5.564c.033.22.22.375.441.375.146 0 .285-.068.374-.184 1.488-1.956 3.447-3.15 5.406-3.15 1.959 0 3.918 1.194 5.406 3.15.089.116.228.184.374.184.221 0 .408-.155.441-.375l.842-5.564c.035-.228-.088-.447-.305-.525-2.167-.789-4.438-1.187-6.758-1.187zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.953-1.412C8.381 21.507 10.117 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
    </a>
  );
};

export default WhatsAppButton;
