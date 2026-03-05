"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Order } from '@/types/order';

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const orders: Order[] = JSON.parse(savedOrders);
        const found = orders.find(o => o.id === id);
        setOrder(found || null);
      }
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-widest">Загрузка...</div>;
  if (!order) return <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
    <p className="text-2xl font-black text-gray-800">Заявка не найдена</p>
    <button onClick={() => router.push('/orders')} className="text-blue-600 font-bold">Вернуться к списку</button>
  </div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all"
        >
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-blue-600 transition-all">
            ←
          </div>
          Назад к списку
        </button>
        
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
          <div className="bg-blue-600 p-8 sm:p-10 text-white">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                ID: {id.slice(0, 13)}
              </span>
              <span className="bg-emerald-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-emerald-900">
                {order.status}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              {order.senderCity} <br className="sm:hidden" /> 
              <span className="text-blue-300 mx-2">→</span> 
              <br className="sm:hidden" /> 
              {order.receiverCity}
            </h1>
          </div>

          <div className="p-8 sm:p-10 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Отправитель</p>
                <p className="text-lg font-black text-gray-800">{order.senderName}</p>
                <p className="text-sm font-bold text-blue-600">{order.senderPhone}</p>
                <p className="text-sm font-medium text-gray-500">{order.senderCity}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Получатель</p>
                <p className="text-lg font-black text-gray-800">{order.receiverName}</p>
                <p className="text-sm font-medium text-gray-500">{order.receiverCity}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Информация о посылке</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-400">Тип</p>
                  <p className="font-black text-gray-800 capitalize">{order.cargoType === 'common' ? 'Обычный' : order.cargoType === 'fragile' ? 'Хрупкий' : 'Документы'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400">Вес</p>
                  <p className="font-black text-gray-800">{order.weight} кг</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold text-gray-400">Дата оформления</p>
                  <p className="font-black text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Распечатать накладную
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
