import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900/40 min-h-screen">
      <div className="container-cq max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 md:p-12 space-y-6"
        >
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-display">Terms of Service</h1>
          <p className="text-xs text-slate-400 dark:text-dark-muted">Last Updated: July 4, 2026</p>
          <div className="divider" />

          <div className="space-y-4 text-sm text-slate-650 dark:text-slate-300 leading-relaxed">
            <p>
              Welcome to CultureQuest AI! These terms and conditions outline the rules and regulations for the use of CultureQuest AI's Cultural Tourism Platform.
            </p>
            <p>
              By accessing this website we assume you accept these terms and conditions. Do not continue to use CultureQuest AI if you do not agree to take all of the terms and conditions stated on this page.
            </p>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Cookies & Session Tokens</h3>
            <p>
              We employ the use of local storage session tokens (cq_token) to maintain persistent logins. By using the app, you agree to allow us to store user authentication references locally.
            </p>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">AI Content Accuracy</h3>
            <p>
              CultureQuest AI relies on Google's Gemini API for travel tips, dining etiquette, storytelling, and itinerary creation. While we optimize the prompts for maximum accuracy, AI-generated travel details, pricing, routes, and dates can hallucinate. Users must verify travel logistics, opening hours, local weather warnings, and security notices independently.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
