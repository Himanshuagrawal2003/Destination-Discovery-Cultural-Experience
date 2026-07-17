import { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  LuMapPin, 
  LuSparkles, 
  LuBus, 
  LuKey, 
  LuCoins, 
  LuActivity,
  LuBookmark
} from 'react-icons/lu';
import api from '../services/api';
import { selectUser } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function HiddenGems() {
  const user = useSelector(selectUser);
  // AI gem states
  const [aiGems, setAiGems] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCountry, setAiCountry] = useState('');
  const [bookmarkedGems, setBookmarkedGems] = useState({}); // { index: bookmarkId }
  const [savingGem, setSavingGem] = useState(null); // index of gem being saved

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiCountry.trim()) {
      toast.error('Please enter a country or region');
      return;
    }
    setIsAiLoading(true);
    setBookmarkedGems({});
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

  const handleGemBookmark = async (gem, idx) => {
    if (!user) { toast.error('Please login to bookmark'); return; }

    // If already bookmarked, remove it
    if (bookmarkedGems[idx]) {
      try {
        await api.delete(`/bookmarks/${bookmarkedGems[idx]}`);
        setBookmarkedGems(prev => { const n = {...prev}; delete n[idx]; return n; });
        toast.success('Removed from bookmarks');
      } catch { toast.error('Failed to remove bookmark'); }
      return;
    }

    // First save the AI gem to DB as a HiddenGem, then bookmark it
    setSavingGem(idx);
    try {
      // Create HiddenGem in DB
      const gemData = {
        name: gem.name,
        description: gem.whySpecial || gem.description || '',
        difficulty: (gem.difficulty || 'easy').toLowerCase(),
        location: {
          country: aiCountry,
          city: gem.location || '',
        },
        howToGet: gem.howToGetThere || '',
        whyUnique: gem.whySpecial || '',
      };

      const createRes = await api.post('/hidden-gems', gemData);
      const savedGemId = createRes.data.data?._id || createRes.data.hiddenGem?._id;

      if (!savedGemId) {
        toast.error('Could not save hidden gem');
        setSavingGem(null);
        return;
      }

      // Now create a bookmark for it
      const bRes = await api.post('/bookmarks', { itemType: 'hidden-gem', hiddenGemId: savedGemId });
      setBookmarkedGems(prev => ({ ...prev, [idx]: bRes.data.bookmark._id }));
      toast.success('Hidden gem saved to bookmarks!');
    } catch (err) {
      // If the gem already exists, try to find it and bookmark it
      if (err.response?.status === 400 || err.response?.status === 409 || err.response?.status === 500) {
        toast.error('Could not save gem. It may already exist.');
      } else {
        toast.error('Bookmark failed');
      }
    } finally {
      setSavingGem(null);
    }
  };

  return (
    <div className="container-cq py-8 space-y-10 min-h-screen bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-primary-100 dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">Cultural Hidden Gems</h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Discover off-the-beaten-path locations with authentic heritage.</p>
        </div>

        {/* AI Gems Search Trigger */}
        <form onSubmit={handleAskAI} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Ask AI for hidden gems in (Country)..."
            value={aiCountry}
            onChange={(e) => setAiCountry(e.target.value)}
            className="w-full md:w-64 px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
          />
          <button
            type="submit"
            disabled={isAiLoading}
            className="btn bg-accent hover:bg-accent/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 hover:shadow-glow"
          >
            <LuSparkles className="text-lg animate-pulse" />
            {isAiLoading ? 'Searching...' : 'AI Find'}
          </button>
        </form>
      </div>

      {/* AI Recommendations Section */}
      {aiGems.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary-900 dark:text-white flex items-center gap-2 font-display">
            <LuSparkles className="text-accent animate-bounce" /> AI Insider Recommendations for {aiCountry}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiGems.map((gem, idx) => (
              <div key={idx} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 border-l-4 border-l-accent space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-primary-900 dark:text-white font-display">{gem.name}</h3>
                    <p className="text-xs text-primary-900/60 dark:text-dark-muted flex items-center gap-1 mt-1 font-semibold">
                      <LuMapPin className="text-accent" /> {gem.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user && (
                      <button
                        onClick={() => handleGemBookmark(gem, idx)}
                        disabled={savingGem === idx}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 shadow-sm border border-primary-100/50 dark:border-dark-border cursor-pointer hover:scale-110 transition-transform disabled:opacity-50"
                      >
                        <LuBookmark className={`text-sm ${bookmarkedGems[idx] ? 'text-accent fill-accent' : 'text-primary-900/40 dark:text-dark-muted'}`} />
                      </button>
                    )}
                    <span className="px-2.5 py-1 bg-primary-100/50 dark:bg-primary-900/20 text-accent text-[10px] font-extrabold rounded-lg capitalize flex items-center gap-1">
                      <LuActivity className="text-xs" /> {gem.difficulty || 'Easy'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-primary-900/70 dark:text-slate-350 leading-relaxed font-semibold">{gem.whySpecial}</p>
                <div className="text-xs space-y-2 border-t border-primary-100 dark:border-dark-border pt-3 text-primary-900/60 dark:text-dark-muted font-semibold">
                  <p className="flex items-start gap-1.5">
                    <LuBus className="text-accent shrink-0 mt-0.5" /> 
                    <span><strong>How to get there:</strong> {gem.howToGetThere}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <LuKey className="text-accent shrink-0 mt-0.5" /> 
                    <span><strong>Insider secret:</strong> {gem.localSecret}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <LuCoins className="text-accent shrink-0 mt-0.5" /> 
                    <span><strong>Estimated daily cost:</strong> ₹{gem.estimatedCostPerDay}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="divider border-primary-100 dark:border-dark-border" />
        </div>
      )}
    </div>
  );
}
