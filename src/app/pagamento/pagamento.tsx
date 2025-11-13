import Image from 'next/image';

export default function Pagamento() {
  return (
    <div>
      <h1>Pagamento</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Imagem do Pix */}
        <div>
          <Image 
            src="/public/pix.png" 
            alt="Pix" 
            width={100} 
            height={100} 
          />
          <p>Pix</p>
        </div>

        {/* Imagem do Cartão */}
        <div>
          <Image 
            src="/public/cartao.png" 
            alt="Cartão" 
            width={100} 
            height={100} 
          />
          <p>Cartão</p>
        </div>
      </div>
    </div>
  );
}
