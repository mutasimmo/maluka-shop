'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, 
  Calendar, Download, Eye, BarChart3, PieChart,
  ArrowUp, ArrowDown, Star, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: any[];
  lowStockProducts: any[];
  monthlyData: any[];
  dailySales: any[];
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // week, month, year, all
  const [report, setReport] = useState<ReportData>({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
    lowStockProducts: [],
    monthlyData: [],
    dailySales: [],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);

    // جلب جميع الطلبات المدفوعة
    let query = supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid');

    // فلترة حسب التاريخ
    const now = new Date();
    if (dateRange === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      query = query.gte('created_at', monthAgo.toISOString());
    } else if (dateRange === 'year') {
      const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      query = query.gte('created_at', yearAgo.toISOString());
    }

    const { data: orders } = await query;

    // جلب جميع المنتجات
    const { data: products } = await supabase
      .from('products')
      .select('*');

    // حساب الإحصائيات
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    const productSales: Record<string, { name: string, quantity: number, revenue: number, profit: number }> = {};

    orders?.forEach(order => {
      totalRevenue += order.total_amount;
      totalCost += order.total_cost || 0;
      totalProfit += order.total_profit || 0;

      order.items?.forEach((item: any) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].revenue += item.price * item.quantity;
      });
    });

    // ترتيب المنتجات حسب الأكثر مبيعاً
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // المنتجات منخفضة المخزون
    const lowStockProducts = products?.filter(p => p.stock <= (p.reorder_point || 5)) || [];

    setReport({
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      totalOrders: orders?.length || 0,
      avgOrderValue: orders?.length ? totalRevenue / orders.length : 0,
      topProducts,
      lowStockProducts,
      monthlyData: [],
      dailySales: [],
    });

    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ['المنتج', 'الكمية المباعة', 'الإيرادات', 'الربح المتوقع'];
    const rows = report.topProducts.map(p => [
      p.name,
      p.quantity,
      p.revenue,
      (p.revenue * (report.profitMargin / 100)).toFixed(2),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString()}.csv`;
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
          <h1 className="text-3xl font-bold text-gray-800">التقارير والتحليلات</h1>
          <p className="text-gray-500 mt-1">إحصائيات متقدمة للمبيعات والأرباح</p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border rounded-lg"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">آخر 7 أيام</option>
            <option value="month">آخر 30 يوم</option>
            <option value="year">آخر سنة</option>
            <option value="all">كل الوقت</option>
          </select>
          <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            تصدير
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold mt-2">{formatPrice(report.totalRevenue)}</p>
            </div>
            <DollarSign size={32} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">إجمالي الأرباح</p>
              <p className="text-3xl font-bold mt-2">{formatPrice(report.totalProfit)}</p>
            </div>
            <TrendingUp size={32} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">هامش الربح</p>
              <p className="text-3xl font-bold mt-2">{report.profitMargin.toFixed(1)}%</p>
            </div>
            <PieChart size={32} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">متوسط قيمة الطلب</p>
              <p className="text-3xl font-bold mt-2">{formatPrice(report.avgOrderValue)}</p>
            </div>
            <BarChart3 size={32} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            أكثر المنتجات مبيعاً
          </h2>
          <Link href="/admin/products" className="text-green-600 hover:text-green-700">
            إدارة المنتجات →
          </Link>
        </div>

        <div className="space-y-4">
          {report.topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-500">تم بيع {product.quantity} قطعة</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-green-600">{formatPrice(product.revenue)}</p>
                <p className="text-sm text-gray-500">إيرادات</p>
              </div>
            </div>
          ))}
        </div>

        {report.topProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد مبيعات حتى الآن
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {report.lowStockProducts.length > 0 && (
        <div className="bg-orange-50 rounded-2xl p-6 mb-8 border border-orange-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={24} className="text-orange-500" />
            <h2 className="text-xl font-bold text-orange-700">تنبيه: منتجات منخفضة المخزون</h2>
          </div>
          <div className="grid gap-3">
            {report.lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded-xl">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-orange-600">المتبقي: {product.stock} قطعة</p>
                </div>
                <Link href="/admin/products" className="btn-secondary text-sm">
                  تحديث المخزون
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package size={24} className="text-green-600" />
            <h3 className="font-bold">إجمالي الطلبات</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{report.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-2">طلب مكتمل</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={24} className="text-red-600" />
            <h3 className="font-bold">إجمالي التكاليف</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{formatPrice(report.totalCost)}</p>
          <p className="text-sm text-gray-500 mt-2">تكلفة المنتجات</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={24} className="text-blue-600" />
            <h3 className="font-bold">صافي الربح</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{formatPrice(report.totalProfit)}</p>
          <p className="text-sm text-gray-500 mt-2">بعد خصم التكاليف</p>
        </div>
      </div>
    </div>
  );
}