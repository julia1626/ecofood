'use client';

import Image from 'next/image';
import { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: 'easeOut' } },
};

export default function CadastrarEmpresa(): JSX.Element {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [respName, setRespName] = useState('');
  const [respPhone, setRespPhone] = useState('');
  const [location, setLocation] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!companyName.trim() || !respName.trim()) {
      setStatusMsg('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setStatusMsg('Enviando cadastro...');

    try {
      const res = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, cnpj, respName, respPhone, location }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatusMsg('Pedido enviado! Aguarde aprovação do admin.');
        setCompanyName('');
        setCnpj('');
        setRespName('');
        setRespPhone('');
        setLocation('');
        setTimeout(() => router.push('/'), 1000);
      } else {
        setStatusMsg(json?.error || 'Erro ao enviar pedido.');
      }
    } catch (err) {
      setStatusMsg('Erro de conexão.');
    }

    setLoading(false);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <main className="min-h-screen bg-[#FFF8F3] text-gray-800 flex items-start">
      <div className="w-full max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative rounded-xl overflow-hidden shadow-md bg-white flex items-center justify-center">
              <Image src="/ecofood.png" alt="EcoFood" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="text-lg font-bold">EcoFood &co.</div>
              <div className="text-xs text-gray-500">Cadastro de empresas</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/" className="hover:underline">Início</a>
            <a href="/cadastrar-cliente" className="hover:underline">Cadastrar cliente</a>
            <a href="/page" className="hover:underline">Login</a>
          </nav>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: Brand / Benefits */}
          <motion.aside
            className="order-2 lg:order-1"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col justify-between border border-[#f3d9d9]">
              <div>
                <h1 className="text-2xl font-extrabold mb-3">Seja nosso parceiro</h1>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Cadastre sua empresa e conecte-se com clientes que valorizam produtos locais e práticas sustentáveis.
                  Receba pedidos, participe de campanhas e tenha visibilidade em nossa plataforma.
                </p>

                <ul className="space-y-4 text-sm text-gray-700">
                  <li className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#fff4f3] text-[#b94b4b] font-semibold shadow-sm">✓</div>
                    <div>
                      <div className="font-medium">Visibilidade local</div>
                      <div className="text-xs text-gray-500">Seus produtos alcançando clientes próximos</div>
                    </div>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#fff4f3] text-[#b94b4b] font-semibold shadow-sm">⚙</div>
                    <div>
                      <div className="font-medium">Gestão simplificada</div>
                      <div className="text-xs text-gray-500">Painel simples para acompanhar solicitações</div>
                    </div>
                  </li>

                  <li className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#fff4f3] text-[#b94b4b] font-semibold shadow-sm">🤝</div>
                    <div>
                      <div className="font-medium">Parcerias reais</div>
                      <div className="text-xs text-gray-500">Trabalhamos com produtores e negócios locais</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                Já tem conta? <a href="/login" className="text-[#b94b4b] hover:underline">Entrar</a>
              </div>
            </div>
          </motion.aside>

          {/* Right: Form */}
          <motion.section
            className="order-1 lg:order-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#f3d9d9]">
              <h2 className="text-xl font-semibold mb-4">Cadastrar Empresa</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa <span className="text-[#b94b4b]">*</span></label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nome da empresa"
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                    <input
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone do responsável</label>
                    <input
                      value={respPhone}
                      onChange={(e) => setRespPhone(e.target.value)}
                      placeholder="(99) 9 9999-9999"
                      className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Responsável <span className="text-[#b94b4b]">*</span></label>
                  <input
                    value={respName}
                    onChange={(e) => setRespName(e.target.value)}
                    placeholder="Nome do responsável"
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Cidade / Bairro"
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center gap-3 justify-center w-full py-3 rounded-lg font-medium text-white bg-[#b94b4b] hover:brightness-95 shadow-md transition ${loading ? 'opacity-80' : ''}`}
                  >
                    {loading ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.25" strokeWidth="4" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      'Enviar Pedido'
                    )}
                  </button>
                </div>

                {statusMsg && <div className="text-center text-sm text-gray-700 mt-1">{statusMsg}</div>}

                <div className="mt-3 text-xs text-gray-500 text-center">
                  Ao enviar, sua empresa ficará pendente até aprovação administrativa.
                </div>
              </form>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <a href="/" className="text-[#b94b4b] hover:underline">Voltar à página inicial</a>
            </div>
          </motion.section>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">© {new Date().getFullYear()} EcoFood &co. • Limeira</footer>
      </div>
    </main>
  );
}
