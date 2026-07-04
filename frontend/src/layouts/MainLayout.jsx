import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar  from '../components/common/Navbar';
import Footer  from '../components/common/Footer';
import Chatbot from '../components/ai/Chatbot';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-dark-bg transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
