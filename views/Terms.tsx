
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="fade-in bg-[#050505] text-white min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-[#CCFF00] font-black tracking-[0.4em] text-[10px] uppercase">Compliance & Qualidade</h2>
          <h1 className="text-3xl md:text-5xl font-sora font-black uppercase tracking-tighter leading-tight">
            TERMOS DE GARANTIA E POLÍTICA DE <span className="text-[#CCFF00]">TROCA EXCLUSIVA</span>
          </h1>
        </div>

        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 space-y-8 text-white/70 text-sm md:text-base leading-relaxed">
          <p className="text-[#CCFF00] font-bold italic">Ao finalizar sua compra, você concorda integralmente com as diretrizes de qualidade e as normas de trocas estabelecidas pela LiModa Fitness, conforme detalhado abaixo:</p>
          
          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">1. Padrão de Excelência e Controle de Qualidade</h3>
            <p>A LiModa Fitness orgulha-se de manter um processo de inspeção rigoroso. Cada peça é auditada individualmente desde a fabricação até o momento da expedição e entrega. Esse protocolo garante que o produto saia de nosso centro de distribuição em condições impecáveis de costura, elasticidade e acabamento.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">2. Prazo Improrrogável para Trocas</h3>
            <p>Visando a agilidade e a renovação constante de nossas coleções exclusivas, a solicitação de troca deve ser realizada em até 2 (dois) dias úteis após o recebimento comprovado da mercadoria. Após este período, a transação é considerada finalizada e aceita de forma definitiva pelo cliente.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">3. Restrição Absoluta: Peças Íntimas</h3>
            <p>Por questões de segurança sanitária e higiene, a LiModa Fitness não realiza, sob hipótese alguma, a troca de peças íntimas (incluindo, mas não se limitando a, calcinhas, cuecas e itens de moda praia). Esta medida visa proteger a saúde de todos os nossos clientes e garantir a integridade biológica dos produtos.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">4. Condições do Produto para Troca</h3>
            <p>Não serão aceitas devoluções ou trocas de produtos que apresentem:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sinais de mau uso, lavagem inadequada ou danos causados por manuseio incorreto.</li>
              <li>Rasgos, furos ou danos estruturais após a entrega, uma vez que todas as peças passam por vistoria de resistência antes do envio.</li>
              <li>Ausência de etiquetas e lacres originais da marca.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">5. Procedimento de Troca Presencial</h3>
            <p>Para garantir a transparência e a correta avaliação técnica da peça, a troca deverá ser efetuada exclusivamente de forma presencial em nossa loja física. Obrigatório: Apresentação do comprovante de compra (físico ou digital) e documento de identificação.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">6. Aceite Jurídico</h3>
            <p>Ao finalizar a compra, o cliente declara estar ciente e de acordo com todas as normas aqui descritas, reconhecendo a soberania do controle de qualidade da LiModa Fitness sobre alegações de vícios que não condizem com o estado original de envio do produto.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
