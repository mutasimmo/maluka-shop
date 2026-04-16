import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import { formatPrice } from '@/lib/utils';
import { Star, Truck, Shield, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  // منتجات مقترحة (اختياري)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4);

  return (
    <div className="container mx-auto px-4 py-8">
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
        {/* Image Section */}
        <div className="relative h-96 md:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              🛍️
            </div>
          )}
          {/* Badge */}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              آخر قطعة!
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            {product.name}
          </h1>
          
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-gray-500">(15 تقييم)</span>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description || 'منتج سوداني أصلي بجودة عالية'}
          </p>
          
          {/* Price & Stock */}
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
          
          {/* Add to Cart Button */}
          <AddToCartButton product={product} />
          
          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <Truck size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-xs text-gray-600">توصيل سريع</p>
            </div>
            <div className="text-center">
              <Shield size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-xs text-gray-600">جودة مضمونة</p>
            </div>
            <div className="text-center">
              <Clock size={24} className="mx-auto text-green-600 mb-2" />
              <p className="text-xs text-gray-600">دعم 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
        <div className="border-b px-6">
          <div className="flex gap-8">
            <button className="py-4 text-green-600 border-b-2 border-green-600 font-semibold">
              تفاصيل المنتج
            </button>
            <button className="py-4 text-gray-500 hover:text-gray-700 transition">
              معلومات الشحن
            </button>
            <button className="py-4 text-gray-500 hover:text-gray-700 transition">
              سياسة الاسترجاع
            </button>
          </div>
        </div>
        <div className="p-6">
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
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            منتجات مشابهة
            <ArrowRight size={20} />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-40 bg-gray-100">
                    {relatedProduct.image_url ? (
                      <Image
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{relatedProduct.name}</h3>
                    <p className="text-green-700 font-bold mt-1">{formatPrice(relatedProduct.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}