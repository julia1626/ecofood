'use client';
import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';

type Message = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Home(): JSX.Element {
  const [role, setRole] = useState<'cliente' | 'empresa'>('cliente');
  const [emailLogin, setEmailLogin] = useState('');
  const [password, setPassword] = useState('');

  const [contatoNome, setContatoNome] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [contatoMensagem, setContatoMensagem] = useState('');
  const [contatoStatus, setContatoStatus] = useState<string | null>(null);

  const [msgNome, setMsgNome] = useState('');
  const [msgTexto, setMsgTexto] = useState('');
  const [msgStatus, setMsgStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // fallback users
  const fallbackUsers = [
    { email: 'cliente@gmail.com', password: 'cliente123', role: 'cliente' },
    { email: 'empresa@empresa.com', password: 'empresa123', role: 'empresa' },
  ];

  const tryFallbackLogin = (normalizedEmail: string, passwordValue: string) => {
    const user = fallbackUsers.find(
      (u) => u.email === normalizedEmail && u.password === passwordValue
    );
    if (user) {
      localStorage.setItem('userRole', user.role);
      if (user.role === 'cliente') window.location.href = '/cliente';
      else window.location.href = '/empresa';
      return true;
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = emailLogin.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      alert('Preencha email e senha.');
      return;
    }

    const endpoint = role === 'empresa' ? '/api/empresas/login' : '/api/clients/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: trimmedPassword }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok !== false) {
        const userRole = json.role || role || 'cliente';
        localStorage.setItem('userRole', userRole);
        if (userRole === 'cliente') window.location.href = '/cliente';
        else window.location.href = '/empresa';
        return;
      }

      const usedFallback = tryFallbackLogin(normalizedEmail, trimmedPassword);
      if (!usedFallback) {
        alert(json?.error || 'Email ou senha incorretos!');
      }
    } catch (err) {
      const usedFallback = tryFallbackLogin(normalizedEmail, trimmedPassword);
      if (!usedFallback) {
        alert('Erro de conexão ao autenticar. Tente novamente mais tarde.');
      }
    }
  };

  useEffect(() => {
    fetch('/api/messages')
      .then((res) => res.json())
      .then((data) => setMessages(data || []))
      .catch(() => setMessages([]));
  }, []);

  const enviarContato = async (e: React.FormEvent) => {
    e.preventDefault();
    setContatoStatus('enviando...');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contatoNome, email: contatoEmail, message: contatoMensagem }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setContatoStatus('Enviado com sucesso!');
        setContatoNome('');
        setContatoEmail('');
        setContatoMensagem('');
      } else {
        if (json && json.fallbackMailto) window.location.href = json.fallbackMailto;
        setContatoStatus('Erro ao enviar. Tente novamente.');
      }
    } catch (err) {
      setContatoStatus('Erro de conexão. Tente novamente.');
    }
    setTimeout(() => setContatoStatus(null), 3500);
  };

  const postarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgStatus('enviando...');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: msgNome, message: msgTexto }),
      });
      if (!res.ok) throw new Error('Falha ao postar');
      const saved = await res.json();
      setMessages((prev) => [saved, ...prev]);
      setMsgNome('');
      setMsgTexto('');
      setMsgStatus('Mensagem postada!');
    } catch (err) {
      setMsgStatus('Erro ao postar. Tente novamente.');
    }
    setTimeout(() => setMsgStatus(null), 2500);
  };

  const apagarMensagem = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar esta mensagem?')) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await fetch('/api/messages').then((r) => r.json()).catch(() => []);
        setMessages(data || []);
        alert('Erro ao apagar a mensagem no servidor.');
      }
    } catch (err) {
      const data = await fetch('/api/messages').then((r) => r.json()).catch(() => []);
      setMessages(data || []);
      alert('Erro de conexão ao apagar. Tente novamente.');
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8F3] text-gray-800">
      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/60 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-lg overflow-hidden shadow-md bg-white flex items-center justify-center">
              <Image src="/ecofood.png" alt="logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="text-sm font-bold">EcoFood &co.</div>
              <div className="text-xs text-gray-500">Sabor & Sustentabilidade</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#about" className="hover:underline">Sobre</a>
            <a href="#cards" className="hover:underline">Destaques</a>
            <a href="#contact" className="hover:underline">Contato</a>
            <a href="#messages" className="hover:underline">Mensagens</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="/cadastrar-cliente" className="text-sm text-[#b94b4b] hover:underline">Cadastrar</a>
            <a href="/cadastrar-empresa" className="ml-2 inline-flex items-center bg-[#b94b4b] text-white text-sm py-2 px-3 rounded shadow hover:shadow-md">Entrar</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-extrabold">Entregando Felicidade Em Cada Pedido.</h1>
          <p className="text-gray-700 max-w-xl">Produtos de qualidade e um compromisso com o planeta — tudo pronto para chegar até você.</p>

          <div className="flex gap-4">
            <a href="#contact" className="inline-flex items-center gap-2 bg-[#b94b4b] text-white py-3 px-5 rounded shadow hover:shadow-lg transition">Fale Conosco</a>
            <a href="#cards" className="inline-flex items-center gap-2 border border-[#b94b4b] text-[#b94b4b] py-3 px-5 rounded hover:bg-[#fff4f3] transition">Nossos Destaques</a>
          </div>

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">🏆</div>
              <div>1º lugar SESI Tank</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">🤝</div>
              <div>Parcerias locais</div>
            </div>
          </div>
        </motion.div>

        {/* Login card */}
        <motion.aside initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full max-w-md mx-auto">
          <div className="bg-white border border-[#c84b4b] rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                  required
                />
                <span className="absolute right-3 top-3 text-xs text-gray-400">@</span>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 p-3 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition"
                  required
                />
                <span className="absolute right-3 top-3 text-xs text-gray-400">🔒</span>
              </div>

              <div>
                <select value={role} onChange={(e) => setRole(e.target.value as 'cliente' | 'empresa')} className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition">
                  <option value="cliente">Cliente</option>
                  <option value="empresa">Empresa</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-[#b94b4b] text-white py-3 rounded-lg font-medium shadow hover:shadow-lg transition">Entrar</button>

              <div className="text-center mt-2 text-sm">
                <a href="/cadastrar-cliente" className="text-[#b94b4b] hover:underline">Cadastrar cliente</a> • <a href="/cadastrar-empresa" className="text-[#b94b4b] hover:underline">Cadastrar empresa</a>
              </div>
            </form>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">Segurança e privacidade — seus dados são importantes para nós.</div>
        </motion.aside>
      </section>

      {/* ABOUT + CARDS */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="bg-white rounded-2xl p-8 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-3">SOBRE A EMPRESA</h3>
              <p className="text-gray-700 leading-relaxed">
                A EcoFood &co. é uma empresa que une sabor, sustentabilidade e responsabilidade social para transformar a forma como nos alimentamos. Trabalhamos com ingredientes orgânicos e de origem local, priorizando práticas que reduzem o desperdício, valorizam produtores e respeitam o meio ambiente.
                <br /><br />
                Mais do que oferecer produtos saudáveis, promovemos um ecossistema de consumo consciente — conectando pessoas, comunidades e ideias em torno de uma alimentação com propósito.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-40 h-40 relative rounded-xl overflow-hidden shadow-md">
                <Image src="/ecofood.png" alt="ecofood" fill style={{ objectFit: 'contain' }} />
              </div>
              <div className="mt-3 text-sm text-gray-500">EcoFood &co. — Entregando Felicidade Em Cada Pedido</div>
            </div>
          </div>
        </motion.div>

        <div id="cards" className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#b94b4b] text-white rounded-xl p-6 shadow-lg">
            <h5 className="font-semibold mb-2">Prêmios</h5>
            <p className="text-2xl font-bold">1º lugar SESI Tank</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#b94b4b] text-white rounded-xl p-6 shadow-lg">
            <h5 className="font-semibold mb-2">Apoiadores</h5>
            <ul className="list-none space-y-1 text-sm">
              <li>Savengnago</li>
              <li>Pão de Açúcar</li>
              <li>Sempre Vale</li>
              <li>Zomper</li>
            </ul>
            <div className="mt-2 text-xs underline">MAIS</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#b94b4b] text-white rounded-xl p-6 shadow-lg">
            <h5 className="font-semibold mb-2">Tempo de experiência</h5>
            <p className="text-2xl font-bold">10 meses</p>
          </motion.div>
        </div>
      </section>

      {/* CONTACT + MESSAGES */}
      <section id="contact" className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div id="contact-form" initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="bg-white rounded-2xl p-8 shadow-md border border-[#f2d5d5]">
            <h4 className="text-lg font-semibold mb-4">CONTATO</h4>
            <form onSubmit={enviarContato} className="space-y-4">
              <input placeholder="Nome" value={contatoNome} onChange={(e) => setContatoNome(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition" required />
              <input type="email" placeholder="Email" value={contatoEmail} onChange={(e) => setContatoEmail(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition" required />
              <textarea placeholder="Mensagem" value={contatoMensagem} onChange={(e) => setContatoMensagem(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg h-36 focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition" required />
              <div className="flex items-center justify-between">
                <button className="bg-[#b94b4b] text-white py-3 px-6 rounded-lg shadow hover:shadow-lg transition">Enviar Mensagem</button>
                {contatoStatus && <div className="text-sm text-gray-600">{contatoStatus}</div>}
              </div>
            </form>
          </motion.div>

          <motion.div id="messages" initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="bg-white rounded-2xl p-6 shadow-md border border-[#f2d5d5]">
            <h4 className="text-lg font-semibold mb-4">MENSAGENS</h4>
            <form onSubmit={postarMensagem} className="space-y-3">
              <input placeholder="Nome" value={msgNome} onChange={(e) => setMsgNome(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition" required />
              <textarea placeholder="Mensagem" value={msgTexto} onChange={(e) => setMsgTexto(e.target.value)} className="w-full border border-gray-200 p-3 rounded-lg h-28 focus:outline-none focus:ring-2 focus:ring-[#b94b4b] transition" required />
              <div className="flex items-center justify-between">
                <button className="bg-[#b94b4b] text-white py-2 px-4 rounded-lg shadow hover:shadow-md transition">Postar Mensagem</button>
                {msgStatus && <div className="text-sm text-gray-600">{msgStatus}</div>}
              </div>
            </form>

            <div className="mt-6">
              <h5 className="font-semibold mb-3">Mensagens publicadas</h5>
              <div className="space-y-3 max-h-64 overflow-auto pr-2">
                {messages.length === 0 && <div className="text-sm text-gray-500">Nenhuma mensagem ainda.</div>}
                {messages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border border-gray-100 rounded-lg p-3 bg-[#fffaf9]">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold">{m.name}</div>
                        <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <button onClick={() => apagarMensagem(m.id)} className="hover:underline">Apagar</button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{m.message}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-100 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-3">
          <div>© {new Date().getFullYear()} EcoFood &co. — Todos os direitos reservados.</div>
          <div>Contato: ecofood005@gmail.com • Limeira, SP</div>
        </div>
      </footer>
    </main>
  );
}
