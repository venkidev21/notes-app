import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Pin, Trash2, Archive, Star, Clock, RefreshCw } from 'lucide-react'
import { useNotesStore } from '../store/useNotesStore'
import type { Note } from '../store/useNotesStore'
import { useSettingsStore } from '../store/useSettingsStore'


interface NoteCardProps {
  note: Note;
  onEdit: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit }) => {
  const { togglePin, toggleFavorite, toggleArchive, deleteNote, restoreNote } = useNotesStore();
  const parallax = useSettingsStore((state) => state.parallax);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  
  const [isPinning, setIsPinning] = useState(false);

  // Mouse Parallax 3D tilt calculations
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const isEco = parallax === 'eco';
    
    // Tilt limit of 10 degrees (disabled in eco mode)
    const rotateY = isEco ? 0 : ((x - xc) / xc) * 10;
    const rotateX = isEco ? 0 : ((yc - y) / yc) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    card.style.boxShadow = `
      0 20px 40px -15px ${note.color}45, 
      0 0 25px 2px ${note.color}15, 
      inset 0 1px 2px rgba(255, 255, 255, 0.15)
    `;
    
    // Move the lighting gradient reflection (disabled in eco mode)
    if (glowRef.current && !isEco) {
      const percentageX = (x / rect.width) * 100;
      const percentageY = (y / rect.height) * 100;
      glowRef.current.style.background = `radial-gradient(circle at ${percentageX}% ${percentageY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    card.style.boxShadow = `
      0 8px 30px -10px ${note.color}25,
      inset 0 1px 1px rgba(255, 255, 255, 0.05)
    `;
    
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)`;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(note.id);
  };

  // Trigger pin vibration/animation
  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!note.pinned) {
      setIsPinning(true);
      setTimeout(() => setIsPinning(false), 500);
    }
    togglePin(note.id);
  };

  // Strip markdown markers for card previews
  const getExcerpt = (text: string) => {
    const cleanText = text
      .replace(/#+\s+/g, '')       // Remove headers
      .replace(/\[[x\s]\]\s+/g, '') // Remove checklists
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
      .replace(/>\s+/g, '')        // Remove blockquotes
      .replace(/[*_`]/g, '');      // Remove style symbols
    return cleanText.substring(0, 110) + (cleanText.length > 110 ? '...' : '');
  };

  // Render Date preview
  const formattedDate = new Date(note.dateModified).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={false}
      animate={
        isPinning
          ? { 
              y: [0, -3, 3, -1, 1, 0], 
              scale: [1, 1.01, 0.99, 1.01, 1],
              transition: { duration: 0.4 } 
            }
          : { scale: 1, opacity: 1, y: 0 }
      }
      className={`w-full relative glass-panel-interactive rounded-[24px] paper-texture flex flex-col p-6 select-none border border-white/5 ${
        note.trash ? 'cursor-default' : 'cursor-pointer'
      }`}
      onClick={() => {
        if (!note.trash) {
          onEdit();
        }
      }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: '220px',
        borderLeft: `4px solid ${note.color}`,
        boxShadow: `0 8px 30px -10px ${note.color}20, inset 0 1px 1px rgba(255, 255, 255, 0.05)`
      }}
    >
      {/* Dynamic light reflection layer */}
      <div ref={glowRef} className="light-reflection absolute inset-0 transition-all duration-300 pointer-events-none opacity-60 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_60%)]" />

      {/* Folded Corner flap */}
      <div className="absolute top-0 right-0 w-7 h-7 overflow-hidden pointer-events-none z-10">
        <div 
          className="absolute top-0 right-0 w-10 h-10 origin-bottom-left rotate-45 transform translate-x-[7px] -translate-y-[17px] shadow-lg border-l border-b"
          style={{
            backgroundColor: 'rgba(15, 14, 30, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.15)'
          }}
        />
      </div>

      {/* Floating Pushpin SVG */}
      {note.pinned && (
        <motion.div 
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: -16, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 120 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          {/* 3D Looking Pin Design */}
          <svg width="24" height="42" viewBox="0 0 24 42" fill="none" className="drop-shadow-[0_8px_4px_rgba(0,0,0,0.6)]">
            {/* Pin Head */}
            <ellipse cx="12" cy="10" rx="7" ry="6" fill={note.color} fillOpacity="0.85" />
            <path d="M5 10C5 6.68629 8.13401 4 12 4C15.866 4 19 6.68629 19 10C19 12.5 17 14.5 15 15H9C7 14.5 5 12.5 5 10Z" fill={note.color} />
            {/* Pin Neck */}
            <rect x="10.5" y="15" width="3" height="6" fill="#cbd5e1" />
            {/* Pin Shaft */}
            <line x1="12" y1="21" x2="12" y2="40" stroke="#cbd5e1" strokeWidth="2.0" />
            {/* Reflection Highlight */}
            <ellipse cx="12" cy="8" rx="3" ry="1.5" fill="#ffffff" fillOpacity="0.6" />
          </svg>
        </motion.div>
      )}

      {/* Note Header Title */}
      <div className="flex justify-between items-start gap-4 mb-3 relative z-10 mt-1">
        <h3 className="font-display font-semibold text-lg text-white group-hover:text-purple-300 transition-colors line-clamp-1">
          {note.title}
        </h3>
      </div>

      {/* Preview Excerpt */}
      <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1 text-left line-clamp-4 relative z-10 pointer-events-none">
        {getExcerpt(note.content)}
      </p>

      {/* Tags section */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
          {note.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-slate-400 relative z-10 text-xs">
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{formattedDate}</span>
        </div>
        
        {note.trash ? (
          <div className="flex items-center space-x-2">
            {/* Restore trigger */}
            <button 
              onClick={(e) => { e.stopPropagation(); restoreNote(note.id); }}
              className="px-2.5 py-1 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/35 hover:text-white transition-all text-2xs font-semibold font-display flex items-center space-x-1 cursor-pointer"
              title="Restore Note"
            >
              <RefreshCw size={10} />
              <span>Restore</span>
            </button>

            {/* Permanent Delete trigger */}
            <button 
              onClick={handleDelete}
              className="px-2.5 py-1 rounded-xl bg-red-950/20 border border-red-900/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all text-2xs font-semibold font-display flex items-center space-x-1 cursor-pointer"
              title="Delete Permanently"
            >
              <Trash2 size={10} />
              <span>Delete Permanently</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {/* Pin trigger */}
            <button 
              onClick={handlePinToggle}
              className={`p-1.5 rounded-lg border transition-all ${
                note.pinned 
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
              title={note.pinned ? "Unpin Note" : "Pin Note"}
            >
              <Pin size={13} className={note.pinned ? 'rotate-45' : ''} />
            </button>

            {/* Favorite trigger */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}
              className={`p-1.5 rounded-lg border transition-all ${
                note.favorite 
                  ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
              title="Favorite"
            >
              <Star size={13} fill={note.favorite ? 'currentColor' : 'none'} />
            </button>

            {/* Archive trigger */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleArchive(note.id); }}
              className="p-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
              title="Archive"
            >
              <Archive size={13} />
            </button>

            {/* Delete trigger */}
            <button 
              onClick={handleDelete}
              className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all"
              title="Delete Note"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoteCard;
