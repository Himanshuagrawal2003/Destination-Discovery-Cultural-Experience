import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerUser, selectAuth } from '../../redux/slices/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(selectAuth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white font-display">Create Account</h2>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted mt-1 font-medium">Begin your travel adventure today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-650 dark:text-red-400 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all ${
              errors.name ? 'border-red-400 focus:ring-red-400' : 'border-primary-200 dark:border-dark-border focus:border-transparent'
            }`}
            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
        </div>

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
          <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text mb-1.5">Password</label>
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
          <label className="block text-sm font-semibold text-primary-900 dark:text-dark-text mb-1.5">Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm transition-all ${
              errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-primary-200 dark:border-dark-border focus:border-transparent'
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
            'Sign Up'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-primary-900/60 dark:text-dark-muted font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline font-semibold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
