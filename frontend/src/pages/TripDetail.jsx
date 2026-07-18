import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuCalendar, 
  LuShare2, 
  LuCoins, 
  LuBus, 
  LuFileDown, 
  LuPlus, 
  LuTrash2,
  LuSparkles,
  LuHotel,
  LuUtensils,
  LuActivity,
  LuCompass
} from 'react-icons/lu';
import api from '../services/api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Edit notes state
  const [notes, setNotes] = useState('');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  // Edit transportation state
  const [transportType, setTransportType] = useState('mixed');
  const [transportDetails, setTransportDetails] = useState('');

  // Add activity state
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [activityCost, setActivityCost] = useState(0);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        const res = await api.get(`/trips/${id}`);
        const currentTrip = res.data.trip;
        setTrip(currentTrip);
        setNotes(currentTrip.notes || '');
        setTransportType(currentTrip.transport?.type || 'mixed');
        setTransportDetails(currentTrip.transport?.details || '');
      } catch (err) {
        console.error(err);
        toast.error('Trip details not found or access denied');
        navigate('/my-trips');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTripDetails();
  }, [id, navigate]);

  const handleUpdateNotesAndTransport = async () => {
    setIsUpdatingNotes(true);
    try {
      const res = await api.put(`/trips/${id}`, {
        notes,
        transport: { type: transportType, details: transportDetails },
      });
      setTrip(res.data.trip);
      toast.success('Notes and transit details updated');
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const handleToggleSharing = async () => {
    try {
      const nextPublicState = !trip.isPublic;
      const res = await api.put(`/trips/${id}`, {
        isPublic: nextPublicState,
        status: nextPublicState ? 'completed' : 'planning',
      });
      setTrip(res.data.trip);
      toast.success(nextPublicState ? 'Trip shared with public feed' : 'Trip private');
    } catch (err) {
      toast.error('Failed to toggle sharing');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    try {
      const updatedItinerary = trip.itinerary.map((day) => {
        if (day.day === activeDay) {
          return {
            ...day,
            activities: [
              ...day.activities,
              {
                title: activityTitle.trim(),
                description: activityDesc.trim(),
                cost: parseFloat(activityCost) || 0,
                type: 'activity',
              },
            ],
          };
        }
        return day;
      });

      const res = await api.put(`/trips/${id}`, { itinerary: updatedItinerary });
      setTrip(res.data.trip);
      setActivityTitle('');
      setActivityDesc('');
      setActivityCost(0);
      toast.success('Activity added');
    } catch (err) {
      toast.error('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (dayNum, actIdx) => {
    try {
      const updatedItinerary = trip.itinerary.map((day) => {
        if (day.day === dayNum) {
          const nextAct = [...day.activities];
          nextAct.splice(actIdx, 1);
          return { ...day, activities: nextAct };
        }
        return day;
      });

      const res = await api.put(`/trips/${id}`, { itinerary: updatedItinerary });
      setTrip(res.data.trip);
      toast.success('Activity removed');
    } catch (err) {
      toast.error('Failed to delete activity');
    }
  };

  // Export trip as PDF
  const handleExportPDF = () => {
    if (!trip) return;
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(22);
      doc.setTextColor(139, 92, 246); // primary accent lavender
      doc.text(trip.name, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Duration: ${trip.days} Days | Style: ${trip.travelStyle} | Budget: ₹${trip.budget?.total || 0}`, 14, 26);
      doc.line(14, 30, 196, 30);

      let yPos = 38;
      trip.itinerary.forEach((day, idx) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(30);
        doc.setFont('Helvetica', 'bold');
        doc.text(`Day ${day.day}: ${day.title || 'Exploration'}`, 14, yPos);
        yPos += 6;

        if (day.activities && day.activities.length > 0) {
          const tableRows = day.activities.map((act) => [
            act.time || 'N/A',
            act.title,
            act.description || '',
            act.cost ? `₹${act.cost}` : 'Free',
          ]);
          doc.autoTable({
            startY: yPos,
            head: [['Time', 'Activity', 'Description', 'Cost']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246] },
            margin: { left: 14, right: 14 },
          });
          yPos = doc.lastAutoTable.finalY + 10;
        } else {
          doc.setFontSize(10);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(120);
          doc.text('No activities scheduled for this day.', 16, yPos);
          yPos += 10;
        }
      });

      doc.save(`${trip.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_itinerary.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="container-cq py-12 space-y-8 animate-pulse">
        <div className="h-64 skeleton w-full rounded-3xl" />
        <div className="h-40 skeleton w-full rounded-3xl" />
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/* Banner */}
      <div className="bg-gradient-to-r from-accent to-[#C4B5FD] p-6 md:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border border-primary-100/10 animate-fade-in">
        <div className="space-y-2">
          <span className="badge bg-white/20 text-white font-extrabold text-[9px] tracking-widest border border-white/10 px-2 py-0.5 rounded-md uppercase">
            {trip.isAIGenerated ? '🤖 AI Crafted' : '🗺️ Self Planned'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black font-display">{trip.name}</h1>
          <p className="text-xs text-primary-50 flex items-center gap-1 font-semibold">
            📍 {trip.destinations?.map((d) => `${d.name} (${d.city}, ${d.country})`).join(' | ')}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="btn bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1 text-xs border border-white/20 font-bold py-2.5 px-4 cursor-pointer">
            <LuFileDown /> PDF Export
          </button>
          <button onClick={handleToggleSharing} className="btn bg-white dark:bg-dark-card text-accent hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl text-xs flex items-center gap-1 font-bold py-2.5 px-4 shadow-sm cursor-pointer transition-all border border-transparent dark:border-dark-border">
            <LuShare2 /> {trip.isPublic ? 'Unshare Trip' : 'Share Feed'}
          </button>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (Itinerary schedule list) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary-100 dark:border-dark-border no-scrollbar">
            {trip.itinerary?.map((day, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(day.day)}
                className={`px-4 py-2 rounded-xl border text-xs font-bold shrink-0 cursor-pointer transition-all ${
                  activeDay === day.day
                    ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                    : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
                }`}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {/* Activities list for active day */}
          {trip.itinerary?.map((day, dIdx) => {
            if (day.day !== activeDay) return null;
            return (
              <div key={dIdx} className="space-y-4">
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-3xl shadow-sm">
                  <h3 className="text-lg font-bold text-primary-900 dark:text-white flex items-center gap-1.5 border-b border-primary-50 dark:border-dark-border pb-3 font-display">
                    <LuCalendar className="text-accent" /> Day {day.day}: {day.title || 'Exploration'}
                  </h3>

                  {day.activities && day.activities.length > 0 ? (
                    <div className="space-y-3">
                      {day.activities.map((act, actIdx) => (
                        <div key={actIdx} className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/10 p-4 rounded-xl flex justify-between items-start gap-4 shadow-2xs">
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-primary-900 dark:text-white font-display">{act.title}</h4>
                            {act.description && <p className="text-[11px] text-primary-900/60 dark:text-dark-muted leading-relaxed font-semibold">{act.description}</p>}
                            <div className="flex gap-4 text-[10px] text-primary-900/40 dark:text-dark-muted/65 font-bold pt-1">
                              {act.time && <span>⏰ {act.time}</span>}
                              {act.cost !== undefined && <span>💰 ₹{act.cost}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteActivity(day.day, actIdx)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 rounded-lg cursor-pointer transition-colors"
                          >
                            <LuTrash2 className="text-base" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-primary-900/40 dark:text-dark-muted italic text-center py-6 font-semibold">No activities scheduled yet.</p>
                  )}
                </div>

                {/* Add activity form */}
                <form onSubmit={handleAddActivity} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-3xl shadow-sm">
                  <h4 className="font-bold text-sm text-primary-900 dark:text-white flex items-center gap-1.5 font-display">
                    <LuPlus className="text-accent text-lg" /> Add Scheduled Activity
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Activity title..."
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Estimate cost (INR, ₹)..."
                      value={activityCost || ''}
                      onChange={(e) => setActivityCost(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description / address notes..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                  />
                  <button type="submit" className="btn bg-accent hover:bg-accent/90 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-sm hover:shadow-glow cursor-pointer transition-all w-fit">
                    Add Activity
                  </button>
                </form>
              </div>
            );
          })}
        </div>

        {/* Right column (Budget summary & transit/notes settings) */}
        <div className="space-y-6">
          {/* Budget Breakdown Card */}
          <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-3xl shadow-sm">
            <h3 className="font-bold text-primary-900 dark:text-white font-display text-sm">Trip Financials</h3>
            <div className="flex justify-between items-center bg-primary-50/70 dark:bg-primary-950/20 p-4 rounded-2xl border border-primary-100/50">
              <span className="text-xs font-bold text-primary-900/50 dark:text-dark-muted">Total Budget:</span>
              <span className="text-lg font-black text-accent flex items-center">
                <LuCoins className="mr-1 text-sm" /> ₹{trip.budget?.total || 0}
              </span>
            </div>
            {trip.budget?.breakdown && (
              <div className="space-y-2.5 text-[11px] font-bold text-primary-900/60 dark:text-dark-muted">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><LuHotel className="text-accent" /> Accommodation:</span>
                  <span className="text-primary-900 dark:text-white">₹{trip.budget.breakdown.accommodation || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><LuBus className="text-accent" /> Local Transport:</span>
                  <span className="text-primary-900 dark:text-white">₹{trip.budget.breakdown.transport || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><LuUtensils className="text-accent" /> Food & Meals:</span>
                  <span className="text-primary-900 dark:text-white">₹{trip.budget.breakdown.food || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><LuActivity className="text-accent" /> Entrance & Tours:</span>
                  <span className="text-primary-900 dark:text-white">₹{trip.budget.breakdown.activities || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1"><LuCompass className="text-accent" /> Emergency Buffer:</span>
                  <span className="text-primary-900 dark:text-white">₹{trip.budget.breakdown.emergency || 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transit & Notes config edit */}
          <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-3xl shadow-sm">
            <h3 className="font-bold text-primary-900 dark:text-white flex items-center gap-1.5 text-sm font-display">
              <LuBus className="text-accent" /> Transit & General Notes
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Transit Type</label>
                <select value={transportType} onChange={(e) => setTransportType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all">
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car rental</option>
                  <option value="ship">Cruise / Ferry</option>
                  <option value="mixed">Mixed transit</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Transit Details</label>
                <input
                  type="text"
                  placeholder="Flight numbers, train schedule times..."
                  value={transportDetails}
                  onChange={(e) => setTransportDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">General Trip Notes</label>
                <textarea
                  rows="4"
                  placeholder="Hotel names, packing checklist, things to buy..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold h-auto resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleUpdateNotesAndTransport}
                disabled={isUpdatingNotes}
                className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow-glow cursor-pointer transition-all"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
