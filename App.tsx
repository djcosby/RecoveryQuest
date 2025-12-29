
import React, { useState, useEffect } from 'react';
import { Activity, Bell, Settings as SettingsIcon } from 'lucide-react';
import { UserProvider, useUserStore } from './context/UserContext';
import { ResourceProvider } from './context/ResourceContext';
import { PeerProvider } from './context/PeerContext';
import { LibraryProvider } from './context/LibraryContext';
import { TabId, PersonalityProfile, PathNodeData } from './types';
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
import { LessonRenderer } from './components/education/LessonRenderer';
import { CelebrationModal } from './components/modals/CelebrationModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ShopModal } from './components/modals/ShopModal';
import { SOSModal } from './components/modals/SOSModal';
import { AssessmentModal } from './components/modals/AssessmentModal';
import { TutorialOverlay } from './components/tutorial/TutorialOverlay';

const NotificationToast: React.FC<{ messages: string[]; onClear: () => void }> = ({ messages, onClear }) => {
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(onClear, 4000);
      return () => clearTimeout(timer);
    }
  }, [messages, onClear]);
  if (messages.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] space-y-2 animate-slide-in-bottom">
      {messages.map((msg, i) => (
        <div key={i} className="bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 min-w-[300px]">
          <Bell size={20} className="text-yellow-400" />
          <span className="text-sm font-bold">{msg}</span>
        </div>
      ))}
    </div>
  );
};

function AppContent() {
  const { state: user, isAuthenticated, addXP, logMeeting, completeQuest, completeNode, clearNotifications } = useUserStore();
  
  if (!isAuthenticated) return <AuthScreen />;

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [activeLesson, setActiveLesson] = useState<PathNodeData | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(user.profile.hasCompletedTutorial);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState<{ title: string; subtitle: string } | null>(null);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdmin((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleHealthQuestComplete = (xp: number, _title: string, questId: string) => {
    completeQuest(questId, xp);
    setShowCelebration({ title: 'Health Quest Complete!', subtitle: `+${xp} XP earned.` });
  };

  const handleLessonCompleted = (xp: number) => {
    addXP(xp);
    if (activeLesson) completeNode(activeLesson.id);
    setActiveLesson(null);
    setShowCelebration({ title: 'Mastery Achieved', subtitle: 'You are rebuilding your neural pathways.' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex">
      <NotificationToast messages={user.notifications} onClear={clearNotifications} />
      {!user.profile.hasCompletedTutorial && <TutorialOverlay />}
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto h-screen relative scroll-smooth border-r border-slate-100">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
          {activeTab === 'home' && (
            <HomeTab
              userXP={user.xp}
              userLevel={user.level}
              streak={user.streak}
              meetingCount={user.meetingsLogged}
              onStartLesson={(lesson) => setActiveLesson(lesson as PathNodeData)}
              onStudyTool={() => {}}
              onLogMeeting={logMeeting}
              personalityProfile={personalityProfile}
            />
          )}
          {activeTab === 'practice' && <PracticeTab onStartScenario={() => {}} />}
          {activeTab === 'quests' && <QuestsTab />}
          {activeTab === 'league' && <LeagueTab />}
          {activeTab === 'feed' && <FeedTab />}
          {activeTab === 'silverbook' && <SilverBookTab />}
          {activeTab === 'library' && <LibraryTab />}
          {activeTab === 'profile' && (
            <ProfileTab
              userLevel={user.level}
              userXP={user.xp}
              personalityProfile={personalityProfile}
              completedQuests={user.completedQuests}
              onStartAssessment={() => setShowAssessment(true)}
              onCompleteQuest={handleHealthQuestComplete}
              onStartPractice={() => setActiveTab('practice')}
            />
          )}
        </div>
        <Narrator activeTab={activeTab} userLevel={user.level} />
      </main>

      <RightPanel onShop={() => setShowShopModal(true)} />

      <button
        id="sos-button"
        onClick={() => setShowSOS(true)}
        className="fixed bottom-6 right-6 lg:right-[380px] z-[60] bg-rose-500 hover:bg-rose-600 text-white rounded-full p-5 shadow-2xl active:scale-90 transition-all animate-pulse"
      >
        <Activity size={28} />
      </button>

      {showCheckIn && <CheckInModal onClose={() => setShowCheckIn(false)} onComplete={() => { addXP(10); setShowCheckIn(false); }} />}
      
      {activeLesson && (
        <LessonRenderer 
          lesson={activeLesson} 
          onClose={() => setActiveLesson(null)} 
          onComplete={handleLessonCompleted} 
        />
      )}
      
      {showAssessment && <AssessmentModal onClose={() => setShowAssessment(false)} onComplete={(p) => { setPersonalityProfile(p); setShowAssessment(false); addXP(200); }} />}
      {showCelebration && <CelebrationModal title={showCelebration.title} subtitle={showCelebration.subtitle} onClose={() => setShowCelebration(null)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      {showShopModal && <ShopModal onClose={() => setShowShopModal(false)} />}
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} onSelectAI={() => { setActiveTab('profile'); setShowSOS(false); }} />}
      {showAdmin && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <AdminCurriculumTools />
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
