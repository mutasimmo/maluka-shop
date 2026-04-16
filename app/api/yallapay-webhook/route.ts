import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// YallaPay Webhook secret for verification
const WEBHOOK_SECRET = process.env.YALLAPAY_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('x-yallapay-signature');
    
    // Get webhook payload
    const payload = await request.json();
    
    console.log('YallaPay webhook received:', payload);

    const { event, data } = payload;

    // Handle different webhook events
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
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handleSuccessfulPayment(data: any) {
  const { clientReferenceId, referenceId, amount, paymentMethod } = data;

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      yallapay_reference: referenceId,
    })
    .eq('id', clientReferenceId);

  if (error) {
    console.error('Error updating order:', error);
    return;
  }

  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', clientReferenceId)
    .single();

  if (order) {
    // Send notification to merchant (WhatsApp/Email)
    await sendNotificationToMerchant(order);
    
    // Send confirmation to customer (SMS/WhatsApp)
    await sendConfirmationToCustomer(order);
  }

  console.log(`Payment successful for order ${clientReferenceId}`);
}

// Handle failed payment
async function handleFailedPayment(data: any) {
  const { clientReferenceId, referenceId, errorMessage } = data;

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      yallapay_reference: referenceId,
    })
    .eq('id', clientReferenceId);

  if (error) {
    console.error('Error updating order status:', error);
  }

  console.log(`Payment failed for order ${clientReferenceId}: ${errorMessage}`);
}

// Handle refunded payment
async function handleRefundedPayment(data: any) {
  const { clientReferenceId, referenceId } = data;

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
    })
    .eq('id', clientReferenceId);

  if (error) {
    console.error('Error updating order status:', error);
  }

  console.log(`Payment refunded for order ${clientReferenceId}`);
}

// Send notification to merchant
async function sendNotificationToMerchant(order: any) {
  const merchantPhone = process.env.MERCHANT_PHONE || '249123456789';
  
  // WhatsApp notification (using WhatsApp API or similar)
  const message = `
    🛍️ طلب جديد - ملوكا شوب
    
    رقم الطلب: ${order.order_number}
    العميل: ${order.customer_name}
    الهاتف: ${order.customer_phone}
    المبلغ: ${order.total_amount} ج.س
    
    تم الدفع بنجاح ✓
  `;

  try {
    // You can integrate with WhatsApp Business API or SMS service here
    console.log('Sending notification to merchant:', message);
  } catch (error) {
    console.error('Error sending merchant notification:', error);
  }
}

// Send confirmation to customer
async function sendConfirmationToCustomer(order: any) {
  const message = `
    شكراً لتسوقك مع ملوكا شوب 🛍️
    
    رقم طلبك: ${order.order_number}
    المبلغ: ${order.total_amount} ج.س
    
    سيتم تجهيز طلبك وشحنه قريباً.
    يمكنك تتبع طلبك عبر: ${process.env.NEXT_PUBLIC_APP_URL}/orders
  `;

  try {
    // You can integrate with SMS service or WhatsApp API here
    console.log('Sending confirmation to customer:', message);
  } catch (error) {
    console.error('Error sending customer confirmation:', error);
  }
}

// GET endpoint for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Webhook endpoint is active' });
}