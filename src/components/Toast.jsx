import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2800);
    return () => clearTimeout(t);
  }, []);

  const icons = {
    success: '🎉',
    info: '💡',
    warning: '⚠️',
    error: '❌',
  };

  const colors = {
    success: 'rgba(16, 185, 129, 0.15)',
    info: 'rgba(139, 92, 246, 0.15)',
    warning: 'rgba(251, 146, 60, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
  };

  const borders = {
    success: 'rgba(16, 185, 129, 0.3)',
    info: 'rgba(139, 92, 246, 0.3)',
    warning: 'rgba(251, 146, 60, 0.3)',
    error: 'rgba(239, 68, 68, 0.3)',
  };

  return (
    <div
      className="toast fixed top-4 left-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        transform: visible ? 'translateX(-50%)' : 'translateX(-50%) translateY(-120%)',
        maxWidth: 340,
        width: 'calc(100% - 32px)',
        backdropFilter: 'blur(16px)',
        background: colors[type],
        border: `1px solid ${borders[type]}`,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <span style={{ fontSize: 18 }}>{icons[type]}</span>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{message}</span>
    </div>
  );
}
