
import React, { useState } from 'react';
import { Trophy, CheckCircle, PlusCircle, Flame, Zap, Shield, Star, Lock, Calendar, ListTodo, Trash2, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';
import { ACHIEVEMENTS_LIST } from '../../constants';
import { DailyQuest, UserTask } from '../../types';

export const QuestsTab: React.FC = () => {
  const { state: user, claimDailyQuest, addXP, addUserTask, toggleUserTask, deleteUserTask } = useUserStore();
  const [activeTab, setActiveTab] = useState<'challenges' | 'plan'>('plan');
  
  // Planner State
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState<'daily' | 'weekly'>('daily');

  // Calculate league position (mock logic for demo)
  const currentLeague = "Emerald"; // In a real app, derive from LEAGUE_DATA

  const handleAddTask = () => {
      if (!newTaskText.trim()) return;
      addUserTask(newTaskText, newTaskType);
      setNewTaskText('');
  };

  const weeklyTasks = user.userTasks.filter(t => t.type === 'weekly');
  const dailyTasks = user.userTasks.filter(t => t.type === 'daily');

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen animate-fade-in">
      
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <Flame size={24} className="text-orange-500 mb-1" fill="currentColor" />
              <span className="font-extrabold text-slate-800 text-lg">{user.streak}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <Zap size={24} className="text-yellow-500 mb-1" fill="currentColor" />
              <span className="font-extrabold text-slate-800 text-lg">{user.xp}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total XP</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <Shield size={24} className="text-emerald-500 mb-1" fill="currentColor" />
              <span className="font-extrabold text-slate-800 text-lg">{currentLeague}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">League</span>
          </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-700 tracking-tight">Focus & Quests</h2>
        <div className="flex bg-slate-200 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${activeTab === 'plan' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
                <Calendar size={14} /> <span>My Plan</span>
            </button>
            <button 
                onClick={() => setActiveTab('challenges')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${activeTab === 'challenges' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
                <Trophy size={14} /> <span>Challenges</span>
            </button>
        </div>
      </div>

      {activeTab === 'plan' && (
          <div className="space-y-8 animate-slide-in-right">
              
              {/* Add Task Input */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
                  <div className="flex space-x-2 mb-3">
                      <button 
                        onClick={() => setNewTaskType('daily')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${newTaskType === 'daily' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'text-slate-400 bg-slate-50'}`}
                      >Today</button>
                      <button 
                        onClick={() => setNewTaskType('weekly')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${newTaskType === 'weekly' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'text-slate-400 bg-slate-50'}`}
                      >This Week</button>
                  </div>
                  <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        value={newTaskText} 
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder={newTaskType === 'daily' ? "Add a task for today..." : "Set a goal for this week..."}
                        className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400 transition-colors"
                      />
                      <button 
                        onClick={handleAddTask}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-xl shadow-md transition-transform active:scale-95"
                      >
                          <PlusCircle size={20} />
                      </button>
                  </div>
              </div>

              {/* Weekly Intentions */}
              <div>
                  <h3 className="font-extrabold text-slate-700 mb-3 flex items-center">
                      <Calendar className="mr-2 text-blue-500" size={18} /> Weekly Intentions
                  </h3>
                  {weeklyTasks.length === 0 ? (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <p className="text-xs font-bold text-slate-400">No weekly goals set yet.</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {weeklyTasks.map(task => (
                              <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${task.isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-blue-100 hover:border-blue-200'}`}>
                                  <div className="flex items-center space-x-3 flex-1">
                                      <button onClick={() => toggleUserTask(task.id)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                          {task.isCompleted && <CheckCircle size={16} />}
                                      </button>
                                      <span className={`text-sm font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                                  </div>
                                  <button onClick={() => deleteUserTask(task.id)} className="text-slate-300 hover:text-rose-400 p-2"><Trash2 size={16} /></button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* Daily Actions */}
              <div>
                  <h3 className="font-extrabold text-slate-700 mb-3 flex items-center">
                      <ListTodo className="mr-2 text-emerald-500" size={18} /> Today's Actions
                  </h3>
                  {dailyTasks.length === 0 ? (
                      <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <p className="text-xs font-bold text-slate-400">No daily tasks yet.</p>
                      </div>
                  ) : (
                      <div className="space-y-3">
                          {dailyTasks.map(task => (
                              <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${task.isCompleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-emerald-100 hover:border-emerald-200'}`}>
                                  {task.isSystemSuggested && (
                                      <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg border-b border-l border-yellow-200">
                                          Suggested
                                      </div>
                                  )}
                                  <div className="flex items-center space-x-3 flex-1">
                                      <button onClick={() => toggleUserTask(task.id)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                          {task.isCompleted && <CheckCircle size={16} />}
                                      </button>
                                      <div>
                                          <span className={`block text-sm font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                                          {task.category && <span className="text-[10px] text-slate-400 font-bold uppercase">{task.category} Focus</span>}
                                      </div>
                                  </div>
                                  <button onClick={() => deleteUserTask(task.id)} className="text-slate-300 hover:text-rose-400 p-2"><Trash2 size={16} /></button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'challenges' && (
          <div className="space-y-4 mb-8 animate-slide-in-right">
            
            {/* System Daily Quests */}
            <h3 className="font-extrabold text-slate-700 mb-2">Daily Challenges</h3>
            <div className="space-y-3">
                {user.dailyQuests.map(q => {
                    const isReadyToClaim = !q.isClaimed && q.progress >= q.target;
                    const isDone = q.isClaimed;
                    const progressPercent = Math.min(100, (q.progress / q.target) * 100);

                    return (
                        <div 
                            key={q.id}
                            className={`bg-white p-4 rounded-3xl border-2 shadow-sm flex items-center justify-between transition-all ${isDone ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'}`}
                        >
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                                    {q.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`font-bold text-sm ${isDone ? 'text-slate-400' : 'text-slate-700'}`}>{q.label}</h4>
                                        <span className="text-xs font-bold text-slate-400">{q.progress}/{q.target}</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-emerald-400' : 'bg-yellow-400'}`} 
                                            style={{ width: `${progressPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            {isReadyToClaim ? (
                                <button onClick={() => claimDailyQuest(q.id)} className="ml-4 bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl shadow-lg animate-bounce">
                                    <Star size={20} fill="currentColor" />
                                </button>
                            ) : isDone ? (
                                <div className="ml-4 text-emerald-500"><CheckCircle size={24} /></div>
                            ) : null}
                        </div>
                    );
                })}
            </div>

            <div className="w-full h-px bg-slate-200 my-6"></div>

            {/* Achievements */}
            <h3 className="font-extrabold text-slate-700 mb-2">Lifetime Achievements</h3>
            <div className="space-y-4">
                {ACHIEVEMENTS_LIST.map(ach => {
                    let currentProgress = 0;
                    if (ach.id === 'wildfire') currentProgress = user.streak;
                    if (ach.id === 'sage') currentProgress = user.xp;

                    const isUnlocked = currentProgress >= ach.target;
                    const progressPercent = Math.min(100, (currentProgress / ach.target) * 100);

                    return (
                        <div key={ach.id} className="bg-white p-4 rounded-2xl border-b-4 border-slate-200 flex items-start space-x-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border-2 ${isUnlocked ? `${ach.color} text-white border-transparent` : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                {isUnlocked ? ach.icon : <Lock size={24} />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-extrabold text-slate-800 text-sm mb-1">{ach.title}</h4>
                                <p className="text-xs text-slate-500 font-medium mb-3">{ach.description}</p>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                    <div className={`h-full ${ach.color.replace('bg-', 'bg-')}`} style={{ width: `${progressPercent}%` }}></div>
                                    <span className="absolute top-0 right-1 text-[8px] font-bold text-slate-500 leading-3">{currentProgress}/{ach.target}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
      )}
    </div>
  );
};
