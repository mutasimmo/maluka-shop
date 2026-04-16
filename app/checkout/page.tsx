'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadCart, getCartTotal, formatPrice, clearCart, generateOrderNumber } from '@/lib/utils';
import { CartItem, OrderInput } from '@/lib/supabase';  // تغيير المصدر
import { supabase } from '@/lib/supabase';
import { CheckCircle, Truck, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    payment_method: 'cash',
  });

  useEffect(() => {
    const cartItems = loadCart();
    if (cartItems.length === 0) {
      router.push('/');
    }
    setCart(cartItems);
  }, [router]);

  const subtotal = getCartTotal(cart);
  const deliveryFee = 500;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep(2);

    const orderNumber = generateOrderNumber();
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        items: cart,
        total_amount: total,
        payment_method: formData.payment_method,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      alert('حدث خطأ في إنشاء الطلب. الرجاء المحاولة مرة أخرى.');
      setLoading(false);
      setStep(1);
      return;
    }

    clearCart();
    setStep(3);
    
    setTimeout(() => {
      router.push(`/success?order=${orderNumber}`);
    }, 3000);
  };

  if (cart.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">إتمام الطلب</h1>
      
      {/* Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span>المعلومات</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span>التأكيد</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span>الدفع</span>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {step === 1 && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">معلومات الشحن</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="09xxxxxxxx"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">العنوان *</label>
                <textarea
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="الولاية - المدينة - الحي - الشارع"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">طريقة الدفع *</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="cash">الدفع عند الاستلام (كاش)</option>
                  <option value="bankak">بنكك</option>
                  <option value="ocash">أوكاش</option>
                  <option value="fawry">فوري</option>
                  <option value="nile">بنك النيل</option>
                  <option value="bank_of_sudan">بنك السودان</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium w-full"
              >
                {loading ? 'جاري المعالجة...' : `تأكيد الطلب - ${formatPrice(total)}`}
              </button>
            </form>
          )}
          
          {step === 2 && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-2">جاري إنشاء طلبك...</h3>
              <p className="text-gray-600">الرجاء الانتظار</p>
            </div>
          )}
          
          {step === 3 && (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <CheckCircle size={60} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">تم إنشاء طلبك بنجاح!</h3>
              <p className="text-gray-600">سيتم تحويلك إلى صفحة التأكيد...</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Truck size={20} />
            طلبك
          </h2>
          <div className="max-h-96 overflow-y-auto mb-4">
            {cart.map((item) => (
              <div key={item.product_id} className="flex justify-between py-2 border-b">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between py-1">
              <span>المجموع الفرعي</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>الشحن</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold border-t mt-2 pt-2">
              <span>الإجمالي</span>
              <span className="text-green-700">{formatPrice(total)}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard size={16} />
              <span>طريقة الدفع: {
                formData.payment_method === 'cash' ? 'الدفع عند الاستلام' :
                formData.payment_method === 'bankak' ? 'بنكك' :
                formData.payment_method === 'ocash' ? 'أوكاش' :
                formData.payment_method === 'fawry' ? 'فوري' :
                formData.payment_method === 'nile' ? 'بنك النيل' : 'بنك السودان'
              }</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}