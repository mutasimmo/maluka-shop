'use client';

import { Clock, CheckCircle, XCircle, Package, Truck, Home } from 'lucide-react';

interface OrderStatusProps {
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered';
  orderNumber?: string;
  createdAt?: string;
}

export default function OrderStatus({ status, orderNumber, createdAt }: OrderStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock size={24} className="text-yellow-500" />,
          title: 'قيد المعالجة',
          description: 'تم استلام طلبك وهو قيد المراجعة',
          color: 'bg-yellow-100 text-yellow-700',
          step: 1,
        };
      case 'paid':
        return {
          icon: <CheckCircle size={24} className="text-green-500" />,
          title: 'تم الدفع',
          description: 'تم تأكيد الدفع، جاري تجهيز الطلب',
          color: 'bg-green-100 text-green-700',
          step: 2,
        };
      case 'shipped':
        return {
          icon: <Truck size={24} className="text-blue-500" />,
          title: 'تم الشحن',
          description: 'تم شحن طلبك وهو في طريقه إليك',
          color: 'bg-blue-100 text-blue-700',
          step: 3,
        };
      case 'delivered':
        return {
          icon: <Home size={24} className="text-purple-500" />,
          title: 'تم التوصيل',
          description: 'تم توصيل طلبك بنجاح',
          color: 'bg-purple-100 text-purple-700',
          step: 4,
        };
      case 'failed':
        return {
          icon: <XCircle size={24} className="text-red-500" />,
          title: 'فشل الدفع',
          description: 'حدث خطأ في عملية الدفع، الرجاء المحاولة مرة أخرى',
          color: 'bg-red-100 text-red-700',
          step: 0,
        };
      case 'refunded':
        return {
          icon: <XCircle size={24} className="text-orange-500" />,
          title: 'تم الاسترجاع',
          description: 'تم استرجاع المبلغ لحسابك',
          color: 'bg-orange-100 text-orange-700',
          step: 0,
        };
      default:
        return {
          icon: <Package size={24} className="text-gray-500" />,
          title: 'تم الاستلام',
          description: 'تم استلام طلبك',
          color: 'bg-gray-100 text-gray-700',
          step: 1,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const steps = [
    { label: 'طلب', icon: Package, step: 1 },
    { label: 'دفع', icon: CheckCircle, step: 2 },
    { label: 'شحن', icon: Truck, step: 3 },
    { label: 'توصيل', icon: Home, step: 4 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        <div className={`p-3 rounded-full ${statusInfo.color}`}>
          {statusInfo.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold">{statusInfo.title}</h3>
          <p className="text-gray-500">{statusInfo.description}</p>
        </div>
      </div>
      
      {/* Order Info */}
      {(orderNumber || createdAt) && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            {orderNumber && (
              <div>
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="font-bold text-lg">{orderNumber}</p>
              </div>
            )}
            {createdAt && (
              <div>
                <p className="text-sm text-gray-500">تاريخ الطلب</p>
                <p className="font-medium">{new Date(createdAt).toLocaleDateString('ar')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Progress Steps */}
      {status !== 'failed' && status !== 'refunded' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">حالة الطلب</p>
          <div className="relative">
            <div className="absolute top-5 right-0 w-full h-0.5 bg-gray-200 z-0" />
            <div 
              className="absolute top-5 right-0 h-0.5 bg-green-500 transition-all duration-500 z-0"
              style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
            />
            <div className="relative z-10 flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.step <= statusInfo.step;
                const isCurrent = step.step === statusInfo.step;
                
                return (
                  <div key={step.label} className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition
                        ${isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                        }
                        ${isCurrent ? 'ring-4 ring-green-200' : ''}
                      `}
                    >
                      <Icon size={20} />
                    </div>
                    <p className={`text-xs mt-2 ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Failed Status Message */}
      {status === 'failed' && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg text-center">
          <p className="text-red-600 mb-2">حدث خطأ في عملية الدفع</p>
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 underline hover:text-red-700"
          >
            حاول مرة أخرى
          </button>
        </div>
      )}
      
      {/* Refunded Status Message */}
      {status === 'refunded' && (
        <div className="mt-4 p-4 bg-orange-50 rounded-lg text-center">
          <p className="text-orange-600">تم استرجاع المبلغ إلى حسابك</p>
        </div>
      )}
    </div>
  );
}