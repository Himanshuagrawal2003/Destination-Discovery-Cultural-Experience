import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSent(true);
      toast.success('Password reset email sent if account exists.');
    } catch (err) {
      toast.error(err.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white font-display">Reset Password</h2>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted mt-1 font-medium">We'll send you instructions to reset your password</p>
      </div>

      {isSent ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900/30 rounded-2xl text-primary-900 dark:text-primary-300 text-sm font-semibold">
            Please check your inbox. If you have an account registered with us, you will receive a reset link shortly.
          </div>
          <Link to="/login" className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all inline-block text-center mt-4">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all ${
                errors.email ? 'border-red-400 focus:ring-red-400' : 'border-primary-200 dark:border-dark-border focus:border-transparent'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' }
              })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
      )}

      {!isSent && (
        <p className="text-center text-sm text-primary-900/60 dark:text-dark-muted font-medium">
          Remembered your password?{' '}
          <Link to="/login" className="text-accent hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      )}
    </div>
  );
}
