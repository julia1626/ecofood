'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CartaoPage() {
  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [total, setTotal] = useState(0);
  const frete = 2.0;
  const router = useRouter();

  useEffect(() => {
    const storedTotal = localStorage.getItem('orderTotal');
    if (storedTotal) setTotal(parseFloat(storedTotal));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pagamento de R$ ${(total + frete).toFixed(2)} processado com sucesso!`);
    localStorage.removeItem('orderTotal');
    router.push('/cliente');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center font-sans">
      <h1 className="text-2xl font-bold text-[#b94b4b] mb-6">Pagamento - Cartão de Crédito</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg border border-[#b94b4b]/20 w-[380px] space-y-4"
      >
        <input
          type="text"
          placeholder="Número do Cartão"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Nome no Cartão"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Validade (MM/AA)"
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className="w-1/2 border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            className="w-1/2 border p-2 rounded"
            required
          />
        </div>
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <div className="border p-3 rounded text-sm bg-[#fff7f6]">
          <p><strong>Resumo do Pedido</strong></p>
          <p>Frete: R$ {frete.toFixed(2)}</p>
          <p>Total: R$ {(total + frete).toFixed(2)}</p>
        </div>

        <button
          type="submit"
          className="w-full bg-[#b94b4b] text-white py-2 rounded hover:bg-[#a43f3f] transition"
        >
          Finalizar
        </button>
      </form>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        © 2025 EcoFood &co. - Todos os Direitos Reservados.
      </footer>
    </div>
  );
}
