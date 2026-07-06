import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, BookOpen, BarChart3, Settings, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface SidebarIconProps {
  icon: React.ReactNode;
  label: string;
  to: string;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, to }) => {
  return (
    <NavLink to={to} className="relative group my-3">
      {({ isActive }) => (
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.12, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
              isActive 
                ? 'bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)]' 
                : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
            }`}
          >
            {/* Background Expanding Glow effect */}
            <span className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Icon */}
            <span className="relative z-10">{icon}</span>
          </motion.div>
          
          {/* Label Tooltip */}
          <span className="absolute left-16 bg-slate-950/80 border border-white/10 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50 whitespace-nowrap shadow-xl">
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInitial = currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : '?';

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 80 }}
      className="fixed left-6 top-6 bottom-6 w-16 glass-panel rounded-[24px] flex flex-col justify-between items-center py-6 z-40"
    >
      {/* Brand logo & Avatar */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <span className="font-display font-bold text-lg text-white">Æ</span>
        </div>
        <div className="w-1/2 h-[1px] bg-white/10 my-4" />
        
        {currentUser ? (
          <div className="relative group flex flex-col items-center">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-display font-bold text-sm shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              {userInitial}
            </div>
            <span className="absolute left-16 bg-slate-950/80 border border-white/10 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50 whitespace-nowrap shadow-xl">
              {currentUser.email}
            </span>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-slate-500/25 flex items-center justify-center text-slate-400 font-display font-semibold text-xs">
            G
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 flex flex-col justify-center">
        <SidebarIcon icon={<Sparkles size={20} />} label="Home" to="/" />
        <SidebarIcon icon={<BookOpen size={20} />} label="Notes" to="/notes" />
        <SidebarIcon icon={<BarChart3 size={20} />} label="Analytics" to="/dashboard" />
      </div>

      {/* Settings / Logout Bottom items */}
      <div className="flex flex-col items-center">
        <SidebarIcon icon={<Settings size={20} />} label="Settings" to="/settings" />
        <div className="w-1/2 h-[1px] bg-white/10 my-4" />

        {currentUser ? (
          <div className="relative group">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.12, rotate: -8 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-900/30 flex items-center justify-center transition-all duration-300"
            >
              <LogOut size={18} />
            </motion.button>
            <span className="absolute left-16 bg-slate-950/80 border border-white/10 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50 whitespace-nowrap shadow-xl">
              Logout Session
            </span>
          </div>
        ) : (
          <div className="relative group">
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.12, rotate: 8 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-green-950/20 border border-green-900/30 text-green-400 hover:text-green-300 hover:bg-green-900/30 flex items-center justify-center transition-all duration-300"
            >
              <LogIn size={18} />
            </motion.button>
            <span className="absolute left-16 bg-slate-950/80 border border-white/10 text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 z-50 whitespace-nowrap shadow-xl">
              Authorize Client
            </span>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
