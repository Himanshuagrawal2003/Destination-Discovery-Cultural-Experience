import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuGlobe, 
  LuBookOpen, 
  LuTriangleAlert, 
  LuShirt, 
  LuMapPin,
  LuCompass,
  LuBookmark
} from 'react-icons/lu';
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

// Helper to safely format or extract key-value sections from raw JSON text
const formatRawText = (text) => {
  if (!text) return '';
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  // Clean and repair truncated JSON
  cleaned = repairTruncatedJSON(cleaned);
  
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const formattedJson = cleaned
        .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
        .replace(/\\"/g, '"'); // unescape quotes
      return JSON.parse(formattedJson);
    } catch {
      // Extract key-value pairs via regex if standard JSON.parse fails
      const parsed = {};
      const regex = /"([^"]+)"\s*:\s*(?:"([^"]*)"|(\[[^\]]*\])|([^,\n}]+))/g;
      let match;
      while ((match = regex.exec(cleaned)) !== null) {
        const key = match[1];
        let val = match[2] || match[3] || match[4];
        if (val) {
          const trimmedVal = val.trim();
          // Skip syntax markers that are not actual text values
          if (trimmedVal === '{' || trimmedVal === '}' || trimmedVal === '[' || trimmedVal === ']') {
            continue;
          }
          let cleanVal = trimmedVal;
          if (cleanVal.startsWith('[') && cleanVal.endsWith(']')) {
            try {
              cleanVal = JSON.parse(cleanVal);
            } catch {
              cleanVal = cleanVal.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
            }
          } else {
            cleanVal = cleanVal.replace(/^"|"$/g, '').trim();
          }
          parsed[key] = cleanVal;
        }
      }
      if (Object.keys(parsed).length > 0) return parsed;
    }
  }
  return cleaned;
};

export default function AICulturalGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [culturalGuide, setCulturalGuide] = useState(null);
  const [activeTab, setActiveTab] = useState('');
  
  // Independent save states
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      country: '',
      city: '',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setCulturalGuide(null);
    setHistoryId(null);
    setIsSaved(false);
    try {
      const res = await api.post('/ai/cultural-guide', data);
      setCulturalGuide(res.data.culturalGuide);
      setHistoryId(res.data.historyId || null);
      toast.success('Cultural guide ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate cultural guide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) {
      toast.error('No generated guide found to save');
      return;
    }
    const token = localStorage.getItem('cq_token');
    if (!token) {
      toast.error('Please login to save the cultural guide');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Cultural guide saved to your Bookmarks!' : 'Removed from Bookmarks');
    } catch (err) {
      toast.error(err.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionIcon = (sectionKey) => {
    switch (sectionKey) {
      case 'greetingsAndCustoms':
        return <LuCompass className="text-accent text-lg shrink-0" />;
      case 'religiousEtiquette':
        return <LuMapPin className="text-purple-500 text-lg shrink-0" />;
      case 'clothingEtiquette':
        return <LuShirt className="text-blue-500 text-lg shrink-0" />;
      case 'thingsToAvoid':
        return <LuTriangleAlert className="text-rose-500 text-lg shrink-0" />;
      default:
        return <LuBookOpen className="text-accent text-lg shrink-0" />;
    }
  };

  const getSectionBorder = (sectionKey) => {
    switch (sectionKey) {
      case 'greetingsAndCustoms':
        return 'border-l-accent';
      case 'religiousEtiquette':
        return 'border-l-purple-500';
      case 'clothingEtiquette':
        return 'border-l-blue-500';
      case 'thingsToAvoid':
        return 'border-l-rose-500';
      default:
        return 'border-l-primary-200';
    }
  };

  const getSectionColors = (sectionKey) => {
    switch (sectionKey) {
      case 'greetingsAndCustoms':
        return {
          bg: 'bg-amber-50/30 dark:bg-amber-950/5',
          border: 'border-amber-200/60 dark:border-amber-900/20',
          text: 'text-amber-900/80 dark:text-amber-250',
          prefix: 'text-amber-600 dark:text-amber-400'
        };
      case 'religiousEtiquette':
        return {
          bg: 'bg-purple-50/30 dark:bg-purple-950/5',
          border: 'border-purple-200/60 dark:border-purple-900/20',
          text: 'text-purple-900/80 dark:text-purple-250',
          prefix: 'text-purple-600 dark:text-purple-400'
        };
      case 'clothingEtiquette':
        return {
          bg: 'bg-blue-50/30 dark:bg-blue-950/5',
          border: 'border-blue-200/60 dark:border-blue-900/20',
          text: 'text-blue-900/80 dark:text-blue-250',
          prefix: 'text-blue-600 dark:text-blue-400'
        };
      case 'thingsToAvoid':
        return {
          bg: 'bg-rose-50/30 dark:bg-rose-950/5',
          border: 'border-rose-200/60 dark:border-rose-900/20',
          text: 'text-rose-900/80 dark:text-rose-250',
          prefix: 'text-rose-600 dark:text-rose-400'
        };
      default:
        return {
          bg: 'bg-primary-50/20 dark:bg-dark-bg/40',
          border: 'border-primary-100/50 dark:border-dark-border',
          text: 'text-primary-900/80 dark:text-dark-muted',
          prefix: 'text-accent'
        };
    }
  };

  const renderSection = (title, key, data) => {
    if (!data) return null;
    const colors = getSectionColors(key);
    
    const formatText = (text) => {
      if (typeof text !== 'string') return String(text);
      const separatorIndex = text.indexOf(':') > -1 ? text.indexOf(':') : text.indexOf('-');
      if (separatorIndex > 0 && separatorIndex < 40) {
        const prefix = text.substring(0, separatorIndex).trim();
        const symbol = text[separatorIndex];
        const rest = text.substring(separatorIndex + 1).trim();
        return (
          <>
            <strong className={`font-extrabold uppercase tracking-wide text-[10px] ${colors.prefix} block sm:inline mr-1`}>{prefix}{symbol}</strong>
            <span>{rest}</span>
          </>
        );
      }
      return text;
    };

    return (
      <div className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 border-l-4 ${getSectionBorder(key)} space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
        <h4 className="font-bold text-primary-900 dark:text-white text-sm capitalize flex items-center gap-1.5 font-display border-b border-primary-100 dark:border-dark-border pb-3">
          {getSectionIcon(key)}
          <span>{title.replace(/([A-Z])/g, ' $1')}</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {typeof data === 'string' ? (
            <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl text-xs font-semibold ${colors.text} leading-relaxed whitespace-pre-wrap`}>
              {data.split(/\n+/).map((p, idx) => {
                const isSpecial = /critical|important|warning|danger|never|do not|avoid|must/i.test(p);
                if (isSpecial) {
                  return (
                    <div key={idx} className={`p-3.5 mt-2.5 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-dark-bg/60 shadow-xs border flex items-start gap-2`}>
                      <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                      <div className="text-xs leading-relaxed">{formatText(p)}</div>
                    </div>
                  );
                }
                return <p key={idx} className={idx > 0 ? 'mt-2.5' : ''}>{formatText(p)}</p>;
              })}
            </div>
          ) : Array.isArray(data) ? (
            <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl text-xs font-semibold ${colors.text} leading-relaxed space-y-3`}>
              {data.map((item, idx) => {
                const text = typeof item === 'object' && item !== null
                  ? `${item.title || item.name || ''}: ${item.description || item.value || JSON.stringify(item)}`
                  : item;
                const isSpecial = /critical|important|warning|danger|never|do not|avoid|must/i.test(text);
                if (isSpecial) {
                  return (
                    <div key={idx} className={`p-3.5 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-dark-bg/60 shadow-xs border flex items-start gap-2`}>
                      <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                      <div className="text-xs leading-relaxed">{formatText(text)}</div>
                    </div>
                  );
                }
                return <p key={idx}>{formatText(text)}</p>;
              })}
            </div>
          ) : (
            <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl text-xs font-semibold ${colors.text} leading-relaxed space-y-3`}>
              {Object.entries(data).map(([k, val], idx) => {
                const text = typeof val === 'object' && val !== null
                  ? Array.isArray(val) ? val.join(', ') : JSON.stringify(val)
                  : val;
                const fieldTitle = k.replace(/([A-Z])/g, ' $1').trim();
                const isSpecial = /critical|important|warning|danger|never|do not|avoid|must/i.test(text) || /critical|important|warning|danger|never|do not|avoid|must/i.test(fieldTitle);
                
                if (isSpecial) {
                  return (
                    <div key={idx} className={`p-3.5 rounded-lg border-l-4 ${colors.border} bg-white dark:bg-dark-bg/60 shadow-xs border flex items-start gap-2`}>
                      <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                      <div className="text-xs leading-relaxed">
                        <strong className={`capitalize ${colors.prefix} font-extrabold block sm:inline mr-1`}>{fieldTitle}: </strong>
                        {text}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <p key={idx}>
                    <strong className={`capitalize ${colors.prefix} font-extrabold block sm:inline mr-1`}>{fieldTitle}: </strong>
                    {text}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
            <LuSparkles className="text-accent animate-pulse" /> AI Cultural Customs Guide
          </h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Learn local etiquette, dress code rules, sacred site regulations, and greetings.</p>
        </div>
        
        {culturalGuide && historyId && (
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              isSaved
                ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
            }`}
          >
            <LuBookmark className={isSaved ? 'fill-white text-white' : 'text-primary-900/50'} />
            {isSaved ? 'Saved to Bookmarks' : 'Save Cultural Guide'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Destination</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Country</label>
            <input
              type="text"
              placeholder="e.g. India, Japan"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">City (Optional)</label>
            <input type="text" placeholder="e.g. Kyoto, Varanasi" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('city')} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LuGlobe /> Load Cultural Customs
              </>
            )}
          </button>
        </form>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : culturalGuide ? (() => {
            let parsedGuide = culturalGuide;
            if (culturalGuide.rawText) {
              parsedGuide = formatRawText(culturalGuide.rawText);
            } else if (typeof culturalGuide === 'string') {
              parsedGuide = formatRawText(culturalGuide);
            }

            const isStructured = parsedGuide && 
                                 typeof parsedGuide === 'object' && 
                                 !parsedGuide.rawText && 
                                 Object.keys(parsedGuide).length > 0;

             const guideKeys = Object.keys(parsedGuide);
            const currentTab = activeTab && guideKeys.includes(activeTab) ? activeTab : guideKeys[0];

            return (
              <div className="space-y-6">
                {isStructured ? (
                  <div className="space-y-6">
                    {/* Tab Navigation Box */}
                    <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-3 rounded-2xl shadow-sm flex flex-wrap gap-2.5 justify-center md:justify-start">
                      {guideKeys.map((key) => {
                        const title = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/_/g, ' ')
                          .trim();
                        const isActive = currentTab === key;
                        return (
                           <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-accent text-white shadow-sm shadow-accent/15'
                                : 'bg-primary-50/50 dark:bg-primary-950/10 text-primary-900/60 dark:text-dark-muted hover:bg-primary-50 dark:hover:bg-primary-950/20'
                            }`}
                          >
                            {getSectionIcon(key)}
                            <span>{title}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Section Content */}
                    {(() => {
                      const title = currentTab
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .trim();
                      return renderSection(title, currentTab, parsedGuide[currentTab]);
                    })()}
                  </div>
                ) : (
                  /* Fallback: render cleaned raw text */
                  <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl shadow-sm whitespace-pre-line text-xs font-semibold leading-relaxed text-primary-900/70 dark:text-dark-muted">
                    <h4 className="font-extrabold text-sm text-primary-900 dark:text-white mb-3 flex items-center gap-1.5 border-b border-primary-50 dark:border-dark-border pb-2.5 font-display">
                      <LuBookOpen className="text-accent text-lg" />
                      <span>Cultural Guide Details</span>
                    </h4>
                    {typeof parsedGuide === 'string' ? parsedGuide : JSON.stringify(parsedGuide, null, 2)}
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <span className="text-6xl animate-float">⛩️</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Customs Parameters</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">Enter destination details and read authentic greetings, taboos, and site rules guidelines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
