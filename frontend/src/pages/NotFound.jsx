import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-md"
      >
        <span className="text-8xl block animate-float">🧭</span>
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white font-display">Page Not Found</h1>
        <p className="text-slate-500 dark:text-dark-muted text-sm leading-relaxed">
          It looks like you've wandered off the trail. The cultural experience or itinerary destination you're looking for doesn't exist.
        </p>
        <div className="pt-4">
          <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
            Back to Home Base
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
