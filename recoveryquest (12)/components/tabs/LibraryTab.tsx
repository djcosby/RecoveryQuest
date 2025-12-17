
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, BookOpen, Brain, Sparkles, MessageSquare, Trophy, ChevronRight, ChevronLeft, 
  Upload, Search, Loader2, CheckCircle, Trash2, Star, Volume2, StopCircle
} from 'lucide-react';
import { useLibraryStore } from '../../context/LibraryContext';
import { useUserStore } from '../../context/UserContext';
import { LibraryBook, BookSkin, GeneratedQuiz, QuizQuestion } from '../../types';
import { analyzeTextWithSkin, generateQuizFromText, generateSpeech, decodeBase64ToBytes, decodePCMData } from '../../services/geminiService';

// --- READER COMPONENT ---

interface ReaderModalProps {
  book: LibraryBook;
  onClose: () => void;
}

const ReaderModal: React.FC<ReaderModalProps> = ({ book, onClose }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeSkin, setActiveSkin] = useState<BookSkin>('standard');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
  // TTS State
  const [isReading, setIsReading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const { addXP, addGems } = useUserStore();
  const { updateBookProgress } = useLibraryStore();
  
  // Guard against missing chapters
  const chapter = book.chapters?.[activeChapterIndex];

  // Auto-update progress
  useEffect(() => {
      if (!book.chapters || book.chapters.length === 0) return;
      const progress = Math.round(((activeChapterIndex + 1) / book.chapters.length) * 100);
      updateBookProgress(book.id, progress);
  }, [activeChapterIndex]);

  useEffect(() => {
    if (!chapter) return;
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      const result = await analyzeTextWithSkin(chapter.content, activeSkin);
      setAiAnalysis(result);
      setIsAnalyzing(false);
    };
    fetchAnalysis();
  }, [chapter, activeSkin]);

  // Clean up audio on unmount or chapter change
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [chapter]);

  const stopAudio = () => {
    if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
    }
    setIsReading(false);
  };

  const toggleAudio = async () => {
    if (!chapter) return;
    
    if (isReading) {
        stopAudio();
        return;
    }

    setIsGeneratingAudio(true);
    // Limit text length to avoid timeouts/limits for this demo, or send full if robust
    const textToRead = chapter.content.substring(0, 4000); 
    const audioData = await generateSpeech(textToRead);
    setIsGeneratingAudio(false);

    if (audioData) {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        // Resume context if suspended (browser autoplay policy)
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const bytes = decodeBase64ToBytes(audioData);
        const buffer = await decodePCMData(bytes, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start();
        sourceRef.current = source;
        setIsReading(true);
        
        source.onended = () => {
            setIsReading(false);
            sourceRef.current = null;
        };
    } else {
        alert("Could not generate audio. Please check API key or try again.");
    }
  };

  const handleStartQuiz = async () => {
    if (!chapter) return;
    setIsAnalyzing(true);
    const generatedQuiz = await generateQuizFromText(chapter.id, chapter.content);
    if (generatedQuiz) {
        setQuiz(generatedQuiz);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizFinished(false);
    } else {
        window.alert("Could not generate quiz. Try again later.");
    }
    setIsAnalyzing(false);
  };

  const handleAnswerSelect = (index: number) => {
      if (answerSubmitted) return;
      setSelectedAnswer(index);
      setAnswerSubmitted(true);
      if (quiz && index === quiz.questions[currentQuestionIndex].correctIndex) {
          setScore(s => s + 1);
      }
  };

  const handleNextQuestion = () => {
      if (!quiz) return;
      if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(i => i + 1);
          setSelectedAnswer(null);
          setAnswerSubmitted(false);
      } else {
          setQuizFinished(true);
          const finalScore = score; // Score already updated
          if (finalScore >= 1) { // At least 1 correct
             addXP(quiz.xpReward);
             addGems(5);
          }
      }
  };

  // Safe render if content missing
  if (!chapter) {
      return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center animate-fade-in">
            <div className="p-8 text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="font-bold text-slate-700 text-lg">No content found</h3>
                <p className="text-slate-500 text-sm mb-6">This book appears to be empty.</p>
                <button onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-6 rounded-xl transition-colors">
                    Close
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-slide-in-bottom">
      {/* Top Bar */}
      <div className={`h-16 ${book.themeColor} flex items-center justify-between px-4 shadow-md shrink-0`}>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={24} /></button>
          <div className="text-white overflow-hidden">
            <h2 className="font-bold text-sm leading-tight truncate max-w-[200px]">{book.title}</h2>
            <p className="text-xs opacity-80 truncate max-w-[200px]">{chapter.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button 
             onClick={toggleAudio}
             disabled={isGeneratingAudio}
             className={`p-2 rounded-full transition-colors ${isReading ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'}`}
             title={isReading ? "Stop Reading" : "Read Aloud"}
           >
             {isGeneratingAudio ? <Loader2 size={16} className="animate-spin" /> : isReading ? <StopCircle size={16} /> : <Volume2 size={16} />}
           </button>
           
           <select 
             value={activeSkin} 
             onChange={(e) => setActiveSkin(e.target.value as BookSkin)}
             className="bg-white/20 text-white text-xs font-bold py-1 px-2 rounded-lg border border-white/30 outline-none focus:bg-white/30 cursor-pointer"
           >
             <option value="standard">Standard</option>
             <option value="scholar">Scholar 🎓</option>
             <option value="street">Street 🛑</option>
             <option value="mystic">Mystic ✨</option>
             <option value="gamer">Gamer 👾</option>
           </select>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 scroll-smooth">
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm min-h-full">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 mb-6">{chapter.title}</h3>
            <div className="prose prose-slate leading-relaxed font-serif text-lg text-slate-700 whitespace-pre-wrap">
              {chapter.content}
            </div>
            
            {/* Nav Controls */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
                <button 
                    disabled={activeChapterIndex === 0} 
                    onClick={() => setActiveChapterIndex(i => i - 1)} 
                    className="flex items-center space-x-2 text-slate-500 disabled:opacity-30 font-bold hover:text-indigo-600 transition-colors"
                >
                    <ChevronLeft size={20} /> <span>Previous Chapter</span>
                </button>
                <button 
                    disabled={activeChapterIndex === book.chapters.length - 1} 
                    onClick={() => setActiveChapterIndex(i => i + 1)} 
                    className="flex items-center space-x-2 text-indigo-600 disabled:opacity-30 font-bold hover:text-indigo-800 transition-colors"
                >
                    <span>Next Chapter</span> <ChevronRight size={20} />
                </button>
            </div>
          </div>
        </div>

        {/* AI Sidebar (Hidden on Mobile, Toggleable maybe later, visible on Desktop) */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center space-x-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wide">
                <Brain size={16} /><span>AI Study Companion</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-3 text-slate-400">
                  <Sparkles className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs font-bold">Consulting the Oracle...</span>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{activeSkin === 'gamer' ? '👾' : activeSkin === 'mystic' ? '✨' : activeSkin === 'street' ? '🛑' : '📚'}</span>
                      <h4 className="font-bold text-sm text-indigo-900 capitalize">{activeSkin} Analysis</h4>
                  </div>
                  <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap font-medium">
                      {aiAnalysis}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200">
            <button 
                onClick={handleStartQuiz} 
                disabled={isAnalyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
            >
                {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Trophy size={18} />}
                <span>Generate Quiz (+50 XP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Overlay */}
      {showQuiz && quiz && (
        <div className="absolute inset-0 z-[70] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            
            {!quizFinished ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-extrabold text-xl text-slate-800">Chapter Quiz</h3>
                        <button onClick={() => setShowQuiz(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={20}/></button>
                    </div>
                    
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                            <span>Score: {score}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-300" style={{width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`}}></div>
                        </div>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 mb-6 leading-snug">
                        {quiz.questions[currentQuestionIndex].text}
                    </h4>

                    <div className="space-y-3 mb-6">
                        {quiz.questions[currentQuestionIndex].options.map((opt, idx) => {
                            let btnClass = "bg-white border-slate-200 hover:border-indigo-400 text-slate-600";
                            if (answerSubmitted) {
                                if (idx === quiz.questions[currentQuestionIndex].correctIndex) btnClass = "bg-emerald-100 border-emerald-500 text-emerald-800";
                                else if (idx === selectedAnswer) btnClass = "bg-rose-100 border-rose-500 text-rose-800";
                                else btnClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                            } else if (idx === selectedAnswer) {
                                btnClass = "bg-indigo-50 border-indigo-500 text-indigo-700";
                            }

                            return (
                                <button 
                                    key={idx} 
                                    onClick={() => handleAnswerSelect(idx)} 
                                    disabled={answerSubmitted}
                                    className={`w-full p-4 border-2 rounded-xl text-left font-bold text-sm transition-all ${btnClass}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {answerSubmitted && (
                        <div className="animate-slide-in-bottom">
                            {quiz.questions[currentQuestionIndex].explanation && (
                                <div className="bg-blue-50 p-3 rounded-xl mb-4 text-xs text-blue-700 border border-blue-100">
                                    <span className="font-bold">Insight:</span> {quiz.questions[currentQuestionIndex].explanation}
                                </div>
                            )}
                            <button onClick={handleNextQuestion} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl">
                                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm">
                        🏆
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Quiz Complete!</h2>
                    <p className="text-lg font-bold text-indigo-600 mb-6">{score} / {quiz.questions.length} Correct</p>
                    <button onClick={() => setShowQuiz(false)} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg">
                        Return to Book
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const LibraryTab: React.FC = () => {
  const { library, uploadBook, deleteBook } = useLibraryStore();
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [filter, setFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadBook(e.target.files[0]);
    }
  };

  const filteredBooks = library.filter(b => b.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen animate-fade-in">
      {selectedBook && <ReaderModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-700 tracking-tight">Library</h2>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".txt,.md" 
          onChange={handleFileUpload} 
        />
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Search your library..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
        />
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-indigo-200 transition-all group relative">
             {book.type === 'upload' && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); deleteBook(book.id); }}
                    className="absolute top-2 right-2 p-1.5 bg-slate-100 rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                     <Trash2 size={14} />
                 </button>
             )}
             <button onClick={() => setSelectedBook(book)} className="w-full text-left">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 ${book.themeColor.replace('bg-', 'bg-').replace('600', '100')} ${book.themeColor.replace('bg-', 'text-').replace('600', '600')}`}>
                    {book.coverEmoji}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight line-clamp-2">{book.title}</h3>
                <p className="text-xs text-slate-400 font-medium mb-3">{book.author}</p>
                
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${book.progress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>{book.progress}% Read</span>
                    {book.masteryLevel > 0 && <span className="text-yellow-500 flex items-center"><Star size={10} className="mr-1 fill-current" /> Lvl {book.masteryLevel}</span>}
                </div>
             </button>
          </div>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
          <div className="text-center py-10 opacity-50">
              <BookOpen size={48} className="mx-auto mb-2 text-slate-300" />
              <p className="text-slate-400 text-xs font-bold">No books found.</p>
          </div>
      )}
    </div>
  );
};
