import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FolderOpen, Heart, Archive, Trash, Tag, Plus, Sparkles } from 'lucide-react'
import { useNotesStore } from '../store/useNotesStore'
import type { ViewType } from '../store/useNotesStore'
import { NoteCard } from '../components/NoteCard'
import { NoteEditor } from '../components/NoteEditor'

export const NotesPage: React.FC = () => {
  const {
    activeView,
    selectedTag,
    searchQuery,
    editingNoteId,
    isCreating,
    setActiveView,
    setSelectedTag,
    setSearchQuery,
    setEditingNoteId,
    setIsCreating,
    getFilteredNotes,
    getAllTags
  } = useNotesStore();

  const location = useLocation();

  useEffect(() => {
    if (location.state && (location.state as any).triggerCreate) {
      setIsCreating(true);
      window.history.replaceState({}, document.title);
    }
  }, [location, setIsCreating]);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const filteredNotes = getFilteredNotes();
  const allTags = getAllTags();

  // Switcher configurations
  const navigationItems = [
    { view: 'all' as ViewType, label: 'All Thoughts', icon: <Sparkles size={16} /> },
    { view: 'pinned' as ViewType, label: 'Pinned', icon: <Plus size={16} className="rotate-45" /> },
    { view: 'favorites' as ViewType, label: 'Favorites', icon: <Heart size={16} /> },
    { view: 'archived' as ViewType, label: 'Archived', icon: <Archive size={16} /> },
    { view: 'trash' as ViewType, label: 'Trash', icon: <Trash size={16} /> }
  ];

  // Helper search suggestions matching tags or title keywords
  const getSuggestions = () => {
    if (!searchQuery) return [];
    return allTags.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4);
  };

  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen pl-24 pr-8 py-10 relative z-10">
      
      {/* Cinematic Editor Modal Popup */}
      <AnimatePresence>
        {(isCreating || editingNoteId !== null) && (
          <NoteEditor
            noteId={editingNoteId}
            onClose={() => {
              setIsCreating(false);
              setEditingNoteId(null);
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Floating Control Panel (Sub-Sidebar) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 90 }}
          className="w-full lg:w-[280px] shrink-0 space-y-6"
        >
          {/* Create thought CTA */}
          <motion.button
            onClick={() => setIsCreating(true)}
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-display font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/10 cursor-pointer"
          >
            <Plus size={18} />
            <span>New Thought</span>
          </motion.button>

          {/* Premium Search Card */}
          <div className="glass-panel rounded-2xl p-4 space-y-2 relative">
            <div 
              className={`flex items-center space-x-3 bg-white/5 rounded-xl border px-3.5 py-2.5 transition-all duration-300 ${
                isSearchFocused 
                  ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-purple-950/10' 
                  : 'border-white/5'
              }`}
            >
              <motion.span
                animate={isSearchFocused ? { rotate: 15, scale: 1.1, color: '#c084fc' } : { rotate: 0, scale: 1 }}
                className="text-slate-400"
              >
                <Search size={16} />
              </motion.span>
              <input
                type="text"
                placeholder="Search index..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-600 focus:ring-0"
              />
            </div>

            {/* Suggestions animation list */}
            <AnimatePresence>
              {isSearchFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute left-4 right-4 top-full mt-2 bg-slate-900/95 border border-white/10 rounded-xl p-2 shadow-2xl z-30 space-y-1 backdrop-blur-md"
                >
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-display px-2 py-1 font-bold">Suggested Tags</div>
                  {suggestions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTag(tag);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                    >
                      <Tag size={10} />
                      <span>#{tag}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation/Views List */}
          <div className="glass-panel rounded-2xl p-4">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 px-2">Folders</h4>
            <div className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = activeView === item.view && !selectedTag;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-display transition-all ${
                      isActive 
                        ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                        : 'bg-transparent border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Cloud Card */}
          {allTags.length > 0 && (
            <div className="glass-panel rounded-2xl p-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500">Filter Tags</h4>
                {selectedTag && (
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-purple-400 hover:text-white font-display font-bold transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isTagSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(isTagSelected ? null : tag)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-display border transition-all ${
                        isTagSelected 
                          ? 'bg-purple-600/30 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/10' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <Tag size={10} />
                      <span>#{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>

        {/* Right Side: Notes grid display */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Header Status Bar */}
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h2 className="font-display font-bold text-2xl text-white">
                {selectedTag 
                  ? `Notes Tagged #${selectedTag}` 
                  : navigationItems.find(n => n.view === activeView)?.label || 'AetherNote Index'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-display font-medium">
                Showing {filteredNotes.length} matching thought records
              </p>
            </div>
          </div>

          {/* Note Grid list with custom layouts */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: 12 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                >
                  <NoteCard
                    note={note}
                    onEdit={() => setEditingNoteId(note.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty Workspace Indicator */}
          {filteredNotes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto mt-12 border border-white/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                <FolderOpen size={28} />
              </div>
              <div className="space-y-1.5 text-center">
                <h3 className="font-display font-semibold text-lg text-white">Empty Thought Record</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  No note files match the current folder filters. Create a new thought vector to begin.
                </p>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 font-display font-semibold text-xs text-white rounded-xl shadow-lg transition-all"
              >
                Assemble Note
              </button>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
};

export default NotesPage;
