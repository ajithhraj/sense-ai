// background.js — Sense AI
// Listens for analysis results and updates the badge

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "setBadge") {
    chrome.action.setBadgeText({ text: msg.text });
    chrome.action.setBadgeBackgroundColor({ color: msg.color });
  }
  if (msg.action === "clearBadge") {
    chrome.action.setBadgeText({ text: "" });
  }
});
