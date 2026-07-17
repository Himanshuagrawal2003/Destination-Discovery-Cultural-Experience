import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuTrash2, LuStar } from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyReviewsList = async () => {
      try {
        const res = await api.get('/reviews/my');
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyReviewsList();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((item) => item._id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">My Written Reviews</h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Review ratings and stories you've written on destination pages.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 skeleton w-full animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((rev) => (
              <motion.div
                key={rev._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 space-y-3 flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl shadow-sm hover:shadow-md transition-all animate-fade-in"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold flex items-center gap-0.5 text-accent">
                      <LuStar className="fill-accent text-accent text-xs" /> <span>{rev.rating || 0}</span>
                    </span>
                    {rev.destination && (
                      <Link to={`/destinations/${rev.destination.slug || rev.destination._id}`} className="text-xs font-bold text-accent hover:underline">
                        Reviewing: {rev.destination.name}
                      </Link>
                    )}
                  </div>
                  {rev.title && <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">{rev.title}</h3>}
                  <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-semibold">{rev.comment}</p>
                </div>

                <button
                  onClick={() => handleDelete(rev._id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl shrink-0 h-fit cursor-pointer transition-colors"
                  aria-label="Delete review"
                >
                  <LuTrash2 className="text-lg" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <span className="text-6xl block animate-float">✍️</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Reviews Written</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed font-semibold">Explore destinations and write reviews to share your local travel experience and tips.</p>
        </div>
      )}
    </div>
  );
}
