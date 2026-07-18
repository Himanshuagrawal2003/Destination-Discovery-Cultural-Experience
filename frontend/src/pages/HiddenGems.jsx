import { useState, useEffect } from 'react';
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

// Module-level cache to persist data across SPA navigation.
// Clears automatically when the page is refreshed (F5).
let cachedGems = null;
let cachedCountry = '';
let cachedBookmarkedGems = {};

const defaultFallbackGems = [
  {
    name: "Lonar Crater Lake",
    location: "Maharashtra, India",
    whySpecial: "Formed 52,000 years ago by a meteor impact, it is the only saline soda lake in basaltic rock on Earth, surrounded by ancient temples.",
    howToGetThere: "Fly to Aurangabad, then take a 3-hour taxi or state bus to Lonar town.",
    localSecret: "The water pH varies, and the surrounding temples are built with basalt rock mimicking constellation patterns.",
    estimatedCostPerDay: "1500",
    difficulty: "Moderate"
  },
  {
    name: "Majuli Island",
    location: "Assam, India",
    whySpecial: "The world's largest river island, known for Neo-Vaishnavite culture, traditional mask-making, and unique pottery.",
    howToGetThere: "Travel to Jorhat, then take a ferry from Nimati Ghat to Majuli.",
    localSecret: "Satras hold centuries-old classical dance forms and scripts written on bark.",
    estimatedCostPerDay: "2000",
    difficulty: "Moderate"
  },
  {
    name: "Mawlynnong Village",
    location: "Meghalaya, India",
    whySpecial: "Awarded as the cleanest village in Asia, it showcases community-based eco-tourism and unique Khasi culture.",
    howToGetThere: "Take a taxi from Shillong (approx 90 km via scenic mountain roads).",
    localSecret: "The Jingmaham Living Root Bridge nearby is grown over decades by intertwining roots of Ficus elastica trees.",
    estimatedCostPerDay: "1800",
    difficulty: "Easy"
  },
  {
    name: "Shettihalli Rosary Church",
    location: "Karnataka, India",
    whySpecial: "Built in the 1860s by French missionaries, it gets half-submerged in water during July-October, offering a mystical visual.",
    howToGetThere: "Take a train/bus to Hassan, then hire a local auto or taxi to Shettihalli (22 km).",
    localSecret: "The church stands strong without any mortar or pillars, showing brilliant ancient masonry.",
    estimatedCostPerDay: "1200",
    difficulty: "Easy"
  }
];

export default function HiddenGems() {
  const user = useSelector(selectUser);
  
  // Initialize state from cache if available
  const [aiGems, setAiGems] = useState(cachedGems || []);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCountry, setAiCountry] = useState(cachedCountry || '');
  const [bookmarkedGems, setBookmarkedGems] = useState(cachedBookmarkedGems || {}); 
  const [savingGem, setSavingGem] = useState(null); // index of gem being saved

  useEffect(() => {
    // If cache already exists, don't fetch default gems
    if (cachedGems && cachedGems.length > 0) {
      return;
    }

    const fetchDefaultGems = async () => {
      setIsAiLoading(true);
      try {
        const res = await api.get('/hidden-gems');
        if (res.data?.data && res.data.data.length > 0) {
          // Convert database model to match UI requirements
          const mapped = res.data.data.map(g => ({
            name: g.name,
            location: `${g.location.city ? g.location.city + ', ' : ''}${g.location.country}`,
            whySpecial: g.whyUnique || g.description || '',
            howToGetThere: g.howToGet || '',
            localSecret: g.travelTips?.[0] || 'A sacred and calm place frequented by locals.',
            estimatedCostPerDay: g.rating?.average ? String(g.rating.average * 100) : '1500',
            difficulty: g.difficulty || 'Easy'
          }));
          setAiGems(mapped);
          setAiCountry('Featured');
          cachedGems = mapped;
          cachedCountry = 'Featured';
        } else {
          setAiGems(defaultFallbackGems);
          setAiCountry('Featured');
          cachedGems = defaultFallbackGems;
          cachedCountry = 'Featured';
        }
      } catch (err) {
        console.warn('Failed to fetch DB hidden gems, using fallbacks:', err);
        setAiGems(defaultFallbackGems);
        setAiCountry('Featured');
        cachedGems = defaultFallbackGems;
        cachedCountry = 'Featured';
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchDefaultGems();
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiCountry.trim()) {
      toast.error('Please enter a country or region');
      return;
    }
    setIsAiLoading(true);
    setBookmarkedGems({});
    cachedBookmarkedGems = {};
    try {
      const res = await api.post('/ai/hidden-gems', {
        country: aiCountry.trim(),
      });
      const gems = res.data.gems || [];
      setAiGems(gems);
      cachedGems = gems;
      cachedCountry = aiCountry.trim();
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
        setBookmarkedGems(prev => { 
          const n = {...prev}; 
          delete n[idx]; 
          cachedBookmarkedGems = n;
          return n; 
        });
        toast.success('Removed from bookmarks');
      } catch { toast.error('Failed to remove bookmark'); }
      return;
    }

    // First save the AI gem to DB as a HiddenGem, then bookmark it
    setSavingGem(idx);
    try {
      const countryVal = aiCountry === 'Featured' ? (gem.location.split(',').pop()?.trim() || 'India') : aiCountry;
      const cityVal = gem.location.split(',')[0]?.trim() || gem.location || '';

      // Create HiddenGem in DB
      const gemData = {
        name: gem.name,
        description: gem.whySpecial || gem.description || '',
        difficulty: (gem.difficulty || 'easy').toLowerCase(),
        location: {
          country: countryVal,
          city: cityVal,
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
      setBookmarkedGems(prev => {
        const n = { ...prev, [idx]: bRes.data.bookmark._id };
        cachedBookmarkedGems = n;
        return n;
      });
      toast.success('Hidden gem saved to bookmarks!');
    } catch (err) {
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
            value={aiCountry === 'Featured' ? '' : aiCountry}
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
      {isAiLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : aiGems.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary-900 dark:text-white flex items-center gap-2 font-display">
            <LuSparkles className="text-accent animate-bounce" /> {aiCountry === 'Featured' ? 'Featured Cultural Hidden Gems' : `AI Insider Recommendations for ${aiCountry}`}
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
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
          <span className="text-6xl animate-float">💎</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Hidden Gems Discovered Yet</h3>
          <p className="text-xs max-w-sm font-semibold leading-relaxed">Enter a country or region above to let CultureQuest AI find authentic local treasures.</p>
        </div>
      )}
    </div>
  );
}
