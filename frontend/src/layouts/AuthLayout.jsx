import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-700 to-cyan-600 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-800/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🌍</span>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white font-display">CultureQuest</h1>
              <p className="text-xs text-primary-200 font-medium tracking-widest uppercase">AI Travel Platform</p>
            </div>
          </a>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <Outlet />
        </div>

        <p className="text-center text-primary-200 text-sm mt-6">
          © {new Date().getFullYear()} CultureQuest AI. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
