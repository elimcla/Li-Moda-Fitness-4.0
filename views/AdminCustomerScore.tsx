
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { User, LoyaltyLevel } from '../types';

const AdminCustomerScore: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'customers'), orderBy('totalSpent', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [isAdmin]);

  const getLevel = (spent: number = 0) => {
    if (spent >= 500) return { name: LoyaltyLevel.DIAMOND, color: '#00F0FF', suggest: 40 };
    if (spent >= 250) return { name: LoyaltyLevel.SILVER, color: '#C0C0C0', suggest: 25 };
    if (spent >= 150) return { name: LoyaltyLevel.BRONZE, color: '#CD7F32', suggest: 15 };
    return { name: LoyaltyLevel.NONE, color: '#555', suggest: 0 };
  };

  const applySuggestion = () => {
    if (!selectedCustomer) return;
    const { suggest } = getLevel(selectedCustomer.totalSpent);
    if (suggest > 0) {
      setDiscountType('percent');
      setDiscountValue(suggest.toString());
      setCouponMsg(`Parabéns! Pelo seu nível ${getLevel(selectedCustomer.totalSpent).name}, você liberou ${suggest}% OFF em itens selecionados!`);
      
      // Gera código com o valor sugerido já incluso
      const namePart = selectedCustomer.name.split(' ')[0].substring(0, 4).toUpperCase();
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const suffix = '%';
      setCouponCode(`${namePart}${randPart}${suggest}${suffix}`);
    }
  };

  const generateCode = () => {
    if (!selectedCustomer) return;
    const namePart = selectedCustomer.name.split(' ')[0].substring(0, 4).toUpperCase();
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const valuePart = discountValue || '0';
    const suffix = discountType === 'percent' ? '%' : 'RS';
    setCouponCode(`${namePart}${randPart}${valuePart}${suffix}`);
  };

  const sendCoupon = async () => {
    if (!selectedCustomer || !couponCode) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'customers', selectedCustomer.id), {
        activeCoupon: {
          code: couponCode.toUpperCase(),
          message: couponMsg,
          discountType,
          discountValue: Number(discountValue),
          isRead: false,
          assignedAt: new Date().toISOString()
        }
      });
      alert(`Cupom de nível enviado para ${selectedCustomer.name}!`);
      setSelectedCustomer(null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (!isAdmin) return <div className="p-20 text-center uppercase font-black text-white/10 text-4xl">ACESSO NEGADO</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div className="space-y-2">
          <span className="text-[#CCFF00] text-[10px] font-black tracking-[0.4em] uppercase">Intelligence & Growth</span>
          <h1 className="text-4xl md:text-6xl font-sora font-black uppercase tracking-tighter leading-none">CUSTOMER <span className="text-[#CCFF00]">SCORE</span></h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-12 px-6 py-3 text-[9px] font-black text-white/20 uppercase tracking-widest">
            <div className="col-span-4">Identificação</div>
            <div className="col-span-2 text-center">Nível</div>
            <div className="col-span-3 text-right">Gasto Total</div>
            <div className="col-span-3 text-right">Ação Sugerida</div>
          </div>
          
          <div className="space-y-3">
            {customers.map((c) => {
              const level = getLevel(c.totalSpent);
              return (
                <div key={c.id} onClick={() => setSelectedCustomer(c)} className={`grid grid-cols-12 items-center p-6 rounded-3xl border transition-all cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-xl' : 'bg-white/5 border-white/5 hover:border-white/20 text-white'}`}>
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: `${level.color}20`, color: level.color }}>{c.name?.[0] || '?'}</div>
                    <div className="flex flex-col truncate">
                      <span className="font-black text-sm uppercase truncate">{c.name}</span>
                      <span className="text-[9px] opacity-40 font-bold">{c.whatsapp}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-[8px] font-black px-2 py-1 rounded-md border" style={{ color: level.color, borderColor: `${level.color}40` }}>{level.name}</span>
                  </div>
                  <div className="col-span-3 text-right font-black">R$ {(c.totalSpent || 0).toFixed(2)}</div>
                  <div className="col-span-3 text-right">
                    {level.suggest > 0 ? (
                      <span className="text-[9px] font-black text-[#CCFF00] bg-black px-3 py-1.5 rounded-full animate-pulse">LIBERAR {level.suggest}%</span>
                    ) : (
                      <span className="text-[8px] opacity-20 uppercase font-black">Em Progresso</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 glass p-8 rounded-[2.5rem] border border-white/10 space-y-8">
            <h2 className="text-xl font-sora font-black uppercase text-[#CCFF00] tracking-tighter">CLUBE DE FIDELIDADE</h2>
            
            {selectedCustomer ? (
              <div className="space-y-6 animate-fade-in">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[8px] text-white/30 uppercase font-black block mb-1">Status Atual:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase" style={{ color: getLevel(selectedCustomer.totalSpent).color }}>{getLevel(selectedCustomer.totalSpent).name}</span>
                    <button onClick={applySuggestion} className="bg-white/10 px-3 py-1 rounded-md text-[8px] font-black hover:bg-[#CCFF00] hover:text-black transition-all">AUTO-APLICAR REGRA</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 p-1 bg-black/40 rounded-xl">
                    <button onClick={() => setDiscountType('percent')} className={`flex-1 py-2 rounded-lg text-[9px] font-black ${discountType === 'percent' ? 'bg-[#CCFF00] text-black' : 'text-white/30'}`}>PORCENTAGEM (%)</button>
                    <button onClick={() => setDiscountType('fixed')} className={`flex-1 py-2 rounded-lg text-[9px] font-black ${discountType === 'fixed' ? 'bg-[#CCFF00] text-black' : 'text-white/30'}`}>VALOR FIXO (R$)</button>
                  </div>
                  <input type="number" placeholder="Valor" className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-black text-white" value={discountValue} onChange={e => { setDiscountValue(e.target.value); }} />
                  <div className="relative">
                    <input type="text" placeholder="CODE" className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-sm font-mono font-black text-[#CCFF00]" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                    <button onClick={generateCode} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CCFF00]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5" /></svg></button>
                  </div>
                  <textarea placeholder="Mensagem do benefício..." className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs h-24" value={couponMsg} onChange={e => setCouponMsg(e.target.value)} />
                </div>

                <button onClick={sendCoupon} disabled={loading} className="w-full bg-[#CCFF00] text-black py-5 rounded-2xl font-black uppercase text-xs shadow-xl">{loading ? 'SINCRONIZANDO...' : 'ENVIAR RECOMPENSA'}</button>
              </div>
            ) : (
              <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                <p className="text-[10px] font-black uppercase">Selecione para ver o progresso do nível.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerScore;
