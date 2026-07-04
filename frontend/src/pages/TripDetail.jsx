import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdToday, MdShare, MdAttachMoney, MdDirectionsTransit, MdPictureAsPdf, MdOutlineNote, MdAddCircleOutline, MdDeleteOutline } from 'react-icons/md';
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
      doc.setTextColor(79, 70, 229); // primary indigo
      doc.text(trip.name, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Duration: ${trip.days} Days | Style: ${trip.travelStyle} | Budget: $${trip.budget?.total || 0}`, 14, 26);
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
            act.cost ? `$${act.cost}` : 'Free',
          ]);
          doc.autoTable({
            startY: yPos,
            head: [['Time', 'Activity', 'Description', 'Cost']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
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
        <div className="h-64 skeleton w-full" />
        <div className="h-40 skeleton w-full" />
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-indigo-900 p-6 md:p-8 rounded-3xl text-white shadow flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-fade-in">
        <div className="space-y-2">
          <span className="badge bg-white/20 text-indigo-200 uppercase font-bold text-[9px] tracking-widest border border-white/10">
            {trip.isAIGenerated ? '🤖 AI Crafted' : '🗺️ Self Planned'}
          </span>
          <h1 className="text-2xl md:text-3xl font-black font-display">{trip.name}</h1>
          <p className="text-xs text-indigo-100 flex items-center gap-1">
            📍 {trip.destinations?.map((d) => `${d.name} (${d.city}, ${d.country})`).join(' | ')}
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="btn bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1 text-xs border border-white/20">
            <MdPictureAsPdf /> PDF Export
          </button>
          <button onClick={handleToggleSharing} className="btn btn-accent text-xs flex items-center gap-1">
            <MdShare /> {trip.isPublic ? 'Unshare Trip' : 'Share Feed'}
          </button>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column (Itinerary schedule list) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800/80 no-scrollbar">
            {trip.itinerary?.map((day, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(day.day)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                  activeDay === day.day
                    ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
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
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-805 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <MdToday className="text-primary-650" /> Day {day.day}: {day.title || 'Exploration'}
                  </h3>

                  {day.activities && day.activities.length > 0 ? (
                    <div className="space-y-3">
                      {day.activities.map((act, actIdx) => (
                        <div key={actIdx} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white">{act.title}</h4>
                            {act.description && <p className="text-[11px] text-slate-500 leading-relaxed">{act.description}</p>}
                            <div className="flex gap-4 text-[10px] text-slate-400 font-semibold pt-1">
                              {act.time && <span>⏰ {act.time}</span>}
                              {act.cost !== undefined && <span>💰 ${act.cost}</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteActivity(day.day, actIdx)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 rounded"
                          >
                            <MdDeleteOutline className="text-lg" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-6">No activities scheduled yet.</p>
                  )}
                </div>

                {/* Add activity form */}
                <form onSubmit={handleAddActivity} className="card p-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1">
                    <MdAddCircleOutline /> Add Scheduled Activity
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Activity title..."
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      className="input"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Estimate cost (USD)..."
                      value={activityCost || ''}
                      onChange={(e) => setActivityCost(e.target.value)}
                      className="input"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description / address notes..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    className="input"
                  />
                  <button type="submit" className="btn btn-primary btn-sm px-6">
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
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Trip Financials</h3>
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-500">Total Budget:</span>
              <span className="text-lg font-black text-primary-600 dark:text-primary-400 flex items-center">
                <MdAttachMoney /> {trip.budget?.total || 0}
              </span>
            </div>
            {trip.budget?.breakdown && (
              <div className="space-y-2 text-2xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>🏨 Accommodation:</span>
                  <span>${trip.budget.breakdown.accommodation || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚗 Local Transport:</span>
                  <span>${trip.budget.breakdown.transport || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>🍔 Food & Meals:</span>
                  <span>${trip.budget.breakdown.food || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>🎟️ Entrance & Tours:</span>
                  <span>${trip.budget.breakdown.activities || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>🚨 Emergency Buffer:</span>
                  <span>${trip.budget.breakdown.emergency || 0}</span>
                </div>
              </div>
            )}
          </div>

          {/* Transit & Notes config edit */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1 text-sm">
              <MdDirectionsTransit /> Transit & General Notes
            </h3>

            <div className="space-y-3">
              <div>
                <label className="label text-2xs">Transit Type</label>
                <select value={transportType} onChange={(e) => setTransportType(e.target.value)} className="input">
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car rental</option>
                  <option value="ship">Cruise / Ferry</option>
                  <option value="mixed">Mixed transit</option>
                </select>
              </div>

              <div>
                <label className="label text-2xs">Transit Details</label>
                <input
                  type="text"
                  placeholder="Flight numbers, train schedule times..."
                  value={transportDetails}
                  onChange={(e) => setTransportDetails(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label text-2xs">General Trip Notes</label>
                <textarea
                  rows="4"
                  placeholder="Hotel names, packing checklist, things to buy..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input h-auto resize-none py-2 text-xs"
                />
              </div>

              <button
                onClick={handleUpdateNotesAndTransport}
                disabled={isUpdatingNotes}
                className="w-full btn btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
