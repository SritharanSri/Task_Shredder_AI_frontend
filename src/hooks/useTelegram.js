import { useEffect, useState, useCallback } from 'react';

export function useTelegram() {
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();
      try {
        telegram.setHeaderColor('#050510');
        telegram.setBackgroundColor('#050510');
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
      setUser({ id: 0, firstName: 'Developer', lastName: '', username: 'dev', photoUrl: null, isPremium: false });
    }
  }, []);

  const haptic = useCallback((type = 'light') => {
    tg?.HapticFeedback?.impactOccurred(type);
  }, [tg]);

  const syncThemeColor = useCallback((isDark) => {
    if (!tg) return;
    const color = isDark ? '#050510' : '#f8fafc';
    try {
      tg.setHeaderColor(color);
      tg.setBackgroundColor(color);
    } catch (_) {}
  }, [tg]);

  // Show native back button and call handler when pressed
  const showBackButton = useCallback((onBack) => {
    if (!tg?.BackButton) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onBack);
    return () => { tg.BackButton.hide(); tg.BackButton.offClick(onBack); };
  }, [tg]);

  const hideBackButton = useCallback(() => { tg?.BackButton?.hide(); }, [tg]);

  const enableClosingConfirmation = useCallback(() => {
    try { tg?.enableClosingConfirmation?.(); } catch (_) {}
  }, [tg]);

  const disableClosingConfirmation = useCallback(() => {
    try { tg?.disableClosingConfirmation?.(); } catch (_) {}
  }, [tg]);

  const closeApp = useCallback(() => tg?.close(), [tg]);
  const openLink = useCallback((url) => {
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  }, [tg]);

  return {
    user, tg,
    haptic, syncThemeColor,
    showBackButton, hideBackButton,
    enableClosingConfirmation, disableClosingConfirmation,
    closeApp, openLink,
    isInTelegram: !!window.Telegram?.WebApp,
  };
}
