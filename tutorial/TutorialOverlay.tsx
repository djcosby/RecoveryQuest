import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';

interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'nav-home',
    title: 'The Path',
    description: 'This is your main journey. Complete lessons and scenarios here to level up and recover hearts.',
    position: 'right'
  },
  {
    targetId: 'stats-panel',
    title: 'Your Vitals',
    description: 'Keep an eye on your Hearts (health), Streak (consistency), and Gems (rewards).',
    position: 'bottom' // or left depending on desktop/mobile
  },
  {
    targetId: 'nav-library',
    title: 'The Library',
    description: 'Access recovery literature, upload your own texts, and listen to audio versions.',
    position: 'right'
  },
  {
    targetId: 'nav-league',
    title: 'Community',
    description: 'Find a sponsor, join a league, and see how others are doing on their path.',
    position: 'right'
  },
  {
    targetId: 'sos-button',
    title: 'SOS Mode',
    description: 'In a crisis? Tap this for immediate breathing exercises and support options.',
    position: 'top' // usually bottom right, so tooltip goes top
  }
];

export const TutorialOverlay: React.FC = () => {
  const { completeTutorial } = useUserStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  // Skip logic if element not found after retries
  const retryCount = useRef(0);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];

  useEffect(() => {
    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        retryCount.current = 0;
      } else {
        // If element not found (e.g. mobile view hiding desktop elements), skip step
        if (retryCount.current < 3) {
            retryCount.current++;
            setTimeout(updatePosition, 500);
        } else {
            handleNext();
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  if (!targetRect) return null;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  const spacing = 16;

  switch (currentStep.position) {
    case 'right':
      tooltipStyle = { top: targetRect.top, left: targetRect.right + spacing };
      break;
    case 'left':
      tooltipStyle = { top: targetRect.top, right: window.innerWidth - targetRect.left + spacing };
      break;
    case 'bottom':
      tooltipStyle = { top: targetRect.bottom + spacing, left: targetRect.left };
      break;
    case 'top':
      tooltipStyle = { bottom: window.innerHeight - targetRect.top + spacing, left: targetRect.left };
      break;
  }

  // Mobile adjustment: Ensure tooltip stays on screen
  if (window.innerWidth < 768) {
      tooltipStyle = { 
          top: 'auto', 
          bottom: '100px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '90%' 
      };
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Dark Background with Cutout using mix-blend-mode or simple SVG path */}
      <div className="absolute inset-0 bg-slate-900/80 transition-all duration-500"></div>

      {/* Spotlight Box */}
      <div 
        className="absolute border-4 border-yellow-400 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.8)] transition-all duration-300 ease-in-out pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <div 
        className="absolute bg-white p-5 rounded-2xl shadow-2xl max-w-sm animate-fade-in transition-all duration-300"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-extrabold text-slate-800 text-lg">{currentStep.title}</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
            </span>
        </div>
        <p className="text-slate-600 text-sm font-medium mb-4 leading-relaxed">
            {currentStep.description}
        </p>
        <div className="flex justify-between items-center">
            <button 
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2"
            >
                Skip Tutorial
            </button>
            <button 
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg active:scale-95 transition-transform"
            >
                {currentStepIndex === TUTORIAL_STEPS.length - 1 ? (
                    <>Finish <Check size={16} className="ml-2" /></>
                ) : (
                    <>Next <ArrowRight size={16} className="ml-2" /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};