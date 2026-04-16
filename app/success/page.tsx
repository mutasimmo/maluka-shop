'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/';
    }
  }, [countdown]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <CheckCircle size={80} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h1>
        <p className="text-gray-600 mb-4">
          شكراً لتسوقك مع ملوكا شوب
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-500 text-sm">رقم الطلب</p>
          <p className="text-xl font-bold text-green-700">{orderNumber}</p>
        </div>
        <p className="text-gray-500 mb-6">
          سيتم التواصل معك قريباً على رقم الهاتف الذي أدخلته لتأكيد الطلب ومتابعة عملية الدفع.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary flex items-center gap-2">
            <Home size={18} />
            الرئيسية
          </Link>
          <Link href="/products" className="btn-secondary flex items-center gap-2">
            <ShoppingBag size={18} />
            متابعة التسوق
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-6">
          سيتم تحويلك تلقائياً خلال {countdown} ثواني...
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-16">جاري التحميل...</div>}>
      <SuccessContent />
    </Suspense>
  );
}