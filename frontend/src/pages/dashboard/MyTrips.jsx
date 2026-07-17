import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuMap, LuTrash2, LuPlus } from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTripsList = async () => {
      try {
        const res = await api.get('/trips');
        setTrips(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTripsList();
  }, []);

  const handleDeleteTrip = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((item) => item._id !== id));
      toast.success('Trip deleted successfully');
    } catch (err) {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">My Planned Trips</h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Review, manage, or create customized travel plans and daily itineraries.</p>
        </div>
        <Link to="/trip-planner" className="btn bg-accent hover:bg-accent/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm hover:shadow-glow cursor-pointer transition-all flex items-center gap-1 shrink-0">
          <LuPlus /> Plan New Trip
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 skeleton w-full animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {trips.map((trip) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative"
              >
                <Link
                  to={`/trip-planner/${trip._id}`}
                  className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 flex gap-4 items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 rounded-2xl"
                >
                  <div className="w-20 h-20 bg-primary-50 rounded-2xl overflow-hidden shrink-0">
                    {trip.destinations?.[0]?.coverImage ? (
                      <img
                        src={trip.destinations[0].coverImage}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-900/40">
                        <LuMap className="text-3xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5 pr-8">
                    <h3 className="font-bold text-primary-900 dark:text-white truncate group-hover:text-accent transition-colors font-display text-sm">
                      {trip.name}
                    </h3>
                    <p className="text-2xs text-primary-900/50 dark:text-dark-muted truncate font-semibold">
                      📍 {trip.destinations?.map((d) => d.name).join(', ') || 'No destinations'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-primary-900/40 dark:text-dark-muted/60 font-bold pt-2 border-t border-primary-50 dark:border-dark-border">
                      <span>📅 {trip.days} day(s)</span>
                      <span className="capitalize badge bg-primary-50 text-accent font-extrabold px-2 py-0.5 rounded text-[10px]">{trip.status}</span>
                    </div>
                  </div>
                </Link>

                {/* Delete button absolute */}
                <button
                  onClick={(e) => handleDeleteTrip(trip._id, e)}
                  className="absolute right-4 top-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl cursor-pointer transition-colors"
                  aria-label="Delete trip"
                >
                  <LuTrash2 className="text-base" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <span className="text-6xl block animate-float">🗺️</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Planned Trips</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed font-semibold">Create day-by-day itineraries, track budgets, and share completed journeys with the community.</p>
        </div>
      )}
    </div>
  );
}
