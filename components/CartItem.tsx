'use client';

import Image from 'next/image';
import { CartItem as CartItemType } from '@/lib/supabase';
import { formatPrice, updateQuantity, removeFromCart } from '@/lib/utils';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface CartItemProps {
  item: CartItemType;
  onUpdate: () => void;
}

export default function CartItem({ item, onUpdate }: CartItemProps) {
  const [loading, setLoading] = useState(false);

  const handleQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }
    setLoading(true);
    updateQuantity(item.product_id, newQuantity);
    onUpdate();
    setLoading(false);
  };

  const handleRemove = () => {
    setLoading(true);
    removeFromCart(item.product_id);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg shadow mb-4">
      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🛍️
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
        <p className="text-green-700 font-bold">{formatPrice(item.price)}</p>
        
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => handleQuantity(item.quantity - 1)}
            disabled={loading}
            className="p-1 rounded-full hover:bg-gray-100 border w-8 h-8 flex items-center justify-center disabled:opacity-50"
          >
            <Minus size={16} />
          </button>
          
          <span className="w-8 text-center font-bold">{item.quantity}</span>
          
          <button
            onClick={() => handleQuantity(item.quantity + 1)}
            disabled={loading}
            className="p-1 rounded-full hover:bg-gray-100 border w-8 h-8 flex items-center justify-center disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
          
          <button
            onClick={handleRemove}
            disabled={loading}
            className="mr-4 text-red-500 hover:text-red-700 transition disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="text-left">
        <p className="font-bold text-lg text-gray-800">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}