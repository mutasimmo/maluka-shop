'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  paidOrders: number;
  todayOrders: number;
  thisMonthRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    paidOrders: 0,
    todayOrders: 0,
    thisMonthRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // جلب جميع الطلبات
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // جلب عدد المنتجات
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // جلب عدد العملاء المميزين
    const { data: customers } = await supabase
      .from('orders')
      .select('customer_phone')
      .order('customer_phone');

    const uniqueCustomers = new Set(customers?.map(c => c.customer_phone));
    
    // حساب الإحصائيات
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    let totalRevenue = 0;
    let pendingOrders = 0;
    let paidOrders = 0;
    let todayOrders = 0;
    let thisMonthRevenue = 0;

    orders?.forEach(order => {
      if (order.payment_status === 'paid') {
        totalRevenue += order.total_amount;
        paidOrders++;
      }
      if (order.payment_status === 'pending') pendingOrders++;
      
      const orderDate = new Date(order.created_at);
      if (orderDate.toDateString() === today) todayOrders++;
      if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) {
        if (order.payment_status === 'paid') thisMonthRevenue += order.total_amount;
      }
    });

    setStats({
      totalOrders: orders?.length || 0,
      totalRevenue,
      totalProducts: productsCount || 0,
      totalCustomers: uniqueCustomers.size,
      pendingOrders,
      paidOrders,
      todayOrders,
      thisMonthRevenue,
    });

    setRecentOrders(orders?.slice(0, 5) || []);
    setLoading(false);
  };

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'الإيرادات',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'المنتجات',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'العملاء',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="badge-success flex items-center gap-1"><CheckCircle size={12} /> مدفوع</span>;
      case 'pending':
        return <span className="badge-warning flex items-center gap-1"><Clock size={12} /> قيد المعالجة</span>;
      case 'failed':
        return <span className="badge-danger flex items-center gap-1"><XCircle size={12} /> فشل</span>;
      default:
        return <span className="badge">{status}</span>;
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً بك في لوحة تحكم ملوكا شوب</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-xl`}>
                  <Icon size={24} className={card.textColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-yellow-600 text-sm">طلبات معلقة</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingOrders}</p>
            </div>
            <Clock size={32} className="text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600 text-sm">طلبات مدفوعة</p>
              <p className="text-2xl font-bold text-green-700">{stats.paidOrders}</p>
            </div>
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-600 text-sm">طلبات اليوم</p>
              <p className="text-2xl font-bold text-blue-700">{stats.todayOrders}</p>
            </div>
            <TrendingUp size={32} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-purple-600 text-sm">إيرادات هذا الشهر</p>
              <p className="text-2xl font-bold text-purple-700">{formatPrice(stats.thisMonthRevenue)}</p>
            </div>
            <TrendingUp size={32} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-green-600 hover:text-green-700 flex items-center gap-1">
            عرض الكل
            <Eye size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{order.order_number}</td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatPrice(order.total_amount)}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.payment_status)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {recentOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد طلبات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}