'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PixPage() {
  const [endereco, setEndereco] = useState('');
  const [total, setTotal] = useState(0);
  const frete = 2.0;
  const router = useRouter();

  useEffect(() => {
    const storedTotal = localStorage.getItem('orderTotal');
    if (storedTotal) setTotal(parseFloat(storedTotal));
  }, []);

  const handlePix = () => {
    alert(`Pagamento via PIX de R$ ${(total + frete).toFixed(2)} gerado com sucesso!`);
    localStorage.removeItem('orderTotal');
    router.push('/cliente');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center font-sans">
      <h1 className="text-2xl font-bold text-[#b94b4b] mb-6">Pagamento - PIX</h1>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-[#b94b4b]/20 w-[380px]">

        <div className="border p-3 rounded text-sm bg-[#fff7f6] mb-4">
          <p><strong>Resumo do Pedido</strong></p>
          <p>Frete: R$ {frete.toFixed(2)}</p>
          <p>Total: R$ {(total + frete).toFixed(2)}</p>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Após clicar em "Finalizar" seu Pix será gerado. O processamento do pagamento é simples e imediato.
        </p>

        <button
          onClick={handlePix}
          className="w-full bg-[#b94b4b] text-white py-2 rounded hover:bg-[#a43f3f] transition"
        >
          Finalizar
        </button>
      </div>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        © 2025 EcoFood &co. - Todos os Direitos Reservados.
      </footer>
    </div>
  );
}
