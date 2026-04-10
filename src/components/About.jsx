import { useState } from 'react';
import { PRIVACY_POLICY, TERMS_OF_USE } from '../constants/LegalText';
import { useTelegram } from '../hooks/useTelegram';

// CSS-var-based card style (replaces broken Tailwind class names)
const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 16,
  padding: '20px',
};

export default function About({ onUpgrade }) {
  const [activeDoc, setActiveDoc] = useState(null);
  const { openLink } = useTelegram();

  if (activeDoc) {
    const content = activeDoc === 'privacy' ? PRIVACY_POLICY : TERMS_OF_USE;
    return (
      <div className="animate-fade-in-up pb-10">
        <button
          onClick={() => setActiveDoc(null)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-6 group"
          aria-label="Back to Info"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Info
        </button>

        <div className="rounded-2xl p-6" style={cardStyle}>
          {content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black mb-4 uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-black mt-6 mb-3 uppercase text-purple-400 tracking-widest">{line.replace('## ', '')}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="text-xs mb-2 list-none flex gap-2" style={{ color: 'var(--text-secondary)' }}><span>•</span>{line.replace('- ', '')}</li>;
            if (!line.trim()) return <br key={i} />;
            return <p key={i} className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{line}</p>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <section>
        <h2 className="text-2xl font-black mb-4 gradient-text tracking-tight">HOW IT WORKS</h2>
        <div style={cardStyle} className="text-left">
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Task Shredder AI uses Groq Cloud (Llama 3.3 70B) to break your overwhelming goals into 5 clear, actionable Pomodoro steps.
          </p>
          <div className="space-y-4">
            {[
              { n: 1, color: 'bg-purple-500/20 text-purple-400', text: 'Enter a big goal like "Build a Startup" or "Learn React".' },
              { n: 2, color: 'bg-cyan-500/20 text-cyan-400', text: 'AI Shredder generates 5 focused 25-min Pomodoro sessions.' },
              { n: 3, color: 'bg-green-500/20 text-green-400', text: 'Execute each step using the integrated timer.' },
            ].map(({ n, color, text }) => (
              <div key={n} className="flex gap-4">
                <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center font-bold flex-shrink-0`}>{n}</div>
                <p className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-secondary)' }}>THE POMODORO METHOD</h2>
        <div style={cardStyle} className="text-left">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            The Pomodoro Technique breaks work into 25-minute focused sessions separated by short breaks. Task Shredder AI automates the planning phase so you jump straight into execution.
          </p>
        </div>
      </section>

      {/* Premium CTA */}
      <section>
        <h2 className="text-2xl font-black mb-4 gradient-text tracking-tight">⭐ PREMIUM</h2>
        <div style={{ ...cardStyle, borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}>
          <ul className="space-y-2 mb-4">
            {['∞ Unlimited AI breakdowns/day','Full session history','Custom Pomodoro durations (15/25/50 min)','7-day productivity chart','Streak restore','Premium badge','No forced ads'].map(f => (
              <li key={f} className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <span className="text-purple-400">✦</span> {f}
              </li>
            ))}
          </ul>
          <button onClick={onUpgrade} className="btn-gradient w-full py-3 font-black text-sm rounded-xl">
            ⭐ Go Premium — from 299 Stars
          </button>
        </div>
      </section>

      <section className="pt-2">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => openLink('https://t.me/Kalai_Developer')}
            className="w-full bg-slate-800/50 border border-white/5 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            style={{ color: 'var(--text-primary)' }}
          >
            Contact Developer
          </button>
          <div className="flex gap-3">
            <button onClick={() => setActiveDoc('privacy')} className="flex-1 bg-slate-800/30 border border-white/5 py-3 rounded-xl text-[10px] font-bold text-slate-500 uppercase transition-all active:scale-95 hover:text-slate-300">
              Privacy Policy
            </button>
            <button onClick={() => setActiveDoc('terms')} className="flex-1 bg-slate-800/30 border border-white/5 py-3 rounded-xl text-[10px] font-bold text-slate-500 uppercase transition-all active:scale-95 hover:text-slate-300">
              Terms of Use
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

