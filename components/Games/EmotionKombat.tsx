import React, { useState, useEffect } from 'react';
import { Shield, Zap, Skull, Heart, Sword } from 'lucide-react';
import { useUserStore } from '../../context/UserContext';

// Game Definitions
interface Enemy {
  name: string;
  trigger: string; // The phrase they say
  weakness: string; // The correct coping skill
  hp: number;
  damage: number;
  avatar: string; // Emoji
}

const ENEMIES: Enemy[] = [
  { 
    name: 'The Gaslighter', 
    trigger: "You're crazy, that never happened.", 
    weakness: 'Reality Testing', 
    hp: 100, 
    damage: 20, 
    avatar: '🤡' 
  },
  { 
    name: 'The Urge', 
    trigger: "Just one won't hurt. You've earned it.", 
    weakness: 'Play the Tape Through', 
    hp: 120, 
    damage: 30, 
    avatar: '🐍' 
  },
  { 
    name: 'Shame Shadow', 
    trigger: "You are broken and unlovable.", 
    weakness: 'Self-Compassion', 
    hp: 80, 
    damage: 40, 
    avatar: '👻' 
  }
];

const MOVES = [
  { id: 'Reality Testing', label: 'Check Facts', icon: '🔍', color: 'bg-blue-600' },
  { id: 'Play the Tape Through', label: 'Play the Tape', icon: '📼', color: 'bg-purple-600' },
  { id: 'Self-Compassion', label: 'Self-Love', icon: '❤️', color: 'bg-rose-600' },
  { id: 'Deep Breath', label: 'Pause', icon: '🌬️', color: 'bg-emerald-600' } // General block
];

export const EmotionalKombat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addXP } = useUserStore();
  const [currentEnemy, setCurrentEnemy] = useState<Enemy>(ENEMIES[0]);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [gameLog, setGameLog] = useState<string[]>(["FIGHT!"]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (turn === 'enemy' && enemyHP > 0) {
      setTimeout(() => {
        handleEnemyAttack();
      }, 1500);
    }
  }, [turn]);

  const handlePlayerMove = (moveId: string) => {
    if (turn !== 'player') return;

    let damage = 0;
    let logMsg = "";

    if (moveId === currentEnemy.weakness) {
      damage = 50; // Critical Hit
      logMsg = `CRITICAL HIT! You used ${moveId} to counter ${currentEnemy.name}!`;
      setShake(true); // Visual feedback
      setTimeout(() => setShake(false), 500);
    } else if (moveId === 'Deep Breath') {
      damage = 10;
      setPlayerHP(prev => Math.min(100, prev + 15)); // Heal
      logMsg = "You paused to breathe. +15 HP. Small damage dealt.";
    } else {
      damage = 0;
      logMsg = `Ineffective! ${moveId} doesn't work on ${currentEnemy.name}.`;
    }

    setEnemyHP(prev => Math.max(0, prev - damage));
    setGameLog(prev => [logMsg, ...prev]);

    if (enemyHP - damage <= 0) {
      handleWin();
    } else {
      setTurn('enemy');
    }
  };

  const handleEnemyAttack = () => {
    const dmg = currentEnemy.damage;
    setPlayerHP(prev => Math.max(0, prev - dmg));
    setGameLog(prev => [`${currentEnemy.name} attacks: "${currentEnemy.trigger}" -${dmg} HP`, ...prev]);
    
    if (playerHP - dmg <= 0) {
      // Game Over logic
      setGameLog(prev => ["DEFEATED. Try again.", ...prev]);
    } else {
      setTurn('player');
    }
  };

  const handleWin = () => {
    addXP(200, 'kombat_win');
    setGameLog(prev => ["VICTORY! +200 XP", ...prev]);
    // Logic to next level or close
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Game Header */}
      <div className="w-full max-w-lg mb-4 flex justify-between items-center text-white">
        <div className="flex flex-col">
            <span className="font-black text-xl text-yellow-400">YOU</span>
            <div className="w-32 h-4 bg-slate-700 rounded-full overflow-hidden border-2 border-slate-500">
                <div className="h-full bg-emerald-500 transition-all" style={{width: `${playerHP}%`}}></div>
            </div>
        </div>
        <div className="text-3xl font-black italic text-red-600 animate-pulse">VS</div>
        <div className="flex flex-col items-end">
            <span className="font-black text-xl text-rose-500">{currentEnemy.name.toUpperCase()}</span>
            <div className="w-32 h-4 bg-slate-700 rounded-full overflow-hidden border-2 border-slate-500">
                <div className="h-full bg-rose-500 transition-all" style={{width: `${(enemyHP / currentEnemy.hp) * 100}%`}}></div>
            </div>
        </div>
      </div>

      {/* Arena */}
      <div className={`w-full max-w-lg h-64 bg-slate-800 rounded-2xl border-4 border-slate-600 relative overflow-hidden flex items-end justify-between px-12 pb-8 ${shake ? 'animate-[ping_0.1s_ease-in-out]' : ''}`}>
          {/* Player Avatar */}
          <div className="text-6xl filter drop-shadow-lg transition-transform duration-300 transform hover:scale-110">🦁</div>
          
          {/* Enemy Avatar */}
          <div className={`text-8xl filter drop-shadow-2xl transition-all duration-500 ${enemyHP <= 0 ? 'opacity-0 scale-0 rotate-180' : 'opacity-100'}`}>
              {currentEnemy.avatar}
          </div>

          {/* Trigger Text Bubble */}
          {turn === 'enemy' && enemyHP > 0 && (
              <div className="absolute top-4 right-1/2 translate-x-1/2 bg-white text-black p-2 rounded-xl font-bold text-xs border-2 border-black animate-bounce shadow-lg">
                  "{currentEnemy.trigger}"
              </div>
          )}
      </div>

      {/* Log */}
      <div className="w-full max-w-lg h-24 bg-black/50 rounded-xl mt-4 p-2 overflow-y-auto text-xs font-mono text-green-400 border border-green-900/30">
          {gameLog.map((log, i) => <div key={i}>> {log}</div>)}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-3 mt-4">
          {MOVES.map(move => (
              <button
                key={move.id}
                onClick={() => handlePlayerMove(move.id)}
                disabled={turn !== 'player' || playerHP <= 0 || enemyHP <= 0}
                className={`${move.color} text-white p-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                  <span className="text-xl">{move.icon}</span>
                  <span>{move.label}</span>
              </button>
          ))}
      </div>

      <button onClick={onClose} className="mt-6 text-slate-500 font-bold hover:text-white">Run Away (Exit)</button>
    </div>
  );
};