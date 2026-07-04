import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdHistory, MdDelete, MdAutoAwesome } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIHistory() {
  const [history, setHistory] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeType) queryParams.set('type', activeType);
        const res = await api.get(`/ai/history?${queryParams.toString()}`);
        setHistory(res.data.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [activeType]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      toast.success('History entry deleted');
    } catch (err) {
      toast.error('Failed to delete history');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdHistory className="text-teal-600" /> AI Query History
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Review all past recommendations, itineraries, custom guides, and chatbot prompt logs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 no-scrollbar">
        {[
          { value: '', label: 'All Queries' },
          { value: 'recommendation', label: 'Recommendations' },
          { value: 'itinerary', label: 'Itineraries' },
          { value: 'budget-planner', label: 'Budgets' },
          { value: 'food-guide', label: 'Food Guides' },
          { value: 'cultural-guide', label: 'Cultural Guides' },
          { value: 'storytelling', label: 'Stories' }
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

      {/* History List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton w-full" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card p-5 space-y-3 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary uppercase text-[10px] font-bold tracking-wider">
                      {item.type.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">
                    💡 Prompt / Input: <span className="text-slate-500 font-medium italic">"{item.prompt}"</span>
                  </p>
                  <div className="divider my-2" />
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-2xs text-slate-550 dark:text-slate-350 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-line border border-slate-100 dark:border-slate-800/80">
                    {item.response?.startsWith('{') || item.response?.startsWith('[') ? (
                      <code>{item.response}</code>
                    ) : (
                      item.response
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl shrink-0 h-fit"
                  aria-label="Delete entry"
                >
                  <MdDelete className="text-xl" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-500 space-y-4">
          <span className="text-6xl block">📜</span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Query History</h3>
          <p className="text-sm max-w-md mx-auto">Your past queries and generated guides will appear here once you interact with our AI features.</p>
        </div>
      )}
    </div>
  );
}
