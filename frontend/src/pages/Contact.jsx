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
    <div className="py-12 bg-slate-50 dark:bg-slate-900/40 min-h-screen">
      <div className="container-cq max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-8 md:p-12 space-y-8"
        >
          <div className="text-center space-y-3">
            <span className="text-5xl">✉️</span>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-display">Contact Us</h1>
            <p className="text-sm text-slate-500 dark:text-dark-muted">
              Have questions, feedback, or need assistance? Drop us a line below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' }
                })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                placeholder="How can we help?"
                className={`input ${errors.subject ? 'input-error' : ''}`}
                {...register('subject', { required: 'Subject is required' })}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="label">Message</label>
              <textarea
                rows="5"
                placeholder="Tell us about your query..."
                className={`input h-auto resize-none py-3 ${errors.message ? 'input-error' : ''}`}
                {...register('message', { required: 'Message content is required' })}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
