import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const FALLBACK_USER_ID = 'local_dev_user';

export function useUser() {
  const [user, setUser] = useState({
    credits: 10,
    streak: 0,
    lastStreak: 0,
    todaySessions: 0,
    totalCompleted: 0,
    history: [],
    isPremium: false,
    premiumExpiry: null,
    dailyBreakdownsLeft: 3,
    freeLimit: 3,
  });
  const [loading, setLoading] = useState(true);

  const getUserId = useCallback(() =>
    String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || FALLBACK_USER_ID),
  []);

  // Returns initData header for authenticated requests
  const authHeaders = () => {
    const initData = window.Telegram?.WebApp?.initData || '';
    return initData ? { 'Content-Type': 'application/json', 'x-telegram-init-data': initData }
      : { 'Content-Type': 'application/json' };
  };

  const refreshUser = useCallback(async () => {
    const res = await fetch(`${API_BASE}/user/${getUserId()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && !data.error) setUser(data);
    return data;
  }, [getUserId]);

  useEffect(() => {
    fetch(`${API_BASE}/user/${getUserId()}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => { if (data && !data.error) setUser(data); })
      .catch(err => console.error('Failed to load user:', err))
      .finally(() => setLoading(false));
  }, [getUserId]);

  const recordSession = useCallback(async (taskTitle) => {
    try {
      const res = await fetch(`${API_BASE}/user/${getUserId()}/session`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ taskTitle }),
      });
      const updatedUser = await res.json();
      if (!updatedUser.error) setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  }, [getUserId]);

  const updateCredits = useCallback(async (amount) => {
    // Optimistic update
    const prevUser = user;
    setUser(u => ({ ...u, credits: Math.max(0, u.credits + amount) }));
    try {
      const res = await fetch(`${API_BASE}/user/${getUserId()}/credits`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Sync actual server value
      setUser(u => ({ ...u, credits: data.credits }));
    } catch (err) {
      // Rollback on failure
      setUser(prevUser);
      console.error('Credits update failed:', err);
    }
  }, [getUserId, user]);

  const clearHistory = useCallback(async () => {
    setUser(u => ({ ...u, history: [] }));
    try {
      await fetch(`${API_BASE}/user/${getUserId()}/history`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch (err) {
      console.error(err);
    }
  }, [getUserId]);

  const restoreStreak = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/user/${getUserId()}/streak-restore`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUser(data);
      return true;
    } catch (err) {
      console.error('Streak restore failed:', err);
      throw err;
    }
  }, [getUserId]);

  // Decrement local daily breakdown counter after successful AI call
  const decrementDailyBreakdowns = useCallback(() => {
    setUser(u => ({
      ...u,
      dailyBreakdownsLeft: u.isPremium ? -1 : Math.max(0, (u.dailyBreakdownsLeft || 0) - 1),
    }));
  }, []);

  return { user, loading, getUserId, refreshUser, recordSession, updateCredits, clearHistory, restoreStreak, decrementDailyBreakdowns };
}
