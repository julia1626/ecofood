'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PagamentoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center font-sans">
      <h1 className="text-2xl font-bold text-[#b94b4b] mb-8">Formas de Pagamento</h1>

      <div className="flex gap-16">
        <div
          onClick={() => router.push('/pagamento/cartao')}
          className="cursor-pointer flex flex-col items-center p-6 bg-white rounded-lg shadow-lg border border-[#b94b4b]/20 hover:shadow-xl transition"
        >
          <Image src="/cartao.png" alt="Cartão de Crédito" width={150} height={150} />
          <p className="mt-4 font-semibold text-[#b94b4b]">Cartão de Crédito</p>
        </div>

        <div
          onClick={() => router.push('/pagamento/pix')}
          className="cursor-pointer flex flex-col items-center p-6 bg-white rounded-lg shadow-lg border border-[#b94b4b]/20 hover:shadow-xl transition"
        >
          <Image src="/pix.png" alt="PIX" width={150} height={150} />
          <p className="mt-4 font-semibold text-[#b94b4b]">PIX</p>
        </div>
      </div>

      <footer className="absolute bottom-4 text-sm text-gray-500">
        © 2025 EcoFood &co. - Todos os Direitos Reservados.
      </footer>
    </div>
  );
}
