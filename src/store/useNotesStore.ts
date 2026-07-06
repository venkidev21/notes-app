import { create } from 'zustand'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  archived: boolean;
  trash: boolean;
  favorite: boolean;
  color: string;
  tags: string[];
  dateCreated: string;
  dateModified: string;
  userId?: string;
}

export type ViewType = 'all' | 'pinned' | 'archived' | 'trash' | 'favorites';

interface NotesState {
  notes: Note[];
  activeView: ViewType;
  selectedTag: string | null;
  searchQuery: string;
  editingNoteId: string | null;
  isCreating: boolean;
  userId: string | null;
  unsubscribeListener: (() => void) | null;
  syncStatus: 'synced' | 'syncing' | 'error';
  setSyncStatus: (status: 'synced' | 'syncing' | 'error') => void;
  
  // Actions
  syncNotes: (userId: string | null) => void;
  addNote: (title: string, content: string, tags?: string[], color?: string) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: ViewType) => void;
  setSelectedTag: (tag: string | null) => void;
  setEditingNoteId: (id: string | null) => void;
  setIsCreating: (isCreating: boolean) => void;
  
  // Helper selectors
  getFilteredNotes: () => Note[];
  getAllTags: () => string[];
}

const initialNotes: Note[] = [];

const LOCAL_STORAGE_KEY = 'aethernote_local_notes';

const loadLocalNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading notes from localStorage', e);
  }
  return initialNotes;
};

const saveLocalNotes = (notes: Note[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving notes to localStorage', e);
  }
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  activeView: 'all',
  selectedTag: null,
  searchQuery: '',
  editingNoteId: null,
  isCreating: false,
  userId: null,
  unsubscribeListener: null,
  syncStatus: 'synced',
  setSyncStatus: (syncStatus) => set({ syncStatus }),

  syncNotes: (userId) => {
    // 1. Unsubscribe existing listener if any
    const existingUnsubscribe = get().unsubscribeListener;
    if (existingUnsubscribe) {
      existingUnsubscribe();
    }

    set({ userId });

    if (db && userId && userId !== 'guest_user') {
      // 2. Authenticated mode: Sync with Firestore realtime queries
      set({ syncStatus: 'syncing' });

      // Load local cache notes first so the user has immediate access
      const localNotes = loadLocalNotes();
      set({ notes: localNotes });

      const q = query(
        collection(db, 'notes'),
        where('userId', '==', userId),
        orderBy('dateModified', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Note[];
        set({ notes, syncStatus: 'synced' });
        saveLocalNotes(notes);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        set({ syncStatus: 'error' });
      });

      set({ unsubscribeListener: unsubscribe });
    } else {
      // 3. Guest/Offline mode: Load from local storage
      const localNotes = loadLocalNotes();
      set({ notes: localNotes, unsubscribeListener: null });
    }
  },

  addNote: (title, content, tags = [], color = '#a855f7') => {
    const { userId, notes } = get();
    const id = (db && userId && userId !== 'guest_user') ? doc(collection(db, 'notes')).id : Date.now().toString();

    const newNote: Note = {
      id,
      title: title || 'Untitled Note',
      content: content || '',
      pinned: false,
      archived: false,
      trash: false,
      favorite: false,
      color,
      tags,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString()
    };

    if (db && userId && userId !== 'guest_user') {
      newNote.userId = userId;
    }

    // Optimistically update local state and localStorage cache first
    const updatedNotes = [newNote, ...notes];
    set({ notes: updatedNotes, syncStatus: 'syncing' });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      // Push asynchronously to Firestore
      setDoc(doc(db, 'notes', id), newNote)
        .then(() => set({ syncStatus: 'synced' }))
        .catch((e) => {
          console.error('Error adding note to firestore', e);
          set({ syncStatus: 'error' });
        });
    } else {
      set({ syncStatus: 'synced' });
    }

    set({ 
      isCreating: false, 
      editingNoteId: id,
      activeView: 'all',
      selectedTag: null,
      searchQuery: ''
    });
    return id;
  },

  updateNote: (id, updates) => {
    const { userId, notes } = get();
    const dateModified = new Date().toISOString();

    // Optimistically update local state and localStorage cache first
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, ...updates, dateModified } : note
    );
    set({ notes: updatedNotes, syncStatus: 'syncing' });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      updateDoc(doc(db, 'notes', id), {
        ...updates,
        dateModified
      })
        .then(() => set({ syncStatus: 'synced' }))
        .catch((e) => {
          console.error('Error updating note in firestore', e);
          set({ syncStatus: 'error' });
        });
    } else {
      set({ syncStatus: 'synced' });
    }
  },

  deleteNote: (id) => {
    const { userId, notes } = get();
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    // Optimistically update local state and localStorage cache first
    let updatedNotes: Note[];
    if (note.trash) {
      updatedNotes = notes.filter((n) => n.id !== id);
    } else {
      updatedNotes = notes.map((n) =>
        n.id === id
          ? { ...n, trash: true, pinned: false, archived: false, dateModified: new Date().toISOString() }
          : n
      );
    }
    set({
      notes: updatedNotes,
      syncStatus: 'syncing',
      editingNoteId: get().editingNoteId === id ? null : get().editingNoteId
    });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      if (note.trash) {
        deleteDoc(doc(db, 'notes', id))
          .then(() => set({ syncStatus: 'synced' }))
          .catch((e) => {
            console.error('Error hard deleting note', e);
            set({ syncStatus: 'error' });
          });
      } else {
        updateDoc(doc(db, 'notes', id), {
          trash: true,
          pinned: false,
          archived: false,
          dateModified: new Date().toISOString()
        })
          .then(() => set({ syncStatus: 'synced' }))
          .catch((e) => {
            console.error('Error soft deleting note', e);
            set({ syncStatus: 'error' });
          });
      }
    } else {
      set({ syncStatus: 'synced' });
    }
  },

  restoreNote: (id) => {
    const { userId, notes } = get();
    const dateModified = new Date().toISOString();

    // Optimistically update local state and localStorage cache first
    const updatedNotes = notes.map((note) =>
      note.id === id
        ? { ...note, trash: false, archived: false, dateModified }
        : note
    );
    set({ notes: updatedNotes, syncStatus: 'syncing' });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      updateDoc(doc(db, 'notes', id), {
        trash: false,
        archived: false,
        dateModified
      })
        .then(() => set({ syncStatus: 'synced' }))
        .catch((e) => {
          console.error('Error restoring note', e);
          set({ syncStatus: 'error' });
        });
    } else {
      set({ syncStatus: 'synced' });
    }
  },

  togglePin: (id) => {
    const { userId, notes } = get();
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const dateModified = new Date().toISOString();

    // Optimistically update local state and localStorage cache first
    const updatedNotes = notes.map((n) =>
      n.id === id
        ? { ...n, pinned: !n.pinned, archived: false, trash: false, dateModified }
        : n
    );
    set({ notes: updatedNotes, syncStatus: 'syncing' });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      updateDoc(doc(db, 'notes', id), {
        pinned: !note.pinned,
        archived: false,
        trash: false,
        dateModified
      })
        .then(() => set({ syncStatus: 'synced' }))
        .catch((e) => {
          console.error('Error toggling pin', e);
          set({ syncStatus: 'error' });
        });
    } else {
      set({ syncStatus: 'synced' });
    }
  },

  toggleFavorite: (id) => {
    const { userId, notes } = get();
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const dateModified = new Date().toISOString();

    // Optimistically update local state and localStorage cache first
    const updatedNotes = notes.map((n) =>
      n.id === id ? { ...n, favorite: !n.favorite, dateModified } : n
    );
    set({ notes: updatedNotes, syncStatus: 'syncing' });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      updateDoc(doc(db, 'notes', id), {
        favorite: !note.favorite,
        dateModified
      })
        .then(() => set({ syncStatus: 'synced' }))
        .catch((e) => {
          console.error('Error toggling favorite', e);
          set({ syncStatus: 'error' });
        });
    } else {
      set({ syncStatus: 'synced' });
    }
  },

  toggleArchive: (id) => {
    const { userId, notes } = get();
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const dateModified = new Date().toISOString();

    // Optimistically update local state and localStorage cache first
    const updatedNotes = notes.map((n) =>
      n.id === id
        ? { ...n, archived: !n.archived, pinned: false, trash: false, dateModified }
        : n
    );
    set({ notes: updatedNotes, syncStatus: 'syncing' });
    saveLocalNotes(updatedNotes);

    if (db && userId && userId !== 'guest_user') {
      updateDoc(doc(db, 'notes', id), {
        archived: !note.archived,
        pinned: false,
        trash: false,
        dateModified
      })
        .then(() => set({ syncStatus: 'synced' }))
        .catch((e) => {
          console.error('Error toggling archive', e);
          set({ syncStatus: 'error' });
        });
    } else {
      set({ syncStatus: 'synced' });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setActiveView: (view) => {
    set({ activeView: view, selectedTag: null });
  },

  setSelectedTag: (tag) => {
    set({ selectedTag: tag });
  },

  setEditingNoteId: (id) => {
    set({ editingNoteId: id });
  },

  setIsCreating: (isCreating) => {
    set({ isCreating });
  },

  getFilteredNotes: () => {
    const { notes, activeView, selectedTag, searchQuery } = get();
    
    return notes.filter((note) => {
      // 1. View filter
      if (activeView === 'trash') {
        if (!note.trash) return false;
      } else {
        if (note.trash) return false;
        
        if (activeView === 'pinned' && !note.pinned) return false;
        if (activeView === 'archived' && !note.archived) return false;
        if (activeView === 'favorites' && !note.favorite) return false;
        
        // General all view should hide archived notes by default
        if (activeView === 'all' && note.archived) return false;
      }
      
      // 2. Tag filter
      if (selectedTag && !note.tags.includes(selectedTag)) return false;
      
      // 3. Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content.toLowerCase().includes(query);
        const matchesTags = note.tags.some(tag => tag.toLowerCase().includes(query));
        return matchesTitle || matchesContent || matchesTags;
      }
      
      return true;
    });
  },

  getAllTags: () => {
    const { notes } = get();
    const tagsSet = new Set<string>();
    notes.forEach((note) => {
      if (!note.trash && !note.archived) {
        note.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }
}));
