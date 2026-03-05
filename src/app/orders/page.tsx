"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Order, CargoType } from '@/types/order';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('orders');
      if (saved) setOrders(JSON.parse(saved));
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.receiverName.toLowerCase().includes(search.toLowerCase()) ||
        order.receiverCity.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterType === 'all' || order.cargoType === filterType;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, filterType]);

  const handleDelete = () => {
    const updated = orders.filter(o => o.id !== deleteId);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
    setDeleteId(null);
  };

  const getCargoStyle = (type: CargoType) => {
    switch (type) {
      case 'fragile': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'documents': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-400">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">История заявок</h1>
            <p className="text-gray-500 font-medium">Всего оформлено: {orders.length}</p>
          </div>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">
            + Новая заявка
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="sm:col-span-2 relative">
            <input 
              placeholder="Поиск по имени или городу..."
              className="w-full p-4 pl-12 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="absolute left-4 top-4.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select 
            className="p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none font-medium text-gray-700"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="all">Все типы груза</option>
            <option value="documents">Документы</option>
            <option value="fragile">Хрупкое</option>
            <option value="common">Обычное</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="group relative bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <Link href={`/orders/${order.id}`} className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md border ${getCargoStyle(order.cargoType)}`}>
                      {order.cargoType === 'common' ? 'Обычное' : order.cargoType === 'fragile' ? 'Хрупкое' : 'Документы'}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xl font-black text-gray-800 mb-1">
                    <span>{order.senderCity}</span>
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{order.receiverCity}</span>
                  </div>
                  
                  <p className="text-gray-500 font-medium">Получатель: <span className="text-gray-900 font-bold">{order.receiverName}</span></p>
                </Link>

                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                   <div className="text-right hidden sm:block">
                      <p className="text-xs font-bold text-gray-400 uppercase">Статус</p>
                      <p className="text-sm font-black text-emerald-500 uppercase italic">В пути</p>
                   </div>
                   <button 
                    onClick={() => setDeleteId(order.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    title="Удалить"
                   >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-xl">Заявки не найдены</p>
              <Link href="/" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Оформить первую?</Link>
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Удалить заказ?</h3>
            <p className="text-gray-500 text-center mb-8 font-medium leading-relaxed">Это действие удалит данные из локального хранилища навсегда.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 font-bold text-gray-400 hover:bg-gray-100 rounded-2xl transition-all">Отмена</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
