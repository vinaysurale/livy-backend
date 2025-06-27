const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// ✅ Native-compatible fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Middleware
app.use(cors());
app.use(express.json());

// 🗝️ Groq API key
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/api/ask', async (req, res) => {
  const userQuestion = req.body.question;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are LIVY, an Indian legal expert AI. Answer all legal questions using Indian law knowledge. Be accurate, fact-based, and neutral. Never give personal opinions or legal advice."
          },
          { role: "user", content: userQuestion }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();
    console.log("💬 Groq Response:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0) {
      res.json({ answer: data.choices[0].message.content });
    } else {
      res.status(500).json({ answer: "⚠️ LIVY couldn't generate a legal response." });
    }

  } catch (err) {
    console.error("❌ Groq API error:", err.message || err);
    res.status(500).json({ answer: "⚠️ Error reaching LIVY server." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 LIVY (Groq) backend running at http://localhost:${PORT}`);
});
