// index.js — Akinator proxy with retries + timeouts
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// root check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Akinator Proxy Running Successfully!",
    endpoints: {
      start: "/start?region=en&type=character",
      answer: "/answer?session=...&signature=...&step=...&answer=...",
      guess: "/guess?session=...&signature=...&step=..."
    }
  });
});

// start new session (tries multiple mirrors, short timeout)
app.get("/start", async (req, res) => {
  try {
    // region and type params (not all mirrors use them — kept for forward compat)
    const region = req.query.region || "en";
    const type = req.query.type || "character";

    // list of Akinator endpoints (mirrors). We try each until one works.
    const tryUrls = [
      // public Akinator endpoints used by many libs — we try a few variants
      "https://srv12.akinator.com:443/ws/new_session?partner=1&player=website-desktop",
      "https://srv13.akinator.com:443/ws/new_session?partner=1&player=website-desktop",
      "https://en.akinator.com/ws/new_session?partner=1&player=website-desktop"
    ];

    let successful = null;
    for (const url of tryUrls) {
      try {
        const r = await axios.get(url, { timeout: 10000 }); // 10s timeout
        if (r && r.data) {
          // basic sanity: check for expected fields
          if (typeof r.data === "object" && Object.keys(r.data).length) {
            successful = { url, data: r.data };
            break;
          }
        }
      } catch (e) {
        console.log(`Mirror failed: ${url} -> ${e.message}`);
      }
    }

    if (!successful) {
      return res.status(500).json({
        error: "All Akinator servers failed",
        details:
          "Tried multiple mirrors with short timeout. Either network blocks outgoing requests, or Akinator mirrors are unreachable."
      });
    }

    // return the raw data from mirror (caller can parse)
    return res.json({
      status: "ok",
      message: "Akinator session started successfully!",
      mirror: successful.url,
      payload: successful.data
    });
  } catch (err) {
    console.error("Start Error:", err);
    res.status(500).json({
      error: "Failed to start Akinator session",
      details: err.message || err
    });
  }
});

app.listen(PORT, () => {
  console.log("🧞 Akinator Proxy running on port", PORT);
});
