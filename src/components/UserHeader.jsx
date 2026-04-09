export default function UserHeader({ user, credits }) {
  if (!user) return null;

  const initial = user.firstName?.[0]?.toUpperCase() || '?';
  const displayName = user.firstName;

  return (
    <header className="flex items-center justify-between mb-8">
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName}
              className="rounded-full object-cover shadow-lg border-2 border-purple-500/30"
              style={{ width: 44, height: 44 }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20"
              style={{
                width: 44, height: 44,
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                color: 'white',
              }}
            >
              {initial}
            </div>
          )}
          {user.isPremium && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-[8px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#050510] shadow-lg">
              ⭐
            </div>
          )}
        </div>
        <div>
          <div className="text-[15px] font-bold text-slate-100 leading-tight">
            {displayName}
          </div>
          <div className="text-[11px] font-medium text-slate-500">
            {user.username ? `@${user.username}` : 'Pro Member'}
          </div>
        </div>
      </div>

      {/* Right: Credits / Actions */}
      <div className="flex flex-col items-end gap-1.5">
         <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-sm font-black gradient-text tracking-tight">SHREDDER AI</span>
         </div>
         <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">⚡ {credits} Credits</span>
         </div>
      </div>
    </header>
  );
}
