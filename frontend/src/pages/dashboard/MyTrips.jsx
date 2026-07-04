import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMap, MdDelete, MdAdd } from 'react-icons/md';
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
    <div className="space-y-8 min-h-screen pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">My Planned Trips</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Review, manage, or create customized travel plans and daily itineraries.</p>
        </div>
        <Link to="/trip-planner" className="btn btn-primary btn-sm flex items-center gap-1">
          <MdAdd /> Plan New Trip
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 skeleton w-full animate-pulse" />
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
                  className="card p-5 flex gap-4 items-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shrink-0">
                    {trip.destinations?.[0]?.coverImage ? (
                      <img
                        src={trip.destinations[0].coverImage}
                        alt={trip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <MdMap className="text-3xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5 pr-8">
                    <h3 className="font-bold text-slate-850 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {trip.name}
                    </h3>
                    <p className="text-2xs text-slate-500 truncate">
                      📍 {trip.destinations?.map((d) => d.name).join(', ') || 'No destinations'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-50 dark:border-slate-800/80">
                      <span>📅 {trip.days} day(s)</span>
                      <span className="capitalize badge bg-teal-50 text-teal-700 font-bold">{trip.status}</span>
                    </div>
                  </div>
                </Link>

                {/* Delete button absolute */}
                <button
                  onClick={(e) => handleDeleteTrip(trip._id, e)}
                  className="absolute right-4 top-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                  aria-label="Delete trip"
                >
                  <MdDelete className="text-lg" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-500 space-y-4">
          <span className="text-6xl block">🗺️</span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Planned Trips</h3>
          <p className="text-sm max-w-sm mx-auto">Create day-by-day itineraries, track budgets, and share completed journeys with the community.</p>
        </div>
      )}
    </div>
  );
}
