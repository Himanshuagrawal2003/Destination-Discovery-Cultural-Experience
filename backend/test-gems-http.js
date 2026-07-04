require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const http = require('http');

const run = async () => {
  try {
    // 1. Connect to Mongoose to get user ID
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    require('./models/User');
    const User = mongoose.model('User');
    const user = await User.findOne({ email: 'user@culturequest.ai' });
    if (!user) {
      console.error('Test user "user@culturequest.ai" not found. Run "npm run seed" first.');
      process.exit(1);
    }

    console.log('Found user:', user.email, 'ID:', user._id);

    // 2. Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT Token.');

    // 3. Make POST request to /api/ai/hidden-gems
    const requestData = JSON.stringify({ country: 'India' });
    
    console.log('Sending request to /api/ai/hidden-gems...');
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/hidden-gems',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:');
        try {
          console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
        } catch {
          console.log(responseBody);
        }
        mongoose.disconnect();
        process.exit(0);
      });
    });

    req.on('error', (err) => {
      console.error('HTTP Request failed:', err.message);
      mongoose.disconnect();
      process.exit(1);
    });

    req.write(requestData);
    req.end();

  } catch (err) {
    console.error('Error:', err.message);
    mongoose.disconnect();
    process.exit(1);
  }
};

run();
