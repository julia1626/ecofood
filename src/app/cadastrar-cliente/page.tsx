'use client';

import Image from 'next/image';
import { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function CadastrarCliente(): JSX.Element {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!email || !password || !confirmPassword) {
      setStatus('Preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setStatus('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setStatus('Cadastrando...');

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('Cliente cadastrado com sucesso!');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/cliente'), 900);
      } else {
        setStatus(json?.error || 'Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      setStatus('Erro de conexão. Tente novamente.');
    }

    setLoading(false);
    setTimeout(() => setStatus(null), 4000);
  };

  return (
    <main className="min-h-screen bg-[#FFF8F3] text-gray-800 flex items-start">
      <div className="w-full max-w-5xl mx-auto px-6 py-14">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-xl overflow-hidden shadow-md bg-white flex items-center justify-center">
              <Image src="/ecofood.png" alt="EcoFood" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="text-lg font-bold">EcoFood &co.</div>
              <div className="text-xs text-gray-500">Cadastre-se para começar</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="/" className="hover:underline">Página inicial</a>
            <a href="/cadastrar-empresa" className="hover:underline">Cadastrar empresa</a>
          </nav>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Illustration / Brand area */}
          <motion.aside initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal} className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-extrabold mb-3">Junte-se à comunidade EcoFood</h1>
                <p className="text-gray-700 mb-6 leading-relaxed">Receba ofertas, participe de ações sustentáveis e faça parte de um movimento que une sabor e responsabilidade ambiental.</p>

                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-md bg-[#fff4f3] text-[#b94b4b] font-semibold shadow-sm">1</div>
                    <div>
                      <div className="font-medium">Produtos Selecionados</div>
                      <div className="text-xs text-gray-500">Selecionados com carinho de produtores locais</div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-md bg-[#fff4f3] text-[#b94b4b] font-semibold shadow-sm">2</div>
                    <div>
                      <div className="font-medium">Práticas sustentáveis</div>
                      <div className="text-xs text-gray-500">Produtos dentro do prazo e logística otimizada</div>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-md bg-[#fff4f3] text-[#b94b4b] font-semibold shadow-sm">3</div>
                    <div>
                      <div className="font-medium">Suporte local</div>
                      <div className="text-xs text-gray-500">Equipe pronta para ajudar sempre que precisar</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-sm text-gray-500">Já tem conta? <a href="/login" className="text-[#b94b4b] hover:underline">Entrar</a></div>
            </div>
          </motion.aside>

          {/* Form area */}
          <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={cardReveal} className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#f3d9d9]">
              <h2 className="text-xl font-semibold mb-4">Cadastrar Cliente</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-200 p-3 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                      required
                    />
                    <span className="absolute right-3 top-3 text-xs text-gray-400">@</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                    required
                  />
                  <div className="text-xs text-gray-400 mt-2">Mínimo 6 caracteres.</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                    required
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
                      'Cadastrar'
                    )}
                  </button>
                </div>

                {status && <div className="text-center text-sm text-gray-700 mt-1">{status}</div>}

                <div className="mt-2 text-xs text-gray-500 text-center">Ao se cadastrar você concorda com nossos <a className="text-[#b94b4b] hover:underline" href="#">Termos</a> e <a className="text-[#b94b4b] hover:underline" href="#">Política de Privacidade</a>.</div>
              </form>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">Voltar para a <a href="/" className="text-[#b94b4b] hover:underline">página inicial</a></div>
          </motion.section>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">© {new Date().getFullYear()} EcoFood &co. • Limeira</footer>
      </div>
    </main>
  );
}
