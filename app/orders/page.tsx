'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone } from 'lucide-react';

export default function OrdersHomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!phone) {
      setError('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (phone.length < 9) {
      setError('رقم الهاتف غير صحيح');
      return;
    }
    setError('');
    router.push(`/orders/${phone}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-3">طلباتي</h1>
          <p className="text-gray-500">
            أدخل رقم هاتفك للاطلاع على طلباتك السابقة
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="tel"
                placeholder="09xxxxxxxx"
                className="input-field"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
              <Search size={18} />
              بحث
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <Phone size={14} />
              مثال: 0912345678
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}