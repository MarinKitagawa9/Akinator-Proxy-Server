const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// 💖 Root endpoint (health check)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "✨ Akinator Proxy Server is alive & smiling 😸",
    endpoints: {
      start: "/start?region=en&type=character",
      answer: "/answer?session=...&signature=...&step=...&answer=...",
      guess: "/guess?session=...&signature=...&step=..."
    },
    author: "🧞 Rajib's Magical Proxy 💫"
  });
});

// 🎮 Start a new Akinator session
app.get("/start", async (req, res) => {
  try {
    const region = req.query.region || "en";
    const type = req.query.type || "character";

    // 🧞‍♂️ USA + fallback mirrors
    const tryUrls = [
      "https://api-usa.akinator.com/ws/new_session?partner=1&player=website-desktop",
      "https://srv2.akinator.com/ws/new_session?partner=1&player=website-desktop",
      "https://srv3.akinator.com/ws/new_session?partner=1&player=website-desktop",
      "https://en.akinator.com/ws/new_session?partner=1&player=website-desktop"
    ];

    let success = null;
    for (const url of tryUrls) {
      console.log(`🌐 Trying mirror: ${url}`);
      try {
        const r = await axios.get(url, { timeout: 8000 });
        if (r.data && typeof r.data === "object") {
          success = { url, data: r.data };
          break;
        }
      } catch (e) {
        console.log(`❌ Failed: ${url} → ${e.message}`);
      }
    }

    // ❌ If no mirror succeeded
    if (!success) {
      return res.status(500).json({
        error: "All Akinator mirrors failed 😿",
        details:
          "We tried all known mirrors (USA, EU). Akinator might be down or blocked from this region.",
        tip: "Try again in a few minutes or host on Replit for open network 🌍"
      });
    }

    // ✅ Success!
    return res.json({
      status: "ok",
      message: "🎉 Akinator session started successfully!",
      mirror: success.url,
      payload: success.data,
      cute_note: "Have fun guessing! 💫✨"
    });
  } catch (err) {
    console.error("🚨 Start Error:", err.message);
    res.status(500).json({
      error: "Failed to start Akinator session 💔",
      details: err.message
    });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🧞 Akinator Proxy running happily on port ${PORT}`);
});
