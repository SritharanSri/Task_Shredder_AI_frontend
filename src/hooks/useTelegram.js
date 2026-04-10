import { useEffect, useState, useCallback } from 'react';

// Returns true if the running Telegram client version meets the minimum requirement.
// Telegram versions are strings like "6.0", "7.2" etc.
function meetsVersion(tg, required) {
  if (!tg?.version) return false;
  const [maj, min = 0] = tg.version.split('.').map(Number);
  const [rMaj, rMin = 0] = required.split('.').map(Number);
  return maj > rMaj || (maj === rMaj && min >= rMin);
}

export function useTelegram() {
  const [user, setUser] = useState(null);
  const [tg, setTg] = useState(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();
      // setHeaderColor / setBackgroundColor require Bot API 6.1+
      if (meetsVersion(telegram, '6.1')) {
        try { telegram.setHeaderColor('#050510'); } catch (_) {}
        try { telegram.setBackgroundColor('#050510'); } catch (_) {}
      }
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
    // HapticFeedback requires Bot API 6.1+
    if (meetsVersion(tg, '6.1')) tg?.HapticFeedback?.impactOccurred(type);
  }, [tg]);

  const syncThemeColor = useCallback((isDark) => {
    if (!tg || !meetsVersion(tg, '6.1')) return;
    const color = isDark ? '#050510' : '#f8fafc';
    try { tg.setHeaderColor(color); } catch (_) {}
    try { tg.setBackgroundColor(color); } catch (_) {}
  }, [tg]);

  // BackButton requires Bot API 6.1+
  const showBackButton = useCallback((onBack) => {
    if (!tg?.BackButton || !meetsVersion(tg, '6.1')) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onBack);
    return () => { tg.BackButton.hide(); tg.BackButton.offClick(onBack); };
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (meetsVersion(tg, '6.1')) tg?.BackButton?.hide();
  }, [tg]);

  // enableClosingConfirmation requires Bot API 6.2+
  const enableClosingConfirmation = useCallback(() => {
    if (meetsVersion(tg, '6.2')) {
      try { tg?.enableClosingConfirmation?.(); } catch (_) {}
    }
  }, [tg]);

  const disableClosingConfirmation = useCallback(() => {
    if (meetsVersion(tg, '6.2')) {
      try { tg?.disableClosingConfirmation?.(); } catch (_) {}
    }
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
