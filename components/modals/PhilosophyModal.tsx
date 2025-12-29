
import React, { useState } from 'react';
import { X, Map, Target, Compass, Lock, BookOpen } from 'lucide-react';

export const PhilosophyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<'mission' | 'strategy' | 'paths'>('mission');

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800">The Blueprint</h3>
              <p className="text-xs text-slate-500 font-bold">Our Philosophy & Strategy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
            <button 
                onClick={() => setActiveSection('mission')}
                className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-wide transition-colors ${activeSection === 'mission' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Mission
            </button>
            <button 
                onClick={() => setActiveSection('strategy')}
                className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-wide transition-colors ${activeSection === 'strategy' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
                The Foundation
            </button>
            <button 
                onClick={() => setActiveSection('paths')}
                className={`flex-1 py-4 text-xs font-extrabold uppercase tracking-wide transition-colors ${activeSection === 'paths' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Pathways
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            
            {activeSection === 'mission' && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                        <Target size={24} />
                        <h2 className="text-2xl font-extrabold text-slate-800">Purpose Over Abstinence</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        RecoveryQuest isn't just about stopping a behavior; it's about building the skills necessary to obtain the life you actually want to live.
                    </p>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        We believe that addiction is often a symptom of unmet needs—loss of connection, purpose, or identity. By gamifying the reconstruction of your life, we turn the daunting mountain of recovery into a series of climbable steps.
                    </p>
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 mb-2">Our Core Belief</h4>
                        <p className="text-sm text-indigo-700 italic">
                            "You don't recover to get your life back. You recover to build a life you don't need to escape from."
                        </p>
                    </div>
                </div>
            )}

            {activeSection === 'strategy' && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                        <Map size={24} />
                        <h2 className="text-2xl font-extrabold text-slate-800">The First 30 Days</h2>
                    </div>
                    
                    <div className="relative pl-8 border-l-2 border-slate-200 space-y-8 py-2">
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                            <h4 className="font-bold text-slate-800">1. Stabilization</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Everyone starts on the same path. The first phase focuses on "The Case File"—securing your safety, housing, food, and identity. We cannot build a skyscraper on a swamp.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                            <h4 className="font-bold text-slate-800">2. Assessment & Calibration</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                During levels 1-3, you will complete the Baseline, Wellness, and Personality assessments. This data helps the AI Architect identify exactly where you are in your journey.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                            <h4 className="font-bold text-slate-800">3. The Divergence</h4>
                            <p className="text-sm text-slate-500 mt-1">
                                Once stabilization is achieved (approx. Level 5), specialized pathways unlock. You will choose a methodology that aligns with your personality archetype and belief system.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'paths' && (
                <div className="space-y-6 animate-slide-in-right">
                    <div className="flex items-center space-x-3 text-blue-600 mb-2">
                        <BookOpen size={24} />
                        <h2 className="text-2xl font-extrabold text-slate-800">Unlockable Methodologies</h2>
                    </div>
                    <p className="text-slate-600 text-sm font-medium mb-4">
                        Different minds need different frameworks. Work through the Foundation Phase to unlock these specialized skill trees.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="border-2 border-slate-100 rounded-xl p-4 hover:border-amber-200 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-slate-700">🛡️ The Hero's Journey</span>
                                <Lock size={14} className="text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Based on narrative therapy and Jungian archetypes. Best for those who need to rewrite their self-story.</p>
                        </div>
                        
                        <div className="border-2 border-slate-100 rounded-xl p-4 hover:border-slate-300 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-slate-700">🏛️ The Stoic Path</span>
                                <Lock size={14} className="text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Based on CBT and ancient philosophy. Best for analytical minds who value logic and emotional regulation.</p>
                        </div>

                        <div className="border-2 border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-slate-700">🙏 12-Step Path</span>
                                <Lock size={14} className="text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">The classic spiritual program. Best for those seeking community, surrender, and spiritual connection.</p>
                        </div>

                        <div className="border-2 border-slate-100 rounded-xl p-4 hover:border-cyan-200 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-extrabold text-slate-700">🧠 SMART Recovery</span>
                                <Lock size={14} className="text-slate-400" />
                            </div>
                            <p className="text-xs text-slate-500">Self-Management and Recovery Training. Tools for urge surfing and lifestyle balance.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 text-center">
            <button onClick={onClose} className="text-indigo-600 font-bold text-sm hover:underline">Return to Journey</button>
        </div>
      </div>
    </div>
  );
};
