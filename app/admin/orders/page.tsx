'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { 
  Search, Eye, CheckCircle, XCircle, Clock, 
  Truck, Home, Filter, Download
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
  payment_status: string;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', orderId);

    if (!error) {
      alert('تم تحديث حالة الطلب');
      fetchOrders();
      if (selectedOrder) setSelectedOrder(null);
    } else {
      alert('حدث خطأ في تحديث الحالة');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    const icons: Record<string, JSX.Element> = {
      pending: <Clock size={14} className="ml-1" />,
      paid: <CheckCircle size={14} className="ml-1" />,
      shipped: <Truck size={14} className="ml-1" />,
      delivered: <Home size={14} className="ml-1" />,
      failed: <XCircle size={14} className="ml-1" />,
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${styles[status]}`}>
        {icons[status]}
        {status === 'pending' ? 'قيد المعالجة' :
         status === 'paid' ? 'مدفوع' :
         status === 'shipped' ? 'تم الشحن' :
         status === 'delivered' ? 'تم التوصيل' :
         status === 'failed' ? 'فشل' : 'مسترجع'}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.payment_status !== statusFilter) return false;
    if (searchTerm) {
      return order.order_number.includes(searchTerm) ||
             order.customer_name.includes(searchTerm) ||
             order.customer_phone.includes(searchTerm);
    }
    return true;
  });

  const exportToCSV = () => {
    const headers = ['رقم الطلب', 'العميل', 'الهاتف', 'العنوان', 'المبلغ', 'الحالة', 'التاريخ'];
    const rows = filteredOrders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_phone,
      order.customer_address,
      order.total_amount,
      order.payment_status,
      new Date(order.created_at).toLocaleDateString('ar'),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">الطلبات</h1>
          <p className="text-gray-500 mt-1">إدارة طلبات العملاء</p>
        </div>
        <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          تصدير CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث برقم الطلب أو اسم العميل أو الهاتف..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">جميع الطلبات</option>
            <option value="pending">قيد المعالجة</option>
            <option value="paid">مدفوع</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="failed">فشل</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{order.order_number}</td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4">{order.customer_phone}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.payment_status)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد طلبات</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">تفاصيل الطلب</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">رقم الطلب</p>
                    <p className="font-bold">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">التاريخ</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleString('ar')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">العميل</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p>{selectedOrder.customer_phone}</p>
                  <p className="text-gray-600">{selectedOrder.customer_address}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">المنتجات</p>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>الإجمالي</span>
                      <span className="text-green-600">{formatPrice(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">تحديث الحالة</p>
                  <div className="flex gap-2 flex-wrap">
                    {['pending', 'paid', 'shipped', 'delivered', 'failed', 'refunded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                        className={`px-3 py-1 rounded-lg text-sm transition ${
                          selectedOrder.payment_status === status
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status === 'pending' ? 'قيد المعالجة' :
                         status === 'paid' ? 'مدفوع' :
                         status === 'shipped' ? 'تم الشحن' :
                         status === 'delivered' ? 'تم التوصيل' :
                         status === 'failed' ? 'فشل' : 'مسترجع'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}