// Falls back to localhost for local development; uses the deployed
// backend by default so the extension works without running the
// backend locally. Previously this was hardcoded to localhost only,
// meaning the extension silently failed for anyone but the developer
// running the backend on their own machine.
const API_BASE = "https://truthshield-ai-fake-content-detection.onrender.com/api";
// const API_BASE = "http://localhost:8082/api"; // uncomment for local dev

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('analyzeBtn').addEventListener('click', analyze);
});

async function analyze() {
  const text = document.getElementById('inputText').value;
  const result = document.getElementById('result');

  if (!text.trim()) {
    result.style.display = 'block';
    result.className = 'error';
    result.innerHTML = '⚠️ Text enter pannunga!';
    return;
  }

  result.style.display = 'block';
  result.className = '';
  result.innerHTML = '🔍 Analyzing...';

  try {
    // NOTE: /api/detect now requires a valid JWT (Authorization: Bearer <token>).
    // This extension doesn't have a login flow yet, so it will get a 401
    // until one is added — a known follow-up, not silently broken.
    const response = await fetch(API_BASE + '/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });

    const data = await response.json();

    if (data.status === 'FAKE') {
      result.className = 'fake';
      result.innerHTML = `
        ⚠️ <strong>FAKE DETECTED!</strong><br>
        Category: ${data.category}<br>
        Score: ${data.score}%
      `;
    } else {
      result.className = 'real';
      result.innerHTML = '✅ <strong>GENUINE CONTENT!</strong>';
    }
  } catch (e) {
    result.className = 'error';
    result.innerHTML = '❌ Server not running!<br><small>Backend start pannunga</small>';
  }
}