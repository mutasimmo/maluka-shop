import { supabase, Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
  ArrowLeft,
  Truck,
  Shield,
  Clock,
  CreditCard,
} from 'lucide-react';

import FeatureIcons from '@/components/FeatureIcons';
import PaymentIcons from '@/components/PaymentIcons';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const features = [
    {
      icon: <Truck size={28} />,
      title: 'توصيل سريع',
      desc: 'توصيل خلال 24 ساعة',
    },
    {
      icon: <Shield size={28} />,
      title: 'جودة مضمونة',
      desc: 'منتجات أصلية 100%',
    },
    {
      icon: <Clock size={28} />,
      title: 'دعم فني',
      desc: 'خدمة عملاء 24/7',
    },
    {
      icon: <CreditCard size={28} />,
      title: 'دفع آمن',
      desc: 'طرق دفع متعددة',
    },
  ];

  return (
    <main className="bg-gray-50">

      {/* HERO */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden px-4">

        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-700 to-green-600" />

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1600')] bg-cover bg-center opacity-10" />

        <div className="relative text-center text-white max-w-3xl">

          <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm mb-4">
            ✨ مرحباً بك ✨
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              ملوكا
            </span>{' '}
            شوب
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-6">
            أفضل المنتجات السودانية الأصيلة
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/products"
              className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold"
            >
              تسوق الآن
            </Link>

            <Link
              href="/about"
              className="bg-white/10 border border-white px-6 py-3 rounded-xl"
            >
              تعرف علينا
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="container-custom section">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">

          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-xl transition"
            >
              <div className="text-green-700 mb-3 flex justify-center">
                {f.icon}
              </div>
              <h3 className="font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}

        </div>

      </section>

      {/* FEATURE ICONS */}
      <section className="container-custom section-sm">
        <FeatureIcons />
      </section>

      {/* PRODUCTS */}
      <section className="container-custom section bg-white">

        <div className="text-center mb-10">

          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            منتجاتنا المميزة
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto">
            أفضل المنتجات المختارة بعناية
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}

        </div>

        <div className="text-center mt-10">

          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            عرض الكل
            <ArrowLeft size={18} />
          </Link>

        </div>

      </section>

      {/* OFFER */}
      <section className="container-custom section">

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-10 text-white text-center">

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            خصم 20% لأول طلب
          </h2>

          <p className="mb-6">
            استخدم كود: <span className="font-bold">MALUKA20</span>
          </p>

          <Link
            href="/products"
            className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold"
          >
            تسوق الآن
          </Link>

        </div>

      </section>

      {/* PAYMENT */}
      <section className="container-custom section-sm text-center">

        <h3 className="text-lg font-semibold mb-4">
          طرق الدفع المتاحة
        </h3>

        <PaymentIcons />

      </section>

    </main>
  );
}