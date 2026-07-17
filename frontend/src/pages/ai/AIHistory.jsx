import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuHistory, LuTrash, LuSparkles } from 'react-icons/lu';
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
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuHistory className="text-accent animate-pulse" /> AI Query History
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Review all past recommendations, itineraries, custom guides, and chatbot prompt logs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary-100 dark:border-dark-border no-scrollbar">
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
                ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
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
            <div key={i} className="h-32 skeleton w-full animate-pulse rounded-2xl" />
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
                className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 space-y-3 flex flex-col md:flex-row md:items-start md:justify-between gap-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-100/50 dark:bg-primary-900/20 text-accent uppercase text-[9px] font-extrabold tracking-wide">
                      {item.type.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-primary-900/40 dark:text-dark-muted font-bold">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary-900 dark:text-white leading-relaxed">
                    💡 Prompt / Input: <span className="text-primary-900/70 dark:text-slate-350 font-semibold italic">"{item.prompt}"</span>
                  </p>
                  <div className="divider border-primary-100 dark:border-dark-border my-2" />
                  <div className="bg-primary-50 dark:bg-primary-950/20 p-4 rounded-xl text-xs text-primary-900/80 dark:text-slate-350 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-line border border-primary-100 dark:border-primary-900/10 font-medium">
                    {item.response?.startsWith('{') || item.response?.startsWith('[') ? (
                      <code>{item.response}</code>
                    ) : (
                      item.response
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl shrink-0 h-fit transition-colors"
                  aria-label="Delete entry"
                >
                  <LuTrash className="text-lg" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/60 dark:text-dark-muted space-y-4 rounded-2xl shadow-sm">
          <span className="text-6xl block animate-float">📜</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Query History</h3>
          <p className="text-xs max-w-xs mx-auto leading-relaxed font-semibold">Your past queries and generated guides will appear here once you interact with our AI features.</p>
        </div>
      )}
    </div>
  );
}
