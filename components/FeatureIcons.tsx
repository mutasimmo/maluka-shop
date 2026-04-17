'use client';

import { Truck, Shield, Clock, Headphones, RefreshCw, Gift } from 'lucide-react';

export default function FeatureIcons() {
  const features = [
    { icon: <Truck size={28} />, title: 'توصيل سريع', desc: '2-5 أيام عمل' },
    { icon: <Shield size={28} />, title: 'جودة مضمونة', desc: 'منتجات أصلية' },
    { icon: <Clock size={28} />, title: 'دعم 24/7', desc: 'خدمة عملاء' },
    { icon: <RefreshCw size={28} />, title: 'إرجاع سهل', desc: 'خلال 7 أيام' },
    { icon: <Gift size={28} />, title: 'هدايا مجانية', desc: 'على الطلبات الكبيرة' },
    { icon: <Headphones size={28} />, title: 'دعم فني', desc: 'واتساب مباشر' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-8">
      {features.map((feature, index) => (
        <div key={index} className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
            {feature.icon}
          </div>
          <h3 className="font-semibold text-gray-800">{feature.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
}