import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertTriangle, Loader2, Send, Video, ThumbsUp, Share2 } from 'lucide-react';
import { FEED_POSTS } from '../../constants';
import { validateContentSafety } from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';

export const FeedTab: React.FC = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState<string | null>(null);
  /* Added local posts state to handle real-time updates */
  const [posts, setPosts] = useState<any[]>(FEED_POSTS);

  /* Moved useEffect inside FeedTab component scope */
  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        setPosts(current => [payload.new, ...current]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    setIsValidating(true);
    setSafetyWarning(null);
    const check = await validateContentSafety(newPostContent);
    setIsValidating(false);
    if (!check.safe) { setSafetyWarning(check.reason || "This content may violate our recovery safety guidelines."); return; }
    window.alert("Post verified safe and published!");
    setNewPostContent('');
    setIsPosting(false);
  };

  return (
    <div className="pb-24 px-4 pt-6 bg-slate-50 min-h-screen animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-700 tracking-tight">Community Feed</h2>
        <button onClick={() => setIsPosting(!isPosting)} className={`p-2 rounded-xl shadow-sm border-2 transition-transform ${isPosting ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-white border-slate-200 text-blue-500 active:scale-95'}`}><PlusCircle size={24} className={isPosting ? 'rotate-45 transition-transform' : 'transition-transform'} /></button>
      </div>
      {isPosting && (
          <div className="mb-6 bg-white p-4 rounded-3xl shadow-sm border-2 border-indigo-100 animate-slide-in-bottom">
              <textarea className="w-full bg-slate-50 rounded-xl p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none" rows={3} placeholder="Share your milestone or ask for support..." value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
              {safetyWarning && <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-xl flex items-start space-x-2 text-xs font-bold text-red-600"><AlertTriangle size={16} className="shrink-0 mt-0.5" /><div><p>Hold up. Our AI flagged this:</p><p className="font-normal">{safetyWarning}</p></div></div>}
              <div className="flex justify-end mt-3"><button onClick={handlePostSubmit} disabled={isValidating || !newPostContent.trim()} className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center space-x-2 disabled:opacity-50 hover:bg-indigo-600 transition-colors">{isValidating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}<span>{isValidating ? 'Analyzing...' : 'Post Update'}</span></button></div>
          </div>
      )}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden">
            <div className="p-5 flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm border-b-4 border-black/10 ${post.role === 'Staff' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>{post.author[0]}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start"><div><h4 className="font-bold text-slate-800 text-sm">{post.author}</h4><span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{post.role} • {post.time}</span></div>{post.type === 'announcement' && <span className="bg-rose-100 text-rose-600 text-[10px] font-extrabold px-2 py-1 rounded-lg uppercase tracking-wide">Official</span>}</div>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed font-medium">{post.content}</p>
                {post.type === 'video' && <div className={`mt-4 w-full h-48 rounded-2xl ${post.thumbnail} flex items-center justify-center relative group cursor-pointer border-2 border-slate-900/10 overflow-hidden`}><div className="absolute inset-0 bg-slate-800"></div><div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform border-2 border-white/50 relative z-10"><Video className="text-white fill-current ml-1" size={24} /></div></div>}
              </div>
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t-2 border-slate-100 flex justify-between items-center text-slate-400"><button className="flex items-center space-x-2 hover:text-blue-500 text-xs font-bold transition-colors"><ThumbsUp size={18} /><span>{post.likes}</span></button><button className="flex items-center space-x-2 hover:text-blue-500 text-xs font-bold transition-colors"><Share2 size={18} /><span>Share</span></button></div>
          </div>
        ))}
      </div>
    </div>
  );
};
