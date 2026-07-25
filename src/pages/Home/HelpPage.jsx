import Navbar from '../../components/Navbar';
import { useTheme } from '../../context/ThemeContext';
import { HelpCircle, BookOpen, Mail } from 'lucide-react';

const HelpPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const pageBg = isDark
    ? 'linear-gradient(145deg, #140802 0%, #1e0d05 60%, #140802 100%)'
    : 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 60%, #fff7ed 100%)';
  const headingColor  = isDark ? '#fff1e6' : '#431407';
  const bodyTextColor = isDark ? '#fde8d0' : '#7c2d12';
  const subtleColor   = isDark ? '#fdba74' : '#9a3412';
  const cardBg = isDark ? 'rgba(30,13,5,0.7)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? '1px solid rgba(234,88,12,0.2)' : '1px solid #fed7aa';

  return (
    <div style={{ background: pageBg, minHeight: '100vh', color: bodyTextColor }}>
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">

          {/* Icon */}
          <div className="inline-flex p-5 rounded-3xl mb-8 shadow-glow"
            style={{ background: 'linear-gradient(135deg, #ea580c, #dc2626)' }}>
            <HelpCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-black mb-6"
            style={{ color: headingColor }}>
            Help &amp; Support
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: bodyTextColor }}>
            Comprehensive documentation, FAQs, and guides are being prepared. Check back soon!
          </p>

          {/* Placeholder Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: <BookOpen className="w-7 h-7" />,
                title: 'User Guide',
                desc: 'Step-by-step instructions for students, mentors, HODs, and admins. Coming soon.',
              },
              {
                icon: <HelpCircle className="w-7 h-7" />,
                title: 'FAQs',
                desc: 'Answers to the most common questions about SPAT. Coming soon.',
              },
              {
                icon: <Mail className="w-7 h-7" />,
                title: 'Contact Support',
                desc: 'Reach out to our team at support@spat.edu.in for any queries.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-8 text-left transition-all hover:-translate-y-1"
                style={{ background: cardBg, border: cardBorder, backdropFilter: 'blur(8px)' }}
              >
                <div className="inline-flex p-3 rounded-2xl mb-4"
                  style={{ background: 'rgba(234,88,12,0.15)', color: '#ea580c' }}>
                  {card.icon}
                </div>
                <h3 className="font-display text-lg font-bold mb-2" style={{ color: headingColor }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: subtleColor }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Coming soon note */}
          <div className="mt-16 py-6 px-8 rounded-2xl inline-block"
            style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)' }}>
            <p className="text-sm font-semibold" style={{ color: '#fb923c' }}>
              📖 Full documentation is being written and will be published here soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
