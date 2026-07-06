import React from 'react'
import { motion } from 'framer-motion'
import { Sliders, Shield, Zap } from 'lucide-react'
import { useSettingsStore } from '../store/useSettingsStore'

export const SettingsPage: React.FC = () => {
  const { parallax, renderQuality, setParallax, setRenderQuality } = useSettingsStore();

  return (
    <div className="min-h-screen pl-24 pr-8 py-10 relative z-10 text-left">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h2 className="font-display font-bold text-3xl text-white">System Settings</h2>
          <p className="text-sm text-slate-500 mt-1 font-display">Configure telemetry and workspace shaders</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[28px] divide-y divide-white/5 border border-white/5 overflow-hidden"
        >
          {/* Telemetry Toggle */}
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-200 font-display font-semibold text-sm">
                <Sliders size={16} className="text-purple-400" />
                <span>3D Parallax Intensity</span>
              </div>
              <p className="text-xs text-slate-500 max-w-md">Adjust spatial rotation angles on mouse movements</p>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 border border-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setParallax('high')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                  parallax === 'high' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                High
              </button>
              <button 
                onClick={() => setParallax('eco')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                  parallax === 'eco' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Eco
              </button>
            </div>
          </div>

          {/* Performance toggle */}
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-200 font-display font-semibold text-sm">
                <Zap size={16} className="text-pink-400" />
                <span>Render Engine Quality</span>
              </div>
              <p className="text-xs text-slate-500 max-w-md">Toggle canvas particles and floating shadow meshes</p>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 border border-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setRenderQuality('webgl')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                  renderQuality === 'webgl' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                WebGL 3D
              </button>
              <button 
                onClick={() => setRenderQuality('static')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                  renderQuality === 'static' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CSS Static
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-200 font-display font-semibold text-sm">
                <Shield size={16} className="text-blue-400" />
                <span>Local Cryptographic Database</span>
              </div>
              <p className="text-xs text-slate-500 max-w-md">Encrypt all cached note vectors inside localStorage index</p>
            </div>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold font-display rounded-lg">Active</span>
          </div>

        </motion.div>
        
        {/* About info */}
        <div className="text-center text-xs text-slate-600 font-mono space-y-1 py-12">
          <div>AetherNote client: build v1.0.0-spatial</div>
          <div>All indices are securely processed client-side.</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
