'use client';

import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  validade: string;
  image?: string | null;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  validade: string;
}

const cardAnim: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function ClientePage(): JSX.Element {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'produtos' | 'pedido'>('produtos');
  const [endereco, setEndereco] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'cliente') {
      router.push('/');
      return;
    }
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu-items');
      const data = await response.json();
      setMenuItems(data || []);
    } catch (err) {
      console.error('Failed to fetch menu items', err);
      setMenuItems([]);
    }
  };

  const normalizeImageSrc = (src?: string | null) => {
    if (!src) return null;
    if (/^https?:\/\//.test(src)) return src;
    return src.startsWith('/') ? src : `/${src}`;
  };

  const addToOrder = (menuItem: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((p) => p.menuItem._id === menuItem._id);
      if (existing) return prev.map((p) => p.menuItem._id === menuItem._id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { menuItem, quantity: 1, price: menuItem.price, validade: menuItem.validade }];
    });
  };

  const removeFromOrder = (menuItemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.menuItem._id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromOrder(menuItemId);
    setOrderItems((prev) => prev.map((item) => item.menuItem._id === menuItemId ? { ...item, quantity } : item));
  };

  const calculateTotal = () => orderItems.reduce((t, i) => t + i.price * i.quantity, 0);

  const submitOrder = async () => {
    if (orderItems.length === 0 || !endereco.trim()) {
      alert('Informe o endereço e adicione itens ao pedido.');
      return;
    }

    const orderData = {
      endereco,
      items: orderItems.map((item) => ({ menuItem: item.menuItem._id, quantity: item.quantity, validade: item.validade })),
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setOrderItems([]);
        setEndereco('');
        router.push('/pagamento');
      } else {
        alert('Erro ao enviar pedido');
      }
    } catch (err) {
      alert('Erro de conexão ao enviar pedido');
    }
  };

  const categories = Array.from(new Set(menuItems.map((m) => m.category)));
  const filteredMenuItems = selectedCategory ? menuItems.filter((m) => m.category === selectedCategory) : menuItems;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-gray-800">
      {/* Topbar */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-[#b94b4b]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative rounded-lg overflow-hidden shadow-sm bg-white" />
          <div className="font-semibold text-[#b94b4b]">EcoFood • Cliente</div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab('produtos')} className={`px-4 py-2 rounded-full text-sm ${activeTab === 'produtos' ? 'bg-[#b94b4b] text-white shadow' : 'bg-white border border-[#b94b4b]/30 text-[#b94b4b]'}`}>
            Produtos
          </button>
          <button onClick={() => setActiveTab('pedido')} className={`px-4 py-2 rounded-full text-sm ${activeTab === 'pedido' ? 'bg-[#b94b4b] text-white shadow' : 'bg-white border border-[#b94b4b]/30 text-[#b94b4b]'}`}>
            Pedido ({orderItems.length})
          </button>
          <button onClick={handleLogout} className="text-sm bg-transparent text-[#b94b4b] px-3 py-2 rounded hover:underline">Sair</button>
        </div>
      </header>

      {/* === Option A: Resumo do Pedido full-width no topo === */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <motion.div initial="hidden" whileInView="show" variants={cardAnim} className="bg-white rounded-2xl p-6 shadow border border-[#f3d9d9]">
          <h4 className="font-semibold text-[#b94b4b] mb-3">Resumo do Pedido</h4>

          {orderItems.length === 0 ? (
            <div className="text-sm text-gray-500 mb-4">Nenhum item no pedido.</div>
          ) : (
            <ul className="space-y-3 mb-4 max-h-48 overflow-auto pr-2">
              {orderItems.map((it) => (
                <li key={it.menuItem._id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-[#b94b4b]">{it.menuItem.name}</div>
                    <div className="text-xs text-gray-500">R$ {it.price.toFixed(2)} • {it.quantity}x</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button aria-label="Diminuir" onClick={() => updateQuantity(it.menuItem._id, it.quantity - 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">-</button>
                    <div className="px-2">{it.quantity}</div>
                    <button aria-label="Aumentar" onClick={() => updateQuantity(it.menuItem._id, it.quantity + 1)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-[#f3d9d9] mt-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Endereço de entrega"
              className="md:col-span-2 w-full border border-[#b94b4b]/20 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#b94b4b]"
            />
            <div className="flex flex-col items-start md:items-end">
              <div className="text-sm text-gray-600">Total</div>
              <div className="font-bold text-lg text-[#b94b4b]">R$ {calculateTotal().toFixed(2)}</div>
            </div>

            <div className="md:col-span-3 mt-3">
              <button
                onClick={submitOrder}
                disabled={orderItems.length === 0}
                className={`w-full py-3 rounded-lg text-white font-medium ${orderItems.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#b94b4b] hover:bg-[#a43f3f]'}`}
              >
                Finalizar pedido
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main layout: categories + products (products kept exactly as before) */}
      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Filters & Categories */}
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <motion.div initial="hidden" whileInView="show" variants={cardAnim} className="bg-white rounded-2xl p-6 shadow border border-[#f3d9d9] sticky top-24">
            <h4 className="font-semibold mb-3">Categorias</h4>
            <select className="w-full border border-[#b94b4b]/20 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#b94b4b]" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="text-sm text-gray-600">Dica: clique em um produto para adicionar rapidamente ao pedido.</div>
          </motion.div>
        </aside>

        {/* Product Grid — mantida exatamente como estava */}
        <section className="lg:col-span-2 order-1 lg:order-2">
          <motion.div initial="hidden" whileInView="show" variants={cardAnim} className="bg-white rounded-2xl p-6 shadow border border-[#f3d9d9] mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#b94b4b]">Cardápio</h2>
              <div className="text-sm text-gray-500">{filteredMenuItems.length} itens</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMenuItems.map((item) => {
                const src = normalizeImageSrc(item.image ?? null);
                return (
                  <motion.article key={item._id} whileHover={{ scale: 1.02 }} initial="hidden" whileInView="show" variants={cardAnim} className="border border-[#b94b4b]/15 rounded-xl p-4 bg-[#fffdfc] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-full h-36 mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                        {src ? (
                          <img
                            src={src}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/placeholder-food.png';
                            }}
                          />
                        ) : (
                          <div className="text-sm text-gray-400">Sem imagem</div>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg text-[#b94b4b]">{item.name}</h3>
                      <div className="text-sm text-gray-600">{item.category}</div>
                      <div className="text-xs text-gray-400">Validade: {new Date(item.validade).toLocaleDateString()}</div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-lg font-bold text-[#b94b4b]">R$ {item.price.toFixed(2)}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => addToOrder(item)} className="inline-flex items-center gap-2 bg-[#b94b4b] text-white py-2 px-3 rounded-lg text-sm hover:bg-[#a43f3f] transition">Adicionar</button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>

          {/* Mobile order summary */}
          <div className="lg:hidden fixed left-1/2 transform -translate-x-1/2 bottom-6 z-50">
            <div className="bg-white rounded-full px-5 py-3 shadow-lg border border-[#f3d9d9] flex items-center gap-4">
              <div className="font-medium text-sm">{orderItems.length} itens</div>
              <div className="font-semibold text-[#b94b4b]">R$ {calculateTotal().toFixed(2)}</div>
              <button onClick={() => setActiveTab('pedido')} className="bg-[#b94b4b] text-white px-4 py-2 rounded-full text-sm">Ver Pedido</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-sm text-gray-500">© {new Date().getFullYear()} EcoFood &co.</footer>
    </div>
  );
}
