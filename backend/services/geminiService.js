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
    if (model !== 'llama-3.1-8b-instant') {
      try {
        const resultFallback = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 4096,
        });
        return resultFallback.choices[0].message.content;
      } catch (fallbackErr) {
        console.warn(`⚠️ Groq fallback model llama-3.1-8b-instant also failed (${fallbackErr.message}).`);
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
 * @param {string} model  - Model name (default: llama-3.3-70b-versatile)
 * @returns {string} - Generated text response
 */
const generateContent = async (prompt, model = 'llama-3.3-70b-versatile') => {
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
const createChatSession = (history = [], model = 'llama-3.3-70b-versatile') => {
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
- Budget: ${budget} per person
- Travel Style: ${travelStyle}
- Season/Month: ${season}
- Interests: ${interests.join(', ')}
- Country/Region: ${country || 'anywhere in the world'}
- Trip Duration: ${duration} days

CRITICAL REQUIREMENT FOR GEOGRAPHIC RESTRICTION:
- If a specific Country/Region is specified above (e.g., "${country}"), or if the user's Desired Vibe/Experience Description mentions or implies a specific country/region (e.g., "India"), you MUST strictly recommend destinations that are located ONLY within that specific country/region. Do NOT recommend any destinations outside of that country/region under any circumstances.

For each destination provide:
1. **Destination Name & Country**
2. **Why It Matches**: 2-3 sentences based heavily on their desired vibe/experience or preferences.
3. **Estimated Budget Breakdown**: Accommodation, Food, Transport, Activities (per day in INR, Indian Rupees, ₹)
4. **Best Time to Visit**
5. **Top 3 Activities**
6. **Cultural Tips**: 2 key insights
7. **3 Nearby Hidden Gems**: A list of 3 off-the-beaten-path hidden gems, each with a name and brief description of what makes it special.
8. **3 Famous Local Foods**: A list of 3 must-try traditional foods/specialties, each with a name and brief description.
9. **Map Coordinates**: Centered latitude and longitude (numeric values).

Format the output strictly as a structured JSON array where each object has these exact keys:
name, country, whyItMatches, budgetBreakdown (object with keys: accommodation, food, transport, activities), bestTime, topActivities (array of strings), culturalTips (array of strings), hiddenGems (array of objects with keys: name, description), famousFoods (array of objects with keys: name, description), latitude (number), longitude (number).
`,

  generateDestinationProfile: (destinationNameOrSlug) => `
You are an expert travel guide. The user requested details for the destination/region: "${destinationNameOrSlug}".
Generate a complete, high-quality, and detailed travel profile for this destination.

Provide:
1. **Name & Country & City**
2. **Category**: Choose one of ['beach', 'mountain', 'city', 'desert', 'forest', 'historical', 'adventure', 'cultural', 'wildlife', 'other']
3. **Detailed Description** (up to 300 words)
4. **History** (up to 200 words)
5. **Culture** (up to 200 words)
6. **Coordinates**: Numerical Latitude and Longitude.
7. **Budget**: Min daily cost (number in INR, ₹), Max daily cost (number in INR, ₹), Level ('budget' / 'mid-range' / 'luxury')
8. **Best Season**: Array of strings (e.g. ['spring', 'autumn'])
9. **Highlights**: Array of 4-5 major tourist highlights.
10. **Travel Tips**: Array of 3 essential travel guidelines.
11. **Famous Places & Palaces**: 3 key landmarks (monuments, palaces, parks), each with a name and description.
12. **Hidden Gems**: 3 off-the-beaten-path locations in the city/region, each with a name and description.
13. **Famous Foods**: 3 must-try traditional dishes, each with a name and description.
14. **Cover Image**: A valid, high-resolution Unsplash photo URL relevant to the city/destination (e.g., "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200").

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

These should be places that:
- Are NOT famous tourist attractions
- Offer authentic, unspoiled experiences
- Align with: ${interests?.join(', ') || 'general travel'}
- Suit travel style: ${travelStyle || 'solo'}

For each hidden gem provide:
1. **Name & Location**
2. **Why It's Special** (what makes it unique)
3. **How to Get There**
4. **Best Time to Visit**
5. **Local Secret**: Something only locals know
6. **Difficulty Level**: Easy/Moderate/Challenging
7. **Estimated Cost per Day (in INR, ₹)**

Format as JSON array with keys: name, location, whySpecial, howToGetThere, bestTime, localSecret, difficulty, estimatedCostPerDay.
`,

  foodGuide: ({ country, city, dietaryPreferences }) => `
You are a culinary expert and food anthropologist specializing in ${country}${city ? `, specifically ${city}` : ''}.
${dietaryPreferences ? `CRITICAL DIETARY DIRECTIVE: The user has specified the following dietary preference: "${dietaryPreferences}". You MUST strictly comply with this. All suggested traditional dishes, street food gems, desserts, and recommended restaurants MUST be 100% compliant with this dietary preference (for example: if the preference is "veg" or "vegetarian", do NOT suggest any meat, poultry, chicken, beef, pork, seafood, fish, or egg dishes anywhere. Every single item must be vegetarian).` : ''}

Create a comprehensive local food guide including:

**Must-Try Traditional Dishes** (5 dishes):
- Name, description, best where to try, price range

**Street Food Gems** (5 items):
- Name, where to find, best time, price

**Local Desserts & Sweets** (3 items):
- Name, description, cultural significance

**Recommended Restaurants** (4 restaurants):
- Name, type, price range, specialty, area

**Dining Etiquette**:
- Table manners, tipping customs, ordering tips, things to avoid

**Dietary Considerations**:
${dietaryPreferences ? `- User preferences: ${dietaryPreferences}` : '- General tips for various dietary restrictions'}

Format as structured JSON with sections: traditionalDishes, streetFood, desserts, restaurants, diningEtiquette.
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
You are a cultural anthropologist and etiquette expert. Create a comprehensive cultural guide for travelers visiting ${country}${city ? `, ${city}` : ''}.

Format your output strictly as a structured JSON object inside a JSON code block (\`\`\`json ... \`\`\`) with the following exact keys:
- "greetingsAndCustoms": detailed greetings and social customs (rules, bowing, handshakes, titles).
- "religiousEtiquette": sacred sites etiquette, major practices, temple/mosque/church decorum.
- "clothingEtiquette": what locals wear, modesty guidelines, clothing dos and don'ts for visitors.
- "thingsToAvoid": cultural taboos, offensive gestures, and social faux pas.
`,

  languageHelper: ({ country, language, situation }) => `
You are a professional linguist specializing in ${language || country + '\'s language'}.

Create a practical language guide for travelers with these sections:

**Essential Greetings** (10 phrases):
- Phrase in local language
- Phonetic pronunciation
- English meaning
- When to use

**Useful Daily Phrases** (15 phrases):
- Shopping, directions, food ordering, emergencies

**Emergency Phrases** (8 phrases):
- I need help, Call police, I'm lost, Medical emergency, etc.

**Numbers 1-20** with pronunciation

**Cultural Language Tips**:
- Formal vs informal speech
- Respectful words and titles
- Common misunderstandings

${situation ? `**Situation-Specific**: Extra phrases for: ${situation}` : ''}

Format as JSON with sections: greetings, usefulPhrases, emergencyPhrases, numbers, culturalTips.
`,

  budgetPlanner: ({ destination, duration, travelStyle, groupSize }) => `
You are an expert travel financial planner. Create a detailed budget plan for:

- Destination: ${destination}
- Duration: ${duration} days
- Travel Style: ${travelStyle || 'mid-range'}
- Group Size: ${groupSize || 1} person(s)

Provide three budget tiers (Budget / Mid-Range / Luxury). All monetary values, daily breakdowns, emergency buffers, and total costs MUST be calculated and represented in Indian Rupees (INR, ₹).

For each tier include:
1. **Daily Cost Breakdown**:
   - Accommodation (per night)
   - Breakfast / Lunch / Dinner
   - Local Transport
   - Activities & Entrance Fees
   - Shopping allowance
   - Misc/Tips

2. **Total Trip Cost** (for ${duration} days, ${groupSize} person(s))

3. **Money-Saving Tips** (5 specific tips for this destination)

4. **Emergency Buffer**: Recommended amount (10-15%)

5. **Payment Tips**:
   - Best currency to carry
   - ATM availability
   - Credit card acceptance
   - Best exchange locations

Format as JSON with tiers: budget, midRange, luxury and sections: dailyBreakdown, totalCost, savingTips, emergencyBuffer, paymentTips.
`,

  itinerary: ({ destination, days, interests, budget, travelStyle }) => `
You are a master travel itinerary planner. Create a detailed ${days}-day itinerary for ${destination}.
All estimated daily costs, restaurant prices/costs, activity costs, and other money values MUST be calculated and represented strictly in Indian Rupees (INR, ₹).

Travel preferences:
- Interests: ${interests?.join(', ') || 'general tourism'}
- Budget: ${budget || 'mid-range'}
- Travel style: ${travelStyle || 'solo'}

For each day provide:
**Day X: [Theme Title]**

Morning (6 AM - 12 PM):
- Activity 1: Name, description, duration, cost, address
- Breakfast spot: Name, dish recommendation, price

Afternoon (12 PM - 6 PM):
- Activity 2 & 3: Name, description, duration, cost
- Lunch spot: Name, specialty, price

Evening (6 PM - 11 PM):
- Activity 4: Name, description
- Dinner spot: Name, cuisine, price range
- Optional: Nightlife or cultural show

**Day Summary**:
- Estimated daily cost
- Distance covered
- Transport between locations
- Pro tips for the day

Format strictly as a JSON array of days. You MUST generate exactly ${days} elements in this array, one for each day. Each day MUST have:
- dayNumber (number)
- theme (string)
- morning (array of activity objects: name, description, duration, cost, address. INCLUDE breakfast spot here as an activity)
- afternoon (array of activity objects. INCLUDE lunch spot here as an activity)
- evening (array of activity objects. INCLUDE dinner spot here as an activity)
- summary (object with estimatedDailyCost, distanceCovered, transportBetweenLocations, proTips)
`,

  routePlanner: ({ origin, destination, preferences }) => `
You are a transit and logistics expert specializing in travel route optimization. 
Recommend the best pathways/routes to travel from "${origin}" to "${destination}".
${preferences ? `Consider these traveler preferences/restrictions: "${preferences}".` : ''}

Provide structured route recommendations across travel options like budget, luxury, fastest, and scenic, utilizing transport modes like bus, car, train, and airplane.

For each option, detail:
1. **Option Title**: (e.g., "Budget Route (Train & Bus)", "Luxury & Comfort Route (Flight & Private Car)")
2. **Total Estimated Cost**: in INR (₹)
3. **Total Travel Duration**: (e.g., "14 hours", "3 hours")
4. **Step-by-Step Pathway**: A list of steps (where to get the transport, transit points, terminal/station names, etc.)
5. **Best Booking Platforms/Places**: Where to book the tickets or rent/hire the transport.
6. **Pros & Cons**: 2 pros and 2 cons.

Format the output strictly as a structured JSON object with the following keys:
- "bestRoute": A short, user-friendly recommendation of the overall best route option.
- "options": An array of route option objects. Each route option object must have the keys:
  - "title": (string)
  - "cost": (string)
  - "duration": (string)
  - "pathway": (array of strings, detailing step-by-step transition points and transit modes)
  - "bookingInfo": (array of strings, showing websites/apps or offline counters to book)
  - "pros": (array of strings)
  - "cons": (array of strings)
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
