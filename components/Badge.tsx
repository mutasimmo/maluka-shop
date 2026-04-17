'use client';

interface BadgeProps {
  type: 'new' | 'best_seller' | 'sale' | 'limited' | 'free_shipping' | 'quality' | 'trending';
  className?: string;
}

export default function Badge({ type, className = '' }: BadgeProps) {
  const badges = {
    new: {
      text: '🆕 جديد',
      color: 'bg-green-500',
      icon: '🆕',
    },
    best_seller: {
      text: '🔥 الأكثر مبيعاً',
      color: 'bg-red-500',
      icon: '🔥',
    },
    sale: {
      text: '💰 عرض خاص',
      color: 'bg-orange-500',
      icon: '💰',
    },
    limited: {
      text: '⏳ كمية محدودة',
      color: 'bg-yellow-500',
      icon: '⏳',
    },
    free_shipping: {
      text: '🚚 توصيل مجاني',
      color: 'bg-blue-500',
      icon: '🚚',
    },
    quality: {
      text: '✅ جودة عالية',
      color: 'bg-purple-500',
      icon: '✅',
    },
    trending: {
      text: '📈 رائج الآن',
      color: 'bg-pink-500',
      icon: '📈',
    },
  };

  const badge = badges[type];

  return (
    <div className={`absolute top-3 left-3 ${badge.color} text-white text-xs px-2 py-1 rounded-full shadow-md z-10 ${className}`}>
      <span className="flex items-center gap-1">
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    </div>
  );
}