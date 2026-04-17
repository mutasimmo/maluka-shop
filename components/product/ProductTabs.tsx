// components/product/ProductTabs.tsx
'use client';

import { useState } from 'react';
import { Truck, RefreshCw, CreditCard, Info } from 'lucide-react';

// تعريف نوع (Type) للمنتج الذي سيتم تمريره
interface ProductTabsProps {
  product: {
    name: string;
    description: string | null;
  };
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'تفاصيل المنتج', icon: <Info size={18} /> },
    { id: 'shipping', label: 'معلومات الشحن', icon: <Truck size={18} /> },
    { id: 'returns', label: 'سياسة الاسترجاع', icon: <RefreshCw size={18} /> },
    { id: 'payment', label: 'طرق الدفع', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
      {/* Tabs Header */}
      <div className="border-b px-6 overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 flex items-center gap-2 transition duration-200 ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="p-6">
        {/* وصف المنتج */}
        {activeTab === 'description' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-3">وصف المنتج</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || 'منتج سوداني أصلي يتميز بجودة عالية وخامات ممتازة. نضمن لك منتجاً أصلياً 100% من مصادر موثوقة.'}
            </p>
            <h3 className="font-bold text-lg mt-6 mb-3">المميزات</h3>
            <ul className="text-gray-600 space-y-2">
              <li className="flex items-center gap-2">✅ منتج سوداني أصلي 100%</li>
              <li className="flex items-center gap-2">✅ جودة عالية وخامات ممتازة</li>
              <li className="flex items-center gap-2">✅ توصيل سريع لجميع الولايات</li>
              <li className="flex items-center gap-2">✅ دعم فني متواصل</li>
            </ul>
          </div>
        )}

        {/* معلومات الشحن */}
        {activeTab === 'shipping' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Truck size={20} className="text-green-600" />
              معلومات الشحن
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">🚚 <strong>مدة التوصيل:</strong> 2-5 أيام عمل</p>
              <p className="text-gray-600">💰 <strong>رسوم التوصيل:</strong> 500 ج.س (مجاني للطلبات فوق 5000 ج.س)</p>
              <p className="text-gray-600">📍 <strong>مناطق التوصيل:</strong> جميع ولايات السودان</p>
              <p className="text-gray-600">📞 <strong>متابعة الطلب:</strong> سيتم التواصل معك لتأكيد عنوان التوصيل</p>
              <p className="text-gray-600">📱 <strong>تتبع الطلب:</strong> يمكنك تتبع طلبك من خلال صفحة "طلباتي"</p>
            </div>
          </div>
        )}

        {/* سياسة الاسترجاع */}
        {activeTab === 'returns' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <RefreshCw size={20} className="text-green-600" />
              سياسة الاسترجاع والاستبدال
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">🔄 <strong>مدة الإرجاع:</strong> 7 أيام من تاريخ الاستلام</p>
              <p className="text-gray-600">📦 <strong>شروط الإرجاع:</strong> المنتج يجب أن يكون بحالته الأصلية غير مستخدم</p>
              <p className="text-gray-600">⚠️ <strong>المنتجات الغذائية:</strong> غير قابلة للإرجاع لأسباب صحية</p>
              <p className="text-gray-600">💰 <strong>تكاليف الشحن:</strong> يتحملها العميل في حالة الإرجاع</p>
              <p className="text-gray-600">💵 <strong>استرداد المبلغ:</strong> خلال 3-5 أيام عمل</p>
            </div>
          </div>
        )}

        {/* طرق الدفع */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <CreditCard size={20} className="text-green-600" />
              طرق الدفع المتاحة
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600">💵 <strong>الدفع عند الاستلام:</strong> كاش (متاح لجميع الطلبات)</p>
              <p className="text-gray-600">🏦 <strong>تحويل بنكي:</strong> بنكك، بنك النيل، بنك السودان</p>
              <p className="text-gray-600">📱 <strong>محافظ إلكترونية:</strong> أوكاش، فوري</p>
              <p className="text-gray-600">💳 <strong>بطاقات بنكية:</strong> فيزا، ماستركارد (سيتم تفعيلها قريباً)</p>
              <p className="text-gray-600">🔒 <strong>الدفع آمن 100%</strong> - جميع معاملاتك مشفرة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}