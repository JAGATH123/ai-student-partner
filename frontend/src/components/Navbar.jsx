import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, LayoutDashboard, BookOpen, TrendingUp, Users, BarChart3, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/quiz', icon: BookOpen, label: 'Quiz' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/invites', icon: LinkIcon, label: 'Invite Links' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-neon-cyan/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl flex items-center justify-center shadow-lg shadow-neon-cyan/30 group-hover:shadow-neon-cyan/50 transition-all">
              <span className="text-2xl font-bold">🧠</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent font-orbitron">
              AI STUDENT
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {links.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all font-rajdhani tracking-wider ${
                    isActive
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-neon-cyan border border-neon-cyan/30 shadow-lg shadow-neon-cyan/20'
                      : 'text-gray-300 hover:bg-neon-cyan/10 hover:border hover:border-neon-cyan/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}

            {/* User Menu */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-neon-cyan/20">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neon-cyan font-rajdhani">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize font-mono">[{user?.role}]</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-neon-magenta/20 text-neon-magenta hover:shadow-lg hover:shadow-neon-magenta/30 transition-all border border-transparent hover:border-neon-magenta/30"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
