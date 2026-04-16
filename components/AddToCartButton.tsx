'use client';

import { useState } from 'react';
import { Product } from '@/lib/supabase';  // تغيير المصدر
import { addToCart } from '@/lib/utils';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={product.stock === 0}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-lg font-bold transition ${
        product.stock === 0
          ? 'bg-gray-300 cursor-not-allowed'
          : added
          ? 'bg-green-800'
          : 'bg-green-600 hover:bg-green-700'
      } text-white`}
    >
      {added ? <Check size={22} /> : <ShoppingCart size={22} />}
      {added ? 'تمت إضافة المنتج إلى السلة ✓' : 'أضف إلى السلة'}
    </button>
  );
}