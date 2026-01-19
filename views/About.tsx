
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="fade-in bg-[#050505] text-white">
      {/* Hero Narrative */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#CCFF00]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-[#CCFF00] font-black tracking-[0.4em] text-[10px] uppercase">Nossa Jornada, Sua Transformação</h2>
          <h1 className="text-4xl md:text-7xl font-sora font-black uppercase tracking-tighter leading-[0.9]">
            SOBRE A <span className="text-[#CCFF00]">LIMODA FITNESS</span>
          </h1>
          <p className="text-white/40 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Há 8 anos, a LiModa Fitness nascia de um sonho simples, mas audacioso: provar que a moda poderia ser a maior aliada da saúde.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-t border-white/5">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-4xl font-sora font-black uppercase tracking-tight">Onde Tudo <span className="text-[#FFD700]">Começou</span></h3>
            <p className="text-white/60 leading-relaxed text-lg">
              Começamos pequenos, movidos pela paixão de ver mulheres e homens conquistando suas melhores versões. Durante anos, construímos mais do que uma marca; construímos uma comunidade de guerreiros diários.
            </p>
          </div>
          
          <div className="glass p-8 rounded-[2rem] border-l-4 border-[#CCFF00]">
            <h4 className="text-[#CCFF00] font-black text-xs uppercase mb-4 tracking-widest">O Ápice no Caos</h4>
            <p className="text-white/80 font-medium italic leading-relaxed">
              "Quando o mundo parou em 2020, nós aceleramos. Enquanto as academias fechavam as portas, a LiModa se tornou o suporte emocional de milhares de pessoas que buscavam manter a sanidade e a saúde dentro de casa."
            </p>
          </div>
        </div>
        <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10">
          <img 
            src="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000&auto=format&fit=crop" 
            alt="Foco e Resiliência" 
            className="w-full h-full object-cover opacity-70 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      </section>

      {/* Pandemic & Success */}
      <section className="bg-surface py-24 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-12">
          <div className="inline-block px-6 py-2 rounded-full border border-red-600/30 bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest">
            A Loja que Não Parou
          </div>
          <h3 className="text-3xl md:text-5xl font-sora font-black uppercase tracking-tighter">
            O RECONHECIMENTO DA <span className="text-white">RESILIÊNCIA</span>
          </h3>
          <p className="text-white/40 text-lg leading-relaxed max-w-3xl mx-auto">
            Nos tornamos a loja que mais vendeu durante a pandemia. Não foi sorte. Foi o reconhecimento de que nossas peças não eram apenas roupas, mas o <strong>"uniforme" da resiliência</strong>. Levamos motivação até a porta de cada cliente quando o mundo parecia desmoronar.
          </p>
        </div>
      </section>

      {/* Reinvention */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="order-2 lg:order-1 relative h-[500px] rounded-[3rem] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" 
            alt="Alta Performance" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[#CCFF00]/10 mix-blend-overlay" />
        </div>
        <div className="order-1 lg:order-2 space-y-8">
          <h3 className="text-2xl md:text-4xl font-sora font-black uppercase tracking-tight">A Coragem de <span className="text-[#CCFF00]">Recomeçar</span></h3>
          <p className="text-white/60 leading-relaxed">
            Após quase uma década de estrada, olhamos para o futuro e tomamos uma decisão que poucos teriam coragem: estamos começando tudo do zero.
          </p>
          <p className="text-white/60 leading-relaxed">
            Por que abandonar o conforto do que já funciona? Porque o mercado mudou, a tecnologia evoluiu e você merece mais do que o "bom o suficiente". Estamos nos reinventando para entregar uma experiência de alta performance nunca vista antes.
          </p>
          <div className="pt-8">
            <p className="text-2xl font-sora font-black text-white italic border-l-4 border-[#CCFF00] pl-6">
              "Não estamos apenas vendendo roupas de academia. Estamos lançando o seu novo ponto de partida."
            </p>
          </div>
        </div>
      </section>

      {/* New Mission */}
      <section className="bg-[#CCFF00] py-24 px-6 text-black">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h3 className="text-4xl md:text-6xl font-sora font-black uppercase tracking-tighter leading-none">NOSSA NOVA MISSÃO</h3>
          <p className="text-black/80 font-bold text-lg leading-relaxed">
            Hoje, a LiModa Fitness ressurge com o conhecimento de quem tem 8 anos de mercado, mas com a energia e a inovação de quem acaba de nascer. Unimos o que há de mais avançado em tecnologia têxtil, ciência da suplementação e estética de alta performance.
          </p>
          <div className="pt-10">
            <div className="h-[2px] w-20 bg-black mx-auto mb-8" />
            <p className="text-xl md:text-3xl font-sora font-black uppercase tracking-tighter">
              BEM-VINDO À NOVA LIMODA FITNESS.<br/>
              A nossa história está apenas começando.<br/>
              <span className="bg-black text-[#CCFF00] px-4 py-1 inline-block mt-4">E A SUA, COMEÇA QUANDO?</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
