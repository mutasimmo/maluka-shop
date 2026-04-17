// lib/yallapay.ts
// ⚠️ نظام الدفع الإلكتروني - معطل حالياً
// لتفعيل YallaPay، قم بتغيير NEXT_PUBLIC_YALLAPAY_ENABLED إلى true في .env.local

// ============================================
// التعريفات والواجهات (Types & Interfaces)
// ============================================

export interface YallaPayConfig {
  apiKey: string;
  merchantId: string;
  baseUrl: string;
}

export interface YallaPayPaymentRequest {
  amount: number;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface YallaPayPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  referenceId?: string;
  error?: string;
}

// ============================================
// الإعدادات الأساسية (Configuration)
// ============================================

// تحديد رابط API حسب البيئة (اختبار أو إنتاج)
const YALLAPAY_API_URL = process.env.YALLAPAY_MODE === 'sandbox' 
  ? 'https://sandbox.gateway.yallapaysudan.com/api/v1/gateway'
  : 'https://gateway.yallapaysudan.com/api/v1/gateway';

// الإعدادات الافتراضية
const defaultConfig: YallaPayConfig = {
  apiKey: process.env.YALLAPAY_API_KEY || '',
  merchantId: process.env.YALLAPAY_MERCHANT_ID || '',
  baseUrl: YALLAPAY_API_URL,
};

// ============================================
// دوال التحقق والمساعدة (Helper Functions)
// ============================================

// التحقق مما إذا كان YallaPay مفعلاً
export const isYallaPayEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_YALLAPAY_ENABLED === 'true' 
    && !!process.env.YALLAPAY_API_KEY;
};

// ============================================
// دوال الدفع الأساسية (Payment Functions)
// ============================================

// إنشاء رابط دفع YallaPay
export async function createYallaPayPayment(
  request: YallaPayPaymentRequest,
  config: YallaPayConfig = defaultConfig
): Promise<YallaPayPaymentResponse> {
  // إذا كان YallaPay غير مفعل، نعيد نتيجة وهمية
  if (!isYallaPayEnabled()) {
    console.log('⚠️ YallaPay is disabled. Skipping payment creation.');
    return {
      success: false,
      error: 'الدفع الإلكتروني غير مفعل حالياً. سيتم تفعيله قريباً.',
    };
  }

  try {
    const response = await fetch(`${config.baseUrl}/generatePaymentLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'merchantId': config.merchantId,
      },
      body: JSON.stringify({
        amount: request.amount,
        clientReferenceId: request.orderId,
        description: `طلب رقم ${request.orderNumber}`,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        paymentSuccessfulRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?order=${request.orderNumber}`,
        paymentFailedRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?failed=true`,
        paymentMethods: ['bankak', 'ocash', 'fawry', 'nile', 'bank_of_sudan'],
        commissionPaidByCustomer: false, // false: التاجر يدفع العمولة، true: العميل يدفع
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('YallaPay API error:', data);
      return {
        success: false,
        error: data.message || 'فشل في إنشاء رابط الدفع',
      };
    }

    return {
      success: true,
      paymentUrl: data.paymentUrl,
      referenceId: data.referenceId,
    };
  } catch (error) {
    console.error('YallaPay request error:', error);
    return {
      success: false,
      error: 'حدث خطأ في الاتصال ببوابة الدفع',
    };
  }
}

// التحقق من حالة الدفع
export async function checkPaymentStatus(
  referenceId: string,
  config: YallaPayConfig = defaultConfig
): Promise<{ status: string; amount?: number } | null> {
  if (!isYallaPayEnabled()) {
    return null;
  }

  try {
    const response = await fetch(`${config.baseUrl}/paymentStatus/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'merchantId': config.merchantId,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error checking payment status:', error);
    return null;
  }
}

// استرداد المبلغ (Refund)
export async function refundPayment(
  referenceId: string,
  amount?: number,
  config: YallaPayConfig = defaultConfig
): Promise<boolean> {
  if (!isYallaPayEnabled()) {
    return false;
  }

  try {
    const response = await fetch(`${config.baseUrl}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'merchantId': config.merchantId,
      },
      body: JSON.stringify({
        referenceId,
        amount,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error refunding payment:', error);
    return false;
  }
}

// الحصول على طرق الدفع المتاحة
export async function getPaymentMethods(
  config: YallaPayConfig = defaultConfig
): Promise<string[]> {
  if (!isYallaPayEnabled()) {
    return ['cash'];
  }

  try {
    const response = await fetch(`${config.baseUrl}/paymentMethods`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'merchantId': config.merchantId,
      },
    });

    if (!response.ok) {
      return ['bankak', 'ocash', 'fawry', 'nile', 'bank_of_sudan'];
    }

    const data = await response.json();
    return data.methods || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return ['bankak', 'ocash', 'fawry', 'nile', 'bank_of_sudan'];
  }
}

// التحقق من توقيع Webhook (للتأمين)
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // في التفعيل الفعلي، أضف التحقق حسب وثائق YallaPay
  // هذا مجرد مكان مؤقت
  return true;
}