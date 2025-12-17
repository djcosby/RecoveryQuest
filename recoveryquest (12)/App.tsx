
import React, { useState, useEffect } from 'react';
import { Activity, Home, Trophy, Smartphone, Book, User, Target, Library, Bell, Dumbbell } from 'lucide-react';
import { UserProvider, useUserStore } from './context/UserContext';
import { ResourceProvider } from './context/ResourceContext';
import { PeerProvider } from './context/PeerContext';
import { LibraryProvider } from './context/LibraryContext';
import { TabId, PathNodeData, RecoveryTool, PersonalityProfile, WellnessScores } from './types';
import { BOSS_SCENARIOS, HEDIS_QUESTS } from './constants';
import { NavButton } from './components/NavButton';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { HomeTab } from './components/tabs/HomeTab';
import { LeagueTab } from './components/tabs/LeagueTab';
import { FeedTab } from './components/tabs/FeedTab';
import { SilverBookTab } from './components/tabs/SilverBookTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { QuestsTab } from './components/tabs/QuestsTab';
import { LibraryTab } from './components/tabs/LibraryTab';
import { PracticeTab } from './components/tabs/PracticeTab';
import { AdminCurriculumTools } from './components/admin/AdminCurriculumTools';
import { AuthScreen } from './components/AuthScreen';
import { Narrator } from './components/guide/Narrator';

import { CheckInModal } from './components/modals/CheckInModal';
import { LessonModal } from './components/modals/LessonModal';
import { ScenarioModal } from './components/modals/ScenarioModal';
import { AssessmentModal } from './components/modals/AssessmentModal';
import { SOSModal } from './components/modals/SOSModal';
import { StudyModal } from './components/modals/StudyModal';
import { CelebrationModal } from './components/modals/CelebrationModal';
import { WellnessAssessmentModal } from './components/modals/WellnessAssessmentModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShopModal } from './components/modals/ShopModal';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';

// Toast Component
const NotificationToast: React.FC<{ messages: string[]; onClear: () => void }> = ({ messages, onClear }) => {
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(onClear, 4000);
      return () => clearTimeout(timer);
    }
  }, [messages, onClear]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[200] space-y-2 animate-slide-in-right">
      {messages.map((msg, i) => (
        <div key={i} className="bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-3 max-w-sm">
          <Bell size={18} className="text-yellow-400" />
          <span className="text-sm font-bold">{msg}</span>
        </div>
      ))}
    </div>
  );
};

function AppContent() {
  const { state: user, isAuthenticated, addXP, logMeeting, completeQuest, completeNode, updateWellnessScores, collectTool, clearNotifications } = useUserStore();
  
  // 🔒 AUTH GUARD
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [profileSubTab, setProfileSubTab] =
    useState<'stats' | 'assessments' | 'practice' | 'ai_sponsor'>('stats');

  const [activeLesson, setActiveLesson] = useState<PathNodeData | null>(null);
  const [activeStudyTool, setActiveStudyTool] = useState<RecoveryTool | null>(null);

  const [showSOS, setShowSOS] = useState(false);
  // Only show check-in automatically if tutorial is already completed. 
  // New users should see the tutorial first, then explore the app without immediate interruption.
  const [showCheckIn, setShowCheckIn] = useState(user.profile.hasCompletedTutorial);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showWellnessAssessment, setShowWellnessAssessment] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showCelebration, setShowCelebration] =
    useState<{ title: string; subtitle: string } | null>(null);

  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);

  // 🔹 Admin debug toggle (local panel in HomeTab)
  const [debugMode, setDebugMode] = useState(false);
  // 🔹 Global admin overlay toggle
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle local debug: Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDebugMode((prev) => !prev);
      }
      
      // Toggle global admin overlay: Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdmin((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSwitchToAI = () => {
    setActiveTab('profile');
    setProfileSubTab('ai_sponsor');
  };

  const handleAssessmentComplete = (profile: PersonalityProfile) => {
    setPersonalityProfile(profile);
    setShowAssessment(false);
    addXP(200, 'assessment');
    setShowCelebration({
      title: 'Self-Discovery Unlocked',
      subtitle: 'You’ve taken the first step in The Mirror.',
    });
    setActiveTab('profile');
    setProfileSubTab('stats');
  };

  const handleWellnessComplete = (scores: WellnessScores) => {
      updateWellnessScores(scores);
      // Award XP
      addXP(150, 'wellness_check');
      
      // Mark node complete if this came from the path
      if (activeLesson && activeLesson.type === 'trait_module' && activeLesson.title.includes('8 Dimensions')) {
          completeNode(activeLesson.id);
          setActiveLesson(null);
      }

      setShowWellnessAssessment(false);
      setShowCelebration({
          title: 'Wellness Calibrated',
          subtitle: '+150 XP. Your recovery compass is updated.',
      });
  };

  const handleLogMeeting = () => {
    logMeeting();
    setShowCelebration({
      title: 'Meeting Logged!',
      subtitle: 'Showing up is half the battle. +1 to your count.',
    });
  };

  const handleStudyComplete = () => {
    addXP(15, 'tool_study');
    setActiveStudyTool(null);
  };

  const handleHealthQuestComplete = (xp: number, _title: string, questId: string) => {
    completeQuest(questId, xp);
    setShowCelebration({
      title: 'Health Quest Complete!',
      subtitle: `+${xp} XP for prioritizing your wellness.`,
    });
  };

  const handleLessonCompleted = (node: PathNodeData) => {
    addXP(node.xpReward || 50, 'lesson');
    completeNode(node.id); // 🔹 mark as completed
    setActiveLesson(null);
    setShowCelebration({
      title: 'Lesson Complete',
      subtitle: 'You put insight into motion.',
    });
  };

  const handleScenarioComplete = (xp: number) => {
    addXP(xp, 'boss');
    if (activeLesson) {
      // If it was a real node on the path, mark it complete
      if (!activeLesson.id.startsWith('practice-')) {
          completeNode(activeLesson.id);
      }
    }
    setActiveLesson(null);
    setShowCelebration({
      title: 'Scenario Conquered',
      subtitle: 'You proved your resilience.',
    });
  };

  const handleStartNode = (node: PathNodeData) => {
      if (node.type === 'trait_module' && node.title.includes('8 Dimensions')) {
          setActiveLesson(node); // Track it so we can complete it
          setShowWellnessAssessment(true);
      } else {
          setActiveLesson(node);
      }
  };

  const handleStartPractice = () => {
    // Pick a random scenario ID from constants
    const scenarioIds = Object.keys(BOSS_SCENARIOS).map(Number);
    if (scenarioIds.length === 0) return;
    
    const randomId = scenarioIds[Math.floor(Math.random() * scenarioIds.length)];
    
    // Create a dummy node to trigger the modal
    const practiceNode: PathNodeData = {
      id: `practice-${Date.now()}`,
      type: 'boss',
      title: 'Practice Scenario',
      xpReward: 25, // Reduced XP for practice
      bossScenarioId: randomId
    };
    
    setActiveLesson(practiceNode);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 md:flex">
      
      {/* Notifications */}
      <NotificationToast messages={user.notifications} onClear={clearNotifications} />

      {/* Tutorial Overlay - Shows only if !hasCompletedTutorial */}
      {!user.profile.hasCompletedTutorial && <TutorialOverlay />}

      {/* Narrative Guide (Leo) */}
      <Narrator activeTab={activeTab} userLevel={user.level} />

      {/* 🔹 Desktop Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSettings={() => setShowSettingsModal(true)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex justify-center md:h-screen md:overflow-y-auto relative">
        {/* Dynamic Width Container: Wider for Practice/Games */}
        <div className={`w-full pb-20 md:pb-0 transition-all duration-300 ${
            activeTab === 'practice' ? 'max-w-5xl' : 'max-w-md md:max-w-2xl'
        }`}>
          
          {/* Modals & Overlays */}
          {showCheckIn && (
            <CheckInModal
              onClose={() => setShowCheckIn(false)}
              onComplete={() => {
                addXP(10, 'checkin');
                setShowCheckIn(false);
              }}
            />
          )}

          {activeLesson && !showWellnessAssessment && (
            <>
              {activeLesson.type === 'boss' ? (
                <ScenarioModal
                  scenario={BOSS_SCENARIOS[activeLesson.bossScenarioId || 104] || BOSS_SCENARIOS[104]}
                  onClose={() => setActiveLesson(null)}
                  onComplete={handleScenarioComplete}
                  onFail={() => setActiveLesson(null)}
                />
              ) : activeLesson.type === 'trait_module' ? (
                  null
              ) : (
                <LessonModal
                  level={activeLesson}
                  onClose={() => setActiveLesson(null)}
                  onComplete={() => handleLessonCompleted(activeLesson)}
                />
              )}
            </>
          )}

          {showAssessment && (
            <AssessmentModal
              onClose={() => setShowAssessment(false)}
              onComplete={handleAssessmentComplete}
            />
          )}

          {showWellnessAssessment && (
              <WellnessAssessmentModal
                onClose={() => { setShowWellnessAssessment(false); setActiveLesson(null); }}
                onComplete={handleWellnessComplete}
              />
          )}

          {activeStudyTool && (
            <StudyModal
              tool={activeStudyTool}
              onClose={() => setActiveStudyTool(null)}
              onComplete={handleStudyComplete}
            />
          )}

          {showCelebration && (
            <CelebrationModal
              title={showCelebration.title}
              subtitle={showCelebration.subtitle}
              onClose={() => setShowCelebration(null)}
            />
          )}

          {showSettingsModal && (
            <SettingsModal onClose={() => setShowSettingsModal(false)} />
          )}

          {showShopModal && (
            <ShopModal onClose={() => setShowShopModal(false)} />
          )}

          {showSOS && <SOSModal onClose={() => setShowSOS(false)} onSelectAI={handleSwitchToAI} />}

          <button
            id="sos-button"
            onClick={() => setShowSOS(true)}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] bg-rose-50 hover:bg-rose-600 text-white rounded-full p-4 shadow-lg shadow-rose-900/20 active:scale-90 transition-all animate-pulse"
          >
            <Activity size={24} />
          </button>

          {/* Render Active Tab Content */}
          <div className={`min-h-screen bg-slate-50 md:bg-white md:min-h-0 md:rounded-3xl md:my-4 md:border-2 md:border-slate-100 md:shadow-sm overflow-hidden flex flex-col ${activeTab === 'practice' ? 'md:h-[calc(100vh-2rem)]' : ''}`}>
            {activeTab === 'home' && (
              <HomeTab
                userXP={user.xp}
                userLevel={user.level}
                streak={user.streak}
                meetingCount={user.meetingsLogged}
                onStartLesson={handleStartNode}
                onStudyTool={setActiveStudyTool}
                onLogMeeting={handleLogMeeting}
                personalityProfile={personalityProfile}
                debugMode={debugMode}
              />
            )}

            {activeTab === 'practice' && (
                <PracticeTab onStartScenario={handleStartPractice} />
            )}

            {activeTab === 'quests' && <QuestsTab />}

            {activeTab === 'league' && <LeagueTab />}

            {activeTab === 'feed' && <FeedTab />}

            {activeTab === 'silverbook' && <SilverBookTab />}

            {activeTab === 'library' && <LibraryTab />}

            {activeTab === 'profile' && (
              <ProfileTab
                userLevel={user.level}
                userXP={user.xp}
                initialSubTab={profileSubTab}
                personalityProfile={personalityProfile}
                completedQuests={user.completedQuests}
                onStartAssessment={() => setShowAssessment(true)}
                onCompleteQuest={handleHealthQuestComplete}
                onStartPractice={handleStartPractice}
              />
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Desktop Right Panel */}
      <RightPanel onShop={() => setShowShopModal(true)} />

      {/* 🔹 Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t-2 border-slate-100 bg-white px-2 pb-6 pt-2 z-30">
        <div className="flex justify-around items-center h-16">
          <div className="flex-1 h-full">
            <NavButton domId="nav-home" id="home" icon={Home} label="Path" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1 h-full">
            <NavButton domId="nav-practice" id="practice" icon={Dumbbell} label="Practice" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1 h-full">
            <NavButton domId="nav-library" id="library" icon={Library} label="Library" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1 h-full">
            <NavButton domId="nav-quests" id="quests" icon={Target} label="Quests" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1 h-full">
            <NavButton domId="nav-league" id="league" icon={Trophy} label="Leagues" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1 h-full">
            <NavButton domId="nav-profile" id="profile" icon={User} label="Profile" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>

      {/* Admin Overlay - Ctrl+Shift+A */}
      {showAdmin && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowAdmin(false)}
              className="px-3 py-1 rounded-full bg-slate-800 text-slate-100 text-xs border border-slate-600 hover:bg-slate-700"
            >
              Close Admin (Ctrl+Shift+A)
            </button>
          </div>
          <div className="w-full max-w-5xl">
            <AdminCurriculumTools />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ResourceProvider>
        <PeerProvider>
          <LibraryProvider>
            <AppContent />
          </LibraryProvider>
        </PeerProvider>
      </ResourceProvider>
    </UserProvider>
  );
}
