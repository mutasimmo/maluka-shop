'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/supabase';
import { formatPrice, addToCart } from '@/lib/utils';
import { ShoppingCart, Check, Star, Eye } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div 
      className="group card card-hover animate-fadeInUp"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-700 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🛍️
            </div>
          )}
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="bg-white text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Eye size={16} />
              عرض المنتج
            </span>
          </div>
          {/* شارة التخفيض (اختياري) */}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              آخر قطعة!
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-5">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-green-600 transition line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        {/* تقييم وهمي */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 mr-1">(12)</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-green-700 font-bold text-2xl">{formatPrice(product.price)}</span>
            {product.stock > 0 ? (
              <p className="text-xs text-gray-400 mt-1">متوفر: {product.stock}</p>
            ) : (
              <p className="text-xs text-red-500 mt-1">غير متوفر</p>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              product.stock === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : added
                ? 'bg-gradient-to-r from-green-700 to-green-800 scale-95'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg transform hover:-translate-y-0.5'
            } text-white font-semibold`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
            {added ? 'تمت الإضافة' : 'أضف للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
}