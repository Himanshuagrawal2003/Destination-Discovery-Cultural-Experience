import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    setIsSubmitting(true);
    // Simulate API contact request
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your message has been sent successfully!');
      reset();
    }, 1200);
  };

  return (
    <div className="py-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="container-cq max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-8 md:p-12 space-y-8 rounded-3xl shadow-sm"
        >
          <div className="text-center space-y-3">
            <span className="text-5xl animate-float block">✉️</span>
            <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">Contact Us</h1>
            <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium">
              Have questions, feedback, or need assistance? Drop us a line below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all ${errors.email ? 'border-red-500' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all ${errors.subject ? 'border-red-500' : ''}`}
                {...register('subject', { required: 'Subject is required' })}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Message</label>
              <textarea
                rows="5"
                placeholder="Tell us about your query..."
                className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold h-auto resize-none leading-relaxed py-3 ${errors.message ? 'border-red-500' : ''}`}
                {...register('message', { required: 'Message content is required' })}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
