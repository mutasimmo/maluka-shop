'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadCart, getCartTotal, formatPrice, clearCart, generateOrderNumber } from '@/lib/utils';
import { CartItem } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Truck, CreditCard, Tag, X } from 'lucide-react';
import { sendWhatsAppMessage, getCustomerOrderMessage, getMerchantNewOrderMessage } from '@/lib/whatsapp';
import { validateCoupon, recordCouponUsage } from '@/lib/coupons';
import { isYallaPayEnabled, createYallaPayPayment } from '@/lib/yallapay';

// رقم واتساب التاجر
const MERCHANT_WHATSAPP = '249123456789'; // استبدل برقمك

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

  // كوبونات الخصم
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

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
  const finalTotal = total - discountAmount;

  // دالة تطبيق الكوبون
  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError('');

    const result = await validateCoupon(couponCode, subtotal);
    
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discount_amount || 0);
      setCouponCode('');
    } else {
      setCouponError(result.error || 'كوبون غير صالح');
    }
    
    setCouponLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep(2);

    const orderNumber = generateOrderNumber();
    
    // حساب التكلفة الإجمالية والربح
    let totalCost = 0;
    for (const item of cart) {
      const { data: product } = await supabase
        .from('products')
        .select('cost_price')
        .eq('id', item.product_id)
        .single();
      if (product && product.cost_price) {
        totalCost += product.cost_price * item.quantity;
      }
    }
    const totalProfit = finalTotal - totalCost;
    const profitMargin = finalTotal > 0 ? (totalProfit / finalTotal) * 100 : 0;

    // إنشاء الطلب في قاعدة البيانات
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        items: cart,
        total_amount: finalTotal,
        total_cost: totalCost,
        total_profit: totalProfit,
        profit_margin: profitMargin,
        payment_method: formData.payment_method,
        payment_status: 'pending',
        discount_amount: discountAmount,
        coupon_code: appliedCoupon?.code,
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

    // تسجيل استخدام الكوبون (إذا وجد)
    if (appliedCoupon && order) {
      await recordCouponUsage(appliedCoupon.id, order.id, formData.customer_phone, discountAmount);
    }

    // معالجة الدفع الإلكتروني إذا تم اختياره وكان YallaPay مفعلاً
    const isElectronicPayment = ['card', 'mfs'].includes(formData.payment_method);
    
    if (isElectronicPayment && isYallaPayEnabled()) {
      const paymentResult = await createYallaPayPayment({
        amount: finalTotal,
        orderId: order.id,
        orderNumber: orderNumber,
        customerName: formData.customer_name,
        customerPhone: formData.customer_phone,
      });

      if (paymentResult.success && paymentResult.paymentUrl) {
        clearCart();
        window.location.href = paymentResult.paymentUrl;
        return;
      } else {
        alert(paymentResult.error || 'حدث خطأ في إنشاء رابط الدفع');
        setLoading(false);
        setStep(1);
        return;
      }
    }

    // للدفع عند الاستلام أو إذا كان YallaPay غير مفعل
    clearCart();
    setStep(3);
    
    // إرسال إشعارات واتساب
    if (order) {
      const customerMessage = getCustomerOrderMessage(orderNumber, formData.customer_name, finalTotal);
      const merchantMessage = getMerchantNewOrderMessage(
        orderNumber,
        formData.customer_name,
        formData.customer_phone,
        formData.customer_address,
        cart,
        finalTotal
      );
      sendWhatsAppMessage(formData.customer_phone, customerMessage);
      sendWhatsAppMessage(MERCHANT_WHATSAPP, merchantMessage);
    }
    
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
                  <option value="cash">💵 الدفع عند الاستلام (كاش)</option>
                  <option value="bankak">🏦 بنكك</option>
                  <option value="ocash">📱 أوكاش</option>
                  <option value="fawry">📱 فوري</option>
                  <option value="nile">🏦 بنك النيل</option>
                  <option value="bank_of_sudan">🏦 بنك السودان</option>
                  {isYallaPayEnabled() && (
                    <>
                      <option value="card">💳 بطاقة بنكية (فيزا/ماستركارد)</option>
                      <option value="mfs">📱 محفظة إلكترونية</option>
                    </>
                  )}
                </select>
                
                {!isYallaPayEnabled() && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    ⚠️ الدفع الإلكتروني بالبطاقات سيتم تفعيله قريباً
                  </p>
                )}
              </div>
              
              {/* قسم الكوبون */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-gray-700 mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  كود الخصم
                </label>
                {appliedCoupon ? (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <span className="font-semibold text-green-700">{appliedCoupon.code}</span>
                      <p className="text-xs text-green-600">خصم {discountAmount} ج.س</p>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setDiscountAmount(0);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أدخل كود الخصم"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      {couponLoading ? 'جاري...' : 'تطبيق'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200 font-medium w-full"
              >
                {loading ? 'جاري المعالجة...' : `تأكيد الطلب - ${formatPrice(finalTotal)}`}
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
            {discountAmount > 0 && (
              <div className="flex justify-between py-1 text-green-600">
                <span>الخصم</span>
                <span>- {formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span>الشحن</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold border-t mt-2 pt-2">
              <span>الإجمالي</span>
              <span className="text-green-700">{formatPrice(finalTotal)}</span>
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