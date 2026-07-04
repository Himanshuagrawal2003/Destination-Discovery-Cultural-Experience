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
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-sm text-primary-100 mt-1">We'll send you instructions to reset your password</p>
      </div>

      {isSent ? (
        <div className="space-y-4 text-center">
          <div className="p-4 bg-teal-500/20 border border-teal-500/50 rounded-2xl text-teal-200 text-sm">
            Please check your inbox. If you have an account registered with us, you will receive a reset link shortly.
          </div>
          <Link to="/login" className="w-full btn bg-teal-650 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold inline-block text-center mt-4">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-800/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-450 text-sm ${
                errors.email ? 'border-red-400 focus:ring-red-450' : 'border-slate-700 focus:border-transparent'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' }
              })}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-teal-650 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
        <p className="text-center text-sm text-primary-100">
          Remembered your password?{' '}
          <Link to="/login" className="text-teal-350 hover:text-teal-200 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      )}
    </div>
  );
}
