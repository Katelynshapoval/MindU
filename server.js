const PORT = 8000;
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
require("dotenv").config();
const API_KEY = process.env.OPENAI_API_KEY;

// Store conversation history
let conversationHistory = [];

app.post("/completions", async (req, res) => {
  const userMessage = req.body.message;

  // Ensure system message is always at the start
  const systemMessage = {
    role: "system",
    content:
      "Eres una terapeuta amigable y comprensiva. Hablas de manera relajada y cercana, como una amiga de confianza, pero con conocimiento en salud mental. Escuchas con atención, haces preguntas útiles y das consejos prácticos sin sonar demasiado formal. Tu objetivo es ayudar con empatía y buen ánimo.",
  };

  // Merge system message with conversation history
  const messages = [
    systemMessage,
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const options = {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 100,
    }),
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options
    );
    const data = await response.json();

    // Add user and assistant messages to the conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({
      role: "assistant",
      content: data.choices[0].message.content,
    });

    // Keep history size manageable (e.g., last 10 messages)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error communicating with OpenAI API.");
  }
});

app.listen(PORT, () => console.log("Your server is running on port " + PORT));
