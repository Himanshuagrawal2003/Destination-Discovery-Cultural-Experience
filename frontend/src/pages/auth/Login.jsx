import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginUser, selectAuth } from '../../redux/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(selectAuth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white font-display">Welcome Back</h2>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted mt-1 font-medium">Sign in to resume your cultural quests</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-650 dark:text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text">Password</label>
            <Link to="/forgot-password" className="text-xs text-accent hover:underline font-semibold">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all ${
              errors.password ? 'border-red-400 focus:ring-red-400' : 'border-primary-200 dark:border-dark-border focus:border-transparent'
            }`}
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-primary-900/60 dark:text-dark-muted font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent hover:underline font-semibold">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
