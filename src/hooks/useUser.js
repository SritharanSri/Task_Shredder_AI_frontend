import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const FALLBACK_USER_ID = 'local_user_123'; 

export function useUser() {
  const [user, setUser] = useState({
    credits: 10,
    streak: 0,
    todaySessions: 0,
    totalCompleted: 0,
    history: []
  });
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || FALLBACK_USER_ID;
  };

  useEffect(() => {
    fetch(`${API_BASE}/user/${getUserId()}`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load user:", err);
        // Leave the default 'user' state intact
        setLoading(false);
      });
  }, []);

  const recordSession = async (taskTitle) => {
    try {
      const res = await fetch(`${API_BASE}/user/${getUserId()}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle })
      });
      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const updateCredits = async (amount) => {
    try {
      // Optimistic
      setUser(u => ({ ...u, credits: Math.max(0, u.credits + amount) }));
      await fetch(`${API_BASE}/user/${getUserId()}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const clearHistory = async () => {
    try {
      setUser(u => ({ ...u, history: [] }));
      await fetch(`${API_BASE}/user/${getUserId()}/history`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  return { user, loading, recordSession, updateCredits, clearHistory };
}
