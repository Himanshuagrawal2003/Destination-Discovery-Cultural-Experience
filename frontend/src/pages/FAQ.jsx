import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdKeyboardArrowDown } from 'react-icons/md';

const FAQ_ITEMS = [
  {
    question: "What is CultureQuest AI?",
    answer: "CultureQuest AI is a Generative AI-powered travel recommendation, storytelling, and itinerary planner designed to uncover localized history, food guides, language tools, and hidden gems utilizing the Google Gemini API."
  },
  {
    question: "Does this require a premium Google Maps or Gemini API Key?",
    answer: "No, you can configure your own Gemini API keys and Google Maps keys in the environment files. Default limits fit within the developer trial/free tiers."
  },
  {
    question: "How does the AI Itinerary Generator work?",
    answer: "It accepts your destination name, total days, interests, budget, and travel style. It then runs a parameterized model prompt asking Gemini for a structured day-by-day JSON containing activities, times, distances, and local meal recommendations."
  },
  {
    question: "Can I bookmark my favorite destinations or custom planned trips?",
    answer: "Yes, you can bookmark destinations, events, hidden gems, and experiences to your personal profile. You can also create custom trips with day-by-day itineraries and budgets, and share them with the public feed."
  },
  {
    question: "How do I add a new destination or event?",
    answer: "If your user role is 'admin', you will see the 🛡️ Admin Sidebar link in your user profile dropdown. Through that panel, admins can perform full CRUD operations on Destinations, Events, Experiences, and manage registered users."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900/40 min-h-screen">
      <div className="container-cq max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 md:p-12 space-y-8"
        >
          <div className="text-center space-y-3">
            <span className="text-5xl">❔</span>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-display">Frequently Asked Questions</h1>
            <p className="text-sm text-slate-500 dark:text-dark-muted">
              Get quick answers to common questions about CultureQuest AI.
            </p>
          </div>

          <div className="divider" />

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    <MdKeyboardArrowDown
                      className={`text-xl text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-teal-500' : ''
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 text-sm text-slate-650 dark:text-slate-350 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
                      {item.answer}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
