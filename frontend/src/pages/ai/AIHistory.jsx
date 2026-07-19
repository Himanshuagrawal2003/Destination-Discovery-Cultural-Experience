import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuHistory, LuTrash, LuSparkles, LuBookmark } from 'react-icons/lu';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
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

export default function AIHistory() {
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get('type') || '';
  const urlSaved = searchParams.get('isSaved') === 'true';

  const [history, setHistory] = useState([]);
  const [activeType, setActiveType] = useState(urlType);
  const [onlySaved, setOnlySaved] = useState(urlSaved || false);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state if URL query params update dynamically
  useEffect(() => {
    const nextType = searchParams.get('type') || '';
    const nextSaved = searchParams.get('isSaved') === 'true';
    setActiveType(nextType);
    if (searchParams.get('isSaved')) {
      setOnlySaved(nextSaved);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeType) queryParams.set('type', activeType);
        if (onlySaved) queryParams.set('isSaved', 'true');
        const res = await api.get(`/ai/history?${queryParams.toString()}`);
        setHistory(res.data.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [activeType, onlySaved]);

  const handleToggleSave = async (id, currentIsSaved) => {
    try {
      await api.put(`/ai/history/${id}`, { isSaved: !currentIsSaved });
      setHistory((prev) => 
        prev.map((item) => (item._id === id ? { ...item, isSaved: !currentIsSaved } : item))
      );
      toast.success(!currentIsSaved ? 'Saved to Bookmarks!' : 'Removed from Bookmarks');
    } catch (err) {
      toast.error('Failed to update save status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      toast.success('History entry deleted');
    } catch (err) {
      toast.error('Failed to delete history');
    }
  };

  const getCleanPromptText = (item) => {
    if (item.type === 'route-planner') {
      return `Route: ${item.metadata?.origin || 'Unknown'} to ${item.metadata?.destination || 'Unknown'}`;
    }
    if (item.type === 'cultural-guide') {
      const cityStr = item.metadata?.city ? `${item.metadata.city}, ` : '';
      return `Cultural Guide for ${cityStr}${item.metadata?.country || 'Unknown'}`;
    }
    if (item.type === 'food-guide') {
      const cityStr = item.metadata?.city ? `${item.metadata.city}, ` : '';
      return `Food Guide for ${cityStr}${item.metadata?.country || 'Unknown'}`;
    }
    if (item.type === 'festival-guide') {
      const monthStr = item.metadata?.month ? ` in ${item.metadata.month}` : '';
      return `Festival Guide for ${item.metadata?.country || 'Unknown'}${monthStr}`;
    }
    if (item.type === 'budget-planner') {
      return `Budget Plan for ${item.metadata?.destination || 'Unknown'} (${item.metadata?.duration || 1} Days)`;
    }
    if (item.type === 'recommendation') {
      return `Destination Recommendations (${item.metadata?.budget || 'mid-range'} budget, ${item.metadata?.travelStyle || 'solo'} style)`;
    }
    if (item.type === 'storytelling') {
      return `Storytelling for ${item.metadata?.destinationName || 'Unknown'}`;
    }
    if (item.type === 'itinerary') {
      return `Itinerary for ${item.metadata?.destination || 'Unknown'} (${item.metadata?.days || 3} Days)`;
    }
    if (item.prompt && item.prompt.length > 80) {
      return item.prompt.substring(0, 80) + '...';
    }
    return item.prompt || 'AI Query';
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
            <LuHistory className="text-accent animate-pulse" /> AI Query History
          </h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Review all past recommendations, itineraries, custom guides, and chatbot prompt logs.</p>
        </div>

        <button
          onClick={() => setOnlySaved(!onlySaved)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
            onlySaved
              ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
              : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
          }`}
        >
          <LuBookmark className={onlySaved ? 'fill-white text-white' : 'text-primary-900/50'} />
          {onlySaved ? 'Showing Saved Guides' : 'Filter by Saved Only'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-primary-100 dark:border-dark-border no-scrollbar">
        {[
          { value: '', label: 'All Queries' },
          { value: 'recommendation', label: 'Recommendations' },
          { value: 'itinerary', label: 'Itineraries' },
          { value: 'budget-planner', label: 'Budgets' },
          { value: 'food-guide', label: 'Food Guides' },
          { value: 'cultural-guide', label: 'Cultural Guides' },
          { value: 'storytelling', label: 'Stories' }
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
              activeType === type.value
                ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton w-full animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 space-y-3 flex flex-col md:flex-row md:items-start md:justify-between gap-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-100/50 dark:bg-primary-900/20 text-accent uppercase text-[9px] font-extrabold tracking-wide">
                      {item.type.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] text-primary-900/40 dark:text-dark-muted font-bold">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-primary-900 dark:text-white leading-relaxed">
                    💡 Prompt / Input: <span className="text-primary-900/70 dark:text-slate-350 font-semibold italic">"{getCleanPromptText(item)}"</span>
                  </p>
                  <div className="divider border-primary-100 dark:border-dark-border my-2" />
                  <div className="bg-primary-50 dark:bg-primary-950/20 p-4 rounded-xl text-xs text-primary-900/80 dark:text-slate-350 leading-relaxed font-sans max-h-64 overflow-y-auto border border-primary-100 dark:border-primary-900/10 font-medium">
                    {(() => {
                      const cleanedResponse = item.response ? item.response.replace(/```json/gi, '').replace(/```/g, '').trim() : '';
                      
                      let jsonText = cleanedResponse;
                      const startIndex = cleanedResponse.indexOf('{');
                      const endIndex = cleanedResponse.lastIndexOf('}');
                      if (startIndex > -1 && endIndex > startIndex) {
                        jsonText = cleanedResponse.substring(startIndex, endIndex + 1);
                      }
                      
                      const repairedResponse = repairTruncatedJSON(jsonText);
                      if (repairedResponse.startsWith('{') || repairedResponse.startsWith('[')) {
                        try {
                          const parsed = JSON.parse(repairedResponse);
                          
                          // Custom renderer for cultural-guide
                          if (item.type === 'cultural-guide') {
                            return (
                              <div className="space-y-4">
                                {Object.entries(parsed).map(([key, val]) => {
                                  if (val === '{' || val === '}' || val === '[' || val === ']') return null;
                                  const label = key.replace(/([A-Z])/g, ' $1');
                                  return (
                                    <div key={key} className="space-y-1">
                                      <h5 className="font-bold text-accent uppercase text-[10px] tracking-wider">{label}</h5>
                                      <div className="grid grid-cols-1 gap-2 mt-1">
                                        {(() => {
                                          const items = Array.isArray(val) ? val : String(val).split(/\n+|\.\s+/).filter(line => line.trim().length > 0);
                                          return items.map((itemVal, idx) => {
                                            const text = String(itemVal).replace(/^[-*\u2022]\s*/, '').trim();
                                            const colonIndex = text.indexOf(':');
                                            let cardTitle = '';
                                            let cardDesc = text;
                                            if (colonIndex > 0 && colonIndex < 40) {
                                              cardTitle = text.substring(0, colonIndex).trim();
                                              cardDesc = text.substring(colonIndex + 1).trim();
                                            }
                                            return (
                                              <div key={idx} className="bg-white dark:bg-dark-bg/60 border border-primary-100/40 dark:border-dark-border/40 rounded-lg p-2.5 space-y-0.5">
                                                {cardTitle ? (
                                                  <>
                                                    <h6 className="font-bold text-[11px] text-primary-900 dark:text-white flex items-center gap-1.5">
                                                      <span className="w-1 h-1 bg-accent rounded-full shrink-0" />
                                                      {cardTitle}
                                                    </h6>
                                                    <p className="text-[10px] text-primary-900/60 dark:text-dark-muted font-medium pl-2.5 leading-normal">{cardDesc}</p>
                                                  </>
                                                ) : (
                                                  <div className="flex items-start gap-1.5">
                                                    <span className="w-1 h-1 bg-accent rounded-full mt-1.5 shrink-0" />
                                                    <p className="text-[10px] text-primary-900/80 dark:text-dark-muted font-semibold leading-normal">{cardDesc}</p>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          // Custom renderer for food-guide
                          if (item.type === 'food-guide') {
                            return (
                              <div className="space-y-4">
                                {Object.entries(parsed).map(([key, val]) => {
                                  if (val === '{' || val === '}' || val === '[' || val === ']') return null;
                                  const label = key.replace(/([A-Z])/g, ' $1');
                                  return (
                                    <div key={key} className="space-y-1">
                                      <h5 className="font-bold text-accent uppercase text-[10px] tracking-wider">{label}</h5>
                                      <div className="text-xs text-primary-900/85 dark:text-slate-300 leading-relaxed">
                                        {Array.isArray(val) ? (
                                          <ul className="list-disc pl-4 space-y-1">
                                            {val.map((v, i) => (
                                              <li key={i}>
                                                {typeof v === 'object' && v !== null
                                                  ? `${v.name || v.dish || ''}: ${v.description || ''}`
                                                  : String(v)}
                                              </li>
                                            ))}
                                          </ul>
                                        ) : typeof val === 'object' ? (
                                          JSON.stringify(val)
                                        ) : (
                                          <ul className="list-disc pl-4 space-y-0.5">
                                            {String(val).split(/\n+|\.\s+/).filter(line => line.trim().length > 0).map((line, idx) => (
                                              <li key={idx}>{line.replace(/^[-*\u2022]\s*/, '').trim()}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          // Custom renderer for budget-planner
                          if (item.type === 'budget-planner') {
                            return (
                              <div className="space-y-3">
                                {Object.entries(parsed).map(([key, val]) => {
                                  if (val === '{' || val === '}' || val === '[' || val === ']') return null;
                                  const label = key.replace(/([A-Z])/g, ' $1');
                                  return (
                                    <div key={key} className="space-y-1.5 border-b border-primary-100/50 dark:border-dark-border/20 pb-2.5 last:border-0 last:pb-0">
                                      <h5 className="font-bold text-accent uppercase text-[10px] tracking-wider">{label}</h5>
                                      <div className="text-[11px] text-primary-900/80 dark:text-slate-350 leading-relaxed font-semibold">
                                        {Array.isArray(val) ? (
                                          <ul className="list-disc pl-4 space-y-1 mt-1 text-primary-900/70 dark:text-slate-300">
                                            {val.map((v, i) => <li key={i}>{String(v)}</li>)}
                                          </ul>
                                        ) : typeof val === 'object' && val !== null ? (
                                          <div className="space-y-2 mt-1">
                                            {Object.entries(val).map(([subK, subV]) => {
                                              const subLabel = subK.replace(/([A-Z])/g, ' $1').trim();
                                              if (typeof subV === 'object' && subV !== null && !Array.isArray(subV)) {
                                                return (
                                                  <div key={subK} className="pl-2 border-l-2 border-primary-250 dark:border-dark-border/40 mt-2">
                                                    <span className="font-bold capitalize text-[10px] text-accent">{subLabel}:</span>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-medium pl-2 mt-0.5">
                                                      {Object.entries(subV).map(([k, valVal]) => (
                                                        <div key={k} className="flex justify-between border-b border-primary-100/30 pb-0.5 last:border-0">
                                                          <span className="capitalize text-primary-900/60 dark:text-dark-muted">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                          <span className="font-extrabold text-accent">₹{String(valVal)}</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                );
                                              }
                                              if (Array.isArray(subV)) {
                                                return (
                                                  <div key={subK} className="pl-2 border-l-2 border-primary-250 dark:border-dark-border/40 mt-2">
                                                    <span className="font-bold capitalize text-[10px] text-accent">{subLabel}:</span>
                                                    <ul className="list-disc list-inside text-[10px] text-primary-900/70 dark:text-slate-300 space-y-0.5 pl-2 mt-0.5">
                                                      {subV.map((tip, idx) => <li key={idx}>{tip}</li>)}
                                                    </ul>
                                                  </div>
                                                );
                                              }
                                              return (
                                                <p key={subK} className="pl-2 mt-1">
                                                  <span className="font-bold capitalize text-[10px] text-accent mr-1">{subLabel}:</span>
                                                  <span className="text-primary-900 dark:text-white font-extrabold">{String(subV)}</span>
                                                </p>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          <p className="pl-2 font-medium">{String(val)}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          // Custom renderer for route-planner
                          if (item.type === 'route-planner') {
                            return (
                              <div className="space-y-3">
                                {parsed.bestRoute && (
                                  <div className="p-3 bg-accent/5 dark:bg-accent/10 border border-accent/10 rounded-xl">
                                    <p className="text-[10px] font-black uppercase text-accent tracking-wider">CultureQuest Tip</p>
                                    <p className="text-[11px] font-semibold italic text-primary-900/80 dark:text-slate-350">"{parsed.bestRoute}"</p>
                                  </div>
                                )}
                                <div className="space-y-3">
                                  {Array.isArray(parsed.options) && parsed.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="bg-white dark:bg-dark-bg/60 border border-primary-100/40 dark:border-dark-border/40 p-3.5 rounded-xl space-y-2">
                                      <div className="flex justify-between items-center border-b border-primary-100/50 dark:border-dark-border/10 pb-2">
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
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          
                          // Fallback JSON renderer
                          return (
                            <pre className="text-[10px] font-mono whitespace-pre-wrap overflow-x-auto leading-normal">
                              {JSON.stringify(parsed, null, 2)}
                            </pre>
                          );
                        } catch (e) {
                          return <div className="whitespace-pre-line">{item.response}</div>;
                        }
                      }
                      return <div className="whitespace-pre-line">{item.response}</div>;
                    })()}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 md:flex-col items-center">
                  {/* Bookmark Toggle */}
                  <button
                    onClick={() => handleToggleSave(item._id, item.isSaved)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                      item.isSaved 
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100' 
                        : 'text-primary-900/40 dark:text-dark-muted hover:text-amber-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                    title={item.isSaved ? 'Remove from Saved' : 'Save Guide'}
                  >
                    <LuBookmark className={`text-lg ${item.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors cursor-pointer"
                    aria-label="Delete entry"
                  >
                    <LuTrash className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/60 dark:text-dark-muted space-y-4 rounded-2xl shadow-sm">
          <span className="text-6xl block animate-float">📜</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Query History</h3>
          <p className="text-xs max-w-xs mx-auto leading-relaxed font-semibold">Your past queries and generated guides will appear here once you interact with our AI features.</p>
        </div>
      )}
    </div>
  );
}
