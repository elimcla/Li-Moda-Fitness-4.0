
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="fade-in bg-[#050505] text-white min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-[#CCFF00] font-black tracking-[0.4em] text-[10px] uppercase">Segurança & LGPD</h2>
          <h1 className="text-3xl md:text-5xl font-sora font-black uppercase tracking-tighter leading-tight">
            POLÍTICA DE <span className="text-[#CCFF00]">PRIVACIDADE</span> E SEGURANÇA
          </h1>
        </div>

        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/10 space-y-8 text-white/70 text-sm md:text-base leading-relaxed">
          <p className="text-[#CCFF00] font-bold italic">
            A LiModa Fitness, em conformidade com a Lei Geral de Proteção de Dados (LGPD), assume o compromisso de transparência e proteção com todos os dados coletados em nossa plataforma.
          </p>
          
          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">1. Coleta de Dados e Finalidade</h3>
            <div className="space-y-4">
              <p>Coletamos apenas as informações essenciais para garantir que sua experiência seja impecável:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Dados Cadastrais:</strong> Nome, CPF, e-mail, telefone e endereço, coletados para emissão de Nota Fiscal, envio de mercadorias e comunicações sobre o pedido.</li>
                <li><strong>Dados de Pagamento:</strong> Informações de cartões de crédito são processadas de forma criptografada por gateways homologados. Não armazenamos o número completo ou CVV.</li>
                <li><strong>Dados de Navegação (Cookies):</strong> Utilizamos cookies para otimizar sua navegação e oferecer looks que combinam com seu estilo.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">2. Compartilhamento de Informações</h3>
            <p>A LiModa Fitness não comercializa dados de clientes. O compartilhamento ocorre estritamente com parceiros necessários para a operação: Empresas de logística (entregas), Instituições financeiras (pagamentos) e Órgãos governamentais (obrigações fiscais).</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">3. Segurança da Informação</h3>
            <p>Implementamos medidas técnicas para proteger seus dados contra acessos não autorizados. Nosso site possui Certificado SSL (Secure Socket Layer), garantindo criptografia inviolável em todas as trocas de informações.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">4. Direitos do Titular (Você)</h3>
            <p>De acordo com a LGPD, você possui total controle sobre seus dados, podendo confirmar a existência do tratamento, acessar, corrigir ou solicitar a exclusão definitiva de seus dados da nossa base.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">5. Retenção de Dados</h3>
            <p>Os dados permanecerão em nossa base enquanto forem necessários para a prestação dos serviços ou para o cumprimento de obrigações legais (como guarda de documentos fiscais).</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">6. Alterações na Política</h3>
            <p>A LiModa Fitness reserva-se o direito de atualizar esta política visando sempre aumentar a sua segurança e adequação à legislação vigente.</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-white font-black uppercase text-sm tracking-widest border-l-2 border-[#CCFF00] pl-4">7. Contato e Encarregado de Dados</h3>
            <p>Para qualquer dúvida ou solicitação de exclusão, entre em contato com nosso Canal de Atendimento através do suporte via WhatsApp ou e-mail oficial da marca.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
