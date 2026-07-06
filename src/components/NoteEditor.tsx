import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Eye, Edit2, Heading1, Heading2, Bold, Italic, Code, ListTodo, Table, Highlighter, Undo, Redo, RefreshCw, Check } from 'lucide-react'
import { useNotesStore } from '../store/useNotesStore'

interface NoteEditorProps {
  noteId: string | null; // Null means create new
  onClose: () => void;
}

const colorPresets = [
  { value: '#a855f7', name: 'Purple' },
  { value: '#6366f1', name: 'Indigo' },
  { value: '#3b82f6', name: 'Blue' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#ec4899', name: 'Pink' }
];

export const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onClose }) => {
  const { notes, addNote, updateNote, syncStatus, setSyncStatus } = useNotesStore();
  const isEditingExisting = noteId !== null;

  // Retrieve current note or default to empty
  const currentNote = noteId !== null 
    ? notes.find((n) => n.id === noteId) 
    : null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#a855f7');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  // Undo/Redo history stack state
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoActionRef = useRef(false);
  const keystrokeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save refs and state
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedStateRef = useRef({ title: '', content: '', color: '', tags: [] as string[] });
  
  // Track synchronization initialization
  const hasInitializedRef = useRef(false);
  const lastNoteIdRef = useRef<string | null>(null);

  // Initialize values when note changes
  useEffect(() => {
    // If noteId changes from one ID to a different ID, reset initialization lock
    const noteIdChanged = lastNoteIdRef.current !== null && noteId !== null && lastNoteIdRef.current !== noteId;
    
    if (!hasInitializedRef.current || noteIdChanged) {
      if (currentNote) {
        setTitle(currentNote.title);
        setContent(currentNote.content);
        setColor(currentNote.color);
        setTags(currentNote.tags);
        setHistory([currentNote.content]);
        setHistoryIndex(0);
        lastSavedStateRef.current = {
          title: currentNote.title,
          content: currentNote.content,
          color: currentNote.color,
          tags: currentNote.tags
        };
        hasInitializedRef.current = true;
      } else if (noteId === null) {
        setTitle('');
        setContent('');
        setColor('#a855f7');
        setTags([]);
        setHistory(['']);
        setHistoryIndex(0);
        lastSavedStateRef.current = { title: '', content: '', color: '#a855f7', tags: [] };
        hasInitializedRef.current = true;
      }
    }
    
    lastNoteIdRef.current = noteId;
  }, [currentNote, noteId]);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (keystrokeTimerRef.current) clearTimeout(keystrokeTimerRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Content change handler pushing to history stack with debounced keystrokes
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    setSyncStatus('syncing');

    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    if (keystrokeTimerRef.current) {
      clearTimeout(keystrokeTimerRef.current);
    }

    keystrokeTimerRef.current = setTimeout(() => {
      setHistory((prev) => {
        const cleanHistory = prev.slice(0, historyIndex + 1);
        if (cleanHistory[cleanHistory.length - 1] !== newVal) {
          const updated = [...cleanHistory, newVal];
          setHistoryIndex(updated.length - 1);
          return updated;
        }
        return prev;
      });
    }, 450);
  };

  // Undo / Redo operations
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      isUndoRedoActionRef.current = true;
      setHistoryIndex(prevIndex);
      setContent(history[prevIndex]);
      setSyncStatus('syncing');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      isUndoRedoActionRef.current = true;
      setHistoryIndex(nextIndex);
      setContent(history[nextIndex]);
      setSyncStatus('syncing');
    }
  };

  // Handle keystroke shortcuts inside editor
  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      handleRedo();
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!title.trim() && !content.trim()) {
      return;
    }

    const hasChanged = 
      title !== lastSavedStateRef.current.title ||
      content !== lastSavedStateRef.current.content ||
      color !== lastSavedStateRef.current.color ||
      JSON.stringify(tags) !== JSON.stringify(lastSavedStateRef.current.tags);

    if (!hasChanged) {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('syncing');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const stateToSave = { title, content, color, tags };
      if (noteId !== null) {
        updateNote(noteId, stateToSave);
      } else {
        // Create new note, updates noteId in store causing prop change
        addNote(title || 'Untitled Note', content, tags, color);
      }
      lastSavedStateRef.current = stateToSave;
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, content, color, tags, noteId, updateNote, addNote, setSyncStatus]);

  // Synchronous force save on close to guarantee zero data loss
  const forceSave = (force: boolean = false) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const hasChanged = 
      title !== lastSavedStateRef.current.title ||
      content !== lastSavedStateRef.current.content ||
      color !== lastSavedStateRef.current.color ||
      JSON.stringify(tags) !== JSON.stringify(lastSavedStateRef.current.tags);

    if (force || (hasChanged && (title.trim() || content.trim()))) {
      const stateToSave = { title: title || 'Untitled Note', content, color, tags };
      if (noteId !== null) {
        updateNote(noteId, stateToSave);
      } else {
        addNote(stateToSave.title, content, tags, color);
      }
      lastSavedStateRef.current = stateToSave;
    }
  };

  const handleClose = (force: boolean = false) => {
    forceSave(force);
    onClose();
  };

  // Insert markdown helpers
  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    
    let replacement = '';
    if (syntax === 'bold') replacement = `**${selection || placeholder}**`;
    else if (syntax === 'italic') replacement = `*${selection || placeholder}*`;
    else if (syntax === 'code') replacement = `\`\`\`javascript\n${selection || placeholder}\n\`\`\``;
    else if (syntax === 'todo') replacement = `\n- [ ] ${selection || placeholder}`;
    else if (syntax === 'h1') replacement = `\n# ${selection || placeholder}`;
    else if (syntax === 'h2') replacement = `\n## ${selection || placeholder}`;
    else if (syntax === 'table') replacement = `\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Item 1   | Item 2   |`;
    else if (syntax === 'highlight') replacement = `==${selection || placeholder}==`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setSyncStatus('syncing');

    // Manually push programmatic update to history stack immediately
    setHistory((prev) => {
      const cleanHistory = prev.slice(0, historyIndex + 1);
      const updated = [...cleanHistory, newContent];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
    
    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagsInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagsInput.trim())) {
        setTags([...tags, tagsInput.trim()]);
      }
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const toggleChecklistItem = (lineIdx: number) => {
    const lines = content.split('\n');
    const targetLine = lines[lineIdx];
    if (targetLine.startsWith('- [ ] ')) {
      lines[lineIdx] = '- [x] ' + targetLine.substring(6);
    } else if (targetLine.startsWith('- [x] ')) {
      lines[lineIdx] = '- [ ] ' + targetLine.substring(6);
    }
    const newContent = lines.join('\n');
    handleContentChange(newContent);
  };

  // Process markdown into rich preview layout
  const renderMarkdownHTML = (text: string) => {
    if (!text) return <p className="text-slate-500 italic text-left">No content. Start writing...</p>;
    
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    return lines.map((line, idx) => {
      // Handle code block sections
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeString = codeBlockContent.join('\n');
          codeBlockContent = [];
          return (
            <pre key={idx} className="bg-slate-950/80 border border-white/5 rounded-xl p-4 my-3 font-mono text-sm overflow-x-auto text-purple-300 text-left">
              <code className="text-slate-200">{codeString}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return null;
      }

      // Title lines
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="font-display font-bold text-3xl text-white mt-6 mb-3 border-b border-white/5 pb-2 text-left">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="font-display font-semibold text-2xl text-slate-100 mt-5 mb-2 text-left">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="font-display font-semibold text-xl text-slate-200 mt-4 mb-2 text-left">{line.substring(4)}</h3>;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-purple-500 bg-purple-950/10 px-4 py-2 rounded-r-lg my-3 text-slate-300 italic text-left">
            {line.substring(2)}
          </blockquote>
        );
      }

      // Checklists
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const checked = line.startsWith('- [x] ');
        return (
          <div key={idx} className="flex items-center space-x-3 my-2 text-left">
            <input 
              type="checkbox" 
              checked={checked} 
              onChange={() => toggleChecklistItem(idx)}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/20 cursor-pointer"
            />
            <span className={`text-sm ${checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
              {line.substring(6)}
            </span>
          </div>
        );
      }

      // Normal lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-4 my-1.5 text-slate-300 text-left text-sm">
            <li>{line.substring(2)}</li>
          </ul>
        );
      }

      // Paragraph formatting (simple bold/italic/highlight inline parser)
      let formattedLine = line;
      // Bold
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Highlight
      formattedLine = formattedLine.replace(/==(.*?)==/g, '<mark class="bg-yellow-500/25 border-b border-yellow-400 text-yellow-100 px-1 rounded-sm">$1</mark>');

      return (
        <p 
          key={idx} 
          className="text-slate-300 text-sm leading-relaxed my-2 text-left"
          dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      
      {/* Toast popup */}

      {/* Editor Main Sheet */}
      <motion.div
        initial={{ y: '100%', rotateX: 18, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, scale: 1, opacity: 1 }}
        exit={{ y: '100%', rotateX: 15, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 160 }}
        className="w-full max-w-6xl h-[88vh] bg-[#0d0c1c]/95 rounded-[32px] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative"
        style={{ perspective: '1200px' }}
      >
        {/* Glow corner background */}
        <div 
          className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none -z-10 opacity-30" 
          style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
        />

        {/* Editor Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 relative z-10">
          <div className="flex items-center space-x-4">
            <span className="font-display font-bold text-lg text-white">
              {isEditingExisting ? 'Edit Note' : 'Create Futuristic Note'}
            </span>
            <div className="flex space-x-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setIsPreview(false)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                  !isPreview 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit2 size={12} />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-display transition-all ${
                  isPreview 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={12} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auto-Save telemetry status */}
            <div className="flex items-center space-x-2 bg-white/5 border border-white/5 px-3.5 py-1.5 rounded-xl text-xs font-display font-semibold select-none">
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw size={12} className="animate-spin text-amber-400" />
                  <span className="text-amber-400/90">Syncing thought vector...</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-400/90 font-medium">Sync Failed (Check Rules)</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400/90 font-medium">Synced with Cloud</span>
                </>
              )}
            </div>

            {/* Color circles */}
            <div className="flex space-x-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setColor(preset.value);
                    setSyncStatus('syncing');
                  }}
                  className="w-4 h-4 rounded-full border border-white/10 transition-transform hover:scale-125 relative"
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {color === preset.value && (
                    <span className="absolute inset-0.5 rounded-full bg-white scale-50" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {!isEditingExisting ? (
                <button
                  onClick={() => handleClose(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold font-display shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-pulse"
                >
                  <Check size={12} />
                  <span>Create Note</span>
                </button>
              ) : (
                <button
                  onClick={() => handleClose(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold font-display hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Check size={12} />
                  <span>Save & Close</span>
                </button>
              )}

              <button
                onClick={() => handleClose(false)}
                className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace Frame */}
        <div className="flex-1 flex overflow-hidden relative z-10">
          
          {/* Dual Panel Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5 h-full overflow-hidden">
            
            {/* Editor Workspace pane */}
            <div className={`h-full flex flex-col p-8 overflow-y-auto ${isPreview ? 'hidden' : 'col-span-12'}`}>
              
              {/* Note Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSyncStatus('syncing');
                }}
                placeholder="Title your thought..."
                className="w-full bg-transparent text-white font-display font-bold text-3xl border-none outline-none mb-6 placeholder-slate-600"
              />

              {/* Floating Editor Toolbar */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 mb-4 max-w-max">
                <button onClick={() => insertMarkdown('h1', 'Heading 1')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="H1"><Heading1 size={14} /></button>
                <button onClick={() => insertMarkdown('h2', 'Heading 2')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="H2"><Heading2 size={14} /></button>
                <div className="w-[1px] bg-white/5 my-1.5" />
                <button onClick={() => insertMarkdown('bold', 'bold text')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="Bold"><Bold size={14} /></button>
                <button onClick={() => insertMarkdown('italic', 'italic text')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="Italic"><Italic size={14} /></button>
                <button onClick={() => insertMarkdown('highlight', 'highlight text')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="Highlight"><Highlighter size={14} /></button>
                <div className="w-[1px] bg-white/5 my-1.5" />
                <button onClick={() => insertMarkdown('code', 'console.log("AetherNote");')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="Code Block"><Code size={14} /></button>
                <button onClick={() => insertMarkdown('todo', 'Todo task')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="Checklist"><ListTodo size={14} /></button>
                <button onClick={() => insertMarkdown('table')} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all" title="Table"><Table size={14} /></button>
                <div className="w-[1px] bg-white/5 my-1.5" />
                
                {/* Undo / Redo controls */}
                <button
                  disabled={historyIndex <= 0}
                  onClick={handleUndo}
                  className={`p-2 rounded-lg transition-all ${
                    historyIndex <= 0 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo size={14} />
                </button>
                <button
                  disabled={historyIndex >= history.length - 1}
                  onClick={handleRedo}
                  className={`p-2 rounded-lg transition-all ${
                    historyIndex >= history.length - 1 
                      ? 'text-slate-600 cursor-not-allowed' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo size={14} />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                id="editor-textarea"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleTextAreaKeyDown}
                placeholder="Write markdown here... Supports code blocks, checkboxes (- [ ] task), highlights (==text==), and tables..."
                className="w-full flex-1 bg-transparent text-slate-300 font-mono text-sm leading-relaxed border-none outline-none resize-none placeholder-slate-700 focus:ring-0"
              />

              {/* Tags Input footer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-display font-medium">Tags:</span>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-xs font-semibold"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => {
                        handleRemoveTag(tag);
                        setSyncStatus('syncing');
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Press enter to add..."
                  className="bg-transparent border-none outline-none text-slate-300 text-xs placeholder-slate-600 min-w-[120px]"
                />
              </div>

            </div>

            {/* Live Markdown Preview pane */}
            <div className={`h-full flex flex-col p-8 overflow-y-auto ${isPreview ? 'col-span-12' : 'hidden'}`}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-display mb-6">Live Output Preview</div>
              
              <div className="flex-1 pb-12">
                <h1 className="font-display font-bold text-3xl text-white mb-6 border-b border-white/5 pb-2 text-left">
                  {title || 'Untitled Note'}
                </h1>
                <div className="prose prose-invert max-w-none">
                  {renderMarkdownHTML(content)}
                </div>
              </div>
            </div>

          </div>

        </div>
      </motion.div>

    </div>
  );
};

export default NoteEditor;
