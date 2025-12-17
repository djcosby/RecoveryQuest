
import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Check, SkipForward } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';

interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'nav-home',
    title: 'Your Path',
    description: 'The core of your recovery journey. Complete daily lessons, activities, and boss scenarios here.',
  },
  {
    targetId: 'nav-practice',
    title: 'Practice Hub',
    description: 'Sharpen your skills. Roleplay difficult conversations and build emotional resilience.',
  },
  {
    targetId: 'nav-library',
    title: 'Library',
    description: 'Access recovery literature. You can upload texts and generate AI quizzes to test your knowledge.',
  },
  {
    targetId: 'nav-quests',
    title: 'Quests',
    description: 'Track your daily goals, achievements, and participate in community challenges.',
  },
  {
    targetId: 'nav-league',
    title: 'Leaderboards',
    description: 'Connect with peers, find sponsors, and see where you stand in your recovery group.',
  },
  {
    targetId: 'nav-feed',
    title: 'Community Feed',
    description: 'Share milestones, get support, and see updates from your network.',
  },
  {
    targetId: 'nav-silverbook',
    title: 'SilverBook',
    description: 'A directory of verified meetings, therapists, and resources. Find help near you.',
  },
  {
    targetId: 'nav-profile',
    title: 'Profile',
    description: 'Manage your bio, view your clinical conceptualization, and track your health metrics.',
  },
  {
    targetId: 'stats-panel',
    title: 'Vitals',
    description: 'Keep an eye on your Hearts (health), Streak (consistency), and Gems (rewards).',
  },
  {
    targetId: 'sos-button',
    title: 'SOS Mode',
    description: 'In a crisis? Tap this for immediate grounding tools and support options.',
  }
];

export const TutorialOverlay: React.FC = () => {
  const { completeTutorial } = useUserStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  
  // Skip logic if element not found after retries
  const retryCount = useRef(0);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];

  useEffect(() => {
    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);
      
      // Check if element exists AND is visible (width > 0)
      if (element && element.getBoundingClientRect().width > 0) {
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        calculateTooltipPosition(rect);
        retryCount.current = 0;
      } else {
        // If element not found (e.g. mobile view hiding desktop elements like stats-panel), skip step
        if (retryCount.current < 3) {
            retryCount.current++;
            setTimeout(updatePosition, 300);
        } else {
            // Auto skip if not found after retries
            handleNext();
        }
      }
    };

    // Small delay to ensure rendering allows finding elements
    const timer = setTimeout(updatePosition, 100);
    
    window.addEventListener('resize', updatePosition);
    return () => {
        window.removeEventListener('resize', updatePosition);
        clearTimeout(timer);
    };
  }, [currentStepIndex]);

  const calculateTooltipPosition = (rect: DOMRect) => {
      const padding = 16;
      const tooltipWidth = 320; // Max width of tooltip
      const tooltipHeight = 200; // Approx height
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      let style: React.CSSProperties = {};

      // Prefer placing on the side with more space
      const spaceTop = rect.top;
      const spaceBottom = screenH - rect.bottom;
      const spaceLeft = rect.left;
      const spaceRight = screenW - rect.right;

      // Logic: If mobile (narrow), usually top or bottom. If desktop, left or right.
      const isMobile = screenW < 768;

      if (isMobile) {
          // Bottom Navigation items usually need top tooltip
          if (rect.bottom > screenH - 100) {
              style = { bottom: screenH - rect.top + padding, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '350px' };
          } else if (rect.top < 100) {
              style = { top: rect.bottom + padding, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '350px' };
          } else {
              // Center
              style = { top: rect.bottom + padding, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '350px' };
          }
      } else {
          // Desktop sidebar is left, so prefer right.
          if (spaceRight > tooltipWidth + padding) {
              style = { top: rect.top, left: rect.right + padding, width: '320px' };
          } else if (spaceLeft > tooltipWidth + padding) {
              style = { top: rect.top, right: screenW - rect.left + padding, width: '320px' };
          } else if (spaceBottom > tooltipHeight) {
              style = { top: rect.bottom + padding, left: rect.left, width: '320px' };
          } else {
              style = { bottom: screenH - rect.top + padding, left: rect.left, width: '320px' };
          }
      }
      
      // Safety Clamp for desktop vertical overflow
      if (!isMobile && style.top && (rect.top + tooltipHeight > screenH)) {
          // Adjust to bottom align with target
          style.top = 'auto';
          style.bottom = 20;
      }

      setTooltipStyle(style);
  };

  const handleNext = () => {
    retryCount.current = 0;
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

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-auto">
      {/* Spotlight Box with Huge Shadow for Cutout Effect */}
      <div 
        className="absolute rounded-xl border-4 border-yellow-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] transition-all duration-300 ease-in-out z-10 animate-pulse"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <div 
        className="absolute bg-white p-6 rounded-3xl shadow-2xl z-20 animate-fade-in transition-all duration-300 flex flex-col"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-slate-800 text-xl">{currentStep.title}</h3>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
                {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
            </span>
        </div>
        
        <p className="text-slate-600 text-sm font-medium mb-6 leading-relaxed">
            {currentStep.description}
        </p>
        
        <div className="flex justify-between items-center mt-auto">
            <button 
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 flex items-center transition-colors"
            >
                <SkipForward size={14} className="mr-1" /> Skip
            </button>
            <button 
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-indigo-200 active:scale-95 transition-all"
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
