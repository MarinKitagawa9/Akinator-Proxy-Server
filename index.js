const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🧞 Akinator Proxy Running Successfully!",
    endpoints: {
      start: "/start?region=en&type=character",
      answer: "/answer?session=...&signature=...&step=...&answer=...",
      guess: "/guess?session=...&signature=...&step=..."
    }
  });
});

app.get("/start", async (req, res) => {
  try {
    const region = req.query.region || "en";
    const type = req.query.type || "character";
    const response = await axios.get(`https://srv12.akinator.com/ws/new_session?partner=1&player=website-desktop&constraint=ETAT<>'AV'&soft_constraint=ETAT<>'AV'&question_filter=${type}&lang=${region}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to start Akinator session", details: error.message });
  }
});

app.listen(PORT, () => console.log(`🧞 Akinator Proxy running on port ${PORT}`));