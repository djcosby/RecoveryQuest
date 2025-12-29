
import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Brain, Award, ArrowRight, BookOpen, Share2, Globe, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// Fix: Import types from types.ts instead of curriculumData.ts
import { LessonLevel, QuizOption } from '../../types';
import { useUserStore } from '../../context/UserContext';

interface LessonModalProps {
  lesson: LessonLevel;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

type ViewState = 'reading' | 'quiz' | 'success';

export const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose, onComplete }) => {
  const { addFeedPost } = useUserStore();
  const [viewState, setViewState] = useState<ViewState>('reading');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizIncorrectCount, setQuizIncorrectCount] = useState(0);
  const [publishPublicly, setPublishPublicly] = useState(true);

  // Fix: Safe access to quiz from content property
  const quiz = lesson.content?.quiz || [];
  const educationalContent = lesson.educationalContent || lesson.content?.educationalContent || "";
  const currentQuestion = quiz[currentQuestionIdx];

  const handleCheckAnswer = () => {
    setIsAnswerChecked(true);
    if (!selectedOption?.isCorrect) {
      setQuizIncorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      if (lesson.type === 'boss' && quizIncorrectCount > 0) {
        alert("Boss levels require 100% accuracy. Let's review and try again.");
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setIsAnswerChecked(false);
        setQuizIncorrectCount(0);
        setViewState('reading');
      } else {
        setViewState('success');
      }
    }
  };

  const handleFinalCompletion = () => {
      const milestoneMsg = `Mastered: ${lesson.title} - "${lesson.description}"`;
      addFeedPost(milestoneMsg, 'milestone', !publishPublicly);
      onComplete(lesson.xpReward);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              {viewState === 'reading' ? <BookOpen size={24} /> : viewState === 'quiz' ? <Brain size={24} /> : <Award size={24} />}
            </div>
            <div>
              <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{viewState === 'reading' ? 'Lesson' : 'Assessment'}</span>
              <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{lesson.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
          {viewState === 'reading' && (
            <div className="animate-fade-in space-y-6">
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{educationalContent}</ReactMarkdown>
              </div>
              <div className="pt-8 border-t border-slate-100 flex justify-end">
                {quiz.length > 0 ? (
                  <button onClick={() => setViewState('quiz')} className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200">
                    <Brain className="w-5 h-5" />
                    Begin Knowledge Check
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button onClick={() => setViewState('success')} className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-200">
                    Finish Lesson
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          )}

          {viewState === 'quiz' && currentQuestion && (
            <div className="max-w-xl mx-auto py-4 animate-slide-in-right">
              <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-1.5">
                      {quiz.map((_, idx) => (
                          <div key={idx} className={`h-2 rounded-full transition-all duration-500 ${idx === currentQuestionIdx ? 'w-8 bg-indigo-500' : idx < currentQuestionIdx ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-200'}`} />
                      ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIdx + 1} of {quiz.length}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-8 leading-tight">{currentQuestion.question}</h2>
              <div className="space-y-4">
                {currentQuestion.options.map((opt) => {
                  let stateStyle = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30";
                  if (isAnswerChecked) {
                    if (opt.id === selectedOption?.id) {
                      stateStyle = opt.isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100" : "border-rose-500 bg-rose-50 text-rose-700 ring-4 ring-rose-100";
                    } else if (opt.isCorrect) {
                      stateStyle = "border-emerald-500 bg-emerald-50 text-emerald-700";
                    } else {
                      stateStyle = "opacity-40 border-slate-100 pointer-events-none";
                    }
                  } else if (selectedOption?.id === opt.id) {
                    stateStyle = "border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-100";
                  }
                  return (
                    <button key={opt.id} onClick={() => !isAnswerChecked && setSelectedOption(opt)} className={`w-full p-6 rounded-3xl border-2 text-left font-bold transition-all ${stateStyle}`}>
                      <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-colors ${selectedOption?.id === opt.id ? 'bg-indigo-500 border-indigo-600 text-white' : 'border-slate-100 text-slate-300'}`}>
                              {opt.id.toUpperCase()}
                          </div>
                          <span>{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {viewState === 'success' && (
            <div className="text-center py-12 animate-zoom-in">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-amber-200">
                <Award className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4">Level Mastered!</h2>
              <div className="bg-slate-50 rounded-3xl p-6 mb-10 text-left border-2 border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Milestone</span>
                      <div onClick={() => setPublishPublicly(!publishPublicly)} className={`w-12 h-6 rounded-full transition-colors cursor-pointer p-1 ${publishPublicly ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${publishPublicly ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${publishPublicly ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                          {publishPublicly ? <Globe size={24} /> : <Lock size={24} />}
                      </div>
                      <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{publishPublicly ? 'Community Feed' : 'Personal Log Only'}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Your progress will be logged to your recovery journal.</p>
                      </div>
                  </div>
              </div>
              <button onClick={handleFinalCompletion} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center space-x-3">
                <Share2 size={22} />
                <span>Save & Continue</span>
              </button>
            </div>
          )}
        </div>

        {viewState === 'quiz' && (
          <div className="p-6 border-t border-slate-100 bg-white">
            <button onClick={isAnswerChecked ? handleNext : handleCheckAnswer} disabled={!selectedOption} className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${!selectedOption ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : (isAnswerChecked ? (selectedOption?.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 'bg-indigo-600 text-white')}`}>
              {isAnswerChecked ? "Continue" : "Check Answer"}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
