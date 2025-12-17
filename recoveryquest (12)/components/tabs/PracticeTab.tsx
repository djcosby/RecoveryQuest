
import React from 'react';
import { PracticeArena } from '../../features/practice/PracticeArena';
import { useUserStore } from '../../context/UserContext';

interface PracticeTabProps {
  onStartScenario: () => void;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ onStartScenario }) => {
  const { addXP } = useUserStore();

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col animate-fade-in">
        <PracticeArena onStartScenario={onStartScenario} onEarnXP={xp => addXP(xp, 'practice')} />
    </div>
  );
};
