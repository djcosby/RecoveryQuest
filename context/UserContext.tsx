import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserState, WellnessScores, CaseFile, UserProfile, BaselineData, DailyQuest, ShopItem, RecoveryStage, AssessmentLogEntry, ClinicalConceptualization, SponsorQuest, UserTask, FeedPost, CompetencyScores, GameMasteryData } from '../types';
import { DEFAULT_CASE_FILE } from '../constants';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const GENERATE_DAILY_QUESTS = (): DailyQuest[] => [
  { id: 'dq_1', label: 'Complete a Lesson', target: 1, progress: 0, rewardGem: 10, isClaimed: false, icon: '🎓' },
  { id: 'dq_2', label: 'Earn 50 XP', target: 50, progress: 0, rewardGem: 5, isClaimed: false, icon: '⚡' },
  { id: 'dq_3', label: 'Log a Meeting', target: 1, progress: 0, rewardGem: 20, isClaimed: false, icon: '🤝' },
];

const INITIAL_TASKS: UserTask[] = [
    { id: 't1', text: 'Drink 2L of water', type: 'daily', isCompleted: false, createdAt: new Date().toISOString() },
    { id: 'w1', text: 'Attend 3 Meetings', type: 'weekly', isCompleted: false, createdAt: new Date().toISOString() }
];

interface ExtendedUserState extends UserState {
  feed: (FeedPost & { isPrivate: boolean })[];
}

interface UserContextType {
  state: ExtendedUserState; 
  user: UserState | null; 
  isAuthenticated: boolean;
  isLoading: boolean;
  isCloudEnabled: boolean;
  login: (username: string) => Promise<boolean>;
  register: (username: string, avatar: string) => Promise<boolean>;
  logout: () => void;
  addXP: (amount: number, source?: string) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  buyShopItem: (item: ShopItem) => boolean;
  completeNode: (nodeId: string) => void;
  takeDamage: (amount: number) => void;
  restoreHearts: () => void;
  logMeeting: () => void;
  completeQuest: (questId: string, xp: number) => void;
  claimDailyQuest: (questId: string) => void;
  clearNotifications: () => void;
  addNotification: (msg: string) => void;
  updateWellnessScores: (scores: WellnessScores) => void;
  updateCompetencies: (competencies: Partial<CompetencyScores>) => void;
  updateCaseFile: (file: CaseFile) => void;
  updateBaseline: (data: BaselineData) => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
  toggleChecklistItem: (nodeId: string, itemId: string, xpReward: number) => void;
  checkStreak: () => void;
  recordAssessment: (entry: AssessmentLogEntry) => void;
  updateClinicalProfile: (profile: ClinicalConceptualization) => void;
  completeTutorial: () => void;
  addFeedPost: (content: string, type: 'milestone' | 'text', isPrivate: boolean) => void;
  addUserTask: (text: string, type: 'daily' | 'weekly', isSuggested?: boolean, category?: string) => void;
  toggleUserTask: (taskId: string) => void;
  deleteUserTask: (taskId: string) => void;
  switchCourse: (courseId: string) => void;
  resetProgress: () => void;
  recordGameResult: (gameId: string, score: number) => void;
}

const INITIAL_NEW_USER_STATE: ExtendedUserState = {
  profile: {
    name: '',
    bio: 'Ready to start the journey.',
    avatar: '🦁',
    notifications: true,
    haptics: true,
    defaultHashtags: '#RecoveryQuest',
    hasCompletedTutorial: false,
    socials: {}
  },
  level: 1,
  xp: 0,
  gems: 500,
  hearts: 3,
  maxHearts: 3,
  streak: 0,
  lastActiveDate: new Date().toISOString(),
  recoveryStage: 'Onboarding',
  activeCourseId: 'hero', 
  inventory: [],
  activeEffects: [],
  completedNodes: [],
  checklistProgress: {},
  completedQuests: [],
  dailyQuests: GENERATE_DAILY_QUESTS(),
  userTasks: INITIAL_TASKS,
  notifications: [],
  meetingsLogged: 0,
  caseFile: DEFAULT_CASE_FILE,
  assessmentHistory: [],
  competencies: {
    reliability: 15,
    accountability: 10,
    integrity: 20,
    theVault: 10,
    theFortress: 5,
    vulnerability: 5,
    grace: 10
  },
  feed: [],
  gameMastery: {}
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUserState | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserData = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setUser({ ...INITIAL_NEW_USER_STATE, ...data });
      setCurrentUsername(data.name?.toLowerCase() || null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData(session.user.id);
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const updateAndSync = useCallback((updater: (prev: ExtendedUserState) => ExtendedUserState) => {
    setUser(prev => {
      if (!prev || !currentUsername) return prev;
      const newState = updater(prev);
      localStorage.setItem(`rq_user_${currentUsername}`, JSON.stringify(newState));
      return newState;
    });
  }, [currentUsername]);

  const recordGameResult = useCallback((gameId: string, score: number) => {
    updateAndSync(prev => {
      const current = prev.gameMastery[gameId] || { level: 1, exp: 0, bestScore: 0, roundsPlayed: 0, currentStreak: 0, maxStreak: 0 };
      const newRounds = current.roundsPlayed + 1;
      const newBest = Math.max(current.bestScore, score);
      
      // Streak logic for "consistent high performance"
      // High Performance Threshold: 80%
      const isHighPerf = score >= 80;
      const newStreak = isHighPerf ? current.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(current.maxStreak, newStreak);

      // Mastery Progress Calculation
      // Base EXP = Score / 4
      // Consistency Bonus = Current Streak * 10 (Encourages long-term focus)
      let expGain = Math.round(score / 4); 
      if (isHighPerf) expGain += 20; // Mastery bonus for quality
      if (newStreak >= 3) expGain += (newStreak * 5); // Scaled consistency reward

      let newExp = current.exp + expGain;
      let newLevel = current.level;
      
      // Level thresholds: level * 250
      const threshold = newLevel * 250;
      if (newExp >= threshold) {
        newLevel += 1;
        newExp -= threshold;
        const gameName = gameId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        prev.notifications.push(`Mastery Upgrade! You've reached Level ${newLevel} in ${gameName}.`);
      }

      return {
        ...prev,
        gameMastery: {
          ...prev.gameMastery,
          [gameId]: {
            level: newLevel,
            exp: newExp,
            bestScore: newBest,
            roundsPlayed: newRounds,
            currentStreak: newStreak,
            maxStreak: newMaxStreak
          }
        }
      };
    });
  }, [updateAndSync]);

  const addFeedPost = useCallback((content: string, type: 'milestone' | 'text', isPrivate: boolean) => {
    updateAndSync(prev => ({
      ...prev,
      feed: [{
        id: Date.now(),
        author: prev.profile.name || 'Architect',
        role: 'Hero',
        content,
        type,
        likes: 0,
        time: 'Just now',
        isPrivate
      }, ...prev.feed]
    }));
  }, [updateAndSync]);

  const login = async (username: string): Promise<boolean> => {
    setIsLoading(true);
    const safeKey = username.trim().toLowerCase();
    const localData = localStorage.getItem(`rq_user_${safeKey}`);
    if (localData) {
      setUser({ ...INITIAL_NEW_USER_STATE, ...JSON.parse(localData) });
      setCurrentUsername(safeKey);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (username: string, avatar: string): Promise<boolean> => {
    const safeKey = username.trim().toLowerCase();
    const newUser = { ...INITIAL_NEW_USER_STATE, profile: { ...INITIAL_NEW_USER_STATE.profile, name: username, avatar } };
    localStorage.setItem(`rq_user_${safeKey}`, JSON.stringify(newUser));
    setUser(newUser);
    setCurrentUsername(safeKey);
    return true;
  };

  const logout = () => { setUser(null); setCurrentUsername(null); };

  const addXP = useCallback((amount: number) => {
    updateAndSync(prev => {
      const xp = prev.xp + amount;
      return { ...prev, xp, level: Math.max(1, 1 + Math.floor(xp / 1000)) };
    });
  }, [updateAndSync]);

  const addGems = useCallback((amount: number) => updateAndSync(prev => ({ ...prev, gems: prev.gems + amount })), [updateAndSync]);
  
  const spendGems = useCallback((amount: number) => {
    let success = false;
    if (user && user.gems >= amount) {
      success = true;
      updateAndSync(prev => ({ ...prev, gems: prev.gems - amount }));
    }
    return success;
  }, [user, updateAndSync]);

  const buyShopItem = useCallback((item: ShopItem) => {
    if (!user || user.gems < item.cost) return false;
    updateAndSync(prev => {
      const newGems = prev.gems - item.cost;
      let newInventory = [...(prev.inventory || [])];
      let newEffects = [...(prev.activeEffects || [])];
      if (item.type === 'consumable' && item.effectId) {
        if (item.effectId === 'heart_refill') return { ...prev, gems: newGems, hearts: prev.maxHearts };
        if (!newEffects.includes(item.effectId)) newEffects.push(item.effectId);
      } else {
        if (!newInventory.includes(item.id)) newInventory.push(item.id);
      }
      return { ...prev, gems: newGems, inventory: newInventory, activeEffects: newEffects };
    });
    return true;
  }, [user, updateAndSync]);

  const claimDailyQuest = useCallback((questId: string) => {
    updateAndSync(prev => {
      const quest = prev.dailyQuests.find(q => q.id === questId);
      if (!quest || quest.isClaimed || quest.progress < quest.target) return prev;
      return {
        ...prev,
        gems: prev.gems + quest.rewardGem,
        dailyQuests: prev.dailyQuests.map(q => q.id === questId ? { ...q, isClaimed: true } : q)
      };
    });
  }, [updateAndSync]);

  const completeNode = useCallback((nodeId: string) => {
    updateAndSync(prev => ({ ...prev, completedNodes: [...new Set([...prev.completedNodes, nodeId])] }));
  }, [updateAndSync]);

  const logMeeting = useCallback(() => updateAndSync(prev => ({ ...prev, meetingsLogged: prev.meetingsLogged + 1 })), [updateAndSync]);
  const takeDamage = useCallback((amount: number) => updateAndSync(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - amount) })), [updateAndSync]);
  const restoreHearts = useCallback(() => updateAndSync(prev => ({ ...prev, hearts: prev.maxHearts })), [updateAndSync]);
  const completeQuest = useCallback((questId: string, xp: number) => updateAndSync(prev => ({ ...prev, xp: prev.xp + xp, completedQuests: [...prev.completedQuests, questId] })), [updateAndSync]);
  const clearNotifications = useCallback(() => updateAndSync(prev => ({ ...prev, notifications: [] })), [updateAndSync]);
  const addNotification = useCallback((msg: string) => updateAndSync(prev => ({ ...prev, notifications: [msg, ...prev.notifications] })), [updateAndSync]);
  const updateWellnessScores = useCallback((scores: WellnessScores) => updateAndSync(prev => ({ ...prev, wellnessScores: scores })), [updateAndSync]);
  const updateCompetencies = useCallback((comp: Partial<CompetencyScores>) => updateAndSync(prev => ({ ...prev, competencies: { ...prev.competencies, ...comp } })), [updateAndSync]);
  const updateCaseFile = useCallback((file: CaseFile) => updateAndSync(prev => ({ ...prev, caseFile: file })), [updateAndSync]);
  const updateBaseline = useCallback((data: BaselineData) => updateAndSync(prev => ({ ...prev, baseline: data })), [updateAndSync]);
  const updateProfile = useCallback((profileUpdates: Partial<UserProfile>) => updateAndSync(prev => ({ ...prev, profile: { ...prev.profile, ...profileUpdates } })), [updateAndSync]);
  const completeTutorial = useCallback(() => updateAndSync(prev => ({ ...prev, profile: { ...prev.profile, hasCompletedTutorial: true } })), [updateAndSync]);
  const checkStreak = useCallback(() => {}, []);
  const recordAssessment = useCallback((entry: AssessmentLogEntry) => updateAndSync(prev => ({ ...prev, assessmentHistory: [...prev.assessmentHistory, entry] })), [updateAndSync]);
  const updateClinicalProfile = useCallback((profile: ClinicalConceptualization) => updateAndSync(prev => ({ ...prev, clinicalProfile: profile })), [updateAndSync]);
  const toggleChecklistItem = useCallback(() => {}, []);
  const addUserTask = useCallback((text: string, type: 'daily' | 'weekly', isSuggested = false, category = '') => updateAndSync(prev => ({ 
    ...prev, 
    userTasks: [{ 
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5), 
      text, 
      type, 
      isCompleted: false, 
      isSystemSuggested: isSuggested,
      category,
      createdAt: new Date().toISOString() 
    }, ...prev.userTasks] 
  })), [updateAndSync]);
  const toggleUserTask = useCallback((taskId: string) => updateAndSync(prev => ({ ...prev, userTasks: prev.userTasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) })), [updateAndSync]);
  const deleteUserTask = useCallback((taskId: string) => updateAndSync(prev => ({ ...prev, userTasks: prev.userTasks.filter(t => t.id !== taskId) })), [updateAndSync]);

  const switchCourse = useCallback((courseId: string) => {
    updateAndSync(prev => ({ ...prev, activeCourseId: courseId }));
  }, [updateAndSync]);

  const resetProgress = useCallback(() => {
    updateAndSync(prev => ({
      ...INITIAL_NEW_USER_STATE,
      profile: prev.profile, 
      dailyQuests: GENERATE_DAILY_QUESTS(),
      userTasks: INITIAL_TASKS,
      feed: [],
      gameMastery: {}
    }));
  }, [updateAndSync]);

  return (
    <UserContext.Provider
      value={{
        state: user || INITIAL_NEW_USER_STATE,
        user, isAuthenticated: !!user, isLoading, isCloudEnabled: isSupabaseConfigured,
        login, register, logout, addXP, addGems, spendGems, buyShopItem, completeNode, takeDamage, restoreHearts, logMeeting, completeQuest, claimDailyQuest, clearNotifications, addNotification, updateWellnessScores, updateCompetencies, updateCaseFile, updateBaseline, updateProfile, toggleChecklistItem, checkStreak, recordAssessment, updateClinicalProfile, completeTutorial, addFeedPost, addUserTask, toggleUserTask, deleteUserTask,
        switchCourse, resetProgress, recordGameResult
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserStore must be used within UserProvider");
  return context;
};