import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FAF7FF] to-[#EDE9FE] dark:from-[#030712] dark:via-[#0b1528] dark:to-[#030712] p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/10 dark:bg-primary-900/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-200/20 dark:bg-primary-900/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl animate-float">🌍</span>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-primary-900 dark:text-white font-display">
                Culture<span className="gradient-text font-extrabold">Quest</span>
              </h1>
              <p className="text-[10px] text-primary-900/60 dark:text-dark-muted font-bold tracking-widest uppercase">AI Travel Platform</p>
            </div>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-3xl p-8 shadow-lg">
          <Outlet />
        </div>

        <p className="text-center text-primary-900/50 dark:text-dark-muted text-xs mt-6 font-semibold">
          © {new Date().getFullYear()} CultureQuest AI. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
