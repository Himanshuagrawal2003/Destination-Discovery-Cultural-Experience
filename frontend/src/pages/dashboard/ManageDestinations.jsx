import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuPlus, 
  LuPencil, 
  LuTrash2, 
  LuSearch, 
  LuMapPin, 
  LuFileText, 
  LuDollarSign, 
  LuGlobe, 
  LuX,
  LuUpload,
  LuSparkles
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null); // null for create, destination object for edit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    category: 'city',
    city: '',
    country: '',
    description: '',
    history: '',
    culture: '',
    latitude: '',
    longitude: '',
    budgetMin: '',
    budgetMax: '',
    budgetLevel: 'mid-range',
    entryFeeAmount: '',
    entryFeeNotes: '',
    highlights: '',
    travelTips: '',
    coverImageUrl: ''
  });
  
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Fetch all destinations
  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/destinations?limit=100');
      setDestinations(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch destinations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Filtered list
  const filteredDestinations = destinations.filter(dest => {
    const query = searchQuery.toLowerCase();
    return (
      dest.name?.toLowerCase().includes(query) ||
      dest.city?.toLowerCase().includes(query) ||
      dest.country?.toLowerCase().includes(query) ||
      dest.category?.toLowerCase().includes(query)
    );
  });

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingDest(null);
    setFormData({
      name: '',
      category: 'city',
      city: '',
      country: '',
      description: '',
      history: '',
      culture: '',
      latitude: '',
      longitude: '',
      budgetMin: '',
      budgetMax: '',
      budgetLevel: 'mid-range',
      entryFeeAmount: '0',
      entryFeeNotes: '',
      highlights: '',
      travelTips: '',
      coverImageUrl: ''
    });
    setCoverImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (dest) => {
    setEditingDest(dest);
    setFormData({
      name: dest.name || '',
      category: dest.category || 'city',
      city: dest.city || '',
      country: dest.country || '',
      description: dest.description || '',
      history: dest.history || '',
      culture: dest.culture || '',
      latitude: dest.location?.coordinates?.[1] || '',
      longitude: dest.location?.coordinates?.[0] || '',
      budgetMin: dest.budget?.min || '',
      budgetMax: dest.budget?.max || '',
      budgetLevel: dest.budget?.level || 'mid-range',
      entryFeeAmount: dest.entryFee?.amount !== undefined ? dest.entryFee.amount : '0',
      entryFeeNotes: dest.entryFee?.notes || '',
      highlights: dest.highlights ? dest.highlights.join(', ') : '',
      travelTips: dest.travelTips ? dest.travelTips.join(', ') : '',
      coverImageUrl: dest.coverImage || ''
    });
    setCoverImageFile(null);
    setImagePreview(dest.coverImage || '');
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/destinations/${id}`);
      toast.success(`${name} deleted successfully`);
      fetchDestinations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete destination');
    }
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        city: formData.city.trim(),
        country: formData.country.trim(),
        description: formData.description.trim(),
        history: formData.history.trim(),
        culture: formData.culture.trim(),
        budget: {
          min: Number(formData.budgetMin) || 0,
          max: Number(formData.budgetMax) || 0,
          level: formData.budgetLevel
        },
        entryFee: {
          amount: Number(formData.entryFeeAmount) || 0,
          notes: formData.entryFeeNotes.trim()
        },
        location: {
          type: 'Point',
          coordinates: [Number(formData.longitude) || 0, Number(formData.latitude) || 0]
        },
        highlights: formData.highlights ? formData.highlights.split(',').map(h => h.trim()).filter(Boolean) : [],
        travelTips: formData.travelTips ? formData.travelTips.split(',').map(t => t.trim()).filter(Boolean) : [],
        coverImage: formData.coverImageUrl
      };

      const submitData = new FormData();
      if (coverImageFile) {
        submitData.append('coverImage', coverImageFile);
      }
      submitData.append('data', JSON.stringify(payload));

      if (editingDest) {
        // Update
        await api.put(`/destinations/${editingDest._id}`, submitData);
        toast.success('Destination updated successfully');
      } else {
        // Create
        await api.post('/destinations', submitData);
        toast.success('Destination created successfully');
      }

      setIsModalOpen(false);
      fetchDestinations();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save destination');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-accent to-[#C4B5FD] p-6 rounded-3xl text-white shadow-md">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold font-display leading-tight flex items-center gap-2">
            🛡️ Manage Destinations
          </h1>
          <p className="text-xs text-primary-50/90 font-medium">Add, update, or remove cultural travel destinations from the platform.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn bg-white dark:bg-dark-card text-accent hover:bg-primary-50 dark:hover:bg-primary-900/30 flex items-center gap-1.5 shrink-0 shadow-md font-bold text-xs transition-all cursor-pointer border border-transparent dark:border-dark-border"
        >
          <LuPlus className="text-base" /> Add Destination
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 rounded-2xl flex items-center gap-3">
        <LuSearch className="text-primary-400 text-lg shrink-0" />
        <input
          type="text"
          placeholder="Search destinations by name, city, country, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none text-sm font-semibold"
        />
      </div>

      {/* Destinations List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 skeleton animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDestinations.map((dest) => (
            <div 
              key={dest._id}
              className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 flex gap-4 rounded-2xl hover:shadow-sm transition-all relative overflow-hidden"
            >
              {/* Cover Thumbnail */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                {dest.coverImage ? (
                  <img 
                    src={dest.coverImage} 
                    alt={dest.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 dark:bg-dark-border flex items-center justify-center text-primary-400">
                    🏜️
                  </div>
                )}
              </div>

              {/* Info details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-sm text-primary-900 dark:text-white truncate font-display">
                      {dest.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-950 text-accent text-[9px] font-black uppercase rounded shrink-0 tracking-wider">
                      {dest.category}
                    </span>
                  </div>
                  <p className="text-2xs text-primary-900/50 dark:text-dark-muted font-bold flex items-center gap-1 mt-1">
                    <LuMapPin className="text-accent" /> {dest.city}, {dest.country}
                  </p>
                  <p className="text-2xs text-primary-900/60 dark:text-dark-muted/80 mt-2 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-primary-50 dark:border-dark-border mt-2">
                  <button
                    onClick={() => handleOpenEdit(dest)}
                    className="p-2 text-primary-600 hover:text-accent dark:text-dark-muted hover:dark:text-white rounded-lg hover:bg-primary-50 dark:hover:bg-dark-border transition-colors cursor-pointer"
                    title="Edit Destination"
                  >
                    <LuPencil className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(dest._id, dest.name)}
                    className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    title="Delete Destination"
                  >
                    <LuTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-3 rounded-2xl">
          <span className="text-5xl block">🏜️</span>
          <h3 className="text-base font-bold text-primary-900 dark:text-white">No Destinations Found</h3>
          <p className="text-2xs max-w-xs mx-auto leading-relaxed">Try typing a different name or add a new destination to the system.</p>
        </div>
      )}

      {/* CRUD Overlay Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dark-card rounded-3xl border border-primary-100 dark:border-dark-border w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-primary-100 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-card z-10">
                <div>
                  <h2 className="text-lg font-black text-primary-900 dark:text-white font-display">
                    {editingDest ? '✏️ Edit Destination' : '✨ Add New Destination'}
                  </h2>
                  <p className="text-[10px] text-primary-900/40 dark:text-dark-muted font-bold uppercase mt-0.5">
                    {editingDest ? `Updating ${editingDest.name}` : 'Create a new cultural place'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-primary-900/40 dark:text-dark-muted hover:text-primary-900 dark:hover:text-white hover:bg-primary-50 dark:hover:bg-dark-border rounded-xl transition-colors"
                >
                  <LuX className="text-lg" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                {/* Visual Cover upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary-950 dark:text-slate-200 uppercase tracking-wider">Cover Image</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-primary-200 dark:border-dark-border rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-accent transition-colors relative cursor-pointer group bg-primary-50/20">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <LuUpload className="text-2xl text-accent mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-2xs font-bold text-primary-900/60 dark:text-dark-muted">Upload Image File</p>
                      <p className="text-[9px] text-primary-900/40 dark:text-dark-muted/50 mt-1">JPEG, PNG, WEBP up to 5MB</p>
                    </div>

                    <div className="flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-primary-900/50 dark:text-dark-muted uppercase tracking-wider">Or Image URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg..."
                          value={formData.coverImageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, coverImageUrl: e.target.value });
                            if (!coverImageFile) setImagePreview(e.target.value);
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                        />
                      </div>
                      
                      {imagePreview && (
                        <div className="h-20 rounded-xl overflow-hidden bg-primary-50 relative border border-primary-100 dark:border-dark-border">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setCoverImageFile(null);
                              setImagePreview('');
                              setFormData({ ...formData, coverImageUrl: '' });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-[10px]"
                            title="Clear image"
                          >
                            <LuX />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="divider border-primary-100 dark:border-dark-border my-2" />

                {/* Section 1: General Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent uppercase tracking-wider border-b border-primary-50 dark:border-dark-border pb-1">
                    General Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Destination Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Category *</label>
                      <select 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all capitalize"
                      >
                        {['beach', 'mountain', 'city', 'desert', 'forest', 'historical', 'adventure', 'cultural', 'wildlife', 'other'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">City *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Country *</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Description *</label>
                    <textarea 
                      required 
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write a rich description about this place..."
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="divider border-primary-100 dark:border-dark-border my-2" />

                {/* Section 2: Heritage & History */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent uppercase tracking-wider border-b border-primary-50 dark:border-dark-border pb-1">
                    Heritage, Story & Culture
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Folklore / Historical Stories</label>
                      <textarea 
                        rows="4"
                        value={formData.history}
                        onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                        placeholder="Share local legends or history..."
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Cultural Norms & Sacred Taboos</label>
                      <textarea 
                        rows="4"
                        value={formData.culture}
                        onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                        placeholder="Sacred guidelines, local taboos, dress codes..."
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="divider border-primary-100 dark:border-dark-border my-2" />

                {/* Section 3: Financials, Geospatial & Tags */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-accent uppercase tracking-wider border-b border-primary-50 dark:border-dark-border pb-1">
                    Financials, Coordinates & Tags
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Daily Min Budget (₹) *</label>
                      <input 
                        type="number" 
                        required
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Daily Max Budget (₹) *</label>
                      <input 
                        type="number" 
                        required
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Budget Level *</label>
                      <select 
                        required
                        value={formData.budgetLevel}
                        onChange={(e) => setFormData({ ...formData, budgetLevel: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all capitalize"
                      >
                        {['budget', 'mid-range', 'luxury'].map(lvl => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Entry Fee (₹)</label>
                      <input 
                        type="number" 
                        value={formData.entryFeeAmount}
                        onChange={(e) => setFormData({ ...formData, entryFeeAmount: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Entry Fee Notes</label>
                      <input 
                        type="text" 
                        value={formData.entryFeeNotes}
                        onChange={(e) => setFormData({ ...formData, entryFeeNotes: e.target.value })}
                        placeholder="e.g. per person, free for children"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="e.g. 27.1751"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="e.g. 78.0421"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Highlights (comma separated)</label>
                      <input 
                        type="text" 
                        value={formData.highlights}
                        onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                        placeholder="Taj Mahal, Agra Fort, Mughal Gardens"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-primary-900/60 dark:text-dark-muted uppercase tracking-wider">Travel Tips (comma separated)</label>
                      <input 
                        type="text" 
                        value={formData.travelTips}
                        onChange={(e) => setFormData({ ...formData, travelTips: e.target.value })}
                        placeholder="Visit early morning, hire guides, dress modest"
                        className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-primary-100 dark:border-dark-border sticky bottom-0 bg-white dark:bg-dark-card z-10 py-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 text-primary-900 dark:text-primary-200 font-bold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn bg-accent hover:bg-accent/90 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <LuSparkles className="text-sm" /> Save Destination
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
