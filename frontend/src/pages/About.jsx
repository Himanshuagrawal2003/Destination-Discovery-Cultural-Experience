import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="py-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="container-cq max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-8 md:p-12 space-y-8 rounded-3xl shadow-sm"
        >
          <div className="text-center space-y-4">
            <span className="text-5xl animate-float block">🏛️</span>
            <h1 className="text-4xl font-extrabold text-primary-900 dark:text-white font-display">About CultureQuest AI</h1>
            <p className="text-accent font-bold uppercase tracking-wider text-sm">
              Discovering destinations through cultural experiences
            </p>
          </div>

          <div className="border-t border-primary-100 dark:border-dark-border" />

          <div className="space-y-6 text-primary-900/70 dark:text-dark-text leading-relaxed text-sm font-semibold">
            <p>
              Welcome to <strong className="text-primary-900 dark:text-white">CultureQuest AI</strong>, a next-generation Generative AI-powered travel platform designed to bridge the gap between travelers and the authentic cultural heritage of destinations worldwide.
            </p>
            <p>
              Unlike generic tourist aggregators that prioritize mainstream commercial attractions, CultureQuest AI is built to celebrate localized culture, history, cuisine, festivals, and lesser-known gems. By integrating advanced machine learning and natural language generation via the Google Gemini API, we provide deep educational storytelling, customs guides, language primers, and highly customized itineraries.
            </p>

            <h3 className="text-xl font-bold text-primary-900 dark:text-white pt-4 font-display">Our Core Philosophy</h3>
            <ul className="list-disc pl-5 space-y-2 text-primary-900/60 dark:text-dark-muted">
              <li><strong className="text-primary-900 dark:text-white font-semibold">Cultural Appreciation:</strong> Promoting travel that respects and celebrates local traditions, greetings, dress codes, and dining etiquette.</li>
              <li><strong className="text-primary-900 dark:text-white font-semibold">Hidden Gems:</strong> Helping local economies by redirecting travelers to lesser-known locations rather than overcrowding famous tourist hotspots.</li>
              <li><strong className="text-primary-900 dark:text-white font-semibold">AI-Driven Optimization:</strong> Using advanced context-aware models to dynamically calculate itineraries, budget tiers, and local activities tailored to a user's style.</li>
            </ul>

            <h3 className="text-xl font-bold text-primary-900 dark:text-white pt-4 font-display">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/10 rounded-2xl space-y-2">
                <h4 className="font-bold text-accent font-display text-sm">🤖 AI Recommendation Engine</h4>
                <p className="text-xs text-primary-900/60 dark:text-dark-muted font-medium">Personalized recommendations based on budget levels, travel seasons, and interests.</p>
              </div>
              <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/10 rounded-2xl space-y-2">
                <h4 className="font-bold text-accent font-display text-sm">📝 Interactive Storytelling</h4>
                <p className="text-xs text-primary-900/60 dark:text-dark-muted font-medium">Immersive descriptions covering ancient history, folklore, myths, and architecture.</p>
              </div>
              <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/10 rounded-2xl space-y-2">
                <h4 className="font-bold text-accent font-display text-sm">📅 Day-Wise Itineraries</h4>
                <p className="text-xs text-primary-900/60 dark:text-dark-muted font-medium">Dynamic travel paths including morning, afternoon, and evening meal recommendations.</p>
              </div>
              <div className="p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/10 rounded-2xl space-y-2">
                <h4 className="font-bold text-accent font-display text-sm">💬 Context-Aware Chatbot</h4>
                <p className="text-xs text-primary-900/60 dark:text-dark-muted font-medium">Your virtual pocket guide, ready to answer questions about any destination anytime.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
