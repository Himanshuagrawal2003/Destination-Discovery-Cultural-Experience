import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdClose, MdPlace } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchDestinationsList = async () => {
    try {
      const res = await api.get('/destinations?limit=100');
      setDestinations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinationsList();
  }, []);

  const handleOpenCreate = () => {
    setEditingDest(null);
    setCoverFile(null);
    reset({
      name: '',
      country: '',
      city: '',
      category: 'cultural',
      description: '',
      budgetLevel: 'mid-range',
      budgetMin: 50,
      budgetMax: 200,
      openingHours: '',
      entryFee: 0,
      bestSeason: 'year-round',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (dest) => {
    setEditingDest(dest);
    setCoverFile(null);
    setValue('name', dest.name);
    setValue('country', dest.country);
    setValue('city', dest.city);
    setValue('category', dest.category);
    setValue('description', dest.description);
    setValue('budgetLevel', dest.budget?.level || 'mid-range');
    setValue('budgetMin', dest.budget?.min || 50);
    setValue('budgetMax', dest.budget?.max || 200);
    setValue('openingHours', dest.openingHours || '');
    setValue('entryFee', dest.entryFee?.amount || 0);
    setValue('bestSeason', dest.bestSeason?.[0] || 'year-round');
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this destination?')) return;
    try {
      await api.delete(`/destinations/${id}`);
      setDestinations((prev) => prev.filter((item) => item._id !== id));
      toast.success('Destination deactivated successfully');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('country', data.country);
      formData.append('city', data.city);
      formData.append('category', data.category);
      formData.append('description', data.description);
      formData.append('openingHours', data.openingHours);
      formData.append('bestSeason', JSON.stringify([data.bestSeason]));
      formData.append('budget', JSON.stringify({
        level: data.budgetLevel,
        min: parseFloat(data.budgetMin),
        max: parseFloat(data.budgetMax),
      }));
      formData.append('entryFee', JSON.stringify({
        amount: parseFloat(data.entryFee),
      }));

      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      if (editingDest) {
        await api.put(`/destinations/${editingDest._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Destination updated successfully');
      } else {
        await api.post('/destinations', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Destination created successfully');
      }
      setIsOpen(false);
      fetchDestinationsList();
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
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Manage Destinations</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Add, edit, or deactivate cultural destinations listed on the platform.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm flex items-center gap-1">
          <MdAdd /> Add Destination
        </button>
      </div>

      {/* Destinations list */}
      {isLoading ? (
        <div className="h-40 skeleton animate-pulse" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-cq">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                {destinations.map((dest) => (
                  <tr key={dest._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={dest.coverImage || 'https://via.placeholder.com/150'} alt={dest.name} className="w-8 h-8 rounded-lg object-cover" />
                        <span>{dest.name}</span>
                      </div>
                    </td>
                    <td>{dest.city}, {dest.country}</td>
                    <td className="capitalize">{dest.category}</td>
                    <td>👁️ {dest.viewCount || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(dest)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-teal-650">
                          <MdEdit />
                        </button>
                        <button onClick={() => handleDelete(dest._id)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-red-500">
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

      {/* Form Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card bg-white dark:bg-slate-900 w-full max-w-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-slate-850 dark:text-white font-display">
                  {editingDest ? 'Edit Destination' : 'Create New Destination'}
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <MdClose className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Destination Name</label>
                    <input
                      type="text"
                      className={`input ${errors.name ? 'input-error' : ''}`}
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="label">Category</label>
                    <select className="input" {...register('category')}>
                      <option value="historical">Historical</option>
                      <option value="cultural">Cultural</option>
                      <option value="beach">Beach</option>
                      <option value="mountain">Mountain</option>
                      <option value="city">City</option>
                      <option value="desert">Desert</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Country</label>
                    <input type="text" className="input" {...register('country', { required: true })} />
                  </div>

                  <div>
                    <label className="label">City</label>
                    <input type="text" className="input" {...register('city', { required: true })} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Budget Level</label>
                    <select className="input" {...register('budgetLevel')}>
                      <option value="budget">Budget</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Min Cost (USD)</label>
                    <input type="number" className="input" {...register('budgetMin')} />
                  </div>
                  <div>
                    <label className="label">Max Cost (USD)</label>
                    <input type="number" className="input" {...register('budgetMax')} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Opening Hours</label>
                    <input type="text" className="input" {...register('openingHours')} />
                  </div>
                  <div>
                    <label className="label">Entry Fee (USD)</label>
                    <input type="number" className="input" {...register('entryFee')} />
                  </div>
                  <div>
                    <label className="label">Best Season</label>
                    <select className="input" {...register('bestSeason')}>
                      <option value="year-round">Year-round</option>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="autumn">Autumn</option>
                      <option value="winter">Winter</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files[0])}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea rows="4" className="input h-auto resize-none py-2" {...register('description', { required: true })} />
                </div>

                <button type="submit" disabled={isLoading} className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {isLoading ? 'Processing...' : 'Save Destination'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
