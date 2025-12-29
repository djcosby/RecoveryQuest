
import React, { useState, useEffect, useRef } from 'react';
import { InteractiveSegment, SegmentResult, SegmentType } from '../../types';
import { MatchingGame } from '../exercises/MatchingGame';
import { SentenceBuilder } from '../exercises/SentenceBuilder';
import { FlashCard } from '../exercises/FlashCard';
import { FillGap } from '../exercises/FillGap';
import { ConceptSort } from '../exercises/ConceptSort';
import { ScenarioBridge } from '../exercises/ScenarioBridge';
import { MultipleChoice } from '../exercises/MultipleChoice';
import { X, Heart, ArrowRight, CheckCircle, Brain, AlertCircle, Sparkles, Trophy, Play, Pause, Volume2, Film } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUserStore } from '../../context/UserContext';
import { CurriculumService } from '../../services/curriculumService';

interface LessonRendererProps {
  lesson: any; 
  onClose: () => void;
  onComplete: (xp: number) => void;
}

// --- VIDEO PLAYER COMPONENT ---
const VideoSegment: React.FC<{ segment: InteractiveSegment; onComplete: (success: boolean) => void }> = ({ segment, onComplete }) => {
  const [hasWatched, setHasWatched] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleVideoEnd = () => {
    setHasWatched(true);
    if (segment.content.comprehensionQuestion) {
      setShowQuiz(true);
    } else {
      onComplete(true);
    }
  };

  const handleQuizSubmit = () => {
      setIsAnswered(true);
      const isCorrect = segment.content.comprehensionQuestion?.options.find((o: any) => o.id === selectedOptId)?.isCorrect;
      setTimeout(() => onComplete(!!isCorrect), 1000);
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in w-full max-w-lg mx-auto">
      <h3 className="text-xl font-black text-slate-800">{segment.prompt}</h3>
      
      <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-900">
        <video 
          src={segment.content.mediaUrl}
          poster={segment.content.posterUrl}
          controls
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
        />
        {!hasWatched && (
            <div className="absolute top-4 right-4 bg-black/60 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                Watch to unlock
            </div>
        )}
      </div>

      {segment.content.transcript && (
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 text-sm text-slate-600 leading-relaxed shadow-sm">
            <span className="font-black text-slate-800 uppercase text-[10px] tracking-wider block mb-2 opacity-50 flex items-center gap-1.5"><Film size={12}/> Scene Description</span>
            {segment.content.transcript}
          </div>
      )}

      {showQuiz && segment.content.comprehensionQuestion && (
        <div className="animate-slide-in-bottom bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100 shadow-lg">
           <h4 className="font-black text-indigo-900 mb-4 leading-tight">{segment.content.comprehensionQuestion.text}</h4>
           <div className="space-y-2">
             {segment.content.comprehensionQuestion.options.map((opt: any) => (
               <button
                 key={opt.id}
                 disabled={isAnswered}
                 onClick={() => setSelectedOptId(opt.id)}
                 className={`w-full p-4 text-left rounded-xl font-bold transition-all border-2
                    ${isAnswered 
                        ? (opt.isCorrect ? 'bg-emerald-500 text-white border-emerald-600' : (selectedOptId === opt.id ? 'bg-rose-500 text-white border-rose-600' : 'bg-white opacity-50 border-slate-100'))
                        : (selectedOptId === opt.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white border-white text-slate-600 hover:border-indigo-200')}
                 `}
               >
                 {opt.text}
               </button>
             ))}
           </div>
           {!isAnswered && (
               <button 
                onClick={handleQuizSubmit}
                disabled={!selectedOptId}
                className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
               >
                   Confirm Analysis
               </button>
           )}
        </div>
      )}
    </div>
  );
};

// --- AUDIO PLAYER COMPONENT ---
const AudioSegment: React.FC<{ segment: InteractiveSegment; onComplete: (success: boolean) => void }> = ({ segment, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 py-8 animate-fade-in w-full max-w-lg mx-auto">
      <div className="w-56 h-56 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner relative border-8 border-white">
         <div className={`absolute inset-0 rounded-full border-4 border-indigo-100 ${isPlaying ? 'animate-ping opacity-20' : ''}`} />
         <button 
            onClick={togglePlay}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all z-10
            ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
         >
            {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
         </button>
      </div>

      <div className="text-center space-y-3">
         <h3 className="text-2xl font-black text-slate-800 tracking-tight">{segment.prompt}</h3>
         <div className="flex items-center justify-center space-x-2 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <Volume2 size={16} />
            <span>Immersive Audio</span>
         </div>
      </div>

      <audio 
        ref={audioRef}
        src={segment.content.mediaUrl}
        onEnded={() => onComplete(true)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {segment.content.transcript && (
          <div className="max-w-md bg-white p-6 rounded-3xl border-2 border-slate-100 text-center shadow-sm">
             <p className="text-slate-500 text-sm font-medium leading-relaxed italic">"{segment.content.transcript}"</p>
          </div>
      )}
    </div>
  );
};

export const LessonRenderer: React.FC<LessonRendererProps> = ({ 
  lesson,
  onClose, 
  onComplete 
}) => {
  const { addXP, takeDamage } = useUserStore();
  const segments: InteractiveSegment[] = lesson.contentBlocks || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xpAccumulated, setXpAccumulated] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; title: string; message: string; rationale?: string } | null>(null);
  
  // Timing state
  const segmentStartTime = useRef<number>(Date.now());
  const [results, setResults] = useState<SegmentResult[]>([]);

  const currentSegment = segments[currentIndex];
  const progress = (currentIndex / segments.length) * 100;

  useEffect(() => {
    segmentStartTime.current = Date.now();
  }, [currentIndex]);

  const handleSegmentComplete = (success: boolean, resultData: any = {}) => {
    const timeMs = Date.now() - segmentStartTime.current;
    
    const result: SegmentResult = {
      segmentId: currentSegment.id,
      type: currentSegment.type,
      isCorrect: success,
      attempts: resultData.attempts || 1,
      timeMs,
      ...resultData
    };

    setResults(prev => [...prev, result]);

    CurriculumService.logInteraction(
        lesson.id, 
        currentSegment.id, 
        currentSegment.type, 
        success
    );

    if (success) {
      const earnedXp = currentSegment.xpReward || 10;
      setXpAccumulated(prev => prev + earnedXp);
      setFeedback({ 
        type: 'success', 
        title: 'Pathway Aligned',
        message: currentSegment.feedback?.correct || "Neural connections reinforced.",
        rationale: currentSegment.feedback?.rationale
      });
    } else {
      setHearts(prev => Math.max(0, prev - 1));
      takeDamage(1); 
      setFeedback({ 
        type: 'error', 
        title: 'A Moment for Grace',
        message: currentSegment.feedback?.incorrect || "Discomfort is part of the growth process.",
        rationale: currentSegment.feedback?.rationale
      });
    }
  };

  const handleContinue = () => {
    setFeedback(null);
    if (currentIndex < segments.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsLessonComplete(true);
    }
  };

  const finalizeLesson = () => {
      addXP(xpAccumulated);
      onComplete(xpAccumulated);
  };

  const renderContent = () => {
    if (!currentSegment) return <div className="text-slate-400">Loading neural modules...</div>;

    switch (currentSegment.type) {
      case 'markdown':
        return (
          <div className="animate-fade-in w-full max-w-lg mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100 prose prose-indigo">
              <ReactMarkdown>{currentSegment.content.data || currentSegment.content}</ReactMarkdown>
            </div>
            <button 
              onClick={() => handleSegmentComplete(true)} 
              className="mt-8 w-full py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Continue Journey</span>
              <ArrowRight size={20} />
            </button>
          </div>
        );

      case 'match_pairs':
        return (
          <div className="mt-4 w-full max-w-lg mx-auto">
             <MatchingGame 
                prompt={currentSegment.prompt} 
                items={currentSegment.content.pairs} 
                onComplete={() => handleSegmentComplete(true)} 
             />
          </div>
        );

      case 'sentence_builder':
        return (
          <SentenceBuilder 
            prompt={currentSegment.prompt}
            content={currentSegment.content}
            onComplete={(success) => handleSegmentComplete(success)}
          />
        );

      case 'flash_card':
          return (
              <FlashCard 
                content={currentSegment.content}
                onComplete={() => handleSegmentComplete(true)}
              />
          );

      case 'fill_gap':
          return (
              <FillGap
                prompt={currentSegment.prompt}
                content={currentSegment.content}
                onComplete={(success) => handleSegmentComplete(success)}
              />
          );

      case 'concept_sort':
          return (
              <ConceptSort
                prompt={currentSegment.prompt}
                content={currentSegment.content}
                onComplete={(success) => handleSegmentComplete(success)}
              />
          );

      case 'scenario_bridge':
          return (
              <ScenarioBridge
                content={currentSegment.content}
                onComplete={(success, choiceId) => handleSegmentComplete(success, { selectedChoiceId: choiceId })}
              />
          );

      case 'multiple_choice':
          return (
              <MultipleChoice 
                prompt={currentSegment.prompt}
                content={currentSegment.content}
                onComplete={(success) => handleSegmentComplete(success)}
              />
          );

      case 'video_segment':
          return (
              <VideoSegment 
                segment={currentSegment} 
                onComplete={(success) => handleSegmentComplete(success)} 
              />
          );

      case 'audio_segment':
          return (
              <AudioSegment 
                segment={currentSegment} 
                onComplete={(success) => handleSegmentComplete(success)} 
              />
          );
      
      default:
        return (
          <div className="p-8 text-center text-slate-400 italic">
            Module type '{currentSegment.type}' is coming soon to your path.
          </div>
        );
    }
  };

  if (isLessonComplete) {
    const accuracy = results.length > 0 ? (results.filter(r => r.isCorrect).length / results.length) * 100 : 100;
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center p-6 animate-fade-in overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
            <Sparkles size={400} className="text-indigo-500 absolute -top-20 -right-20" />
        </div>
        
        <div className="w-32 h-32 bg-indigo-100 rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
            <CheckCircle className="text-indigo-600 w-16 h-16 z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
        </div>

        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">Blueprint Mastered</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest mb-12">Building a life you don't need to escape from.</p>
        
        <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
           <div className="bg-slate-50 p-6 rounded-3xl text-center border-2 border-slate-100">
             <div className="text-3xl font-black text-indigo-600">{Math.round(accuracy)}%</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reflex Accuracy</div>
           </div>
           <div className="bg-slate-50 p-6 rounded-3xl text-center border-2 border-slate-100">
             <div className="text-3xl font-black text-emerald-600">+{xpAccumulated}</div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Neural XP</div>
           </div>
        </div>

        <button 
          onClick={finalizeLesson}
          className="w-full max-w-md py-5 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-200 active:scale-95 transition-all hover:bg-black uppercase tracking-widest"
        >
          Return to The Path
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[150] flex flex-col font-sans">
      {/* HEADER */}
      <div className="px-6 py-8 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex-1 mx-8 h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-indigo-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-100 shadow-sm">
          <Heart fill="currentColor" size={20} className={hearts <= 1 ? 'animate-pulse' : ''} />
          <span className="font-black text-lg">{hearts}</span>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full pb-32 md:pb-0">
            {renderContent()}
        </div>
      </div>

      {/* FOOTER (Feedback & Continue) */}
      <div className={`
        fixed bottom-0 left-0 right-0 p-6 border-t-4 transition-all duration-500 transform z-[160]
        ${feedback ? 'translate-y-0 opacity-100 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]' : 'translate-y-full opacity-0 pointer-events-none'}
        ${feedback?.type === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-rose-50 border-rose-400 text-rose-900'}
      `}>
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className={`
              w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0
              ${feedback?.type === 'success' ? 'bg-white text-emerald-500' : 'bg-white text-rose-500'}
            `}>
              {feedback?.type === 'success' ? <CheckCircle size={32} strokeWidth={3} /> : <AlertCircle size={32} strokeWidth={3} />}
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight leading-none mb-1">{feedback?.title}</h4>
              <p className="text-sm font-bold opacity-80">{feedback?.message}</p>
              {feedback?.rationale && <p className="text-[10px] font-medium mt-1 opacity-60 italic">{feedback.rationale}</p>}
            </div>
          </div>
          
          <button 
            onClick={handleContinue}
            className={`
              w-full md:w-auto px-10 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all
              ${feedback?.type === 'success' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'}
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
