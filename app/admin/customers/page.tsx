'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Search, Phone, Mail, MapPin, ShoppingBag, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Customer {
  phone: string;
  name: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: any[];
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (orders) {
      const customersMap = new Map<string, Customer>();
      
      orders.forEach(order => {
        if (!customersMap.has(order.customer_phone)) {
          customersMap.set(order.customer_phone, {
            phone: order.customer_phone,
            name: order.customer_name,
            address: order.customer_address,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.created_at,
            orders: [],
          });
        }
        
        const customer = customersMap.get(order.customer_phone)!;
        customer.totalOrders++;
        if (order.payment_status === 'paid') {
          customer.totalSpent += order.total_amount;
        }
        customer.orders.push(order);
      });
      
      setCustomers(Array.from(customersMap.values()));
    }
    
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">العملاء</h1>
        <p className="text-gray-500 mt-1">إدارة بيانات العملاء</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="بحث باسم العميل أو رقم الهاتف..."
            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.phone} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{customer.name}</h3>
                  <p className="text-sm text-white/80">{customer.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{customer.address || 'لم يحدد'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-gray-600">
                    <ShoppingBag size={16} />
                    <span className="text-sm">الطلبات: {customer.totalOrders}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 font-bold">
                    <DollarSign size={16} />
                    <span>{formatPrice(customer.totalSpent)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedCustomer(customer)}
                className="w-full btn-secondary text-sm"
              >
                عرض التفاصيل
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <p className="text-gray-500">لا يوجد عملاء</p>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">تفاصيل العميل</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">الاسم</p>
                      <p className="font-bold">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">رقم الهاتف</p>
                      <p className="font-bold">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">العنوان</p>
                      <p>{selectedCustomer.address || 'لم يحدد'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">عدد الطلبات</p>
                      <p>{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">إجمالي المشتريات</p>
                      <p className="text-green-600 font-bold">{formatPrice(selectedCustomer.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">آخر طلب</p>
                      <p>{new Date(selectedCustomer.lastOrderDate).toLocaleDateString('ar')}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">جميع الطلبات</p>
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((order) => (
                      <Link key={order.id} href={`/admin/orders`}>
                        <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('ar')}
                              </p>
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-green-600">{formatPrice(order.total_amount)}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.payment_status === 'paid' ? 'مدفوع' : 'قيد المعالجة'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
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