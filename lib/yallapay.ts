// YallaPay integration library

export interface YallaPayConfig {
  apiKey: string;
  merchantId: string;
  baseUrl: string;
}

export interface PaymentRequest {
  amount: number;
  clientReferenceId: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentSuccessfulRedirectUrl: string;
  paymentFailedRedirectUrl: string;
  paymentMethods?: string[];
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  referenceId?: string;
  error?: string;
}

// Default configuration
const defaultConfig: YallaPayConfig = {
  apiKey: process.env.YALLAPAY_API_KEY || '',
  merchantId: process.env.YALLAPAY_MERCHANT_ID || '',
  baseUrl: 'https://gateway.yallapaysudan.com/api/v1/gateway',
};

// Create a payment link
export async function createPaymentLink(
  request: PaymentRequest,
  config: YallaPayConfig = defaultConfig
): Promise<PaymentResponse> {
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
        clientReferenceId: request.clientReferenceId,
        description: request.description,
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        customerEmail: request.customerEmail,
        paymentSuccessfulRedirectUrl: request.paymentSuccessfulRedirectUrl,
        paymentFailedRedirectUrl: request.paymentFailedRedirectUrl,
        paymentMethods: request.paymentMethods || ['bankak', 'ocash', 'fawry', 'nile', 'bank_of_sudan'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('YallaPay API error:', data);
      return {
        success: false,
        error: data.message || 'Payment creation failed',
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
      error: 'Network error occurred',
    };
  }
}

// Check payment status
export async function checkPaymentStatus(
  referenceId: string,
  config: YallaPayConfig = defaultConfig
): Promise<{ status: string; amount?: number } | null> {
  try {
    const response = await fetch(`${config.baseUrl}/paymentStatus/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'merchantId': config.merchantId,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      status: data.status,
      amount: data.amount,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return null;
  }
}

// Refund a payment
export async function refundPayment(
  referenceId: string,
  amount?: number,
  config: YallaPayConfig = defaultConfig
): Promise<boolean> {
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
        amount: amount,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error refunding payment:', error);
    return false;
  }
}

// Get available payment methods
export async function getPaymentMethods(
  config: YallaPayConfig = defaultConfig
): Promise<string[]> {
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

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implement signature verification based on YallaPay documentation
  // This is a placeholder
  return true;
}