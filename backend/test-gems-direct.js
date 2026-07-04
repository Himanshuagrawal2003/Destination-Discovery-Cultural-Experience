require('dotenv').config();
const { generateContent, prompts } = require('./services/geminiService');

const run = async () => {
  try {
    console.log('Testing geminiService.generateContent with prompts.hiddenGems...');
    const prompt = prompts.hiddenGems({ country: 'India', travelStyle: 'solo', interests: ['history', 'food'] });
    console.log('Prompt:', prompt);
    const result = await generateContent(prompt);
    console.log('--- Response ---');
    console.log(result);
    console.log('----------------');
  } catch (err) {
    console.error('Error occurred:', err.stack || err.message);
  }
};

run();
