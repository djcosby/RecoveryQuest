
import React from 'react';
import { Shield, Brain, Star, AlertCircle, Info } from 'lucide-react';
import { CompetencyScores, CompetencyDefinition } from '../../types';
import { COMPETENCY_CONFIG } from '../../constants';

interface CompetencyMirrorProps {
  scores: CompetencyScores;
}

export const CompetencyMirror: React.FC<CompetencyMirrorProps> = ({ scores }) => {
  
  const getRank = (config: CompetencyDefinition, score: number) => {
      const sortedRanks = [...config.ranks].sort((a, b) => b.min - a.min);
      return sortedRanks.find(r => score >= r.min)?.label || 'Unranked';
  };

  // Radar Chart Logic
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / COMPETENCY_CONFIG.length;

  const points = COMPETENCY_CONFIG.map((config, i) => {
      const score = scores[config.key] || 0;
      const normalized = (score / 100) * radius;
      const x = centerX + normalized * Math.cos(i * angleStep - Math.PI / 2);
      const y = centerY + normalized * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-2 border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* Radar Chart SVG */}
            <div className="relative">
                <svg width={size} height={size} className="drop-shadow-2xl">
                    {/* Background Grids */}
                    {gridLevels.map((level, i) => {
                        const r = radius * level;
                        const gridPoints = COMPETENCY_CONFIG.map((_, idx) => {
                            const x = centerX + r * Math.cos(idx * angleStep - Math.PI / 2);
                            const y = centerY + r * Math.sin(idx * angleStep - Math.PI / 2);
                            return `${x},${y}`;
                        }).join(' ');
                        return (
                            <polygon 
                                key={i} 
                                points={gridPoints} 
                                fill="none" 
                                stroke="rgba(255,255,255,0.05)" 
                                strokeWidth="1" 
                            />
                        );
                    })}
                    
                    {/* Axis Lines */}
                    {COMPETENCY_CONFIG.map((_, i) => {
                        const x = centerX + radius * Math.cos(i * angleStep - Math.PI / 2);
                        const y = centerY + radius * Math.sin(i * angleStep - Math.PI / 2);
                        return (
                            <line 
                                key={i} 
                                x1={centerX} 
                                y1={centerY} 
                                x2={x} 
                                y2={y} 
                                stroke="rgba(255,255,255,0.1)" 
                                strokeWidth="1" 
                            />
                        );
                    })}

                    {/* The Shape */}
                    <polygon 
                        points={points} 
                        fill="rgba(99, 102, 241, 0.4)" 
                        stroke="#818cf8" 
                        strokeWidth="3" 
                        className="animate-pulse"
                    />

                    {/* Labels */}
                    {COMPETENCY_CONFIG.map((config, i) => {
                        const x = centerX + (radius + 25) * Math.cos(i * angleStep - Math.PI / 2);
                        const y = centerY + (radius + 25) * Math.sin(i * angleStep - Math.PI / 2);
                        return (
                            <text 
                                key={i} 
                                x={x} 
                                y={y} 
                                textAnchor="middle" 
                                className="text-[10px] font-black uppercase fill-slate-400 tracking-tighter"
                            >
                                {config.label}
                            </text>
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
            </div>

            {/* Rank Callouts */}
            <div className="flex-1 space-y-4 w-full">
                <div className="mb-4">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Brain className="text-indigo-400" />
                        The Architect's Mirror
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Character Sheet Calibration</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {COMPETENCY_CONFIG.map(config => {
                        const score = scores[config.key];
                        const rank = getRank(config, score);
                        const isShadow = score < 35;
                        return (
                            <div key={config.key} className={`p-3 rounded-2xl border transition-all ${isShadow ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">{config.label}</span>
                                    <span className={`text-[10px] font-black ${isShadow ? 'text-rose-400' : 'text-indigo-400'}`}>{score}%</span>
                                </div>
                                <div className={`text-sm font-bold truncate ${isShadow ? 'text-rose-300' : 'text-white'}`}>
                                    {rank}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        
        {/* Mirror Decorative Element */}
        <div className="absolute -right-20 -bottom-20 opacity-5 transform rotate-45 scale-150">
            <Shield size={300} />
        </div>
      </div>

      {/* Domain Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Self-Confidence', 'Boundaries', 'Emotional Intelligence'].map(domain => {
              const domainConfigs = COMPETENCY_CONFIG.filter(c => c.domain === domain);
              return (
                  <div key={domain} className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-6 flex items-center">
                          <Star size={16} className="mr-2 text-yellow-500 fill-yellow-500" />
                          {domain}
                      </h4>
                      <div className="space-y-8">
                          {domainConfigs.map(config => {
                              const score = scores[config.key];
                              const isShadow = score < 35;
                              return (
                                  <div key={config.key} className="group cursor-help">
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-black text-slate-700 text-xs">{config.label}</span>
                                          {isShadow && <AlertCircle size={14} className="text-rose-500 animate-pulse" />}
                                      </div>
                                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                                          <div className={`h-full transition-all duration-1000 ${isShadow ? 'bg-rose-400' : 'bg-indigo-500'}`} style={{width: `${score}%`}}></div>
                                      </div>
                                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 relative">
                                          <p className="text-[11px] font-bold text-slate-800 leading-relaxed mb-1">
                                              {isShadow ? "Shadow: " : "Ideal: "}{isShadow ? config.shadow : config.ideal}
                                          </p>
                                          {isShadow && (
                                              <div className="mt-2 flex items-center text-[10px] font-black text-rose-600 uppercase">
                                                  <Info size={12} className="mr-1" /> Requires Intervention
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )
          })}
      </div>
    </div>
  );
};
