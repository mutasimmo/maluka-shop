'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ArrowRight, TrendingUp, Tag, Sparkles } from 'lucide-react';

interface SuggestedProductsProps {
  productId: string;
  currentCategory?: string;
  limit?: number;
}

export default function SuggestedProducts({ productId, currentCategory, limit = 4 }: SuggestedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/suggested-products?productId=${productId}&limit=${limit}`);
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching suggested products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, [productId, limit]);

  if (loading) {
    return (
      <div className="mt-12">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} className="text-yellow-500" />
          قد يعجبك أيضاً
        </h2>
        <Link href="/products" className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm">
          عرض الكل
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.image_url ? (
                  <Image
  src={product.image_url}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover group-hover:scale-110 transition-transform duration-500"
/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🛍️
                  </div>
                )}
                {/* شارة سبب الاقتراح */}
                {product.purchase_count > 10 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp size={10} />
                    الأكثر مبيعاً
                  </div>
                )}
                {product.category === currentCategory && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Tag size={10} />
                    نفس التصنيف
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-green-600 transition">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                  {product.category || 'منتج سوداني'}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-green-700 font-bold">{formatPrice(product.price)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                  }`}>
                    {product.stock > 0 ? `متوفر ${product.stock}` : 'غير متوفر'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}