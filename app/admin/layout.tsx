'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  Tag,
  Star,
  Bell,
  Gift
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    
    const loggedIn = localStorage.getItem('admin_logged_in');
    if (!loggedIn && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', color: 'text-blue-500' },
    { href: '/admin/products', icon: Package, label: 'المنتجات', color: 'text-green-500' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'الطلبات', color: 'text-orange-500' },
    { href: '/admin/customers', icon: Users, label: 'العملاء', color: 'text-purple-500' },
    { href: '/admin/categories', icon: Tag, label: 'التصنيفات', color: 'text-yellow-500' },
    { href: '/admin/coupons', icon: Gift, label: 'الكوبونات', color: 'text-pink-500' },
    { href: '/admin/reviews', icon: Star, label: 'التقييمات', color: 'text-yellow-500' },
    { href: '/admin/reports', icon: BarChart3, label: 'التقارير', color: 'text-blue-500' },
    { href: '/admin/settings/notifications', icon: Bell, label: 'الإشعارات', color: 'text-purple-500' },
    { href: '/admin/settings', icon: Settings, label: 'الإعدادات', color: 'text-gray-500' },
  ];

  if (!isLoggedIn && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" dir="rtl">
      
      {/* القائمة الجانبية (على اليمين في الكود، ولكن في RTL تظهر على اليسار) */}
      <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl flex flex-col justify-between">
        
        {/* Logo */}
        <div>
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🛍️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">ملوكا شوب</h1>
                <p className="text-xs text-gray-400">لوحة التحكم</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : item.color} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="mr-auto w-1 h-5 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>

      </aside>

      {/* المحتوى الرئيسي (على اليسار في الكود، ولكن في RTL يظهر على اليمين) */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}