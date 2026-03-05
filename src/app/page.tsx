"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type CargoType = 'documents' | 'fragile' | 'common';

export interface Order {
  id: string;
  senderName: string;
  senderPhone: string;
  senderCity: string;
  receiverName: string;
  receiverCity: string;
  cargoType: CargoType;
  weight: number;
  createdAt: string;
  status: 'In Progress' | 'Delivered';
}

export type OrderFormData = Omit<Order, 'id' | 'createdAt' | 'status'>;

const steps = ["Отправитель", "Получатель", "Подтверждение"];

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isAgreed, setIsAgreed] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>({
    senderName: '',
    senderPhone: '',
    senderCity: '',
    receiverName: '',
    receiverCity: '',
    cargoType: 'common',
    weight: 0.1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData | 'agreement', string>>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let raw = digits;

    if (raw.startsWith('7') || raw.startsWith('8')) {
      raw = raw.substring(1);
    }
    raw = raw.substring(0, 10);

    let formatted = "+7";
    if (raw.length > 0) formatted += ` (${raw.substring(0, 3)}`;
    if (raw.length >= 4) formatted += `) ${raw.substring(3, 6)}`;
    if (raw.length >= 7) formatted += ` - ${raw.substring(6, 8)}`;
    if (raw.length >= 9) formatted += ` - ${raw.substring(8, 10)}`;
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, senderPhone: formatted }));
  };

  const validateStep = () => {
    const newErrors: Partial<Record<keyof OrderFormData | 'agreement', string>> = {};
    
    if (step === 1) {
      if (formData.senderName.trim().length < 2) {
        newErrors.senderName = "Имя должно содержать минимум 2 символа";
      }
      const digitsOnly = formData.senderPhone.replace(/\D/g, "");
      if (digitsOnly.length < 11) {
        newErrors.senderPhone = "Введите номер телефона полностью";
      }
      if (!formData.senderCity.trim()) {
        newErrors.senderCity = "Укажите город отправления";
      }
    }
    
    if (step === 2) {
      if (!formData.receiverName.trim()) {
        newErrors.receiverName = "Укажите имя получателя";
      }
      if (!formData.receiverCity.trim()) {
        newErrors.receiverCity = "Укажите город назначения";
      } else if (formData.receiverCity.trim().toLowerCase() === formData.senderCity.trim().toLowerCase()) {
        newErrors.receiverCity = "Город назначения не может совпадать с городом отправления";
      }
      if (formData.weight < 0.1 || formData.weight > 30) {
        newErrors.weight = "Вес должен быть от 0.1 до 30 кг";
      }
    }

    if (step === 3) {
      if (!isAgreed) {
        newErrors.agreement = "Необходимо ваше согласие";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    const saved = localStorage.getItem('orders');
    const orders = saved ? JSON.parse(saved) : [];
    
    const newOrder: Order = {
      ...formData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'In Progress'
    };

    localStorage.setItem('orders', JSON.stringify([...orders, newOrder]));
    router.push('/orders');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
          <div 
            className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500 -z-0" 
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((label, i) => (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white
                ${step > i + 1 ? 'bg-blue-600 border-blue-600 text-white' : 
                  step === i + 1 ? 'border-blue-600 text-blue-600 font-bold scale-110' : 'border-gray-300 text-gray-400'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-wider ${step === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-black text-gray-800">Отправитель</h2>
              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ваше имя</label>
                  <input 
                    type="text"
                    placeholder="Александр Пушкин"
                    className={`w-full p-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.senderName ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
                    value={formData.senderName}
                    onChange={e => setFormData({...formData, senderName: e.target.value})}
                  />
                  {errors.senderName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.senderName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Контактный телефон</label>
                  <input 
                    type="text"
                    placeholder="+7 (___) ___ - __ - __"
                    className={`w-full p-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.senderPhone ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
                    value={formData.senderPhone}
                    onChange={handlePhoneChange}
                  />
                  {errors.senderPhone && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.senderPhone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Город отправления</label>
                  <input 
                    type="text"
                    placeholder="Санкт-Петербург"
                    className={`w-full p-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.senderCity ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
                    value={formData.senderCity}
                    onChange={e => setFormData({...formData, senderCity: e.target.value})}
                  />
                  {errors.senderCity && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.senderCity}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-black text-gray-800">Получатель и груз</h2>
              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Имя получателя</label>
                  <input 
                    type="text"
                    className={`w-full p-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 ${errors.receiverName ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
                    value={formData.receiverName}
                    onChange={e => setFormData({...formData, receiverName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Город назначения</label>
                  <input 
                    type="text"
                    className={`w-full p-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 ${errors.receiverCity ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
                    value={formData.receiverCity}
                    onChange={e => setFormData({...formData, receiverCity: e.target.value})}
                  />
                  {errors.receiverCity && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.receiverCity}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Тип груза</label>
                    <select 
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      value={formData.cargoType}
                      onChange={e => setFormData({...formData, cargoType: e.target.value as CargoType})}
                    >
                      <option value="common">Обычное</option>
                      <option value="documents">Документы</option>
                      <option value="fragile">Хрупкое</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Вес (кг)</label>
                    <input 
                      type="number"
                      step="0.1"
                      className={`w-full p-3.5 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 ${errors.weight ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                {errors.weight && <p className="text-red-500 text-xs font-medium">{errors.weight}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-black text-gray-800">Подтверждение</h2>
              
              <div className="bg-blue-50/50 rounded-3xl border border-blue-100 divide-y divide-blue-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Отправитель</span>
                  <span className="text-sm font-bold text-blue-900">{formData.senderName}, {formData.senderCity}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Получатель</span>
                  <span className="text-sm font-bold text-blue-900">{formData.receiverName}, {formData.receiverCity}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Груз</span>
                  <span className="text-sm font-bold text-blue-900 capitalize">{formData.cargoType}, {formData.weight} кг</span>
                </div>
              </div>
              
              <div className="pt-4">
                <label className={`group flex items-start gap-4 cursor-pointer p-4 rounded-2xl transition-all border-2 
                  ${errors.agreement ? 'border-red-200 bg-red-50' : isAgreed ? 'border-blue-600 bg-blue-50/30' : 'border-transparent hover:bg-gray-50'}`}>
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-gray-300 checked:border-blue-600 checked:bg-blue-600 transition-all"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                    />
                    <svg className="absolute h-6 w-6 text-white p-1 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600 leading-tight select-none">
                    Я подтверждаю корректность данных и соглашаюсь с правилами перевозки грузов
                  </span>
                </label>
                {errors.agreement && <p className="text-red-500 text-xs mt-2 font-bold animate-bounce text-center">{errors.agreement}</p>}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <button 
                type="button"
                onClick={handleBack} 
                className="flex-1 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 transition-all"
              >
                Назад
              </button>
            )}
            <button 
              type="button"
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={step === 3 && !isAgreed}
              className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-lg transition-all 
                ${step === 3 && !isAgreed ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 active:scale-95'}`}
            >
              {step === 3 ? 'Отправить заявку' : 'Продолжить'}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
