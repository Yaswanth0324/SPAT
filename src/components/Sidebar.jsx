import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from './ui/UIComponents';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ links, title }) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === 'dark';

  const sidebarStyle = {
    background: isDark
      ? 'linear-gradient(180deg, #1e0d05 0%, #2a1208 100%)'
      : '#ffffff',
    borderRight: isDark
      ? '1px solid rgba(234, 88, 12, 0.2)'
      : '1px solid #fed7aa',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-6"
        style={{ borderBottom: isDark ? '1px solid rgba(234,88,12,0.2)' : '1px solid #fed7aa' }}
      >
        <img src={isDark ? "/spat-logo1.png" : "/spat-logo2.png"} className="w-10 h-10 object-contain rounded-xl" alt="SPAT Logo" />
        <div>
          <p className="font-display font-bold text-primary-600 text-sm leading-tight">SPAT</p>
          <p className="text-xs leading-tight" style={{ color: isDark ? '#fdba74' : '#92400e' }}>{title}</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: isDark ? '1px solid rgba(234,88,12,0.2)' : '1px solid #fed7aa' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
          style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#fff7ed' }}
        >
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: isDark ? '#fde8d0' : '#1c0f00' }}>
              {user?.name}
            </p>
            <p className="text-xs truncate" style={{ color: isDark ? '#fdba74' : '#92400e' }}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full"
          style={{ color: '#ef4444' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-xl shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0"
        style={sidebarStyle}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={sidebarStyle}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
