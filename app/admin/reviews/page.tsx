'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Review } from '@/lib/supabase';
import { CheckCircle, XCircle, Star, Trash2, Eye } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setReviews(data);
    setLoading(false);
  };

  const approveReview = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId);

    if (!error) fetchReviews();
  };

  const deleteReview = async (reviewId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (!error) fetchReviews();
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.is_approved;
    if (filter === 'approved') return review.is_approved;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة التقييمات</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: 'الكل', count: reviews.length },
          { value: 'pending', label: 'قيد المراجعة', count: reviews.filter(r => !r.is_approved).length },
          { value: 'approved', label: 'منشور', count: reviews.filter(r => r.is_approved).length },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === tab.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ar')}
                  </span>
                </div>
                <p className="font-medium">{review.customer_name}</p>
                <p className="text-sm text-gray-500">{review.customer_phone}</p>
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
              <div className="flex gap-2">
                {!review.is_approved && (
                  <button
                    onClick={() => approveReview(review.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="نشر التقييم"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
                <button
                  onClick={() => deleteReview(review.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="حذف"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">لا توجد تقييمات</p>
          </div>
        )}
      </div>
    </div>
  );
}