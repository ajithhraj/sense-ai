// content.js — Sense AI v4.5
// Auto-scrolls to load more comments before analyzing

const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

let isAnalyzing = false;
let lastAnalyzedUrl = "";
let commentWatcher = null;

// ── Auto-scroll to load comments ──────────────────────────────────────────

function scrollToLoadComments() {
  return new Promise((resolve) => {
    let scrolls = 0;
    const maxScrolls = 8;

    const doScroll = () => {
      // Scroll the main page down to trigger comment loading
      window.scrollBy({ top: 600, behavior: "smooth" });
      scrolls++;

      const count = document.querySelectorAll("ytd-comment-renderer #content-text").length;

      if (count >= 50 || scrolls >= maxScrolls) {
        resolve();
      } else {
        setTimeout(doScroll, 800);
      }
    };

    doScroll();
  });
}

// ── Scraper ───────────────────────────────────────────────────────────────

function scrapeComments() {
  const selectors = [
    "ytd-comment-renderer #content-text",
    "yt-attributed-string",
    "#content-text span",
  ];
  const texts = new Set();
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach(el => {
      const t = el.innerText?.trim();
      if (t && t.length > 4 && t.length < 150) texts.add(t);
    });
  }
  return [...texts].slice(0, 50);
}

// ── Groq ──────────────────────────────────────────────────────────────────

async function analyzeWithGroq(comments) {
  const clean = comments.map((c, i) => {
    const sanitized = c
      .replace(/["""''`]/g, "")
      .replace(/[\r\n]+/g, " ")
      .replace(/[^\x20-\x7E]/g, "")
      .trim()
      .slice(0, 80);
    return `${i + 1}. ${sanitized}`;
  }).join("\n");

  const systemPrompt = `You are a sentiment analysis API. You only respond with valid JSON. Never add explanation or markdown.`;

  const userPrompt = `Analyze these YouTube comments and return JSON.

Required JSON structure:
{
  "results": [{"index": 1, "label": "POSITIVE", "score": 0.8, "emotion": "joy"}],
  "summary": {
    "positive": 10, "negative": 5, "neutral": 15,
    "avg_score": 0.25,
    "verdict": "Mostly Positive",
    "key_insight": "Viewers love the content quality."
  }
}

Rules:
- label: POSITIVE, NEGATIVE, or NEUTRAL
- score: 1.0 to -1.0
- verdict: Highly Positive / Mostly Positive / Mixed Sentiment / Mostly Negative / Highly Negative
- W=positive, L=negative, mid=negative, no cap=honest, ratio=negative
- skull emoji or "dead" = funny = positive

Comments:
${clean}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content.trim());
}

// ── Build Result ──────────────────────────────────────────────────────────

function buildResult(comments, groqData) {
  const { summary, results } = groqData;
  const total = comments.length;
  const avg = summary.avg_score;

  let color, grade;
  if (avg >= 0.3)        { color = "#30d158"; grade = "A"; }
  else if (avg >= 0.1)   { color = "#30d158"; grade = "B"; }
  else if (avg <= -0.3)  { color = "#ff453a"; grade = "D"; }
  else if (avg <= -0.1)  { color = "#ff9f0a"; grade = "C"; }
  else                   { color = "#98989d"; grade = "C"; }

  return {
    total,
    pos: summary.positive, neg: summary.negative, neu: summary.neutral,
    posPct: Math.round(summary.positive / total * 100),
    negPct: Math.round(summary.negative / total * 100),
    neuPct: Math.round(summary.neutral / total * 100),
    avgScore: avg.toFixed(3),
    verdict: summary.verdict,
    keyInsight: summary.key_insight,
    color, grade,
  };
}

// ── Analysis Runner ───────────────────────────────────────────────────────

async function runAnalysis(source = "manual") {
  if (isAnalyzing) return;
  isAnalyzing = true;
  chrome.storage.local.set({ senseStatus: "analyzing" });

  try {
    // Scroll to load comments first
    await scrollToLoadComments();

    // Wait a bit for DOM to settle
    await new Promise(r => setTimeout(r, 500));

    const comments = scrapeComments();

    if (comments.length === 0) {
      chrome.storage.local.set({
        senseResult: { error: "No comments found. Make sure you're on a YouTube video page." },
        senseStatus: "error"
      });
      return;
    }

    const groqData = await analyzeWithGroq(comments);
    const result = buildResult(comments, groqData);
    result.autoAnalyzed = (source === "auto");
    chrome.storage.local.set({ senseResult: result, senseStatus: "done" });

    // Set badge on extension icon using result color
    const score = parseFloat(result.avgScore);
    const badgeText = score >= 0.1 ? "POS" : score <= -0.1 ? "NEG" : "MID";
    const badgeColor = result.color;
    chrome.runtime.sendMessage({ action: "setBadge", text: badgeText, color: badgeColor });

  } catch (err) {
    chrome.storage.local.set({
      senseResult: { error: err.message },
      senseStatus: "error"
    });
  } finally {
    isAnalyzing = false;
  }
}

// ── Auto-analyze: watch for page + comments ───────────────────────────────

function startCommentWatcher() {
  if (commentWatcher) { commentWatcher.disconnect(); commentWatcher = null; }

  let triggered = false;

  commentWatcher = new MutationObserver(() => {
    if (triggered || isAnalyzing) return;
    // Wait for at least 3 comments to appear, then we'll scroll-load the rest
    const count = document.querySelectorAll("ytd-comment-renderer #content-text").length;
    if (count >= 3) {
      triggered = true;
      commentWatcher.disconnect();
      commentWatcher = null;
      setTimeout(() => runAnalysis("auto"), 1000);
    }
  });

  commentWatcher.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    if (commentWatcher) { commentWatcher.disconnect(); commentWatcher = null; }
  }, 30000);
}

function onPageChange(url) {
  if (!url.includes("/watch")) return;
  if (url === lastAnalyzedUrl) return;
  lastAnalyzedUrl = url;
  isAnalyzing = false;
  chrome.storage.local.remove(["senseResult", "senseStatus"]);
  chrome.runtime.sendMessage({ action: "clearBadge" });
  startCommentWatcher();
}

let currentUrl = location.href;
new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    onPageChange(currentUrl);
  }
}).observe(document.body, { childList: true, subtree: true });

onPageChange(location.href);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "analyze") runAnalysis("manual");
});
