import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LuBookmark, LuTrash2, LuMapPin, LuStar, LuX } from 'react-icons/lu';
import api from '../services/api';
import toast from 'react-hot-toast';

// Helper to repair truncated/cut-off JSON strings by closing open structures
const repairTruncatedJSON = (jsonString) => {
  if (!jsonString) return '';
  let cleaned = jsonString.trim();
  let inString = false;
  let escape = false;
  const stack = [];
  
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') stack.pop();
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') stack.pop();
      }
    }
  }
  
  let repaired = cleaned;
  if (inString) repaired += '"';
  while (stack.length > 0) {
    const openChar = stack.pop();
    repaired += (openChar === '{' ? '}' : ']');
  }
  return repaired;
};

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAiBookmark, setSelectedAiBookmark] = useState(null);

  const fetchBookmarksList = async () => {
    setIsLoading(true);
    try {
      const url = activeType ? `/bookmarks?type=${activeType}` : '/bookmarks';
      const res = await api.get(url);
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarksList();
  }, [activeType]);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((item) => item._id !== id));
      toast.success('Bookmark removed');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">My Bookmarks</h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Review saved destinations, hidden gems, and cultural events.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary-100 dark:border-dark-border no-scrollbar">
        {[
          { value: '', label: 'All Items' },
          { value: 'destination', label: 'Destinations' },
          { value: 'hidden-gem', label: 'Hidden Gems' },
          { value: 'event', label: 'Events' },
          { value: 'cultural-guide', label: 'Cultural Guides' },
          { value: 'budget-planner', label: 'Budget Planners' },
          { value: 'food-guide', label: 'Food Guides' },
          { value: 'route-planner', label: 'Route Plans' }
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold shrink-0 cursor-pointer transition-all ${
              activeType === type.value
                ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 skeleton animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {bookmarks.map((bookmark) => {
              const item = bookmark.isAiHistory ? bookmark.aiItem : (bookmark.destination || bookmark.event || bookmark.hiddenGem);
              if (!item) return null;
              const name = item.name || item.title;
              const img = item.coverImage || item.image;
              const detailsLink = bookmark.destination
                ? `/destinations/${item.slug || item._id}`
                : bookmark.isAiHistory
                  ? `/ai/history?type=${bookmark.itemType}&isSaved=true`
                  : `/${bookmark.itemType}s`;

              return (
                <motion.div
                  key={bookmark._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative"
                >
                  {bookmark.itemType === 'event' ? (
                    <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border overflow-hidden flex flex-col rounded-2xl select-none">
                      <div className="relative h-44 overflow-hidden bg-primary-50">
                        {img ? (
                          <img src={img} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-900/40">
                            <LuBookmark className="text-4xl" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-dark-card/95 text-accent font-extrabold text-2xs rounded-lg shadow-sm capitalize">
                          {bookmark.itemType.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <h3 className="font-bold text-primary-900 dark:text-white truncate font-display text-sm">
                          {name}
                        </h3>
                        {(item.city || item.country) && (
                          <p className="text-2xs text-primary-900/50 dark:text-dark-muted flex items-center gap-1 font-semibold">
                            <LuMapPin className="text-accent" /> {item.city ? `${item.city}, ` : ''}{item.country || ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={bookmark.isAiHistory ? '#' : detailsLink}
                      onClick={(e) => {
                        if (bookmark.isAiHistory) {
                          e.preventDefault();
                          setSelectedAiBookmark(bookmark);
                        }
                      }}
                      className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl cursor-pointer"
                    >
                      <div className="relative h-44 overflow-hidden bg-primary-50">
                        {img ? (
                          <img src={img} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-900/40">
                            <LuBookmark className="text-4xl" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-dark-card/95 text-accent font-extrabold text-2xs rounded-lg shadow-sm capitalize">
                          {bookmark.itemType.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <h3 className="font-bold text-primary-900 dark:text-white truncate group-hover:text-accent transition-colors font-display text-sm">
                          {name}
                        </h3>
                        {(item.city || item.country) && (
                          <p className="text-2xs text-primary-900/50 dark:text-dark-muted flex items-center gap-1 font-semibold">
                            <LuMapPin className="text-accent" /> {item.city ? `${item.city}, ` : ''}{item.country || ''}
                          </p>
                        )}
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={(e) => handleDelete(bookmark._id, e)}
                    className="absolute right-3 top-3 p-2 bg-white/90 dark:bg-dark-card/90 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl shadow-sm border border-primary-100 dark:border-dark-border cursor-pointer transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <LuTrash2 className="text-base" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <span className="text-6xl block animate-float">🔖</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Saved Bookmarks</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed font-semibold">Explore destinations, cultural experiences, or local events, and save your favorites here.</p>
        </div>
      )}

      {/* AI Bookmark Popup Modal */}
      <AnimatePresence>
        {selectedAiBookmark && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAiBookmark(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#FAF7FF] dark:bg-dark-bg border border-primary-100 dark:border-dark-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-primary-100 dark:border-dark-border flex justify-between items-center bg-white dark:bg-dark-card">
                <div>
                  <span className="px-2 py-0.5 rounded bg-accent/15 text-accent uppercase text-[9px] font-extrabold tracking-wide">
                    {selectedAiBookmark.aiItem.type?.replace('-', ' ') || ''}
                  </span>
                  <h3 className="font-extrabold text-lg text-primary-900 dark:text-white font-display mt-1">
                    {selectedAiBookmark.aiItem.name || selectedAiBookmark.aiItem.title || 'Saved AI Guide'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAiBookmark(null)}
                  className="p-2 hover:bg-primary-50 dark:hover:bg-dark-border text-primary-900/60 dark:text-dark-muted rounded-xl transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <LuX className="text-xl" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {(() => {
                  const item = selectedAiBookmark.aiItem;
                  if (!item || !item.response) return null;
                  
                  const cleaned = item.response ? item.response.replace(/```json/gi, '').replace(/```/g, '').trim() : '';
                  
                  let jsonText = cleaned;
                  const startIndex = cleaned.indexOf('{');
                  const endIndex = cleaned.lastIndexOf('}');
                  if (startIndex > -1 && endIndex > startIndex) {
                    jsonText = cleaned.substring(startIndex, endIndex + 1);
                  }
                  
                  const repaired = repairTruncatedJSON(jsonText);
                  let parsed = null;
                  try {
                    parsed = JSON.parse(repaired);
                  } catch (e) {
                    return <div className="text-xs text-primary-900/80 dark:text-slate-300 whitespace-pre-line leading-relaxed">{cleaned}</div>;
                  }

                  // Custom renderer for route-planner inside popups
                  if (item.type === 'route-planner') {
                    return (
                      <div className="space-y-4">
                        {parsed.bestRoute && (
                          <div className="p-3.5 bg-accent/5 dark:bg-accent/10 border border-accent/15 rounded-xl">
                            <p className="text-[10px] font-black uppercase text-accent tracking-wider">CultureQuest Tip</p>
                            <p className="text-xs font-semibold italic text-primary-900/80 dark:text-slate-350">"{parsed.bestRoute}"</p>
                          </div>
                        )}
                        <div className="space-y-3">
                          {Array.isArray(parsed.options) && parsed.options.map((opt, oIdx) => (
                            <div key={oIdx} className="bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 rounded-xl space-y-3 shadow-xs">
                              <div className="flex justify-between items-center border-b border-primary-100 dark:border-dark-border pb-2">
                                <h5 className="font-bold text-xs text-primary-900 dark:text-white">{opt.title}</h5>
                                <div className="flex gap-2 text-[9px] font-bold">
                                  <span className="text-accent bg-accent/10 px-2 py-0.5 rounded-md">{opt.cost}</span>
                                  <span className="text-primary-900/60 dark:text-dark-muted bg-primary-100/40 dark:bg-primary-900/25 px-2 py-0.5 rounded-md">{opt.duration}</span>
                                </div>
                              </div>
                              
                              {Array.isArray(opt.pathway) && (
                                <div className="pl-2 border-l border-primary-200 dark:border-dark-border/40 space-y-1">
                                  {opt.pathway.map((pStep, pIdx) => (
                                    <p key={pIdx} className="text-[10px] text-primary-900/70 dark:text-dark-muted font-medium flex items-center gap-1.5">
                                      <span className="w-1 h-1 bg-accent rounded-full shrink-0" />
                                      {pStep}
                                    </p>
                                  ))}
                                </div>
                              )}
                              
                              {Array.isArray(opt.bookingInfo) && opt.bookingInfo.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black uppercase tracking-wider text-primary-900/50 dark:text-dark-muted">Where to Book:</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {opt.bookingInfo.map((bk, bIdx) => (
                                      <span key={bIdx} className="text-[9px] font-bold text-accent bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded">
                                        {bk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const formatText = (text, prefixColorClass) => {
                    if (typeof text !== 'string') return String(text);
                    const separatorIndex = text.indexOf(':') > -1 ? text.indexOf(':') : text.indexOf('-');
                    if (separatorIndex > 0 && separatorIndex < 40) {
                      const prefix = text.substring(0, separatorIndex).trim();
                      const symbol = text[separatorIndex];
                      const rest = text.substring(separatorIndex + 1).trim();
                      return (
                        <>
                          <strong className={`font-extrabold uppercase tracking-wide text-[10px] ${prefixColorClass} block sm:inline mr-1`}>{prefix}{symbol}</strong>
                          <span>{rest}</span>
                        </>
                      );
                    }
                    return text;
                  };

                  const getColors = (type) => {
                    if (type === 'cultural-guide') return { prefix: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-900/20', bg: 'bg-amber-50/30 dark:bg-amber-950/5' };
                    if (type === 'food-guide') return { prefix: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-900/20', bg: 'bg-purple-50/30 dark:bg-purple-950/5' };
                    return { prefix: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-900/20', bg: 'bg-blue-50/30 dark:bg-blue-950/5' };
                  };

                  const colors = getColors(item.type);

                  return (
                    <div className="space-y-4">
                      {Object.entries(parsed).map(([key, val]) => {
                        if (val === '{' || val === '}' || val === '[' || val === ']') return null;
                        const label = key.replace(/([A-Z])/g, ' $1').trim();
                        
                        return (
                          <div key={key} className="space-y-2 border-b border-primary-100 dark:border-dark-border pb-4 last:border-0 last:pb-0">
                            <h5 className="font-bold text-primary-900 dark:text-white text-xs uppercase tracking-wide flex items-center gap-1.5 capitalize font-display">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0 animate-pulse" />
                              {label}
                            </h5>
                            
                            <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl text-xs font-semibold leading-relaxed text-primary-900/80 dark:text-slate-350 space-y-2.5 shadow-sm`}>
                              {Array.isArray(val) ? (
                                val.map((v, i) => {
                                  const text = typeof v === 'object' && v !== null
                                    ? `${v.name || v.dish || v.title || ''}: ${v.description || v.value || JSON.stringify(v)}`
                                    : String(v);
                                  
                                  const isSpecial = /critical|important|warning|danger|never|do not|avoid|must/i.test(text);
                                  if (isSpecial) {
                                    return (
                                      <div key={i} className={`p-3.5 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-dark-bg/60 border flex items-start gap-2 shadow-2xs`}>
                                        <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                                        <div className="text-xs leading-relaxed font-semibold">{formatText(text, colors.prefix)}</div>
                                      </div>
                                    );
                                  }
                                  return <p key={i}>{formatText(text, colors.prefix)}</p>;
                                })
                              ) : typeof val === 'object' && val !== null ? (
                                Object.entries(val).map(([subK, subV], i) => {
                                  const subLabel = subK.replace(/([A-Z])/g, ' $1').trim();
                                  
                                  if (typeof subV === 'object' && subV !== null && !Array.isArray(subV)) {
                                    return (
                                      <div key={i} className="pl-2 border-l-2 border-primary-200 dark:border-dark-border/40 mt-2">
                                        <span className={`font-bold capitalize text-[10px] ${colors.prefix}`}>{subLabel}:</span>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-medium pl-2 mt-0.5">
                                          {Object.entries(subV).map(([k, valVal]) => (
                                            <div key={k} className="flex justify-between border-b border-primary-100/30 pb-0.5 last:border-0">
                                              <span className="capitalize text-primary-900/60 dark:text-dark-muted font-bold">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                              <span className="font-extrabold text-accent">₹{String(valVal)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  if (Array.isArray(subV)) {
                                    return (
                                      <div key={i} className="pl-2 border-l-2 border-primary-200 dark:border-dark-border/40 mt-2">
                                        <span className={`font-bold capitalize text-[10px] ${colors.prefix}`}>{subLabel}:</span>
                                        <ul className="list-disc list-inside text-[10px] text-primary-900/70 dark:text-slate-350 space-y-0.5 pl-2 mt-0.5">
                                          {subV.map((tip, idx) => (
                                            <li key={idx}>{tip}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  
                                  const text = String(subV);
                                  const isSpecial = /critical|important|warning|danger|never|do not|avoid|must/i.test(text) || /critical|important|warning|danger|never|do not|avoid|must/i.test(subLabel);
                                  
                                  if (isSpecial) {
                                    return (
                                      <div key={i} className={`p-3.5 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-dark-bg/60 border flex items-start gap-2 shadow-2xs`}>
                                        <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                                        <div className="text-xs leading-relaxed">
                                          <strong className={`capitalize ${colors.prefix} font-extrabold block sm:inline mr-1`}>{subLabel}:</strong>
                                          <span>{text}</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <p key={i} className="text-[10px]">
                                      <strong className={`capitalize ${colors.prefix} font-extrabold block sm:inline mr-1`}>{subLabel}:</strong>
                                      <span className="font-extrabold text-accent">{text}</span>
                                    </p>
                                  );
                                })
                              ) : (
                                (() => {
                                  const isSpecial = /critical|important|warning|danger|never|do not|avoid|must/i.test(String(val));
                                  if (isSpecial) {
                                    return (
                                      <div className={`p-3.5 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-dark-bg/60 border flex items-start gap-2 shadow-2xs`}>
                                        <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                                        <div className="text-xs leading-relaxed font-semibold">{formatText(String(val), colors.prefix)}</div>
                                      </div>
                                    );
                                  }
                                  return <p>{formatText(String(val), colors.prefix)}</p>;
                                })()
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-primary-100 dark:border-dark-border flex justify-end bg-white dark:bg-dark-card rounded-b-3xl">
                <button
                  onClick={() => setSelectedAiBookmark(null)}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:shadow-glow"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
