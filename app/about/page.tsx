import { Heart, Coffee, Leaf, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">عن ملوكا شوب</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-r from-green-700 to-green-500 flex items-center justify-center">
            <span className="text-7xl">🛍️</span>
          </div>
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              مرحباً بكم في <span className="font-bold text-green-700">ملوكا شوب</span>، متجركم السوداني الموثوق 
              لأفضل المنتجات المحلية الأصيلة. نفتخر بتقديم منتجات عالية الجودة من قلب السودان.
            </p>
            <p className="text-gray-700 leading-relaxed">
              نسعى دائماً لتوفير تجربة تسوق مميزة لعملائنا، مع ضمان الجودة وأفضل الأسعار 
              وخدمة توصيل سريعة إلى جميع أنحاء السودان.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Coffee size={40} className="mx-auto text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">منتجات أصلية</h3>
            <p className="text-gray-600 text-sm">نقدم منتجات سودانية 100% بجودة عالية</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Leaf size={40} className="mx-auto text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">طبيعية</h3>
            <p className="text-gray-600 text-sm">منتجات طبيعية بدون مواد حافظة</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Heart size={40} className="mx-auto text-green-600 mb-3" />
            <h3 className="font-bold text-lg mb-2">خدمة ممتازة</h3>
            <p className="text-gray-600 text-sm">خدمة عملاء متوفرة طوال أيام الأسبوع</p>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <Users size={40} className="mx-auto text-green-600 mb-3" />
          <h3 className="font-bold text-xl mb-2">تواصل معنا</h3>
          <p className="text-gray-700">📞 0917117123</p>
          <p className="text-gray-700">✉️ info@malukashop.com</p>
          <p className="text-gray-700">📍 الخرطوم - السودان</p>
        </div>
      </div>
    </div>
  );
}