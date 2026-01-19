
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
  const [colorQtyInput, setColorQtyInput] = useState<number>(0);
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

  // Efeito para sincronizar o stockQuantity com a soma das cores sempre que a lista de cores mudar
  useEffect(() => {
    const total = form.colors.reduce((acc: number, colorEntry: string) => {
      const match = colorEntry.match(/\((\d+)\)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }, 0);
    setForm(prev => ({ ...prev, stockQuantity: total }));
  }, [form.colors]);

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
    if (colorInput.trim()) {
      const colorName = colorInput.trim().toUpperCase();
      const qty = colorQtyInput || 0;
      const newColorEntry = `${colorName} (${qty})`;
      
      if (!form.colors.includes(newColorEntry)) {
        setForm({ 
          ...form, 
          colors: [...form.colors, newColorEntry]
        });
        setColorInput('');
        setColorQtyInput(0);
      }
    }
  };

  const removeColor = (colorEntry: string) => {
    setForm({ 
      ...form, 
      colors: form.colors.filter(c => c !== colorEntry)
    });
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

        <div className="flex-grow overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 p-6 lg:p-16">
            
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

            <div className="lg:col-span-7 space-y-12 pb-32">
              
              <div className="space-y-6">
                <div className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#CCFF00]"></span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Identidade do Produto</span></div>
                <input 
                  placeholder="NOME DO PRODUTO" 
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-lg font-bold focus:border-[#CCFF00] outline-none" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} 
                />
                <textarea 
                  placeholder="DESCRIÇÃO TÉCNICA..." 
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm h-32 resize-none focus:border-[#CCFF00] outline-none leading-relaxed" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                />
              </div>

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

              <div className="space-y-8">
                <div className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#CCFF00]"></span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Cores e Quantidades</span></div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-8">
                    <input 
                      placeholder="COR (EX: PRETO)" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs focus:border-[#CCFF00] outline-none font-bold uppercase" 
                      value={colorInput} 
                      onChange={e => setColorInput(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input 
                      type="number"
                      placeholder="QTY" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs focus:border-[#CCFF00] outline-none font-bold text-center" 
                      value={colorQtyInput} 
                      onChange={e => setColorQtyInput(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button onClick={addColor} className="w-full h-full bg-[#CCFF00] text-black rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-[#CCFF00]/10 py-4">ADD</button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.colors.map(colorEntry => (
                    <div key={colorEntry} className="bg-white/10 border border-[#CCFF00]/30 px-4 py-2 rounded-xl flex items-center gap-3 group animate-fade-in">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">{colorEntry.split(' (')[0]}</span>
                        <span className="text-[8px] text-[#CCFF00] font-bold uppercase">Unidades: {colorEntry.match(/\((\d+)\)/)?.[1] || 0}</span>
                      </div>
                      <button onClick={() => removeColor(colorEntry)} className="text-white/20 hover:text-red-500 transition-colors ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-4"><span className="w-8 h-[1px] bg-[#CCFF00]"></span><span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Grade de Tamanhos</span></div>
                
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Configurar Grade</span>
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
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-white/40">Logística de Estoque</span></div>
                <div className="flex items-center gap-6">
                  {/* Campo desabilitado para edição direta, agora é apenas leitura (soma automática) */}
                  <div className="relative">
                    <input 
                      type="number" 
                      readOnly
                      className="w-32 bg-black/60 border border-white/10 rounded-2xl p-6 text-3xl font-black text-center outline-none cursor-default text-[#CCFF00]" 
                      value={form.stockQuantity} 
                    />
                    <span className="absolute -bottom-5 left-0 w-full text-center text-[7px] text-white/20 font-black uppercase">Soma Total</span>
                  </div>
                  <button 
                    onClick={() => setForm({...form, isAvailable: !form.isAvailable})} 
                    className={`flex-grow py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all border ${form.isAvailable ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                  >
                    {form.isAvailable ? '✔ Visível' : '✖ Oculto'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="h-28 shrink-0 bg-black border-t border-white/5 flex items-center justify-center px-6 z-30">
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full max-2xl bg-[#CCFF00] text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-[#CCFF00]/30 transition-all disabled:opacity-30"
          >
            {loading ? 'SINCRONIZANDO...' : 'SALVAR DROP & ESTOQUE'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminProductModal;
