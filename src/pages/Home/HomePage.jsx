import { useNavigate } from 'react-router-dom';
import { GraduationCap, Activity, Star, BarChart2, Trophy, Users, BookOpen, Award, ExternalLink, Code2, Network, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { isRegistered } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StarsDisplay } from '../../components/ui/UIComponents';

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


const studentTestimonials = [
  { 
    name: 'Priya Nair', 
    dept: 'CS Engineering, MIT', 
    rating: 5, 
    text: 'SPAT has completely transformed how I track my co-curricular accomplishments. The interface is gorgeous, and seeing my star level increase keeps me incredibly motivated!' 
  },
  { 
    name: 'Arjun Krishnan', 
    dept: 'IT, VIT University', 
    rating: 5, 
    text: 'I love the dashboard! Submitting my certificates for hackathons and online courses is effortless, and my mentor reviews them within hours. A perfect platform!' 
  }
];

const managementTestimonials = [
  { 
    name: 'Dr. Priya Sharma', 
    dept: 'HOD, CS Engineering, MIT', 
    rating: 5, 
    text: 'Managing student activity credits used to be an administrative nightmare of spreadsheets and lost certificates. SPAT has streamlined the entire verification process into a seamless departmental dashboard.' 
  },
  { 
    name: 'Prof. Arun Vijay', 
    dept: 'Senior Mentor, MIT College of Eng.', 
    rating: 5, 
    text: 'As a mentor, SPAT allows me to stay connected with my students\' extracurricular progress. The approval workflow is highly intuitive, allowing me to review and validate submissions in just a single click.' 
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
            SPAT
            <span className="block text-xl md:text-3xl mt-3.5 font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500">
              Student Performance, Activities & Records Tracker
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal" style={{ color: bodyTextColor }}>
            SPAT helps students track co-curricular activities, earn credits, and showcase achievements — all in one beautiful, intelligent platform.
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
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold" style={{ color: headingColor }}>Testimonials</h2>
            <p className="mt-3 text-lg" style={{ color: subtleColor }}>Trusted by students and educational administrators alike</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Part 1: Student Says */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary-500" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-primary-500">Student Voices</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {studentTestimonials.map((r) => (
                  <div key={r.name}
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
                {managementTestimonials.map((r) => (
                  <div key={r.name}
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

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-12 shadow-glow"
            style={{ background: cardBg, border: `1px solid rgba(234,88,12,0.3)`, backdropFilter: 'blur(12px)' }}>
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: headingColor }}>Ready to Track Your Journey?</h2>
            <p className="mb-8" style={{ color: bodyTextColor }}>Join thousands of students already using SPAT to showcase their achievements.</p>
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
              <img src={isDark ? "/spat-logo1.png" : "/spat-logo2.png"} className="w-8 h-8 object-contain rounded-xl" alt="SPAT Logo" />
              <span className="font-display font-bold text-xl" style={{ color: headingColor }}>SPAT</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: subtleColor }}>
              Student Performance, Activities & Records Tracker — Empowering students to document, track, and celebrate their achievements.
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
                <Mail className="w-4 h-4 text-primary-500" /><span>support@spat.edu.in</span>
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
          © {new Date().getFullYear()} SPAT — Student Performance, Activities & Records Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
