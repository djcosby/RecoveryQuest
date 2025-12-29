import React, { useState } from 'react';
import { UserPlus, LogIn, ArrowRight, User } from 'lucide-react';
import { useUserStore } from '../context/UserContext';
/* Fixed missing supabase import */
import { supabase } from '../services/supabaseClient';

const AVATARS = ['🦁', '🐺', '🦊', '🦉', '🐻', '🦅', '🦋', '🐢'];

export const AuthScreen: React.FC = () => {
  const { login, register } = useUserStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  /* Moved handleSignup logic as helper */
  const handleSignupSupabase = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) console.error(error.message);
    return data;
  };

  // Get existing users from registry
  const existingUsers = JSON.parse(window.localStorage.getItem('rq_registry_v1') || '[]');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsBusy(true);
    
    if (!name.trim()) {
        setIsBusy(false);
        return;
    }

    if (mode === 'signup') {
      if (existingUsers.includes(name.trim().toLowerCase())) {
        setError('User already exists. Try logging in.');
        setIsBusy(false);
        return;
      }
      const success = await register(name, avatar);
      if (!success) setError("Could not create profile. Please try again.");
    } else {
      const success = await login(name);
      if (!success) setError('User not found. Create a profile first.');
    }
    setIsBusy(false);
  };

  const handleQuickLogin = async (username: string) => {
      setIsBusy(true);
      setError('');
      const success = await login(username);
      if (!success) {
          setError(`Could not load ${username}.`);
      }
      setIsBusy(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm border-2 border-indigo-50">
            🦁
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">RecoveryQuest</h1>
          <p className="text-slate-500 font-medium mt-2">Your journey, your path.</p>
        </div>

        {mode === 'login' && existingUsers.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Recent Profiles</p>
            <div className="space-y-2">
              {existingUsers.map((u: string) => (
                <button
                  key={u}
                  onClick={() => handleQuickLogin(u)}
                  disabled={isBusy}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-200 transition-all font-bold text-slate-700 capitalize flex justify-between items-center group disabled:opacity-50"
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-white p-1 rounded-md border border-slate-200"><User size={14} /></div>
                    <span>{u}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                </button>
              ))}
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or</span></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
             <div>
               <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Choose Avatar</label>
               <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-hide">
                 {AVATARS.map(a => (
                   <button type="button" key={a} onClick={() => setAvatar(a)} className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all shrink-0 ${avatar === a ? 'bg-indigo-100 border-indigo-500 scale-110' : 'border-slate-200 opacity-60'}`}>{a}</button>
                 ))}
               </div>
             </div>
          )}
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-1">
              {mode === 'login' ? 'Username' : 'Create Username'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all disabled:opacity-50"
              placeholder={mode === 'login' ? "Enter your name" : "e.g. SoberWarrior"}
            />
          </div>

          {error && <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2 rounded-lg text-center animate-pulse">{error}</p>}

          <button 
            type="submit" 
            disabled={isBusy}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isBusy ? (
                <span>Loading...</span>
            ) : (
                <>
                    {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                    <span>{mode === 'login' ? 'Resume Journey' : 'Start New Path'}</span>
                </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setName(''); }}
            disabled={isBusy}
            className="text-sm font-bold text-indigo-500 hover:text-indigo-600 disabled:opacity-50"
          >
            {mode === 'login' ? "New here? Create Profile" : "Already have a profile? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};
