// lib/whatsapp.ts
// نظام إشعارات واتساب للمتجر

// رقم واتساب التاجر (ضع رقمك هنا)
const MERCHANT_WHATSAPP = '24917117123'; // استبدل برقمك

// رابط واتساب API (رسمي ومجاني)
const WHATSAPP_API_URL = 'https://api.whatsapp.com/send';

// دالة لتنسيق رقم الهاتف (يجب أن يكون بصيغة دولية)
export const formatPhoneNumber = (phone: string): string => {
  // إزالة أي مسافات أو رموز غير ضرورية
  let cleaned = phone.replace(/\s/g, '').replace(/[^0-9]/g, '');
  
  // إذا بدأ الرقم بـ 0، استبدله بـ 249 (رمز السودان)
  if (cleaned.startsWith('0')) {
    cleaned = '249' + cleaned.substring(1);
  }
  // إذا بدأ الرقم بـ 00249
  else if (cleaned.startsWith('00249')) {
    cleaned = cleaned.substring(2);
  }
  // إذا بدأ الرقم بـ +249
  else if (cleaned.startsWith('249')) {
    cleaned = cleaned;
  }
  
  return cleaned;
};

// دالة لإرسال رسالة واتساب
export const sendWhatsAppMessage = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `${WHATSAPP_API_URL}?phone=${formattedPhone}&text=${encodedMessage}`;
};

// دالة إشعار للعميل عند إنشاء طلب جديد
export const getCustomerOrderMessage = (orderNumber: string, customerName: string, totalAmount: number): string => {
  return `🛍️ *مرحباً ${customerName}*،

شكراً لتسوقك مع *ملوكا شوب* 🎉

📋 *تفاصيل طلبك:*
• رقم الطلب: ${orderNumber}
• المبلغ الإجمالي: ${totalAmount.toLocaleString()} ج.س

✅ *حالة الطلب:* قيد المعالجة

سيتم التواصل معك قريباً لتأكيد الطلب ومتابعة عملية التوصيل.

📞 للاستفسار: 0917117123

نتمنى لك تجربة تسوق ممتعة! 🌟`;
};

// دالة إشعار للتاجر عند طلب جديد
export const getMerchantNewOrderMessage = (
  orderNumber: string, 
  customerName: string, 
  customerPhone: string, 
  customerAddress: string, 
  items: any[], 
  totalAmount: number
): string => {
  let itemsText = '';
  items.forEach((item, index) => {
    itemsText += `\n${index + 1}. ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ج.س`;
  });

  return `🛍️ *طلب جديد - ملوكا شوب* 🚨

📋 *رقم الطلب:* ${orderNumber}
👤 *العميل:* ${customerName}
📞 *الهاتف:* ${customerPhone}
📍 *العنوان:* ${customerAddress}

📦 *المنتجات:*${itemsText}

💰 *الإجمالي:* ${totalAmount.toLocaleString()} ج.س

⏰ *الوقت:* ${new Date().toLocaleString('ar')}

🔗 رابط الطلب: https://maluka-shop.vercel.app/admin/orders

*يرجى متابعة الطلب في أسرع وقت* ⚡`;
};

// دالة إشعار للعميل عند تغيير حالة الطلب
export const getOrderStatusMessage = (
  orderNumber: string,
  customerName: string,
  status: string,
  statusText: string
): string => {
  const statusEmojis: Record<string, string> = {
    pending: '⏳',
    paid: '✅',
    shipped: '🚚',
    delivered: '🏠',
    failed: '❌',
  };

  const statusMessages: Record<string, string> = {
    pending: 'طلبك قيد المعالجة، سنقوم بتجهيزه قريباً',
    paid: 'تم تأكيد الدفع بنجاح، جاري تجهيز طلبك للشحن',
    shipped: 'تم شحن طلبك وهو في طريقه إليك',
    delivered: 'تم توصيل طلبك بنجاح، نأمل أن ينال إعجابك',
    failed: 'حدث خطأ في الدفع، يرجى المحاولة مرة أخرى',
  };

  return `🛍️ *تحديث حالة الطلب - ملوكا شوب* ${statusEmojis[status]}

مرحباً ${customerName}،

📋 *رقم الطلب:* ${orderNumber}
📌 *الحالة:* ${statusText}

${statusMessages[status] || 'تم تحديث حالة طلبك'}

📞 للاستفسار: 0917117123

شكراً لتسوقك معنا! 🌟`;
};

// دالة إشعار للتاجر عند تغيير حالة الطلب (اختياري)
export const getMerchantStatusUpdateMessage = (
  orderNumber: string,
  oldStatus: string,
  newStatus: string,
  updatedBy: string
): string => {
  return `📋 *تحديث حالة الطلب - ملوكا شوب*

رقم الطلب: ${orderNumber}
الحالة السابقة: ${oldStatus}
الحالة الجديدة: ${newStatus}
تم التحديث بواسطة: ${updatedBy}
الوقت: ${new Date().toLocaleString('ar')}`;
};