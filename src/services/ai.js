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
        { title: `🔍 Research & define exact success criteria for: "${task}"`, time: '15 min', difficulty: 'Easy 🟢', motivation: 'Clarity now saves 10x the time later.' },
        { title: '📐 Outline structure, scope and assign time blocks', time: '10 min', difficulty: 'Easy 🟢', motivation: 'A plan you build is a plan you follow.' },
        { title: '⚡ Execute the first and hardest phase without distractions', time: '25 min', difficulty: 'Hard 🔴', motivation: 'The first strike is 80% of the battle.' },
        { title: '🔁 Review your output and iterate on the weak spots', time: '20 min', difficulty: 'Medium 🟡', motivation: 'Perfection is the enemy — progress wins.' },
        { title: '✅ Finalize, polish and prepare for delivery', time: '15 min', difficulty: 'Easy 🟢', motivation: 'Ship it. Done beats perfect every time.' },
      ].map((s, i) => ({ id: Date.now() + i, ...s, completed: false }));
      resolve(steps);
    }, 1500);
  });
}
