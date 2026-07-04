import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdClose, MdPlace } from 'react-icons/md';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.get(`/destinations/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(res.data.suggestions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSelect = (slug) => {
    onClose();
    navigate(`/destinations/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/destinations?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 md:p-10">
          {/* Close button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, cities, or countries..."
                className="w-full text-lg sm:text-2xl px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-16"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-slate-400 hover:text-teal-400 transition-colors"
              >
                <MdSearch className="text-2xl sm:text-3xl" />
              </button>
            </form>

            {/* Results */}
            <div className="mt-8 flex-1 overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="grid gap-3">
                  {results.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleSelect(item.slug || item._id)}
                      className="flex items-center gap-4 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl cursor-pointer transition-all"
                    >
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
                          <MdPlace className="text-xl" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        <p className="text-sm text-slate-400">
                          {item.city}, {item.country}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <p className="text-center text-slate-500 py-10">No destinations found matching "{query}"</p>
              ) : (
                <div className="text-slate-500 text-center py-10">
                  <p className="text-lg mb-2">Try searching for popular places:</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['Kyoto', 'Paris', 'Rome', 'Bali', 'Egypt'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-sm border border-slate-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
