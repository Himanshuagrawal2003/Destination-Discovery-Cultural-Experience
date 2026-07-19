const Event        = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

// Helper to fetch with retry & exponential back-off
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      console.log(`[HTTP Request] Fetching URL: ${url} (Attempt ${attempt + 1}/${retries})`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'CultureQuestAI/1.0 (himanshuagrawal7766@gmail.com; developer)',
          ...(options.headers || {})
        }
      });

      console.log(`[HTTP Response] Status Code: ${response.status} for ${url}`);

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoff * Math.pow(2, attempt);
        console.warn(`⚠️ Received 429 Rate Limit for ${url}. Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (err) {
      console.error(`❌ Fetch failed for ${url} (Attempt ${attempt + 1}/${retries}):`, err.message);
      attempt++;
      if (attempt >= retries) throw err;
      const delay = backoff * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// URL Sanitizer & Validator
const sanitizeAndValidateWikimediaUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    let sanitized = url.trim();
    // Fix typos in domain name
    sanitized = sanitized.replace(/https?:\/\/(upload\.)?w+ikimedia\.o+r+g/i, 'https://upload.wikimedia.org');
    sanitized = sanitized.replace(/https?:\/\/(upload\.)?wikimedia\.o+r+g/i, 'https://upload.wikimedia.org');
    // Fix double slash after domain name
    sanitized = sanitized.replace(/(https?:\/\/upload\.wikimedia\.org)\/+/gi, '$1/');
    // Fix w-typos in wikipedia path
    sanitized = sanitized.replace(/org\/w+ikipedia/i, 'org/wikipedia');

    const parsed = new URL(sanitized);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.hostname !== 'upload.wikimedia.org') return null;
    if (!parsed.pathname.startsWith('/wikipedia/')) return null;

    return parsed.href;
  } catch (err) {
    console.warn(`⚠️ URL sanitization failed for "${url}":`, err.message);
    return null;
  }
};

// Retrieve images directly from a Wikipedia page article
const getWikiPageImages = async (query, limit = 5) => {
  try {
    console.log(`[Wikimedia Search] Searching Wikipedia for primary article of "${query}"...`);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&origin=*`;
    const searchRes = await fetchWithRetry(searchUrl);
    const searchData = await searchRes.json();
    console.log(`[Wikimedia Search] Search response for "${query}":`, JSON.stringify(searchData).slice(0, 500));

    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      console.log(`[Wikimedia Search] No articles found on Wikipedia for "${query}"`);
      return [];
    }

    const bestPage = searchData.query.search[0];
    console.log(`[Wikimedia Search] Best article match for "${query}": "${bestPage.title}"`);

    // Fetch images list from the article page
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(bestPage.title)}&imlimit=50&origin=*`;
    const imagesRes = await fetchWithRetry(imagesUrl);
    const imagesData = await imagesRes.json();
    console.log(`[Wikimedia Search] Page images response:`, JSON.stringify(imagesData).slice(0, 500));

    if (!imagesData.query || !imagesData.query.pages) return [];
    const pages = Object.values(imagesData.query.pages);
    if (pages.length === 0 || !pages[0].images) {
      console.log(`[Wikimedia Search] No images embedded on page "${bestPage.title}"`);
      return [];
    }

    // Filter out vector graphics, icons, maps, portal buttons, logos, flags
    const noiseKeywords = ['flag', 'map', 'logo', 'icon', 'portal', 'shield', 'stub', 'unconfirmed', 'template', 'button', 'wikimedia-logo'];
    const imageFiles = pages[0].images
      .map(img => img.title)
      .filter(title => {
        const lower = title.toLowerCase();
        const hasValidExt = /\.(jpg|jpeg|png|webp)$/i.test(lower);
        const isNoise = noiseKeywords.some(keyword => lower.includes(keyword));
        return hasValidExt && !isNoise;
      });

    if (imageFiles.length === 0) {
      console.log(`[Wikimedia Search] No clean non-vector/non-logo images on page "${bestPage.title}"`);
      return [];
    }

    console.log(`[Wikimedia Search] Found ${imageFiles.length} clean images for "${query}" inside article:`, imageFiles.slice(0, limit));

    // Fetch direct URLs for the images (batched in one API call)
    const titlesQuery = imageFiles.slice(0, limit).join('|');
    const urlsUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(titlesQuery)}&iiprop=url&origin=*`;
    const urlsRes = await fetchWithRetry(urlsUrl);
    const urlsData = await urlsRes.json();
    console.log(`[Wikimedia Search] Direct URLs API response:`, JSON.stringify(urlsData).slice(0, 500));

    if (!urlsData.query || !urlsData.query.pages) return [];
    const urlPages = Object.values(urlsData.query.pages);
    const validUrls = [];
    urlPages.forEach(p => {
      if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
        const validated = sanitizeAndValidateWikimediaUrl(p.imageinfo[0].url);
        if (validated) {
          validUrls.push(validated);
        }
      }
    });

    console.log(`[Wikimedia Search] Retaining ${validUrls.length} validated images for "${query}"`);
    return validUrls;
  } catch (err) {
    console.error(`[Wikimedia Search] Error in getWikiPageImages for "${query}":`, err.message);
    return [];
  }
};

// Fallback 1: Commons Search (Namespace 6: Files)
const queryCommonsSearch = async (query, limit = 5) => {
  try {
    console.log(`[Wikimedia Search] Falling back to Commons namespace 6 file search for "${query}"...`);
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=15&prop=imageinfo&iiprop=url&origin=*`;
    const response = await fetchWithRetry(commonsUrl);
    const data = await response.json();
    console.log(`[Wikimedia Search] Commons query response:`, JSON.stringify(data).slice(0, 500));

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      const images = [];
      for (const page of pages) {
        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
          const url = page.imageinfo[0].url;
          const validated = sanitizeAndValidateWikimediaUrl(url);
          if (validated) {
            images.push(validated);
          }
        }
      }
      return images.slice(0, limit);
    }
  } catch (err) {
    console.error(`[Wikimedia Search] Commons search failed for "${query}":`, err.message);
  }
  return [];
};

// Fallback 2: Wikipedia Standard PageImages Search
const queryWikipediaPageImages = async (query, limit = 5) => {
  try {
    console.log(`[Wikimedia Search] Falling back to Wikipedia PageImages search for "${query}"...`);
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&piprop=original&origin=*`;
    const response = await fetchWithRetry(wikiUrl);
    const data = await response.json();
    console.log(`[Wikimedia Search] Wikipedia PageImages response:`, JSON.stringify(data).slice(0, 500));

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      const images = [];
      for (const page of pages) {
        if (page.original && page.original.source) {
          const validated = sanitizeAndValidateWikimediaUrl(page.original.source);
          if (validated) {
            images.push(validated);
          }
        }
      }
      return images.slice(0, limit);
    }
  } catch (err) {
    console.error(`[Wikimedia Search] Wikipedia PageImages query failed for "${query}":`, err.message);
  }
  return [];
};

const fetchRealUnsplashImage = async (query) => {
  console.log(`[Image Retrieval] Fetching cover image for event "${query}"...`);
  // Try Wikipedia page images first
  const pageImages = await getWikiPageImages(query, 1);
  if (pageImages.length > 0) return pageImages[0];

  // Try Commons search next
  const commonsImages = await queryCommonsSearch(query, 1);
  if (commonsImages.length > 0) return commonsImages[0];

  // Try Wikipedia PageImages next
  const wikiPageImages = await queryWikipediaPageImages(query, 1);
  if (wikiPageImages.length > 0) return wikiPageImages[0];

  console.warn(`⚠️ [Image Retrieval] Failed to retrieve any cover image for event "${query}"`);
  return null;
};

const uploadImageToCloudinary = async (imgUrl) => {
  if (!imgUrl || !imgUrl.startsWith('http')) return imgUrl;
  try {
    const response = await fetchWithRetry(imgUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    const { cloudinary } = require('../config/cloudinary');
    const res = await cloudinary.uploader.upload(dataUrl, {
      folder: 'culturequest/events',
      resource_type: 'image'
    });
    console.log(`[Cloudinary Upload] Upload success! Secure URL: ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.warn(`⚠️ Cloudinary upload failed via base64 fallback for ${imgUrl}:`, err.message);
    return imgUrl;
  }
};

exports.getEvents = asyncHandler(async (req, res, next) => {
  const cityFilter = req.query['location.city'];
  if (cityFilter && cityFilter.trim() && cityFilter.trim().length >= 3) {
    const cityClean = cityFilter.trim();
    // Count existing active events for this city
    const existingCount = await Event.countDocuments({
      'location.city': { $regex: new RegExp(`^${cityClean}$`, 'i') }
    });

    if (existingCount === 0) {
      console.log(`🔍 [AI EVENT DYNAMIC] No events found in DB for city "${cityClean}". Generating dynamic events...`);
      try {
        const { generateContent } = require('../services/geminiService');
        // Let's find any admin user to associate the event creator
        const User = require('../models/User');
        const admin = await User.findOne({});
        if (admin) {
          const prompt = `Generate a JSON array of 3 authentic, famous cultural events, religious festivals, or traditional fairs that take place in the city of "${cityClean}".
For each event, return a JSON object with:
- title (string, e.g. "Dev Deepawali" for Varanasi)
- type (string, must be one of: "festival", "concert", "food-fair", "religious", "traditional-performance", "cultural", "sports", "other")
- description (string, rich description of its history, significance, and what happens, max 500 words)
- startDate (string, ISO date string during the year, choose appropriate months)
- endDate (string, ISO date string, typically 1-5 days after startDate)
- time (string, e.g. "Evening (5:00 PM - 9:00 PM)")
- location (object with country: "India", city: "${cityClean}", venue: "string venue", address: "string address")
- price (object with isFree: true/false, amount: number, currency: "INR")
- organizer (object with name: "Local Tourism / Trust", website: "https://example.com")
- highlights (array of strings, e.g. ["Diyya lighting", "Ganga Aarti"])
- dressCode (string, e.g. "Traditional Indian modest wear")
- culturalNote (string, e.g. "Remove shoes before entering the ghats")

Return ONLY the raw JSON array inside a \`\`\`json ... \`\`\` code block.`;
          
          const rawText = await generateContent(prompt);
          const parseJSONHelper = (text) => {
            try {
              const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
              if (jsonMatch) return JSON.parse(jsonMatch[1] || jsonMatch[0]);
              return JSON.parse(text);
            } catch {
              return null;
            }
          };

          const eventList = parseJSONHelper(rawText);
          if (Array.isArray(eventList)) {
            const isCloudinaryConfigured = 
              process.env.CLOUDINARY_API_SECRET && 
              !process.env.CLOUDINARY_API_SECRET.startsWith('your_');

            const EVENT_IMAGE_FALLBACKS = {
              janmashtami: 'https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=1200',
              holi: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?q=80&w=1200',
              diwali: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200',
              concert: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200',
              music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200',
              dance: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200',
              food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200',
              festival: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200',
              religious: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
              cultural: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=1200'
            };

            for (const item of eventList) {
              console.log(`🔍 Searching Unsplash for cover image of event: "${item.title}"...`);
              const scrapedUrl = await fetchRealUnsplashImage(`${item.title} ${cityClean}`);
              
              let fallbackUrl = 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200';
              const titleLower = item.title.toLowerCase();
              const typeLower = (item.type || '').toLowerCase();
              
              for (const [key, val] of Object.entries(EVENT_IMAGE_FALLBACKS)) {
                if (titleLower.includes(key) || typeLower.includes(key)) {
                  fallbackUrl = val;
                  break;
                }
              }

              let finalCover = scrapedUrl || fallbackUrl;
              
              if (isCloudinaryConfigured && scrapedUrl) {
                try {
                  console.log(`📤 Uploading cover image for ${item.title} to Cloudinary...`);
                  finalCover = await uploadImageToCloudinary(scrapedUrl);
                } catch (uploadErr) {
                  // ignore
                }
              }

              await Event.create({
                title: item.title,
                type: item.type || 'festival',
                description: item.description || '',
                coverImage: finalCover,
                startDate: item.startDate ? new Date(item.startDate) : new Date(),
                endDate: item.endDate ? new Date(item.endDate) : new Date(),
                time: item.time || '',
                location: {
                  country: item.location?.country || 'India',
                  city: item.location?.city || cityClean,
                  venue: item.location?.venue || '',
                  address: item.location?.address || ''
                },
                price: {
                  isFree: item.price?.isFree !== undefined ? item.price.isFree : true,
                  amount: Number(item.price?.amount) || 0,
                  currency: 'INR'
                },
                organizer: {
                  name: item.organizer?.name || 'Local Tourism Authority',
                  website: item.organizer?.website || '',
                  contact: item.organizer?.contact || ''
                },
                highlights: Array.isArray(item.highlights) ? item.highlights : [],
                dressCode: item.dressCode || '',
                culturalNote: item.culturalNote || '',
                createdBy: admin._id
              });
            }
            console.log(`✅ [AI EVENT DYNAMIC] Successfully generated and seeded ${eventList.length} events for ${cityClean}`);
          }
        }
      } catch (err) {
        console.error('❌ Failed to dynamically generate events:', err.message);
      }
    }
  }

  const queryObj = { ...req.query };
  const citySearchVal = queryObj['location.city'];
  delete queryObj['location.city']; // Exclude from APIFeatures to avoid RegExp serialization bug

  const features = new APIFeatures(Event.find({ isActive: true }), queryObj)
    .filter()
    .search(['title', 'description', 'location.city', 'location.venue'])
    .sort()
    .limitFields()
    .paginate();

  // Apply location.city filter case-insensitively directly on the Mongoose query
  if (citySearchVal && citySearchVal.trim()) {
    const regex = new RegExp(`^${citySearchVal.trim()}$`, 'i');
    features.query = features.query.find({ 'location.city': regex });
  }

  const events = await features.query;
  
  // Count using the same filtered query to support correct pagination total counts
  const countQuery = { isActive: true };
  if (citySearchVal && citySearchVal.trim()) {
    countQuery['location.city'] = { $regex: new RegExp(`^${citySearchVal.trim()}$`, 'i') };
  }
  if (queryObj.type) {
    countQuery.type = queryObj.type;
  }
  const total = await Event.countDocuments(countQuery);
  sendPaginated(res, events, total, req.query.page || 1, req.query.limit || 9);
});

exports.getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isActive: true, startDate: { $gte: new Date() } })
    .sort('startDate').limit(10).select('title type coverImage startDate endDate location price');
  sendSuccess(res, { events }, 'Upcoming events fetched');
});

exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name avatar');
  if (!event) return next(new AppError('Event not found', 404));
  event.viewCount += 1;
  await event.save({ validateBeforeSave: false });
  sendSuccess(res, { event }, 'Event fetched');
});

exports.createEvent = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);
  const event = await Event.create(data);
  sendSuccess(res, { event }, 'Event created', 201);
});

exports.updateEvent = asyncHandler(async (req, res, next) => {
  const data = { ...req.body };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!event) return next(new AppError('Event not found', 404));
  sendSuccess(res, { event }, 'Event updated');
});

exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!event) return next(new AppError('Event not found', 404));
  sendSuccess(res, {}, 'Event deleted');
});
