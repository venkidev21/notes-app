import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, BookOpen, BarChart3, Settings, Plus, CornerDownLeft, FileText } from 'lucide-react';
import { useNotesStore } from '../store/useNotesStore';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { notes, setIsCreating, setEditingNoteId } = useNotesStore();
  const navigate = useNavigate();
  const location = useLocation();
  const listRef = useRef<HTMLDivElement>(null);

  // Global listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQueryText('');
        setSelectedIndex(0);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Filter commands
  const getCommands = () => {
    const staticCommands = [
      {
        id: 'nav-home',
        title: 'Navigate to Home',
        subtitle: 'Go to landing screen',
        icon: <Sparkles size={16} />,
        action: () => navigate('/')
      },
      {
        id: 'nav-notes',
        title: 'Navigate to Notes Workspace',
        subtitle: 'View your indexed thoughts',
        icon: <BookOpen size={16} />,
        action: () => navigate('/notes')
      },
      {
        id: 'nav-dashboard',
        title: 'Navigate to Analytics Dashboard',
        subtitle: 'Review telemetry and metrics',
        icon: <BarChart3 size={16} />,
        action: () => navigate('/dashboard')
      },
      {
        id: 'nav-settings',
        title: 'Navigate to Settings',
        subtitle: 'Configure spatial shaders and security',
        icon: <Settings size={16} />,
        action: () => navigate('/settings')
      },
      {
        id: 'create-note',
        title: 'Create New Thought Vector',
        subtitle: 'Assemble a blank note file',
        icon: <Plus size={16} />,
        action: () => {
          if (location.pathname !== '/notes') {
            navigate('/notes');
          }
          setIsCreating(true);
        }
      }
    ];

    // Add matching notes
    const matchingNotes = notes
      .filter((note) => !note.trash && !note.archived)
      .filter((note) =>
        note.title.toLowerCase().includes(queryText.toLowerCase()) ||
        note.content.toLowerCase().includes(queryText.toLowerCase())
      )
      .slice(0, 5)
      .map((note) => ({
        id: `note-${note.id}`,
        title: note.title || 'Untitled Note',
        subtitle: `Jump to editing this note`,
        icon: <FileText size={16} style={{ color: note.color }} />,
        action: () => {
          if (location.pathname !== '/notes') {
            navigate('/notes');
          }
          setEditingNoteId(note.id);
        }
      }));

    // Filter static commands by query
    const filteredStatic = staticCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(queryText.toLowerCase()) ||
        cmd.subtitle.toLowerCase().includes(queryText.toLowerCase())
    );

    return [...filteredStatic, ...matchingNotes];
  };

  const commands = getCommands();

  // Handle key navigation within palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commands[selectedIndex]) {
          commands[selectedIndex].action();
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commands, selectedIndex]);

  // Adjust scroll position of list item on arrow navigation
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Palette Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="w-full max-w-xl bg-[#0d0c1c]/95 border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative z-10"
          >
            {/* Command Input */}
            <div className="flex items-center space-x-3 px-4 py-3.5 border-b border-white/5 bg-white/2">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search notes..."
                value={queryText}
                onChange={(e) => {
                  setQueryText(e.target.value);
                  setSelectedIndex(0);
                }}
                className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
              />
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-600 font-mono">ESC</span>
            </div>

            {/* Commands List */}
            <div
              ref={listRef}
              className="max-h-[320px] overflow-y-auto p-2 space-y-0.5 divide-y divide-transparent"
            >
              {commands.length > 0 ? (
                commands.map((cmd, idx) => {
                  const isActive = selectedIndex === idx;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all text-left group ${
                        isActive
                          ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                          : 'bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/3'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`p-1.5 rounded-lg ${isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                          {cmd.icon}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold font-display text-slate-200 group-hover:text-white transition-colors">{cmd.title}</p>
                          <p className="text-[10px] text-slate-500">{cmd.subtitle}</p>
                        </div>
                      </div>
                      
                      {isActive && (
                        <motion.span
                          layoutId="active-command-indicator"
                          className="flex items-center text-[10px] text-purple-400 font-mono space-x-1"
                        >
                          <span>Execute</span>
                          <CornerDownLeft size={10} />
                        </motion.span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-600 font-display space-y-1">
                  <p className="text-sm font-semibold">No commands found</p>
                  <p className="text-xs">Try searching navigation paths or note titles</p>
                </div>
              )}
            </div>

            {/* Quick Keyboard shortcuts footer */}
            <div className="px-4 py-2 bg-white/2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-mono">
              <div className="flex space-x-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
              </div>
              <span>Open anywhere with Ctrl+K</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
