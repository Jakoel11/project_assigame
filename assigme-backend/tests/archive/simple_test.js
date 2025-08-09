// Simple test script
const axios = require('axios');

async function simpleTest() {
  try {
    const response = await axios.get('http://localhost:5001');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTest();
