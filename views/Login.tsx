
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigate: (view: 'home' | 'shop' | 'login' | 'privacy') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigate }) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [userIp, setUserIp] = useState('');

  // Fetch IP for security validation
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unavailable'));
  }, []);

  const validateEmailOrUser = (input: string) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    return isEmail || input.length >= 3;
  };
  
  const validatePhoneStrict = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits[0] !== '0' && digits[2] === '9';
  };

  const handlePhoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '').substring(0, 11);
    let formatted = digits;
    if (digits.length > 0) {
      formatted = `(${digits.substring(0, 2)}`;
      if (digits.length > 2) {
        formatted += `) ${digits.substring(2, 7)}`;
        if (digits.length > 7) {
          formatted += `-${digits.substring(7, 11)}`;
        }
      }
    }
    setPhone(formatted);
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Normalize user identifier
    const userId = email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
    const customerRef = doc(db, 'customers', userId);

    try {
      const snap = await getDoc(customerRef);
      if (!snap.exists()) {
        alert("ERRO: Este usuário não consta em nossa base de dados. Verifique o e-mail/usuário digitado.");
        setLoading(false);
        return;
      }

      const data = snap.data();
      const cleanInputPhone = phone.replace(/\D/g, '');
      const dbPhone = data.whatsapp || '';
      
      // Case-insensitive name matching (normalized)
      const inputNameNormalized = name.trim().toUpperCase();
      const dbNameNormalized = (data.name || '').trim().toUpperCase();
      
      const nameMatch = dbNameNormalized.includes(inputNameNormalized) || inputNameNormalized.includes(dbNameNormalized);
      const phoneMatch = dbPhone === cleanInputPhone;
      const ipMatch = data.registrationIp === userIp;

      // Logic: At least 2 factors must align for security
      if ((nameMatch && phoneMatch) || (phoneMatch && ipMatch)) {
        const recoveryCode = Math.floor(100000 + Math.random() * 900000);
        await updateDoc(customerRef, {
          recoveryCode,
          recoveryRequestedAt: serverTimestamp()
        });

        const msg = window.encodeURIComponent(`Olá suporte LiModa! Esqueci minha senha. \n\nCódigo de validação: ${recoveryCode}\nIdentificação: ${email}\nNome: ${name}`);
        window.open(`https://wa.me/5586998091058?text=${msg}`, '_blank');
        
        alert("Solicitação validada com sucesso! Você será redirecionado para o WhatsApp da LiModa para receber sua nova senha.");
        setRecoveryMode(false);
      } else {
        alert("Os dados informados não conferem com os registros de segurança (Nome ou Telefone incorretos). Por favor, tente novamente ou fale com o suporte.");
      }
    } catch (err) {
      console.error(err);
      alert("Houve um erro técnico ao processar sua recuperação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmailOrUser(email)) {
      alert("Identificação inválida! Use um e-mail correto ou um nome de usuário (mín. 3 caracteres)");
      setLoading(false);
      return;
    }

    try {
      if (email.toLowerCase() === 'admin' && password === 'adminsuporte') {
        onLogin({ id: 'admin', name: 'Administrador', email: 'admin@limoda.com', isAdmin: true });
        onNavigate('shop');
        return;
      }

      const userId = email.toLowerCase().trim().replace(/[^a-zA-Z0-9]/g, '_');
      const customerRef = doc(db, 'customers', userId);

      if (isLoginTab) {
        const snap = await getDoc(customerRef);
        if (!snap.exists()) {
          alert("Usuário não cadastrado! Por favor, crie uma conta na aba 'CADASTRO'.");
          setIsLoginTab(false);
          setLoading(false);
          return;
        }

        if (snap.data().password === password) {
          const data = snap.data();
          await setDoc(customerRef, { 
            lastLogin: serverTimestamp(), 
            lastActivity: serverTimestamp(),
            lastLoginIp: userIp,
            accessCount: increment(1),
            status: 'active' 
          }, { merge: true });
          
          onLogin({ id: userId, name: data.name, email: data.email, isAdmin: false });
          onNavigate('shop');
        } else {
          alert("Senha incorreta. Tente novamente.");
        }
      } else {
        if (!acceptPrivacy) {
          alert("Você deve aceitar a Política de Privacidade para se cadastrar.");
          setLoading(false);
          return;
        }

        if (!validatePhoneStrict(phone)) {
          alert("Telefone inválido! Use o formato: (DDD) 9XXXX-XXXX (exatamente 11 dígitos).");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          alert("As senhas não coincidem!");
          setLoading(false);
          return;
        }

        const checkSnap = await getDoc(customerRef);
        if (checkSnap.exists()) {
          alert("Este e-mail/usuário já possui cadastro. Faça login.");
          setIsLoginTab(true);
          setLoading(false);
          return;
        }

        const newCustomerData = {
          id: userId,
          name: name.toUpperCase(),
          email: email.toLowerCase(),
          whatsapp: phone.replace(/\D/g, ''),
          password: password,
          privacyAccepted: true,
          privacyAcceptedAt: serverTimestamp(),
          registrationIp: userIp,
          status: 'lead',
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp(),
          accessCount: 1,
          orders: [],
          purchaseFrequency: 0,
          addresses: []
        };

        await setDoc(customerRef, newCustomerData);
        onLogin({ id: userId, name: name.toUpperCase(), email: email.toLowerCase(), isAdmin: false });
        onNavigate('shop');
      }
    } catch (error) {
      console.error("Erro Auth:", error);
      alert("Erro na autenticação. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (recoveryMode) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 fade-in">
        <div className="glass p-8 rounded-3xl border border-[#CCFF00]/20 shadow-2xl">
          <h2 className="text-xl font-sora font-black text-[#CCFF00] uppercase mb-2 tracking-tighter">Recuperar Acesso</h2>
          <p className="text-[10px] text-white/40 uppercase mb-8 font-bold tracking-widest leading-relaxed">Verificação via WhatsApp e Fingerprint de IP</p>
          
          <form onSubmit={handleRecovery} className="space-y-4">
            <input type="text" placeholder="SEU NOME NO CADASTRO" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" />
            <input type="text" placeholder="E-MAIL OU USUÁRIO" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" />
            <input type="tel" placeholder="WHATSAPP CADASTRADO" required value={phone} onChange={e => handlePhoneMask(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" />
            
            <div className="pt-4 flex flex-col gap-3">
              <button type="submit" disabled={loading} className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#CCFF00]/20 hover:scale-[1.02] transition-all">
                {loading ? 'VALIDANDO...' : 'SOLICITAR NO WHATSAPP'}
              </button>
              <button type="button" onClick={() => setRecoveryMode(false)} className="text-[10px] text-white/40 font-black uppercase hover:text-white transition-colors">Voltar ao Login</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12 fade-in">
      <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex gap-4 mb-8">
          <button onClick={() => setIsLoginTab(true)} className={`flex-1 pb-4 border-b-2 transition-all font-sora font-bold text-xs ${isLoginTab ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-white/40'}`}>LOGIN</button>
          <button onClick={() => setIsLoginTab(false)} className={`flex-1 pb-4 border-b-2 transition-all font-sora font-bold text-xs ${!isLoginTab ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-white/40'}`}>CADASTRO</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginTab && (
            <>
              <input type="text" placeholder="NOME COMPLETO" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" />
              <input type="tel" placeholder="(86) 99888-7766" required value={phone} onChange={e => handlePhoneMask(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" />
            </>
          )}
          <input type="text" placeholder="E-MAIL OU USUÁRIO" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-[#CCFF00] outline-none" />
          
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="SENHA" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm pr-12 focus:border-[#CCFF00] outline-none" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-white/40 hover:text-[#CCFF00] transition-colors">
              {showPass ? 'OCULTAR' : 'VER'}
            </button>
          </div>

          {!isLoginTab && (
            <>
              <div className="relative">
                <input type={showConfirmPass ? 'text' : 'password'} placeholder="CONFIRME A SENHA" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm pr-12 focus:border-[#CCFF00] outline-none" />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-white/40 hover:text-[#CCFF00] transition-colors">
                  {showConfirmPass ? 'OCULTAR' : 'VER'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={acceptPrivacy} 
                      onChange={() => setAcceptPrivacy(!acceptPrivacy)}
                    />
                    <div className="w-4 h-4 border-2 border-white/20 rounded peer-checked:bg-[#CCFF00] peer-checked:border-[#CCFF00] transition-all" />
                    <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 left-0.5 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-[10px] text-white/50 leading-relaxed font-bold uppercase tracking-wider group-hover:text-white transition-colors">
                    Li e aceito a <button type="button" onClick={() => onNavigate('privacy')} className="text-[#CCFF00] underline">Política de Privacidade</button>.
                  </span>
                </label>
              </div>
            </>
          )}

          {isLoginTab && (
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setRecoveryMode(true)}
                className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest hover:text-white transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full bg-[#CCFF00] text-black py-5 rounded-xl font-black font-sora uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#CCFF00]/10">
            {loading ? 'SINCRONIZANDO...' : (isLoginTab ? 'ACESSAR CONTA' : 'CRIAR MEU CADASTRO')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
