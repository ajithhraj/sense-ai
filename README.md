# Sense AI — YouTube Sentiment Analyzer

A Chrome extension that uses **LLaMA 3.1** via **Groq API** to analyze the sentiment of YouTube comments in real time.

## Features

- **AI-powered sentiment analysis** — not just keyword matching, uses LLaMA 3.1 to understand context, sarcasm, and slang
- **Auto-analyzes on page load** — opens any YouTube video and starts analyzing automatically
- **Badge on icon** — shows POS / NEG / MID on the extension icon so you know the vibe without clicking
- **Understands YouTube slang** — W, L, ratio, mid, no cap, based, and more
- **Clean minimal UI** — dark theme, Inter font, no clutter

## How It Works

1. Open any YouTube video
2. The extension auto-scrolls to load comments
3. Sends up to 50 comments to Groq API (LLaMA 3.1)
4. Displays sentiment verdict, score, and breakdown
5. Badge on icon updates automatically

## Screenshots

> Coming soon

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/ajithhraj/sense-ai.git
cd sense-ai
```

### 2. Add your Groq API key
- Get a free key at [console.groq.com](https://console.groq.com)
- Open `content.js` and replace line 4:
```js
const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
```

### 3. Load in Chrome
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `sense-ai` folder

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Extension | Chrome Manifest V3 |
| AI Model | LLaMA 3.1 8B Instant |
| API | Groq (free tier) |
| Frontend | Vanilla JS, HTML, CSS |
| Font | Inter (Google Fonts) |

## Sentiment Labels

| Verdict | Score Range |
|---------|------------|
| Highly Positive | > 0.3 |
| Mostly Positive | 0.1 – 0.3 |
| Mixed Sentiment | -0.1 – 0.1 |
| Mostly Negative | -0.3 – -0.1 |
| Highly Negative | < -0.3 |

## Project Structure

```
sense-ai/
├── manifest.json       # Chrome extension config
├── content.js          # Comment scraper + Groq API call
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── background.js       # Badge updates
├── icons/              # Extension icons
└── README.md
```

## Author

**Ajith Raj** — [github.com/ajithhraj](https://github.com/ajithhraj)

## License

MIT
