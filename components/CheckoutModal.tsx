
import React, { useState, useEffect } from 'react';
import { CartItem, User, Product } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';

interface CheckoutModalProps {
  items: CartItem[];
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, user, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isSudeste, setIsSudeste] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [userData, setUserData] = useState<any>(null);
  
  const subtotal = items.reduce((acc, item) => acc + (item.promoPrice || item.price) * item.quantity, 0);
  
  const [form, setForm] = useState({
    name: '',
    cpf: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    email: ''
  });

  const BAIRROS_SUDESTE = ['PARQUE IDEAL', 'DIRCEU', 'ITARARE', 'SÃO JOÃO', 'GURUPÍ', 'COLORADO', 'RENASCENÇA', 'NOVO HORIZONTE', 'TODOS OS SANTOS', 'ALTO DA RESSURREIÇÃO', 'ESTORIL'];

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setForm(prev => ({ ...prev, name: user.name, email: user.email }));
        try {
          const snap = await getDoc(doc(db, 'customers', user.id));
          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);
            setForm(prev => ({
              ...prev,
              phone: data.whatsapp || data.phone || '',
              cpf: data.cpf || '',
              cep: data.cep || '',
              address: data.address || '',
              number: data.number || ''
            }));
            if (data.cep) fetchCep(data.cep.replace(/\D/g, ''));
            // Pré-carrega o cupom ativo se houver
            if (data.activeCoupon) {
              setAppliedCoupon(data.activeCoupon);
            }
          }
        } catch (e) { console.error(e); }
      }
    };
    loadUserData();
  }, [user]);

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        const currentBairro = (data.bairro || '').toUpperCase();
        const sudeste = BAIRROS_SUDESTE.some(b => currentBairro.includes(b));
        setIsSudeste(sudeste);
        setForm(prev => ({ ...prev, address: fullAddress }));
        setShippingCost(sudeste ? 0 : 15);
      }
    } catch (e) { console.error(e); }
  };

  const handleMask = (field: string, value: string) => {
    let masked = value;
    if (field === 'cpf') masked = value.replace(/\D/g, '').substring(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '').substring(0, 11);
      masked = digits.length <= 10 ? digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3') : digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (field === 'cep') {
      masked = value.replace(/\D/g, '').substring(0, 8);
      if (masked.length === 8) fetchCep(masked);
      masked = masked.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    setForm(prev => ({ ...prev, [field]: masked }));
  };

  const applyManualCoupon = () => {
    if (userData?.activeCoupon && userData.activeCoupon.code === couponInput.toUpperCase()) {
      setAppliedCoupon(userData.activeCoupon);
      alert("Cupom aplicado com sucesso!");
    } else {
      alert("Cupom inválido ou não encontrado para sua conta.");
    }
  };

  const discountValue = appliedCoupon ? (appliedCoupon.discountType === 'percent' ? subtotal * (appliedCoupon.discountValue / 100) : appliedCoupon.discountValue) : 0;
  const shippingValue = (deliveryMethod === 'delivery' ? (shippingCost || 0) : 0);
  const finalTotal = subtotal - discountValue + shippingValue;

  const saveOrderToDatabase = async () => {
    if (!user || !acceptTerms) return;
    setLoading(true);
    try {
      const orderId = `ORDER-${Date.now()}`;
      
      for (const item of items) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data() as Product;
          const legacyColors = (productData as any).colors || [];
          const selectedColor = (item as any).selectedColor;

          const updatedLegacyColors = legacyColors.map((c: string) => {
            if (c.startsWith(selectedColor)) {
              const match = c.match(/\((\d+)\)/);
              const currentQty = match ? parseInt(match[1]) : 0;
              const newQty = Math.max(0, currentQty - item.quantity);
              return `${selectedColor} (${newQty})`;
            }
            return c;
          });

          await updateDoc(productRef, {
            colors: updatedLegacyColors,
            stockQuantity: increment(-item.quantity),
            salesCount: increment(item.quantity)
          });
        }
      }

      const orderData = {
        orderId,
        items: items.map(i => ({ id: i.id, name: i.name, color: (i as any).selectedColor, size: i.selectedSize, quantity: i.quantity, price: i.promoPrice || i.price })),
        total: finalTotal,
        discount: discountValue,
        shipping: shippingValue,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), { ...orderData, customerId: user.id, customerName: form.name });
      
      // CRITICAL: Update customer AND invalidate the coupon
      await updateDoc(doc(db, 'customers', user.id), { 
        orders: arrayUnion(orderData),
        totalSpent: increment(orderData.total),
        activeCoupon: null // O cupom é zerado após o uso
      });

      onSuccess();
    } catch (e) {
      console.error(e);
      alert("Erro ao processar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl glass rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-sora font-bold uppercase tracking-tighter">{step === 1 ? 'Dados da Entrega' : 'Pagamento'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button onClick={() => setDeliveryMethod('delivery')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${deliveryMethod === 'delivery' ? 'bg-[#CCFF00] text-black' : 'text-white/40'}`}>ENTREGA</button>
              <button onClick={() => setDeliveryMethod('pickup')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${deliveryMethod === 'pickup' ? 'bg-[#CCFF00] text-black' : 'text-white/40'}`}>RETIRADA</button>
            </div>
            <input type="text" placeholder="NOME COMPLETO" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="CPF" className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={form.cpf} onChange={e => handleMask('cpf', e.target.value)} />
              <input type="text" placeholder="WHATSAPP" className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={form.phone} onChange={e => handleMask('phone', e.target.value)} />
            </div>
            {deliveryMethod === 'delivery' && (
              <>
                <input type="text" placeholder="CEP" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={form.cep} onChange={e => handleMask('cep', e.target.value)} />
                <input type="text" placeholder="ENDEREÇO COMPLETO" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <input type="text" placeholder="NÚMERO / APTO" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={form.number} onChange={e => setForm({...form, number: e.target.value})} />
              </>
            )}
            <button onClick={() => setStep(2)} className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase tracking-widest mt-4">PROSSEGUIR</button>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex gap-4">
                <button onClick={() => setPaymentMethod('pix')} className={`flex-1 p-6 rounded-2xl border transition-all ${paymentMethod === 'pix' ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-white/10 text-white/40'}`}>PIX</button>
                <button onClick={() => setPaymentMethod('card')} className={`flex-1 p-6 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-white/10 text-white/40'}`}>CARTÃO</button>
              </div>

              {/* Área de Cupom */}
              {!appliedCoupon && userData?.activeCoupon && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="TEM UM CUPOM?" 
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-[#CCFF00]"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                  />
                  <button onClick={applyManualCoupon} className="bg-white/10 px-6 rounded-xl text-[10px] font-black uppercase">APLICAR</button>
                </div>
              )}

              {appliedCoupon && (
                <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-[#CCFF00] uppercase">Cupom Aplicado: {appliedCoupon.code}</p>
                    <p className="text-[8px] text-white/40">{appliedCoupon.message}</p>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-red-500 font-black text-[8px] uppercase">REMOVER</button>
                </div>
              )}

              <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                <div className="flex justify-between text-[10px] text-white/40 uppercase font-black"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
                {discountValue > 0 && <div className="flex justify-between text-[10px] text-green-500 uppercase font-black"><span>Desconto:</span><span>- R$ {discountValue.toFixed(2)}</span></div>}
                {deliveryMethod === 'delivery' && <div className="flex justify-between text-[10px] text-white/40 uppercase font-black"><span>Frete:</span><span>{shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost?.toFixed(2)}`}</span></div>}
                <div className="flex justify-between text-xl font-black pt-3 border-t border-white/5 text-[#CCFF00]">
                  <span>TOTAL:</span><span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden peer" checked={acceptTerms} onChange={() => setAcceptTerms(!acceptTerms)} />
                <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:bg-[#CCFF00] peer-checked:border-[#CCFF00]" />
                <span className="text-[10px] text-white/60 font-bold uppercase">Aceito os termos de garantia e troca</span>
              </label>
              
              <button onClick={saveOrderToDatabase} disabled={loading || !acceptTerms} className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-[#CCFF00]/20 active:scale-95 transition-all">
                {loading ? 'PROCESSANDO...' : 'FINALIZAR PEDIDO'}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
