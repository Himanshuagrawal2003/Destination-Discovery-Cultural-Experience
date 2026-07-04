import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchExperiencesList = async () => {
    try {
      const res = await api.get('/experiences?limit=100');
      setExperiences(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiencesList();
  }, []);

  const handleOpenCreate = () => {
    setEditingExp(null);
    setCoverFile(null);
    reset({
      title: '',
      type: 'cooking-class',
      description: '',
      priceAmount: 25,
      durationValue: 2,
      durationType: 'hours',
      groupSize: 10,
      city: '',
      country: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExp(exp);
    setCoverFile(null);
    setValue('title', exp.title);
    setValue('type', exp.type);
    setValue('description', exp.description);
    setValue('priceAmount', exp.price?.amount || 25);
    setValue('durationValue', exp.duration?.value || 2);
    setValue('durationType', exp.duration?.unit || 'hours');
    setValue('groupSize', exp.maxGroupSize || 10);
    setValue('city', exp.location?.city || '');
    setValue('country', exp.location?.country || '');
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate experience?')) return;
    try {
      await api.delete(`/experiences/${id}`);
      setExperiences((prev) => prev.filter((item) => item._id !== id));
      toast.success('Experience deleted');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('type', data.type);
      formData.append('description', data.description);
      formData.append('maxGroupSize', parseInt(data.groupSize));
      formData.append('price', JSON.stringify({
        amount: parseFloat(data.priceAmount),
      }));
      formData.append('duration', JSON.stringify({
        value: parseFloat(data.durationValue),
        unit: data.durationType,
      }));
      formData.append('location', JSON.stringify({
        city: data.city,
        country: data.country,
      }));

      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      if (editingExp) {
        await api.put(`/experiences/${editingExp._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Experience updated');
      } else {
        await api.post('/experiences', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Experience created');
      }
      setIsOpen(false);
      fetchExperiencesList();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Manage Experiences</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1 font-sans">Review cooking classes, temple walks, and workshops listed on the portal.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm flex items-center gap-1">
          <MdAdd /> Add Experience
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 skeleton animate-pulse" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-cq">
              <thead>
                <tr>
                  <th>Experience</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                {experiences.map((exp) => (
                  <tr key={exp._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={exp.coverImage || 'https://via.placeholder.com/150'} alt={exp.title} className="w-8 h-8 rounded-lg object-cover" />
                        <span>{exp.title}</span>
                      </div>
                    </td>
                    <td className="capitalize">{exp.type.replace('-', ' ')}</td>
                    <td>{exp.location?.city}, {exp.location?.country}</td>
                    <td>${exp.price?.amount}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(exp)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-teal-650">
                          <MdEdit />
                        </button>
                        <button onClick={() => handleDelete(exp._id)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-red-500">
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card bg-white dark:bg-slate-900 w-full max-w-xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-slate-850 dark:text-white font-display">
                  {editingExp ? 'Edit Experience' : 'Create New Experience'}
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <MdClose className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Experience Title</label>
                    <input
                      type="text"
                      className={`input ${errors.title ? 'input-error' : ''}`}
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="label">Type</label>
                    <select className="input" {...register('type')}>
                      <option value="cooking-class">Cooking Class</option>
                      <option value="temple-tour">Temple Tour</option>
                      <option value="village-tour">Village Tour</option>
                      <option value="dance-workshop">Dance Workshop</option>
                      <option value="craft-workshop">Craft Workshop</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Price (USD)</label>
                    <input type="number" className="input" {...register('priceAmount')} />
                  </div>
                  <div>
                    <label className="label">Duration Value</label>
                    <input type="number" className="input" {...register('durationValue')} />
                  </div>
                  <div>
                    <label className="label">Duration Unit</label>
                    <select className="input" {...register('durationType')}>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Group Size</label>
                    <input type="number" className="input" {...register('groupSize')} />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input type="text" className="input" {...register('city', { required: true })} />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input type="text" className="input" {...register('country', { required: true })} />
                  </div>
                </div>

                <div>
                  <label className="label">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="text-xs" />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea rows="4" className="input h-auto resize-none py-2" {...register('description', { required: true })} />
                </div>

                <button type="submit" disabled={isLoading} className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {isLoading ? 'Processing...' : 'Save Experience'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
