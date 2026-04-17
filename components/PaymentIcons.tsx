'use client';

import { CreditCard, Building2, Smartphone, Banknote } from 'lucide-react';

export default function PaymentIcons() {
  const methods = [
    { icon: <Banknote size={24} />, name: 'الدفع عند الاستلام' },
    { icon: <Building2 size={24} />, name: 'بنكك' },
    { icon: <Smartphone size={24} />, name: 'أوكاش' },
    { icon: <Smartphone size={24} />, name: 'فوري' },
    { icon: <CreditCard size={24} />, name: 'بطاقة بنكية' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {methods.map((method, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
            {method.icon}
          </div>
          <span className="text-xs text-gray-500">{method.name}</span>
        </div>
      ))}
    </div>
  );
}