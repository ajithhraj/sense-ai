# 🎯 Reel Sense — Instagram Comment Sentiment Analyzer

A Chrome Extension that analyzes the sentiment of Instagram Reel comments in **real time** — right in your browser, with zero setup and no backend server.

---

## ✨ Features

- 🔍 **Scrapes comments** directly from any Instagram Reel
- 🧠 **Custom NLP engine** — runs 100% in the browser (no API, no server)
- 😊😠😐 **3-label sentiment** — Positive, Negative, Neutral
- 📊 **Live overlay** on the page with sentiment bars
- 🎯 **Popup dashboard** with top positive/negative comments
- ⚡ **Instant** — analyzes 100 comments in under 1 second
- 🔒 **Privacy-first** — no data ever leaves your browser

---

## 🖥️ Screenshots

> Overlay shown on Instagram Reel:
> - 🔥 "Loving it!" — audience is hyped
> - 📊 67% Positive | 8% Negative | 25% Neutral

---

## 🚀 Installation (Chrome)

1. Download or clone this repo
2. Open Chrome → go to `chrome://extensions/`
3. Enable **"Developer mode"** (top right toggle)
4. Click **"Load unpacked"**
5. Select the `reel-sense` folder
6. The 🎯 icon appears in your toolbar!

---

## 📖 How to Use

1. Go to **[instagram.com](https://instagram.com)**
2. Open any **Reel**
3. Scroll down to load some comments
4. Click the 🎯 **Reel Sense** icon in Chrome toolbar
5. Click **"⚡ Analyze This Reel"**
6. See the sentiment breakdown instantly!

---

## 📁 Project Structure

```
reel-sense/
├── manifest.json       # Chrome extension config
├── content.js          # Comment scraper + NLP engine
├── overlay.css         # Live overlay styles
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── icons/              # Extension icons
└── README.md
```

---

## 🧠 How the NLP Works

Built **from scratch in JavaScript** — no external ML libraries:

1. **Social media lexicon** — vocabulary tuned for Instagram/TikTok slang, emojis, Gen Z language
2. **Emoji detection** — ❤️🔥👏 boost positive; 😡👎🤮 boost negative
3. **Negation handling** — "not bad", "never boring" handled correctly
4. **Intensifier boosting** — "literally amazing", "so fire" amplified
5. **Compound scoring** — normalized to [-1.0, +1.0]

---

## 🔮 Future Plans

- [ ] TikTok comment support
- [ ] YouTube Shorts support
- [ ] Upgrade to Transformers.js (BERT model in browser)
- [ ] Emotion detection (joy, anger, surprise, sadness)
- [ ] Export report as PDF

---

## 👤 Author

**Ajith Raj** — [@ajithhraj](https://github.com/ajithhraj)

Built as part of preparation for **Google Summer of Code 2026**.

---

## 📄 License

MIT License
