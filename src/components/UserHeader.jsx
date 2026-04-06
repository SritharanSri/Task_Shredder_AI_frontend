export default function UserHeader({ user, credits }) {
  if (!user) return null;

  const initial = user.firstName?.[0]?.toUpperCase() || '?';
  const displayName = user.isPremium
    ? `${user.firstName} ⭐`
    : user.firstName;

  return (
    <div className="flex items-center justify-between" style={{ paddingTop: 20, paddingBottom: 4 }}>
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-3">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="rounded-full object-cover"
            style={{ width: 38, height: 38, border: '2px solid rgba(139,92,246,0.4)' }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              color: 'white',
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {user.username ? `@${user.username}` : 'FocusFlow user'}
          </div>
        </div>
      </div>

      {/* Right: Title + Credits */}
      <div className="flex flex-col items-end gap-1">
        <h1 className="text-lg font-black tracking-tight gradient-text" style={{ lineHeight: 1 }}>
          FocusFlow AI
        </h1>
        <div
          className="flex items-center gap-1 badge badge-cyan"
          style={{ fontSize: 11 }}
        >
          <span>⚡</span>
          <span>{credits} credits</span>
        </div>
      </div>
    </div>
  );
}
