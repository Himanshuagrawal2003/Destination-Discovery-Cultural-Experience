import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchEventsList = async () => {
    try {
      const res = await api.get('/events?limit=100');
      setEvents(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsList();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setCoverFile(null);
    reset({
      title: '',
      type: 'festival',
      description: '',
      startDate: '',
      endDate: '',
      venue: '',
      city: '',
      country: '',
      amount: 0,
      isFree: true,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setCoverFile(null);
    setValue('title', evt.title);
    setValue('type', evt.type);
    setValue('description', evt.description);
    setValue('startDate', evt.startDate ? new Date(evt.startDate).toISOString().split('T')[0] : '');
    setValue('endDate', evt.endDate ? new Date(evt.endDate).toISOString().split('T')[0] : '');
    setValue('venue', evt.location?.venue || '');
    setValue('city', evt.location?.city || '');
    setValue('country', evt.location?.country || '');
    setValue('amount', evt.price?.amount || 0);
    setValue('isFree', evt.price?.isFree || false);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate event listing?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((item) => item._id !== id));
      toast.success('Event deleted');
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
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('location', JSON.stringify({
        venue: data.venue,
        city: data.city,
        country: data.country,
      }));
      formData.append('price', JSON.stringify({
        isFree: data.isFree,
        amount: parseFloat(data.amount),
      }));

      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      if (editingEvent) {
        await api.put(`/events/${editingEvent._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Event updated');
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Event created');
      }
      setIsOpen(false);
      fetchEventsList();
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
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Manage Events</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Review traditional concerts, gatherings, and seasonal regional festivals.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm flex items-center gap-1">
          <MdAdd /> Add Event
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
                  <th>Event</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Dates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                {events.map((evt) => (
                  <tr key={evt._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={evt.coverImage || 'https://via.placeholder.com/150'} alt={evt.title} className="w-8 h-8 rounded-lg object-cover" />
                        <span>{evt.title}</span>
                      </div>
                    </td>
                    <td className="capitalize">{evt.type}</td>
                    <td>{evt.location?.city}, {evt.location?.country}</td>
                    <td>{new Date(evt.startDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleOpenEdit(evt)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-teal-650">
                          <MdEdit />
                        </button>
                        <button onClick={() => handleDelete(evt._id)} className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-red-500">
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
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                  <MdClose className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Event Title</label>
                    <input
                      type="text"
                      className={`input ${errors.title ? 'input-error' : ''}`}
                      {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="label">Event Type</label>
                    <select className="input" {...register('type')}>
                      <option value="festival">Festival</option>
                      <option value="concert">Concert</option>
                      <option value="food-fair">Food Fair</option>
                      <option value="religious">Religious</option>
                      <option value="traditional-performance">Traditional Performance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" className="input" {...register('startDate', { required: true })} />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" className="input" {...register('endDate', { required: true })} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Venue Venue</label>
                    <input type="text" className="input" {...register('venue')} />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 pt-8">
                    <input type="checkbox" id="isFree" className="accent-teal-600 rounded" {...register('isFree')} />
                    <label htmlFor="isFree" className="text-xs font-semibold select-none cursor-pointer">This Event is Free</label>
                  </div>
                  <div>
                    <label className="label">Price (USD)</label>
                    <input type="number" className="input" {...register('amount')} />
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
                  {isLoading ? 'Processing...' : 'Save Event'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
