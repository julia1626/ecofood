'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  validade: string;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  validade: string;
}

export default function ClientePage() {
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
  }, []);

  const fetchMenuItems = async () => {
    const response = await fetch('/api/menu-items');
    const data = await response.json();
    setMenuItems(data);
  };

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem._id === menuItem._id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItem._id === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { menuItem, quantity: 1, price: menuItem.price, validade: menuItem.validade }]);
    }
  };

  const removeFromOrder = (menuItemId: string) => {
    setOrderItems(orderItems.filter(item => item.menuItem._id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(menuItemId);
    } else {
      setOrderItems(orderItems.map(item =>
        item.menuItem._id === menuItemId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (orderItems.length === 0 || !endereco.trim()) {
      alert('Informe o endereço e adicione itens ao pedido.');
      return;
    }

    const total = calculateTotal();
    localStorage.setItem('orderTotal', total.toFixed(2));

    const orderData = {
      endereco, // agora enviamos endereço
      items: orderItems.map(item => ({
        menuItem: item.menuItem._id,
        quantity: item.quantity,
        validade: item.validade,
      })),
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      setOrderItems([]);
      setEndereco('');
      router.push('/pagamento'); // redireciona para escolher forma de pagamento
    } else {
      alert('Erro ao enviar pedido');
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-[#b94b4b]/30 pb-4">
        <h1 className="text-3xl font-bold text-[#b94b4b] mb-4 md:mb-0">Painel do Cliente</h1>
        <button
          onClick={handleLogout}
          className="bg-[#b94b4b] text-white px-4 py-2 rounded hover:bg-[#a43f3f] transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('produtos')}
          className={`px-5 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'produtos'
              ? 'bg-[#b94b4b] text-white shadow-md'
              : 'bg-white text-[#b94b4b] border border-[#b94b4b]/50 hover:bg-[#fff2ef]'
          }`}
        >
          Produtos
        </button>
        <button
          onClick={() => setActiveTab('pedido')}
          className={`px-5 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'pedido'
              ? 'bg-[#b94b4b] text-white shadow-md'
              : 'bg-white text-[#b94b4b] border border-[#b94b4b]/50 hover:bg-[#fff2ef]'
          }`}
        >
          Pedido Atual
        </button>
      </div>

      {/* Aba: Produtos */}
      {activeTab === 'produtos' && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-[#b94b4b]/20">
          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-[#b94b4b]/30 p-2 rounded shadow-inner focus:outline-none focus:border-[#b94b4b]"
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <div
                key={item._id}
                className="border border-[#b94b4b]/20 p-4 rounded-lg bg-[#fffdfc] hover:shadow-md transition"
              >
                <h3 className="font-bold text-lg text-[#b94b4b]">{item.name}</h3>
                <p className="text-gray-700">R$ {item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-sm text-gray-400">{new Date(item.validade).toLocaleDateString()}</p>
                <button
                  onClick={() => addToOrder(item)}
                  className="mt-2 bg-[#b94b4b] text-white px-3 py-1 rounded text-sm hover:bg-[#a43f3f] transition-colors"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba: Pedido Atual */}
      {activeTab === 'pedido' && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-[#b94b4b]/20">
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {orderItems.length === 0 && (
              <p className="text-gray-500">Nenhum item no pedido.</p>
            )}
            {orderItems.map((item) => (
              <div key={item.menuItem._id} className="flex justify-between items-center border-b border-[#b94b4b]/20 pb-2">
                <div>
                  <span className="font-medium text-[#b94b4b]">{item.menuItem.name}</span>
                  <span className="text-gray-600 ml-2">R$ {item.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                    className="bg-red-500 text-white px-2 py-1 rounded mr-1 hover:bg-red-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-1 hover:bg-green-600 transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromOrder(item.menuItem._id)}
                    className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* campo de endereço */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Endereço para entrega"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full border border-[#b94b4b]/30 p-2 rounded focus:outline-none focus:border-[#b94b4b]"
            />
          </div>

          <div className="border-t border-[#b94b4b]/20 pt-4">
            <div className="text-xl font-bold mb-4 text-[#b94b4b]">
              Total: R$ {calculateTotal().toFixed(2)}
            </div>
            <button
              onClick={submitOrder}
              disabled={orderItems.length === 0}
              className="w-full bg-[#b94b4b] text-white py-3 px-4 rounded hover:bg-[#a43f3f] disabled:bg-gray-400 transition-colors"
            >
              Finalizar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
