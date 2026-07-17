import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { LuMap, LuSparkles } from 'react-icons/lu';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TripPlanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destParam = searchParams.get('dest') || '';

  const [destinations, setDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isPlanning, setIsPlanning] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      days: 3,
      destinationName: destParam,
      travelStyle: 'solo',
      budgetTotal: 500,
      letAIPlan: false,
    }
  });

  const watchLetAI = watch('letAIPlan');

  useEffect(() => {
    if (destParam) {
      setValue('destinationName', destParam);
      setValue('name', `Trip to ${destParam}`);
    }
  }, [destParam, setValue]);

  useEffect(() => {
    const fetchDestinationsList = async () => {
      try {
        const res = await api.get('/destinations?limit=100');
        setDestinations(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDestinations(false);
      }
    };
    fetchDestinationsList();
  }, []);

  const onSubmit = async (data) => {
    setIsPlanning(true);
    try {
      const selectedDestName = data.destinationName.trim();
      if (!selectedDestName) {
        toast.error('Please enter a valid destination');
        setIsPlanning(false);
        return;
      }

      // Check if selected name matches a preloaded destination to get its details or fallback
      const matchedDest = destinations.find(
        (d) => d.name.toLowerCase() === selectedDestName.toLowerCase()
      );

      let plannedItinerary = [];
      let budgetBreakdown = { accommodation: 0, transport: 0, food: 0, activities: 0, emergency: 0 };

      if (data.letAIPlan) {
        toast.loading('AI is crafting your itinerary & budget...', { id: 'ai-plan' });
        try {
          const [itineraryRes, budgetRes] = await Promise.all([
            api.post('/ai/itinerary', {
              destination: selectedDestName,
              days: data.days,
              travelStyle: data.travelStyle,
            }),
            api.post('/ai/budget-planner', {
              destination: selectedDestName,
              duration: data.days,
              travelStyle: data.travelStyle,
            }),
          ]);

          // Process AI Itinerary Response
          if (itineraryRes.data.itinerary) {
            plannedItinerary = itineraryRes.data.itinerary.map((day, idx) => {
              const morning = Array.isArray(day.morning) ? day.morning : [day.morning];
              const afternoon = Array.isArray(day.afternoon) ? day.afternoon : [day.afternoon];
              const evening = Array.isArray(day.evening) ? day.evening : [day.evening];
              const allActivities = [...morning, ...afternoon, ...evening].filter(Boolean).map((act) => ({
                title: act.title || act.name || 'Activity',
                description: act.description || '',
                cost: parseFloat(act.cost) || 0,
                location: act.address || '',
              }));

              return {
                day: day.dayNumber || day.day || (idx + 1),
                title: day.theme || 'Exploration',
                activities: allActivities,
                notes: day.summary?.proTips || '',
              };
            });
          }

          // Process AI Budget Response
          const styleKey = data.travelStyle === 'luxury' ? 'luxury' : data.travelStyle === 'budget' ? 'budget' : 'midRange';
          const budgetTier = budgetRes.data.budgetPlan?.[styleKey];
          if (budgetTier?.dailyBreakdown) {
            const daily = budgetTier.dailyBreakdown;
            const parseVal = (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
            budgetBreakdown = {
              accommodation: parseVal(daily.accommodation) * data.days,
              transport: parseVal(daily.transport) * data.days,
              food: (parseVal(daily.meals) || parseVal(daily.food)) * data.days,
              activities: parseVal(daily.activities) * data.days,
              emergency: parseVal(budgetTier.emergencyBuffer) || 0,
            };
          }
          toast.dismiss('ai-plan');
          toast.success('AI generation completed!');
        } catch (aiErr) {
          console.error(aiErr);
          toast.dismiss('ai-plan');
          toast.error('AI planning service failed. Creating standard empty trip template.');
        }
      }

      // Create Trip API call
      const totalBudget = Object.values(budgetBreakdown).reduce((a, b) => a + b, 0) || parseFloat(data.budgetTotal);

      const tripPayload = {
        name: data.name,
        days: data.days,
        travelStyle: data.travelStyle,
        isAIGenerated: data.letAIPlan,
        budget: {
          total: totalBudget,
          breakdown: budgetBreakdown,
        },
        itinerary: plannedItinerary.length > 0 ? plannedItinerary : Array.from({ length: data.days }).map((_, i) => ({
          day: i + 1,
          title: `Day ${i + 1}`,
          activities: [],
        })),
        status: 'planning',
      };

      if (matchedDest) {
        tripPayload.destinations = [matchedDest._id];
      } else {
        tripPayload.destinationName = selectedDestName;
      }

      const tripRes = await api.post('/trips', tripPayload);
      toast.success('Trip created successfully!');
      navigate(`/trip-planner/${tripRes.data.trip._id}`);
    } catch (err) {
      toast.error('Trip planning failed');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="py-8 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="container-cq max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 md:p-8 space-y-6 rounded-3xl shadow-sm"
        >
          <div className="text-center space-y-2">
            <span className="text-5xl animate-float block">🧭</span>
            <h1 className="text-2xl font-black text-primary-900 dark:text-white font-display">Plan Your Next Trip</h1>
            <p className="text-xs text-primary-900/60 dark:text-dark-muted font-medium">Design your upcoming travel itinerary with smart AI pre-population.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Trip Name</label>
              <input
                type="text"
                placeholder="e.g. Cherry Blossoms in Kyoto"
                className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', { required: 'Trip name is required' })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Destination</label>
              {isLoadingDestinations ? (
                <div className="h-10 skeleton animate-pulse rounded-xl" />
              ) : (
                <>
                  <input
                    type="text"
                    list="destinations-list"
                    placeholder="e.g. Paris, Kyoto, Rome..."
                    className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all ${errors.destinationName ? 'border-red-500' : ''}`}
                    {...register('destinationName', { required: 'Destination is required' })}
                  />
                  <datalist id="destinations-list">
                    {destinations.map((d) => (
                      <option key={d._id} value={d.name}>{d.city}, {d.country}</option>
                    ))}
                  </datalist>
                </>
              )}
              {errors.destinationName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destinationName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Total Days</label>
                <input type="number" min="1" max="14" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('days')} />
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
            </div>

            {!watchLetAI && (
              <div>
                <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Target Budget (INR, ₹)</label>
                <input type="number" min="10" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('budgetTotal')} />
              </div>
            )}

            {/* AI Generator Option Toggle */}
            <div className="p-4 bg-primary-50/70 border border-primary-100/60 dark:bg-primary-950/20 dark:border-primary-900/10 rounded-2xl flex items-start gap-3">
              <input
                type="checkbox"
                id="letAIPlan"
                className="mt-1 accent-accent rounded cursor-pointer"
                {...register('letAIPlan')}
              />
              <label htmlFor="letAIPlan" className="text-xs text-primary-900/70 dark:text-dark-muted cursor-pointer font-semibold leading-relaxed select-none">
                <strong className="text-accent flex items-center gap-1">
                  <LuSparkles className="animate-pulse text-sm shrink-0" /> Autocomplete with AI Story & Itinerary
                </strong>
                Generate day-wise activities, morning spots, afternoon meal spots, and budget breakdowns automatically.
              </label>
            </div>

            <button
              type="submit"
              disabled={isPlanning}
              className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
            >
              {isPlanning ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LuMap /> Plan Trip
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
