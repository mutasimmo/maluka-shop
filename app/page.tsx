import { supabase, Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowLeft, Star, Truck, Shield, Clock, CreditCard } from 'lucide-react';

export default async function HomePage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const features = [
    { icon: <Truck size={32} />, title: 'توصيل سريع', desc: 'توصيل خلال 24 ساعة' },
    { icon: <Shield size={32} />, title: 'جودة مضمونة', desc: 'منتجات أصلية 100%' },
    { icon: <Clock size={32} />, title: 'دعم فني', desc: 'خدمة عملاء 24/7' },
    { icon: <CreditCard size={32} />, title: 'دفع آمن', desc: 'طرق دفع متعددة' },
  ];

  return (
    <main>
      {/* Hero Section محسن */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-700 to-green-600">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1600')] bg-cover bg-center opacity-10"></div>
        </div>
        
        {/* أنيميشن دوائر */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 text-center text-white px-4 animate-fadeInUp">
          <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4">
            ✨ مرحباً بك في متجرنا ✨
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-shadow-lg">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              ملوكا
            </span>
            <span> شوب</span>
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-white/90 max-w-2xl mx-auto">
            أفضل المنتجات السودانية الأصيلة بجودة عالية وأسعار منافسة
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className="btn-primary text-lg">
              تسوق الآن
            </Link>
            <Link href="/about" className="btn-outline bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-green-700">
              معرفة المزيد
            </Link>
          </div>
        </div>
      </section>

      {/* مميزات المتجر */}
      <section className="container-custom py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-700">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* منتجات مميزة */}
      <section className="container-custom py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm mb-3">
            ⭐ تشكيلتنا المميزة ⭐
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-3">منتجاتنا المميزة</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            اكتشف أفضل ما نقدمه من منتجات سودانية أصيلة بجودة عالية وأسعار مميزة
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            عرض جميع المنتجات
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>

      {/* قسم العروض */}
      <section className="container-custom py-16">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 text-white text-center md:text-right">
              <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4">
                🎉 عرض خاص 🎉
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                خصم 20% على أول طلب
              </h2>
              <p className="text-white/90 mb-6">
                استخدم كود الخصم: <span className="font-mono bg-white/20 px-3 py-1 rounded-lg">MALUKA20</span>
              </p>
              <Link href="/products" className="inline-block bg-white text-green-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                تسوق الآن
              </Link>
            </div>
            <div className="relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-l from-green-700 to-transparent"></div>
              <div className="w-full h-full flex items-center justify-center text-8xl md:text-9xl">
                🎁
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}