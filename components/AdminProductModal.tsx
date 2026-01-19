
import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    sizes: product?.sizes || ['P', 'M', 'G'],
    isUniqueSize: product?.isUniqueSize || false,
    isAvailable: product?.isAvailable ?? true,
    stockQuantity: product?.stockQuantity || 0
  });

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

  const addMediaByUrl = () => {
    if (mediaInput && !form.images.includes(mediaInput)) {
      setForm({ ...form, images: [...form.images, mediaInput] });
      setMediaInput('');
    }
  };

  const removeMediaFromGallery = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
  };

  const toggleSize = (size: string) => {
    const newSizes = form.sizes.includes(size)
      ? form.sizes.filter(s => s !== size)
      : [...form.sizes, size];
    setForm({ ...form, sizes: newSizes });
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
              <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#CCFF00]">Performance Editor 3.0</h1>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{product ? 'Updating Active Drop' : 'Configuring New Drop'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all group">
            <svg className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* WORKSPACE */}
        <div className="flex-grow overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 p-6 lg:p-16">
            
            {/* COLUMN 1: VISUALS */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Product Hero (Cover)</span>
                  <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">1080x1350 High Res</span>
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
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-[#CCFF00] transition-colors">Upload Cover HQ</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                     <p className="text-[9px] text-white/60 text-center font-black uppercase tracking-widest">Clique para alterar imagem</p>
                  </div>
                </div>
                
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" />
                <div className="space-y-2">
                  <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">URL Manual da Capa</label>
                  <input 
                    placeholder="Cole a URL se não quiser fazer upload..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xs focus:border-[#CCFF00] outline-none font-mono tracking-tighter transition-all" 
                    value={form.image} 
                    onChange={e => setForm({...form, image: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Visual Gallery</span>
                  <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Mixed Media Allowed</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-white/10 text-white rounded-2xl p-5 flex items-center justify-center gap-3 hover:bg-[#CCFF00] hover:text-black active:scale-95 transition-all font-black uppercase text-[10px] tracking-widest"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    Direct Upload
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" multiple />
                  <div className="flex-[1.5] flex gap-2">
                    <input 
                      placeholder="ADD URL TO GALLERY..." 
                      className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-5 text-xs focus:border-[#CCFF00] outline-none" 
                      value={mediaInput} 
                      onChange={e => setMediaInput(e.target.value)} 
                    />
                    <button onClick={addMediaByUrl} className="bg-white/10 text-white px-6 rounded-2xl font-black text-[10px] uppercase hover:bg-white/20 transition-all">Add</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black group/item shadow-lg">
                      <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button onClick={() => removeMediaFromGallery(i)} className="bg-red-600 p-2.5 rounded-full shadow-xl hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: DATA */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* SECTION: IDENTITY */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-[#CCFF00]"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Identity & Storytelling</span>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">Product High-Performance Name</label>
                      <span className="text-[8px] text-white/20 font-bold">{form.name.length}/40</span>
                    </div>
                    <input 
                      placeholder="EX: LEGGING SUPREME OXY" 
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-lg font-bold focus:border-[#CCFF00] outline-none transition-all" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value.toUpperCase()})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">Premium Sales Copy</label>
                    <textarea 
                      placeholder="DESCRIÇÃO DE ALTO IMPACTO..." 
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm h-40 resize-none focus:border-[#CCFF00] outline-none transition-all leading-relaxed" 
                      value={form.description} 
                      onChange={e => setForm({...form, description: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: MARKET & PRICING */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-[#CCFF00]"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Market Placement & Pricing</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">Drop Category</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-sm appearance-none cursor-pointer focus:border-[#CCFF00] font-black uppercase outline-none" 
                        value={form.category} 
                        onChange={e => setForm({...form, category: e.target.value})}
                      >
                        {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                          <option key={cat} value={cat} className="bg-black text-white">{cat.toUpperCase()}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-white/30 uppercase font-black ml-4 tracking-widest">Base Value</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-sm">R$</span>
                      <input 
                        type="number" 
                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 pl-14 text-xl font-sora font-black focus:border-[#CCFF00] outline-none transition-all" 
                        value={form.price} 
                        onChange={e => setForm({...form, price: Number(e.target.value)})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-[#FFD700] uppercase font-black ml-4 tracking-widest">Dopamine Hit Price</label>
                    <div className="relative group/promo">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#FFD700]/30 font-black text-sm">R$</span>
                      <input 
                        type="number" 
                        className="w-full bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-[1.5rem] p-6 pl-14 text-xl font-sora font-black text-[#FFD700] focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 outline-none transition-all placeholder:text-[#FFD700]/20" 
                        placeholder="0,00"
                        value={form.promoPrice || ''} 
                        onChange={e => setForm({...form, promoPrice: Number(e.target.value)})} 
                      />
                      <div className="absolute -top-2 -right-2 bg-[#FFD700] text-black text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter opacity-0 group-focus-within/promo:opacity-100 transition-opacity">PROMO ATIVA</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: LOGISTICS */}
              <div className="space-y-6 pb-32">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-[#CCFF00]"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CCFF00]">Operational Logistics</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Inventory Core</span>
                      <span className="px-3 py-1 bg-[#CCFF00]/10 text-[#CCFF00] rounded-full text-[8px] font-black tracking-widest">LIVE DATA</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <input 
                        type="number" 
                        className="w-32 bg-black/60 border border-white/10 rounded-2xl p-6 text-3xl font-black text-center focus:border-[#CCFF00] outline-none shadow-inner" 
                        value={form.stockQuantity} 
                        onChange={e => setForm({...form, stockQuantity: Number(e.target.value)})} 
                      />
                      <div className="flex-grow">
                        <button 
                          onClick={() => setForm({...form, isAvailable: !form.isAvailable})} 
                          className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all border ${
                            form.isAvailable 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}
                        >
                          {form.isAvailable ? '✔ Visible Online' : '✖ Hidden From Shop'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
                     <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Sizing Grid</span>
                      <button 
                        onClick={() => setForm({...form, isUniqueSize: !form.isUniqueSize, sizes: !form.isUniqueSize ? ['ÚNICO'] : ['P', 'M', 'G']})}
                        className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${form.isUniqueSize ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20' : 'bg-white/10 text-white/40 hover:text-white'}`}
                      >
                        Tamanho Único
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!form.isUniqueSize ? (
                        ['PP', 'P', 'M', 'G', 'GG', 'XG'].map(size => (
                          <button 
                            key={size} 
                            onClick={() => toggleSize(size)} 
                            className={`flex-1 min-w-[55px] py-4 rounded-xl font-black text-[10px] transition-all border ${
                              form.sizes.includes(size) 
                              ? 'bg-white text-black border-white shadow-xl' 
                              : 'bg-black/40 border-white/5 text-white/20 hover:border-white/20'
                            }`}
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        <div className="w-full py-5 text-center text-[#CCFF00] font-black uppercase text-[10px] tracking-widest border border-[#CCFF00]/20 rounded-2xl bg-[#CCFF00]/5 animate-pulse">
                          Grade Única Ativada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PERSISTENT FOOTER */}
        <div className="h-32 shrink-0 bg-black border-t border-white/5 flex items-center justify-center px-6 z-30 shadow-[0_-30px_60px_rgba(0,0,0,0.8)]">
          <div className="w-full max-w-4xl flex gap-4 md:gap-6">
            <button 
              onClick={onClose} 
              className="hidden md:block flex-1 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest border border-white/10 text-white/40 hover:bg-white/5 hover:text-white transition-all"
            >
              Descartar Alterações
            </button>
            <button 
              onClick={handleSave} 
              disabled={loading} 
              className="flex-[2] bg-[#CCFF00] text-black py-5 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-[#CCFF00]/30 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30"
            >
              {loading ? 'SINCRONIZANDO DROP...' : 'PUBLISH / UPDATE NOW'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminProductModal;
