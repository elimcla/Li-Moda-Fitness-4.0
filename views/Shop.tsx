
import React, { useState, useEffect } from 'react';
import { Category, Product, User } from '../types';
import AdminProductModal from '../components/AdminProductModal';

interface ShopProps {
  products: Product[];
  onAddToCart: (product: Product, size: string, color?: string) => void;
  isAdmin: boolean;
  onDeleteProduct: (id: string) => void;
  user: User | null;
  onNavigate: (view: 'home' | 'shop' | 'login') => void;
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
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black leading-none">{timeLeft.d}d</span>
      </div>
      <span className="text-[8px] opacity-30">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black leading-none">{String(timeLeft.h).padStart(2, '0')}h</span>
      </div>
      <span className="text-[8px] opacity-30">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black leading-none">{String(timeLeft.m).padStart(2, '0')}m</span>
      </div>
      <span className="text-[8px] opacity-30">:</span>
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black text-[#CCFF00] leading-none animate-pulse">{String(timeLeft.s).padStart(2, '0')}s</span>
      </div>
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
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedFeedback, setAddedFeedback] = useState(false);
  
  const allImages = [product.image, ...(product.images || [])];
  const colors = (product as any).colors || [];
  
  const isPromoActive = product.promoPrice && product.promoUntil && new Date(product.promoUntil) > new Date();
  const displayPrice = isPromoActive ? product.promoPrice : product.price;
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity < 5;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allImages.length <= 1) return;
    setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('login');
      return;
    }
    if (isOutOfStock) return;

    // Validações
    if (!product.isUniqueSize && !selectedSize) {
      alert("Por favor, selecione o TAMANHO.");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert("Por favor, selecione a COR desejada.");
      return;
    }

    const finalSize = product.isUniqueSize ? 'ÚNICO' : selectedSize;
    onAddToCart(product, finalSize, selectedColor);
    
    // Feedback visual
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 3000);
  };

  return (
    <div className={`group relative glass rounded-3xl overflow-hidden hover:border-[#CCFF00]/50 transition-all duration-500 ${isOutOfStock ? 'opacity-80' : ''}`}>
      {isOutOfStock && (
        <div className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[4px]">
          <div className="bg-red-600/90 text-white text-[11px] font-black px-10 py-4 rounded-full uppercase tracking-[0.4em] -rotate-6 border-2 border-white/30 shadow-2xl animate-pulse">
            ESGOTADO
          </div>
        </div>
      )}
      
      {isAdmin && (
        <div className="absolute top-4 left-4 z-40 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(product); }} className="bg-[#CCFF00] p-3 rounded-full hover:scale-110 transition-transform shadow-xl">
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(product.id); }} className="bg-red-600 p-3 rounded-full hover:scale-110 transition-transform shadow-xl">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )}

      {!isOutOfStock && (
        <div className="absolute top-4 right-4 z-40">
          {isLowStock ? (
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-full border border-white/20 shadow-lg flex flex-col items-center">
              <span className="text-[7px] font-black uppercase tracking-widest leading-none">Peça Exclusiva</span>
              <span className="text-[10px] font-black">Restam {product.stockQuantity} unid.</span>
            </div>
          ) : (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest">
                {product.stockQuantity} itens
              </span>
            </div>
          )}
        </div>
      )}

      <div 
        className="relative aspect-[3/4] overflow-hidden bg-[#111] cursor-pointer"
        onClick={nextImage}
      >
        <img 
          src={allImages[currentImgIndex]} 
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
          alt={product.name}
        />
        
        {allImages.length > 1 && !isOutOfStock && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
            {allImages.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentImgIndex === i ? 'bg-[#CCFF00] w-6' : 'bg-white/20'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-sora font-black text-base uppercase leading-tight tracking-tighter truncate">{product.name}</h3>
          <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mt-0.5">{product.category}</p>
        </div>

        <div className="space-y-4">
          {/* Seleção de Cores */}
          {colors.length > 0 && user && !isOutOfStock && (
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Escolha a Cor:</p>
              <div className="flex flex-wrap gap-1.5">
                {colors.map((color: string) => (
                  <button 
                    key={color} 
                    onClick={(e) => { e.stopPropagation(); setSelectedColor(color); }}
                    className={`px-3 py-1.5 rounded-lg border text-[8px] font-black transition-all uppercase ${selectedColor === color ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de Tamanhos */}
          {!product.isUniqueSize && user && !isOutOfStock && (
            <div className="space-y-2">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Escolha o Tamanho:</p>
              <div className="flex gap-1.5">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                    className={`flex-1 py-2 rounded-lg border text-[9px] font-black transition-all ${selectedSize === size ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/10' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
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
            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-1 overflow-hidden relative ${
              addedFeedback 
              ? 'bg-green-500 text-white' 
              : isOutOfStock 
                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                : user 
                  ? 'bg-[#CCFF00] text-black hover:scale-[1.01] shadow-xl shadow-[#CCFF00]/10' 
                  : 'border border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black'
            }`}
          >
            {addedFeedback ? (
              <div className="animate-fade-in flex flex-col items-center">
                <span className="text-[8px] opacity-70">ADICIONADO COM SUCESSO</span>
                <span className="text-[10px]">{selectedColor} - {product.isUniqueSize ? 'ÚNICO' : selectedSize}</span>
              </div>
            ) : isOutOfStock ? (
              'ITEM ESGOTADO'
            ) : user ? (
              <>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  <span>ADICIONAR AO CARRINHO</span>
                </div>
                {(selectedSize || selectedColor) && (
                  <span className="text-[7px] opacity-50 font-bold">
                    {selectedColor || 'COR?'} | {product.isUniqueSize ? 'TAM. ÚNICO' : (selectedSize || 'TAMANHO?')}
                  </span>
                )}
              </>
            ) : (
              'REVELAR PREÇO'
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5">
          <div className="flex flex-col">
            {user ? (
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-sora font-black text-[#FFD700] tracking-tighter">
                  <span className="text-[10px] mr-0.5">R$</span>
                  {displayPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {isPromoActive && (
                  <p className="text-[10px] text-white/20 line-through font-bold">
                    {product.price.toFixed(0)}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                 <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                 <p className="text-[7px] text-white/20 uppercase font-black tracking-widest">Restrito</p>
              </div>
            )}
          </div>
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

  const filtered = filter === Category.ALL 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 fade-in">
      {/* HERO BANNER */}
      <div className="relative w-full h-[320px] md:h-[400px] rounded-[2.5rem] overflow-hidden mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 group">
        <img 
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2075&auto=format&fit=crop" 
          alt="Li Moda Fitness Showroom Premium" 
          className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-[10s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8">
          <div className="mb-4 bg-[#CCFF00] text-black px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] shadow-[0_5px_15px_rgba(204,255,0,0.3)]">
            A MAIOR CENTRAL DE ATACADO
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-7xl font-sora font-black uppercase tracking-tighter leading-none text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
              LI MODA <span className="text-[#CCFF00]">FITNESS</span>
            </h1>
            <div className="h-1 w-24 bg-[#CCFF00] mx-auto rounded-full" />
          </div>
          <p className="mt-4 text-white/90 text-[11px] md:text-lg max-w-2xl font-bold leading-relaxed drop-shadow-lg px-4">
            Showroom exclusivo de alta performance. <span className="text-[#CCFF00]">Tecnologia têxtil</span> para o topo.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="space-y-3">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-sora font-black uppercase tracking-tighter leading-[0.85]">
              COLEÇÕES <span className="text-[#CCFF00]">FITNESS</span>
            </h2>
            {isAdmin && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[#CCFF00] text-black w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all duration-500 shadow-[0_0_20px_rgba(204,255,0,0.4)]"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
              </button>
            )}
          </div>
          <p className="text-white/20 text-[9px] font-black tracking-[0.4em] uppercase">Teresina-PI • Curadoria Atacadista • Li Moda Fitness</p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          {Object.values(Category).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                filter === cat 
                ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-[0_5px_15px_rgba(204,255,0,0.2)]' 
                : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:border-white/20'
              }`}
            >
              {cat === Category.ALL ? 'TODOS' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="text-white/5 font-black text-8xl uppercase tracking-tighter select-none">VAZIO</div>
          <p className="text-white/20 font-bold uppercase tracking-[0.3em] text-[10px]">Nenhum item encontrado nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
      )}

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
