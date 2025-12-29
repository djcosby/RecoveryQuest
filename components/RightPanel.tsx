
import React from 'react';
import { Heart, Flame, Shield, Calendar, CheckCircle, Crown, Star } from 'lucide-react';
import { useUserStore } from '../context/UserContext';
import { LEAGUE_DATA } from '../constants';

export const RightPanel: React.FC<{ onShop: () => void }> = ({ onShop }) => {
  const { state: user, toggleUserTask, claimDailyQuest } = useUserStore();

  const todaysTasks = user.userTasks.filter(t => t.type === 'daily');

  return (
    <div id="stats-panel" className="hidden lg:block w-[350px] p-6 space-y-6 sticky top-0 h-screen overflow-y-auto bg-white border-l-2 border-slate-50 scrollbar-hide">
      {/* Vitals Stats Bar */}
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

      {/* Today's Plan Widget */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-700 mb-3 text-sm uppercase flex items-center">
          <Calendar size={16} className="mr-2 text-blue-500" /> Today's Plan
        </h3>
        <div className="space-y-2">
          {todaysTasks.length > 0 ? todaysTasks.slice(0, 3).map(task => (
            <button 
              key={task.id}
              onClick={() => toggleUserTask(task.id)}
              className="flex items-center space-x-2 w-full text-left group"
            >
              <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center shrink-0 
                ${task.isCompleted ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-300'}`}
              >
                {task.isCompleted && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className={`text-xs font-bold truncate ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                {task.text}
              </span>
            </button>
          )) : (
            <button className="flex items-center space-x-2 w-full text-left group">
              <div className="w-4 h-4 rounded border transition-colors flex items-center justify-center border-slate-300 group-hover:border-blue-300"></div>
              <span className="text-xs font-bold truncate text-slate-600">Drink 2L of water</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Quests Widget */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-700 mb-4 text-sm uppercase">Daily Quests</h3>
        <div className="space-y-4">
          {user.dailyQuests.map(q => {
            const isReady = !q.isClaimed && q.progress >= q.target;
            const isDone = q.isClaimed;
            return (
              <div key={q.id} className="flex items-center space-x-3">
                <div className="text-xl">{q.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">{q.label}</span>
                    <span className="text-slate-400">{q.progress}/{q.target}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full transition-all duration-500 ${isReady ? 'bg-emerald-400' : isDone ? 'bg-emerald-500' : 'bg-yellow-400'}`} 
                      style={{ width: `${Math.min(100, (q.progress/q.target)*100)}%` }}
                    />
                    {isReady && <button onClick={() => claimDailyQuest(q.id)} className="absolute inset-0 bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* League Preview Widget */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
        <h3 className="font-extrabold text-slate-700 mb-4 text-sm uppercase flex items-center">
          <Shield size={16} className="mr-2 text-indigo-500" /> Diamond League
        </h3>
        <div className="space-y-2">
          {LEAGUE_DATA.slice(0, 2).map((member, i) => (
            <div key={i} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <span className={`font-bold text-sm w-4 ${i === 0 ? 'text-yellow-500' : 'text-slate-400'}`}>{i + 1}</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm border border-slate-200">
                {member.avatarEmoji}
              </div>
              <span className="font-bold text-slate-600 text-sm flex-1 truncate">{member.name}</span>
              <span className="font-bold text-slate-400 text-xs">{member.xp} XP</span>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 text-xs font-extrabold text-indigo-500 uppercase tracking-wide hover:bg-indigo-50 rounded-xl transition-colors">
          View League
        </button>
      </div>

      {/* Shop Widget */}
      <div 
        onClick={onShop}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer shadow-lg shadow-indigo-100"
      >
        <div className="relative z-10">
          <h3 className="font-extrabold text-lg mb-1 flex items-center">
            <Crown size={20} className="mr-2 text-yellow-300 fill-yellow-300" /> Shop
          </h3>
          <p className="text-indigo-100 text-xs font-medium mb-3">Refill hearts, buy freeze tokens & customize your avatar.</p>
        </div>
        <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:text-white/20 transition-all duration-500">
          <Star size={80} fill="currentColor" />
        </div>
      </div>
    </div>
  );
};
