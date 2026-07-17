import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { selectUser, updateProfile } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        bio: user.bio || '',
        country: user.country || '',
        language: user.language || 'English',
        travelInterests: user.travelInterests?.join(', ') || '',
        budgetPref: user.preferences?.budget || 'mid-range',
        stylePref: user.preferences?.travelStyle || 'solo',
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const interestsArray = data.travelInterests ? data.travelInterests.split(',').map((i) => i.trim()) : [];
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('bio', data.bio);
      formData.append('country', data.country);
      formData.append('language', data.language);
      formData.append('travelInterests', JSON.stringify(interestsArray));
      formData.append('preferences', JSON.stringify({
        budget: data.budgetPref,
        travelStyle: data.stylePref,
      }));

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Profile update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 md:p-8 space-y-8 pb-12 animate-fade-in max-w-2xl mx-auto rounded-3xl shadow-sm">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-900 dark:text-white font-display">Profile Settings</h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Manage your photo, language, and travel interest preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-primary-50 dark:border-dark-border pb-6">
          <img
            src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
            alt="Avatar Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-accent shadow shrink-0"
          />
          <div className="space-y-2">
            <label className="block text-xs font-bold text-primary-900 dark:text-white uppercase tracking-wider">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-xs text-primary-900/40 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 dark:file:bg-primary-900/30 file:text-accent dark:file:text-accent file:cursor-pointer"
            />
            <p className="text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold">JPG, PNG or WEBP. Max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all ${errors.name ? 'border-red-500' : ''}`}
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Country of Origin</label>
            <input
              type="text"
              placeholder="e.g. USA, Canada"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('country')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Preferred Language</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('language')}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Styles Preference</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('stylePref')}>
              <option value="solo">Solo Traveller</option>
              <option value="couple">Couple</option>
              <option value="family">Family Trip</option>
              <option value="group">Group Explorer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Budget Level Preference</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('budgetPref')}>
              <option value="budget">Budget Level</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury Tier</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Interests (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. temples, museums, street-food, nature"
            className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
            {...register('travelInterests')}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Bio</label>
          <textarea
            rows="3"
            placeholder="Tell us about yourself or your favorite travel style..."
            className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold h-auto resize-none leading-relaxed py-3"
            {...register('bio')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow w-fit"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Save Profile'
          )}
        </button>
      </form>
    </div>
  );
}
