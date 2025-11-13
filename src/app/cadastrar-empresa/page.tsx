'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarEmpresa() {
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
    if (!companyName || !respName) {
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
      const json = await res.json();
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
    <main className="min-h-screen bg-[#FFF8F3] px-6 py-12">
      <section className="max-w-4xl mx-auto flex flex-col lg:flex-row items-start gap-10">
        <div className="flex-1 flex justify-center lg:justify-start items-center">
          <div className="w-56 h-56 lg:w-64 lg:h-64 relative">
            <Image src="/ecofood.png" alt="EcoFood Logo" fill style={{ objectFit: 'contain' }} />
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white border border-[#c84b4b] rounded-lg shadow-lg p-6 relative">
            <h2 className="text-2xl font-semibold text-center mb-4">Cadastrar Empresa</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-200 p-2 rounded shadow-inner"
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full border border-gray-200 p-2 rounded shadow-inner" placeholder="00.000.000/0000-00" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <input value={respName} onChange={(e) => setRespName(e.target.value)} className="w-full border border-gray-200 p-2 rounded shadow-inner" placeholder="Nome do responsável" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input value={respPhone} onChange={(e) => setRespPhone(e.target.value)} className="w-full border border-gray-200 p-2 rounded shadow-inner" placeholder="(99) 9 9999-9999" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-200 p-2 rounded shadow-inner" placeholder="Cidade / Bairro" />
              </div>

              <button type="submit" className={`w-full ${loading ? 'opacity-70' : ''} bg-[#b94b4b] hover:bg-[#a43f3f] text-white py-2 rounded mt-1`} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Pedido'}
              </button>
            </form>

            {statusMsg && <p className="mt-3 text-sm text-gray-700">{statusMsg}</p>}

            <div className="text-center mt-3">
              <a href="/" className="text-sm text-[#b94b4b] hover:underline">Voltar à página inicial</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}