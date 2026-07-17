import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset token is invalid or expired');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white font-display">Create New Password</h2>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted mt-1 font-medium">Please enter your new strong password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text mb-1.5">New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all ${
              errors.password ? 'border-red-400 focus:ring-red-400' : 'border-primary-200 dark:border-dark-border focus:border-transparent'
            }`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              validate: {
                hasUpper: (val) => /[A-Z]/.test(val) || 'Must contain at least one uppercase letter',
                hasLower: (val) => /[a-z]/.test(val) || 'Must contain at least one lowercase letter',
                hasNumber: (val) => /\d/.test(val) || 'Must contain at least one number',
              }
            })}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text mb-1.5">Confirm New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all ${
              errors.confirmPassword ? 'border-red-400 focus:ring-red-450' : 'border-slate-700 focus:border-transparent'
            }`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === watch('password') || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-primary-900/60 dark:text-dark-muted font-medium">
        <Link to="/login" className="text-accent hover:underline font-semibold">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
