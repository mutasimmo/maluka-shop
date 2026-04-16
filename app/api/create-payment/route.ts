import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOrderNumber } from '@/lib/utils';

// YallaPay API configuration
const YALLAPAY_API_URL = 'https://gateway.yallapaysudan.com/api/v1/gateway';
const YALLAPAY_API_KEY = process.env.YALLAPAY_API_KEY || '';
const YALLAPAY_MERCHANT_ID = process.env.YALLAPAY_MERCHANT_ID || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, customer_address, items, total_amount, payment_method } = body;

    // Validate input
    if (!customer_name || !customer_phone || !items || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customer_name,
        customer_phone: customer_phone,
        customer_address: customer_address,
        items: items,
        total_amount: total_amount,
        payment_method: payment_method,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // If payment method is cash on delivery, return success without YallaPay
    if (payment_method === 'cash') {
      return NextResponse.json({
        success: true,
        order: order,
        paymentUrl: null,
        message: 'Order created successfully. Cash on delivery.'
      });
    }

    // Create YallaPay payment
    const paymentResponse = await fetch(`${YALLAPAY_API_URL}/generatePaymentLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YALLAPAY_API_KEY}`,
        'Content-Type': 'application/json',
        'merchantId': YALLAPAY_MERCHANT_ID,
      },
      body: JSON.stringify({
        amount: total_amount,
        clientReferenceId: order.id,
        description: `طلب رقم ${orderNumber}`,
        customerName: customer_name,
        customerPhone: customer_phone,
        paymentSuccessfulRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?order=${orderNumber}`,
        paymentFailedRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?failed=true`,
        paymentMethods: ['bankak', 'ocash', 'fawry', 'nile', 'bank_of_sudan'],
      }),
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('YallaPay error:', paymentData);
      return NextResponse.json({
        success: true,
        order: order,
        paymentUrl: null,
        message: 'Order created. Please complete payment manually.',
      });
    }

    // Update order with YallaPay reference
    await supabase
      .from('orders')
      .update({ yallapay_reference: paymentData.referenceId })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      order: order,
      paymentUrl: paymentData.paymentUrl,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}