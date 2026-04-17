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
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  TrendingDown,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  paidOrders: number;
  todayOrders: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChange: number;
  ordersChange: number;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  reorder_point: number;
  total_sold: number;
  price: number;
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
    lastMonthRevenue: 0,
    revenueChange: 0,
    ordersChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [productsLowStock, setProductsLowStock] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

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

    // جلب المنتجات منخفضة المخزون
    const { data: products } = await supabase
      .from('products')
      .select('*');

    const lowStock = products?.filter(p => p.stock <= (p.reorder_point || 5)) || [];
    setProductsLowStock(lowStock);

    // حساب المنتجات الأكثر مبيعاً
    const topSelling = [...(products || [])]
      .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
      .slice(0, 5);
    setTopProducts(topSelling);

    // جلب عدد العملاء المميزين
    const uniqueCustomers = new Set(orders?.map(o => o.customer_phone));
    
    // حساب الإحصائيات
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalRevenue = 0;
    let pendingOrders = 0;
    let paidOrders = 0;
    let todayOrders = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    let lastMonthOrders = 0;
    const today = new Date().toDateString();

    // إحصائيات الشهرية للرسم البياني
    const monthlyData: Record<string, { revenue: number; orders: number }> = {};
    
    orders?.forEach(order => {
      const orderDate = new Date(order.created_at);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, orders: 0 };
      }
      
      if (order.payment_status === 'paid') {
        totalRevenue += order.total_amount;
        paidOrders++;
        
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          thisMonthRevenue += order.total_amount;
        }
        if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
          lastMonthRevenue += order.total_amount;
        }
        
        monthlyData[monthKey].revenue += order.total_amount;
        monthlyData[monthKey].orders++;
      }
      
      if (order.payment_status === 'pending') pendingOrders++;
      
      if (orderDate.toDateString() === today) todayOrders++;
      if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
        lastMonthOrders++;
      }
    });

    // تحويل البيانات للرسم البياني
    const chartData = Object.entries(monthlyData)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          month: `${year}/${month}`,
          revenue: data.revenue,
          orders: data.orders,
        };
      })
      .slice(-6); // آخر 6 أشهر

    setMonthlySales(chartData);

    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    const ordersChange = lastMonthOrders > 0 
      ? ((orders?.length || 0 - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    setStats({
      totalOrders: orders?.length || 0,
      totalRevenue,
      totalProducts: productsCount || 0,
      totalCustomers: uniqueCustomers.size,
      pendingOrders,
      paidOrders,
      todayOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      ordersChange,
    });

    setRecentOrders(orders?.slice(0, 5) || []);
    setLoading(false);
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
              <div className={`flex items-center gap-1 text-xs mt-2 ${stats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.revenueChange >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{Math.abs(stats.revenueChange).toFixed(1)}% من الشهر الماضي</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
              <div className={`flex items-center gap-1 text-xs mt-2 ${stats.ordersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.ordersChange >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                <span>{Math.abs(stats.ordersChange).toFixed(1)}% من الشهر الماضي</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingBag size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">المنتجات</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalProducts}</p>
              {productsLowStock.length > 0 && (
                <p className="text-xs text-orange-500 mt-2">{productsLowStock.length} منتج منخفض المخزون</p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Package size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">العملاء</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalCustomers}</p>
              <p className="text-xs text-gray-400 mt-2">عميل مسجل</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
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
            <Calendar size={32} className="text-blue-500" />
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

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            الإيرادات الشهرية
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => value ? `${value.toLocaleString()} ج.س` : '0 ج.س'} />
              
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="الإيرادات" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            عدد الطلبات الشهرية
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#3b82f6" name="الطلبات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alert */}
      {productsLowStock.length > 0 && (
        <div className="bg-orange-50 rounded-2xl p-6 mb-8 border border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={24} className="text-orange-500" />
            <h2 className="text-xl font-bold text-orange-700">تنبيه: منتجات منخفضة المخزون</h2>
          </div>
          <div className="grid gap-3">
            {productsLowStock.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded-xl">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-orange-600">المتبقي: {product.stock} قطعة</p>
                </div>
                <Link href="/admin/products" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm">
                  تحديث المخزون
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-yellow-500" />
            الأكثر مبيعاً
          </h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">تم بيع {product.total_sold || 0} قطعة</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">{formatPrice((product.total_sold || 0) * product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status === 'paid' ? 'مدفوع' :
                       order.payment_status === 'pending' ? 'قيد المعالجة' : 'فشل'}
                    </span>
                   </td>
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