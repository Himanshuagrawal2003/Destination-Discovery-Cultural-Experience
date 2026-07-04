import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900/40 min-h-screen">
      <div className="container-cq max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 md:p-12 space-y-6"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-display">Privacy Policy</h1>
          <p className="text-xs text-slate-400 dark:text-dark-muted">Last Updated: July 4, 2026</p>
          <div className="divider" />

          <div className="space-y-4 text-sm text-slate-650 dark:text-slate-300 leading-relaxed">
            <p>
              At CultureQuest AI, accessible from our application portal, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by CultureQuest AI and how we use it.
            </p>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Information We Collect</h3>
            <p>
              We collect user emails, encrypted passwords, profiles, avatars, travel preferences, planned itineraries, search queries, and AI history inputs to provide customizable dashboards and personalized itineraries.
            </p>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, operate, and maintain our travel assistant service.</li>
              <li>To analyze and predict trending destinations based on searches.</li>
              <li>To process your profile photos via Cloudinary upload.</li>
              <li>To manage your notification logs and save planned trip files.</li>
            </ul>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Gemini API Data</h3>
            <p>
              All queries sent to the AI Travel Assistant are processed using Google's Gemini API endpoints. We do not sell or distribute your search templates to external agencies.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
