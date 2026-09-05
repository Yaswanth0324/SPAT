import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Activity, Star, BarChart2, Trophy, Users, BookOpen, Award, ExternalLink, Code2, Network, Mail, Phone, MapPin, MessageSquarePlus, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { isRegistered } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StarsDisplay, useToast } from '../../components/ui/UIComponents';
import { reviewApi } from '../../utils/api';

const flowSteps = [
  {
    step: '1',
    role: 'System Admin',
    action: 'Platform Initialization',
    desc: 'Registers participating colleges, creates department profiles, initializes global activity categories, and sets up baseline credit thresholds.',
    icon: <Code2 className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600'
  },
  {
    step: '2',
    role: 'College Admin',
    action: 'Institutional Config',
    desc: 'Establishes local college databases, maps departmental branches, registers Head of Department (HOD) accounts, and regulates campus policy parameters.',
    icon: <Users className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500'
  },
  {
    step: '3',
    role: 'HOD (Head of Dept)',
    action: 'Department Allocation',
    desc: 'Appoints and assigns Mentors to specific student batches, monitors department-wide real-time analytics, and reviews escalated credit claims.',
    icon: <Network className="w-6 h-6" />,
    color: 'from-yellow-500 to-amber-600'
  },
  {
    step: '4',
    role: 'Mentor',
    action: 'Verification & Audit',
    desc: 'Directly audits student activity logs, reviews uploaded certificate proofs, adds constructive feedback, and approves/rejects credit scores.',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-teal-500 to-emerald-600'
  },
  {
    step: '5',
    role: 'Student',
    action: 'Credit Accumulation',
    desc: 'Submits co-curricular/extracurricular activity proofs, tracks real-time progress on custom interactive dashboards, earns stars, and downloads official transcripts.',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600'
  }
];

const defaultStudentTestimonials = [
  { 
    name: 'Priya Nair', 
    dept: 'CS Engineering, MIT', 
    category: 'STUDENT',
    rating: 5, 
    text: 'SAPT has completely transformed how I track my co-curricular accomplishments. The interface is gorgeous, and seeing my star level increase keeps me incredibly motivated!' 
  },
  { 
    name: 'Arjun Krishnan', 
    dept: 'IT, VIT University', 
    category: 'STUDENT',
    rating: 5, 
    text: 'I love the dashboard! Submitting my certificates for hackathons and online courses is effortless, and my mentor reviews them within hours. A perfect platform!' 
  }
];

const defaultManagementTestimonials = [
  { 
    name: 'Dr. Priya Sharma', 
    dept: 'HOD, CS Engineering, MIT', 
    category: 'MANAGEMENT',
    rating: 5, 
    text: 'Managing student activity credits used to be an administrative nightmare of spreadsheets and lost certificates. SAPT has streamlined the entire verification process into a seamless departmental dashboard.' 
  },
  { 
    name: 'Prof. Arun Vijay', 
    dept: 'Senior Mentor, MIT College of Eng.', 
    category: 'MANAGEMENT',
    rating: 5, 
    text: 'As a mentor, SAPT allows me to stay connected with my students\' extracurricular progress. The approval workflow is highly intuitive, allowing me to review and validate submissions in just a single click.' 
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  const isDark = theme === 'dark';

  // Reviews state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    college: user?.college || user?.collegeName || '',
    role: user?.role === 'STUDENT' ? 'Student' : user?.role === 'MENTOR' ? 'Mentor' : user?.role === 'HOD' ? 'HOD' : user?.role === 'COLLEGE_ADMIN' ? 'College Management' : 'Student',
    rating: 5,
    feedback: ''
  });

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.email.trim() || !newReview.college.trim() || !newReview.role.trim() || !newReview.feedback.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewApi.create(newReview);
      showToast('Thank you! Your review has been submitted.', 'success');
      setShowReviewModal(false);
      setNewReview({
        name: user?.name || user?.fullName || '',
        email: user?.email || '',
        college: user?.college || user?.collegeName || '',
        role: 'Student',
        rating: 5,
        feedback: ''
      });
    } catch (err) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate(`/dashboard/${user.role.toLowerCase().replace('_', '-')}`);
    } else if (isRegistered()) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  // ── Theme-dependent styles ──────────────────────────────────────────
  const pageBg = isDark
    ? 'linear-gradient(145deg, #140802 0%, #1e0d05 40%, #2a1208 70%, #140802 100%)'
    : 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 70%, #fff7ed 100%)';

  const headingColor  = isDark ? '#fff1e6' : '#431407';
  const bodyTextColor = isDark ? '#fde8d0' : '#7c2d12';
  const subtleColor   = isDark ? '#fdba74' : '#9a3412';
  const mutedColor    = isDark ? '#c2410c' : '#c2410c';

  const cardBg = isDark
    ? 'rgba(30,13,5,0.7)'
    : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark
    ? '1px solid rgba(234,88,12,0.2)'
    : '1px solid #fed7aa';

  const sectionAltBg = isDark
    ? 'rgba(20,8,2,0.6)'
    : 'rgba(255,237,213,0.6)';

  const dividerColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(194,65,12,0.2)';

  const learnMoreStyle = isDark
    ? { border: '1px solid rgba(255,255,255,0.2)', color: '#fff1e6', background: 'rgba(255,255,255,0.08)' }
    : { border: '1px solid #c2410c', color: '#c2410c', background: 'transparent' };

  // ────────────────────────────────────────────────────
  return (
    <div style={{ background: pageBg, minHeight: '100vh', color: bodyTextColor }}>
      {ToastComponent}
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section id="hero" className="relative pt-16 pb-2 px-4 overflow-hidden flex items-center justify-center min-h-[calc(100vh-4rem)]">
        {/* Background orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse-slow"
          style={{ background: isDark ? 'rgba(234,88,12,0.12)' : 'rgba(234,88,12,0.06)' }} />

        <div className="max-w-4xl mx-auto relative z-10 text-center animate-slide-up space-y-4">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mx-auto"
            style={{ 
              background: isDark ? 'rgba(234,88,12,0.15)' : 'rgba(234,88,12,0.1)', 
              color: isDark ? '#fb923c' : '#c2410c', 
              border: `1px solid ${isDark ? 'rgba(234,88,12,0.3)' : 'rgba(194,65,12,0.3)'}` 
            }}>
            <Star className="w-3.5 h-3.5 fill-primary-500 text-primary-500" />
            Track. Earn. Excel.
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-black leading-none tracking-tight"
            style={{ color: headingColor }}>
            SAPT
            <span className="block text-xl md:text-3xl mt-3.5 font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500">
              Student Activity &amp; Performance Tracker
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal" style={{ color: bodyTextColor }}>
            SAPT helps students track co-curricular activities, earn credits, and showcase achievements — all in one beautiful, intelligent platform.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-1.5">
            <button onClick={handleGetStarted} className="btn-primary text-lg px-10 py-3.5 shadow-glow-lg transition-transform hover:scale-105">
              Get Started Free
            </button>
            <a href="#flow"
              className="inline-flex items-center gap-2 px-10 py-3.5 rounded-xl font-semibold text-lg transition-all hover:shadow-md hover:scale-105"
              style={learnMoreStyle}
              onMouseEnter={e => {
                if (!isDark) e.currentTarget.style.background = 'rgba(194,65,12,0.08)';
              }}
              onMouseLeave={e => {
                if (!isDark) e.currentTarget.style.background = 'transparent';
              }}>
              See How It Works
            </a>
          </div>

          {/* Stats centered */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 pt-3.5 pb-0">
            {[['50+', 'Colleges'], ['10K+', 'Students'], ['1M+', 'Credits Awarded']].map(([val, label], i, arr) => (
              <div key={label} className="flex items-center gap-6 animate-fade-in">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold" style={{ color: headingColor }}>{val}</p>
                  <p className="text-xs font-semibold mt-1 tracking-wide uppercase" style={{ color: isDark ? '#fb923c' : '#9a3412' }}>{label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:block w-px h-8" style={{ background: dividerColor }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="flow" className="py-24 px-4" style={{ background: sectionAltBg }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold" style={{ color: headingColor }}>How It Works</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: subtleColor }}>
              A cascading administrative flow orchestrating activity point validation and credit acquisition across all academic tiers.
            </p>
          </div>

          {/* Waterfall Flow Section */}
          <div className="space-y-4 relative max-w-3xl mx-auto">
            {flowSteps.map((step, index) => (
              <div key={step.step} className="flex flex-col items-center">
                {/* Box / Card */}
                <div 
                  className="group relative w-full rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow flex flex-col sm:flex-row items-center sm:items-start gap-5"
                  style={{ background: cardBg, border: cardBorder, backdropFilter: 'blur(8px)' }}
                >
                  {/* Step Badge & Icon */}
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg text-white shrink-0`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary-500">Step 0{step.step} · {step.action}</span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 max-w-max mx-auto sm:mx-0">ROLE {step.step}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold mt-1" style={{ color: headingColor }}>
                      {step.role}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: bodyTextColor }}>
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Downward Arrow (only show between steps) */}
                {index < flowSteps.length - 1 && (
                  <div className="py-2.5 flex flex-col items-center">
                    {/* Custom SVG Glowing Connector Arrow */}
                    <svg className="w-6 h-10 text-primary-500 animate-pulse drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STAR SYSTEM ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4" style={{ color: headingColor }}>Star Achievement System</h2>
          <p className="mb-12" style={{ color: subtleColor }}>Earn credits and unlock achievement stars</p>
          <div className="grid grid-cols-5 gap-4">
            {[
              { stars: 1, credits: 100, label: 'Bronze' },
              { stars: 2, credits: 250, label: 'Silver' },
              { stars: 3, credits: 500, label: 'Gold' },
              { stars: 4, credits: 1000, label: 'Platinum' },
              { stars: 5, credits: 2000, label: 'Diamond' },
            ].map(({ stars, credits, label }) => (
              <div key={stars} className="rounded-2xl p-4 text-center transition-all hover:-translate-y-1"
                style={{ background: cardBg, border: cardBorder, backdropFilter: 'blur(8px)' }}>
                <StarsDisplay count={stars} max={stars} size="sm" />
                <p className="text-xs font-bold mt-2" style={{ color: '#f59e0b' }}>{label}</p>
                <p className="text-xs mt-1" style={{ color: subtleColor }}>{credits}+ credits</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section id="reviews" className="py-24 px-4" style={{ background: sectionAltBg }}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-display text-4xl font-bold" style={{ color: headingColor }}>Testimonials</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: subtleColor }}>Trusted by students and educational administrators alike</p>
            <div>
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-glow transition-transform hover:scale-105"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Add Your Review
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Part 1: Student Says */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary-500" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-primary-500">Student Voices</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {defaultStudentTestimonials.map((r, idx) => (
                  <div key={idx}
                    className="rounded-2xl p-6 transition-all hover:-translate-y-1 flex flex-col justify-between"
                    style={{ background: cardBg, border: cardBorder, backdropFilter: 'blur(8px)' }}>
                    <div>
                      <StarsDisplay count={r.rating} size="sm" />
                      <p className="text-sm mt-3 mb-4 leading-relaxed font-normal" style={{ color: bodyTextColor }}>"{r.text}"</p>
                    </div>
                    <div className="pt-3" style={{ borderTop: cardBorder }}>
                      <p className="font-semibold text-sm" style={{ color: headingColor }}>{r.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: subtleColor }}>{r.dept}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 2: College Management Says */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary-500" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-primary-500">College Management Voices</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {defaultManagementTestimonials.map((r, idx) => (
                  <div key={idx}
                    className="rounded-2xl p-6 transition-all hover:-translate-y-1 flex flex-col justify-between"
                    style={{ background: cardBg, border: cardBorder, backdropFilter: 'blur(8px)' }}>
                    <div>
                      <StarsDisplay count={r.rating} size="sm" />
                      <p className="text-sm mt-3 mb-4 leading-relaxed font-normal" style={{ color: bodyTextColor }}>"{r.text}"</p>
                    </div>
                    <div className="pt-3" style={{ borderTop: cardBorder }}>
                      <p className="font-semibold text-sm" style={{ color: headingColor }}>{r.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: subtleColor }}>{r.dept}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADD REVIEW MODAL ──────────────────────────────── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl p-8 shadow-2xl relative border"
            style={{
              background: isDark ? 'linear-gradient(135deg, #1a0a02 0%, #1e0d05 100%)' : '#ffffff',
              borderColor: isDark ? 'rgba(234,88,12,0.35)' : '#fed7aa'
            }}
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
                <MessageSquarePlus className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold" style={{ color: headingColor }}>Rate &amp; Review SAPT</h3>
              <p className="text-sm mt-1" style={{ color: subtleColor }}>Share your experience with our platform</p>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4">
              <div>
                <label className="label-field">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your full name"
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label-field">Gmail / Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="your.email@gmail.com"
                  value={newReview.email}
                  onChange={e => setNewReview({ ...newReview, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">College <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. MIT College"
                    value={newReview.college}
                    onChange={e => setNewReview({ ...newReview, college: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label-field">Role <span className="text-red-500">*</span></label>
                  <select
                    className="select-field"
                    value={newReview.role}
                    onChange={e => setNewReview({ ...newReview, role: e.target.value })}
                    required
                  >
                    <option value="Student">Student</option>
                    <option value="Mentor">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="College Management">College Management</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-field">Stars <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setNewReview({ ...newReview, rating: starVal })}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${starVal <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-400 opacity-40'}`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold ml-2" style={{ color: headingColor }}>
                    {newReview.rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="label-field">Feedback <span className="text-red-500">*</span></label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Write your feedback about SAPT..."
                  value={newReview.feedback}
                  onChange={e => setNewReview({ ...newReview, feedback: e.target.value })}
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary w-full justify-center py-3 text-base shadow-glow"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-12 shadow-glow"
            style={{ background: cardBg, border: `1px solid rgba(234,88,12,0.3)`, backdropFilter: 'blur(12px)' }}>
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: headingColor }}>Ready to Track Your Journey?</h2>
            <p className="mb-8" style={{ color: bodyTextColor }}>Join thousands of students already using SAPT to showcase their achievements.</p>
            <button onClick={handleGetStarted} className="btn-primary text-base px-10 py-4 shadow-glow-lg text-lg">
              Get Started — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer id="contact" className="py-12 px-4" style={{ borderTop: `1px solid ${dividerColor}` }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={isDark ? "/sapt-logo1.png" : "/sapt-logo2.png"} className="w-8 h-8 object-contain rounded-xl" alt="SAPT Logo" />
              <span className="font-display font-bold text-xl" style={{ color: headingColor }}>SAPT</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: subtleColor }}>
              Student Activity &amp; Performance Tracker — Empowering students to document, track, and celebrate their achievements.
            </p>
            <div className="flex gap-3 mt-4">
              {[ExternalLink, Code2, Network].map((Icon, i) => (
                <a key={i} href="#"
                  className="p-2 rounded-lg transition-all"
                  style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(234,88,12,0.08)', border: cardBorder, color: subtleColor }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4" style={{ color: headingColor }}>Quick Links</h3>
            <div className="space-y-2">
              {['Home', 'About', 'Features', 'Reviews', 'Login', 'Register'].map(l => (
                <p key={l}>
                  <a href="#" className="text-sm transition-colors hover:text-primary-500"
                    style={{ color: subtleColor }}>{l}</a>
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4" style={{ color: headingColor }}>Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm" style={{ color: subtleColor }}>
                <Mail className="w-4 h-4 text-primary-500" /><span>support@sapt.edu.in</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: subtleColor }}>
                <Phone className="w-4 h-4 text-primary-500" /><span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: subtleColor }}>
                <MapPin className="w-4 h-4 text-primary-500" /><span>Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 text-center text-sm"
          style={{ borderTop: `1px solid ${dividerColor}`, color: mutedColor }}>
          © {new Date().getFullYear()} SAPT — Student Activity &amp; Performance Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
