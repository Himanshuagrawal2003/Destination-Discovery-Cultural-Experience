import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuCalendar, 
  LuCompass, 
  LuClock, 
  LuCoins, 
  LuMapPin,
  LuSun,
  LuSunset,
  LuMoon,
  LuSave,
  LuCheck
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIItinerary() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [formMeta, setFormMeta] = useState(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      destination: '',
      days: 3,
      interests: '',
      budget: 'mid-range',
      travelStyle: 'solo',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setItinerary(null);
    setIsSaved(false);
    try {
      const interestsArray = data.interests ? data.interests.split(',').map((i) => i.trim()) : [];
      const res = await api.post('/ai/itinerary', {
        ...data,
        interests: interestsArray,
      });
      
      let itineraryData = res.data.itinerary;
      // Handle fallback if backend parsing returned a rawText wrap
      if (itineraryData && !Array.isArray(itineraryData)) {
        if (itineraryData.rawText) {
          try {
            const cleaned = itineraryData.rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            let jsonText = cleaned;
            const startIndex = cleaned.indexOf('[');
            const endIndex = cleaned.lastIndexOf(']');
            if (startIndex > -1 && endIndex > startIndex) {
              jsonText = cleaned.substring(startIndex, endIndex + 1);
            }
            itineraryData = JSON.parse(jsonText);
          } catch (e) {
            itineraryData = [];
            toast.error('Failed to parse itinerary details.');
          }
        } else {
          itineraryData = [];
        }
      }
      
      setItinerary(Array.isArray(itineraryData) ? itineraryData : []);
      setFormMeta({ ...data });
      setActiveDay(1);
      toast.success('Itinerary ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!itinerary || !formMeta) return;

    const token = localStorage.getItem('cq_token');
    if (!token) {
      toast.error('Please login to save your trip');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      // Convert AI itinerary format to Trip model format
      const tripItinerary = itinerary.map((day, i) => {
        const dayNum = day.dayNumber || day.day || (i + 1);
        const activities = [];

        // Helper to extract activities from a section
        const extractActivities = (sectionData, timeOfDay, actType) => {
          if (!sectionData) return;
          const items = normalizeSection(sectionData);
          items.forEach(item => {
            activities.push({
              time: timeOfDay,
              title: item.title || 'Activity',
              description: item.description || '',
              type: actType,
              location: item.address || '',
              cost: parseCost(item.cost),
              notes: item.duration ? `Duration: ${item.duration}` : '',
            });
          });
        };

        extractActivities(day.morning, 'Morning', 'sightseeing');
        extractActivities(day.afternoon, 'Afternoon', 'activity');
        extractActivities(day.evening, 'Evening', 'food');

        return {
          day: dayNum,
          title: day.theme || `Day ${dayNum}`,
          activities,
          notes: day.summary?.proTips || (typeof day.summary === 'string' ? day.summary : ''),
        };
      });

      const tripPayload = {
        name: `${formMeta.destination} - ${formMeta.days} Day Trip`,
        destinationName: formMeta.destination,
        days: parseInt(formMeta.days) || 3,
        travelStyle: formMeta.travelStyle || 'solo',
        itinerary: tripItinerary,
        isAIGenerated: true,
        status: 'planning',
        notes: `AI-generated itinerary for ${formMeta.destination}. Budget: ${formMeta.budget}. Interests: ${formMeta.interests || 'General'}.`,
      };

      const res = await api.post('/trips', tripPayload);
      setIsSaved(true);
      toast.success('Trip saved successfully! 🎉');
      
      // Navigate to the saved trip after a short delay
      setTimeout(() => {
        if (res.data?.data?.trip?._id) {
          navigate(`/trip-planner/${res.data.data.trip._id}`);
        } else {
          navigate('/my-trips');
        }
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to save trip');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to parse cost strings like "₹500" or "$20" to a number
  const parseCost = (costStr) => {
    if (!costStr) return 0;
    if (typeof costStr === 'number') return costStr;
    const nums = String(costStr).replace(/[^0-9.]/g, '');
    return parseFloat(nums) || 0;
  };

  const normalizeSection = (sectionData) => {
    if (!sectionData) return [];
    if (typeof sectionData === 'string' && sectionData.trim()) {
      return [{
        title: 'Activity Info',
        description: sectionData.trim(),
        duration: '',
        cost: '',
        address: ''
      }];
    }
    if (Array.isArray(sectionData)) {
      return sectionData.map(item => ({
        title: item.title || item.name || 'Activity',
        description: item.description || item.dish || '',
        duration: item.duration || '',
        cost: item.cost || item.price || '',
        address: item.address || item.location || ''
      }));
    }
    if (typeof sectionData === 'object') {
      if (sectionData.name || sectionData.title) {
        return [{
          title: sectionData.title || sectionData.name || 'Activity',
          description: sectionData.description || sectionData.dish || '',
          duration: sectionData.duration || '',
          cost: sectionData.cost || sectionData.price || '',
          address: sectionData.address || sectionData.location || ''
        }];
      }
      const items = [];
      Object.keys(sectionData).forEach(key => {
        const val = sectionData[key];
        if (val && typeof val === 'object') {
          items.push({
            title: val.title || val.name || (key.charAt(0).toUpperCase() + key.slice(1)),
            description: val.description || val.dish || '',
            duration: val.duration || '',
            cost: val.cost || val.price || '',
            address: val.address || val.location || ''
          });
        }
      });
      return items;
    }
    return [];
  };

  const renderSection = (title, rawData) => {
    const items = normalizeSection(rawData);
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <h4 className="font-bold text-primary-900 dark:text-white text-xs border-b border-primary-100 dark:border-dark-border pb-2 capitalize flex items-center gap-1.5 font-display">
          {title === 'morning' ? (
            <LuSun className="text-accent text-sm shrink-0" />
          ) : title === 'afternoon' ? (
            <LuCompass className="text-accent text-sm shrink-0" />
          ) : (
            <LuMoon className="text-accent text-sm shrink-0" />
          )}
          {title}
        </h4>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-dark-bg border border-primary-100 dark:border-dark-border/50 p-4 rounded-xl space-y-1.5 shadow-2xs hover:shadow-3xs transition-shadow">
              <h5 className="font-bold text-sm text-primary-900 dark:text-white font-display">{item.title}</h5>
              {item.description && <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{item.description}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-primary-900/40 dark:text-dark-muted/60 font-bold pt-1">
                {item.duration && (
                  <span className="flex items-center gap-1">
                    <LuClock /> Duration: {item.duration}
                  </span>
                )}
                {item.cost && (
                  <span className="flex items-center gap-1">
                    <LuCoins /> Cost: {item.cost}
                  </span>
                )}
                {item.address && (
                  <span className="flex items-center gap-1">
                    <LuMapPin /> Location: {item.address}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuSparkles className="text-accent animate-pulse" /> AI Trip Itinerary Planner
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Generate complete morning, afternoon, and evening schedules with food recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Itinerary Builder</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Destination</label>
            <input
              type="text"
              placeholder="e.g. Paris, France"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('destination', { required: 'Destination is required' })}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Total Days</label>
            <input type="number" min="1" max="10" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('days')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Interests (comma separated)</label>
            <input type="text" placeholder="e.g. food, monuments, art" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('interests')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Budget Tier</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('budget')}>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Style</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('travelStyle')}>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LuSparkles /> Create Plan
              </>
            )}
          </button>
        </form>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : itinerary ? (
            <div className="space-y-6">
              {/* Save Trip Bar */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-accent/10 to-primary-100/50 dark:from-accent/5 dark:to-primary-900/20 border border-accent/20 dark:border-accent/10 rounded-2xl"
              >
                <div className="flex items-center gap-2">
                  <LuSparkles className="text-accent text-lg shrink-0" />
                  <p className="text-sm font-bold text-primary-900 dark:text-white">
                    {isSaved ? 'Trip saved to your dashboard!' : 'Your itinerary is ready! Save it as a trip.'}
                  </p>
                </div>
                <button
                  onClick={handleSaveTrip}
                  disabled={isSaving || isSaved}
                  className={`btn font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-70 ${
                    isSaved
                      ? 'bg-green-500 text-white'
                      : 'bg-accent hover:bg-accent/90 text-white hover:shadow-glow'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : isSaved ? (
                    <>
                      <LuCheck className="text-base" /> Saved!
                    </>
                  ) : (
                    <>
                      <LuSave className="text-base" /> Save as Trip
                    </>
                  )}
                </button>
              </motion.div>

              {/* Day selection tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary-100 dark:border-dark-border no-scrollbar">
                {Array.isArray(itinerary) && itinerary.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(day.dayNumber || day.day || (i + 1))}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                      activeDay === (day.dayNumber || day.day || (i + 1))
                        ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                        : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
                    }`}
                  >
                    Day {day.dayNumber || day.day || (i + 1)}
                  </button>
                ))}
              </div>

              {/* Day Details */}
              {Array.isArray(itinerary) && itinerary.map((day, i) => {
                const currentDayNum = day.dayNumber || day.day || (i + 1);
                if (currentDayNum !== activeDay) return null;

                const morning = day.morning;
                const afternoon = day.afternoon;
                const evening = day.evening;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-6 rounded-2xl shadow-sm"
                  >
                    <div className="flex justify-between items-start border-b border-primary-100 dark:border-dark-border pb-3">
                      <div>
                        <h3 className="text-xl font-bold text-primary-900 dark:text-white flex items-center gap-1.5 font-display">
                          <LuCalendar className="text-accent shrink-0" /> Day {currentDayNum}: {day.theme || 'Exploration'}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {renderSection('morning', morning)}
                      {renderSection('afternoon', afternoon)}
                      {renderSection('evening', evening)}
                    </div>

                    {/* Summary / Notes */}
                    {day.summary && (
                      <div className="bg-primary-50/70 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/20 p-4 rounded-xl space-y-2 text-xs">
                        <p className="font-bold text-accent flex items-center gap-1 font-display">
                          <LuSparkles /> Day Summary & Tips:
                        </p>
                        <div className="text-primary-900/70 dark:text-dark-muted space-y-1.5 font-semibold">
                          {day.summary.estimatedDailyCost && <p>💰 <strong>Estimated Cost:</strong> {day.summary.estimatedDailyCost}</p>}
                          {day.summary.distanceCovered && <p>🏃 <strong>Distance:</strong> {day.summary.distanceCovered}</p>}
                          {day.summary.transportBetweenLocations && <p>🚗 <strong>Transport:</strong> {day.summary.transportBetweenLocations}</p>}
                          {day.summary.proTips && <p>🔑 <strong>Pro Tip:</strong> {day.summary.proTips}</p>}
                          {!day.summary.proTips && typeof day.summary === 'string' && <p>{day.summary}</p>}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <span className="text-6xl animate-float">📅</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Itinerary Configuration</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">Build personalized, day-by-day schedules with dining recommendations, times, and activities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
