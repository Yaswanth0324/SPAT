import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { isRegistered } from '../utils/localStorage';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const navLinks = [
    { href: '#hero', label: 'Home' },
    { href: '#features', label: 'About' },
    { href: '#contact', label: 'Contact' },
    { href: '#reviews', label: 'Reviews' },
  ];

  const navBg = isDark
    ? 'rgba(20, 8, 2, 0.75)'
    : 'rgba(255, 247, 237, 0.85)';
  const navBorder = isDark
    ? 'rgba(234, 88, 12, 0.2)'
    : 'rgba(194, 65, 12, 0.2)';
  const linkColor = isDark ? 'rgba(253,232,208,0.85)' : '#7c2d12';
  const linkHoverColor = isDark ? '#fff1e6' : '#431407';
  const logoTextColor = isDark ? '#fff1e6' : '#431407';
  const toggleColor = isDark ? '#fdba74' : '#c2410c';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: navBg, borderBottom: `1px solid ${navBorder}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={isDark ? "/spat-logo1.png" : "/spat-logo2.png"} className="w-10 h-10 object-contain rounded-xl shadow-glow" alt="SPAT Logo" />
            <span className="font-display font-bold text-xl" style={{ color: logoTextColor }}>SPAT</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: linkColor }}
                onMouseEnter={e => e.currentTarget.style.color = linkHoverColor}
                onMouseLeave={e => e.currentTarget.style.color = linkColor}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all"
              style={{ color: toggleColor }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(234,88,12,0.15)' : 'rgba(194,65,12,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleGetStarted} className="hidden md:inline-flex btn-primary text-sm">
              Get Started
            </button>
            <button
              className="md:hidden p-2 rounded-xl transition-all"
              style={{ color: toggleColor }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden backdrop-blur-md border-t px-4 py-4 space-y-2"
          style={{ background: isDark ? 'rgba(20,8,2,0.95)' : 'rgba(255,247,237,0.97)', borderColor: navBorder }}
        >
          {navLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium transition-colors"
              style={{ color: linkColor }}
            >
              {l.label}
            </a>
          ))}
          <button onClick={handleGetStarted} className="btn-primary w-full justify-center mt-2">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
