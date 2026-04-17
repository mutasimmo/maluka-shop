// app/product/[id]/page.tsx
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Truck, Shield, Clock } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import ProductReviews from '@/components/ProductReviews';
import SuggestedProducts from '@/components/SuggestedProducts';
import ProductSchema from '@/components/ProductSchema';
import { ProductTabs } from '@/components/product/ProductTabs';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// ✅ SEO: generateMetadata (Server Component)
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'المنتج غير موجود - ملوكا شوب',
      description: 'المنتج الذي تبحث عنه غير متوفر حالياً',
    };
  }

  return {
    title: `${product.name} - ملوكا شوب`,
    description: product.description || `اشتري ${product.name} الأصلي من ملوكا شوب.`,
    openGraph: {
      title: product.name,
      description: product.description || `اشتري ${product.name} من ملوكا شوب`,
      images: product.image_url ? [product.image_url] : [],
      url: `https://maluka-shop.vercel.app/product/${id}`,
      type: 'website',
    },
  };
}

// ✅ صفحة المنتج (Server Component)
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductSchema product={product} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-green-600 transition">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-green-600 transition">المنتجات</Link>
        <span>/</span>
        <span className="text-gray-800">{product.name}</span>
      </div>

      {/* Product Main Section */}
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
        <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              آخر قطعة!
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-sm text-gray-500">(15 تقييم)</span>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description || 'منتج سوداني أصلي بجودة عالية'}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">السعر:</span>
              <span className="text-3xl font-bold text-green-700">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">الكمية المتوفرة:</span>
              <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                {product.stock > 0 ? `${product.stock} قطعة` : 'غير متوفر'}
              </span>
            </div>
          </div>
          <AddToCartButton product={product} />
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center"><Truck size={24} className="mx-auto text-green-600 mb-2" /><p className="text-xs text-gray-600">توصيل سريع</p></div>
            <div className="text-center"><Shield size={24} className="mx-auto text-green-600 mb-2" /><p className="text-xs text-gray-600">جودة مضمونة</p></div>
            <div className="text-center"><Clock size={24} className="mx-auto text-green-600 mb-2" /><p className="text-xs text-gray-600">دعم 24/7</p></div>
          </div>
        </div>
      </div>

      {/* Client Component for Tabs */}
      <ProductTabs product={product} />

      <SuggestedProducts productId={product.id} currentCategory={product.category} limit={4} />
      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}