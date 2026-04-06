import { useEffect, useState } from 'react';

export function useTelegram() {
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();
      try {
        telegram.setHeaderColor('#0a0a1a');
        telegram.setBackgroundColor('#0a0a1a');
      } catch (_) {}
      setTg(telegram);
      const u = telegram.initDataUnsafe?.user;
      if (u) {
        setUser({
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name || '',
          username: u.username || '',
          photoUrl: u.photo_url || null,
          isPremium: u.is_premium || false,
        });
      }
    } else {
      // Dev fallback
      setUser({
        id: 0,
        firstName: 'Developer',
        lastName: '',
        username: 'dev',
        photoUrl: null,
        isPremium: false,
      });
    }
  }, []);

  const haptic = (type = 'light') => {
    tg?.HapticFeedback?.impactOccurred(type);
  };

  const closeApp = () => tg?.close();
  const openLink = (url) => tg?.openLink(url);

  return { user, tg, haptic, closeApp, openLink, isInTelegram: !!window.Telegram?.WebApp };
}
