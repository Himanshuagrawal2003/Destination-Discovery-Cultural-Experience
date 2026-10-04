import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSparkles, LuCalendar, LuCompass, LuClock, LuCoins,
  LuMapPin, LuSun, LuMoon, LuSave, LuCheck, LuSunset,
  LuChevronLeft, LuChevronRight
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Helpers 
const formatCost = (cost) => {
  if (!cost || String(cost).trim() === '' || String(cost).toUpperCase() === 'N/A' || String(cost).toLowerCase() === 'null') return 'Free / Included';
  if (String(cost).toLowerCase() === 'free') return 'Free';
  let c = String(cost).replace(/₹\s*₹/g, '₹').replace(/\$/g, '₹').replace(/usd/gi, 'INR');
  if (!c.includes('₹') && !c.toLowerCase().includes('inr') && !c.toLowerCase().includes('rs') && !c.toLowerCase().includes('free')) c = `₹${c}`;
  if (!c.toLowerCase().includes('avg') && !c.toLowerCase().includes('approx') && !c.toLowerCase().includes('free')) c = `Avg. ${c}`;
  return c;
};

const parseCost = (s) => { if (!s) return 0; if (typeof s === 'number') return s; return parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0; };

const normalizeSection = (d) => {
  if (!d) return [];
  if (typeof d === 'string' && d.trim()) return [{ title: 'Activity', description: d.trim(), duration: '', cost: '', address: '' }];
  if (Array.isArray(d)) return d.map(i => ({ title: i.title || i.name || 'Activity', description: i.description || i.dish || '', duration: i.duration || '', cost: i.cost || i.price || '', address: i.address || i.location || '' }));
  if (typeof d === 'object' && (d.name || d.title)) return [{ title: d.title || d.name, description: d.description || '', duration: d.duration || '', cost: d.cost || d.price || '', address: d.address || d.location || '' }];
  return [];
};

// Section Block 
const SECTION_STYLES = {
  morning: { icon: LuSun, label: 'Morning', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-400' },
  afternoon: { icon: LuSunset, label: 'Afternoon', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-400' },
  evening: { icon: LuMoon, label: 'Evening', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-400' },
};

function SectionBlock({ name, rawData }) {
  const items = normalizeSection(rawData);
  if (!items.length) return null;
  const style = SECTION_STYLES[name] || SECTION_STYLES.morning;
  const Icon = style.icon;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border w-fit ${style.bg} ${style.border}`}>
        <Icon className={`${style.color} text-sm shrink-0`} />
        <span className={`text-xs font-black uppercase tracking-wider ${style.color}`}>{style.label}</span> </div>
      <div className="space-y-3 pl-1">
        {items.map((item, idx) => (
          <div key={idx} className="relative pl-5">
            <span className={`absolute left-0 top-2.5 w-2 h-2 rounded-full ${style.dot} shrink-0`} />
            <div className="bg-white dark:bg-dark-bg border border-primary-100 dark:border-dark-border p-4 rounded-xl space-y-2 shadow-sm hover:shadow-md transition-all group">
              <h5 className="font-bold text-sm text-primary-900 dark:text-white font-display group-hover:text-accent transition-colors">{item.title}</h5>
              {item.description && <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{item.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-primary-900/40 dark:text-dark-muted/60 font-bold pt-1 border-t border-primary-50 dark:border-dark-border">
                {item.duration && <span className="flex items-center gap-1"><LuClock className="shrink-0" /> {item.duration}</span>}
                {item.cost && <span className="flex items-center gap-1 text-accent"><LuCoins className="shrink-0" /> {formatCost(item.cost)}</span>}
                {item.address && <span className="flex items-center gap-1"><LuMapPin className="shrink-0" /> {item.address}</span>}
              </div> </div> </div>
        ))}
      </div> </div>
  );
}

// Main Component 
export default function AIItinerary() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [formMeta, setFormMeta] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { destination: '', days: 3, interests: '', budget: 'mid-range', travelStyle: 'solo' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setItinerary(null);
    setIsSaved(false);
    try {
      const interestsArray = data.interests ? data.interests.split(',').map(i => i.trim()) : [];
      const res = await api.post('/ai/itinerary', { ...data, interests: interestsArray });
      let itineraryData = res.data.itinerary;
      if (itineraryData && !Array.isArray(itineraryData)) {
        if (itineraryData.rawText) {
          try {
            const cleaned = itineraryData.rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const s = cleaned.indexOf('['), e = cleaned.lastIndexOf(']');
            itineraryData = JSON.parse(s > -1 && e > s ? cleaned.substring(s, e + 1) : cleaned);
          } catch { itineraryData = []; toast.error('Failed to parse itinerary.'); }
        } else { itineraryData = []; }
      }
      setItinerary(Array.isArray(itineraryData) ? itineraryData : []);
      setFormMeta({ ...data });
      setActiveDay(1);
      toast.success('Itinerary ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate itinerary');
    } finally { setIsLoading(false); }
  };

  const handleSaveTrip = async () => {
    if (!itinerary || !formMeta) return;
    if (!localStorage.getItem('cq_token')) { toast.error('Please login to save your trip'); navigate('/login'); return; }
    setIsSaving(true);
    try {
      const tripItinerary = itinerary.map((day, i) => {
        const dayNum = day.dayNumber || day.day || (i + 1);
        const activities = [];
        const extract = (sectionData, time, type) => {
          normalizeSection(sectionData).forEach(item => activities.push({
            time, title: item.title || 'Activity', description: item.description || '',
            type, location: item.address || '', cost: parseCost(item.cost),
            notes: item.duration ? `Duration: ${item.duration}` : '',
          }));
        };
        extract(day.morning, 'Morning', 'sightseeing');
        extract(day.afternoon, 'Afternoon', 'activity');
        extract(day.evening, 'Evening', 'food');
        return { day: dayNum, title: day.theme || `Day ${dayNum}`, activities, notes: day.summary?.proTips || '' };
      });
      const res = await api.post('/trips', {
        name: `${formMeta.destination} - ${formMeta.days} Day Trip`,
        destinationName: formMeta.destination,
        days: parseInt(formMeta.days) || 3,
        travelStyle: formMeta.travelStyle || 'solo',
        itinerary: tripItinerary,
        isAIGenerated: true, status: 'planning',
        notes: `AI-generated for ${formMeta.destination}. Budget: ${formMeta.budget}.`,
      });
      setIsSaved(true);
      toast.success('Trip saved! ');
      setTimeout(() => navigate(res.data?.data?.trip?._id ? `/trip-planner/${res.data.data.trip._id}` : '/my-trips'), 1000);
    } catch (err) { toast.error(err.message || 'Failed to save trip'); }
    finally { setIsSaving(false); }
  };

  const currentDayData = itinerary?.find((d, i) => (d.dayNumber || d.day || i + 1) === activeDay);
  const totalDays = itinerary?.length || 0;

  const goNext = () => activeDay < totalDays && setActiveDay(d => d + 1);
  const goPrev = () => activeDay > 1 && setActiveDay(d => d - 1);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display flex items-center gap-2 tracking-tight">
          <LuSparkles className="text-accent animate-pulse shrink-0 text-lg sm:text-2xl" /> 
          <span>AI Trip Itinerary Planner</span>
        </h1>
        <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
          Generate complete day-by-day schedules with morning, afternoon & evening activities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Itinerary Builder</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Destination *</label>
            <input type="text" placeholder="e.g. Paris, France"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('destination', { required: 'Destination is required' })} />
            {errors.destination && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destination.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Days</label>
              <input type="number" min="1" max="10"
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                {...register('days')} /> </div>
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Budget</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('budget')}>
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-range</option>
                <option value="luxury">Luxury</option> </select> </div> </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Style</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('travelStyle')}>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option> </select> </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Interests (comma separated)</label>
            <input type="text" placeholder="e.g. food, monuments, art"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('interests')} /> </div>

          <button type="submit" disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LuSparkles /> Create Itinerary</>}
          </button> </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-16 skeleton animate-pulse rounded-2xl" />
              {[1, 2].map(i => <div key={i} className="h-48 skeleton animate-pulse rounded-2xl" />)}
            </div>
          ) : itinerary ? (
            <AnimatePresence mode="wait">
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">

                {/* Save bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-accent/10 to-primary-100/50 dark:from-accent/5 dark:to-primary-900/20 border border-accent/20 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <LuSparkles className="text-accent text-lg shrink-0" />
                    <p className="text-sm font-bold text-primary-900 dark:text-white">
                      {isSaved ? 'Trip saved to your dashboard! ' : 'Your itinerary is ready  save it as a trip!'}
                    </p> </div>
                  <button onClick={handleSaveTrip} disabled={isSaving || isSaved}
                    className={`btn font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-70 ${isSaved ? 'bg-green-500 text-white' : 'bg-accent hover:bg-accent/90 text-white hover:shadow-glow'}`}>
                    {isSaving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                      : isSaved ? <><LuCheck /> Saved!</>
                      : <><LuSave /> Save as Trip</>}
                  </button> </div>

                {/* Day navigation */}
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button onClick={goPrev} disabled={activeDay <= 1}
                      className="shrink-0 p-2 rounded-xl border border-primary-200 dark:border-dark-border text-primary-900/50 dark:text-dark-muted hover:text-accent hover:border-accent transition-all disabled:opacity-30 cursor-pointer">
                      <LuChevronLeft /> </button>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                      {itinerary.map((day, i) => {
                        const dn = day.dayNumber || day.day || (i + 1);
                        return (
                          <button key={i} onClick={() => setActiveDay(dn)}
                            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeDay === dn ? 'bg-accent text-white shadow-md' : 'bg-primary-50 dark:bg-primary-950/20 text-primary-900/70 dark:text-dark-muted hover:bg-primary-100 dark:hover:bg-primary-900/20'}`}>
                            Day {dn}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={goNext} disabled={activeDay >= totalDays}
                      className="shrink-0 p-2 rounded-xl border border-primary-200 dark:border-dark-border text-primary-900/50 dark:text-dark-muted hover:text-accent hover:border-accent transition-all disabled:opacity-30 cursor-pointer">
                      <LuChevronRight /> </button> </div> </div>

                {/* Day content */}
                {currentDayData && (
                  <motion.div key={activeDay} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                    className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">

                    {/* Day header */}
                    <div className="px-6 py-4 border-b border-primary-50 dark:border-dark-border bg-gradient-to-r from-accent/5 to-transparent flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-extrabold text-sm font-display shrink-0">
                        {activeDay}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-primary-900 dark:text-white font-display text-base">
                          {currentDayData.theme || `Day ${activeDay}  Exploration`}
                        </h3>
                        <p className="text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold uppercase tracking-wider">
                          {formMeta?.destination}  Day {activeDay} of {totalDays}
                        </p> </div> </div>

                    {/* Sections */}
                    <div className="p-6 space-y-6">
                      <SectionBlock name="morning" rawData={currentDayData.morning} />
                      <SectionBlock name="afternoon" rawData={currentDayData.afternoon} />
                      <SectionBlock name="evening" rawData={currentDayData.evening} />

                      {/* Summary */}
                      {currentDayData.summary && (
                        <div className="bg-primary-50/70 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/20 p-4 rounded-xl space-y-2">
                          <p className="font-bold text-accent flex items-center gap-1 text-xs font-display">
                            <LuSparkles /> Day Summary & Pro Tips
                          </p>
                          <div className="text-xs text-primary-900/70 dark:text-dark-muted space-y-1.5 font-semibold">
                            {currentDayData.summary.estimatedDailyCost && <p> <strong>Avg. Daily Cost:</strong> {formatCost(currentDayData.summary.estimatedDailyCost)}</p>}
                            {currentDayData.summary.distanceCovered && <p> <strong>Distance:</strong> {currentDayData.summary.distanceCovered}</p>}
                            {currentDayData.summary.transportBetweenLocations && <p> <strong>Transport:</strong> {currentDayData.summary.transportBetweenLocations}</p>}
                            {currentDayData.summary.proTips && <p> <strong>Pro Tip:</strong> {currentDayData.summary.proTips}</p>}
                            {!currentDayData.summary.proTips && typeof currentDayData.summary === 'string' && <p>{currentDayData.summary}</p>}
                          </div> </div>
                      )}
                    </div> </motion.div>
                )}
              </motion.div> </AnimatePresence>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-16 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <div className="p-4 rounded-2xl bg-accent/10 text-accent">
                <LuCalendar className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Itinerary Config</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed text-primary-900/50 dark:text-dark-muted">
                Enter your destination, days, budget & interests to generate a complete day-by-day travel plan.
              </p>
            </div>
          )}
        </div> </div> </div>
  );
}
