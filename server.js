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

  // Add the new user message to the conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  const options = {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: conversationHistory, // Send entire conversation history to OpenAI API
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

    // Add the assistant's response to the conversation history
    const assistantMessage = data.choices[0].message;
    conversationHistory.push({
      role: "assistant",
      content: assistantMessage.content,
    });

    // Send the assistant's response back to the client
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error communicating with OpenAI API.");
  }
});

app.listen(PORT, () => console.log("Your server is running on port " + PORT));
