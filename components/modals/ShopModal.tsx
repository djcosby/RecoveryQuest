
import React, { useState } from 'react';
import { X, Heart, Shield, Sparkles, Check, ShoppingBag, Zap } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';
import { ShopItem } from '../../types';

const SHOP_ITEMS: ShopItem[] = [
    { 
        id: 'streak_freeze', 
        name: 'Grace Token', 
        description: 'Miss a day without losing your streak. Equip up to 2.', 
        cost: 200, 
        icon: '🧊', 
        type: 'consumable', 
        effectId: 'streak_freeze' 
    },
    { 
        id: 'heart_refill', 
        name: 'Resilience Refill', 
        description: 'Restore full hearts immediately.', 
        cost: 350, 
        icon: '❤️', 
        type: 'consumable', 
        effectId: 'heart_refill' 
    },
    { 
        id: 'outfit_gold', 
        name: 'Golden Aura', 
        description: 'Glow with confidence on the leaderboards.', 
        cost: 1000, 
        icon: '✨', 
        type: 'cosmetic' 
    },
    { 
        id: 'companion_phoenix', 
        name: 'Phoenix Companion', 
        description: 'A mythic pet that signifies rebirth.', 
        cost: 2500, 
        icon: '🐦‍🔥', 
        type: 'cosmetic' 
    }
];

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state: user, buyShopItem } = useUserStore();
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    if (user.gems < item.cost) {
        setPurchaseMsg("Not enough gems!");
        setTimeout(() => setPurchaseMsg(null), 1500);
        return;
    }

    if (item.effectId === 'streak_freeze' && user.activeEffects.includes('streak_freeze')) {
        setPurchaseMsg("You already have a Grace Token equipped.");
        setTimeout(() => setPurchaseMsg(null), 1500);
        return;
    }

    const success = buyShopItem(item);
    if (success) {
        setPurchaseMsg(`Purchased ${item.name}!`);
        setTimeout(() => setPurchaseMsg(null), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header with Gem Balance */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <ShoppingBag size={24} />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Recovery Shop</h3>
                    <div className="flex items-center text-emerald-500 font-black text-sm">
                        <span className="mr-1">💎</span> {user.gems} Gems
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={24} />
            </button>
        </div>

        {/* Feedback Toast */}
        {purchaseMsg && (
            <div className="bg-emerald-500 text-white text-center py-2 font-bold text-sm animate-slide-in-bottom absolute top-20 left-0 right-0 z-50 shadow-md">
                {purchaseMsg}
            </div>
        )}

        {/* Shop Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            
            {/* Active Buffs */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Your Inventory</h4>
                <div className="flex space-x-3">
                    {user.activeEffects.includes('streak_freeze') ? (
                        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl flex items-center space-x-2 border border-blue-200 shadow-sm">
                            <span className="text-xl">🧊</span>
                            <div>
                                <span className="block text-[10px] font-bold uppercase">Equipped</span>
                                <span className="font-extrabold text-xs">Grace Token</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold border-dashed">
                            No active buffs
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {SHOP_ITEMS.map(item => {
                    const canAfford = user.gems >= item.cost;
                    const isOwned = item.type === 'cosmetic' && user.inventory.includes(item.id);
                    
                    return (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-4xl shadow-inner border border-slate-100">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-slate-800">{item.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium max-w-[150px] leading-tight mt-1">{item.description}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => !isOwned && handleBuy(item)}
                                disabled={!canAfford && !isOwned}
                                className={`px-5 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex flex-col items-center min-w-[90px]
                                ${isOwned 
                                    ? 'bg-slate-100 text-slate-400 cursor-default shadow-none' 
                                    : canAfford 
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isOwned ? (
                                    <Check size={20} />
                                ) : (
                                    <>
                                        <span className="flex items-center">💎 {item.cost}</span>
                                        <span className="text-[9px] uppercase opacity-80 mt-0.5">Buy</span>
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
