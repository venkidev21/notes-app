import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen } from 'lucide-react'
import { HeroCanvas } from '../components/3d/HeroCanvas'
import { useSettingsStore } from '../store/useSettingsStore'

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [show3D, setShow3D] = React.useState(false);
  const renderQuality = useSettingsStore((state) => state.renderQuality);


  React.useEffect(() => {
    const timer = setTimeout(() => setShow3D(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Container animation configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring' as const, damping: 20, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pl-24 pr-8 py-12 relative overflow-hidden">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Hero Text & Call to Actions */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 space-y-8 text-left"
        >
          {/* Tagline Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 font-display text-xs tracking-wider uppercase font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Next-Gen Thought Processor</span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight text-white">
              Write <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(168,85,247,0.15)]">Beautiful</span> Notes.
            </h1>
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight text-slate-100">
              Organize Thoughts.
            </h1>
            <h1 className="font-display font-bold text-5xl md:text-6xl xl:text-7xl leading-tight text-slate-300/80">
              Think Without Limits.
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-slate-400 font-sans text-lg leading-relaxed max-w-lg"
          >
            Experience a digital workspace engineered with spatial physics, 3D tactile interaction, and clean markdown semantics. Handmade for creators, developer-minds, and visionaries.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            {/* Primary Button */}
            <motion.button
              onClick={() => navigate('/notes', { state: { triggerCreate: true } })}
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(168, 85, 247, 0.45)' }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden group px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-display font-semibold text-base shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:brightness-110 flex items-center space-x-2 transition-all"
            >
              {/* Ripple / Glow background */}
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span>Create Note</span>
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.button>

            {/* Secondary Button */}
            <motion.button
              onClick={() => navigate('/notes')}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-slate-200 font-display font-semibold text-base flex items-center space-x-2 shadow-lg"
            >
              <BookOpen size={18} />
              <span>Explore</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right Side: Interactive 3D Canvas */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="lg:col-span-6 h-[450px] lg:h-[650px] w-full relative flex items-center justify-center"
        >
          {/* Subtle glowing halo behind 3D objects */}
          <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse" />
          {show3D && renderQuality === 'webgl' ? (
            <HeroCanvas />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-400/50 opacity-40">
              <BookOpen size={64} className="animate-pulse" />
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Home;
