
import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string, size: string) => void;
  onUpdateQty: (id: string, size: string, delta: number) => void;
  onCheckout: () => void;
}

const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-20 h-24 bg-white/5 rounded-lg overflow-hidden relative shrink-0">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse flex items-center justify-center">
           <div className="w-4 h-4 rounded-full border border-white/10" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQty, onCheckout }) => {
  const total = items.reduce((acc, item) => acc + (item.promoPrice || item.price) * item.quantity, 0);

  const handleUpdateQty = (item: CartItem, delta: number) => {
    if (delta > 0 && item.quantity >= item.stockQuantity) {
      alert(`Desculpe, temos apenas ${item.stockQuantity} unidades disponíveis em estoque.`);
      return;
    }
    onUpdateQty(item.id, item.selectedSize, delta);
  };

  const handleCheckoutClick = () => {
    // Final validation: ensure no item exceeds stock before opening checkout
    for (const item of items) {
      if (item.quantity > item.stockQuantity) {
        alert(`O item "${item.name}" excedeu o estoque disponível (${item.stockQuantity}). Ajustamos a quantidade para você.`);
        onUpdateQty(item.id, item.selectedSize, item.stockQuantity - item.quantity);
        return;
      }
    }
    onCheckout();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md glass z-[70] shadow-2xl transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-sora font-bold uppercase tracking-tighter">MEU CARRINHO</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <p className="text-white/20 text-xs font-black uppercase tracking-widest">Seu carrinho está vazio</p>
              <button onClick={onClose} className="text-[#CCFF00] text-[10px] font-black uppercase underline decoration-2 underline-offset-4">Explorar Drop</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 fade-in group" style={{ animationDelay: `${idx * 0.05}s` }}>
                <LazyImage src={item.image} alt={item.name} />
                
                <div className="flex-grow flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-[11px] uppercase tracking-tighter leading-tight truncate">{item.name}</h3>
                      <button onClick={() => onRemove(item.id, item.selectedSize)} className="text-white/20 hover:text-red-500 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-black uppercase">{item.selectedSize}</span>
                      <span className="text-[8px] text-[#CCFF00] font-black uppercase tracking-widest self-center">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 bg-black/40 rounded-full px-3 py-1.5 border border-white/5">
                      <button 
                        onClick={() => onUpdateQty(item.id, item.selectedSize, -1)} 
                        className="text-white/40 hover:text-[#CCFF00] font-black w-4 text-xs transition-colors"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-black min-w-[12px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQty(item, 1)} 
                        disabled={item.quantity >= item.stockQuantity}
                        className={`font-black w-4 text-xs transition-colors ${item.quantity >= item.stockQuantity ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:text-[#CCFF00]'}`}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                       <span className="block font-black text-sm text-white tracking-tighter">R$ {((item.promoPrice || item.price) * item.quantity).toFixed(2)}</span>
                       {item.promoPrice && (
                         <span className="text-[8px] text-white/20 line-through font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                       )}
                    </div>
                  </div>
                  {item.quantity >= item.stockQuantity && (
                    <p className="text-[7px] text-red-500 font-black uppercase mt-2 tracking-tighter animate-pulse">Estoque máximo atingido</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 bg-black/40 border-t border-white/5 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-white/30 font-black uppercase tracking-widest">
                <span>Itens</span>
                <span>{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[11px] text-[#CCFF00] font-black uppercase tracking-[0.2em] mb-1">TOTAL</span>
                <span className="text-white text-3xl font-sora font-black tracking-tighter">R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-[#CCFF00] text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:brightness-110 hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_40px_rgba(204,255,0,0.2)]"
            >
              IR PARA O CHECKOUT
            </button>
            <p className="text-[8px] text-white/20 text-center uppercase font-bold tracking-widest">Ambiente 100% Seguro & Criptografado</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
