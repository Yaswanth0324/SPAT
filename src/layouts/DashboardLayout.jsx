import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Bell, X, CheckCheck, Star, MessageSquarePlus } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { notificationApi, reviewApi } from '../utils/api';

const NOTIF_ICONS = {
  SYSTEM_ANNOUNCEMENT: '📢',
  SUBMISSION_APPROVED: '✅',
  SUBMISSION_REJECTED: '❌',
  SUBMISSION_PENDING:  '⏳',
  LOG_REVIEWED:        '📋',
  GENERAL:             '🔔',
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)     return `${diff}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const DashboardLayout = ({ links, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [open, setOpen]           = useState(false);
  const [notifications, setNotifs] = useState([]);
  const [loading, setLoading]     = useState(false);
  const panelRef                  = useRef(null);

  // 7-day Review Pop-up Prompt State
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewRating, setReviewRating]     = useState(5);
  const [reviewText, setReviewText]         = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user || !user.id) return;
    const key = `spat_review_prompt_done_${user.id}`;
    if (localStorage.getItem(key)) return;

    const regTime = user.createdAt ? new Date(user.createdAt).getTime() : Date.now();
    const daysSinceReg = (Date.now() - regTime) / (1000 * 60 * 60 * 24);

    if (daysSinceReg >= 7) {
      // Add a system notification prompt for review
      setNotifs(prev => {
        if (prev.some(n => n.id === '7day_review_prompt')) return prev;
        return [
          {
            id: '7day_review_prompt',
            title: '⭐ Rate & Review SPAT',
            body: 'You have been using SPAT for over 7 days! Please take a moment to review our application.',
            type: 'SYSTEM_ANNOUNCEMENT',
            read: false,
            createdAt: new Date().toISOString(),
          },
          ...prev
        ];
      });
      setShowReviewPopup(true);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAll();
      setNotifs(data || []);
    } catch {
      // silently fail — notification bell is non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  // Colors
  const headerBg    = isDark ? 'rgba(20, 8, 2, 0.85)'     : 'rgba(255, 247, 237, 0.85)';
  const headerBorder = isDark ? 'rgba(234, 88, 12, 0.2)'  : '#fed7aa';
  const iconColor   = isDark ? '#fdba74'                   : '#c2410c';
  const panelBg     = isDark ? '#1c0a02'                   : '#fff7ed';
  const panelBorder = isDark ? 'rgba(234,88,12,0.3)'       : '#fed7aa';
  const itemBg      = isDark ? 'rgba(234,88,12,0.08)'      : 'rgba(194,65,12,0.06)';
  const itemUnread  = isDark ? 'rgba(234,88,12,0.18)'      : 'rgba(194,65,12,0.12)';
  const textMain    = isDark ? '#fff1e6'                   : '#431407';
  const textSub     = isDark ? 'rgba(253,232,208,0.6)'     : '#9a3412';

  const handle7DayReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewApi.create({
        name: user?.name || user?.fullName || 'SPAT User',
        email: user?.email || 'user@spat.edu.in',
        college: user?.college || user?.collegeName || 'SPAT College',
        role: user?.role === 'STUDENT' ? 'Student' : user?.role === 'MENTOR' ? 'Mentor' : user?.role === 'HOD' ? 'HOD' : user?.role === 'COLLEGE_ADMIN' ? 'College Management' : 'Student',
        rating: reviewRating,
        feedback: reviewText.trim()
      });
      if (user?.id) {
        localStorage.setItem(`spat_review_prompt_done_${user.id}`, 'true');
      }
      setShowReviewPopup(false);
    } catch {
      setShowReviewPopup(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDismiss7DayPopup = () => {
    if (user?.id) {
      localStorage.setItem(`spat_review_prompt_done_${user.id}`, 'true');
    }
    setShowReviewPopup(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} title={title} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 backdrop-blur-md border-b"
          style={{ background: headerBg, borderColor: headerBorder }}
        >
          <div className="flex items-center justify-end gap-2 px-6 py-3 md:px-8">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all"
              style={{ color: iconColor, background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(234,88,12,0.15)' : '#fed7aa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={panelRef}>
              <button
                id="notif-bell-btn"
                onClick={() => setOpen(v => !v)}
                className="p-2 rounded-xl transition-all relative"
                style={{ color: iconColor, background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(234,88,12,0.15)' : '#fed7aa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-bold"
                    style={{
                      fontSize: '10px',
                      width: '16px',
                      height: '16px',
                      background: '#dc2626',
                      lineHeight: 1,
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {open && (
                <div
                  id="notif-panel"
                  className="absolute right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden"
                  style={{
                    width: '360px',
                    background: panelBg,
                    borderColor: panelBorder,
                    maxHeight: '480px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 999,
                  }}
                >
                  {/* Panel Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b"
                    style={{ borderColor: panelBorder }}
                  >
                    <span className="font-semibold text-sm" style={{ color: textMain }}>
                      Notifications {unreadCount > 0 && <span style={{ color: '#dc2626' }}>({unreadCount} new)</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                          style={{ color: iconColor }}
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> All read
                        </button>
                      )}
                      <button
                        onClick={() => setOpen(false)}
                        className="p-1 rounded-lg transition-all"
                        style={{ color: textSub }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto flex-1" style={{ maxHeight: '400px' }}>
                    {loading && notifications.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-sm" style={{ color: textSub }}>Loading…</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <Bell className="w-8 h-8 opacity-30" style={{ color: textSub }} />
                        <span className="text-sm" style={{ color: textSub }}>No notifications yet</span>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          className="flex gap-3 px-4 py-3 cursor-pointer transition-all border-b"
                          style={{
                            background: notif.read ? 'transparent' : itemUnread,
                            borderColor: isDark ? 'rgba(234,88,12,0.1)' : '#fed7aa',
                          }}
                          onClick={() => !notif.read && handleMarkRead(notif.id)}
                          onMouseEnter={e => e.currentTarget.style.background = itemBg}
                          onMouseLeave={e => e.currentTarget.style.background = notif.read ? 'transparent' : itemUnread}
                        >
                          <span className="text-xl mt-0.5 flex-shrink-0">
                            {NOTIF_ICONS[notif.type] || '🔔'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-sm font-medium truncate"
                                style={{ color: textMain, fontWeight: notif.read ? 400 : 600 }}
                              >
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span
                                  className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                                  style={{ background: '#ea580c' }}
                                />
                              )}
                            </div>
                            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: textSub }}>
                              {notif.body}
                            </p>
                            <p className="text-xs mt-1 opacity-60" style={{ color: textSub }}>
                              {timeAgo(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* ── 7-DAY REVIEW POP-UP MODAL ──────────────────────── */}
      {showReviewPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl relative border"
            style={{
              background: isDark ? 'linear-gradient(135deg, #1e0d05 0%, #2a1208 100%)' : '#ffffff',
              borderColor: isDark ? 'rgba(234,88,12,0.35)' : '#fed7aa',
              color: isDark ? '#fff1e6' : '#1c0f00'
            }}
          >
            <button
              onClick={handleDismiss7DayPopup}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex p-3 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
                <MessageSquarePlus className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold">Enjoying SPAT?</h3>
              <p className="text-xs mt-1 text-orange-500 font-medium">You've been using SPAT for over 7 days!</p>
              <p className="text-xs mt-1 opacity-75">Please take a moment to rate and review our application.</p>
            </div>

            <form onSubmit={handle7DayReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Your Rating</label>
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setReviewRating(starVal)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${starVal <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-400 opacity-40'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Your Review</label>
                <textarea
                  className="input-field min-h-[90px] text-sm resize-none"
                  placeholder="Share your experience using SPAT..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDismiss7DayPopup}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-500/10 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-1/2 btn-primary justify-center py-2.5 text-xs font-bold shadow-glow"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
