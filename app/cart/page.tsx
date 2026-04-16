'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loadCart, saveCart, removeFromCart, updateQuantity, getCartTotal, formatPrice, clearCart } from '@/lib/utils';
import { CartItem } from '@/lib/supabase';  // تغيير المصدر
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCart(loadCart());
    setLoading(false);
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    saveCart(newCart);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    setCart(loadCart());
  };

  const handleQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove(productId);
    } else {
      updateQuantity(productId, newQuantity);
      setCart(loadCart());
    }
  };

  const total = getCartTotal(cart);
  const deliveryFee = total > 0 ? 500 : 0;
  const grandTotal = total + deliveryFee;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-4">سلتك فارغة</h2>
        <p className="text-gray-500 mb-8">أضف بعض المنتجات الرائعة إلى سلتك</p>
        <Link href="/products" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium inline-block">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">سلة التسوق</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <div key={item.product_id} className="flex gap-4 bg-white p-4 rounded-lg shadow mb-4">
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-green-700 font-bold">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => handleQuantity(item.product_id, item.quantity - 1)}
                    className="p-1 rounded-full hover:bg-gray-100 border"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantity(item.product_id, item.quantity + 1)}
                    className="p-1 rounded-full hover:bg-gray-100 border"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="mr-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span>المجموع</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>الشحن</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold mt-2">
              <span>الإجمالي</span>
              <span className="text-green-700">{formatPrice(grandTotal)}</span>
            </div>
          </div>
          
          <Link
            href="/checkout"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium w-full text-center block mt-6 flex items-center justify-center gap-2"
          >
            متابعة الدفع
            <ArrowRight size={18} />
          </Link>
          
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من تفريغ السلة؟')) {
                clearCart();
                setCart([]);
              }
            }}
            className="w-full text-center text-red-500 mt-4 hover:text-red-700 transition"
          >
            تفريغ السلة
          </button>
        </div>
      </div>
    </div>
  );
}