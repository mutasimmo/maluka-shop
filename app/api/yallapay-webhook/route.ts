import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================
// Webhook لاستقبال إشعارات الدفع من YallaPay
// ⚠️ هذا الملف موجود ولكن غير نشط حالياً
// سيعمل تلقائياً عند تفعيل YallaPay
// ============================================

// GET endpoint للتحقق من صحة الويب هوك
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'YallaPay webhook endpoint is active',
    enabled: process.env.NEXT_PUBLIC_YALLAPAY_ENABLED === 'true',
    message: 'هذا المسار مخصص لاستقبال إشعارات الدفع من YallaPay'
  });
}

// POST endpoint لاستقبال الإشعارات
export async function POST(request: NextRequest) {
  // التحقق مما إذا كان YallaPay مفعلاً
  if (process.env.NEXT_PUBLIC_YALLAPAY_ENABLED !== 'true') {
    console.log('⚠️ YallaPay webhook received but YallaPay is disabled');
    return NextResponse.json({ received: true, disabled: true });
  }

  try {
    const payload = await request.json();
    console.log('📨 YallaPay webhook received:', payload);

    const { event, data } = payload;

    // معالجة الأحداث المختلفة
    switch (event) {
      case 'payment.successful':
        await handleSuccessfulPayment(data);
        break;
      
      case 'payment.failed':
        await handleFailedPayment(data);
        break;
      
      case 'payment.refunded':
        await handleRefundedPayment(data);
        break;
      
      default:
        console.log(`⚠️ Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// دوال معالجة الأحداث (Event Handlers)
// ============================================

// معالجة الدفع الناجح
async function handleSuccessfulPayment(data: any) {
  const { clientReferenceId, referenceId, amount, paymentMethod } = data;

  console.log(`✅ Processing successful payment for order: ${clientReferenceId}`);

  // تحديث حالة الطلب في قاعدة البيانات
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      yallapay_reference: referenceId,
    })
    .eq('id', clientReferenceId);

  if (error) {
    console.error('❌ Error updating order:', error);
    return;
  }

  // جلب تفاصيل الطلب لإرسال الإشعارات
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', clientReferenceId)
    .single();

  if (order) {
    // إرسال إشعار للتاجر
    await sendNotificationToMerchant(order);
    
    // إرسال تأكيد للعميل
    await sendConfirmationToCustomer(order);
  }

  console.log(`✅ Payment successful for order ${clientReferenceId}`);
}

// معالجة الدفع الفاشل
async function handleFailedPayment(data: any) {
  const { clientReferenceId, referenceId, errorMessage } = data;

  console.log(`❌ Processing failed payment for order: ${clientReferenceId}`);

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      yallapay_reference: referenceId,
    })
    .eq('id', clientReferenceId);

  if (error) {
    console.error('❌ Error updating order status:', error);
  }

  console.log(`❌ Payment failed for order ${clientReferenceId}: ${errorMessage || 'Unknown error'}`);
}

// معالجة استرداد المبلغ
async function handleRefundedPayment(data: any) {
  const { clientReferenceId, referenceId } = data;

  console.log(`🔄 Processing refund for order: ${clientReferenceId}`);

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
    })
    .eq('id', clientReferenceId);

  if (error) {
    console.error('❌ Error updating order status:', error);
  }

  console.log(`🔄 Payment refunded for order ${clientReferenceId}`);
}

// ============================================
// دوال الإشعارات (Notification Functions)
// ============================================

// إرسال إشعار للتاجر
async function sendNotificationToMerchant(order: any) {
  const merchantPhone = process.env.MERCHANT_PHONE || '249123456789';
  
  const message = `
🛍️ طلب جديد - ملوكا شوب

📋 رقم الطلب: ${order.order_number}
👤 العميل: ${order.customer_name}
📞 الهاتف: ${order.customer_phone}
💰 المبلغ: ${order.total_amount} ج.س

✅ تم الدفع بنجاح

📅 التاريخ: ${new Date().toLocaleString('ar')}
  `;

  try {
    // TODO: دمج مع واتساب API أو خدمة SMS
    console.log('📱 Merchant notification:', message);
  } catch (error) {
    console.error('❌ Error sending merchant notification:', error);
  }
}

// إرسال تأكيد للعميل
async function sendConfirmationToCustomer(order: any) {
  const message = `
🛍️ شكراً لتسوقك مع ملوكا شوب

✅ تم تأكيد طلبك رقم: ${order.order_number}
💰 المبلغ: ${order.total_amount} ج.س

🚚 سيتم تجهيز طلبك وشحنه قريباً.

📱 يمكنك تتبع طلبك عبر:
${process.env.NEXT_PUBLIC_APP_URL}/orders

📞 للاستفسار: 0912345678

شكراً لثقتك بنا! 🌟
  `;

  try {
    // TODO: دمج مع واتساب API أو خدمة SMS
    console.log('📱 Customer confirmation:', message);
  } catch (error) {
    console.error('❌ Error sending customer confirmation:', error);
  }
}