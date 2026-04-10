import { useState, useCallback, Suspense, lazy, useEffect, useRef } from 'react';

const TaskInput = lazy(() => import('./components/TaskInput'));
const TaskList = lazy(() => import('./components/TaskList'));
const PomodoroTimer = lazy(() => import('./components/PomodoroTimer'));
const StatsBar = lazy(() => import('./components/StatsBar'));
const Hero = lazy(() => import('./components/Hero'));
import Toast from './components/Toast';
import UserHeader from './components/UserHeader';
import { useUser } from './hooks/useUser';
import { useTelegram } from './hooks/useTelegram';
import { breakdownWithAI, mockBreakdown } from './services/ai';
import { showAdsgramAd } from './services/adsgram';
const About = lazy(() => import('./components/About'));
const PremiumModal = lazy(() => import('./components/PremiumModal'));

// ── Tab icons (inline SVG to keep bundle small) ──
const Icons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.85">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  Timer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Stats: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

export default function App() {
  const { user: userData, loading: userLoading, getUserId, recordSession, updateCredits, clearHistory, restoreStreak, decrementDailyBreakdowns } = useUser();
  const credits = userData.credits;
  const totalCompleted = userData.totalCompleted;
  const taskHistory = userData.history;
  const streak = userData.streak;
  const todaySessions = userData.todaySessions;
  const isPremium = userData.isPremium;
  const dailyBreakdownsLeft = userData.dailyBreakdownsLeft;
  const freeLimit = userData.freeLimit;

  // ── Session state (resets on close) ──
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [toast, setToast] = useState(null);
  const [adLoading, setAdLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showHero, setShowHero] = useState(true);
  const [shredCount, setShredCount] = useState(0);
  const [lastInput, setLastInput] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const abortRef = useRef(null);

  // ── Analytics & Session Tracking ──
  useEffect(() => {
    const hits = parseInt(localStorage.getItem('shredder_hits') || '0', 10);
    localStorage.setItem('shredder_hits', (hits + 1).toString());
    console.log(`[Analytics] Session #${hits + 1} started.`);
  }, []);

  // ── Hooks ──
  const { user, syncThemeColor, enableClosingConfirmation, disableClosingConfirmation, showBackButton, hideBackButton } = useTelegram();

  useEffect(() => {
    if (!isDarkMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    syncThemeColor?.(isDarkMode);
  }, [isDarkMode, syncThemeColor]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  };

  // ── Closing confirmation when session active ──
  useEffect(() => {
    if (tasks.length > 0 && isTimerRunning) {
      enableClosingConfirmation?.();
    } else {
      disableClosingConfirmation?.();
    }
  }, [tasks.length, isTimerRunning, enableClosingConfirmation, disableClosingConfirmation]);

  // ── BackButton: show when not on home tab ──
  useEffect(() => {
    if (tab !== 'home') {
      const cleanup = showBackButton?.(() => setTab('home'));
      return cleanup;
    } else {
      hideBackButton?.();
    }
  }, [tab, showBackButton, hideBackButton]);

  // ── AI Breakdown ──
  const handleBreakdown = async (mainTask) => {
    if (credits <= 0) {
      showToast('No credits left! Watch an ad to earn more ⚡', 'warning');
      return;
    }

    // Daily limit gate for free users
    if (!isPremium && dailyBreakdownsLeft === 0) {
      setShowPremiumModal(true);
      showToast('Daily limit reached! Upgrade to Premium for unlimited breakdowns ⭐', 'warning');
      return;
    }

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setActiveTaskId(null);
    setApiError(null);
    setTab('home');
    setShowHero(false);
    setLastInput(mainTask);

    try {
      const result = await breakdownWithAI(mainTask, getUserId(), abortRef.current.signal);
      setTasks(result);
      updateCredits(-1);
      decrementDailyBreakdowns?.();
      setShredCount(prev => prev + 1);
      showToast('Task Shredded! Strategy Ready 🚀', 'success');

    } catch (err) {
      if (err.name === 'AbortError') return; // User navigated away

      if (err.upgradeRequired) {
        setShowPremiumModal(true);
        showToast('Daily limit reached! Go Premium for unlimited ⭐', 'warning');
        return;
      }

      setApiError(err.message);
      showToast(`AI Error: ${err.message}. Using fallback.`, 'error');
      const fallback = await mockBreakdown(mainTask);
      setTasks(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastInput) handleBreakdown(lastInput);
  };

  // ── Task actions ──
  const handleTaskStart = (taskId) => {
    setActiveTaskId(taskId);
    setTab('timer');
  };

  const handleTaskComplete = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      recordSession(task.title);
      showToast('Pomodoro complete! Keep the flow! 🔥', 'success');
    }
    if (activeTaskId === taskId) setActiveTaskId(null);
  };

  const handleTimerComplete = () => {
    if (activeTaskId) handleTaskComplete(activeTaskId);
  };

  const handleCopyPlan = () => {
    const text = tasks.map((t, i) => {
      const meta = [t.time, t.difficulty].filter(Boolean).join(' · ');
      const line = `${i + 1}. ${t.title}${meta ? ` (${meta})` : ''}`;
      return t.motivation ? `${line}\n   💡 ${t.motivation}` : line;
    }).join('\n\n');
    navigator.clipboard.writeText(`My ${tasks.length}-step plan for "${lastInput || 'my task'}":\n\n${text}`)
      .then(() => showToast('Plan copied to clipboard! 📋', 'success'))
      .catch(() => showToast('Failed to copy', 'error'));
  };

  const handleReset = () => {
    setTasks([]);
    setActiveTaskId(null);
    setShowHero(true);
    setApiError(null);
  };

  // ── Rewarded Ad ──
  const handleWatchAd = (isAuto = false) => {
    if (!isAuto) setAdLoading(true);
    showAdsgramAd({
      blockId: import.meta.env.VITE_ADSGRAM_BLOCK_ID || 'YOUR_BLOCK_ID',
      onReward: () => {
        if (!isAuto) setAdLoading(false);
        updateCredits(3);
        showToast('+3 Credits Earned! 🎉', 'success');
      },
      onError: () => {
        if (!isAuto) setAdLoading(false);
        // Dev fallback
        updateCredits(3);
        showToast('+3 Credits Added (Dev Fallback) ⚡', 'info');
      },
    });
  };

  // ── Telegram Stars — Credits ──
  const handleBuyCredits = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.openInvoiceLink) {
      showToast('Please open in Telegram to use Stars! ⭐', 'warning');
      return;
    }

    setBuyLoading(true);
    try {
      // Fetch invoice link from your backend
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api'}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credits' }),
      });
      if (!res.ok) throw new Error('Failed to generate invoice');
      
      const { invoiceLink } = await res.json();
      
      // Open native Telegram invoice UI
      tg.openInvoiceLink(invoiceLink, (status) => {
        if (status === 'paid') {
          updateCredits(20); 
          showToast('Payment successful! +20 Credits 🎉', 'success');
        } else if (status === 'failed') {
          showToast('Payment failed', 'error');
        }
      });
    } catch (err) {
      console.error(err);
      showToast('Could not initiate payment', 'error');
    } finally {
      setBuyLoading(false);
    }
  };

  // ── Telegram Stars — Premium ──
  const handleBuyPremium = async (planType = 'premium_monthly') => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.openInvoiceLink) {
      showToast('Please open in Telegram to purchase Premium! ⭐', 'warning');
      return;
    }

    setBuyLoading(true);
    try {
      const userId = getUserId();
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api'}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: planType, userId }),
      });
      if (!res.ok) throw new Error('Failed to generate invoice');

      const { invoiceLink } = await res.json();

      tg.openInvoiceLink(invoiceLink, (status) => {
        if (status === 'paid') {
          showToast('Welcome to Premium! 🌟 Restart the app to unlock all features.', 'success');
          setShowPremiumModal(false);
        } else if (status === 'failed') {
          showToast('Payment failed', 'error');
        }
      });
    } catch (err) {
      console.error(err);
      showToast('Could not initiate payment', 'error');
    } finally {
      setBuyLoading(false);
    }
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const allDone = tasks.length > 0 && tasks.every(t => t.completed);

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden w-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-mesh pointer-events-none" />

      {/* Toast Overlay */}
      {toast && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <Toast key={toast.key} message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full max-w-lg mx-auto relative z-10 px-4 pt-4 pb-24">
        {userLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4 py-20 grayscale opacity-50">
             <div className="w-12 h-12 border-t-2 border-purple-500 rounded-full animate-spin" />
             <p className="text-xs font-bold tracking-widest uppercase">Syncing Data...</p>
          </div>
        ) : (
          <>
            <UserHeader 
              user={user || userData} 
              credits={credits} 
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(d => !d)}
              isPremium={isPremium}
            />

        {/* ── HOME TAB ── */}
        <Suspense fallback={<div className="flex justify-center p-10 mt-10"><span className="animate-spin text-2xl">⏳</span></div>}>
        {tab === 'home' && (
          <div className="mt-4">
            {/* All done celebration */}
            {allDone && (
              <div className="glass-card p-6 mb-4 text-center animate-fade-in-up"
                style={{ opacity: 0, animationFillMode: 'forwards', borderColor: 'rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: 48 }}>🎊</div>
                <h3 className="font-bold text-lg mt-2" style={{ color: 'var(--text-primary)' }}>Session Complete!</h3>
                <p className="mt-1" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  You crushed all 5 Pomodoros. Incredible focus!
                </p>
                <div className="flex gap-2 mt-4 justify-center">
                  <button className="btn-gradient px-6 py-2 text-sm font-semibold"
                    onClick={() => { setTasks([]); setActiveTaskId(null); }}>
                    New Session
                  </button>
                </div>
              </div>
            )}

            {/* Hero / Input block */}
            {tasks.length === 0 && !isLoading && (
              <>
                {/* Daily limit warning banner */}
                {!isPremium && dailyBreakdownsLeft === 0 && (
                  <div className="mb-3 p-3 rounded-xl flex items-center gap-3"
                    style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                    <span style={{ fontSize: 18 }}>⭐</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Daily limit reached</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Upgrade to Premium for unlimited AI breakdowns</p>
                    </div>
                    <button className="btn-gradient text-xs px-3 py-1.5 font-semibold shrink-0"
                      onClick={() => setShowPremiumModal(true)}>
                      Upgrade
                    </button>
                  </div>
                )}

                {showHero ? (
                  <Hero onStart={() => setShowHero(false)} />
                ) : (
                  <TaskInput onBreakdown={handleBreakdown} isLoading={isLoading} />
                )}

                {/* API error hint */}
                {apiError && (
                  <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    ⚠️ {apiError}. Using mock data. Add your GROQ_API_KEY in the backend <code>.env</code> file.
                  </div>
                )}

                {/* Recent history teaser */}
                {taskHistory.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                      Recent Sessions
                    </p>
                    <div className="space-y-2">
                      {taskHistory.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: 14 }}>✅</span>
                          <p className="text-xs flex-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{item.title}</p>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Loading shimmer */}
            {isLoading && <TaskList tasks={[]} isLoading={true} />}

            {/* Task list */}
            {!isLoading && tasks.length > 0 && !allDone && (
              <>
                <TaskList
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  isTimerRunning={isTimerRunning}
                  onTaskStart={handleTaskStart}
                  onTaskComplete={handleTaskComplete}
                  onReset={handleReset}
                  onCopy={handleCopyPlan}
                  onRegenerate={handleRegenerate}
                  isLoading={false}
                />
              </>
            )}
          </div>
        )}

        {/* ── TIMER TAB ── */}
        {tab === 'timer' && (
          <div className="mt-4">
            {activeTask ? (
              <PomodoroTimer 
                activeTask={activeTask} 
                onComplete={handleTimerComplete} 
                onRunningChange={setIsTimerRunning}
                isPremium={isPremium}
                onUpgrade={() => setShowPremiumModal(true)}
              />
            ) : (
              <div className="glass-card p-10 text-center mt-8 animate-fade-in-up"
                style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="empty-illustration mb-4"><span style={{ fontSize: 40 }}>⏱️</span></div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>No active session</h3>
                <p className="mt-2" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Go to Tasks and tap a step to start your Pomodoro timer
                </p>
                <button className="btn-gradient mt-5 px-6 py-2 text-sm font-semibold" onClick={() => setTab('home')}>
                  Go to Tasks
                </button>
              </div>
            )}
            {tasks.length > 0 && (
              <TaskList
                tasks={tasks}
                activeTaskId={activeTaskId}
                isTimerRunning={isTimerRunning}
                onTaskStart={handleTaskStart}
                onTaskComplete={handleTaskComplete}
                onReset={handleReset}
                onCopy={handleCopyPlan}
                onRegenerate={handleRegenerate}
                isLoading={false}
              />
            )}
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div className="mt-4 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <StatsBar
              streak={streak}
              credits={credits}
              completed={totalCompleted}
              todaySessions={todaySessions}
              isPremium={isPremium}
              dailyBreakdownsLeft={dailyBreakdownsLeft}
              freeLimit={freeLimit}
              onUpgrade={() => setShowPremiumModal(true)}
            />

            {/* Credits panel */}
            <div className="glass-card p-5 mt-4" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AI Credits</h3>
                  <p className="mt-1" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Each task breakdown costs 1 credit
                  </p>
                </div>
                <div className="text-3xl">⚡</div>
              </div>

              {/* Credit bar */}
              <div className="rounded-full overflow-hidden mb-4" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min((credits / (isPremium ? 500 : 30)) * 100, 100)}%`,
                  background: credits > 5 ? 'linear-gradient(90deg, #8b5cf6, #06b6d4)' : credits > 2 ? 'linear-gradient(90deg,#f59e0b,#fb923c)' : 'linear-gradient(90deg,#ef4444,#f43f5e)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{credits} / {isPremium ? 500 : 30} credits remaining</p>

              <div className="flex gap-2">
                <button
                  className="btn-gradient flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={handleWatchAd}
                  disabled={adLoading}
                >
                  {adLoading ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin-slow">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : '📺'}
                  {adLoading ? 'Loading ad…' : 'Watch Ad (+3)'}
                </button>
                <button
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                  onClick={handleBuyCredits}
                  disabled={buyLoading}
                >
                  {buyLoading ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin-slow">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : '⭐'}
                  {buyLoading ? 'Loading…' : 'Buy Credits'}
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card p-5 mt-4">
              <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>💡 Productivity Tips</h3>
              <div className="space-y-3">
                {[
                  { icon: '🧠', tip: 'Take a 5-min break after every Pomodoro' },
                  { icon: '📵', tip: 'Silence notifications during focus sessions' },
                  { icon: '💧', tip: 'Stay hydrated — it boosts concentration by 14%' },
                  { icon: '🎯', tip: 'Tackle your hardest task in the first session' },
                  { icon: '🎵', tip: 'Lo-fi music can improve focus and mood' },
                ].map(({ icon, tip }) => (
                  <div key={tip} className="flex items-start gap-3">
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Task history */}
            {taskHistory.length > 0 && (
              <div className="glass-card p-5 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>📋 Task History</h3>
                  <button
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                    onClick={clearHistory}
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {taskHistory.slice(0, 8).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2"
                      style={{ borderBottom: i < Math.min(taskHistory.length, 8) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <span style={{ fontSize: 12 }}>✅</span>
                      <p className="text-xs flex-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{item.title}</p>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab === 'about' && (
          <div className="mt-4 animate-fade-in">
            <About onUpgrade={() => setShowPremiumModal(true)} />
          </div>
        )}

        </Suspense>
          </>
        )}
      </main>
      
      {/* ── Compliance Footer ── */}
      <footer className="w-full max-w-lg mx-auto px-6 pb-28 pt-2 text-center opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <button onClick={() => window.open('https://t.me/Kalai_Developer', '_blank')}>Contact Developer</button>
        </div>
        <p className="mt-2 text-[10px] text-purple-400 font-black uppercase tracking-widest">
          Created by @Kalai_Developer
        </p>
        <p className="mt-1.5 text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
          © 2026 TASK SHREDDER AI • POWERED BY GROQ CLOUD
        </p>
      </footer>

      {/* ── BOTTOM TAB BAR ── */}
      <div
        className="tab-bar fixed bottom-0 left-0 right-0 flex items-center justify-around px-2"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))', paddingTop: 6 }}>
        {[
          { key: 'home', label: 'Tasks', Icon: Icons.Home },
          { key: 'timer', label: 'Timer', Icon: Icons.Timer },
          { key: 'stats', label: 'Stats', Icon: Icons.Stats },
          { key: 'about', label: 'Info', Icon: Icons.Info },
        ].map(({ key, label, Icon }) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <div className="tab-icon"><Icon /></div>
            {label}
          </button>
        ))}
      </div>

      {/* ── PREMIUM MODAL ── */}
      {showPremiumModal && (
        <Suspense fallback={null}>
          <PremiumModal
            onClose={() => setShowPremiumModal(false)}
            onBuy={handleBuyPremium}
            buyLoading={buyLoading}
          />
        </Suspense>
      )}
    </div>
  );
}
