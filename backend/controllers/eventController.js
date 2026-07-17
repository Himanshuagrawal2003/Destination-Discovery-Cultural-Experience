const Event        = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');

const fetchRealUnsplashImage = async (query) => {
  try {
    const response = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    const html = await response.text();
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches));
      const picked = uniqueMatches[0];
      return `${picked}?q=80&w=1200`;
    }
  } catch (err) {
    console.error('Error fetching Unsplash search page:', err.message);
  }
  return null;
};

exports.getEvents = asyncHandler(async (req, res, next) => {
  // Check if we are filtering by city and have no events seeded for it yet
  const cityFilter = req.query['location.city'];
  if (cityFilter && cityFilter.trim()) {
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
            const { cloudinary } = require('../config/cloudinary');
            const isCloudinaryConfigured = 
              process.env.CLOUDINARY_API_SECRET && 
              !process.env.CLOUDINARY_API_SECRET.startsWith('your_');

            for (const item of eventList) {
              console.log(`🔍 Searching Unsplash for cover image of event: "${item.title}"...`);
              const scrapedUrl = await fetchRealUnsplashImage(`${item.title} ${cityClean}`);
              let finalCover = scrapedUrl || 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200';
              
              if (isCloudinaryConfigured && scrapedUrl) {
                try {
                  console.log(`📤 Uploading cover image for ${item.title} to Cloudinary...`);
                  const resUpload = await cloudinary.uploader.upload(scrapedUrl, {
                    folder: 'culturequest/events',
                    resource_type: 'image'
                  });
                  finalCover = resUpload.secure_url;
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

  const features = new APIFeatures(Event.find({ isActive: true }), req.query)
    .filter().search(['title', 'description']).sort().limitFields().paginate();
  const events = await features.query;
  const total  = await Event.countDocuments({ isActive: true });
  sendPaginated(res, events, total, req.query.page || 1, req.query.limit || 12);
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
