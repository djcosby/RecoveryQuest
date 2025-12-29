
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LibraryBook, Chapter } from '../types';
import { PRESET_BOOKS } from '../constants';

interface LibraryContextType {
  library: LibraryBook[];
  activeBookId: string | null;
  setActiveBookId: (id: string | null) => void;
  uploadBook: (file: File) => Promise<void>;
  updateBookProgress: (bookId: string, progress: number) => void;
  markChapterQuizComplete: (bookId: string, chapterId: string, score: number) => void;
  deleteBook: (bookId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);
const LIBRARY_STORAGE_KEY = 'rq_library_v2';

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<LibraryBook[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Merge presets with saved to ensure presets always exist/update, but keep user uploads
          const uploads = parsed.filter((b: LibraryBook) => b.type === 'upload');
          // Start with fresh presets from constants to ensure content updates apply
          // Use saved progress/stats if available
          const mergedPresets = PRESET_BOOKS.map(pb => {
              const savedPb = parsed.find((b: LibraryBook) => b.id === pb.id);
              if (savedPb) {
                  return { 
                      ...pb, 
                      progress: savedPb.progress,
                      quizzesTaken: savedPb.quizzesTaken || 0,
                      masteryLevel: savedPb.masteryLevel || 0,
                      chapters: pb.chapters.map(ch => {
                        const savedCh = savedPb.chapters.find((sCh: Chapter) => sCh.id === ch.id);
                        return savedCh ? { ...ch, quizCompleted: savedCh.quizCompleted, lastScore: savedCh.lastScore } : ch;
                      })
                  };
              }
              return pb;
          });
          return [...mergedPresets, ...uploads];
        } catch (e) {
          console.error("Failed to parse library", e);
        }
      }
    }
    return PRESET_BOOKS;
  });

  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
    }
  }, [library]);

  const uploadBook = async (file: File) => {
    // Simple text extraction simulation
    const text = await file.text();
    
    const newBook: LibraryBook = {
      id: `upload_${Date.now()}`,
      title: file.name.replace(/\.txt$|\.md$/i, ''),
      author: 'You',
      coverEmoji: '📄',
      description: 'Personal upload.',
      type: 'upload',
      progress: 0,
      isVerified: false,
      themeColor: 'bg-slate-500',
      uploadedAt: new Date().toISOString(),
      quizzesTaken: 0,
      masteryLevel: 0,
      chapters: [
        {
          id: `ch_1_${Date.now()}`,
          title: 'Full Text',
          content: text
        }
      ]
    };
    
    setLibrary(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
  };

  const updateBookProgress = (bookId: string, progress: number) => {
    setLibrary(prev => prev.map(b => b.id === bookId ? { ...b, progress: Math.min(100, Math.max(0, progress)) } : b));
  };

  const markChapterQuizComplete = (bookId: string, chapterId: string, score: number) => {
    setLibrary(prev => prev.map(b => {
      if (b.id !== bookId) return b;
      
      const newChapters = b.chapters.map(ch => 
        ch.id === chapterId ? { ...ch, quizCompleted: true, lastScore: score } : ch
      );
      
      const completedCount = newChapters.filter(ch => ch.quizCompleted).length;
      const totalChapters = newChapters.length;
      const mastery = Math.round((completedCount / totalChapters) * 5); // 0-5 scale mastery

      return { 
        ...b, 
        chapters: newChapters,
        quizzesTaken: b.quizzesTaken + 1,
        masteryLevel: Math.max(b.masteryLevel, mastery)
      };
    }));
  };

  const deleteBook = (bookId: string) => {
    setLibrary(prev => prev.filter(b => b.id !== bookId));
    if (activeBookId === bookId) setActiveBookId(null);
  };

  return (
    <LibraryContext.Provider value={{ library, activeBookId, setActiveBookId, uploadBook, updateBookProgress, markChapterQuizComplete, deleteBook }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibraryStore = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibraryStore must be used within LibraryProvider");
  return context;
};