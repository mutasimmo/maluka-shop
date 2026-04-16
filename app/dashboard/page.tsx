'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Calendar,
  Search
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  items: any[];
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  paidOrders: number;
  totalProducts: number;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    paidOrders: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ordersError && ordersData) {
      setOrders(ordersData);
      
      // Calculate stats
      const totalRevenue = ordersData.reduce((sum, order) => 
        order.payment_status === 'paid' ? sum + order.total_amount : sum, 0);
      
      const pendingOrders = ordersData.filter(o => o.payment_status === 'pending').length;
      const paidOrders = ordersData.filter(o => o.payment_status === 'paid').length;
      
      setStats({
        totalOrders: ordersData.length,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders,
        paidOrders: paidOrders,
        totalProducts: 0, // Will fetch separately
      });
    }

    // Fetch products count
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    setStats(prev => ({ ...prev, totalProducts: productsCount || 0 }));
    
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: newStatus })
      .eq('id', orderId);

    if (!error) {
      fetchDashboardData();
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.payment_status !== filter) return false;
    if (searchTerm) {
      return order.order_number.includes(searchTerm) || 
             order.customer_name.includes(searchTerm) ||
             order.customer_phone.includes(searchTerm);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs"><CheckCircle size={12} /> مدفوع</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs"><Clock size={12} /> قيد المعالجة</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs"><XCircle size={12} /> فشل</span>;
      default:
        return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingBag size={40} className="text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <DollarSign size={40} className="text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">طلبات معلقة</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <Clock size={40} className="text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">طلبات مدفوعة</p>
              <p className="text-2xl font-bold text-green-600">{stats.paidOrders}</p>
            </div>
            <CheckCircle size={40} className="text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">المنتجات</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <Package size={40} className="text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold">الطلبات</h2>
            
            <div className="flex gap-3">
              <div className="relative">
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث..."
                  className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">الكل</option>
                <option value="pending">قيد المعالجة</option>
                <option value="paid">مدفوع</option>
                <option value="failed">فشل</option>
              </select>
            </div>
          </div>
        </div>
        
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
                  <td className="px-6 py-4 text-sm font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm">{order.customer_phone}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.payment_status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar')}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={order.payment_status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="pending">قيد المعالجة</option>
                      <option value="paid">مدفوع</option>
                      <option value="failed">فشل</option>
                      <option value="refunded">مسترجع</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد طلبات</p>
          </div>
        )}
      </div>
    </div>
  );
}