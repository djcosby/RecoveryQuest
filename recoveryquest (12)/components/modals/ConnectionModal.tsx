
import React, { useState } from 'react';
import { X, UserPlus, UserMinus, Shield, Zap, Award, Hash, MessageSquare } from 'lucide-react';
import { Peer, ConnectionType } from '../../types';
import { usePeerStore } from '../../context/PeerContext';

export const ConnectionModal: React.FC<{ peer: Peer; onClose: () => void }> = ({ peer, onClose }) => {
  const { getConnection, addConnection, removeConnection } = usePeerStore();
  const connection = getConnection(peer.id);
  const [showTypeSelect, setShowTypeSelect] = useState(false);

  const handleConnect = (type: ConnectionType) => {
    addConnection(peer.id, type);
    setShowTypeSelect(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors">
                <X size={20} />
            </button>
        </div>
        
        {/* Profile Content */}
        <div className="px-6 pb-6 relative">
            {/* Avatar - Negative Margin to pull up */}
            <div className="w-24 h-24 bg-white rounded-full p-1 -mt-12 mb-3 shadow-lg relative">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-4xl">
                    {peer.avatar}
                </div>
                <div className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-white rounded-full ${peer.status === 'online' ? 'bg-emerald-500' : peer.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
            </div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">{peer.name}</h2>
                    <p className="text-indigo-500 text-xs font-bold uppercase tracking-wide">{peer.role}</p>
                </div>
                {connection && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide border border-emerald-200">
                        {connection.type === 'care_team' ? 'Care Team' : connection.type}
                    </span>
                )}
            </div>

            <p className="text-slate-600 text-sm font-medium mb-6 italic">"{peer.bio}"</p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div className="text-blue-500 mb-1 flex justify-center"><Award size={18} /></div>
                    <div className="font-extrabold text-slate-800 text-lg">{peer.level}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Level</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div className="text-orange-500 mb-1 flex justify-center"><Zap size={18} /></div>
                    <div className="font-extrabold text-slate-800 text-lg">{peer.streak}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Streak</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                    <div className="text-purple-500 mb-1 flex justify-center"><Hash size={18} /></div>
                    <div className="font-extrabold text-slate-800 text-lg">{peer.tags.length}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">Tags</div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
                {peer.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md border border-slate-200">
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                {showTypeSelect ? (
                    <div className="space-y-2 animate-slide-in-bottom">
                        <p className="text-xs font-bold text-slate-400 text-center uppercase mb-2">Select Connection Type</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleConnect('peer')} className="bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl text-xs font-bold">Peer</button>
                            <button onClick={() => handleConnect('sponsor')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-2 rounded-xl text-xs font-bold">Sponsor</button>
                            <button onClick={() => handleConnect('sponsee')} className="bg-amber-50 hover:bg-amber-100 text-amber-600 py-2 rounded-xl text-xs font-bold">Sponsee</button>
                            <button onClick={() => setShowTypeSelect(false)} className="bg-slate-100 text-slate-500 py-2 rounded-xl text-xs font-bold">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {connection ? (
                            <div className="flex space-x-2">
                                <button onClick={() => removeConnection(peer.id)} className="flex-1 bg-white border-2 border-slate-200 text-slate-500 hover:text-rose-500 hover:border-rose-200 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all">
                                    <UserMinus size={18} />
                                    <span>Disconnect</span>
                                </button>
                                <button className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 transition-all">
                                    <MessageSquare size={18} />
                                    <span>Message</span>
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowTypeSelect(true)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all">
                                <UserPlus size={20} />
                                <span>Connect Profile</span>
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
