// Groq Cloud AI Service
// All generative logic runs on the Backend proxy for security 🔒

const API_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/break-task`
  : 'http://localhost:3000/api/break-task';

/**
 * @param {string} task - The task to break down
 * @param {string|null} userId - Telegram user ID (enables server-side daily limit enforcement)
 * @param {AbortSignal|null} signal - Optional AbortSignal for request cancellation
 */
export async function breakdownWithAI(task, userId = null, signal = null) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, userId }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Surface structured errors from backend
    const error = new Error(err?.message || err?.error || `HTTP ${response.status}`);
    error.code = err?.error;
    error.upgradeRequired = err?.upgradeRequired || false;
    throw error;
  }

  return response.json();
}

// ── Fallback mock (used when no API key) ──
export function mockBreakdown(task) {
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
