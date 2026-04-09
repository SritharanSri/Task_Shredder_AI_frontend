export default function StatsBar({ streak, credits, completed, todaySessions }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-6">
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 flex items-center gap-4 group shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">🔥</div>
        <div>
          <div className="text-xl font-black text-orange-400 leading-tight">{streak} Days</div>
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Current Streak</div>
        </div>
      </div>
      
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 flex items-center gap-4 group shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">✅</div>
        <div>
          <div className="text-xl font-black text-green-400 leading-tight">{completed}</div>
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Total Shredded</div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 flex items-center gap-4 group shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">⏲️</div>
        <div>
          <div className="text-xl font-black text-cyan-400 leading-tight">{todaySessions}</div>
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Today's Flow</div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 flex items-center gap-4 group shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">⚡</div>
        <div>
          <div className="text-xl font-black text-yellow-400 leading-tight">{credits}</div>
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">AI Credits</div>
        </div>
      </div>
    </div>
  );
}
