import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const DashboardLayout = ({ links, title }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen">
      <Sidebar links={links} title={title} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 backdrop-blur-md border-b"
          style={{
            background: theme === 'dark'
              ? 'rgba(20, 8, 2, 0.85)'
              : 'rgba(255, 247, 237, 0.85)',
            borderColor: theme === 'dark'
              ? 'rgba(234, 88, 12, 0.2)'
              : '#fed7aa',
          }}
        >
          <div className="flex items-center justify-end px-6 py-3 md:px-8">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all"
              style={{
                color: theme === 'dark' ? '#fdba74' : '#c2410c',
                background: 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(234,88,12,0.15)' : '#fed7aa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
