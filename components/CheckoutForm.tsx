'use client';

import { useState } from 'react';
import { CreditCard, Truck, User, Phone, MapPin } from 'lucide-react';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  loading: boolean;
}

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
}

export default function CheckoutForm({ onSubmit, loading }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    payment_method: 'cash',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <User size={20} className="text-green-600" />
        معلومات الشحن
      </h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          <User size={16} className="inline ml-1" />
          الاسم الكامل *
        </label>
        <input
          type="text"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="أدخل اسمك الكامل"
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          <Phone size={16} className="inline ml-1" />
          رقم الهاتف *
        </label>
        <input
          type="tel"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="09xxxxxxxx"
          value={formData.customer_phone}
          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">
          <MapPin size={16} className="inline ml-1" />
          العنوان *
        </label>
        <textarea
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          placeholder="الولاية - المدينة - الحي - الشارع"
          value={formData.customer_address}
          onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">
          <CreditCard size={16} className="inline ml-1" />
          طريقة الدفع *
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={formData.payment_method}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
        >
          <option value="cash">💵 الدفع عند الاستلام (كاش)</option>
          <option value="bankak">🏦 بنكك</option>
          <option value="ocash">📱 أوكاش</option>
          <option value="fawry">📱 فوري</option>
          <option value="nile">🏦 بنك النيل</option>
          <option value="bank_of_sudan">🏦 بنك السودان</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            جاري المعالجة...
          </>
        ) : (
          <>
            <Truck size={18} />
            تأكيد الطلب
          </>
        )}
      </button>
    </form>
  );
}