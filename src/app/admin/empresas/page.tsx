'use client';

import { useEffect, useState } from 'react';

type EmpresaView = {
  id: string;
  companyName: string;
  respName?: string;
  respPhone?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  credentials?: { email: string; password: string } | null;
};

export default function AdminEmpresas() {
  const [list, setList] = useState<EmpresaView[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function fetchList() {
    setLoading(true);
    const res = await fetch('/api/empresas');
    const json = await res.json();
    setList(json || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoadingId(id);
    const res = await fetch('/api/empresas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    const json = await res.json();
    if (res.ok) {
      // atualizar a lista localmente
      setList((prev) => prev.map((p) => (p.id === id ? json.updated : p)));
      if (action === 'approve') {
        alert(`Credenciais geradas:\nEmail: ${json.credentials.email}\nSenha: ${json.credentials.password}`);
      }
    } else {
      alert(json?.error || 'Erro');
    }
    setActionLoadingId(null);
  }

  return (
    <main className="min-h-screen bg-[#FFF8F3] px-6 py-12">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Admin — Pedidos de Empresas</h1>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="grid gap-4">
            {list.map((e) => (
              <div key={e.id} className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{e.companyName}</div>
                  <div className="text-sm text-gray-600">Responsável: {e.respName} — {e.respPhone}</div>
                  <div className="text-xs text-gray-500">Criado em: {new Date(e.createdAt).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded text-sm ${e.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : e.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {e.status}
                  </div>

                  {e.status === 'pending' && (
                    <>
                      <button onClick={() => handleAction(e.id, 'approve')} disabled={actionLoadingId === e.id} className="px-3 py-1 rounded bg-green-600 text-white">{actionLoadingId === e.id ? '...' : 'Aprovar'}</button>
                      <button onClick={() => handleAction(e.id, 'reject')} disabled={actionLoadingId === e.id} className="px-3 py-1 rounded bg-red-600 text-white">Recusar</button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {list.length === 0 && <p className="text-gray-600">Nenhum pedido encontrado.</p>}
          </div>
        )}
      </section>
    </main>
  );
}