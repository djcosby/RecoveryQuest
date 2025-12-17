
import React from 'react';
import { Heart, Flame, Shield, Star, Crown, Calendar, CheckCircle } from 'lucide-react';
import { useUserStore } from '../context/UserContext';
import { LEAGUE_DATA } from '../constants';

export const RightPanel: React.FC<{ onShop: () => void }> = ({ onShop }) => {
  const { state: user, toggleUserTask } = useUserStore();

  const todaysTasks = user.userTasks.filter(t => t.type === 'daily').slice(0, 3);

  return (
    <div id="stats-panel" className="hidden lg:block w-[350px] p-6 space-y-6 sticky top-0 h-screen overflow-y-auto">
        {/* Top Stats Row */}
        <div className="flex justify-between items-center space-x-4">
            <div className="group relative flex items-center space-x-2 cursor-pointer" title="Hearts">
               <Heart size={24} className="text-rose-500 fill-rose-500" />
               <span className="font-extrabold text-rose-500 text-sm">{user.hearts}</span>
            </div>
            <div className="group relative flex items-center space-x-2 cursor-pointer" title="Streak">
               <Flame size={24} className="text-orange-500 fill-orange-500" />
               <span className="font-extrabold text-orange-500 text-sm">{user.streak}</span>
            </div>
            <div className="group relative flex items-center space-x-2 cursor-pointer" title="Gems" onClick={onShop}>
               <span className="text-xl">💎</span>
               <span className="font-extrabold text-emerald-500 text-sm">{user.gems}</span>
            </div>
        </div>

        {/* Today's Plan Widget (NEW) */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
            <h3 className="font-extrabold text-slate-700 mb-3 text-sm uppercase flex items-center">
                <Calendar className="mr-2 text-blue-500" size={16} /> Today's Plan
            </h3>
            {todaysTasks.length === 0 ? (
                <p className="text-xs text-slate-400">No tasks set for today.</p>
            ) : (
                <div className="space-y-2">
                    {todaysTasks.map(task => (
                        <button 
                            key={task.id} 
                            onClick={() => toggleUserTask(task.id)}
                            className="flex items-center space-x-2 w-full text-left group"
                        >
                            <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${task.isCompleted ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-300'}`}>
                                {task.isCompleted && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <span className={`text-xs font-bold truncate ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{task.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Daily Progress */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
            <h3 className="font-extrabold text-slate-700 mb-4 text-sm uppercase">Daily Quests</h3>
            <div className="space-y-4">
                {user.dailyQuests.map(q => (
                    <div key={q.id} className="flex items-center space-x-3">
                        <div className="text-xl">{q.icon}</div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-700">{q.label}</span>
                                <span className="text-slate-400">{q.progress}/{q.target}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(q.progress/q.target)*100}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* League Preview */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
            <h3 className="font-extrabold text-slate-700 mb-4 text-sm uppercase flex items-center">
                <Shield className="mr-2 text-indigo-500" size={16} /> Diamond League
            </h3>
            <div className="space-y-2">
                {LEAGUE_DATA.slice(0, 5).map((user, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50">
                        <span className={`font-bold text-sm w-4 ${i === 0 ? 'text-yellow-500' : 'text-slate-400'}`}>{user.rank}</span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">{user.avatarEmoji}</div>
                        <span className="font-bold text-slate-600 text-sm flex-1">{user.name}</span>
                        <span className="font-bold text-slate-400 text-xs">{user.xp} XP</span>
                    </div>
                ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-extrabold text-indigo-500 uppercase tracking-wide hover:bg-indigo-50 rounded-xl transition-colors">
                View League
            </button>
        </div>

        {/* Upgrade / Shop CTA */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer" onClick={onShop}>
            <div className="relative z-10">
                <h3 className="font-extrabold text-lg mb-1 flex items-center">
                    <Crown size={20} className="mr-2 text-yellow-300 fill-yellow-300" /> Shop
                </h3>
                <p className="text-indigo-100 text-xs font-medium mb-3">Refill hearts, buy freeze tokens & customize your avatar.</p>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:text-white/20 transition-colors">
                <Star size={80} fill="currentColor" />
            </div>
        </div>
    </div>
  );
};
