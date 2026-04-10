// Groq Cloud AI Service
// All generative logic runs on the backend proxy for security.

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const API_URL = `${BASE}/break-task`;
const STREAM_API_URL = `${BASE}/break-task-stream`;

// Client-side cache: same input/mode -> instant response.
const CACHE_PREFIX = 'ai_v3_';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
}

function cacheKey(task, mode = 'focus') {
  return CACHE_PREFIX + hashStr(`${task.toLowerCase().trim()}|${mode}`);
}

export function getCachedBreakdown(task, mode = 'focus') {
  try {
    const raw = localStorage.getItem(cacheKey(task, mode));
    if (!raw) return null;
    const { steps, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(task, mode));
      return null;
    }
    return steps;
  } catch {
    return null;
  }
}

export function cacheBreakdown(task, steps, mode = 'focus') {
  try {
    localStorage.setItem(cacheKey(task, mode), JSON.stringify({ steps, ts: Date.now() }));
  } catch {
    // Ignore quota errors.
  }
}

export async function streamBreakdown(task, userId = null, mode = 'focus', onStep, signal = null) {
  const response = await fetch(STREAM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, userId, mode }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err?.message || err?.error || `HTTP ${response.status}`);
    error.code = err?.error;
    error.upgradeRequired = err?.upgradeRequired || false;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      if (!payload) continue;

      try {
        const step = JSON.parse(payload);
        if (step.error) throw new Error(step.error);
        if (step.title) onStep(step);
      } catch (e) {
        if (e.message && !e.message.startsWith('Unexpected')) throw e;
      }
    }
  }
}

export async function breakdownWithAI(task, userId = null, mode = 'focus', signal = null) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, userId, mode }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err?.message || err?.error || `HTTP ${response.status}`);
    error.code = err?.error;
    error.upgradeRequired = err?.upgradeRequired || false;
    throw error;
  }

  return response.json();
}

export function mockBreakdown(task) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const steps = [
        { title: `🔍 Define a clear success target for: "${task}"`, time: '10 min', difficulty: 'Easy 🟢', motivation: '' },
        { title: '🗂 Break work into tiny checkpoints', time: '10 min', difficulty: 'Easy 🟢', motivation: '' },
        { title: '⚡ Execute the first checkpoint now', time: '25 min', difficulty: 'Medium 🟡', motivation: '' },
        { title: '🔁 Review and tighten weak spots', time: '15 min', difficulty: 'Medium 🟡', motivation: '' },
        { title: '✅ Package output and ship', time: '10 min', difficulty: 'Easy 🟢', motivation: '' },
      ].map((s, i) => ({ id: Date.now() + i, ...s, completed: false }));
      resolve(steps);
    }, 1200);
  });
}
