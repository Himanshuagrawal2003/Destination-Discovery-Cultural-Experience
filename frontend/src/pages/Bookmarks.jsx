import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdBookmark, MdDelete, MdPlace, MdStar } from 'react-icons/md';
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
    <div className="space-y-8 min-h-screen pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">My Bookmarks</h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Review saved destinations, hidden gems, and cultural events.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 no-scrollbar">
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
            className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              activeType === type.value
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 skeleton" />
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
                    className="card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-450">
                          <MdBookmark className="text-4xl" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 text-primary-700 dark:text-primary-300 font-bold text-2xs rounded-lg shadow-sm capitalize">
                        {bookmark.itemType.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <h3 className="font-bold text-slate-850 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {name}
                      </h3>
                      {item.city && (
                        <p className="text-2xs text-slate-500 flex items-center gap-0.5 font-medium">
                          <MdPlace className="text-slate-400" /> {item.city}, {item.country}
                        </p>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={(e) => handleDelete(bookmark._id, e)}
                    className="absolute right-3 top-3 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800"
                    aria-label="Remove bookmark"
                  >
                    <MdDelete className="text-base" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-550 space-y-4">
          <span className="text-6xl block">🔖</span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Saved Bookmarks</h3>
          <p className="text-sm max-w-sm mx-auto">Explore destinations, cultural experiences, or local events, and save your favorites here.</p>
        </div>
      )}
    </div>
  );
}
