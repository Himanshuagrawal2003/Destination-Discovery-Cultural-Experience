const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client safely
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;
const isMockMode = !apiKey || apiKey.trim() === '' || apiKey.startsWith('your_');

if (!isMockMode) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('⚠️ GoogleGenerativeAI initialization failed. Running in mock mode.', err.message);
  }
} else {
  console.log('ℹ️ Running geminiService in mock mode (no valid GEMINI_API_KEY provided)');
}

/**
 * Get a Gemini model instance
 * @param {string} model - Model name (default: gemini-1.5-flash)
 */
const getModel = (model = 'gemini-1.5-flash') => {
  if (isMockMode || !genAI) return null;
  return genAI.getGenerativeModel({ model });
};

/**
 * Generate text content with Gemini or fall back to mock data
 * @param {string} prompt - The full prompt to send
 * @param {string} model  - Model name
 * @returns {string} - Generated text response
 */
const generateContent = async (prompt, model = 'gemini-1.5-flash') => {
  if (isMockMode || !genAI) {
    console.log(`🤖 [MOCK AI] Generating response for prompt keywords: "${prompt.slice(0, 150)}..."`);
    // Wait a brief simulated latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMockResponse(prompt);
  }

  try {
    const geminiModel = getModel(model);
    const result      = await geminiModel.generateContent(prompt);
    const response    = result.response;
    return response.text();
  } catch (err) {
    console.warn(`⚠️ Gemini API call failed (${err.message}). Falling back to Mock Mode.`);
    // Fallback to mock data on any API error (invalid key, rate limit, quota, etc.)
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMockResponse(prompt);
  }
};

/**
 * Mock response helper based on prompt keywords
 */
const getMockResponse = (prompt) => {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes('recommenddestinations') || lowercasePrompt.includes('recommend 5 perfect destinations')) {
    return JSON.stringify([
      {
        "name": "Kyoto",
        "country": "Japan",
        "whyItMatches": "Kyoto offers a serene blend of traditional culture, stunning temples, and beautiful gardens that align perfectly with your interest in historical experiences and scenic beauty.",
        "budgetBreakdown": {
          "accommodation": "80",
          "food": "40",
          "transport": "15",
          "activities": "20"
        },
        "bestTime": "October to November (Autumn) or April (Cherry Blossom)",
        "topActivities": ["Visit Fushimi Inari Shrine", "Explore Gion District", "Kinkaku-ji (Golden Pavilion)"],
        "culturalTips": ["Bow when greeting someone", "Do not tip at restaurants - it is considered rude"],
        "hiddenGem": "Otagi Nenbutsu-ji Temple, famous for its 1200 stone statues of Rakan"
      },
      {
        "name": "Oaxaca",
        "country": "Mexico",
        "whyItMatches": "Oaxaca is the culinary heart of Mexico, offering rich Indigenous traditions, colorful festivals, and incredible street food that matches your taste for cultural immersion.",
        "budgetBreakdown": {
          "accommodation": "50",
          "food": "25",
          "transport": "10",
          "activities": "15"
        },
        "bestTime": "October to December",
        "topActivities": ["Explore Monte Albán ruins", "Taste Mole at Mercado 20 de Noviembre", "Visit Hierve el Agua"],
        "culturalTips": ["Learn a few Spanish greetings", "Always ask before taking photos of local people"],
        "hiddenGem": "Santiago Apoala, a stunning valley with waterfalls and canyons"
      },
      {
        "name": "Florence",
        "country": "Italy",
        "whyItMatches": "As the birthplace of the Renaissance, Florence is a treasure trove of art, architecture, and world-class Tuscan cuisine, offering a sophisticated and enriching travel experience.",
        "budgetBreakdown": {
          "accommodation": "110",
          "food": "50",
          "transport": "12",
          "activities": "30"
        },
        "bestTime": "May to September",
        "topActivities": ["Visit the Uffizi Gallery", "Climb the Duomo dome", "Walk across Ponte Vecchio"],
        "culturalTips": ["Cover shoulders and knees when entering churches", "Greet shopkeepers with a polite 'Buongiorno'"],
        "hiddenGem": "Bardini Gardens, offering peaceful panoramic views of Florence without the crowds"
      },
      {
        "name": "Cape Town",
        "country": "South Africa",
        "whyItMatches": "Cape Town combines breathtaking natural landscapes, diverse cultural history, and vibrant modern neighborhoods, perfect for an adventurous yet culturally rich getaway.",
        "budgetBreakdown": {
          "accommodation": "90",
          "food": "35",
          "transport": "15",
          "activities": "25"
        },
        "bestTime": "November to March",
        "topActivities": ["Take the cableway up Table Mountain", "Visit Robben Island", "Explore the Cape Peninsula"],
        "culturalTips": ["Be mindful of your safety and local advice", "Tipping around 10-15% is standard in restaurants"],
        "hiddenGem": "Kalk Bay, a quirky seaside village with antique shops and fresh seafood restaurants"
      },
      {
        "name": "Reykjavik",
        "country": "Iceland",
        "whyItMatches": "Reykjavik is the perfect gateway to Iceland's dramatic volcanic landscapes, hot springs, and mythical folklore, offering a unique adventure for nature lovers.",
        "budgetBreakdown": {
          "accommodation": "150",
          "food": "60",
          "transport": "40",
          "activities": "35"
        },
        "bestTime": "June to August (Midnight Sun) or September to March (Northern Lights)",
        "topActivities": ["Relax in the Blue Lagoon", "Tour the Golden Circle", "Watch the Northern Lights"],
        "culturalTips": ["Shower thoroughly before entering public geothermal pools", "Icelanders go by first names in directories"],
        "hiddenGem": "Nauthólsvík Geothermal Beach, where warm water flows into the cold sea"
      }
    ]);
  }
  
  if (lowercasePrompt.includes('hiddengems') || lowercasePrompt.includes('off-the-beaten-path') || lowercasePrompt.includes('hidden gem')) {
    return JSON.stringify([
      {
        "name": "Santiago Apoala",
        "location": "Oaxaca, Mexico",
        "whySpecial": "A pristine valley nestled in the Mixteca mountains with stunning emerald lagoons, twin waterfalls, and towering canyons.",
        "howToGetThere": "Take a local bus or taxi from Oaxaca City to Nochixtlán, then catch a daily colectivo (shared van) to Apoala.",
        "bestTime": "November to April (dry season)",
        "localSecret": "Ask a local guide to show you the 'Cueva del Diablo' (Devil's Cave) for ancient cave paintings.",
        "difficulty": "Moderate",
        "estimatedCostPerDay": "30"
      },
      {
        "name": "Otagi Nenbutsu-ji",
        "location": "Arashiyama, Kyoto, Japan",
        "whySpecial": "A quiet temple filled with over 1,200 whimsical stone statues of Buddhist disciples, each with a unique facial expression.",
        "howToGetThere": "Take the Kyoto City Bus 94 from Hankyu Arashiyama Station directly to the temple gate.",
        "bestTime": "Autumn (November) for red maple leaf contrast",
        "localSecret": "Try to find the statue holding a tennis racket or the two laughing statues holding a cup of sake.",
        "difficulty": "Easy",
        "estimatedCostPerDay": "15"
      },
      {
        "name": "Procida Island",
        "location": "Bay of Naples, Italy",
        "whySpecial": "The smallest and most authentic island in the Bay of Naples, famous for its pastel-colored houses and peaceful fishing village vibe.",
        "howToGetThere": "Take a 40-minute ferry from Naples (Molo Beverello or Calata di Massa).",
        "bestTime": "May, June, or September",
        "localSecret": "Walk to the highest point, Terra Murata, at sunset to see the entire bay glow in gold.",
        "difficulty": "Easy",
        "estimatedCostPerDay": "65"
      },
      {
        "name": "Albarracín",
        "location": "Teruel, Aragon, Spain",
        "whySpecial": "A breathtaking medieval town built on a rocky cliffside, voted the most beautiful village in Spain, with pinkish-red stone houses.",
        "howToGetThere": "Drive from Valencia (2 hours) or take a train to Teruel and then a local bus.",
        "bestTime": "September to October",
        "localSecret": "The local bakery, Pastelería La Losa, makes the best traditional 'almojábanas' (cheese pastries) using a secret 500-year-old recipe.",
        "difficulty": "Moderate",
        "estimatedCostPerDay": "45"
      },
      {
        "name": "Kalk Bay",
        "location": "Cape Town, South Africa",
        "whySpecial": "A bohemian fishing village with a working harbor, historic tidal pools, and a vibrant community of artists and fishermen.",
        "howToGetThere": "Take the Southern Line train from Cape Town Central Station directly to Kalk Bay.",
        "bestTime": "September to November",
        "localSecret": "Walk to the end of the harbor pier to buy fresh catches directly from the boats, and watch the resident Cape Fur Seals play.",
        "difficulty": "Easy",
        "estimatedCostPerDay": "40"
      },
      {
        "name": "Snaefellsnes Peninsula",
        "location": "West Iceland",
        "whySpecial": "Often called 'Iceland in Miniature' because it contains all of Iceland's signature wonders—glaciers, volcanoes, lava fields, and waterfalls.",
        "howToGetThere": "Rent a car and drive 2 hours north from Reykjavik along Route 1 and Route 54.",
        "bestTime": "June to August",
        "localSecret": "Visit the mineral spring of Ölkelda, where you can drink naturally carbonated sparkling water straight from the ground.",
        "difficulty": "Moderate",
        "estimatedCostPerDay": "90"
      }
    ]);
  }
  
  if (lowercasePrompt.includes('foodguide') || lowercasePrompt.includes('must-try traditional dishes') || lowercasePrompt.includes('culinary expert')) {
    return JSON.stringify({
      "traditionalDishes": [
        { "name": "Chiles en Nogada", "description": "Poblano chilies stuffed with a mixture of shredded meat, fruits, and spices, topped with a walnut-based cream sauce (nogada) and pomegranate seeds.", "bestWhereToTry": "Oaxaca and Puebla traditional restaurants", "priceRange": "$$ (Mid-range)" },
        { "name": "Tlayudas", "description": "Large, thin, crunchy toasted tortillas covered with spread of refried beans, asiento (unrefined pork lard), cabbage, avocado, meat (usually tasajo or cecina), and Oaxaca cheese.", "bestWhereToTry": "Mercado 20 de Noviembre, Oaxaca", "priceRange": "$ (Budget)" }
      ],
      "streetFood": [
        { "name": "Tacos al Pastor", "description": "Thinly sliced spit-roasted pork marinated in dried chilies, spices, and pineapple, served on small corn tortillas with onions, cilantro, and pineapple.", "whereToFind": "Street stalls across Mexico", "bestTime": "Late evening/Night", "price": "$ (Budget)" }
      ],
      "desserts": [
        { "name": "Tres Leches Cake", "description": "A sponge cake soaked in three kinds of milk: evaporated milk, condensed milk, and heavy cream, topped with whipped cream.", "culturalSignificance": "A staple dessert at Mexican birthday parties, weddings, and family gatherings, symbolizing sweet hospitality." }
      ],
      "restaurants": [
        { "name": "Criollo", "type": "Fine Dining", "priceRange": "$$$ (Expensive)", "specialty": "Tasting menu featuring local, seasonal Oaxacan ingredients with modern techniques", "area": "Centro, Oaxaca" }
      ],
      "diningEtiquette": [
        "Saying 'Buen provecho' before starting a meal is a polite custom.",
        "Tipping is expected: 10% is standard, 15% for exceptional service.",
        "Keep hands visible on the table, not on your lap.",
        "Avoid leaving immediately after finishing a meal; 'la sobremesa' (table talk) is highly valued."
      ]
    });
  }
  
  if (lowercasePrompt.includes('festivalguide') || lowercasePrompt.includes('festivals and cultural events')) {
    return JSON.stringify([
      {
        "name": "Day of the Dead (Día de los Muertos)",
        "type": "Traditional / Cultural",
        "when": "October 31 - November 2",
        "location": "Oaxaca and Central Mexico",
        "history": "An ancient Mesoamerican holiday where families welcome back the souls of their deceased relatives for a brief reunion. Altars are built with marigolds, candles, and favorite foods.",
        "howToExperienceIt": "Visit local cemeteries respectfully, see the elaborate altars (ofrendas) in town squares, and join the colorful night parades.",
        "dressCode": "Casual; many people paint their faces as sugar skulls (Catrinas). Avoid overly revealing clothes in cemeteries.",
        "culturalImportance": "A celebration of life, showing that death is not the end, but a natural phase of human existence.",
        "tipsForVisitors": "Do not touch ofrendas or grave decorations. Always ask before photographing people or graves.",
        "photography": "Respectful photography is allowed, but turn off your flash in cemeteries and ask families first."
      }
    ]);
  }
  
  if (lowercasePrompt.includes('culturalguide') || lowercasePrompt.includes('cultural anthropologist and etiquette')) {
    return JSON.stringify({
      "greetings": [
        "A warm handshake is the most common greeting for men and women.",
        "Close friends often greet each other with a light hug or a single kiss on the right cheek (among women, or between a man and a woman)."
      ],
      "religiousPractices": [
        "Most locals are Roman Catholic. Sacred sites require respectful behavior.",
        "Remove hats when entering churches, lower your voice, and avoid photography during active mass/services."
      ],
      "traditionalClothing": [
        "Locals wear standard modern clothing, but traditional embroidered garments (like Huipiles) are proudly worn on festivals and in indigenous communities.",
        "Visitors should dress modestly when visiting churches; cover shoulders and knees."
      ],
      "businessEtiquette": [
        "Build a personal relationship before discussing business details. Small talk is essential.",
        "Meetings may start slightly late; patience and flexibility are appreciated."
      ],
      "thingsToAvoid": [
        "Do not stand with your hands on your hips, which can be interpreted as anger or aggression.",
        "Avoid speaking loudly or complaining aggressively in public spaces."
      ],
      "foodDining": [
        "Keep your hands visible on the table. Tipping 10% is standard in sit-down restaurants.",
        "Wait for the host to say 'Buen provecho' before starting to eat."
      ],
      "communicationStyle": [
        "Indirect communication is preferred to maintain harmony. Saying 'no' directly is often avoided in favor of 'maybe' or 'we will see'.",
        "Personal space is smaller than in Northern Europe or the USA."
      ]
    });
  }
  
  if (lowercasePrompt.includes('languagehelper') || lowercasePrompt.includes('practical language guide')) {
    return JSON.stringify({
      "greetings": [
        { "phrase": "Hola", "phonetic": "OH-lah", "meaning": "Hello", "whenToUse": "Anytime, informal" },
        { "phrase": "Buenos días", "phonetic": "BWEH-nos DEE-ahs", "meaning": "Good morning", "whenToUse": "Before noon" },
        { "phrase": "Buenas tardes", "phonetic": "BWEH-nas TAR-des", "meaning": "Good afternoon", "whenToUse": "From noon to sunset" },
        { "phrase": "Buenas noches", "phonetic": "BWEH-nas NOH-chehs", "meaning": "Good evening / Good night", "whenToUse": "After sunset" }
      ],
      "usefulPhrases": [
        { "phrase": "Por favor", "phonetic": "por fah-VOR", "meaning": "Please" },
        { "phrase": "Gracias", "phonetic": "GRAH-syahs", "meaning": "Thank you" },
        { "phrase": "Disculpe", "phonetic": "dees-KOOL-peh", "meaning": "Excuse me" },
        { "phrase": "¿Cuánto cuesta?", "phonetic": "KWAN-toh KWEHS-tah", "meaning": "How much does it cost?" }
      ],
      "emergencyPhrases": [
        { "phrase": "Ayuda", "phonetic": "ah-YOO-dah", "meaning": "Help" },
        { "phrase": "Necesito ayuda", "phonetic": "neh-seh-SEE-toh ah-YOO-dah", "meaning": "I need help" }
      ],
      "numbers": [
        { "phrase": "Uno, Dos, Tres", "phonetic": "OO-noh, dos, tres", "meaning": "1, 2, 3" }
      ],
      "culturalTips": [
        "Always say 'gracias' and 'por favor' - politeness is highly valued.",
        "Use 'Usted' (formal you) when speaking to elderly people or in professional settings."
      ]
    });
  }
  
  if (lowercasePrompt.includes('budgetplanner') || lowercasePrompt.includes('budget planner') || lowercasePrompt.includes('budget tiers')) {
    return JSON.stringify({
      "budget": {
        "dailyBreakdown": {
          "accommodation": "25",
          "food": "15",
          "transport": "5",
          "activities": "8",
          "shopping": "5",
          "misc": "4"
        },
        "totalCost": "434"
      },
      "midRange": {
        "dailyBreakdown": {
          "accommodation": "65",
          "food": "30",
          "transport": "12",
          "activities": "20",
          "shopping": "15",
          "misc": "8"
        },
        "totalCost": "1050"
      },
      "luxury": {
        "dailyBreakdown": {
          "accommodation": "180",
          "food": "75",
          "transport": "35",
          "activities": "50",
          "shopping": "40",
          "misc": "20"
        },
        "totalCost": "2800"
      },
      "savingTips": [
        "Eat at local food markets (mercados) for authentic and budget-friendly meals.",
        "Use shared transportation (colectivos) instead of private taxis.",
        "Look for free museum days, usually on Sundays."
      ],
      "emergencyBuffer": "150",
      "paymentTips": {
        "currency": "Mexican Peso (MXN)",
        "atm": "Widely available in cities, use bank-affiliated ATMs for lower fees",
        "cards": "Accepted in major hotels and restaurants, cash is needed for markets and street stalls"
      }
    });
  }
  
  if (lowercasePrompt.includes('itinerary planner') || lowercasePrompt.includes('itinerary') || lowercasePrompt.includes('day-wise')) {
    return JSON.stringify([
      {
        "dayNumber": 1,
        "theme": "Historical Highlights & Local Flavors",
        "morning": {
          "activity1": { "name": "Visit Santo Domingo Church", "description": "Explore the beautiful baroque church and its adjacent cultural museum.", "duration": "2 hours", "cost": "5", "address": "Macedonio Alcalá, Centro" },
          "breakfast": { "name": "Café Centro", "dish": "Huevos Rancheros with hot chocolate", "price": "8" }
        },
        "afternoon": {
          "activity2": { "name": "Explore Mercado 20 de Noviembre", "description": "Taste local delicacies like tlayudas and chapulines (grasshoppers).", "duration": "2 hours", "cost": "10" },
          "lunch": { "name": "Pasillo de Humo", "specialty": "Grilled tasajo (beef) with spring onions", "price": "12" }
        },
        "evening": {
          "activity4": { "name": "Sunset Walk at Zócalo Square", "description": "Enjoy live marimba music and watch the local street life." },
          "dinner": { "name": "Los Danzantes", "cuisine": "Contemporary Oaxacan cuisine with mezcal pairing", "priceRange": "$$$ (Expensive)" },
          "optional": "Enjoy a mezcal tasting at a local mezcalería"
        },
        "summary": {
          "estimatedDailyCost": "45",
          "distanceCovered": "3 km",
          "transport": "Walking",
          "proTips": "Wear comfortable walking shoes and stay hydrated."
        }
      }
    ]);
  }
  
  if (lowercasePrompt.includes('storytelling')) {
    return "Welcome to Kyoto, the beating heart of traditional Japan. As a local guide, I am thrilled to show you the layers of history, spirituality, and quiet magic that define my home. Kyoto’s story begins in 794 AD, when it was chosen as the imperial capital of Japan, then known as Heian-kyo, or the 'Capital of Peace and Tranquility'. For over a millennium, emperors, courtesans, samurai, and monks walked these streets, leaving behind a legacy of seventeen UNESCO World Heritage sites. As we walk through the Gion district in the late afternoon, the wooden townhouses (machiya) cast long shadows on the cobblestones. You might catch a glimpse of a geiko or maiko gliding silently past, her elaborate kimono whispering against the sliding paper doors. Kyoto is a city of stories and spirits, where the old gods are honored in quiet corners, and every stone has a name. Let us start our journey by exploring the golden pagoda of Kinkaku-ji, which glows with an ethereal light against its surrounding pond...";
  }

  // Fallback default chat response
  return "Hello! I am CultureQuest AI, your digital travel guide. I'd love to help you plan your next adventure! If you want a detailed travel itinerary, custom food guides, or recommendations for hidden gems, just let me know. What destination or experience are you interested in exploring today?";
};

/**
 * Generate a chat session for contextual conversations
 */
const createChatSession = (history = [], model = 'gemini-1.5-flash') => {
  const geminiModel = getModel(model);
  return geminiModel.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature:     0.7,
    },
  });
};

// ─── Prompt Templates ─────────────────────────────────────────────────────────

const prompts = {
  recommendDestinations: ({ budget, travelStyle, season, interests, country, duration }) => `
You are an expert travel consultant. Based on the following preferences, recommend 5 perfect destinations.

User Preferences:
- Budget: ${budget} per person
- Travel Style: ${travelStyle}
- Season/Month: ${season}
- Interests: ${interests.join(', ')}
- Country/Region: ${country || 'anywhere in the world'}
- Trip Duration: ${duration} days

For each destination provide:
1. **Destination Name & Country**
2. **Why It Matches**: 2-3 sentences
3. **Estimated Budget Breakdown**: Accommodation, Food, Transport, Activities (per day in USD)
4. **Best Time to Visit**
5. **Top 3 Activities**
6. **Cultural Tips**: 2 key insights
7. **Hidden Gem Nearby**

Format as structured JSON array with keys: name, country, whyItMatches, budgetBreakdown, bestTime, topActivities, culturalTips, hiddenGem.
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
7. **Estimated Cost per Day**

Format as JSON array with keys: name, location, whySpecial, howToGetThere, bestTime, localSecret, difficulty, estimatedCostPerDay.
`,

  foodGuide: ({ country, city, dietaryPreferences }) => `
You are a culinary expert and food anthropologist specializing in ${country}${city ? `, specifically ${city}` : ''}.

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

Include:

**Greetings & Social Customs**:
- How to greet locals (handshake, bow, etc.)
- Formal vs informal situations
- Names and titles

**Religious Practices & Sacred Sites**:
- Major religions
- Temple/mosque/church etiquette
- Sacred items and gestures

**Traditional Clothing**:
- What locals wear
- What visitors should/shouldn't wear
- Modesty guidelines

**Business Etiquette**:
- Meeting culture
- Business card exchange
- Negotiation style

**Things to Avoid**:
- Cultural taboos
- Offensive gestures
- Social faux pas

**Food & Dining Culture**:
- Table customs
- What's considered rude
- Host/guest dynamics

**Communication Style**:
- Direct vs indirect communication
- Personal space norms
- Topics to avoid

Format as structured JSON with above sections.
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

Provide three budget tiers (Budget / Mid-Range / Luxury):

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

Format as JSON array of days with: dayNumber, theme, morning, afternoon, evening, summary.
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

module.exports = { generateContent, createChatSession, prompts };
