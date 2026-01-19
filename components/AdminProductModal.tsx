
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

interface AdminProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

const AdminProductModal: React.FC<AdminProductModalProps> = ({ product, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [mediaInput, setMediaInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [colorInput, setColorInput] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    promoPrice: product?.promoPrice || 0,
    promoUntil: product?.promoUntil || '',
    description: product?.description || '',
    category: product?.category || Category.LEGGINGS,
    image: product?.image || '',
    images: product?.images || [],
    sizes: product?.sizes || [],
    colors: (product as any)?.colors || [],
    isUniqueSize: product?.isUniqueSize || false,
    isAvailable: product?.isAvailable ?? true,
    stockQuantity: product?.stockQuantity || 0
  });

  useEffect(() => {
    if (!product) {
      if (form.category === Category.CALCADOS) {
        setForm(prev => ({ ...prev, sizes: ['35', '36', '37', '38', '39', '40'], isUniqueSize: false }));
      } else if (form.category === Category.ACESSORIOS) {
        setForm(prev => ({ ...prev, sizes: ['ÚNICO'], isUniqueSize: true }));
      } else {
        setForm(prev => ({ ...prev, sizes: ['P', 'M', 'G'], isUniqueSize: false }));
      }
    }
  }, [form.category]);

  const handleSave = async () => {
    if (!form.name || !form.image) {
      alert("NOME e CAPA são obrigatórios para publicar o Drop.");
      return;
    }
    setLoading(true);
    try {
      const productData = {
        ...form,
        updatedAt: serverTimestamp(),
        createdAt: product?.createdAt || serverTimestamp()
      };

      if (product?.id) {
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      onClose();
    } catch (e) {
      console.error("Save error:", e);
      alert("Erro ao sincronizar com o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  const addColor = () => {
    if (colorInput.trim() && !form.colors.includes(colorInput.trim().toUpperCase())) {
      setForm({ ...form, colors: [...form.colors, colorInput.trim().toUpperCase()] });
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setForm({ ...form, colors: form.colors.filter(c => c !== color) });
  };

  const addCustomSize = () => {
    if (customSizeInput.trim() && !form.sizes.includes(customSizeInput.trim().toUpperCase())) {
      setForm({ ...form, sizes: [...form.sizes, customSizeInput.trim().toUpperCase()], isUniqueSize: false });
      setCustomSizeInput('');
    }
  };

  const toggleSize = (size: string) => {
    const newSizes = form.sizes.includes(size)
      ? form.sizes.filter(s => s !== size)
      : [...form.sizes, size];
    setForm({ ...form, sizes: newSizes, isUniqueSize: newSizes.length === 1 && newSizes[0] === 'ÚNICO' });
  };

  const addMediaByUrl = () => {
    if (mediaInput.trim()) {
      setForm({ ...form, images: [...form.images, mediaInput.trim()] });
      setMediaInput('');
      setShowMediaInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-stretch justify-center bg-black overflow-hidden">
      <div className="relative w-full h-full flex flex-col bg-[#050505]">
        
        {/* HEADER BAR */}
        <div className="h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-black/80 backdrop-blur-2xl z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#CCFF00] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.2)]">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#CCFF00]">Performance Editor 4.0</h1>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{product ? 'Editando Drop Ativo' : 'Novo Drop Inteligente'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all group">
            <svg className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* WORKSPACE */}
        <div className="flex-grow overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 p-6 lg:p-16">
            
            {/* COLUNA 1: VISUALS */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Capa do Produto</span>
                  <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">HQ 1080x1350</span>
                </div>
                
                <div 
                  className="relative aspect-[4/5] rounded-[3rem] bg-white/5 border border-white/10 overflow-hidden cursor-pointer group shadow-2xl transition-all hover:border-[#CCFF00]/30"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {form.image ? (
                    <img src={form.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Preview" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/20">
                      <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center bg-white/5 group-hover:bg-[#CCFF00]/10 transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-[#CCFF00] transition-colors">Upload Capa</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" />
                <input 
                  placeholder="URL Manual da Imagem..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs focus:border-[#CCFF00] outline-none font-mono tracking-tighter" 
                  value={form.image} 
                  onChange={e => setForm({...form, image: e.target.value})} 
                />
              </div>

              <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Galeria de Mídia</span>
                <div className="grid grid-cols-4 gap-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group/item bg-black">
                      <img src={url} className="w-full h-full object-cover" />
                      <button onClick={() => setForm({...form, images: form.images.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  
                  {showMediaInput ? (
                    <div className="col-span-2 aspect-[2/1] bg-white/5 border border-[#CCFF00]/30 rounded-2xl p-3 flex flex-col gap-2 animate-fade-in">
                      <input 
                        autoFocus
                        placeholder="Cole o link aqui..." 
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] outline-none focus:border-[#CCFF00]" 
                        value={mediaInput}
                        onChange={e => setMediaInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addMediaByUrl()}
                      />
                      <div className="flex gap-2">
                        <button onClick={addMediaByUrl} className="flex-1 bg-[#CCFF00] text-black text-[8px] font-black uppercase py-1.5 rounded-md">Adicionar</button>
                        <button onClick={() => {setShowMediaInput(false); setMediaInput('');}} className="flex-1 bg-white/10 text-white text-[8px] font-black uppercase py-1.5 rounded-md">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowMediaInput(true)} 
                      className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* COLUNA 2: DADOS E VARIANTES */}
            <div className="lg:col-span-7 space-y-12 pb-32">
              
              {/* Identidade */}
              <div className="space-y-6">
                <div className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#CCFF00]"></span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Identidade do Produto</span></div>
                <input 
                  placeholder="NOME DO PRODUTO (EX: CONJUNTO IMPACTO)" 
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-lg font-bold focus:border-[#CCFF00] outline-none" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} 
                />
                <textarea 
                  placeholder="DESCRIÇÃO TÉCNICA E COPY DE VENDAS..." 
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm h-32 resize-none focus:border-[#CCFF00] outline-none leading-relaxed" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

              {/* Mercado e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">Categoria Inteligente</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm appearance-none cursor-pointer focus:border-[#CCFF00] font-black uppercase outline-none" 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                      <option key={cat} value={cat} className="bg-black text-white">{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">Preço Base (R$)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-xl font-sora font-black focus:border-[#CCFF00] outline-none" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: Number(e.target.value)})} 
                  />
                </div>
              </div>

              {/* CORES E VARIANTES */}
              <div className="space-y-8">
                <div className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#CCFF00]"></span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Cores Disponíveis</span></div>
                
                <div className="flex gap-2">
                  <input 
                    placeholder="DIGITE UMA COR (EX: AZUL ROYAL)" 
                    className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:border-[#CCFF00] outline-none font-bold uppercase" 
                    value={colorInput} 
                    onChange={e => setColorInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addColor()}
                  />
                  <button onClick={addColor} className="bg-[#CCFF00] text-black px-8 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-[#CCFF00]/10">ADICIONAR</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.colors.map(color => (
                    <div key={color} className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 group animate-fade-in">
                      <span className="text-[10px] font-black uppercase tracking-widest">{color}</span>
                      <button onClick={() => removeColor(color)} className="text-white/20 hover:text-red-500 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                  {form.colors.length === 0 && <p className="text-[9px] text-white/20 uppercase font-bold ml-2">Nenhuma cor específica definida (Padrão: Todas)</p>}
                </div>
              </div>

              {/* GRADE DE TAMANHOS DINÂMICA */}
              <div className="space-y-8">
                <div className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#CCFF00]"></span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Grade de Tamanhos</span></div>
                
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sugestão p/ {form.category}</span>
                    <button onClick={() => setForm({...form, isUniqueSize: !form.isUniqueSize, sizes: !form.isUniqueSize ? ['ÚNICO'] : []})} className={`px-4 py-2 rounded-full text-[8px] font-black uppercase transition-all ${form.isUniqueSize ? 'bg-[#CCFF00] text-black' : 'bg-white/10 text-white/40'}`}>Tamanho Único</button>
                  </div>

                  {!form.isUniqueSize && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {(form.category === Category.CALCADOS ? ['34', '35', '36', '37', '38', '39', '40', '41', '42'] : ['PP', 'P', 'M', 'G', 'GG', 'XG']).map(size => (
                          <button 
                            key={size} 
                            onClick={() => toggleSize(size)} 
                            className={`min-w-[50px] py-4 rounded-xl font-black text-[10px] border transition-all ${form.sizes.includes(size) ? 'bg-white text-black border-white' : 'bg-black/40 border-white/5 text-white/20 hover:border-white/20'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                        <input 
                          placeholder="TAMANHO CUSTOM (EX: 2L, 42MM...)" 
                          className="flex-grow bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] focus:border-[#CCFF00] outline-none font-bold uppercase" 
                          value={customSizeInput} 
                          onChange={e => setCustomSizeInput(e.target.value)}
                        />
                        <button onClick={addCustomSize} className="bg-white/10 text-white px-4 rounded-xl font-black text-[9px] uppercase hover:bg-[#CCFF00] hover:text-black transition-all">Add Custom</button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {form.sizes.map(s => (
                          <span key={s} className="bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 px-3 py-1 rounded text-[9px] font-black">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {form.isUniqueSize && <div className="py-10 text-center text-[#CCFF00] font-black uppercase text-[10px] tracking-widest border border-[#CCFF00]/10 rounded-3xl bg-[#CCFF00]/5">Grade Única Ativada</div>}
                </div>
              </div>

              {/* Estoque e Visibilidade */}
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-white/40">Logística de Estoque</span></div>
                <div className="flex items-center gap-6">
                  <input 
                    type="number" 
                    className="w-32 bg-black/60 border border-white/10 rounded-2xl p-6 text-3xl font-black text-center focus:border-[#CCFF00] outline-none" 
                    value={form.stockQuantity} 
                    onChange={e => setForm({...form, stockQuantity: Number(e.target.value)})} 
                  />
                  <button 
                    onClick={() => setForm({...form, isAvailable: !form.isAvailable})} 
                    className={`flex-grow py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all border ${form.isAvailable ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                  >
                    {form.isAvailable ? '✔ Produto Visível' : '✖ Oculto na Loja'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* BOTÃO SALVAR PERSISTENTE */}
        <div className="h-28 shrink-0 bg-black border-t border-white/5 flex items-center justify-center px-6 z-30">
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full max-w-2xl bg-[#CCFF00] text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-[#CCFF00]/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30"
          >
            {loading ? 'SINCRONIZANDO...' : 'SALVAR ALTERAÇÕES AGORA'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminProductModal;
