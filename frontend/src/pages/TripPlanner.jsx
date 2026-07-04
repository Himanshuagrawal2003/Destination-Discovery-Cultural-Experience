import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdMap, MdAutoAwesome } from 'react-icons/md';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TripPlanner() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isPlanning, setIsPlanning] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      days: 3,
      destinationId: '',
      travelStyle: 'solo',
      budgetTotal: 500,
      letAIPlan: false,
    }
  });

  const watchLetAI = watch('letAIPlan');

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
      const selectedDest = destinations.find((d) => d._id === data.destinationId);
      if (!selectedDest) {
        toast.error('Please select a valid destination');
        setIsPlanning(false);
        return;
      }

      let plannedItinerary = [];
      let budgetBreakdown = { accommodation: 0, transport: 0, food: 0, activities: 0, emergency: 0 };

      if (data.letAIPlan) {
        toast.loading('AI is crafting your itinerary & budget...', { id: 'ai-plan' });
        try {
          const [itineraryRes, budgetRes] = await Promise.all([
            api.post('/ai/itinerary', {
              destination: selectedDest.name,
              days: data.days,
              travelStyle: data.travelStyle,
            }),
            api.post('/ai/budget-planner', {
              destination: selectedDest.name,
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

      const tripRes = await api.post('/trips', {
        name: data.name,
        days: data.days,
        destinations: [data.destinationId],
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
      });

      toast.success('Trip created successfully!');
      navigate(`/trip-planner/${tripRes.data.trip._id}`);
    } catch (err) {
      toast.error('Trip planning failed');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900/40 min-h-screen">
      <div className="container-cq max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 md:p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-5xl animate-float block">🧭</span>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white font-display">Plan Your Next Trip</h1>
            <p className="text-xs text-slate-500">Design your upcoming travel itinerary with smart AI pre-population.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Trip Name</label>
              <input
                type="text"
                placeholder="e.g. Cherry Blossoms in Kyoto"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: 'Trip name is required' })}
              />
              {errors.name && <p className="text-red-550 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Destination</label>
              {isLoadingDestinations ? (
                <div className="h-10 skeleton" />
              ) : (
                <select className="input capitalize" {...register('destinationId', { required: 'Please pick a destination' })}>
                  <option value="">Select Destination...</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.city}, {d.country})</option>
                  ))}
                </select>
              )}
              {errors.destinationId && <p className="text-red-550 text-xs mt-1">{errors.destinationId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Total Days</label>
                <input type="number" min="1" max="14" className="input" {...register('days')} />
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
            </div>

            {!watchLetAI && (
              <div>
                <label className="label">Target Budget (USD)</label>
                <input type="number" min="10" className="input" {...register('budgetTotal')} />
              </div>
            )}

            {/* AI Generator Option Toggle */}
            <div className="p-4 bg-teal-500/5 dark:bg-teal-950/20 rounded-xl border border-teal-500/20 flex items-start gap-3">
              <input
                type="checkbox"
                id="letAIPlan"
                className="mt-1 accent-teal-600 rounded cursor-pointer"
                {...register('letAIPlan')}
              />
              <label htmlFor="letAIPlan" className="text-xs text-slate-650 dark:text-slate-350 cursor-pointer font-medium leading-relaxed select-none">
                <strong className="text-teal-700 dark:text-teal-400 flex items-center gap-1">
                  <MdAutoAwesome className="animate-pulse" /> Autocomplete with AI Story & Itinerary
                </strong>
                Generate day-wise activities, morning spots, afternoon meal spots, and budget breakdowns automatically.
              </label>
            </div>

            <button
              type="submit"
              disabled={isPlanning}
              className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPlanning ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <MdMap /> Plan Trip
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
