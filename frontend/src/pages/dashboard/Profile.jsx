import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { LuLock, LuEye, LuEyeOff } from 'react-icons/lu';
import { selectUser, updateProfile } from '../../redux/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);
  const { register: regPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, watch: watchPwd, formState: { errors: pwdErrors } } = useForm();

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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display tracking-tight leading-snug">Profile Settings</h1>
        <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Manage your photo, language, and travel interest preferences.</p>
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
            <p className="text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold">JPG, PNG or WEBP. Max 2MB.</p> </div> </div>

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
            /> </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Preferred Language</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('language')}
            /> </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Styles Preference</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('stylePref')}>
              <option value="solo">Solo Traveller</option>
              <option value="couple">Couple</option>
              <option value="family">Family Trip</option>
              <option value="group">Group Explorer</option> </select> </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Budget Level Preference</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('budgetPref')}>
              <option value="budget">Budget Level</option>
              <option value="mid-range">Mid-range</option>
              <option value="luxury">Luxury Tier</option> </select> </div> </div>

        <div>
          <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Interests (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. temples, museums, street-food, nature"
            className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
            {...register('travelInterests')}
          /> </div>

        <div>
          <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Bio</label>
          <textarea
            rows="3"
            placeholder="Tell us about yourself or your favorite travel style..."
            className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold h-auto resize-none leading-relaxed py-3"
            {...register('bio')}
          /> </div>

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

      {/* Change Password Section */}
      <div className="border-t border-primary-100 dark:border-dark-border pt-8 space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-accent/10">
            <LuLock className="text-accent text-base" />
          </div>
          <div>
            <h2 className="text-base font-black text-primary-900 dark:text-white font-display">Change Password</h2>
            <p className="text-xs text-primary-900/50 dark:text-dark-muted font-medium">Update your account password securely.</p>
          </div>
        </div>

        <form
          onSubmit={handlePwdSubmit(async (data) => {
            if (data.newPassword !== data.confirmPassword) {
              toast.error('New passwords do not match');
              return;
            }
            setPwdLoading(true);
            try {
              await api.put('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
              });
              toast.success('Password changed successfully!');
              resetPwd();
            } catch (err) {
              toast.error(err.response?.data?.message || 'Failed to change password');
            } finally {
              setPwdLoading(false);
            }
          })}
          className="space-y-4"
        >
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPwd.current ? 'text' : 'password'}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                {...regPwd('currentPassword', { required: 'Current password is required' })}
              />
              <button type="button" onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-900/40 dark:text-dark-muted cursor-pointer">
                {showPwd.current ? <LuEyeOff className="text-sm" /> : <LuEye className="text-sm" />}
              </button>
            </div>
            {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{pwdErrors.currentPassword.message}</p>}
          </div>

          {/* New + Confirm in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPwd.new ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                  {...regPwd('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Min. 8 characters' } })}
                />
                <button type="button" onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-900/40 dark:text-dark-muted cursor-pointer">
                  {showPwd.new ? <LuEyeOff className="text-sm" /> : <LuEye className="text-sm" />}
                </button>
              </div>
              {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{pwdErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPwd.confirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                  {...regPwd('confirmPassword', { required: 'Please confirm your password' })}
                />
                <button type="button" onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-900/40 dark:text-dark-muted cursor-pointer">
                  {showPwd.confirm ? <LuEyeOff className="text-sm" /> : <LuEye className="text-sm" />}
                </button>
              </div>
              {pwdErrors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{pwdErrors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdLoading}
            className="btn bg-primary-900 dark:bg-dark-border hover:bg-primary-800 dark:hover:bg-primary-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-fit"
          >
            {pwdLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><LuLock className="text-sm" /> Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
