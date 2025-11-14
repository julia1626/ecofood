'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  validade: Date | string;
}

interface Order {
  endereco: string;
  _id: string;
  items: Array<{
    menuItem: MenuItem;
    quantity: number;
    price: number;
  }>;
  status: string;
  total: number;
  createdAt: string;
}

export default function EmpresaPage() {
  const router = useRouter();

  // data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // form
  const [newItem, setNewItem] = useState({ name: '', price: '', validade: '' });
  const [adding, setAdding] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<'cardapio' | 'pedidos' | 'faturamento' | 'demanda'>('cardapio');
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'empresa') {
      router.push('/');
      return;
    }
    loadAll();
    const interval = setInterval(fetchOrders, 7000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    await Promise.all([fetchMenuItems(), fetchOrders()]);
  };

  const fetchMenuItems = async () => {
    setLoadingMenu(true);
    setError(null);
    try {
      const res = await fetch('/api/menu-items');
      if (!res.ok) throw new Error('Falha ao buscar produtos');
      const data = await res.json();
      setMenuItems(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Erro desconhecido ao carregar produtos');
      setMenuItems([]);
    } finally {
      setLoadingMenu(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Falha ao buscar pedidos');
      const data = await res.json();
      // ordenar: mais recentes primeiro (em caso backend não ordenar)
      const ordered = (data || []).sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(ordered);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddMenuItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.name.trim() || !newItem.price) return;
    setAdding(true);
    try {
      const payload = {
        name: newItem.name.trim(),
        price: parseFloat(newItem.price as any),
        validade: newItem.validade || new Date().toISOString().slice(0, 10),
      };
      const res = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Erro ao criar item');
      }
      setNewItem({ name: '', price: '', validade: '' });
      await fetchMenuItems();
      // feedback simples
      // (poderia usar toast)
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Erro ao adicionar item');
    } finally {
      setAdding(false);
    }
  };

  const calculateRevenue = () => {
    return orders
      .filter((order) => order.status === 'Entregue')
      .reduce((total, order) => total + (order.total ?? 0), 0);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar o status do pedido.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  // helpers UI
  const filteredMenu = menuItems.filter(mi => mi.name.toLowerCase().includes(search.toLowerCase()));

  const smallFade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border-b border-[#b94b4b]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#f3d9d9]">
              {/* small logo placeholder */}
              <svg className="w-8 h-8 text-[#b94b4b]" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#b94b4b]">Painel da Empresa</h1>
              <p className="text-sm text-gray-500">Gerencie produtos, pedidos e faturamento</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center bg-white border border-[#f3d9d9] rounded-lg px-3 py-2 shadow-sm">
              <svg className="w-4 h-4 mr-2 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <input
                className="bg-transparent outline-none text-sm w-48"
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar produto"
              />
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-[#b94b4b] hover:bg-[#a43f3f] text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: form + summary */}
        <aside className="lg:col-span-1 space-y-6">
          <motion.section {...smallFade} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f3d9d9]">
            <h3 className="text-lg font-semibold text-[#b94b4b] mb-3">Adicionar Produto</h3>

            <form onSubmit={handleAddMenuItem} className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-700">Nome</span>
                <input
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b94b4b]"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Preço (R$)</span>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b94b4b]"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-700">Validade</span>
                <input
                  type="date"
                  className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b94b4b]"
                  value={newItem.validade}
                  onChange={(e) => setNewItem({ ...newItem, validade: e.target.value })}
                />
              </label>

              <button
                type="submit"
                disabled={adding}
                className={`w-full mt-2 py-2 rounded-lg text-white font-medium ${adding ? 'bg-[#b94b4b]/70' : 'bg-[#b94b4b] hover:bg-[#a43f3f]'}`}
                aria-busy={adding}
              >
                {adding ? 'Adicionando...' : 'Adicionar Item'}
              </button>
            </form>
          </motion.section>

          <motion.section {...smallFade} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f3d9d9]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total de produtos</div>
                <div className="text-2xl font-bold text-[#b94b4b]">{menuItems.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Faturamento</div>
                <div className="text-lg font-semibold text-green-600">R$ {formatCurrency(calculateRevenue())}</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">Atualize os pedidos regularmente para manter os dados sincronizados.</div>
          </motion.section>
        </aside>

        {/* Main content */}
        <section className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <nav className="flex flex-wrap gap-3 items-center">
            <TabButton active={activeTab === 'cardapio'} onClick={() => setActiveTab('cardapio')}>Gerenciar Produtos</TabButton>
            <TabButton active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')}>Ver Pedidos</TabButton>
            <TabButton active={activeTab === 'faturamento'} onClick={() => setActiveTab('faturamento')}>Faturamento</TabButton>
            <TabButton active={activeTab === 'demanda'} onClick={() => setActiveTab('demanda')}>Demanda</TabButton>
          </nav>

          {/* Cardápio */}
          {activeTab === 'cardapio' && (
            <motion.div {...smallFade} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f3d9d9]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#b94b4b]">Produtos</h2>
                <div className="text-sm text-gray-500">{menuItems.length} itens</div>
              </div>

              {loadingMenu ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-[#fffdfc] border border-[#f3d9d9] p-4 rounded-lg h-36" />
                  ))}
                </div>
              ) : (
                <>
                  {filteredMenu.length === 0 ? (
                    <div className="text-gray-500">Nenhum produto encontrado.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMenu.map((item) => (
                        <motion.article key={item._id} whileHover={{ translateY: -4 }} className="border border-[#b94b4b]/15 p-4 rounded-xl bg-[#fffdfc] shadow-sm flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-[#b94b4b] text-lg">{item.name}</h3>
                            <div className="text-gray-700 mt-2">R$ {formatCurrency(item.price)}</div>
                            <div className="text-xs text-gray-400 mt-1">Validade: {new Date(item.validade).toLocaleDateString()}</div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <button
                              onClick={() => navigator.clipboard?.writeText(item._id)}
                              className="text-xs px-3 py-1 border rounded text-gray-600 hover:bg-gray-50"
                              title="Copiar ID"
                            >
                              Copiar ID
                            </button>
                            <div className="text-sm font-bold text-[#b94b4b]">R$ {formatCurrency(item.price)}</div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Pedidos */}
          {activeTab === 'pedidos' && (
            <motion.div {...smallFade} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f3d9d9]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#b94b4b]">Pedidos Recebidos</h2>
                <div className="text-sm text-gray-500">{orders.length} pedidos</div>
              </div>

              {loadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-20 bg-[#fffdfc] rounded-lg border border-[#f3d9d9]" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.length === 0 && <div className="text-gray-500">Nenhum pedido no momento.</div>}
                  {orders.map((order) => (
                    <article key={order._id} className="p-4 bg-[#fffdfc] rounded-lg border border-[#f3d9d9] shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Endereço</div>
                          <div className="font-semibold text-[#b94b4b]">{order.endereco}</div>
                          <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded text-sm ${order.status === 'Recebido' ? 'bg-yellow-100 text-yellow-800' : order.status === 'Em Preparo' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                            {order.status}
                          </span>

                          <div className="text-right">
                            <div className="text-sm text-gray-500">Total</div>
                            <div className="font-bold text-[#b94b4b]">R$ {formatCurrency(order.total)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-700">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between border-t border-[#f3d9d9] py-2">
                            <div>{it.quantity}x {it.menuItem.name}</div>
                            <div>R$ {formatCurrency(it.price * it.quantity)}</div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => updateOrderStatus(order._id, 'Em Preparo')} className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Em Preparo</button>
                        <button onClick={() => updateOrderStatus(order._id, 'Entregue')} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">Entregue</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Faturamento */}
          {activeTab === 'faturamento' && (
            <motion.div {...smallFade} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f3d9d9]">
              <h2 className="text-xl font-semibold text-[#b94b4b] mb-4">Faturamento</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-[#fffdfc] border border-[#f3d9d9]">
                  <div className="text-sm text-gray-500">Total faturado (entregues)</div>
                  <div className="text-3xl font-bold text-green-600">R$ {formatCurrency(calculateRevenue())}</div>
                </div>

                <div className="p-4 rounded-lg bg-[#fffdfc] border border-[#f3d9d9]">
                  <div className="text-sm text-gray-500">Pedidos entregues</div>
                  <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Entregue').length}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Demanda */}
          {activeTab === 'demanda' && (
            <motion.div {...smallFade} className="bg-white rounded-2xl p-6 shadow-sm border border-[#f3d9d9]">
              <h2 className="text-xl font-semibold text-[#b94b4b] mb-4">Demanda</h2>

              {orders.length === 0 ? (
                <div className="text-gray-500">Sem demanda no momento.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((order) => (
                    <div key={order._id} className="p-4 rounded-lg bg-[#fffdfc] border-l-4 border-yellow-400">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Endereço</h3>
                          <div className="text-sm text-gray-600">{order.endereco}</div>
                        </div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </div>

                      <ul className="mt-3 text-sm">
                        {order.items.map((it, i) => (
                          <li key={i}>{it.quantity}x {it.menuItem.name}</li>
                        ))}
                      </ul>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => updateOrderStatus(order._id, 'Em Preparo')} className="flex-1 bg-orange-500 text-white py-2 rounded">Em Preparo</button>
                        <button onClick={() => updateOrderStatus(order._id, 'Entregue')} className="flex-1 bg-green-600 text-white py-2 rounded">Entregue</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-500">© {new Date().getFullYear()} EcoFood &co.</footer>
    </div>
  );

  // small internal components/helpers
  function TabButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? 'bg-[#b94b4b] text-white shadow-md' : 'bg-white text-[#b94b4b] border border-[#b94b4b]/20'}`}
        aria-pressed={active}
      >
        {children}
      </button>
    );
  }

  function formatCurrency(v: number) {
    if (!isFinite(v)) return '0,00';
    return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
