
import React, { useState, useEffect } from 'react';
import { Category, Product, CartItem, User } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './views/Home';
import Shop from './views/Shop';
import Login from './views/Login';
import About from './views/About';
import Terms from './views/Terms';
import Privacy from './views/Privacy';
import AdminCustomerScore from './views/AdminCustomerScore';
import AdminProductModal from './components/AdminProductModal';
import CheckoutModal from './components/CheckoutModal';
import CartDrawer from './components/CartDrawer';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import { db } from './firebaseConfig';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'login' | 'about' | 'terms' | 'privacy' | 'admin_customers' | 'admin_products'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setIsMaintenance(doc.data().maintenanceMode || false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
    });
    return () => unsubscribe();
  }, []);

  const toggleMaintenance = async () => {
    if (!user?.isAdmin) return;
    const newStatus = !isMaintenance;
    await updateDoc(doc(db, 'settings', 'global'), { maintenanceMode: newStatus });
  };

  const addToCart = (product: Product, size: string, color?: string) => {
    if (!user) {
      setCurrentView('login');
      return;
    }
    
    const existingIndex = cart.findIndex(item => 
      item.id === product.id && 
      item.selectedSize === size && 
      (item as any).selectedColor === color
    );

    if (existingIndex !== -1) {
      setCart(prev => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart(prev => [...prev, { 
        ...product, 
        selectedSize: size, 
        selectedColor: color,
        quantity: 1 
      } as any]);
    }
    
    setTimeout(() => setIsCartOpen(true), 800);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setCurrentView('home');
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("Deseja remover este produto permanentemente?")) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const handleNavigate = (view: any) => {
    setCurrentView(view);
    window.scrollTo(0,0);
  };

  if (isMaintenance && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CCFF00] rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 space-y-8 max-w-2xl fade-in">
          <div className="w-24 h-24 bg-[#CCFF00] rounded-full mx-auto flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(204,255,0,0.3)]">
            <svg className="w-12 h-12 text-black animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.593 2.373a2 2 0 01-3.466 0l-.593-2.373a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 01-2.828 0l-1.428-1.428z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-sora font-black tracking-tighter uppercase leading-none">
            EM <span className="text-[#CCFF00]">MANUTENÇÃO</span>
          </h1>
          <p className="text-white/60 text-lg font-medium leading-relaxed">
            Estamos preparando um novo lançamento de alta performance. Em breve retornaremos com novidades.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
            <a href="https://wa.me/5586998091058" target="_blank" className="bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Falar com Suporte</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Header 
        onNavigate={handleNavigate} 
        onOpenCart={() => setIsCartOpen(true)} 
        onLogout={handleLogout}
        user={user} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        isMaintenance={isMaintenance}
        onToggleMaintenance={toggleMaintenance}
        products={products}
      />
      
      <main className="flex-grow pt-20">
        {currentView === 'home' && <Home onNavigate={handleNavigate} />}
        {currentView === 'shop' && (
          <Shop 
            products={products} 
            onAddToCart={addToCart} 
            isAdmin={user?.isAdmin || false} 
            onDeleteProduct={deleteProduct}
            user={user}
            onNavigate={handleNavigate}
          />
        )}
        {currentView === 'about' && <About />}
        {currentView === 'terms' && <Terms />}
        {currentView === 'privacy' && <Privacy />}
        {currentView === 'login' && <Login onLogin={setUser} onNavigate={handleNavigate} />}
        {currentView === 'admin_customers' && <AdminCustomerScore isAdmin={user?.isAdmin || false} />}
        {currentView === 'admin_products' && user?.isAdmin && (
          <div className="min-h-screen">
             <AdminProductModal onClose={() => handleNavigate('shop')} />
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={(id, size) => setCart(prev => prev.filter(i => !(i.id === id && i.selectedSize === size)))}
        onUpdateQty={(id, size, delta) => setCart(prev => prev.map(i => (i.id === id && i.selectedSize === size) ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))}
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
      />

      {isCheckoutOpen && (
        <CheckoutModal 
          items={cart}
          user={user}
          onClose={() => setIsCheckoutOpen(false)} 
          onSuccess={() => { setCart([]); setIsCheckoutOpen(false); alert("Pedido recebido!"); }}
        />
      )}

      <WhatsAppButton />
      <ChatBot />

      <div className="bg-[#CCFF00] text-black py-2 font-black uppercase tracking-widest overflow-hidden border-t border-black text-[10px]">
        <div className="marquee flex gap-12">
          <span>Li Moda Fitness 3.0 • Performance Superior • Teresina-PI • </span>
          <span>Li Moda Fitness 3.0 • Performance Superior • Teresina-PI • </span>
        </div>
      </div>
    </div>
  );
};

export default App;
