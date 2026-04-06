// Google Gemini API service
// All generative logic has been moved to the Backend proxy for security! 🔒

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/breakdown';

export async function breakdownWithGemini(task) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error || `HTTP ${response.status}`);
    }

    const steps = await response.json();
    return steps;
  } catch (err) {
    console.warn('Backend proxy failed, using mock fallback:', err.message);
    return mockBreakdown(task);
  }
}

// ── Fallback mock (used when no API key) ──
function mockBreakdown(task) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const steps = [
        `Research and gather all materials needed for: "${task}"`,
        'Outline the structure, define scope and key milestones',
        'Execute the first major phase of implementation',
        'Review, test, and iterate based on initial results',
        'Polish, finalize and prepare everything for delivery',
      ].map((title, i) => ({ id: Date.now() + i, title, completed: false }));
      resolve(steps);
    }, 1500);
  });
}
