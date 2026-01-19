
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: 'Olá! Sou a Li, sua assistente virtual. Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "Você é a Li, assistente virtual da 'Li Moda Fitness'. Seja prestativa, use termos de moda fitness (performance, premium, high dopamine) e ajude com dúvidas sobre leggings, tops e conjuntos. Localização: Casa 1724, Parque Ideal, Teresina - PI.",
          temperature: 0.7,
        },
      });

      const aiText = response.text || "Desculpe, tive um problema ao processar sua resposta.";
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: aiText 
      }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Estou com um pouco de instabilidade agora. Pode me chamar no WhatsApp se preferir!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[88px] right-6 z-[80] md:bottom-28">
      {isOpen ? (
        <div className="glass w-[280px] h-[380px] rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-[#CCFF00]/20 scale-100 origin-bottom-right transition-transform md:w-80 md:h-96">
          <div className="bg-[#CCFF00] p-3 flex justify-between items-center md:p-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center font-bold text-[10px] text-[#CCFF00] md:w-8 md:h-8 md:text-xs">Li</div>
              <span className="text-black font-bold text-xs uppercase md:text-sm">Assistente Li</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black p-1">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-black/40">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed md:text-xs ${
                  m.role === 'user' ? 'bg-[#CCFF00] text-black font-medium' : 'bg-white/10 text-white'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white p-3 rounded-2xl text-[9px] animate-pulse">
                  Digitando...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-surface border-t border-white/5 flex gap-2">
            <input 
              type="text" 
              placeholder="Dúvida..." 
              value={input}
              disabled={isLoading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-white/5 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-[#CCFF00] border border-transparent md:text-xs"
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading}
              className="bg-[#CCFF00] text-black p-2 rounded-xl disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white/5 backdrop-blur-md p-3 rounded-full border border-white/10 hover:border-[#CCFF00]/50 transition-all shadow-xl md:p-4"
        >
          <svg className="w-5 h-5 text-[#CCFF00] md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
