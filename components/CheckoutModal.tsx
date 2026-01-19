
import React, { useState, useEffect } from 'react';
import { CartItem, User } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp, increment } from 'firebase/firestore';
import Terms from '../views/Terms';
import Privacy from '../views/Privacy';

interface CheckoutModalProps {
  items: CartItem[];
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, user, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [overlayView, setOverlayView] = useState<'none' | 'terms' | 'privacy'>('none');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isSudeste, setIsSudeste] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponInput, setCouponInput] = useState('');
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

  const BAIRROS_SUDESTE = [
    'PARQUE IDEAL', 'DIRCEU', 'ITARARE', 'SÃO JOÃO', 'GURUPÍ', 
    'COLORADO', 'RENASCENÇA', 'NOVO HORIZONTE', 'TODOS OS SANTOS', 
    'ALTO DA RESSURREIÇÃO', 'ESTORIL'
  ];

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;
    return true;
  };

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
          }
        } catch (e) { console.error("Erro ao carregar dados:", e); }
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
      } else {
        alert("CEP não encontrado!");
        setForm(prev => ({ ...prev, cep: '', address: '' }));
      }
    } catch (e) { console.error("Erro ViaCEP:", e); }
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

  const applyCoupon = () => {
    if (userData?.activeCoupon && userData.activeCoupon.code.toUpperCase() === couponInput.toUpperCase().trim()) {
      setAppliedCoupon(userData.activeCoupon);
      alert(`Cupom ${userData.activeCoupon.code} aplicado!`);
    } else {
      alert("Cupom inválido ou não encontrado na sua conta.");
      setAppliedCoupon(null);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percent') {
      return subtotal * (appliedCoupon.discountValue / 100);
    }
    return appliedCoupon.discountValue;
  };

  const discount = calculateDiscount();
  const currentShipping = deliveryMethod === 'delivery' ? (shippingCost || 0) : 0;
  const finalTotal = subtotal - discount + currentShipping;

  const saveOrderToDatabase = async () => {
    if (!user) return;
    if (!acceptTerms) {
      alert("Você deve aceitar os termos de garantia e troca para finalizar.");
      return;
    }
    if (!validateCPF(form.cpf)) {
      alert("CPF inválido!");
      return;
    }
    if (deliveryMethod === 'delivery' && !form.address) {
      alert("CEP/Endereço inválido!");
      return;
    }

    setLoading(true);
    try {
      const orderId = `ORDER-${Date.now()}`;
      
      const orderData = {
        orderId,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.promoPrice || i.price, quantity: i.quantity, size: i.selectedSize })),
        subtotal: subtotal,
        discount: discount,
        total: finalTotal,
        shipping: currentShipping,
        paymentMethod,
        deliveryMethod,
        couponUsed: appliedCoupon?.code || null,
        status: 'pending',
        termsAccepted: true,
        acceptedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const customerRef = doc(db, 'customers', user.id);
      
      // Se usou cupom, desativa ele na conta do cliente
      const customerUpdates: any = {
        name: form.name,
        email: form.email,
        cpf: form.cpf,
        phone: form.phone,
        cep: form.cep,
        address: form.address,
        number: form.number,
        lastActivity: serverTimestamp(),
        orders: arrayUnion(orderData),
        totalSpent: increment(finalTotal),
        orderCount: increment(1)
      };

      if (appliedCoupon) {
        customerUpdates.activeCoupon = null;
      }

      await setDoc(customerRef, customerUpdates, { merge: true });

      await setDoc(doc(db, 'orders', orderId), {
        ...orderData,
        customerId: user.id,
        customerName: form.name,
        customerPhone: form.phone,
        customerAddress: deliveryMethod === 'delivery' ? `${form.address}, ${form.number}` : 'Retirada na Loja'
      });

      for (const item of items) {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          salesCount: increment(item.quantity),
          stockQuantity: increment(-item.quantity)
        });
      }

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
      <div className="relative w-full max-w-xl glass rounded-3xl overflow-hidden fade-in max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        
        {overlayView !== 'none' && (
          <div className="absolute inset-0 z-50 bg-[#050505] overflow-y-auto p-8 fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-sora font-black text-[#CCFF00] uppercase text-xs tracking-widest">Documentação Oficial</h3>
              <button 
                onClick={() => setOverlayView('none')}
                className="bg-white/10 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#CCFF00] hover:text-black transition-all"
              >
                Voltar
              </button>
            </div>
            {overlayView === 'terms' ? <Terms /> : <Privacy />}
          </div>
        )}

        <div className="p-8">
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

              <div className="space-y-4">
                <input type="text" placeholder="NOME COMPLETO" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="CPF" required className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" value={form.cpf} onChange={e => handleMask('cpf', e.target.value)} />
                  <input type="text" placeholder="WHATSAPP" required className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" value={form.phone} onChange={e => handleMask('phone', e.target.value)} />
                </div>
                {deliveryMethod === 'delivery' && (
                  <>
                    <input type="text" placeholder="CEP" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" value={form.cep} onChange={e => handleMask('cep', e.target.value)} />
                    <input type="text" placeholder="ENDEREÇO" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm opacity-60" value={form.address} readOnly />
                    <input type="text" placeholder="NÚMERO / APTO" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" value={form.number} onChange={e => setForm({...form, number: e.target.value})} />
                  </>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <button onClick={() => setStep(2)} className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all">PROSSEGUIR</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* SEÇÃO DE CUPOM */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase text-[#CCFF00] tracking-widest">Cupom de Desconto</h3>
                {userData?.activeCoupon ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="CÓDIGO" 
                      className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-[#CCFF00] outline-none focus:border-[#CCFF00]"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    />
                    <button onClick={applyCoupon} className="bg-[#CCFF00] text-black px-4 rounded-xl font-black text-[10px] uppercase">Aplicar</button>
                  </div>
                ) : (
                  <p className="text-[9px] text-white/20 uppercase font-bold text-center">Nenhum cupom disponível na sua conta.</p>
                )}
                {userData?.activeCoupon && (
                  <button 
                    onClick={() => setCouponInput(userData.activeCoupon.code)}
                    className="text-[9px] text-white/40 hover:text-[#CCFF00] underline transition-colors"
                  >
                    Usar cupom salvo: {userData.activeCoupon.code}
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setPaymentMethod('pix')} className={`flex-1 p-6 rounded-2xl border transition-all ${paymentMethod === 'pix' ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-white/10 text-white/40'}`}>PIX</button>
                <button onClick={() => setPaymentMethod('card')} className={`flex-1 p-6 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'border-[#CCFF00] bg-[#CCFF00]/10' : 'border-white/10 text-white/40'}`}>CARTÃO</button>
              </div>

              <div className="glass p-6 rounded-2xl space-y-3 border border-white/5">
                <div className="flex justify-between text-xs text-white/40"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-xs text-[#CCFF00] font-black uppercase"><span>Desconto:</span><span>- R$ {discount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-xs text-white/40"><span>Frete:</span><span>{currentShipping === 0 ? 'GRÁTIS' : `R$ ${currentShipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-xl font-black pt-3 border-t border-white/5 text-[#CCFF00]">
                  <span>TOTAL:</span><span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input type="checkbox" className="peer hidden" checked={acceptTerms} onChange={() => setAcceptTerms(!acceptTerms)} />
                    <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-[#CCFF00] peer-checked:border-[#CCFF00] transition-all" />
                    <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 left-1 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-[10px] text-white/60 leading-relaxed uppercase font-bold tracking-wider group-hover:text-white transition-colors">Li e aceito os <button type="button" onClick={() => setOverlayView('terms')} className="text-[#CCFF00] underline">Termos</button> e a <button type="button" onClick={() => setOverlayView('privacy')} className="text-[#CCFF00] underline">Política de Privacidade</button>.</span>
                </label>
              </div>

              <button onClick={saveOrderToDatabase} disabled={loading || !acceptTerms} className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase tracking-widest disabled:opacity-30 transition-all">{loading ? 'PROCESSANDO...' : 'FINALIZAR PEDIDO'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
