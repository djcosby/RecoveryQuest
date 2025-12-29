
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Settings, Activity, Gauge, Briefcase, Stethoscope, Shield, CheckCircle, Plus, Calendar, Brain, User, Send, ChevronDown, ChevronUp, FileText, BarChart3, Users, ExternalLink, LineChart, ClipboardList, Target, AlertCircle, ArrowRight, Star, MessageSquare, Microscope, MapPin, Flag, Flame, Zap, Award, Edit3, PlusCircle, Loader2, ThumbsUp, Share2, Video, AlertTriangle, Search, Database, CloudOff, Cloud } from 'lucide-react';
import { PersonalityProfile, Message, Provider, Appointment, WellnessScores, WellnessDimension, CaseFile, Peer, BaselineData, Achievement, Message as ChatMessage, AssessmentLogEntry } from '../../types';
import { sendMessageToGemini, validateContentSafety } from '../../services/geminiService';
import { MOOD_HISTORY, MOCK_PROVIDERS, MOCK_APPOINTMENTS, HEDIS_QUESTS, WELLNESS_STRATEGIES_DB, ACHIEVEMENTS_LIST, FEED_POSTS, LEAGUE_DATA } from '../../constants';
import { useUserStore } from '../../context/UserContext';
import { usePeerStore } from '../../context/PeerContext';
import { usePriorityEngine, PriorityTask } from '../../hooks/usePriorityEngine';
import { WellnessAssessmentModal } from '../modals/WellnessAssessmentModal';
import { CaseManagementModal } from '../modals/CaseManagementModal';
import { SettingsModal } from '../modals/SettingsModal';
import { ConnectionModal } from '../modals/ConnectionModal';
import { BaselineModal } from '../modals/BaselineModal';
import { ClinicalAssessmentModal } from '../modals/ClinicalAssessmentModal';
import { HealthMetricsDashboard } from '../admin/dashboard/HealthMetricsDashboard';
import { HedisDashboard } from '../admin/dashboard/HedisDashboard';
import { ClinicalProfile } from '../../features/profile/ClinicalProfile';
import { CompetencyMirror } from '../../features/profile/CompetencyMirror';

const PROFILE_TABS = [
  { id: 'mastery', label: 'The Mirror', icon: Star },
  { id: 'feed', label: 'Feed', icon: MessageSquare },
  { id: 'stats', label: 'Overview', icon: BarChart3 },
  { id: 'case_file', label: 'Case File', icon: FileText },
  { id: 'clinical', label: 'Clinical', icon: Microscope },
  { id: 'health', label: 'Passport', icon: Stethoscope },
  { id: 'quality', label: 'Vitals', icon: Activity },
  { id: 'assessments', label: 'Assessments', icon: Brain },
  { id: 'ai_sponsor', label: 'AI Sponsor', icon: User },
] as const;

export const ProfileTab: React.FC<{ 
    userLevel: number; 
    userXP: number; 
    initialSubTab?: string; 
    personalityProfile: PersonalityProfile | null; 
    completedQuests: string[]; 
    onStartAssessment: () => void; 
    onCompleteQuest: (xp: number, title: string, questId: string) => void;
    onStartPractice: () => void;
}> = ({ userLevel, userXP, initialSubTab = 'mastery', personalityProfile, completedQuests, onStartAssessment, onCompleteQuest, onStartPractice }) => {
  const [subTab, setSubTab] = useState<string>(initialSubTab);
  
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: '1', role: 'model', text: 'Hey Architect. I noticed you logged "High Stress" in your check-in today. Want to run through a box breathing exercise?' }]);
  const [chatInputText, setChatInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isPosting, setIsPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isValidatingPost, setIsValidatingPost] = useState(false);
  const [postSafetyWarning, setPostSafetyWarning] = useState<string | null>(null);

  const [providers] = useState<Provider[]>(MOCK_PROVIDERS);
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);

  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showBaselineModal, setShowBaselineModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeClinicalAssessment, setActiveClinicalAssessment] = useState<string | null>(null);
  const [expandedDimension, setExpandedDimension] = useState<WellnessDimension | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);

  const { state: userState, updateWellnessScores, updateCaseFile, updateBaseline, addXP, recordAssessment, isCloudEnabled } = useUserStore();
  const { connections } = usePeerStore();
  const priorityTasks = usePriorityEngine(userState);

  const wellnessScores = userState.wellnessScores;
  const userProfile = userState.profile;

  const priorityDimension = useMemo(() => {
    if (!wellnessScores) return null;
    const entries = Object.entries(wellnessScores) as [WellnessDimension, number][];
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => a[1] < b[1] ? a : b)[0];
  }, [wellnessScores]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, subTab]);

  const handleSendMessage = async () => {
    if (!chatInputText.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInputText };
    setMessages(prev => [...prev, userMsg]);
    setChatInputText('');
    setIsChatLoading(true);
    const replyText = await sendMessageToGemini(chatInputText, personalityProfile);
    setIsChatLoading(false);
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: replyText }]);
  };

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    setIsValidatingPost(true);
    setPostSafetyWarning(null);
    const check = await validateContentSafety(newPostContent);
    setIsValidatingPost(false);
    if (!check.safe) { setPostSafetyWarning(check.reason || "This content may violate our recovery safety guidelines."); return; }
    window.alert("Post verified safe and published!");
    setNewPostContent('');
    setIsPosting(false);
  };

  const handleWellnessComplete = (scores: WellnessScores) => {
    updateWellnessScores(scores);
    addXP(150, 'wellness_updated'); 
    setShowWellnessModal(false);
  };

  const handleCaseFileSave = (file: CaseFile) => {
    updateCaseFile(file);
    addXP(150, 'case_file_updated'); 
    setShowCaseModal(false);
  };

  const handleBaselineSave = (data: BaselineData) => {
    updateBaseline(data);
    addXP(500, 'baseline_updated'); 
    setShowBaselineModal(false);
  };

  const handleClinicalComplete = (score: number, resultLabel: string, xpReward: number) => {
      if (activeClinicalAssessment === 'PHQ_9') {
          onCompleteQuest(xpReward, "PHQ-9 Assessment", 'q4');
      } else {
          addXP(xpReward, 'clinical_assessment');
      }
      recordAssessment({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          assessmentId: activeClinicalAssessment!,
          assessmentTitle: activeClinicalAssessment!.replace('_', '-'),
          score,
          resultLabel
      });
      setActiveClinicalAssessment(null);
  };

  const handleTaskAction = (task: PriorityTask) => {
      switch(task.modalTrigger) {
          case 'baseline': setShowBaselineModal(true); break;
          case 'wellness': setShowWellnessModal(true); break;
          case 'case': setShowCaseModal(true); break;
          case 'network': setSubTab('network'); break;
          case 'practice': onStartPractice(); break;
      }
  };

  const getDimensionData = (dim: WellnessDimension, score: number) => {
     let level: 'low' | 'mid' | 'high' = 'mid';
     if (score <= 20) level = 'low';
     else if (score >= 31) level = 'high';
     return { level, ...WELLNESS_STRATEGIES_DB[dim]?.[level] };
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {showWellnessModal && <WellnessAssessmentModal onClose={() => setShowWellnessModal(false)} onComplete={handleWellnessComplete} />}
      {showCaseModal && <CaseManagementModal currentFile={userState.caseFile} onClose={() => setShowCaseModal(false)} onSave={handleCaseFileSave} />}
      {showBaselineModal && <BaselineModal onClose={() => setShowBaselineModal(false)} onSave={handleBaselineSave} />}
      {activeClinicalAssessment && <ClinicalAssessmentModal assessmentId={activeClinicalAssessment} onClose={() => setActiveClinicalAssessment(null)} onComplete={handleClinicalComplete} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      {selectedPeer && <ConnectionModal peer={selectedPeer} onClose={() => setSelectedPeer(null)} />}

      <div className="relative mb-4 md:mb-8">
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                  <Settings size={20} />
              </button>
          </div>

          <div className="max-w-6xl mx-auto px-4 relative">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-4">
                  <div className="relative z-10">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white bg-white shadow-lg flex items-center justify-center text-6xl relative overflow-hidden">
                          <span className="z-10">{userProfile.avatar}</span>
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-100/50"></div>
                      </div>
                      <button className="absolute bottom-2 right-2 bg-slate-100 p-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-white transition-colors">
                          <Edit3 size={14} />
                      </button>
                  </div>

                  <div className="flex-1 text-center md:text-left mt-3 md:mt-0 md:ml-6 md:mb-4">
                      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{userProfile.name}</h1>
                      <p className="text-slate-500 font-medium text-sm md:text-base">@{userProfile.name.toLowerCase().replace(/\s/g, '')} • {userState.recoveryStage} Phase</p>
                      <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                          <span className="flex items-center"><Calendar size={14} className="mr-1" /> Joined April 2024</span>
                          <span className="flex items-center"><MapPin size={14} className="mr-1" /> Cincinnati, OH</span>
                      </div>
                  </div>

                  <div className="mt-4 md:mb-4 flex space-x-3">
                      <button 
                        onClick={() => onStartPractice()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center"
                      >
                          <Target size={16} className="mr-2" /> Train
                      </button>
                      <button 
                        onClick={() => setShowSettingsModal(true)}
                        className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                      >
                          Edit Profile
                      </button>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-4 text-lg">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="border-2 border-slate-100 rounded-2xl p-3 flex items-center space-x-3">
                          <Flame size={24} className="text-orange-500" fill="currentColor" />
                          <div>
                              <div className="font-extrabold text-slate-800 text-lg">{userState.streak}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</div>
                          </div>
                      </div>
                      <div className="border-2 border-slate-100 rounded-2xl p-3 flex items-center space-x-3">
                          <Zap size={24} className="text-yellow-500" fill="currentColor" />
                          <div>
                              <div className="font-extrabold text-slate-800 text-lg">{userState.xp}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Total XP</div>
                          </div>
                      </div>
                      <div className="border-2 border-slate-100 rounded-2xl p-3 flex items-center space-x-3">
                          <Shield size={24} className="text-emerald-500" fill="currentColor" />
                          <div>
                              <div className="font-extrabold text-slate-800 text-lg">Ruby</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Current League</div>
                          </div>
                      </div>
                      <div className="border-2 border-slate-100 rounded-2xl p-3 flex items-center space-x-3">
                          <Award size={24} className="text-indigo-500" fill="currentColor" />
                          <div>
                              <div className="font-extrabold text-slate-800 text-lg">1</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Top 3 Finishes</div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-2 text-lg">Data Security</h3>
                  <div className={`p-4 rounded-2xl flex items-start space-x-3 border ${isCloudEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                      <div className={`p-2 rounded-xl ${isCloudEnabled ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {isCloudEnabled ? <Cloud size={20} /> : <CloudOff size={20} />}
                      </div>
                      <div>
                          <h4 className={`text-sm font-bold ${isCloudEnabled ? 'text-emerald-800' : 'text-amber-800'}`}>
                              {isCloudEnabled ? 'Cloud Sync Active' : 'Local Storage Mode'}
                          </h4>
                          <p className={`text-[11px] font-medium leading-relaxed ${isCloudEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {isCloudEnabled 
                                ? 'Your recovery journey is backed up safely in the cloud.' 
                                : 'Supabase keys not detected. Progress is saved locally to this browser.'}
                          </p>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-extrabold text-slate-800 text-lg">Achievements</h3>
                      <button className="text-xs font-bold text-indigo-500 uppercase hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                      {ACHIEVEMENTS_LIST.slice(0, 2).map(ach => (
                          <div key={ach.id} className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${ach.color} text-white shadow-sm`}>
                                  {ach.icon}
                              </div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 text-sm">{ach.title}</h4>
                                  <div className="w-full h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                      <div className={`h-full ${ach.color} opacity-70`} style={{width: '70%'}}></div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 text-lg mb-4">Friends</h3>
                  <div className="flex justify-between text-sm font-bold text-slate-500 mb-6 border-b border-slate-100 pb-2">
                      <button className="flex-1 text-center hover:text-indigo-600 transition-colors">
                          <span className="block text-slate-800 text-lg font-extrabold">{connections.length}</span>
                          Following
                      </button>
                      <button className="flex-1 text-center hover:text-indigo-600 transition-colors">
                          <span className="block text-slate-800 text-lg font-extrabold">12</span>
                          Followers
                      </button>
                  </div>
                  
                  <div className="space-y-3">
                      <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                              <Search size={18} />
                          </div>
                          <span className="font-bold text-slate-600 text-sm group-hover:text-indigo-600">Find Friends</span>
                          <ChevronDown size={16} className="-rotate-90 ml-auto text-slate-300" />
                      </button>
                      <button className="w-full flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left group">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                              <Share2 size={18} />
                          </div>
                          <span className="font-bold text-slate-600 text-sm group-hover:text-indigo-600">Invite Friends</span>
                          <ChevronDown size={16} className="-rotate-90 ml-auto text-slate-300" />
                      </button>
                  </div>
              </div>
          </div>

          <div className="md:col-span-8">
            <div className="flex flex-wrap gap-2 pb-4 mb-2">
                  {PROFILE_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all
                        ${subTab === tab.id 
                            ? 'bg-slate-800 text-white shadow-md' 
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                      >
                          <tab.icon size={16} />
                          <span>{tab.label}</span>
                      </button>
                  ))}
              </div>

              <div className="animate-fade-in">
                  {subTab === 'mastery' && <CompetencyMirror scores={userState.competencies} />}

                  {subTab === 'feed' && (
                      <div className="space-y-6">
                          <div className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
                              {!isPosting ? (
                                  <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">{userProfile.avatar}</div>
                                      <button 
                                        onClick={() => setIsPosting(true)}
                                        className="flex-1 text-left bg-slate-50 hover:bg-slate-100 text-slate-500 font-medium py-3 px-4 rounded-2xl transition-colors text-sm"
                                      >
                                          Share your milestone or thoughts...
                                      </button>
                                  </div>
                              ) : (
                                  <div className="animate-slide-in-bottom">
                                      <textarea 
                                        className="w-full bg-slate-50 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none" 
                                        rows={3} 
                                        placeholder="Share your milestone..." 
                                        value={newPostContent} 
                                        onChange={(e) => setNewPostContent(e.target.value)} 
                                      />
                                      {postSafetyWarning && (
                                          <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-xl flex items-start space-x-2 text-xs font-bold text-red-600">
                                              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                              <div><p>Hold up. Our AI flagged this:</p><p className="font-normal">{postSafetyWarning}</p></div>
                                          </div>
                                      )}
                                      <div className="flex justify-end mt-3 space-x-2">
                                          <button onClick={() => setIsPosting(false)} className="px-4 py-2 text-slate-400 font-bold text-xs hover:text-slate-600">Cancel</button>
                                          <button 
                                            onClick={handlePostSubmit} 
                                            disabled={isValidatingPost || !newPostContent.trim()} 
                                            className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 disabled:opacity-50 hover:bg-indigo-600 transition-colors"
                                          >
                                              {isValidatingPost ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                              <span>Post</span>
                                          </button>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {FEED_POSTS.map(post => (
                              <div key={post.id} className="bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden">
                                  <div className="p-5 flex items-start space-x-4">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm border-b-4 border-black/10 ${post.role === 'Staff' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>{post.author[0]}</div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <div><h4 className="font-bold text-slate-800 text-sm">{post.author}</h4><span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{post.role} • {post.time}</span></div>
                                              {post.type === 'announcement' && <span className="bg-rose-100 text-rose-600 text-[10px] font-extrabold px-2 py-1 rounded-lg uppercase tracking-wide">Official</span>}
                                          </div>
                                          <p className="mt-3 text-slate-600 text-sm leading-relaxed font-medium">{post.content}</p>
                                          {post.type === 'video' && <div className={`mt-4 w-full h-48 rounded-2xl ${post.thumbnail} flex items-center justify-center relative group cursor-pointer border-2 border-slate-900/10 overflow-hidden`}><div className="absolute inset-0 bg-slate-800"></div><div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform border-2 border-white/50 relative z-10"><Video className="text-white fill-current ml-1" size={24} /></div></div>}
                                      </div>
                                  </div>
                                  <div className="px-5 py-4 bg-slate-50 border-t-2 border-slate-100 flex justify-between items-center text-slate-400">
                                      <button className="flex items-center space-x-2 hover:text-blue-500 text-xs font-bold transition-colors"><ThumbsUp size={18} /><span>{post.likes}</span></button>
                                      <button className="flex items-center space-x-2 hover:text-blue-500 text-xs font-bold transition-colors"><Share2 size={18} /><span>Share</span></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {subTab === 'stats' && (
                      <div className="space-y-6">
                          <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-extrabold text-slate-700 flex items-center text-sm uppercase tracking-wide">
                                      <Star className="mr-2 text-yellow-500 fill-yellow-500" size={16} />
                                      Priority Actions
                                  </h3>
                                  <span className="text-[10px] font-bold text-slate-400">{priorityTasks?.length || 0} Pending</span>
                              </div>
                              <div className="space-y-3">
                                  {priorityTasks && priorityTasks.length > 0 ? priorityTasks.map((task) => (
                                      <button 
                                        key={task.id}
                                        onClick={() => handleTaskAction(task)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 shadow-sm transition-all flex items-center justify-between group
                                        ${task.priorityLevel === 'critical' ? 'bg-rose-50 border-rose-200 hover:border-rose-300' : 
                                          task.priorityLevel === 'high' ? 'bg-indigo-50 border-indigo-200 hover:border-indigo-300' : 
                                          'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
                                      >
                                          <div className="flex items-center space-x-4">
                                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                                  ${task.priorityLevel === 'critical' ? 'bg-rose-200 text-rose-700' : 
                                                    task.priorityLevel === 'high' ? 'bg-indigo-200 text-indigo-700' : 
                                                    'bg-white text-slate-500'}`}>
                                                  <task.icon size={20} />
                                              </div>
                                              <div>
                                                  <h4 className={`font-bold text-sm ${task.priorityLevel === 'critical' ? 'text-rose-800' : 'text-slate-800'}`}>{task.title}</h4>
                                                  <p className="text-xs font-medium opacity-80">{task.subtitle}</p>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <span className="text-[10px] font-black text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md flex items-center justify-end">
                                                  +{task.xpReward} XP
                                              </span>
                                          </div>
                                      </button>
                                  )) : (
                                      <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-center">
                                          <CheckCircle className="mx-auto text-emerald-500 mb-2" size={24} />
                                          <p className="text-emerald-700 font-bold text-sm">All priorities clear!</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-extrabold text-slate-700 flex items-center text-lg"><Briefcase className="mr-2 text-blue-500" size={20} />8 Dimensions</h3>
                                <button onClick={() => setShowWellnessModal(true)} className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                    {wellnessScores ? 'Update' : 'Start Assessment'}
                                </button>
                            </div>
                            
                            {!wellnessScores ? (
                                <div className="text-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm font-bold mb-3">No wellness data yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {priorityDimension && (
                                        <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start space-x-3">
                                            <AlertCircle className="text-orange-500 shrink-0" size={20} />
                                            <div>
                                                <h4 className="text-xs font-extrabold text-orange-700 uppercase tracking-wide mb-1">Focus: {priorityDimension}</h4>
                                                <p className="text-xs text-orange-800 font-medium leading-relaxed">
                                                    {getDimensionData(priorityDimension, wellnessScores[priorityDimension]).narrative}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {(Object.keys(wellnessScores) as WellnessDimension[]).map((dim) => {
                                        const score = wellnessScores[dim];
                                        const maxScore = 40;
                                        const percentage = (score / maxScore) * 100;
                                        const data = getDimensionData(dim, score);
                                        const isExpanded = expandedDimension === dim;
                                        let color = "bg-blue-400";
                                        if (data.level === 'low') color = "bg-rose-400";
                                        if (data.level === 'high') color = "bg-emerald-400";

                                        return (
                                            <div key={dim} className={`border-2 rounded-2xl transition-all overflow-hidden ${isExpanded ? 'border-slate-300 bg-white shadow-md' : 'border-transparent bg-slate-50 hover:bg-white hover:border-slate-100'}`}>
                                                <button onClick={() => setExpandedDimension(isExpanded ? null : dim)} className="w-full flex flex-col p-3">
                                                    <div className="flex justify-between items-center w-full mb-2">
                                                        <div className="flex items-center">
                                                            <span className="font-bold text-slate-700 text-sm mr-2">{dim}</span>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${data.level === 'low' ? 'bg-rose-100 text-rose-600' : data.level === 'high' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{data.rangeLabel}</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400">{score}/{maxScore}</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-full">
                                                        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 animate-slide-in-bottom">
                                                        <p className="text-xs text-slate-600 font-medium italic mb-2">"{data.narrative}"</p>
                                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1">Strategies</p>
                                                        <ul className="space-y-1">
                                                            {data.strategies.map((strat, i) => (
                                                                <li key={i} className="flex items-start text-xs text-slate-700 font-bold">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-2 shrink-0"></div>{strat}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                          </div>
                      </div>
                  )}

                  {subTab === 'case_file' && (
                      <div className="space-y-6">
                         <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-extrabold text-xl mb-2 flex items-center"><FileText className="mr-2" /> RORS Tracker</h3>
                                <p className="text-slate-300 text-sm mb-4 font-medium">Reach One Recovery System: From Stabilization to Self-Actualization.</p>
                                <button onClick={() => setShowCaseModal(true)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wide shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1">
                                    {userState.caseFile ? 'Manage File' : 'Initialize'}
                                </button>
                            </div>
                         </div>
                         {userState.caseFile && (
                             <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200 grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded-xl border-l-4 ${userState.caseFile.dignity.stateId ? 'bg-emerald-50 border-l-emerald-500' : 'bg-rose-50 border-l-rose-500'}`}>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">ID Status</span>
                                    <span className={`text-sm font-bold ${userState.caseFile.dignity.stateId ? 'text-emerald-700' : 'text-rose-700'}`}>{userState.caseFile.dignity.stateId ? 'Secured' : 'Missing'}</span>
                                </div>
                                <div className={`p-3 rounded-xl border-l-4 ${userState.caseFile.recovery.hasSponsor ? 'bg-emerald-50 border-l-emerald-500' : 'bg-amber-50 border-l-amber-500'}`}>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Sponsor</span>
                                    <span className={`text-sm font-bold ${userState.caseFile.recovery.hasSponsor ? 'text-emerald-700' : 'text-amber-700'}`}>{userState.caseFile.recovery.hasSponsor ? 'Active' : 'Needed'}</span>
                                </div>
                                 <div className={`p-3 rounded-xl border-l-4 bg-emerald-50 border-l-emerald-500`}>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Medical Home</span>
                                    <span className={`text-sm font-bold ${userState.caseFile.health.hasPCP ? 'text-emerald-700' : 'text-slate-600'}`}>{userState.caseFile.health.hasPCP ? 'Established' : 'None'}</span>
                                </div>
                                 <div className={`p-3 rounded-xl border-l-4 bg-blue-50 border-l-blue-500`}>
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Employment</span>
                                    <span className="text-sm font-bold text-blue-700">{userState.caseFile.purpose.employmentStatus}</span>
                                </div>
                             </div>
                         )}
                      </div>
                  )}

                  {subTab === 'clinical' && <ClinicalProfile />}
                  
                  {subTab === 'quality' && <HealthMetricsDashboard />}
                  
                  {subTab === 'health' && (
                      <div className="space-y-6">
                          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
                              <h3 className="font-extrabold text-slate-800 mb-2 flex items-center text-lg"><Stethoscope className="mr-2 text-emerald-500" size={20} />Health Quests</h3>
                              <div className="space-y-4 mt-4">
                                  {HEDIS_QUESTS.map(quest => {
                                      const isComplete = completedQuests?.includes(quest.id) || false;
                                      return (
                                      <div key={quest.id} className="flex items-start space-x-4 p-4 rounded-2xl border-2 border-slate-50 bg-slate-50">
                                          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>{isComplete ? <CheckCircle size={20} /> : <div className="w-3 h-3 rounded-full bg-slate-200"></div>}</div>
                                          <div className="flex-1"><div className="flex justify-between items-start"><h4 className={`font-bold text-sm ${isComplete ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{quest.title}</h4><span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-bold">+{quest.xpReward} XP</span></div><p className="text-xs text-slate-500 mt-1 mb-2 leading-relaxed">{quest.description}</p>
                                          {!isComplete && <button onClick={() => quest.id === 'q4' ? setActiveClinicalAssessment('PHQ_9') : onCompleteQuest(quest.xpReward, quest.title, quest.id)} className="text-[10px] font-bold bg-slate-700 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform">{quest.id === 'q4' ? 'Start Assessment' : 'Mark Done'}</button>}
                                          </div>
                                      </div>
                                  )})}
                              </div>
                          </div>
                      </div>
                  )}

                  {subTab === 'assessments' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <div className="w-full bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
                          <h3 className="font-extrabold text-slate-800 mb-4 flex items-center"><Activity className="mr-2 text-rose-500" />Clinical Screenings</h3>
                          <div className="grid grid-cols-2 gap-3">
                              {['GAD_7', 'PHQ_9', 'AUDIT_C', 'DAST_10'].map(id => (
                                  <button key={id} onClick={() => setActiveClinicalAssessment(id)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200">
                                      <span className="block font-bold text-sm text-slate-700">{id.replace('_', '-')}</span>
                                      <span className="text-[10px] text-slate-400">Tap to start</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="w-full bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
                          <div className="flex items-center mb-4"><div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mr-4"><Brain size={24} /></div><div><h3 className="font-extrabold text-slate-800">The Mirror</h3><p className="text-xs font-bold text-emerald-500 uppercase">{personalityProfile ? 'Completed' : 'Pending'}</p></div></div>
                          {!personalityProfile && <button onClick={onStartAssessment} className="w-full bg-indigo-500 text-white font-bold py-3 rounded-xl">Begin Personality Assessment</button>}
                      </div>
                    </div>
                  )}

                  {subTab === 'ai_sponsor' && (
                    <div className="h-[60vh] bg-white rounded-3xl border-2 border-slate-200 flex flex-col overflow-hidden shadow-sm">
                      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center space-x-3">
                         <div className="relative"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div><div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><User size={20} /></div></div>
                        <div><span className="block text-sm font-extrabold text-slate-700">AI Sponsor</span><span className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Online Now</span></div>
                      </div>
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/50">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border-2 border-slate-100 text-slate-600 rounded-tl-none'}`}>{msg.text}</div>
                          </div>
                        ))}
                        {isChatLoading && (<div className="flex justify-start"><div className="bg-white border-2 border-slate-100 p-4 rounded-2xl rounded-tl-none flex space-x-1 items-center"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div></div></div>)}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="p-3 border-t-2 border-slate-200 bg-white">
                        <div className="relative flex items-center">
                          <input type="text" value={chatInputText} onChange={(e) => setChatInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Message your sponsor..." className="w-full pl-4 pr-12 py-3.5 bg-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-colors text-slate-700 placeholder:text-slate-400" />
                          <button onClick={handleSendMessage} disabled={!chatInputText.trim() || isChatLoading} className="absolute right-2 p-2 bg-blue-500 rounded-xl text-white disabled:opacity-50 hover:bg-blue-600 transition-colors"><Send size={18} /></button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
