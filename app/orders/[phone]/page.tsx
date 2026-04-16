'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { 
  Package, Clock, CheckCircle, XCircle, 
  Truck, Home, ArrowRight, Phone, Calendar,
  ShoppingBag, CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered';
  created_at: string;
}

export default function OrdersByPhonePage() {
  const params = useParams();
  const router = useRouter();
  const phone = params.phone as string;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [phone]);

  const fetchOrders = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('حدث خطأ في تحميل الطلبات');
      setOrders([]);
    } else {
      setOrders(data || []);
    }
    
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'paid':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'shipped':
        return <Truck size={20} className="text-blue-500" />;
      case 'delivered':
        return <Home size={20} className="text-purple-500" />;
      case 'failed':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <Package size={20} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المعالجة';
      case 'paid': return 'تم الدفع';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      case 'failed': return 'فشل الدفع';
      case 'refunded': return 'تم الاسترجاع';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'الدفع عند الاستلام';
      case 'bankak': return 'بنكك';
      case 'ocash': return 'أوكاش';
      case 'fawry': return 'فوري';
      case 'nile': return 'بنك النيل';
      case 'bank_of_sudan': return 'بنك السودان';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">جاري تحميل طلباتك...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <XCircle size={60} className="mx-auto text-red-500 mb-4" />
        <p className="text-red-500">{error}</p>
        <button onClick={() => router.push('/orders')} className="btn-primary mt-6">
          العودة للبحث
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">طلباتي</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-2">
            <Phone size={16} />
            <span>رقم الهاتف: {phone}</span>
          </div>
        </div>
        <button 
          onClick={() => router.push('/orders')}
          className="text-gray-500 hover:text-green-600 transition flex items-center gap-1"
        >
          بحث آخر
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">عدد الطلبات</p>
            <p className="text-2xl font-bold text-green-700">{orders.length}</p>
          </div>
          <div>
            <p className="text-gray-600">إجمالي المشتريات</p>
            <p className="text-2xl font-bold text-green-700">
              {formatPrice(orders.reduce((sum, order) => sum + order.total_amount, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <Package size={60} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">لا توجد طلبات لهذا الرقم</p>
          <p className="text-gray-400">يمكنك التسوق الآن وإضافة طلبك الأول</p>
          <Link href="/products" className="btn-primary inline-block mt-6">
            تسوق الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">رقم الطلب</p>
                    <p className="font-bold text-lg text-gray-800">{order.order_number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.payment_status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.payment_status)}`}>
                      {getStatusText(order.payment_status)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Order Body */}
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <ShoppingBag size={14} />
                    المنتجات:
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-gray-700">
                          {item.name} 
                          <span className="text-gray-400 text-sm mr-1">× {item.quantity}</span>
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t pt-3">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      التاريخ
                    </p>
                    <p className="text-sm text-gray-700">
                      {new Date(order.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CreditCard size={12} />
                      طريقة الدفع
                    </p>
                    <p className="text-sm text-gray-700">
                      {getPaymentMethodText(order.payment_method)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t mt-3 pt-3 flex justify-between items-center">
                  <span className="text-gray-500">الإجمالي:</span>
                  <span className="text-xl font-bold text-green-700">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
              
              {/* Order Footer */}
              <div className="bg-gray-50 p-3 border-t flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  تم الطلب: {new Date(order.created_at).toLocaleString('ar')}
                </span>
                <Link 
                  href={`/product/${order.items[0]?.product_id || '#'}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  إعادة الطلب
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}