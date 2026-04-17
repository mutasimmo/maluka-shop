'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Review } from '@/lib/supabase';
import { Star, StarHalf, Send, User, Calendar, CheckCircle } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // نموذج إضافة تقييم
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    
    // جلب التقييمات المعتمدة فقط
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
      setTotalReviews(data.length);
      
      // حساب متوسط التقييمات
      const sum = data.reduce((acc, rev) => acc + rev.rating, 0);
      setAverageRating(sum / (data.length || 1));
      
      // توزيع التقييمات
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach(rev => {
        distribution[rev.rating]++;
      });
      setRatingDistribution(distribution);
    }
    
    setLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        rating: formData.rating,
        comment: formData.comment,
        is_approved: false, // تحتاج موافقة المدير
      });

    if (!error) {
      setSubmitted(true);
      setFormData({
        customer_name: '',
        customer_phone: '',
        rating: 5,
        comment: '',
      });
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      alert('حدث خطأ في إرسال التقييم');
    }
    
    setSubmitting(false);
  };

  const renderStars = (rating: number, size: number = 18) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">تقييمات العملاء</h2>
      
      {/* Stats Section */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center gap-1 my-2">
              {renderStars(Math.round(averageRating), 24)}
            </div>
            <p className="text-gray-500">بناءً على {totalReviews} تقييم</p>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4 mb-8">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد تقييمات لهذا المنتج حتى الآن
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="font-medium">{review.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(review.rating, 16)}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(review.created_at).toLocaleDateString('ar')}
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-600 mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Add Review Form */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">أضف تقييمك للمنتج</h3>
        
        {submitted ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
            <p className="text-green-600">تم إرسال تقييمك بنجاح! سيتم مراجعته ونشره قريباً.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">الاسم</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">التقييم</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">تعليق (اختياري)</label>
              <textarea
                rows={3}
                className="input-field"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="شارك تجربتك مع المنتج..."
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              <Send size={18} />
              {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}