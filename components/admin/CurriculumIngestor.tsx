
import React, { useState } from 'react';
import { generateCurriculumBlocks } from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import { Save, Wand2, Loader2, Play, Eye, Code, CheckCircle, AlertTriangle } from 'lucide-react';
import { ContentBlock } from '../../types';

export const CurriculumIngestor: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [generatedJson, setGeneratedJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState<'code' | 'json'>('json');

  const handleGenerate = async () => {
    setIsLoading(true);
    setSaveStatus('idle');
    try {
      const blocks = await generateCurriculumBlocks(rawText);
      setGeneratedJson(JSON.stringify(blocks, null, 2));
    } catch (error) {
      console.error(error);
      alert("AI Generation failed. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    try {
      const contentBlocks = JSON.parse(generatedJson);
      
      // In a real app, you'd pick a Unit ID from a list
      const { error } = await supabase.from('curriculum_nodes').insert({
        title: "AI Generated Module",
        type: "lesson",
        content_blocks: contentBlocks,
        xp_reward: 100,
        unit_id: '00000000-0000-0000-0000-000000000000' // Placeholder
      });

      if (error) throw error;
      setSaveStatus('success');
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in p-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Wand2 className="text-indigo-400" /> Curriculum Ingestor
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Convert raw clinical text to Neural Flow blocks</p>
          </div>
          <div className="flex items-center space-x-2">
              <button 
                onClick={() => setPreviewMode('json')} 
                className={`p-2 rounded-lg transition-colors ${previewMode === 'json' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                  <Eye size={18} />
              </button>
              <button 
                onClick={() => setPreviewMode('code')} 
                className={`p-2 rounded-lg transition-colors ${previewMode === 'code' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                  <Code size={18} />
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        {/* INPUT PANE */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Raw Source Text</h3>
            <span className="text-[10px] font-bold text-slate-600">{rawText.length} characters</span>
          </div>
          <textarea 
            className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-sm font-medium text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none scrollbar-hide"
            placeholder="Paste raw lesson content, PDF extracts, or clinical notes here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading || !rawText}
            className="group py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/40 active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={24} className="group-hover:rotate-12 transition-transform" />}
            <span>{isLoading ? 'Synthesizing...' : 'Architect Interactions'}</span>
          </button>
        </div>

        {/* PREVIEW/OUTPUT PANE */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Neural Flow Blueprint</h3>
          <div className="flex-1 relative group">
            <textarea 
              readOnly={previewMode === 'json'}
              className="w-full h-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-xs font-mono text-emerald-400 focus:border-emerald-500 outline-none scrollbar-hide"
              value={generatedJson}
              onChange={(e) => setGeneratedJson(e.target.value)}
              placeholder="Structure will appear here after generation..."
            />
            {generatedJson && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <span className="text-[9px] font-black bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">VALID JSON</span>
                </div>
            )}
          </div>
          
          <div className="space-y-3">
              <button 
                onClick={handleSaveToDB}
                disabled={!generatedJson || isLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <Save size={20} />
                <span>Save to Neural Registry</span>
              </button>
              
              {saveStatus === 'success' && (
                  <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm animate-fade-in bg-emerald-950/40 py-2 rounded-xl border border-emerald-500/20">
                      <CheckCircle size={16} />
                      <span>Blueprint Locked & Loaded</span>
                  </div>
              )}
              {saveStatus === 'error' && (
                  <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-sm animate-fade-in bg-rose-950/40 py-2 rounded-xl border border-rose-500/20">
                      <AlertTriangle size={16} />
                      <span>Registry Sync Failed</span>
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
