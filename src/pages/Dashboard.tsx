import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Calendar, TrendingUp } from 'lucide-react'
import { useNotesStore } from '../store/useNotesStore'
import { Canvas3D } from '../components/3d/Canvas3D'
import { useSettingsStore } from '../store/useSettingsStore'


// Custom count up utility component
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 1200; // ms
    const increment = Math.max(1, Math.floor(end / (duration / 16))); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
};

export const Dashboard: React.FC = () => {
  const { notes } = useNotesStore();
  const [show3D, setShow3D] = useState(false);
  const renderQuality = useSettingsStore((state) => state.renderQuality);

  useEffect(() => {
    const timer = setTimeout(() => setShow3D(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Compute metrics
  const totalNotes = notes.filter(n => !n.trash && !n.archived).length;
  const pinnedNotes = notes.filter(n => n.pinned && !n.trash && !n.archived).length;
  const archivedNotes = notes.filter(n => n.archived && !n.trash).length;
  const favoriteNotes = notes.filter(n => n.favorite && !n.trash && !n.archived).length;
  const trashNotes = notes.filter(n => n.trash).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring' as const, damping: 22, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen pl-24 pr-8 py-10 relative z-10 text-left">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Title */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-3xl text-white">Thought Index Analytics</h2>
            <p className="text-sm text-slate-500 mt-1 font-display">Spatial workspace indexing & metric diagnostics</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 font-display text-xs">
            <Calendar size={14} />
            <span>Telemetry Active</span>
          </div>
        </div>

        {/* Stats 4-Grid Layout with 3D Canvases */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {/* Card 1: Total Notes */}
          <motion.div 
            variants={cardVariants}
            className="glass-panel rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group border border-white/5"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.05)' }}
          >
            <div className="space-y-2 z-10">
              <span className="text-xs uppercase font-display font-bold tracking-widest text-slate-500">Total Notes</span>
              <h3 className="font-display font-bold text-4xl text-white">
                <AnimatedNumber value={totalNotes} />
              </h3>
              <p className="text-[11px] text-purple-400 font-semibold font-display">Active thought blocks</p>
            </div>
            
            {/* 3D Canvas element */}
            {show3D && renderQuality === 'webgl' ? (
              <Canvas3D model="bulb" className="w-24 h-24 select-none pointer-events-none drop-shadow-[0_8px_15px_rgba(168,85,247,0.2)]" />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-purple-400/50">
                <Sparkles size={24} className="animate-pulse" />
              </div>
            )}
          </motion.div>

          {/* Card 2: Pinned */}
          <motion.div 
            variants={cardVariants}
            className="glass-panel rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group border border-white/5"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.05)' }}
          >
            <div className="space-y-2 z-10">
              <span className="text-xs uppercase font-display font-bold tracking-widest text-slate-500">Pinned</span>
              <h3 className="font-display font-bold text-4xl text-white">
                <AnimatedNumber value={pinnedNotes} />
              </h3>
              <p className="text-[11px] text-pink-400 font-semibold font-display">Critical pin focus</p>
            </div>
            
            {show3D && renderQuality === 'webgl' ? (
              <Canvas3D model="pin" className="w-24 h-24 select-none pointer-events-none drop-shadow-[0_8px_15px_rgba(236,72,153,0.2)]" />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-pink-400/50">
                <Sparkles size={24} className="animate-pulse" />
              </div>
            )}
          </motion.div>

          {/* Card 3: Archived */}
          <motion.div 
            variants={cardVariants}
            className="glass-panel rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group border border-white/5"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.05)' }}
          >
            <div className="space-y-2 z-10">
              <span className="text-xs uppercase font-display font-bold tracking-widest text-slate-500">Archived</span>
              <h3 className="font-display font-bold text-4xl text-white">
                <AnimatedNumber value={archivedNotes} />
              </h3>
              <p className="text-[11px] text-blue-400 font-semibold font-display">Stored documentation</p>
            </div>
            
            {show3D && renderQuality === 'webgl' ? (
              <Canvas3D model="folder" className="w-24 h-24 select-none pointer-events-none drop-shadow-[0_8px_15px_rgba(59,130,246,0.2)]" isOpen={false} />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-blue-400/50">
                <Sparkles size={24} className="animate-pulse" />
              </div>
            )}
          </motion.div>

          {/* Card 4: Favorites */}
          <motion.div 
            variants={cardVariants}
            className="glass-panel rounded-3xl p-6 flex items-center justify-between relative overflow-hidden group border border-white/5"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.05)' }}
          >
            <div className="space-y-2 z-10">
              <span className="text-xs uppercase font-display font-bold tracking-widest text-slate-500">Favorites</span>
              <h3 className="font-display font-bold text-4xl text-white">
                <AnimatedNumber value={favoriteNotes} />
              </h3>
              <p className="text-[11px] text-cyan-400 font-semibold font-display">Special high priority</p>
            </div>
            
            {show3D && renderQuality === 'webgl' ? (
              <Canvas3D model="mug" className="w-24 h-24 select-none pointer-events-none drop-shadow-[0_8px_15px_rgba(6,182,212,0.2)]" />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-cyan-400/50">
                <Sparkles size={24} className="animate-pulse" />
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Dashboard visual graphs and grid items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Large Card: Neon Chart Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 80, delay: 0.3 }}
            className="lg:col-span-8 glass-panel rounded-[28px] p-6 space-y-6 relative overflow-hidden"
          >
            {/* Ambient Purple overlay glow */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px]" />
            
            <div className="flex justify-between items-center z-10 relative">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-lg text-white">Mind Flow Frequency</h4>
                <p className="text-xs text-slate-500 font-display">Productivity timeline index over past 6 intervals</p>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-display text-[11px]">
                <TrendingUp size={12} />
                <span>Steady growth</span>
              </div>
            </div>

            {/* Glowing SVG Area Line Chart */}
            <div className="w-full h-[260px] relative z-10 flex items-center justify-center pt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                {/* Definitions for Glow gradients */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Horizontal Guide lines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

                {/* Smooth Glowing Curved Area Path */}
                <path
                  d="M 0 170 Q 75 80 150 110 T 300 60 T 425 120 T 500 40 L 500 180 L 0 180 Z"
                  fill="url(#chartGradient)"
                />

                {/* Main Glowing Line Path */}
                <path
                  d="M 0 170 Q 75 80 150 110 T 300 60 T 425 120 T 500 40"
                  fill="none"
                  stroke="url(#strokeGradient)"
                  strokeWidth="3.5"
                  filter="url(#glow)"
                />

                {/* Plot points */}
                <circle cx="150" cy="110" r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="300" cy="60" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="500" cy="40" r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] text-slate-500 font-mono font-medium pt-2 px-1">
              <span>Interval A</span>
              <span>Interval B</span>
              <span>Interval C</span>
              <span>Interval D</span>
              <span>Interval E</span>
              <span>Interval F</span>
            </div>
          </motion.div>

          {/* Right Smaller Card: Tags & Miscellaneous details */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 80, delay: 0.45 }}
            className="lg:col-span-4 glass-panel rounded-[28px] p-6 space-y-6 flex flex-col justify-between"
          >
            <div>
              <h4 className="font-display font-bold text-lg text-white mb-2">Workspace Health</h4>
              <p className="text-xs text-slate-500 font-display">Structural breakdown of notes index health</p>
            </div>

            {/* List breakdown */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300 font-display">
                  <span>Pin Ratio</span>
                  <span>{totalNotes > 0 ? Math.round((pinnedNotes / totalNotes) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${totalNotes > 0 ? (pinnedNotes / totalNotes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300 font-display">
                  <span>Favorite Density</span>
                  <span>{totalNotes > 0 ? Math.round((favoriteNotes / totalNotes) * 100) : 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${totalNotes > 0 ? (favoriteNotes / totalNotes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300 font-display">
                  <span>Trash Buffer load</span>
                  <span>{trashNotes * 10}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, trashNotes * 10)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Tip */}
            <div className="bg-purple-950/20 border border-purple-500/10 rounded-2xl p-4 flex items-start space-x-3 mt-4 text-left">
              <Sparkles className="text-purple-400 shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h5 className="font-display font-semibold text-xs text-slate-200">Index Optimizations</h5>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Your workspace is looking healthy! Periodically purge trash records to maintain optimal WebGL pipeline processing speeds.
                </p>
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
