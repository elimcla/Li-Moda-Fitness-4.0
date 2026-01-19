
import React from 'react';

interface FooterProps {
  onNavigate: (view: 'home' | 'shop' | 'login' | 'about' | 'terms' | 'privacy') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-surface border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <div className="text-2xl font-sora font-bold">
            <span className="text-[#CCFF00]">Li</span> Moda Fitness
          </div>
          <p className="text-white/40 text-sm leading-relaxed">
            A união perfeita entre tecnologia têxtil, design premium e performance. Sinta a diferença em cada movimento.
          </p>
        </div>

        <div>
          <h4 className="font-sora font-bold mb-6 text-[#FFD700]">NAVEGAÇÃO</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><button onClick={() => onNavigate('home')} className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Home</button></li>
            <li><button onClick={() => onNavigate('shop')} className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Loja</button></li>
            <li><button onClick={() => onNavigate('about')} className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Sobre Nós</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sora font-bold mb-6 text-[#FFD700]">AJUDA</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><button className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Rastreio</button></li>
            <li><button onClick={() => onNavigate('terms')} className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Garantia & Trocas</button></li>
            <li><button onClick={() => onNavigate('privacy')} className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Privacidade</button></li>
            <li><button className="hover:text-[#CCFF00] uppercase tracking-widest text-[10px] font-black">Contato</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sora font-bold mb-6 text-[#FFD700]">NEWSLETTER</h4>
          <p className="text-xs text-white/40 mb-4 uppercase font-black">Receba lançamentos e descontos exclusivos.</p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="E-MAIL" 
              className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 outline-none focus:border-[#CCFF00] w-full text-xs font-bold"
            />
            <button className="bg-[#CCFF00] text-black px-4 py-2 rounded-r-lg font-black text-xs">OK</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/20 uppercase tracking-[0.2em]">
        <p>© 2024 LI MODA FITNESS. TODOS OS DIREITOS RESERVADOS.</p>
        <p>FEITO PARA QUEM BUSCA O TOPO.</p>
      </div>
    </footer>
  );
};

export default Footer;
