import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdAutoAwesome, MdToday, MdDirectionsTransit, MdRestaurant } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIItinerary() {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
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
    try {
      const interestsArray = data.interests ? data.interests.split(',').map((i) => i.trim()) : [];
      const res = await api.post('/ai/itinerary', {
        ...data,
        interests: interestsArray,
      });
      setItinerary(res.data.itinerary || []);
      setActiveDay(1);
      toast.success('Itinerary ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate itinerary');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-3">
        <h4 className="font-bold text-slate-800 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800/80 pb-1.5 capitalize flex items-center gap-1.5">
          {title === 'morning' ? '🌅 Morning' : title === 'afternoon' ? '☀️ Afternoon' : '🌙 Evening'}
        </h4>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-1">
              <h5 className="font-bold text-sm text-slate-850 dark:text-white">{item.title}</h5>
              {item.description && <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>}
              <div className="flex flex-wrap gap-x-4 text-[10px] text-slate-400 font-semibold pt-1">
                {item.duration && <span>⏱️ Duration: {item.duration}</span>}
                {item.cost && <span>💰 Cost: {item.cost}</span>}
                {item.address && <span>📍 Address: {item.address}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdAutoAwesome className="text-amber-500 animate-pulse" /> AI Trip Itinerary Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Generate complete morning, afternoon, and evening schedules with food recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-855 pb-3 font-display">Itinerary Builder</h3>

          <div>
            <label className="label">Destination</label>
            <input
              type="text"
              placeholder="e.g. Paris, France"
              className="input"
              {...register('destination', { required: 'Destination is required' })}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="label">Total Days</label>
            <input type="number" min="1" max="10" className="input" {...register('days')} />
          </div>

          <div>
            <label className="label">Interests (comma separated)</label>
            <input type="text" placeholder="e.g. food, monuments, art" className="input" {...register('interests')} />
          </div>

          <div>
            <label className="label">Budget Tier</label>
            <select className="input" {...register('budget')}>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div>
            <label className="label">Travel Style</label>
            <select className="input" {...register('travelStyle')}>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdAutoAwesome /> Create Plan
              </>
            )}
          </button>
        </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full" />
              ))}
            </div>
          ) : itinerary ? (
            <div className="space-y-6">
              {/* Day selection tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 no-scrollbar">
                {itinerary.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(day.dayNumber || day.day || (i + 1))}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                      activeDay === (day.dayNumber || day.day || (i + 1))
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    Day {day.dayNumber || day.day || (i + 1)}
                  </button>
                ))}
              </div>

              {/* Day Details */}
              {itinerary.map((day, i) => {
                const currentDayNum = day.dayNumber || day.day || (i + 1);
                if (currentDayNum !== activeDay) return null;

                // Ensure activities lists are valid arrays
                const morning = Array.isArray(day.morning) ? day.morning : typeof day.morning === 'object' ? [day.morning] : [];
                const afternoon = Array.isArray(day.afternoon) ? day.afternoon : typeof day.afternoon === 'object' ? [day.afternoon] : [];
                const evening = Array.isArray(day.evening) ? day.evening : typeof day.evening === 'object' ? [day.evening] : [];

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 space-y-6"
                  >
                    <div className="flex justify-between items-start border-b border-slate-150 pb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-1.5 font-display">
                          <MdToday className="text-teal-600 shrink-0" /> Day {currentDayNum}: {day.theme || 'Exploration'}
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
                      <div className="bg-teal-50/10 dark:bg-teal-900/10 border border-teal-500/20 p-4 rounded-xl space-y-2 text-xs">
                        <p className="font-bold text-teal-700 dark:text-teal-400">📝 Day Summary & Tips:</p>
                        <div className="text-slate-650 dark:text-slate-350 space-y-1 font-medium">
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
            <div className="card p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl animate-float">📅</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">Awaiting Itinerary Configuration</h3>
              <p className="text-sm max-w-sm">Build personalized, day-by-day schedules with dining recommendations, times, and activities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
