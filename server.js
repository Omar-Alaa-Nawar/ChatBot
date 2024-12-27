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
  ];

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
  // Company logo and color are hardcoded as red and black
  const logoUrl = req.query.logoUrl || 'https://img.icons8.com/?size=100&id=114455&format=png&color=000000'; // Direct URL to Coca-Cola logo
  const companyColor = '#FF0000'; // Red color for the company

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chatbot</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
      <script>
        // Inject CSS dynamically into the DOM
        document.addEventListener('DOMContentLoaded', () => {
          injectCSS('${companyColor}');
        });

        function injectCSS(companyColor) {
          const style = document.createElement('style');
          style.type = 'text/css';
          style.innerHTML = \`
 /* General Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Poppins', sans-serif;
          background-color: #1e1e1e; /* Dark background for the whole page */
          color: #f4f4f4; /* Light text */
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }

        /* Chat Bubble (Old Design) */
        #chat-bubble {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: ${companyColor}; /* Company dynamic color */
          color: #fff;
          padding: 15px 20px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          font-size: 24px;
          transition: background-color 0.3s;
        }

        #chat-bubble:hover {
          background-color: darken(${companyColor}, 10%); /* Darker shade of the company color on hover */
        }

        #chat-icon {
          font-size: 20px;
        }

        /* Chat Box (Larger Design) */
        #chat-box {
          display: none; /* Initially hidden */
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: black; /* Static background color */
          border-radius: 10px;
          width: 500px; /* Increased width for larger chat box */
          height: 600px; /* Increased height for larger chat box */
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }

        #chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 20px;
          position: relative; /* For positioning the close button */
        }

        #company-logo img {
          width: 50px;
          height: 50px;
          margin-bottom: 15px;
          align-self: center;
        }

        h1 {
          font-size: 24px; /* Increased font size */
          font-weight: 600;
          color: ${companyColor}; /* Company dynamic color */
          text-align: center;
          margin: 20px 0;
        }

        /* Close Button (Cross) */
        #close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: #f4f4f4;
          font-size: 30px;
          cursor: pointer;
          transition: color 0.3s;
        }

        #close-btn:hover {
          color: #ff4d4d;
        }

        /* Chat History */
        #chat-history {
          flex-grow: 1;
          padding: 20px;
          overflow-y: auto;
          margin-bottom: 20px;
          background-color: #1e1e1e;
          border-radius: 10px;
        }

        .message {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .user-message {
          background-color: ${companyColor}; /* Company dynamic color */
          color: #fff;
          border-radius: 15px;
          padding: 12px 18px;
          max-width: 75%;
          margin-left: auto;
          word-wrap: break-word;
        }

        .bot-message {
          background-color: #444;
          color: #f4f4f4;
          border-radius: 15px;
          padding: 12px 18px;
          max-width: 75%;
          margin-right: auto;
          word-wrap: break-word;
        }

        /* Input Area */
        form {
          display: flex;
          flex-direction: column;
          padding: 15px;
          background-color: #262626;
          border-top: 1px solid #444;
        }

        /* Textarea Styling for Multi-line Input */
        textarea {
          width: 100%;
          height: 60px; /* Increased height for the textarea */
          padding: 12px 15px;
          font-size: 16px;
          border-radius: 10px;
          border: 1px solid #444;
          background-color: #333;
          color: #f4f4f4;
          outline: none;
          resize: none;
          overflow-y: auto; /* Allows scrolling */
          transition: border-color 0.3s;
          margin-bottom: 10px;
        }

        button {
          background-color: ${companyColor}; /* Company dynamic color */
          color: #fff;
          padding: 10px 15px; /* Slightly larger button */
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px; /* Larger font size */
          transition: background-color 0.3s;
        }

        textarea:focus {
          border-color: ${companyColor}; /* Company dynamic color */
        }

        button:hover {
          background-color: darken(${companyColor}, 10%); /* Darker shade of the company color on hover */
        }

        /* Scrollbar Styling */
        #chat-history::-webkit-scrollbar,
        textarea::-webkit-scrollbar {
          width: 8px;
        }

        #chat-history::-webkit-scrollbar-thumb,
        textarea::-webkit-scrollbar-thumb {
          background-color: ${companyColor}; /* Company dynamic color */
          border-radius: 10px;
        }

        #chat-history::-webkit-scrollbar-track,
        textarea::-webkit-scrollbar-track {
          background-color: #1e1e1e;
        }

        /* Responsive Design */
        @media (max-width: 800px) {
          #chat-box {
            width: 100%;
            bottom: 0;
            right: 0;
          }

          #chat-container {
            height: 60vh;
          }
        }
          \`;
          document.head.appendChild(style);
        }
      </script>
    </head>
    <body>
      <div id="main-container">
        <!-- Chat Bubble -->
        <div id="chat-bubble" onclick="toggleChatBox()">
          <div id="chat-icon">💬</div>
        </div>

        <!-- Chat Box (hidden initially) -->
        <div id="chat-box">
          <div id="chat-container">
            <button id="close-btn" onclick="toggleChatBox()">×</button> <!-- Close button -->
            <div id="company-logo">
              <img src="${logoUrl}" alt="Company Logo" />
            </div>
            <h1>Chatbot</h1>
            <div id="chat-history"></div>
            <form id="chat-form">
              <textarea id="user-input" placeholder="Ask me anything..." required></textarea>
              <button type="submit" id="send-button">Send</button>
            </form>
          </div>
        </div>
      </div>

      <script>
        // Toggle Chat Box
        function toggleChatBox() {
          const chatBox = document.getElementById('chat-box');
          chatBox.style.display = chatBox.style.display === 'none' || chatBox.style.display === '' ? 'block' : 'none';
        }

        // Simulate bot typing effect
        function typeBotMessage(message, element) {
          let index = 0;
          const typingInterval = setInterval(() => {
            element.textContent += message.charAt(index);
            index++;
            if (index === message.length) {
              clearInterval(typingInterval);
            }
          }, 50); // Adjust typing speed here
        }

        // Handle form submission
        document.getElementById('chat-form').addEventListener('submit', async function (e) {
          e.preventDefault(); // Prevent form from refreshing the page

          const userInput = document.getElementById('user-input').value;
          if (!userInput) return;

          // Display the user's message
          const chatHistory = document.getElementById('chat-history');
          const userMessage = document.createElement('div');
          userMessage.classList.add('message', 'user-message');
          userMessage.textContent = userInput;
          chatHistory.appendChild(userMessage);
          document.getElementById('user-input').value = '';

          // Send user input to the server for processing
          const response = await fetch('/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput }),
          });

          const result = await response.json();
          const botMessage = document.createElement('div');
          botMessage.classList.add('message', 'bot-message');
          chatHistory.appendChild(botMessage);

          // Simulate typing effect for bot's message
          typeBotMessage(result.response, botMessage);

          chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom
        });
      </script>
    </body>
    </html>
  `);
});

// Endpoint for chatting
app.post('/chat', async (req, res) => {
  const userInput = req.body.userInput;
  const botResponse = await runChat(userInput);
  res.json({ response: botResponse });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
