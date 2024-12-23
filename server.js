const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const fetch = require('node-fetch'); // Ensure you have node-fetch installed

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

// Use the environment variable or directly add the API key here
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCLobe6CAms3QrITgSAn8gQy5jfKORQkCg';
const MODEL_NAME = "gemini-1.5-flash";

// Function to run chat using Google Gemini API
async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // Add other safety settings as needed
  ];

  // Start chat with an empty history, no prompts for name/email
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
    history: [],
  });

  const result = await chatSession.sendMessage(userInput);
  return result.response.text();
}

// Express route for the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve a loading GIF (optional)
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// Endpoint to handle chat requests
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Call the chat function and send back the response
    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to interact directly with the Google Gemini API via fetch (using the API key directly in the URL)
app.post('/generate-content', async (req, res) => {
  const userInput = req.body?.userInput;
  if (!userInput) {
    return res.status(400).json({ error: 'User input is required' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userInput,
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      res.json({ response: data });
    } else {
      res.status(500).json({ error: data.error || 'Error generating content' });
    }
  } catch (error) {
    console.error('Error in /generate-content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
