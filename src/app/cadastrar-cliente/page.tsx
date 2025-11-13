'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- IMPORTANTE

export default function CadastrarCliente() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const json = await res.json();

      if (res.ok) {
        setStatus('Cliente cadastrado com sucesso!');

        // limpa os campos
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // aguarda um pequeno delay e redireciona
        setTimeout(() => {
          router.push('/cliente'); // <-- REDIRECIONA PARA /cliente
        }, 1000);
      } else {
        setStatus(json?.error || 'Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      setStatus('Erro de conexão. Tente novamente.');
    }

    setLoading(false);
    setTimeout(() => setStatus(null), 3500);
  };

  return (
    <main className="min-h-screen bg-[#FFF8F3] px-6 py-12">
      <section className="max-w-4xl mx-auto flex flex-col lg:flex-row items-start gap-10">
        <div className="flex-1 flex justify-center lg:justify-start items-center">
          <div className="w-56 h-56 lg:w-64 lg:h-64 relative">
            <Image src="/ecofood.png" alt="EcoFood Logo" fill style={{ objectFit: 'contain' }} />
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white border border-[#c84b4b] rounded-lg shadow-lg p-6 relative">
            <h2 className="text-2xl font-semibold text-center mb-4">Cadastrar Cliente</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded shadow-inner"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full ${loading ? 'opacity-70' : ''} bg-[#b94b4b] hover:bg-[#a43f3f] text-white py-2 rounded mt-1`}
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>

            {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}

            <div className="text-center mt-3">
              <a href="/" className="text-sm text-[#b94b4b] hover:underline">Voltar à página inicial</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
