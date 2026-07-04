import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdPlace, MdAutoAwesome, MdLightbulb } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function HiddenGems() {
  const [gems, setGems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI gem states
  const [aiGems, setAiGems] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCountry, setAiCountry] = useState('');

  useEffect(() => {
    const fetchGems = async () => {
      try {
        const res = await api.get('/hidden-gems');
        setGems(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGems();
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiCountry.trim()) {
      toast.error('Please enter a country or region');
      return;
    }
    setIsAiLoading(true);
    try {
      const res = await api.post('/ai/hidden-gems', {
        country: aiCountry.trim(),
      });
      setAiGems(res.data.gems || []);
      toast.success('AI recommendations ready!');
    } catch (err) {
      toast.error('AI gems recommendations failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="container-cq py-8 space-y-10 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Cultural Hidden Gems</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Discover off-the-beaten-path locations with authentic heritage.</p>
        </div>

        {/* AI Gems Search Trigger */}
        <form onSubmit={handleAskAI} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Ask AI for hidden gems in (Country)..."
            value={aiCountry}
            onChange={(e) => setAiCountry(e.target.value)}
            className="input md:w-64"
          />
          <button type="submit" disabled={isAiLoading} className="btn btn-accent flex items-center gap-1.5 shrink-0">
            <MdAutoAwesome className="text-lg animate-pulse" />
            {isAiLoading ? 'Searching...' : 'AI Find'}
          </button>
        </form>
      </div>

      {/* AI Recommendations Section */}
      {aiGems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MdAutoAwesome className="text-amber-500 animate-bounce" /> AI Insiders recommendations for {aiCountry}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiGems.map((gem, idx) => (
              <div key={idx} className="card p-6 border-l-4 border-amber-500 bg-amber-50/10 dark:bg-amber-900/10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{gem.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-0.5 mt-0.5 font-medium">
                      <MdPlace className="text-slate-400" /> {gem.location}
                    </p>
                  </div>
                  <span className="badge badge-accent bg-amber-100 text-amber-800 text-2xs font-bold rounded-lg capitalize">
                    ⚡ {gem.difficulty || 'Easy'}
                  </span>
                </div>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{gem.whySpecial}</p>
                <div className="text-2xs space-y-1 border-t border-slate-100 dark:border-slate-800/80 pt-2 text-slate-500 dark:text-dark-muted">
                  <p>🚗 <strong>How to get there:</strong> {gem.howToGetThere}</p>
                  <p>🔑 <strong>Insider secret:</strong> {gem.localSecret}</p>
                  <p>💰 <strong>Estimated daily cost:</strong> {gem.estimatedCostPerDay}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
        </div>
      )}

      {/* Database gems list */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Local Insider Picks</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 skeleton" />
            ))}
          </div>
        ) : gems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gems.map((item) => (
              <div key={item._id} className="card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <MdPlace className="text-4xl" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 text-amber-700 dark:text-amber-400 font-bold text-2xs rounded-lg shadow-sm capitalize">
                    {item.difficulty}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-0.5 mt-0.5">
                      <MdPlace className="text-slate-400 shrink-0" />
                      {item.location?.city}, {item.location?.country}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-3 mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {item.travelTips?.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-2xs space-y-1">
                      <p className="font-bold text-amber-600 flex items-center gap-0.5">
                        <MdLightbulb /> Insider Tip:
                      </p>
                      <p className="text-slate-500 dark:text-dark-muted italic">"{item.travelTips[0]}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center text-slate-500 space-y-4">
            <span className="text-6xl block">🗺️</span>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Hidden Gems Found</h3>
            <p className="text-sm max-w-md mx-auto">Be the first to ask the AI assistant above for unique recommendation gems in your region.</p>
          </div>
        )}
      </div>
    </div>
  );
}
