'use client';

import { Shield, Truck, RefreshCw, CreditCard, Lock, Clock, MapPin, Phone } from 'lucide-react';

export default function PoliciesPage() {
  const policies = [
    {
      icon: <Truck size={32} />,
      title: 'سياسة الشحن',
      color: 'bg-blue-100 text-blue-600',
      content: [
        'نوصل لجميع ولايات السودان',
        'مدة التوصيل: 2-5 أيام عمل',
        'رسوم التوصيل: 500 ج.س',
        'التوصيل مجاني للطلبات فوق 5000 ج.س',
        'سيتم التواصل معك لتأكيد عنوان التوصيل',
      ],
    },
    {
      icon: <RefreshCw size={32} />,
      title: 'سياسة الإرجاع والاستبدال',
      color: 'bg-orange-100 text-orange-600',
      content: [
        'يمكنك إرجاع المنتج خلال 7 أيام من تاريخ الاستلام',
        'المنتج يجب أن يكون بحالته الأصلية غير مستخدم',
        'المنتجات الغذائية غير قابلة للإرجاع لأسباب صحية',
        'تتحمل تكاليف الشحن في حالة الإرجاع',
        'سيتم استرداد المبلغ خلال 3-5 أيام',
      ],
    },
    {
      icon: <Lock size={32} />,
      title: 'سياسة الخصوصية',
      color: 'bg-purple-100 text-purple-600',
      content: [
        'معلوماتك الشخصية آمنة 100%',
        'لن نشارك بياناتك مع أي طرف ثالث',
        'نستخدم بياناتك فقط لتوصيل الطلبات',
        'يمكنك طلب حذف بياناتك في أي وقت',
        'نظام دفع آمن ومشفّر',
      ],
    },
    {
      icon: <CreditCard size={32} />,
      title: 'سياسة الدفع',
      color: 'bg-green-100 text-green-600',
      content: [
        'الدفع عند الاستلام (كاش)',
        'تحويل بنكي (بنكك، بنك النيل، بنك السودان)',
        'محافظ إلكترونية (أوكاش، فوري)',
        'الدفع آمن 100%',
        'سيتم إرسال إيصال الدفع عبر واتساب',
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold gradient-text mb-3">سياسات المتجر</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          نحرص على توفير أفضل تجربة تسوق لعملائنا، إليك سياساتنا التي نلتزم بها
        </p>
      </div>

      {/* Policies Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {policies.map((policy, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className={`p-4 ${policy.color} flex items-center gap-3`}>
              {policy.icon}
              <h2 className="text-xl font-bold">{policy.title}</h2>
            </div>
            <ul className="p-6 space-y-3">
              {policy.content.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <span className="text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">لديك استفسار آخر؟</h3>
        <p className="text-gray-600 mb-6">فريق الدعم لدينا جاهز للإجابة على أسئلتك</p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <Phone size={18} className="text-green-600" />
            <span>0912345678</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <MapPin size={18} className="text-green-600" />
            <span>الخرطوم، السودان</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
            <Clock size={18} className="text-green-600" />
            <span>السبت - الخميس: 9ص - 9م</span>
          </div>
        </div>
      </div>
    </div>
  );
}