import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900/40 min-h-screen">
      <div className="container-cq max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 md:p-12 space-y-8"
        >
          <div className="text-center space-y-4">
            <span className="text-5xl">🏛️</span>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white font-display">About CultureQuest AI</h1>
            <p className="text-teal-600 dark:text-teal-400 font-semibold uppercase tracking-wider text-sm">
              Discovering destinations through cultural experiences
            </p>
          </div>

          <div className="divider" />

          <div className="space-y-6 text-slate-650 dark:text-slate-300 leading-relaxed text-base">
            <p>
              Welcome to <strong>CultureQuest AI</strong>, a next-generation Generative AI-powered travel platform designed to bridge the gap between travelers and the authentic cultural heritage of destinations worldwide.
            </p>
            <p>
              Unlike generic tourist aggregators that prioritize mainstream commercial attractions, CultureQuest AI is built to celebrate localized culture, history, cuisine, festivals, and lesser-known gems. By integrating advanced machine learning and natural language generation via the Google Gemini API, we provide deep educational storytelling, customs guides, language primers, and highly customized itineraries.
            </p>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white pt-4">Our Core Philosophy</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Cultural Appreciation:</strong> Promoting travel that respects and celebrates local traditions, greetings, dress codes, and dining etiquette.</li>
              <li><strong>Hidden Gems:</strong> Helping local economies by redirecting travelers to lesser-known locations rather than overcrowding famous tourist hotspots.</li>
              <li><strong>AI-Driven Optimization:</strong> Using advanced context-aware models to dynamically calculate itineraries, budget tiers, and local activities tailored to a user's style.</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white pt-4">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-teal-600 dark:text-teal-400">🤖 AI Recommendation Engine</h4>
                <p className="text-sm">Personalized recommendations based on budget levels, travel seasons, and interests.</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-teal-600 dark:text-teal-400">📝 Interactive Storytelling</h4>
                <p className="text-sm">Immersive descriptions covering ancient history, folklore, myths, and architecture.</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-teal-600 dark:text-teal-400">📅 Day-Wise Itineraries</h4>
                <p className="text-sm">Dynamic travel paths including morning, afternoon, and evening meal recommendations.</p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-teal-600 dark:text-teal-400">💬 Context-Aware Chatbot</h4>
                <p className="text-sm">Your virtual pocket guide, ready to answer questions about any destination anytime.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
