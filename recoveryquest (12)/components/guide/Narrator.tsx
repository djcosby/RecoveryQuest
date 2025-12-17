
import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, StopCircle, Play, Sparkles, MessageCircle } from 'lucide-react';
import { generateSpeech, decodeBase64ToBytes, decodePCMData } from '../../services/geminiService';
import { TabId } from '../../types';

interface NarratorProps {
  activeTab: TabId;
  userLevel: number;
}

type GuideMode = 'welcome' | 'context' | 'philosophy' | 'idle';

export const Narrator: React.FC<NarratorProps> = ({ activeTab, userLevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<GuideMode>('idle');
  const [isTalking, setIsTalking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [script, setScript] = useState('');
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // --- SCRIPTS ---
  const SCRIPTS = {
    welcome: `Welcome, Traveler. I am Leo, your guide. You've taken the hardest step just by showing up. 
    
    The first 30 days are what we call "Stabilization." We aren't trying to climb the whole mountain today. We are just checking your boots. 
    
    Do you have an ID? Do you have food? Are you safe? We start small. We focus on who you are, not just what you're stopping. Let's build a foundation that can actually hold the weight of your new life.`,
    
    philosophy: `Our philosophy is simple: Purpose over Abstinence. 
    
    We believe addiction is often a solution to a problem—a loss of connection, identity, or hope. If we only take away the substance without fixing the foundation, the house collapses.
    
    Here, you earn XP not just for staying sober, but for building a life you don't need to escape from.`,
    
    context: {
      home: "This is your Path. It adapts to you. The nodes you see are lessons and check-ins. If you're stressed, the path changes to keep you safe. Keep moving forward, one step at a time.",
      practice: "Welcome to The Gym. This is where we build muscle memory. Use Emotional Kombat to fight triggers safely, or the Lexicon to learn the language of recovery. Train here so you're ready out there.",
      library: "Knowledge is power. Here you can upload your own texts or read the classics. I can even read them to you if your eyes are tired.",
      quests: "Focus and purpose. Check your Daily Quests here. Completing these small goals releases the same dopamine your brain is craving, but from a healthy source.",
      league: "Connection is the opposite of addiction. This is your community. Find a sponsor, see how others are doing, and remember: you are not alone in this fight.",
      profile: "This is your Mirror. Track your health vitals, manage your Case File, and see your clinical profile. It's the dashboard of your life.",
      silverbook: "The SilverBook is your map of resources. Need a meeting? Housing? Food? It's all verified here. Use the map to find what's near you.",
      feed: "Share your wins. The feed is a safe space to celebrate milestones or ask for help. Our AI safety guard ensures this remains a place of healing."
    }
  };

  // --- AUDIO LOGIC ---
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
    }
    setIsTalking(false);
  };

  const playAudio = async (text: string) => {
    stopAudio();
    setIsLoadingAudio(true);
    setIsTalking(true); // Start animation immediately for responsiveness

    try {
        const audioData = await generateSpeech(text);
        
        if (audioData) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            const bytes = decodeBase64ToBytes(audioData);
            const buffer = await decodePCMData(bytes, audioContextRef.current);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            sourceRef.current = source;
            
            source.onended = () => {
                setIsTalking(false);
            };
        }
    } catch (e) {
        console.error("Narrator TTS error", e);
        setIsTalking(false);
    } finally {
        setIsLoadingAudio(false);
    }
  };

  const handleActivate = (requestedMode: GuideMode) => {
      setIsOpen(true);
      setMode(requestedMode);
      
      let textToRead = "";
      if (requestedMode === 'welcome') textToRead = SCRIPTS.welcome;
      else if (requestedMode === 'philosophy') textToRead = SCRIPTS.philosophy;
      else if (requestedMode === 'context') textToRead = SCRIPTS.context[activeTab] || "I'm here to help.";

      setScript(textToRead);
      playAudio(textToRead);
  };

  const toggleOpen = () => {
      if (isOpen) {
          stopAudio();
          setIsOpen(false);
      } else {
          // Default to context help when opened via button
          handleActivate('context');
      }
  };

  return (
    <>
        {/* Floating Trigger Button */}
        <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[60] flex flex-col items-center space-y-2">
            
            {/* Guide Avatar */}
            <button 
                onClick={toggleOpen}
                className={`relative w-16 h-16 rounded-full shadow-xl border-4 transition-all duration-300 group
                ${isOpen ? 'bg-indigo-600 border-indigo-400 scale-110' : 'bg-white border-white hover:scale-105'}`}
            >
                <div className={`text-4xl flex items-center justify-center h-full w-full transition-transform ${isTalking ? 'animate-bounce' : ''}`}>
                    🦁
                </div>
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                        ?
                    </div>
                )}
            </button>
            <span className="bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                Guide
            </span>
        </div>

        {/* Dialog Bubble */}
        {isOpen && (
            <div className="fixed bottom-44 left-4 md:bottom-28 md:left-8 z-[60] w-[90vw] md:w-96 animate-slide-in-bottom">
                <div className="bg-white rounded-3xl rounded-bl-none shadow-2xl border-2 border-indigo-100 overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-2">
                            <Sparkles size={16} className="text-yellow-300" />
                            <span className="font-extrabold text-sm uppercase tracking-wider">Leo, The Guide</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isTalking ? (
                                <button onClick={stopAudio} className="p-1 hover:bg-white/20 rounded-full transition-colors"><StopCircle size={18} /></button>
                            ) : (
                                <button onClick={() => playAudio(script)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Play size={18} /></button>
                            )}
                            <button onClick={() => { stopAudio(); setIsOpen(false); }} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={18} /></button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-slate-50 min-h-[150px]">
                        {isLoadingAudio ? (
                            <div className="flex items-center justify-center space-x-2 text-indigo-400 py-4">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-100">●</span>
                                <span className="animate-bounce delay-200">●</span>
                            </div>
                        ) : (
                            <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line">
                                {script}
                            </p>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="bg-white p-3 border-t border-slate-100 flex overflow-x-auto space-x-2 scrollbar-hide">
                        <button 
                            onClick={() => handleActivate('welcome')}
                            disabled={mode === 'welcome'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${mode === 'welcome' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                        >
                            Start Over
                        </button>
                        <button 
                            onClick={() => handleActivate('philosophy')}
                            disabled={mode === 'philosophy'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${mode === 'philosophy' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                        >
                            Our Philosophy
                        </button>
                        <button 
                            onClick={() => handleActivate('context')}
                            disabled={mode === 'context'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${mode === 'context' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                        >
                            Explain This Page
                        </button>
                    </div>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-2 left-0 w-4 h-4 bg-indigo-100 transform rotate-45 border-b-2 border-r-2 border-indigo-100 hidden md:block"></div>
            </div>
        )}
    </>
  );
};
