import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const resetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address')
});

type LoginInput = z.infer<typeof loginSchema>;
type SignupInput = z.infer<typeof signupSchema>;
type ResetInput = z.infer<typeof resetSchema>;

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const { login, signup, resetPassword, signInWithGoogle, enterGuestMode } = useAuth();
  const navigate = useNavigate();

  // Forms
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors }, reset: resetLoginForm } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const { register: registerSignup, handleSubmit: handleSubmitSignup, formState: { errors: signupErrors }, reset: resetSignupForm } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema)
  });

  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors }, reset: resetResetForm } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema)
  });

  // Mode switcher
  const handleModeChange = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    resetLoginForm();
    resetSignupForm();
    resetResetForm();
  };

  // Submission Handlers
  const onLogin = async (data: LoginInput) => {
    setLoading(true);
    const toastId = toast.loading('Authenticating thought interface...');
    try {
      await login(data.email, data.password);
      toast.success('Access granted to neural index!', { id: toastId });
      navigate('/notes');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (data: SignupInput) => {
    setLoading(true);
    const toastId = toast.loading('Initializing neural thought space...');
    try {
      await signup(data.email, data.password);
      toast.success('Thought space created! Ready for sync.', { id: toastId });
      navigate('/notes');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (data: ResetInput) => {
    setLoading(true);
    const toastId = toast.loading('Sending telemetry reset key...');
    try {
      await resetPassword(data.email);
      toast.success('Password reset link sent to your inbox!', { id: toastId });
      setMode('login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const toastId = toast.loading('Connecting Google neural interface...');
    try {
      await signInWithGoogle();
      toast.success('Google Access authorized!', { id: toastId });
      navigate('/notes');
    } catch (error: any) {
      toast.error(error.message || 'Google Sign-In failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } 
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pl-24 pr-8 py-12 relative overflow-hidden text-left">
      <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-md glass-panel rounded-[32px] p-8 md:p-10 border border-white/10 shadow-[0_25px_55px_rgba(0,0,0,0.5)] relative"
        >
          {/* Subtle glowing logo badge */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <span className="font-display font-bold text-xl text-white">Æ</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              {mode === 'login' && 'Authorize Client'}
              {mode === 'signup' && 'Create Vector Space'}
              {mode === 'forgot' && 'Reset Access Key'}
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-display">
              {mode === 'login' && 'Sync notes database across all neural screens'}
              {mode === 'signup' && 'Start organizing your thoughts with premium WebGL physics'}
              {mode === 'forgot' && 'Retrieve password lock to secure your nodes'}
            </p>
          </div>

          {/* Core Forms */}
          {mode === 'login' && (
            <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/5 px-3.5 py-2.5">
                  <Mail size={16} className="text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email..."
                    {...registerLogin('email')}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-red-400 text-2xs font-semibold px-2 font-display">{loginErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/5 px-3.5 py-2.5">
                  <Lock size={16} className="text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter password..."
                    {...registerLogin('password')}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
                  />
                </div>
                {loginErrors.password && (
                  <p className="text-red-400 text-2xs font-semibold px-2 font-display">{loginErrors.password.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  className="text-purple-400 hover:text-white transition-colors font-display font-medium"
                >
                  Forgot Lock Key?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-display font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Authorize Login</span>
                <ArrowRight size={16} />
              </motion.button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSubmitSignup(onSignup)} className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/5 px-3.5 py-2.5">
                  <Mail size={16} className="text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email..."
                    {...registerSignup('email')}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
                  />
                </div>
                {signupErrors.email && (
                  <p className="text-red-400 text-2xs font-semibold px-2 font-display">{signupErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/5 px-3.5 py-2.5">
                  <Lock size={16} className="text-slate-400" />
                  <input
                    type="password"
                    placeholder="Create password..."
                    {...registerSignup('password')}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
                  />
                </div>
                {signupErrors.password && (
                  <p className="text-red-400 text-2xs font-semibold px-2 font-display">{signupErrors.password.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/5 px-3.5 py-2.5">
                  <Lock size={16} className="text-slate-400" />
                  <input
                    type="password"
                    placeholder="Confirm password..."
                    {...registerSignup('confirmPassword')}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
                  />
                </div>
                {signupErrors.confirmPassword && (
                  <p className="text-red-400 text-2xs font-semibold px-2 font-display">{signupErrors.confirmPassword.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-display font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Initialize Space</span>
                <ArrowRight size={16} />
              </motion.button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleSubmitReset(onReset)} className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/5 px-3.5 py-2.5">
                  <Mail size={16} className="text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter email..."
                    {...registerReset('email')}
                    className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
                  />
                </div>
                {resetErrors.email && (
                  <p className="text-red-400 text-2xs font-semibold px-2 font-display">{resetErrors.email.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-display font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <span>Send Reset Key</span>
                <ArrowRight size={16} />
              </motion.button>
            </form>
          )}

          {/* Social Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-white/5" />
            <span className="relative px-3 bg-[#0d0c1c] text-slate-600 text-[10px] uppercase font-bold tracking-widest font-display">OR</span>
          </div>

          {/* Google SSO Button */}
          <motion.button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-200 font-display font-semibold text-sm flex items-center justify-center space-x-2.5 shadow-md transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-purple-400 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.025c1.52 0 2.97.538 4.1 1.524l3.003-3.002C19.176 3.164 16.657 2 13.99 2 8.134 2 3.5 6.634 3.5 12.5S8.134 23 13.99 23c5.65 0 9.87-3.97 9.87-9.87 0-.6-.08-1.25-.23-1.745l-11.39-.1z"/>
            </svg>
            <span>Sign in with Google</span>
          </motion.button>

          {/* Guest Mode Bypass */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                enterGuestMode();
                navigate('/notes');
              }}
              className="text-slate-400 hover:text-white transition-colors font-display text-xs font-semibold"
            >
              Continue as Guest (Offline Mode)
            </button>
          </div>

          {/* Switch Footer */}
          <div className="mt-8 text-center text-xs text-slate-500 font-display font-medium">
            {mode === 'login' && (
              <>
                New user?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className="text-purple-400 hover:text-white transition-colors"
                >
                  Create an account
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-purple-400 hover:text-white transition-colors"
                >
                  Authorize login
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="text-purple-400 hover:text-white transition-colors"
              >
                Back to authorization
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
