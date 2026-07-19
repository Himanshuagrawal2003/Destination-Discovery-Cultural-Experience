import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlace, MdAttachMoney, MdBookmark, MdBookmarkBorder, MdHistory,
         MdLightbulb, MdStar, MdAutoAwesome, MdThumbUp, MdReply } from 'react-icons/md';
import { LuBookmark, LuSparkles, LuBookOpen, LuCompass, LuTrash, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import api from '../services/api';
import { selectUser } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import LeafletMap from '../components/common/LeafletMap';

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [destination, setDestination] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [heroBroken, setHeroBroken] = useState(false);

  // AI Storytelling state
  const [aiStory, setAiStory] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  // Reply states
  const [replyComments, setReplyComments] = useState({}); // { [reviewId]: 'reply text' }
  const [destinationEvents, setDestinationEvents] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    if (activeImageIndex === null || !destination?.images) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActiveImageIndex(prev => (prev + 1) % destination.images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex(prev => (prev - 1 + destination.images.length) % destination.images.length);
      } else if (e.key === 'Escape') {
        setActiveImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, destination?.images]);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const destRes = await api.get(`/destinations/${id}`);
        const currentDest = destRes.data.destination;
        setDestination(currentDest);

        // Check if bookmarked
        if (user) {
          const bookmarkRes = await api.get(`/bookmarks/check/${currentDest._id}?itemType=destination`);
          setIsBookmarked(bookmarkRes.data.isBookmarked);
          setBookmarkId(bookmarkRes.data.bookmarkId);
        }

        // Fetch events matching this destination
        const city = currentDest.city || currentDest.name || '';
        try {
          const eventsRes = await api.get(`/events?location.city=${encodeURIComponent(city)}`);
          setDestinationEvents(eventsRes.data.data || []);
        } catch (eventErr) {
          console.warn('Failed to fetch events for destination:', eventErr);
        }
      } catch (err) {
        console.error(err);
        toast.error('Destination not found or network error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id, user]);

  // Reactive reviews loading when destination or reviewsPage changes
  useEffect(() => {
    if (!destination?._id) return;
    const fetchReviews = async () => {
      try {
        const reviewsRes = await api.get(`/reviews/destination/${destination._id}?page=${reviewsPage}&limit=5`);
        setReviews(reviewsRes.data.data || []);
        setReviewsPagination(reviewsRes.data.pagination || null);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    fetchReviews();
  }, [destination?._id, reviewsPage]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error('Please login to bookmark destinations');
      return;
    }
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${bookmarkId}`);
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success('Removed from bookmarks');
      } else {
        const res = await api.post('/bookmarks', {
          itemType: 'destination',
          destinationId: destination._id,
        });
        setIsBookmarked(true);
        setBookmarkId(res.data.bookmark._id);
        toast.success('Saved to bookmarks');
      }
    } catch (err) {
      toast.error('Bookmark toggle failed');
    }
  };

  const handleGenerateStory = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post('/ai/storytelling', {
        destinationName: destination.name,
        country: destination.country,
      });
      setAiStory(res.data.story);
      toast.success('AI Story generated!');
    } catch (err) {
      toast.error('AI storytelling failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDeleteDestination = async () => {
    if (!window.confirm(`Are you sure you want to delete ${destination.name}?`)) return;
    try {
      await api.delete(`/destinations/${destination._id}`);
      toast.success(`${destination.name} deleted successfully`);
      navigate('/destinations');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete destination');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to write reviews');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please add a comment');
      return;
    }
    setIsReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        destinationId: destination._id,
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews((prev) => [res.data.review, ...prev]);
      setReviewTitle('');
      setReviewComment('');
      setRating(5);
      toast.success('Review posted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to post review');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      toast.error('Please login to like reviews');
      return;
    }
    try {
      const res = await api.post(`/reviews/${reviewId}/like`);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, likes: res.data.likesCount ? new Array(res.data.likesCount) : [] }
            : r
        )
      );
    } catch (err) {
      toast.error('Like action failed');
    }
  };

  const handleAddReply = async (e, reviewId) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post replies');
      return;
    }
    const text = replyComments[reviewId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/reviews/${reviewId}/reply`, { comment: text.trim() });
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, replies: res.data.replies } : r))
      );
      setReplyComments((prev) => ({ ...prev, [reviewId]: '' }));
      toast.success('Reply posted');
    } catch (err) {
      toast.error('Reply failed');
    }
  };

  if (isLoading) {
    return (
      <div className="container-cq py-12 space-y-8 animate-pulse">
        <div className="h-96 skeleton w-full" />
        <div className="h-20 skeleton w-2/3" />
        <div className="h-40 skeleton w-full" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container-cq py-24 text-center">
        <h2 className="text-2xl font-bold">Destination Not Found</h2>
        <p className="text-slate-500 mt-2">The requested place doesn't exist or is currently inactive.</p>
        <Link to="/destinations" className="btn btn-primary mt-6 inline-block">Back to Destinations</Link>
      </div>
    );
  }



  return (
    <div className="pb-16 space-y-10">
      {/* ── Hero Poster ── */}
      <section className="relative h-[520px] sm:h-[580px] overflow-hidden bg-slate-950 text-white flex items-end">

        {/* Background Image — full bleed poster */}
        {(() => {
          // Build a smart Unsplash fallback using destination name + city
          const searchTerms = [destination.name, destination.city, destination.country, 'landmark', 'tourism']
            .filter(Boolean).join(',');
          const unsplashFallback = `https://source.unsplash.com/1600x900/?${encodeURIComponent(searchTerms)}`;

          const heroSrc = (!destination.coverImage || heroBroken)
            ? unsplashFallback
            : destination.coverImage;

          return (
            <img
              key={heroSrc}
              src={heroSrc}
              alt={`${destination.name} - ${destination.city}`}
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: 'brightness(0.55)' }}
              onError={() => {
                if (!heroBroken) setHeroBroken(true);
              }}
            />
          );
        })()}

        {/* Strong bottom-up gradient so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Subtle top vignette */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />

        <div className="container-cq max-w-5xl pb-10 relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-3">
            <span className="badge badge-primary bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold capitalize">
              {destination.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight drop-shadow-lg">{destination.name}</h1>
            <p className="text-slate-200 font-medium flex items-center gap-1 drop-shadow">
              <MdPlace className="text-teal-400 text-lg shrink-0" />
              {destination.city}, {destination.country}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2.5 w-full sm:w-auto shrink-0 mt-4 md:mt-0">
            <button
              onClick={() => navigate(`/trip-planner?dest=${encodeURIComponent(destination.name)}`)}
              className="btn whitespace-nowrap bg-white dark:bg-dark-card hover:bg-primary-50 dark:hover:bg-primary-900/30 text-accent rounded-xl border border-primary-200 dark:border-dark-border flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all shadow-sm text-xs w-full sm:w-auto"
            >
              <LuCompass className="text-lg shrink-0" /> Plan Trip
            </button>
            <button
              onClick={handleBookmarkToggle}
              className="btn whitespace-nowrap bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 flex items-center justify-center gap-1.5 font-bold cursor-pointer transition-all w-full sm:w-auto"
            >
              {isBookmarked ? (
                <>
                  <LuBookmark className="text-lg text-accent fill-accent" /> Saved
                </>
              ) : (
                <>
                  <LuBookmark className="text-lg text-white" /> Bookmark
                </>
              )}
            </button>
            <button
              onClick={handleGenerateStory}
              disabled={isAiLoading}
              className="col-span-2 sm:col-span-1 btn whitespace-nowrap bg-accent hover:bg-accent/90 hover:shadow-glow text-white flex items-center justify-center gap-1.5 rounded-xl shadow-md font-bold transition-all w-full sm:w-auto"
            >
              <LuSparkles className="text-lg animate-pulse" />
              {isAiLoading ? 'Storyteller writing...' : 'AI Storyteller'}
            </button>
            {user && (
              <button
                onClick={handleDeleteDestination}
                className="col-span-2 sm:col-span-1 btn whitespace-nowrap bg-rose-600/90 hover:bg-rose-600 hover:shadow-glow text-white flex items-center justify-center gap-1.5 rounded-xl shadow-md font-bold transition-all text-xs cursor-pointer w-full sm:w-auto"
              >
                <LuTrash className="text-lg shrink-0" /> Delete
              </button>
            )}
          </div>
        </div>
      </section>


      <div className="container-cq max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Quick Facts Card (Top on Mobile, Sidebar Top on Desktop) */}
        <div className="lg:col-span-1 lg:col-start-3 lg:row-start-1 h-fit">
          <div className="card p-6 space-y-5 bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border">
            <div className="border-b border-primary-50 dark:border-dark-border pb-3">
              <h3 className="font-bold text-lg text-primary-900 dark:text-white font-display flex items-center gap-2">
                ⚡ Quick Facts
              </h3>
              <p className="text-2xs text-primary-900/60 dark:text-dark-muted font-medium mt-0.5">Essential details for your visit</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Rating fact */}
              <div className="bg-primary-50/50 dark:bg-dark-bg p-3.5 rounded-xl border border-primary-100/30 dark:border-dark-border flex flex-col justify-between">
                <span className="text-[10px] font-bold text-primary-900/50 dark:text-dark-muted uppercase tracking-wider">Rating</span>
                <span className="text-sm font-black text-primary-900 dark:text-white flex items-center gap-1 mt-1">
                  <MdStar className="text-amber-400 text-lg shrink-0" /> {destination.rating?.average || '0.0'} / 5.0
                </span>
              </div>

              {/* Budget fact */}
              <div className="bg-primary-50/50 dark:bg-dark-bg p-3.5 rounded-xl border border-primary-100/30 dark:border-dark-border flex flex-col justify-between">
                <span className="text-[10px] font-bold text-primary-900/50 dark:text-dark-muted uppercase tracking-wider">Budget Level</span>
                <span className="text-sm font-black text-primary-900 dark:text-white capitalize mt-1">
                  💰 {destination.budget?.level || 'Mid-range'}
                </span>
              </div>
            </div>

            {/* Daily range if exists */}
            {destination.budget?.min !== undefined && (
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-3 rounded-xl flex items-center justify-between text-2xs text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Avg Daily Cost:</span>
                <span>₹{destination.budget.min} - ₹{destination.budget.max}</span>
              </div>
            )}

            <div className="space-y-4 pt-1">
              {/* Best Season */}
              {destination.bestSeason && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    ☀️
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-primary-900/50 dark:text-dark-muted uppercase tracking-wider">Best Season to Visit</h4>
                    <p className="text-xs font-bold text-primary-900 dark:text-white mt-0.5 capitalize">{destination.bestSeason.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {destination.openingHours && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    ⏰
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-primary-900/50 dark:text-dark-muted uppercase tracking-wider">Opening Hours</h4>
                    <p className="text-xs font-bold text-primary-900 dark:text-white mt-0.5">{destination.openingHours}</p>
                  </div>
                </div>
              )}

              {/* Entry Fee */}
              {destination.entryFee && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    🎫
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-primary-900/50 dark:text-dark-muted uppercase tracking-wider">Entry Fee</h4>
                    <p className="text-xs font-bold text-primary-900 dark:text-white mt-0.5">
                      {destination.entryFee.amount === 0 ? 'Free Entry' : `₹${destination.entryFee.amount}`} {destination.entryFee.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Left Column (Primary Details - Middle on Mobile, Left on Desktop) */}
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:row-span-3 space-y-8">
          {/* AI Story Output */}
          <AnimatePresence>
            {aiStory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card bg-white dark:bg-dark-card border border-primary-200 dark:border-primary-900/30 p-6 space-y-4 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-2 text-accent font-bold border-b border-primary-100 dark:border-dark-border pb-3 font-display">
                  <LuBookOpen className="text-xl shrink-0" />
                  <h3>Immersive AI Cultural Story</h3>
                </div>
                <div className="text-sm text-primary-900/80 dark:text-slate-200 leading-relaxed whitespace-pre-line prose max-w-none font-medium">
                  {aiStory}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div className="card p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">About the Destination</h2>
            <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line">
              {destination.description}
            </p>

            {destination.history && (
              <div className="space-y-2 pt-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  📜 Ancient History
                </h3>
                <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">{destination.history}</p>
              </div>
            )}

            {destination.culture && (
              <div className="space-y-2 pt-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  ⛩️ Cultural Roots
                </h3>
                <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">{destination.culture}</p>
              </div>
            )}
          </div>

          {/* highlights & Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {destination.highlights?.length > 0 && (
              <div className="card p-6 space-y-3">
                <h3 className="font-bold text-slate-850 dark:text-white flex items-center gap-1 text-teal-650 dark:text-teal-400">
                  ⭐ Cultural Highlights
                </h3>
                <ul className="space-y-2">
                  {destination.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-slate-650 dark:text-slate-350 flex items-start gap-1.5">
                      <span className="text-teal-500 shrink-0">✓</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {destination.travelTips?.length > 0 && (
              <div className="card p-6 space-y-3">
                <h3 className="font-bold text-slate-855 dark:text-white flex items-center gap-1 text-amber-600">
                  <MdLightbulb className="text-lg shrink-0" /> Local Insider Tips
                </h3>
                <ul className="space-y-2">
                  {destination.travelTips.map((t, i) => (
                    <li key={i} className="text-xs text-slate-650 dark:text-slate-350 flex items-start gap-1.5">
                      <span className="text-amber-500 shrink-0">•</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Famous Places */}
          {destination.famousPlacesList?.length > 0 && (
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
                🏰 Famous Places & Palaces
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {destination.famousPlacesList.map((place, i) => (
                  <div key={i} className="bg-primary-50 dark:bg-primary-950/20 p-4 rounded-xl border border-primary-100/60 dark:border-primary-900/10 shadow-sm transition-all hover:-translate-y-1">
                    <h4 className="font-bold text-accent mb-2">{place.name}</h4>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{place.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Gems */}
          {destination.hiddenGemsList?.length > 0 && (
            <div className="card p-6 space-y-4 border-l-4 border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/10">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
                💎 Local Hidden Gems
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {destination.hiddenGemsList.map((gem, i) => (
                  <div key={i} className="bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 shadow-sm transition-all hover:-translate-y-1">
                    <h4 className="font-bold text-amber-600 dark:text-amber-455 mb-2 flex items-center gap-1.5">
                      <MdLightbulb className="text-lg shrink-0 animate-pulse" />
                      {gem.name}
                    </h4>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">{gem.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Famous Foods */}
          {destination.famousFoodsList?.length > 0 && (
            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
                🍲 Famous Local Food
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {destination.famousFoodsList.map((food, i) => (
                  <div key={i} className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/10 shadow-sm transition-all hover:-translate-y-1">
                    <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-start gap-1.5">
                      <span>🍽️</span> <span>{food.name}</span>
                    </h4>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{food.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          {destination.images && destination.images.length > 0 && (
            <div className="card p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
                🖼️ Gallery & Photo Tour
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {destination.images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImageIndex(i)} className="aspect-video sm:aspect-square rounded-2xl overflow-hidden bg-primary-50 relative group cursor-pointer border border-primary-100/50 dark:border-dark-border shadow-sm">
                    <img 
                      src={img} 
                      alt={`${destination.name} gallery ${i+1}`} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Festivals & Events */}
          {destinationEvents && destinationEvents.length > 0 && (
            <div className="card p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 font-display">
                🎉 Upcoming Festivals & Cultural Events
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {destinationEvents.map((event) => (
                  <div key={event._id} className="group flex flex-col bg-primary-50/30 dark:bg-primary-950/10 rounded-2xl overflow-hidden border border-primary-100/60 dark:border-primary-900/10 transition-all hover:-translate-y-1 hover:shadow-sm">
                    <div className="relative h-36 overflow-hidden bg-primary-100/30">
                      {event.coverImage ? (
                        <img 
                          src={event.coverImage} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-900/40 text-xs font-bold">
                          🎉 Event Cover
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 dark:bg-dark-card/95 text-accent font-black text-3xs rounded-md shadow-sm uppercase tracking-wider">
                        {event.type.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs leading-snug group-hover:text-accent transition-colors font-display line-clamp-1">
                          {event.title}
                        </h4>
                        <p className="text-3xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1 font-medium">
                          {event.description}
                        </p>
                      </div>
                      
                      {event.price?.isFree ? (
                        <span className="text-[10px] font-bold text-teal-600">Free Entry</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600">
                          ₹{event.price?.amount || 0}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile-only Location Map (Above Reviews) */}
          <div className="block lg:hidden card overflow-hidden border border-primary-100 dark:border-dark-border">
            <div className="p-4 border-b border-primary-50 dark:border-dark-border bg-white dark:bg-dark-card">
              <h3 className="font-bold text-primary-900 dark:text-white text-sm flex items-center gap-1.5 font-display">
                🗺️ Location Map
              </h3>
            </div>
            <div className="h-64 bg-slate-100 relative">
              <LeafletMap 
                lat={destination.location?.coordinates?.[1]} 
                lng={destination.location?.coordinates?.[0]} 
                popupText={`${destination.name}, ${destination.city}`} 
              />
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-display">User Reviews</h2>

            {/* Review form */}
            <form onSubmit={handleReviewSubmit} className="card p-6 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Write a Review</h3>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-650 dark:text-slate-350">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Review title (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <textarea
                  rows="4"
                  placeholder="Share details of your experience, dress code tips, dining advice, or travel tips..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input h-auto resize-none py-3"
                />
              </div>

              <button
                type="submit"
                disabled={isReviewSubmitting}
                className="btn btn-primary flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isReviewSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Post Review'
                )}
              </button>
            </form>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.user?.avatarUrl || `https://ui-avatars.com/api/?name=${rev.user?.name || 'User'}`}
                          alt={rev.user?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{rev.user?.name}</h4>
                          <p className="text-2xs text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-amber-400 text-sm">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <MdStar key={i} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {rev.title && <h5 className="font-bold text-sm text-slate-850 dark:text-white">{rev.title}</h5>}
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">{rev.comment}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-50 dark:border-slate-800/80 pt-3">
                      <button onClick={() => handleLikeReview(rev._id)} className="flex items-center gap-1 hover:text-teal-600 transition-colors">
                        <MdThumbUp className="text-sm" /> Like ({rev.likes?.length || 0})
                      </button>
                    </div>

                    {/* Replies */}
                    {rev.replies?.length > 0 && (
                      <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-3 mt-4">
                        {rev.replies.map((rep) => (
                          <div key={rep._id} className="flex gap-3">
                            <img
                              src={rep.user?.avatarUrl || `https://ui-avatars.com/api/?name=${rep.user?.name || 'User'}`}
                              alt={rep.user?.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl flex-1 text-xs">
                              <p className="font-bold text-slate-800 dark:text-white">{rep.user?.name}</p>
                              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{rep.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply form */}
                    <form onSubmit={(e) => handleAddReply(e, rev._id)} className="flex gap-2 pl-6 mt-2">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyComments[rev._id] || ''}
                        onChange={(e) => setReplyComments({ ...replyComments, [rev._id]: e.target.value })}
                        className="input flex-1 py-1 px-3 text-xs rounded-lg"
                      />
                      <button type="submit" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                        <MdReply />
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <div className="card p-8 text-center text-slate-500">
                  <p className="text-sm">No reviews yet. Be the first to share your cultural experience!</p>
                </div>
              )}
            </div>

            {/* Reviews Pagination Controls */}
            {reviewsPagination && reviewsPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <button
                  disabled={reviewsPage === 1}
                  onClick={() => setReviewsPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 text-xs font-bold bg-white dark:bg-dark-card border border-primary-200 dark:border-dark-border text-primary-900/70 dark:text-dark-muted rounded-xl hover:bg-primary-50 dark:hover:bg-primary-955/20 disabled:opacity-50 transition-all cursor-pointer select-none"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-primary-900/60 dark:text-dark-muted select-none">
                  Page {reviewsPage} of {reviewsPagination.totalPages}
                </span>
                <button
                  disabled={reviewsPage === reviewsPagination.totalPages}
                  onClick={() => setReviewsPage(prev => Math.min(prev + 1, reviewsPagination.totalPages))}
                  className="px-4 py-2 text-xs font-bold bg-white dark:bg-dark-card border border-primary-200 dark:border-dark-border text-primary-900/70 dark:text-dark-muted rounded-xl hover:bg-primary-50 dark:hover:bg-primary-955/20 disabled:opacity-50 transition-all cursor-pointer select-none"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Interactive Map (Bottom on Mobile, Sidebar Bottom on Desktop) */}
        <div className="hidden lg:block lg:col-span-1 lg:col-start-3 lg:row-start-2 h-fit">
          <div className="card overflow-hidden border border-primary-100 dark:border-dark-border">
            <div className="p-4 border-b border-primary-50 dark:border-dark-border bg-white dark:bg-dark-card">
              <h3 className="font-bold text-primary-900 dark:text-white text-sm flex items-center gap-1.5 font-display">
                🗺️ Location Map
              </h3>
            </div>
            <div className="h-64 bg-slate-100 relative">
              <LeafletMap 
                lat={destination.location?.coordinates?.[1]} 
                lng={destination.location?.coordinates?.[0]} 
                popupText={`${destination.name}, ${destination.city}`} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImageIndex !== null && destination.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImageIndex(null)}
            className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out select-none"
          >
            {/* Close button */}
            <button
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 z-[999999] text-white/75 hover:text-white text-3xl font-bold p-2 transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Left/Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex(prev => (prev - 1 + destination.images.length) % destination.images.length);
              }}
              className="absolute left-4 sm:left-8 z-[999999] text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-3 sm:p-4 rounded-full transition-all cursor-pointer shadow-lg"
            >
              <LuChevronLeft className="text-2xl sm:text-3xl" />
            </button>

            {/* Main image container */}
            <div className="relative max-w-full max-h-[80vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={destination.images[activeImageIndex]}
                alt={`Enlarged gallery view ${activeImageIndex + 1}`}
                className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
              />
              {/* Image indicator */}
              <div className="absolute bottom-[-40px] text-white/75 text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                {activeImageIndex + 1} / {destination.images.length}
              </div>
            </div>

            {/* Right/Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex(prev => (prev + 1) % destination.images.length);
              }}
              className="absolute right-4 sm:right-8 z-[999999] text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-3 sm:p-4 rounded-full transition-all cursor-pointer shadow-lg"
            >
              <LuChevronRight className="text-2xl sm:text-3xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
