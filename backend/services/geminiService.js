const Groq = require('groq-sdk');

// Initialize Groq client safely
let groq = null;
const apiKey = process.env.GROQ_API_KEY;
const isMockMode = !apiKey || apiKey.trim() === '' || apiKey.startsWith('your_');

if (!isMockMode) {
  try {
    groq = new Groq({ apiKey });
  } catch (err) {
    console.warn('⚠️ Groq initialization failed. Running in mock mode.', err.message);
  }
} else {
  console.log('ℹ️ Running geminiService in mock mode (no valid GROQ_API_KEY provided)');
}

// ─── AI Request Queue ────────────────────────────────────────────────────────
// Processes AI requests with limited concurrency to prevent Groq API rate limits.
// When multiple users trigger AI features simultaneously, requests are queued
// and processed in order instead of all hitting the API at once.
class AIRequestQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;  // max simultaneous Groq API calls
    this.running = 0;
    this.queue = [];
    this.totalProcessed = 0;
  }

  enqueue(task) {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.running--;
          this.totalProcessed++;
          this._processNext();
        }
      };

      if (this.running < this.concurrency) {
        this.running++;
        wrappedTask();
      } else {
        this.queue.push(wrappedTask);
        console.log(`📋 AI Queue: Request queued. Position: ${this.queue.length} | Running: ${this.running}/${this.concurrency}`);
      }
    });
  }

  _processNext() {
    if (this.queue.length > 0 && this.running < this.concurrency) {
      const nextTask = this.queue.shift();
      this.running++;
      console.log(`▶️ AI Queue: Processing next. Remaining: ${this.queue.length} | Running: ${this.running}/${this.concurrency}`);
      nextTask();
    }
  }

  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      concurrency: this.concurrency,
      totalProcessed: this.totalProcessed,
    };
  }
}

const aiQueue = new AIRequestQueue(2); // Allow 2 concurrent Groq calls

/**
 * Internal function to make a Groq API call (not queued)
 */
const _callGroq = async (prompt, model) => {
  try {
    const result = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: model,
      temperature: 0.7,
      max_tokens: 4096,
    });
    return result.choices[0].message.content;
  } catch (err) {
    console.warn(`⚠️ Groq API call failed for ${model} (${err.message}). Trying fallback model...`);
    if (model !== 'openai/gpt-oss-20b') {
      try {
        const resultFallback = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai/gpt-oss-20b',
          temperature: 0.7,
          max_tokens: 4096,
        });
        return resultFallback.choices[0].message.content;
      } catch (fallbackErr) {
        console.warn(`⚠️ Groq fallback model openai/gpt-oss-20b also failed (${fallbackErr.message}).`);
        throw new Error(`Groq API call failed: ${fallbackErr.message}`);
      }
    }
    throw new Error(`Groq API call failed: ${err.message}`);
  }
};

/**
 * Generate text content with Groq via the request queue
 * Requests are queued and processed with limited concurrency to prevent rate limits.
 * @param {string} prompt - The full prompt to send
 * @param {string} model  - Model name (default: openai/gpt-oss-120b)
 * @returns {string} - Generated text response
 */
const generateContent = async (prompt, model = 'openai/gpt-oss-120b') => {
  if (isMockMode || !groq) {
    throw new Error('Groq API is not configured. Please provide a valid GROQ_API_KEY in .env to use AI features.');
  }

  // Wrap the API call in a timeout to prevent hanging requests
  const timeoutMs = 60000; // 60 seconds
  const resultPromise = aiQueue.enqueue(() => _callGroq(prompt, model));

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('AI request timed out after 60 seconds. Please try again.')), timeoutMs)
  );

  return Promise.race([resultPromise, timeoutPromise]);
};

/**
 * Generate a chat session for contextual conversations
 */
const createChatSession = (history = [], model = 'openai/gpt-oss-120b') => {
  if (isMockMode || !groq) {
    throw new Error('Groq API is not configured. Please provide a valid GROQ_API_KEY in .env to use AI features.');
  }

  return {
    sendMessage: async (message) => {
      // Map history to Groq format if needed, but for simplicity we append the new message
      const messages = history.map(h => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.parts?.[0]?.text || h.content || '' }));
      messages.push({ role: 'user', content: message });

      const result = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 2048,
      });
      return {
        response: {
          text: () => result.choices[0].message.content
        }
      };
    }
  };
};

// ─── Prompt Templates ─────────────────────────────────────────────────────────

const prompts = {
  recommendDestinations: ({ budget, travelStyle, season, interests, country, duration, experienceDescription }) => `
You are an expert travel consultant. Based on the user's custom travel experience prompt and preferences, recommend 5 perfect destinations.

${experienceDescription ? `User's Desired Vibe/Experience Description: "${experienceDescription}"` : ''}

Preferences:
- Budget Tier / Style: ${budget} per person
- Travel Style: ${travelStyle}
- Season/Month: ${season}
- Interests: ${interests.join(', ')}
- Country/Region: ${country || 'anywhere in the world'}
- Trip Duration: ${duration} days

CRITICAL REQUIREMENTS:
- If a specific Country/Region is specified above (e.g., "${country}"), or if the user's Desired Vibe/Experience mentions a specific region (e.g., "India"), strictly recommend destinations located ONLY within that region.
- All budget breakdowns and costs MUST be realistic AVERAGE ESTIMATED PRICES (Avg. Price) in Indian Rupees (INR, ₹).
- Never return "N/A", null, or empty strings for any price field. Always calculate realistic estimated average amounts.

Format the output strictly as a structured JSON array where each object has these exact keys:
[
  {
    "name": "Destination Name",
    "country": "Country",
    "whyItMatches": "2-3 sentences explanation...",
    "budgetBreakdown": {
      "accommodation": "₹2500/day",
      "food": "₹1200/day",
      "transport": "₹600/day",
      "activities": "₹800/day"
    },
    "bestTime": "October to March",
    "topActivities": ["Activity 1", "Activity 2", "Activity 3"],
    "culturalTips": ["Tip 1", "Tip 2"],
    "hiddenGems": [{"name": "Gem Name", "description": "Brief description"}],
    "famousFoods": [{"name": "Dish Name", "description": "Brief description"}],
    "latitude": 27.1751,
    "longitude": 78.0421
  }
]
`,

  generateDestinationProfile: (destinationNameOrSlug) => `
You are an expert travel guide. The user requested details for the destination/region: "${destinationNameOrSlug}".
Generate a complete, high-quality, and detailed travel profile for this destination.

Provide:
1. Name, Country, City
2. Category: Choose one of ['beach', 'mountain', 'city', 'desert', 'forest', 'historical', 'adventure', 'cultural', 'wildlife', 'other']
3. Detailed Description (up to 300 words)
4. History (up to 200 words)
5. Culture (up to 200 words)
6. Numerical Latitude and Longitude.
7. Budget: Estimated average daily costs in INR (₹). min (number), max (number), level ('budget' / 'mid-range' / 'luxury')
8. Best Season: Array of strings (e.g. ['spring', 'autumn'])
9. Highlights: Array of 4-5 major tourist highlights.
10. Travel Tips: Array of 3 essential travel guidelines.
11. Famous Places: 3 key landmarks (monuments, palaces, parks), each with name and description.
12. Hidden Gems: 3 off-the-beaten-path locations with name and description.
13. Famous Foods: 3 must-try traditional dishes with name and description.
14. Cover Image: A valid high-resolution Unsplash photo URL.

Format the output strictly as JSON with keys:
name, country, city, category, description, history, culture, latitude, longitude, budget (object with keys: min, max, level), bestSeason, highlights (array of strings), travelTips (array of strings), famousPlaces (array of objects with keys: name, description), hiddenGems (array of objects with keys: name, description), famousFoods (array of objects with keys: name, description), coverImage (string).
`,

  storytelling: ({ destinationName, country }) => `
You are a master travel storyteller and cultural historian. Create an immersive, captivating story about ${destinationName}, ${country}.

Include these elements in a flowing narrative (800-1000 words):
1. **Ancient History & Origin** - How it came to be
2. **Legends & Myths** - Local folklore and mythical tales
3. **Cultural Identity** - What makes the culture unique
4. **Architectural Wonders** - Notable buildings and their stories
5. **Pivotal Moments** - Historical events that shaped this place
6. **Modern Day Magic** - How the past meets the present
7. **Sensory Experience** - What you see, hear, smell, taste, feel

Write in first-person narrative style as if you're a passionate local guide showing someone their homeland for the first time.
`,

  hiddenGems: ({ country, travelStyle, interests }) => `
You are a local insider with deep knowledge of off-the-beaten-path destinations. Find 6 hidden gems in ${country || 'the world'}.

CRITICAL REQUIREMENTS:
- All costs MUST be estimated average prices (Avg. Price) in Indian Rupees (INR, ₹).
- Never return "N/A" for costs; always give realistic average estimates.

Format as JSON array with keys: name, location, whySpecial, howToGetThere, bestTime, localSecret, difficulty, estimatedCostPerDay.
`,

  foodGuide: ({ country, city, dietaryPreferences }) => `
You are a culinary expert and food anthropologist specializing in ${country}${city ? `, specifically ${city}` : ''}.
${dietaryPreferences ? `CRITICAL DIETARY DIRECTIVE: The user has specified the following dietary preference: "${dietaryPreferences}". You MUST strictly comply with this. All suggested traditional dishes, street food gems, desserts, and recommended restaurants MUST be 100% compliant with this dietary preference.` : ''}

CRITICAL PRICING REQUIREMENT:
- All dish prices, street food costs, and restaurant price ranges MUST be estimated average prices (Avg. Price) in Indian Rupees (INR, ₹) (e.g. "Avg. ₹150 - ₹300", "Avg. ₹50 - ₹100").
- Never return "N/A" or empty values for price.

Create a comprehensive local food guide formatted as structured JSON with sections:
{
  "traditionalDishes": [{"name": "Dish Name", "description": "Description", "whereToTry": "Best spot", "priceRange": "Avg. ₹200 - ₹400"}],
  "streetFood": [{"name": "Food Name", "description": "Description", "whereToFind": "Location", "bestTime": "Evening", "price": "Avg. ₹50 - ₹100"}],
  "desserts": [{"name": "Sweet Name", "description": "Description", "culturalSignificance": "Significance", "price": "Avg. ₹80 - ₹150"}],
  "restaurants": [{"name": "Restaurant Name", "type": "Casual / Fine Dining", "priceRange": "Avg. ₹500 - ₹1200 per person", "specialty": "Specialty dish", "area": "Area"}],
  "diningEtiquette": ["Etiquette tip 1", "Etiquette tip 2", "Etiquette tip 3"]
}
`,

  festivalGuide: ({ country, month }) => `
You are a cultural events expert specializing in ${country}. Provide a comprehensive guide to festivals and cultural events${month ? ` in ${month}` : ' throughout the year'}.

For each festival (provide 6):
1. **Festival Name**
2. **Type**: Religious/Cultural/Food/Music/Traditional
3. **When**: Exact dates or period
4. **Location**: City/Region
5. **History**: Brief cultural background (3-4 sentences)
6. **How to Experience It**: What to do as a visitor
7. **Dress Code**: What to wear
8. **Cultural Importance**: Why it matters to locals
9. **Tips for Visitors**: Do's and Don'ts
10. **Photography**: Rules and etiquette

Format as JSON array with above keys.
`,

  culturalGuide: ({ country, city }) => `
You are a cultural anthropologist and etiquette expert. Create a comprehensive cultural customs guide for travelers visiting ${country}${city ? `, ${city}` : ''}.

Return ONLY a raw JSON object (no markdown, no code fences). Follow this EXACT schema:

{
  "greetingsAndCustoms": {
    "overview": "A 2-sentence summary of how people greet each other and general social customs.",
    "dos": ["Do tip 1", "Do tip 2", "Do tip 3", "Do tip 4", "Do tip 5"],
    "donts": ["Don't 1", "Don't 2", "Don't 3"],
    "phrases": ["Local greeting phrase + meaning", "Farewell phrase + meaning", "Respectful address phrase + meaning"]
  },
  "religiousEtiquette": {
    "overview": "A 2-sentence summary of the dominant religion(s) and sacred site rules.",
    "dos": ["Do tip 1 for temples/mosques/churches", "Do tip 2", "Do tip 3", "Do tip 4"],
    "donts": ["Don't 1", "Don't 2", "Don't 3", "Don't 4"],
    "keyPlaces": ["Important sacred site 1 and its rule", "Sacred site 2 and its rule", "Sacred site 3 and its rule"]
  },
  "clothingEtiquette": {
    "overview": "A 2-sentence summary of how locals dress and what visitors should know.",
    "dos": ["Wear tip 1", "Wear tip 2", "Wear tip 3", "Wear tip 4"],
    "donts": ["Avoid clothing item 1", "Avoid clothing item 2", "Avoid clothing item 3"],
    "climateTip": "One sentence about climate and what fabric/layering to consider.",
    "footwearTip": "One sentence about footwear expectations in temples, homes, or restaurants."
  },
  "thingsToAvoid": {
    "overview": "A 2-sentence summary of the most important cultural taboos.",
    "taboos": ["Taboo 1 with brief explanation", "Taboo 2 with brief explanation", "Taboo 3", "Taboo 4", "Taboo 5"],
    "gestures": ["Offensive gesture 1 and why", "Offensive gesture 2 and why"],
    "photographyRules": ["Photography rule 1", "Photography rule 2", "Photography rule 3"]
  }
}

CRITICAL RULES:
- All values must be plain readable strings or flat arrays of plain strings — NO nested objects.
- Return ONLY the JSON object. No intro text, no explanation, no code fences.
`,

  languageHelper: ({ country, language, situation }) => `
You are a professional linguist specializing in ${language || country + '\'s language'}.

Create a practical language guide for travelers with these sections:
**Essential Greetings** (10 phrases): Phrase in local language, Phonetic pronunciation, English meaning, When to use
**Useful Daily Phrases** (15 phrases)
**Emergency Phrases** (8 phrases)
**Numbers 1-20** with pronunciation
**Cultural Language Tips**
${situation ? `**Situation-Specific**: Extra phrases for: ${situation}` : ''}

Format as JSON with sections: greetings, usefulPhrases, emergencyPhrases, numbers, culturalTips.
`,

  budgetPlanner: ({ destination, duration, travelStyle, groupSize }) => `
You are an expert travel financial planner. Create a detailed budget plan for:
- Destination: ${destination}
- Duration: ${duration} days
- Travel Style: ${travelStyle || 'mid-range'}
- Group Size: ${groupSize || 1} person(s)

CRITICAL PRICING RULES:
- Provide three budget tiers: "budget", "midRange", and "luxury".
- All figures MUST be realistic AVERAGE ESTIMATED PRICES (Avg. Price) calculated and displayed in Indian Rupees (INR, ₹).
- Every single key in "dailyBreakdown" (accommodation, meals, transport, activities, shopping, misc) MUST be filled with a realistic average price estimate (e.g. "₹1,500", "₹800", "₹500").
- NEVER return "N/A", null, 0, or empty strings for any daily breakdown cost or total cost.

Format your output STRICTLY as a JSON object with the following exact keys:
{
  "budget": {
    "dailyBreakdown": {
      "accommodation": "₹1200",
      "meals": "₹800",
      "transport": "₹400",
      "activities": "₹500",
      "shopping": "₹300",
      "misc": "₹200"
    },
    "totalCost": "₹23800"
  },
  "midRange": {
    "dailyBreakdown": {
      "accommodation": "₹3500",
      "meals": "₹1800",
      "transport": "₹1000",
      "activities": "₹1200",
      "shopping": "₹800",
      "misc": "₹500"
    },
    "totalCost": "₹61600"
  },
  "luxury": {
    "dailyBreakdown": {
      "accommodation": "₹9000",
      "meals": "₹4000",
      "transport": "₹2500",
      "activities": "₹3000",
      "shopping": "₹2000",
      "misc": "₹1200"
    },
    "totalCost": "₹151900"
  },
  "savingTips": [
    "Tip 1...",
    "Tip 2...",
    "Tip 3...",
    "Tip 4...",
    "Tip 5..."
  ],
  "emergencyBuffer": "₹5000 (approx 10-15%)",
  "paymentTips": {
    "bestCurrency": "INR (Indian Rupee, ₹) / UPI / Cash",
    "atmAvailability": "High across city centers and transport hubs",
    "creditCardAcceptance": "Widely accepted at hotels, restaurants, and retail stores",
    "exchangeTips": "Use official bank counters or verified exchange outlets"
  }
}
`,

  itinerary: ({ destination, days, interests, budget, travelStyle }) => `
You are a master travel itinerary planner. Create a detailed ${days}-day itinerary for ${destination}.

CRITICAL PRICING RULES:
- All activity costs, breakfast/lunch/dinner costs, and daily summary totals MUST be realistic AVERAGE ESTIMATED PRICES (Avg. Price) strictly in Indian Rupees (INR, ₹) (e.g. "Avg. ₹300", "Avg. ₹150 - ₹250", "Free").
- NEVER return "N/A" for costs or estimates. Provide realistic estimated average numbers.

Travel preferences:
- Interests: ${interests?.join(', ') || 'general tourism'}
- Budget Tier: ${budget || 'mid-range'}
- Travel style: ${travelStyle || 'solo'}

Format strictly as a JSON array of days with exactly ${days} elements:
[
  {
    "dayNumber": 1,
    "theme": "Historical Highlights & Local Culture",
    "morning": [
      {
        "title": "Visit Top Monument",
        "description": "Explore the famous heritage complex with a local guide.",
        "duration": "2.5 hours",
        "cost": "Avg. ₹250",
        "address": "Monument Road, City"
      },
      {
        "title": "Traditional Breakfast Spot",
        "description": "Enjoy freshly made local breakfast specialties.",
        "duration": "45 mins",
        "cost": "Avg. ₹150",
        "address": "Old Bazaar"
      }
    ],
    "afternoon": [
      {
        "title": "Art & Heritage Museum",
        "description": "Immerse in artifacts and royal history.",
        "duration": "2 hours",
        "cost": "Avg. ₹100",
        "address": "Museum Square"
      },
      {
        "title": "Authentic Lunch Spot",
        "description": "Traditional thali and local delicacies.",
        "duration": "1 hour",
        "cost": "Avg. ₹350",
        "address": "Main Market"
      }
    ],
    "evening": [
      {
        "title": "Sunset Viewpoint & River Walk",
        "description": "Watch the sunset followed by evening musical/cultural lights.",
        "duration": "1.5 hours",
        "cost": "Free",
        "address": "Scenic Promenade"
      },
      {
        "title": "Dinner at Rooftop Restaurant",
        "description": "Panoramic night views with regional cuisine.",
        "duration": "1.5 hours",
        "cost": "Avg. ₹600",
        "address": "City Center"
      }
    ],
    "summary": {
      "estimatedDailyCost": "Avg. ₹1,450 per person",
      "distanceCovered": "approx 8 km",
      "transportBetweenLocations": "Metro & Auto Rickshaws (Avg. ₹200)",
      "proTips": "Start early to avoid peak mid-day heat and queues."
    }
  }
]
`,

  routePlanner: ({ origin, destination, preferences }) => `
You are a transit and logistics expert specializing in travel route optimization. 
Recommend the best pathways/routes to travel from "${origin}" to "${destination}".
${preferences ? `Consider these traveler preferences/restrictions: "${preferences}".` : ''}

CRITICAL PRICING RULES:
- All route costs MUST be realistic AVERAGE ESTIMATED PRICES (Avg. Price) in Indian Rupees (INR, ₹) (e.g. "Avg. ₹1,200 - ₹1,800").
- Never return "N/A" for costs or travel durations.

Provide structured route recommendations across options like budget, luxury, fastest, and scenic.

Format the output strictly as a structured JSON object:
{
  "bestRoute": "Recommendation summary...",
  "options": [
    {
      "title": "Budget Route (Train / Bus)",
      "cost": "Avg. ₹800 - ₹1,500",
      "duration": "6-8 hours",
      "pathway": ["Step 1: Board express train at origin station", "Step 2: Transit via junction", "Step 3: Arrive at destination"],
      "bookingInfo": ["IRCTC Portal", "RedBus App", "Station Counters"],
      "pros": ["Cost effective", "Scenic journey"],
      "cons": ["Takes longer duration", "Advance booking needed"]
    }
  ]
}
`,

  chatbot: (message, conversationHistory) => `
You are CultureQuest AI, a friendly, knowledgeable travel assistant. You help travelers discover destinations, plan trips, learn about cultures, and have amazing travel experiences.

Your personality:
- Enthusiastic and passionate about travel
- Knowledgeable about world cultures, history, and food
- Practical and helpful with specific recommendations
- Friendly and encouraging

Context from conversation:
${conversationHistory.map((h) => `${h.role}: ${h.content}`).join('\n')}

Current message: ${message}

Provide a helpful, concise response. If recommending places or experiences, be specific with names, prices, and practical tips. Keep responses under 300 words unless a detailed itinerary is requested.
`,
};

module.exports = { generateContent, createChatSession, prompts, aiQueue };
