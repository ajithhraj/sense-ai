// popup.js — Sense AI v4.4

const analyzeBtn = document.getElementById("analyze-btn");
const statusEl   = document.getElementById("status");
const resultCard = document.getElementById("result-card");
const errorMsg   = document.getElementById("error-msg");
const statusDot  = document.getElementById("status-dot");

function setStatus(html) { statusEl.innerHTML = html; }

function showResult(data) {
  errorMsg.style.display = "none";

  if (data.error) {
    errorMsg.textContent = data.error;
    errorMsg.style.display = "block";
    setStatus("");
    statusDot.className = "status-dot";
    return;
  }

  resultCard.style.display = "block";
  statusDot.className = "status-dot done";
  setStatus("Analysis complete.");

  // Verdict
  const verdictEl = document.getElementById("verdict-text");
  verdictEl.textContent = data.verdict;
  verdictEl.style.color = data.color;

  document.getElementById("verdict-score").textContent =
    `Score ${data.avgScore > 0 ? "+" : ""}${data.avgScore}  ·  ${data.total} comments`;

  // Grade
  const gradeEl = document.getElementById("grade-circle");
  gradeEl.textContent = data.grade;
  gradeEl.style.color = data.color;
  gradeEl.style.borderColor = data.color;
  gradeEl.style.boxShadow = `0 0 16px ${data.color}30`;

  // Bars
  document.getElementById("pos-bar").style.width = `${data.posPct}%`;
  document.getElementById("neg-bar").style.width = `${data.negPct}%`;
  document.getElementById("neu-bar").style.width = `${data.neuPct}%`;
  document.getElementById("pos-pct").textContent = `${data.posPct}%`;
  document.getElementById("neg-pct").textContent = `${data.negPct}%`;
  document.getElementById("neu-pct").textContent = `${data.neuPct}%`;

  // Insight
  const insightEl = document.getElementById("insight-section");
  if (data.keyInsight) {
    insightEl.textContent = `"${data.keyInsight}"`;
    insightEl.style.display = "block";
  } else {
    insightEl.style.display = "none";
  }

  // Count
  document.getElementById("count-row").textContent =
    `${data.pos} positive  ·  ${data.neg} negative  ·  ${data.neu} neutral`;
}

async function checkForAutoResult() {
  const result = await chrome.storage.local.get(["senseResult", "senseStatus"]);
  if (result.senseStatus === "analyzing") {
    statusDot.className = "status-dot analyzing";
    setStatus("Auto-analyzing...");
    setTimeout(checkForAutoResult, 1000);
    return;
  }
  if (result.senseResult) {
    showResult(result.senseResult);
    document.getElementById("auto-tag").textContent = "Auto-analyzed";
  }
}

checkForAutoResult();

analyzeBtn.addEventListener("click", async () => {
  analyzeBtn.disabled = true;
  resultCard.style.display = "none";
  errorMsg.style.display = "none";
  statusDot.className = "status-dot analyzing";
  setStatus('<div class="dot-pulse"><span></span><span></span><span></span></div>');
  document.getElementById("auto-tag").textContent = "";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("youtube.com")) {
    setStatus("");
    errorMsg.textContent = "Please open a YouTube video first.";
    errorMsg.style.display = "block";
    statusDot.className = "status-dot";
    analyzeBtn.disabled = false;
    return;
  }

  await chrome.storage.local.remove(["senseResult", "senseStatus"]);
  chrome.tabs.sendMessage(tab.id, { action: "analyze" });

  let attempts = 0;
  const poll = setInterval(async () => {
    attempts++;
    const result = await chrome.storage.local.get("senseResult");
    if (result.senseResult) {
      clearInterval(poll);
      showResult(result.senseResult);
      await chrome.storage.local.remove("senseResult");
      analyzeBtn.disabled = false;
    }
    if (attempts > 30) {
      clearInterval(poll);
      setStatus("Timed out. Please try again.");
      statusDot.className = "status-dot";
      analyzeBtn.disabled = false;
    }
  }, 300);
});
