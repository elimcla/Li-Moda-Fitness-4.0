
import React, { useState, useEffect } from 'react';
import { User, Product, LoyaltyLevel } from '../types';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

interface HeaderProps {
  onNavigate: (view: 'home' | 'shop' | 'login' | 'about' | 'admin_customers') => void;
  onOpenCart: () => void;
  onLogout: () => void;
  user: User | null;
  cartCount: number;
  isMaintenance?: boolean;
  onToggleMaintenance?: () => void;
  products: Product[];
}

const Header: React.FC<HeaderProps> = ({ 
  onNavigate, 
  onOpenCart, 
  onLogout, 
  user, 
  cartCount,
  products
}) => {
  const [hasPromo, setHasPromo] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const promoActive = products.some(p => p.promoPrice && p.promoPrice < p.price && p.isAvailable);
    setHasPromo(promoActive);
  }, [products]);

  useEffect(() => {
    if (user && !user.isAdmin) {
      const unsub = onSnapshot(doc(db, 'customers', user.id), (snap) => {
        if (snap.exists()) {
          setUserData({ ...user, ...snap.data() } as User);
        }
      });

      const hasWelcomed = localStorage.getItem(`welcome_${user.id}`);
      if (!hasWelcomed) {
        setShowWelcomeNotification(true);
      }

      return () => unsub();
    } else if (!user) {
      setShowWelcomeNotification(false);
    }
  }, [user]);

  const getLoyaltyInfo = (spent: number = 0) => {
    if (spent >= 500) return { level: LoyaltyLevel.DIAMOND, color: '#00F0FF', next: null, target: 500 };
    if (spent >= 250) return { level: LoyaltyLevel.SILVER, color: '#C0C0C0', next: LoyaltyLevel.DIAMOND, target: 500 };
    if (spent >= 150) return { level: LoyaltyLevel.BRONZE, color: '#CD7F32', next: LoyaltyLevel.SILVER, target: 250 };
    return { level: LoyaltyLevel.NONE, color: '#888', next: LoyaltyLevel.BRONZE, target: 150 };
  };

  const loyalty = getLoyaltyInfo(userData?.totalSpent);

  const markCouponRead = async () => {
    if (user && userData?.activeCoupon) {
      await updateDoc(doc(db, 'customers', user.id), {
        'activeCoupon.isRead': true
      });
      setShowCouponModal(true);
      setCopied(false);
    }
  };

  const handleNotificationClick = () => {
    if (user) {
      setShowWelcomeModal(true);
      setShowWelcomeNotification(false);
      localStorage.setItem(`welcome_${user.id}`, 'true');
    } else {
      onNavigate('shop');
    }
  };

  const copyToClipboard = () => {
    if (userData?.activeCoupon) {
      navigator.clipboard.writeText(userData.activeCoupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] glass h-20 px-4 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-1 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
        <span className="text-xl md:text-2xl font-sora font-bold text-[#CCFF00]">Li</span>
        <span className="text-sm md:text-xl font-sora font-bold uppercase tracking-tighter">Moda Fitness</span>
      </div>

      <nav className="hidden lg:flex gap-8 items-center text-sm font-medium tracking-wide">
        <button onClick={() => onNavigate('home')} className="hover:text-[#CCFF00] transition-colors font-bold uppercase tracking-widest text-[10px]">INÍCIO</button>
        <button onClick={() => onNavigate('shop')} className="hover:text-[#CCFF00] transition-colors font-bold uppercase tracking-widest text-[10px]">COLEÇÕES</button>
        {user?.isAdmin && (
          <button onClick={() => onNavigate('admin_customers')} className="text-[#CCFF00] hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-[#CCFF00]/20">
            GESTÃO DE CLIENTES
          </button>
        )}
      </nav>

      <div className="flex items-center gap-2 md:gap-5">
        {user && !user.isAdmin && userData && (
          <div className="hidden md:flex flex-col items-end gap-1 mr-2">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: loyalty.color }}>{loyalty.level}</span>
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ backgroundColor: loyalty.color, width: `${Math.min(100, (userData.totalSpent || 0) / loyalty.target * 100)}%` }} 
                />
              </div>
            </div>
            {loyalty.next && (
              <span className="text-[7px] text-white/30 font-bold uppercase tracking-tighter">Faltam R$ {(loyalty.target - (userData.totalSpent || 0)).toFixed(2)} para {loyalty.next}</span>
            )}
          </div>
        )}

        <button onClick={handleNotificationClick} className="relative p-2 text-white/40 hover:text-[#CCFF00] transition-colors" title="Mensagens e Novidades">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          {(hasPromo || showWelcomeNotification) && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#CCFF00] rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_#CCFF00]" />}
        </button>

        {user && !user.isAdmin && (
          <button onClick={markCouponRead} className={`relative p-2 transition-colors ${userData?.activeCoupon ? 'text-[#CCFF00]' : 'text-white/20'}`} title="Meus Cupons">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
            {userData?.activeCoupon && !userData.activeCoupon.isRead && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#CCFF00] text-black text-[8px] font-black rounded-full flex items-center justify-center animate-bounce">!</span>
            )}
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end min-w-[70px]">
              <span className="text-[9px] md:text-xs font-bold text-[#CCFF00] leading-none uppercase truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
              <button onClick={onLogout} className="text-[8px] md:text-[9px] text-white/40 hover:text-red-500 uppercase font-black tracking-widest mt-1">[ SAIR ]</button>
            </div>
            <div 
              className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs uppercase"
              style={{ borderColor: loyalty.color, backgroundColor: `${loyalty.color}10`, color: loyalty.color, boxShadow: loyalty.level === LoyaltyLevel.DIAMOND ? `0 0 15px ${loyalty.color}40` : 'none' }}
            >
              {user.name[0]}
            </div>
          </div>
        ) : (
          <button onClick={() => onNavigate('login')} className="flex flex-col items-center gap-0.5 group px-2 transition-transform active:scale-95">
            <svg className="w-6 h-6 text-white/40 group-hover:text-[#CCFF00] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-[7px] font-black text-white/20 group-hover:text-[#CCFF00] uppercase tracking-[0.2em] transition-colors">ENTRAR</span>
          </button>
        )}

        <button onClick={onOpenCart} className="relative group p-2 rounded-full hover:bg-white/5 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#CCFF00] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">{cartCount}</span>}
        </button>
      </div>

      {/* MODAL DE BOAS-VINDAS / HISTÓRICO DE MENSAGENS */}
      {showWelcomeModal && user && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center p-6 bg-black/40 backdrop-blur-sm pt-28 md:pt-32">
          <div className="absolute inset-0" onClick={() => setShowWelcomeModal(false)} />
          <div className="relative w-full max-w-sm glass rounded-[2.5rem] p-8 border border-[#CCFF00]/30 text-center space-y-6 shadow-[0_30px_100px_rgba(0,0,0,0.5)] fade-in">
            <div className="w-16 h-16 bg-[#CCFF00] rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(204,255,0,0.3)]">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-sora font-black text-white uppercase tracking-tighter leading-none">SEJA BEM-VINDA, <span className="text-[#CCFF00]">{user.name.split(' ')[0]}</span>!</h2>
              <p className="text-white/60 text-[11px] font-medium leading-relaxed px-4">
                Sua curadoria de moda fitness premium está ativa. Peças que unem tecnologia têxtil e estética impecável para destacar sua melhor versão em qualquer lugar.
              </p>
            </div>
            <button 
              onClick={() => setShowWelcomeModal(false)} 
              className="w-full py-4 bg-[#CCFF00] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 shadow-xl"
            >
              VOLTAR PARA A LOJA
            </button>
            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Histórico de Boas-vindas Liboda</p>
          </div>
        </div>
      )}

      {showCouponModal && userData?.activeCoupon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="w-full max-w-sm glass rounded-[2.5rem] p-8 border border-[#CCFF00]/30 text-center space-y-6 shadow-[0_0_100px_rgba(204,255,0,0.1)]">
            <div className="w-20 h-20 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-[#CCFF00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-sora font-black text-[#CCFF00] uppercase tracking-tighter">PRESENTE LIBODA!</h2>
              <p className="text-white/60 text-sm leading-relaxed">{userData.activeCoupon.message}</p>
              <p className="text-[10px] text-[#FFD700] font-black uppercase">Válido por 20 dias em itens selecionados</p>
            </div>
            
            <div className="relative bg-black/40 border-2 border-dashed border-[#CCFF00]/30 p-6 rounded-2xl group cursor-pointer active:scale-95 transition-all overflow-hidden" onClick={copyToClipboard}>
              <p className="text-[10px] text-white/20 uppercase font-black mb-1 tracking-widest">{copied ? 'CÓDIGO COPIADO!' : 'Toque para copiar o código'}</p>
              <p className="text-4xl font-mono font-black text-[#CCFF00] tracking-widest uppercase">{userData.activeCoupon.code}</p>
              {copied && <div className="absolute inset-0 bg-[#CCFF00] flex items-center justify-center"><span className="text-black font-black text-xs uppercase">Copiado!</span></div>}
            </div>
            <button onClick={() => setShowCouponModal(false)} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 transition-all">FECHAR</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
