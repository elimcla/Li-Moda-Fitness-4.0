
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Product } from '../types';

interface HomeProps {
  onNavigate: (view: 'home' | 'shop' | 'login') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [topSellers, setTopSellers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          orderBy('salesCount', 'desc'),
          limit(4)
        );
        const snap = await getDocs(q);
        const prods = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setTopSellers(prods);
      } catch (e) {
        console.error("Erro ao buscar mais vendidos:", e);
      }
    };
    fetchTopSellers();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1571731956622-39ed27082937?q=80&w=2072&auto=format&fit=crop" 
          alt="Performance" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h2 className="text-[#CCFF00] font-bold tracking-widest text-sm mb-4">PREMIUM FITNESSWEAR</h2>
          <h1 className="text-5xl md:text-8xl font-sora font-bold mb-8 leading-tight">
            FORÇA EM CADA <span className="text-[#CCFF00]">MOVIMENTO</span>
          </h1>
          <button 
            onClick={() => onNavigate('shop')}
            className="bg-[#CCFF00] text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#CCFF00]/20"
          >
            COMPRAR AGORA
          </button>
        </div>
      </section>

      {/* Top Sellers Section */}
      {topSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <span className="text-[#CCFF00] text-[10px] font-black tracking-[0.4em] uppercase">Social Validation</span>
              <h2 className="text-4xl font-sora font-bold uppercase tracking-tighter">MAIS <span className="text-[#CCFF00]">VENDIDOS</span></h2>
            </div>
            <button onClick={() => onNavigate('shop')} className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-[#CCFF00] transition-colors">Ver todos os drops →</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {topSellers.map((product) => (
              <div 
                key={product.id} 
                onClick={() => onNavigate('shop')}
                className="group relative glass rounded-3xl overflow-hidden cursor-pointer hover:border-[#CCFF00]/30 transition-all"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                  <div className="absolute top-3 right-3 bg-[#CCFF00] text-black text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Best Seller</div>
                </div>
                <div className="p-5">
                  <h3 className="font-sora font-black text-xs uppercase tracking-tighter truncate">{product.name}</h3>
                  <p className="text-[10px] text-[#FFD700] font-black mt-2">DOPAMINE HIT</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bento Grid Categories */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <h2 className="text-3xl font-sora font-bold mb-12 text-center">CATEGORIAS <span className="text-[#FFD700]">PREMIUM</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[800px] md:h-[600px]">
          <div 
            onClick={() => onNavigate('shop')}
            className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10"
          >
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop" alt="Leggings" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-3xl font-sora font-bold mb-2">LEGGINGS</h3>
              <p className="text-white/60">Tecnologia de compressão avançada.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('shop')}
            className="md:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10"
          >
            <img src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop" alt="Tops" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-sora font-bold mb-2">TOPS</h3>
              <p className="text-white/60">Sustentação e conforto extremo.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('shop')}
            className="md:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10"
          >
            <img src="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?q=80&w=1000&auto=format&fit=crop" alt="Conjuntos" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-sora font-bold mb-2">CONJUNTOS</h3>
              <p className="text-white/60">Looks completos para seu treino.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-surface py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-lg">
            <h2 className="text-4xl font-sora font-bold mb-6">FAÇA PARTE DO <span className="text-[#CCFF00]">TIME LI</span></h2>
            <p className="text-white/60 mb-8 leading-relaxed">Mais que uma marca, uma comunidade de performance. Use #LiModaFitness e apareça em nosso feed.</p>
            <button className="border border-[#CCFF00] text-[#CCFF00] px-8 py-3 rounded-full hover:bg-[#CCFF00] hover:text-black transition-all">
              VER NO INSTAGRAM
            </button>
          </div>
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://picsum.photos/100/100?random=${i+20}`} className="w-20 h-20 rounded-full border-4 border-[#111] object-cover" />
            ))}
            <div className="w-20 h-20 rounded-full border-4 border-[#111] bg-[#222] flex items-center justify-center font-bold text-xs">
              +5k
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
