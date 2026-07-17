import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuBookmark, LuTrash2, LuMapPin, LuStar } from 'react-icons/lu';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarksList = async () => {
    setIsLoading(true);
    try {
      const url = activeType ? `/bookmarks?type=${activeType}` : '/bookmarks';
      const res = await api.get(url);
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarksList();
  }, [activeType]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((item) => item._id !== id));
      toast.success('Bookmark removed');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">My Bookmarks</h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Review saved destinations, hidden gems, and cultural events.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary-100 dark:border-dark-border no-scrollbar">
        {[
          { value: '', label: 'All Items' },
          { value: 'destination', label: 'Destinations' },
          { value: 'hidden-gem', label: 'Hidden Gems' },
          { value: 'experience', label: 'Experiences' },
          { value: 'event', label: 'Events' }
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold shrink-0 cursor-pointer transition-all ${
              activeType === type.value
                ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 skeleton animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {bookmarks.map((bookmark) => {
              const item = bookmark.destination || bookmark.experience || bookmark.event || bookmark.hiddenGem;
              if (!item) return null;
              const name = item.name || item.title;
              const img = item.coverImage || item.image;
              const detailsLink = bookmark.destination
                ? `/destinations/${item.slug || item._id}`
                : `/${bookmark.itemType}s`;

              return (
                <motion.div
                  key={bookmark._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative"
                >
                  <Link
                    to={detailsLink}
                    className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl"
                  >
                    <div className="relative h-44 overflow-hidden bg-primary-50">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-900/40">
                          <LuBookmark className="text-4xl" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-dark-card/95 text-accent font-extrabold text-2xs rounded-lg shadow-sm capitalize">
                        {bookmark.itemType.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <h3 className="font-bold text-primary-900 dark:text-white truncate group-hover:text-accent transition-colors font-display text-sm">
                        {name}
                      </h3>
                      {item.city && (
                        <p className="text-2xs text-primary-900/50 dark:text-dark-muted flex items-center gap-1 font-semibold">
                          <LuMapPin className="text-accent" /> {item.city}, {item.country}
                        </p>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={(e) => handleDelete(bookmark._id, e)}
                    className="absolute right-3 top-3 p-2 bg-white/90 dark:bg-dark-card/90 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl shadow-sm border border-primary-100 dark:border-dark-border cursor-pointer transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <LuTrash2 className="text-base" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <span className="text-6xl block animate-float">🔖</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Saved Bookmarks</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed font-semibold">Explore destinations, cultural experiences, or local events, and save your favorites here.</p>
        </div>
      )}
    </div>
  );
}
