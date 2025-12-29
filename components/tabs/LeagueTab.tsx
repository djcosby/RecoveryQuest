
import React, { useMemo } from 'react';
import { Shield, Clock, Lock, AlertTriangle, TrendingUp, CheckCircle, Flame, MessageSquare, ThumbsUp, Video } from 'lucide-react';
import { usePeerStore } from '../../context/PeerContext';
import { useUserStore } from '../../context/UserContext';
import { ConnectionModal } from '../modals/ConnectionModal';
import { Peer, RecoveryStage } from '../../types';
import { FEED_POSTS } from '../../constants';

// --- MASLOW / CHANGE MODEL LEAGUE DEFINITIONS ---
const LEAGUE_TIERS = [
  { id: 1, name: 'Survival', color: 'bg-slate-800 border-slate-600', icon: '⛺', maslow: 'Physiological', stage: 'Pre-Contemplation' },
  { id: 2, name: 'Safety', color: 'bg-stone-500 border-stone-400', icon: '🛡️', maslow: 'Safety', stage: 'Contemplation' },
  { id: 3, name: 'Connection', color: 'bg-amber-700 border-amber-600', icon: '🔥', maslow: 'Belonging', stage: 'Preparation' },
  { id: 4, name: 'Esteem', color: 'bg-slate-300 border-slate-400', icon: '⚔️', maslow: 'Esteem', stage: 'Action' },
  { id: 5, name: 'Purpose', color: 'bg-yellow-400 border-yellow-500', icon: '👑', maslow: 'Actualization', stage: 'Maintenance' },
  { id: 6, name: 'Legacy', color: 'bg-cyan-400 border-cyan-500', icon: '💎', maslow: 'Transcendence', stage: 'Growth' },
];

export const LeagueTab: React.FC = () => {
  const { peers } = usePeerStore();
  const { state: user, claimDailyQuest } = useUserStore();
  const [selectedPeer, setSelectedPeer] = React.useState<Peer | null>(null);

  // --- LOGIC: DETERMINE CURRENT LEAGUE ---
  const currentLeagueIndex = useMemo(() => {
      if (user.xp < 500) return 0; // Survival
      if (user.xp < 1500) return 1; // Safety
      if (user.xp < 3000) return 2; // Connection
      if (user.xp < 6000) return 3; // Esteem
      if (user.xp < 10000) return 4; // Purpose
      return 5; // Legacy
  }, [user.xp]);

  const currentLeague = LEAGUE_TIERS[currentLeagueIndex];

  // --- LOGIC: EMPTY CALORIES CHECK ---
  const discrepancyWarning = useMemo(() => {
      const stageMap: Record<RecoveryStage, number> = {
          'Onboarding': 0,
          'Stabilization': 1,
          'Action': 3,
          'Maintenance': 4,
          'Growth': 5
      };
      const clinicalLevel = stageMap[user.recoveryStage] || 0;
      if (currentLeagueIndex > clinicalLevel + 1) {
          return {
              isDiscrepant: true,
              message: "High Activity, Low Stability.",
              subtext: "You are grinding 'Empty Calories'. Your XP is high, but your Case File indicates you haven't secured your base needs (Housing/ID).",
              action: "Focus on Case File"
          };
      }
      return null;
  }, [currentLeagueIndex, user.recoveryStage]);

  const userAsPeer: Peer = {
      id: 'current-user',
      name: user.profile.name || 'You',
      avatar: user.profile.avatar,
      xp: user.xp,
      streak: user.streak,
      level: user.level,
      role: 'Hero',
      tags: [],
      status: 'online',
      lastActive: 'Now',
      bio: user.profile.bio
  };

  const allParticipants = [...peers, userAsPeer].sort((a, b) => b.xp - a.xp);

  return (
    <div className="pb-24 pt-6 animate-slide-in-right min-h-screen bg-white">
      
      {selectedPeer && (
        <ConnectionModal peer={selectedPeer} onClose={() => setSelectedPeer(null)} />
      )}

      {/* HEADER & LEAGUE RIBBON */}
      <div className="bg-white z-10 border-b-2 border-slate-100 pb-6 mb-6">
          <div className="px-4 py-4 overflow-x-auto scrollbar-hide">
              <div className="flex justify-between items-center min-w-[320px] px-2 relative max-w-4xl mx-auto">
                  <div className="absolute left-4 right-4 top-1/2 h-1 bg-slate-100 -z-10"></div>
                  {LEAGUE_TIERS.map((tier, idx) => {
                      const isUnlocked = idx <= currentLeagueIndex;
                      const isCurrent = idx === currentLeagueIndex;
                      return (
                          <div key={tier.id} className="flex flex-col items-center group relative">
                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-4 shadow-sm transition-all duration-300 z-10
                                  ${isCurrent ? `${tier.color} scale-125 shadow-lg` : isUnlocked ? 'bg-white border-slate-200 text-slate-300 grayscale' : 'bg-slate-100 border-slate-100 text-slate-200'}
                              `}>
                                  {isUnlocked ? <span className="text-lg md:text-xl">{tier.icon}</span> : <Lock size={14} />}
                              </div>
                              {isCurrent && (
                                  <div className="absolute -bottom-6 whitespace-nowrap">
                                      <span className="text-[10px] font-extrabold uppercase bg-slate-800 text-white px-2 py-0.5 rounded-full">{tier.name}</span>
                                  </div>
                              )}
                          </div>
                      );
                  })}
              </div>
          </div>

          <div className="text-center mt-4 px-4">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{currentLeague.name} League</h2>
              <div className="text-xs font-bold text-slate-400 flex justify-center items-center gap-2 uppercase tracking-wide mt-1">
                  <span>Maslow Level: {currentLeague.maslow}</span>
                  <span>•</span>
                  <span>{currentLeague.stage} Stage</span>
              </div>
              <div className="flex justify-center items-center mt-3 text-orange-500 font-bold text-sm">
                  <Clock size={14} className="mr-1" />
                  <span>4 hours remaining</span>
              </div>
          </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: LEADERBOARD LIST (2/3) */}
          <div className="lg:col-span-2 space-y-6">
              {discrepancyWarning && (
                  <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-4 flex items-start space-x-3 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 text-rose-100 opacity-50"><AlertTriangle size={80} /></div>
                      <div className="bg-white p-2 rounded-xl border border-rose-100 shadow-sm z-10"><TrendingUp size={24} className="text-rose-500" /></div>
                      <div className="flex-1 z-10">
                          <h4 className="font-extrabold text-rose-700 text-sm uppercase tracking-wide">Reality Check</h4>
                          <p className="font-bold text-slate-800 text-sm mt-1">{discrepancyWarning.message}</p>
                          <p className="text-xs text-rose-600/80 font-medium mt-1 leading-relaxed">{discrepancyWarning.subtext}</p>
                      </div>
                  </div>
              )}

              <div className="space-y-1">
                {allParticipants.map((participant, index) => {
                    const rank = index + 1;
                    const isUser = participant.id === 'current-user';
                    const isPromoted = rank <= 5;
                    const showPromotionLine = rank === 6;

                    return (
                        <React.Fragment key={participant.id}>
                            {showPromotionLine && (
                                <div className="flex items-center justify-center my-4 space-x-2 py-2">
                                    <div className="h-px w-full bg-emerald-200"></div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase whitespace-nowrap px-2">Promotion Zone</span>
                                    <div className="h-px w-full bg-emerald-200"></div>
                                </div>
                            )}
                            <button 
                                onClick={() => !isUser && setSelectedPeer(participant)}
                                className={`w-full flex items-center p-3 rounded-2xl transition-all border-b-4 active:border-b-0 active:translate-y-1 relative overflow-hidden group
                                    ${isUser ? 'bg-indigo-50 border-indigo-200 border-b-indigo-300' : 'bg-white border-slate-200 border-b-slate-300 hover:bg-slate-50'}`}
                            >
                                <div className="w-8 font-bold text-lg text-center mr-4 relative z-10">
                                    {rank <= 3 ? (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-md ${rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-400' : 'bg-orange-400'}`}>{rank}</div>
                                    ) : (
                                        <span className="text-slate-400">{rank}</span>
                                    )}
                                </div>
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mr-4 relative border-2 border-slate-200 z-10 group-hover:scale-110 transition-transform">
                                    {participant.avatar}
                                    {participant.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>}
                                </div>
                                <div className="flex-1 text-left z-10">
                                    <div className={`font-bold text-sm ${isUser ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {participant.name} {isUser && '(You)'}
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold flex items-center">
                                        {participant.xp} XP <span className="mx-1">•</span> <Flame size={10} className="text-orange-500 mr-0.5" /> {participant.streak}
                                    </div>
                                </div>
                                {rank === 1 && <span className="text-2xl mr-2">👑</span>}
                                {isPromoted && rank > 1 && <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">▲ Rising</span>}
                            </button>
                        </React.Fragment>
                    );
                })}
              </div>
          </div>

          {/* RIGHT COL: WIDGETS (1/3) */}
          <div className="space-y-6">
              
              {/* Daily Quests Widget */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-4 text-sm uppercase tracking-wide flex items-center">
                      <Shield className="mr-2 text-indigo-500" size={16} /> Daily Quests
                  </h3>
                  <div className="space-y-3">
                      {user.dailyQuests.map(q => {
                          const isReady = !q.isClaimed && q.progress >= q.target;
                          const isDone = q.isClaimed;
                          return (
                              <div key={q.id} className={`flex items-center justify-between p-3 rounded-2xl border-2 ${isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100'}`}>
                                  <div className="flex items-center space-x-3">
                                      <div className="text-xl">{q.icon}</div>
                                      <div>
                                          <div className="text-xs font-bold text-slate-700">{q.label}</div>
                                          <div className="text-[10px] font-bold text-slate-400">{q.progress}/{q.target}</div>
                                      </div>
                                  </div>
                                  {isReady ? (
                                      <button onClick={() => claimDailyQuest(q.id)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 p-2 rounded-xl shadow-sm animate-bounce"><CheckCircle size={16} /></button>
                                  ) : isDone ? (
                                      <CheckCircle size={16} className="text-emerald-500" />
                                  ) : (
                                      <div className="w-12 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${(q.progress/q.target)*100}%`}}></div></div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>

              {/* Community Pulse (Feed) Widget */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                  <h3 className="font-extrabold text-slate-800 mb-4 text-sm uppercase tracking-wide flex items-center">
                      <MessageSquare className="mr-2 text-emerald-500" size={16} /> Community Pulse
                  </h3>
                  <div className="space-y-4">
                      {FEED_POSTS.slice(0, 3).map(post => (
                          <div key={post.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                              <div className="flex items-start space-x-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm ${post.role === 'Staff' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                      {post.author[0]}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                          <h4 className="font-bold text-slate-800 text-xs">{post.author}</h4>
                                          <span className="text-[9px] font-bold text-slate-400">{post.time}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{post.content}</p>
                                      {post.type === 'video' && <div className="mt-2 text-[10px] flex items-center text-indigo-500 font-bold"><Video size={12} className="mr-1" /> Video Attached</div>}
                                      <div className="flex mt-2 space-x-3 text-[10px] font-bold text-slate-400">
                                          <button className="flex items-center hover:text-indigo-500"><ThumbsUp size={10} className="mr-1" /> {post.likes}</button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-xs font-extrabold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                      View Full Feed
                  </button>
              </div>

          </div>
      </div>
    </div>
  );
};
