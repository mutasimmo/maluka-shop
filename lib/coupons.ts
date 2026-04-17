// lib/coupons.ts
import { supabase } from './supabase';

export interface AppliedCoupon {
  code: string;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

// التحقق من صحة الكوبون
export async function validateCoupon(code: string, cartTotal: number, customerPhone?: string): Promise<{
  valid: boolean;
  coupon?: any;
  discount_amount?: number;
  error?: string;
}> {
  // جلب الكوبون من قاعدة البيانات
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return { valid: false, error: 'الكوبون غير صالح' };
  }

  // التحقق من تاريخ الصلاحية
  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) {
    return { valid: false, error: 'الكوبون لم يبدأ بعد' };
  }
  if (coupon.end_date && new Date(coupon.end_date) < now) {
    return { valid: false, error: 'انتهت صلاحية الكوبون' };
  }

  // التحقق من الحد الأدنى للطلب
  if (cartTotal < coupon.min_order_amount) {
    return { valid: false, error: `الطلب يجب أن لا يقل عن ${coupon.min_order_amount} ج.س` };
  }

  // التحقق من عدد الاستخدامات
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: 'تم استخدام هذا الكوبون максимальное количество раз' };
  }

  // حساب قيمة الخصم
  let discount_amount = 0;
  if (coupon.discount_type === 'percentage') {
    discount_amount = (cartTotal * coupon.discount_value) / 100;
    if (coupon.max_discount && discount_amount > coupon.max_discount) {
      discount_amount = coupon.max_discount;
    }
  } else {
    discount_amount = coupon.discount_value;
  }

  return {
    valid: true,
    coupon,
    discount_amount: Math.min(discount_amount, cartTotal),
  };
}

// تطبيق الكوبون على السلة
export function applyCouponToCart(cartTotal: number, discount_amount: number): number {
  return Math.max(0, cartTotal - discount_amount);
}

// تسجيل استخدام الكوبون
export async function recordCouponUsage(couponId: string, orderId: string, customerPhone: string, discount_amount: number) {
  // تحديث عدد استخدامات الكوبون
  await supabase
    .from('coupons')
    .update({ used_count: supabase.rpc('increment', { row_id: couponId }) })
    .eq('id', couponId);

  // تسجيل الاستخدام
  await supabase
    .from('coupon_usage')
    .insert({
      coupon_id: couponId,
      order_id: orderId,
      customer_phone: customerPhone,
      discount_amount,
    });
}