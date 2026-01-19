
import React, { useState, useEffect } from 'react';
import { Category, Product, User } from '../types';
import AdminProductModal from '../components/AdminProductModal';

interface ShopProps {
  products: Product[];
  onAddToCart: (product: Product, size: string, color?: string) => void;
  isAdmin: boolean;
  onDeleteProduct: (id: string) => void;
  user: User | null;
  onNavigate: (view: 'home' | 'shop' | 'login' | 'about' | 'admin_customers') => void;
}

const Countdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-1 items-center bg-red-600/10 border border-red-600/30 text-red-500 px-2 py-1 rounded-lg shrink-0">
      <span className="text-[9px] font-black">{timeLeft.d}d {String(timeLeft.h).padStart(2,'0')}h {String(timeLeft.m).padStart(2,'0')}m <span className="text-[#CCFF00] animate-pulse">{String(timeLeft.s).padStart(2,'0')}s</span></span>
    </div>
  );
};

const ProductCard: React.FC<{ 
  product: Product, 
  user: User | null, 
  onAddToCart: any, 
  isAdmin: boolean, 
  onDelete: any, 
  onEdit: any,
  onNavigate: any 
}> = ({ product, user, onAddToCart, isAdmin, onDelete, onEdit, onNavigate }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedFeedback, setAddedFeedback] = useState(false);
  
  // Obter cores disponíveis com suas respectivas quantidades
  const colorsData = (product as any).colors?.map((c: string) => {
    const name = c.split(' (')[0];
    const match = c.match(/\((\d+)\)/);
    const qty = match ? parseInt(match[1]) : 0;
    return { name, qty, original: c };
  }).filter((item: any) => item.qty >= 1) || [];

  const isPromoActive = product.promoPrice && product.promoUntil && new Date(product.promoUntil) > new Date();
  const displayPrice = isPromoActive ? product.promoPrice : product.price;
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { onNavigate('login'); return; }
    if (isOutOfStock) return;

    if (colorsData.length > 0 && !selectedColor) {
      alert("Selecione a COR."); return;
    }
    if (!product.isUniqueSize && !selectedSize) {
      alert("Selecione o TAMANHO."); return;
    }

    onAddToCart(product, product.isUniqueSize ? 'ÚNICO' : selectedSize, selectedColor);
    setAddedFeedback(true);
    
    // Reset da seleção após adicionar ao carrinho
    setTimeout(() => {
      setAddedFeedback(false);
      setSelectedColor('');
      setSelectedSize('');
    }, 2000);
  };

  return (
    <div className={`group relative glass rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-[#CCFF00]/40 border border-white/5 ${isOutOfStock ? 'opacity-70' : ''}`}>
      {isAdmin && (
        <div className="absolute top-4 left-4 z-40 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="bg-[#CCFF00] p-3 rounded-full shadow-xl"><svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="bg-red-600 p-3 rounded-full shadow-xl"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
        </div>
      )}

      <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
        <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={product.name} />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest">ESGOTADO</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-sora font-black text-base uppercase tracking-tighter truncate">{product.name}</h3>
          <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">{product.category}</p>
        </div>

        {!isOutOfStock && user && (
          <div className="space-y-4 animate-fade-in">
            {colorsData.length > 0 && (
              <div className="space-y-2">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Escolha a Cor:</p>
                <div className="flex flex-wrap gap-2">
                  {colorsData.map((color: any) => (
                    <button 
                      key={color.name} 
                      onClick={() => setSelectedColor(color.name)}
                      className={`px-3 py-1.5 rounded-lg border text-[9px] font-black transition-all uppercase flex items-center gap-2 ${selectedColor === color.name ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
                    >
                      <span>{color.name}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md border ${selectedColor === color.name ? 'bg-black/20 text-black border-black/10' : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'}`}>
                        {color.qty}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedColor && !product.isUniqueSize && (
              <div className="space-y-2">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Escolha o Tamanho:</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[40px] py-2 rounded-lg border text-[9px] font-black transition-all ${selectedSize === size ? 'bg-[#CCFF00] border-[#CCFF00] text-black' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleBuy}
              disabled={isOutOfStock || addedFeedback}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                addedFeedback ? 'bg-green-500 text-white' : 'bg-[#CCFF00] text-black shadow-xl shadow-[#CCFF00]/10 active:scale-95'
              }`}
            >
              {addedFeedback ? '✓ ADICIONADO' : 'ADICIONAR AO CARRINHO'}
            </button>
          </div>
        )}

        {!user && !isOutOfStock && (
          <button onClick={() => onNavigate('login')} className="w-full py-5 rounded-2xl border border-[#CCFF00] text-[#CCFF00] font-black text-[10px] uppercase tracking-widest">REVELAR PREÇO</button>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          {user ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-sora font-black text-[#FFD700] tracking-tighter">R$ {displayPrice.toFixed(2)}</span>
              {isPromoActive && <span className="text-[10px] text-white/20 line-through font-bold">R$ {product.price.toFixed(0)}</span>}
            </div>
          ) : (
             <p className="text-[9px] text-white/20 uppercase font-black">Preço Restrito</p>
          )}
          {isPromoActive && <Countdown targetDate={product.promoUntil!} />}
        </div>
      </div>
    </div>
  );
};

const Shop: React.FC<ShopProps> = ({ products, onAddToCart, isAdmin, onDeleteProduct, user, onNavigate }) => {
  const [filter, setFilter] = useState<Category | string>(Category.ALL);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = filter === Category.ALL ? products : products.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-6xl font-sora font-black uppercase tracking-tighter">DROPS <span className="text-[#CCFF00]">LI MODA</span></h1>
            {isAdmin && (
              <button onClick={() => setIsAddModalOpen(true)} className="bg-[#CCFF00] text-black w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>
          <p className="text-white/20 text-[10px] font-black tracking-[0.5em] uppercase">Teresina-PI • Alta Performance</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                filter === cat ? 'bg-[#CCFF00] text-black border-[#CCFF00]' : 'bg-white/5 border-white/5 text-white/30 hover:text-white'
              }`}
            >
              {cat === Category.ALL ? 'TODOS OS ITENS' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
        {filtered.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            user={user} 
            onAddToCart={onAddToCart} 
            isAdmin={isAdmin} 
            onDelete={onDeleteProduct}
            onEdit={setEditingProduct}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {(isAddModalOpen || editingProduct) && (
        <AdminProductModal 
          product={editingProduct} 
          onClose={() => { setIsAddModalOpen(false); setEditingProduct(null); }} 
        />
      )}
    </div>
  );
};

export default Shop;
