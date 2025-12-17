
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserState, WellnessScores, CaseFile, UserProfile, BaselineData, DailyQuest, ShopItem, RecoveryStage, AssessmentLogEntry, ClinicalConceptualization, SponsorQuest, UserTask, WellnessDimension } from '../types';
import { DEFAULT_CASE_FILE, COURSES } from '../constants';
import { supabase } from '../services/supabaseClient';

// Initial daily quests generation
const GENERATE_DAILY_QUESTS = (): DailyQuest[] => [
  { id: 'dq_1', label: 'Complete a Lesson', target: 1, progress: 0, rewardGem: 10, isClaimed: false, icon: '🎓' },
  { id: 'dq_2', label: 'Earn 50 XP', target: 50, progress: 0, rewardGem: 5, isClaimed: false, icon: '⚡' },
  { id: 'dq_3', label: 'Log a Meeting', target: 1, progress: 0, rewardGem: 20, isClaimed: false, icon: '🤝' },
];

// Initial Tasks
const INITIAL_TASKS: UserTask[] = [
    { id: 't1', text: 'Drink 2L of water', type: 'daily', isCompleted: false, createdAt: new Date().toISOString() },
    { id: 'w1', text: 'Attend 3 Meetings', type: 'weekly', isCompleted: false, createdAt: new Date().toISOString() }
];

interface UserContextType {
  state: UserState; 
  user: UserState | null; 
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<boolean>;
  register: (username: string, avatar: string) => Promise<boolean>;
  logout: () => void;
  
  // Actions
  addXP: (amount: number, source?: string) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => boolean;
  buyShopItem: (item: ShopItem) => boolean;
  completeNode: (nodeId: string) => void;
  takeDamage: (amount: number) => void;
  restoreHearts: () => void;
  collectTool: (toolId: string) => void;
  logMeeting: () => void;
  completeQuest: (questId: string, xp: number) => void;
  claimDailyQuest: (questId: string) => void;
  receiveSponsorQuest: (quest: SponsorQuest) => void;
  clearNotifications: () => void;
  updateWellnessScores: (scores: WellnessScores) => void;
  updateCaseFile: (file: CaseFile) => void;
  updateBaseline: (data: BaselineData) => void;
  updateProfile: (profileUpdates: Partial<UserProfile>) => void;
  switchCourse: (courseId: string) => void;
  toggleChecklistItem: (nodeId: string, itemId: string, xpReward: number) => void;
  resetProgress: () => void;
  checkStreak: () => void;
  recordAssessment: (entry: AssessmentLogEntry) => void;
  updateClinicalProfile: (profile: ClinicalConceptualization) => void;
  completeTutorial: () => void;
  
  // Planner Actions
  addUserTask: (text: string, type: 'daily' | 'weekly') => void;
  toggleUserTask: (taskId: string) => void;
  deleteUserTask: (taskId: string) => void;
}

const INITIAL_NEW_USER_STATE: UserState = {
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
  gems: 500, // Starting Gems
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
  assessmentHistory: []
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const computeLevelFromXP = (xp: number): number => {
  return Math.max(1, 1 + Math.floor(xp / 1000));
};

// Helper: Determine Stage
const calculateRecoveryStage = (baseline: BaselineData | undefined, caseFile: CaseFile | undefined): RecoveryStage => {
    if (!baseline) return 'Onboarding';
    
    // Safety / Stabilization
    if (caseFile) {
        if (!caseFile.dignity.stateId || !caseFile.dignity.foodSource || caseFile.dignity.foodSource === 'None') return 'Stabilization';
        if (['Homeless', 'Shelter'].includes(caseFile.recovery.housingStatus)) return 'Stabilization';
    }

    // Motivation Check
    if (baseline.goals.motivationLevel < 4) return 'Stabilization'; // Pre-contemplationish
    if (baseline.goals.motivationLevel < 7) return 'Action';
    
    // Advanced
    if (caseFile?.recovery.housingStatus === 'Independent' && baseline.goals.motivationLevel >= 8) return 'Maintenance';

    return 'Action';
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to persist state to Supabase AND LocalStorage (Offline Strategy)
  const persistState = useCallback(async (newState: UserState, username: string) => {
    // 1. Local Storage (Reliable)
    try {
        localStorage.setItem(`rq_user_${username}`, JSON.stringify(newState));
    } catch (e) {
        console.error("Failed to save to local storage", e);
    }

    // 2. Supabase (Sync)
    try {
      const { error } = await supabase
        .from('user_states')
        .upsert({ 
          username: username, 
          data: newState,
          updated_at: new Date().toISOString()
        }, { onConflict: 'username' });

      if (error) {
        // console.warn("Supabase sync silent fail:", error);
      }
    } catch (err) {
      // console.warn("Failed to sync with backend:", err);
    }
  }, []);

  // Wrapper that updates local state immediately (Optimistic) then syncs DB
  const updateAndSync = useCallback((updater: (prev: UserState) => UserState) => {
    setUser(prev => {
      if (!prev || !currentUsername) return prev;
      const newState = updater(prev);
      
      // Fire and forget sync
      persistState(newState, currentUsername);
      
      return newState;
    });
  }, [currentUsername, persistState]);

  // --- Streak Logic & Daily Reset ---
  const checkStreak = useCallback(() => {
    updateAndSync(prev => {
      const now = new Date();
      const last = new Date(prev.lastActiveDate);
      
      // Reset hours to compare just dates
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      
      if (today === lastDate) {
        // Already logged in today, no change
        return prev;
      }

      let newStreak = prev.streak;
      let newEffects = [...(prev.activeEffects || [])];
      let newNotifications = [...(prev.notifications || [])];
      
      if (today - lastDate === oneDay) {
        // Consecutive day
        newStreak += 1;
      } else if (today - lastDate > oneDay) {
        // Missed a day! Check for Freeze
        if (newEffects.includes('streak_freeze')) {
          newEffects = newEffects.filter(e => e !== 'streak_freeze');
          // Consume notification
          newNotifications.push("Grace Token Used! Streak preserved.");
          // Streak stays same
        } else {
          newStreak = 0;
        }
      } else {
        // Should not happen (future date?)
        return prev;
      }

      // Check tasks for unfinished items
      const openTasks = prev.userTasks.filter(t => t.type === 'daily' && !t.isCompleted).length;
      if (openTasks > 0) {
          newNotifications.push(`${openTasks} daily tasks carried over.`);
      }

      return {
        ...prev,
        streak: newStreak,
        activeEffects: newEffects,
        notifications: newNotifications,
        lastActiveDate: now.toISOString(),
        // Reset daily quests on new day
        dailyQuests: GENERATE_DAILY_QUESTS(),
        // We do NOT reset user tasks, they carry over until done or deleted
      };
    });
  }, [updateAndSync]);

  const completeTutorial = useCallback(() => {
    updateAndSync(prev => ({
        ...prev,
        profile: { ...prev.profile, hasCompletedTutorial: true }
    }));
  }, [updateAndSync]);

  const login = async (username: string): Promise<boolean> => {
    setIsLoading(true);
    const safeKey = username.trim().toLowerCase();
    
    let loadedUser: UserState | null = null;

    try {
      // 1. Try Supabase
      const { data, error } = await supabase
        .from('user_states')
        .select('data')
        .eq('username', safeKey)
        .single();

      if (!error && data) {
        loadedUser = data.data;
      }
    } catch (e) {
      console.warn("Supabase login failed, checking local", e);
    }

    // 2. Fallback to LocalStorage if Supabase failed or returned nothing
    if (!loadedUser) {
        try {
            const localData = localStorage.getItem(`rq_user_${safeKey}`);
            if (localData) {
                loadedUser = JSON.parse(localData);
            }
        } catch (e) {
            console.error("Local storage read error", e);
        }
    }

    if (loadedUser) {
        // Load user state & Ensure defaults for new fields
        const fullUser: UserState = {
            ...INITIAL_NEW_USER_STATE,
            ...loadedUser,
            profile: { ...INITIAL_NEW_USER_STATE.profile, ...loadedUser.profile },
            completedNodes: Array.isArray(loadedUser.completedNodes) ? loadedUser.completedNodes : [],
            checklistProgress: loadedUser.checklistProgress || {},
            completedQuests: Array.isArray(loadedUser.completedQuests) ? loadedUser.completedQuests : [],
            inventory: Array.isArray(loadedUser.inventory) ? loadedUser.inventory : [],
            activeEffects: Array.isArray(loadedUser.activeEffects) ? loadedUser.activeEffects : [],
            assessmentHistory: Array.isArray(loadedUser.assessmentHistory) ? loadedUser.assessmentHistory : [],
            dailyQuests: Array.isArray(loadedUser.dailyQuests) ? loadedUser.dailyQuests : GENERATE_DAILY_QUESTS(),
            notifications: Array.isArray(loadedUser.notifications) ? loadedUser.notifications : [],
            userTasks: Array.isArray(loadedUser.userTasks) ? loadedUser.userTasks : INITIAL_TASKS
        };

        setUser(fullUser);
        setCurrentUsername(safeKey);
        setIsLoading(false);
        return true;
    }

    setIsLoading(false);
    return false;
  };

  const register = async (username: string, avatar: string): Promise<boolean> => {
    setIsLoading(true);
    const safeName = username.trim();
    const safeKey = safeName.toLowerCase();
    
    const newUser: UserState = {
      ...INITIAL_NEW_USER_STATE,
      profile: { ...INITIAL_NEW_USER_STATE.profile, name: safeName, avatar }
    };

    // 1. Try Supabase (Best Effort)
    try {
      const { error } = await supabase
        .from('user_states')
        .insert([{ username: safeKey, data: newUser }]);

      if (error) {
          console.warn("Supabase registration failed, falling back to local.");
      }
    } catch (e) {
      console.warn("Supabase network error, falling back to local.");
    }

    // 2. Save Locally (Guaranteed Success if storage works)
    try {
        localStorage.setItem(`rq_user_${safeKey}`, JSON.stringify(newUser));
        
        // Update Registry
        const registry = JSON.parse(localStorage.getItem('rq_registry_v1') || '[]');
        if (!registry.includes(safeKey)) {
            registry.push(safeKey);
            localStorage.setItem('rq_registry_v1', JSON.stringify(registry));
        }

        setUser(newUser);
        setCurrentUsername(safeKey);
        setIsLoading(false);
        return true;
    } catch (e) {
        console.error("Critical: Registration failed locally", e);
        setIsLoading(false);
        return false;
    }
  };

  const logout = () => {
    setCurrentUsername(null);
    setUser(null);
  };

  // --- Economies ---

  const addGems = useCallback((amount: number) => {
    updateAndSync(prev => ({ ...prev, gems: prev.gems + amount }));
  }, [updateAndSync]);

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
        if (item.effectId === 'heart_refill') {
           return { ...prev, gems: newGems, hearts: prev.maxHearts };
        }
        if (!newEffects.includes(item.effectId)) {
            newEffects.push(item.effectId);
        }
      } else {
        if (!newInventory.includes(item.id)) {
            newInventory.push(item.id);
        }
      }
      
      return { ...prev, gems: newGems, inventory: newInventory, activeEffects: newEffects };
    });
    return true;
  }, [user, updateAndSync]);

  const addXP = useCallback((amount: number, source?: string) => {
    updateAndSync(prev => {
      const xp = prev.xp + amount;
      const level = computeLevelFromXP(xp);
      return { ...prev, xp, level };
    });
  }, [updateAndSync]);

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

  const receiveSponsorQuest = useCallback((quest: SponsorQuest) => {
      updateAndSync(prev => ({
          ...prev,
          dailyQuests: [...prev.dailyQuests, quest],
          notifications: [...(prev.notifications || []), `New Quest from ${quest.assignedBy}!`]
      }));
  }, [updateAndSync]);

  const clearNotifications = useCallback(() => {
      updateAndSync(prev => ({ ...prev, notifications: [] }));
  }, [updateAndSync]);

  const completeNode = useCallback((nodeId: string) => {
    updateAndSync(prev => {
      if (prev.completedNodes.includes(nodeId)) return prev;
      return { ...prev, completedNodes: [...(prev.completedNodes || []), nodeId] };
    });
  }, [updateAndSync]);

  const logMeeting = useCallback(() => {
    updateAndSync(prev => ({ ...prev, meetingsLogged: prev.meetingsLogged + 1 }));
  }, [updateAndSync]);

  const takeDamage = useCallback((amount: number) => {
    updateAndSync(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - amount) }));
  }, [updateAndSync]);

  const restoreHearts = useCallback(() => {
    updateAndSync(prev => ({ ...prev, hearts: prev.maxHearts }));
  }, [updateAndSync]);

  const collectTool = useCallback((toolId: string) => {
    updateAndSync(prev => {
      if (prev.inventory.includes(toolId)) return prev;
      return { ...prev, inventory: [...(prev.inventory || []), toolId] };
    });
  }, [updateAndSync]);

  const completeQuest = useCallback((questId: string, xp: number) => {
    updateAndSync(prev => {
      if (prev.completedQuests.includes(questId)) return prev;
      const newXP = prev.xp + xp;
      const level = computeLevelFromXP(newXP);
      return { ...prev, xp: newXP, level, completedQuests: [...(prev.completedQuests || []), questId] };
    });
  }, [updateAndSync]);

  // --- ADAPTIVE TASK INJECTION ---
  const updateWellnessScores = useCallback((scores: WellnessScores) => {
    updateAndSync(prev => {
        // Identify low scoring dimensions (<= 20 is typically low in our 40pt scale)
        const lowDimensions = Object.entries(scores)
            .filter(([_, score]) => score <= 20)
            .map(([dim]) => dim as WellnessDimension);
        
        let newTasks = [...prev.userTasks];
        let notifications = [...(prev.notifications || [])];

        // Inject suggested tasks for unavoidable areas
        if (lowDimensions.includes('Emotional')) {
            const taskId = `suggest_${Date.now()}_emo`;
            if (!newTasks.some(t => t.text.includes('Journal') || t.text.includes('Feelings'))) {
                newTasks.push({ id: taskId, text: 'Journal one feeling (Suggested)', type: 'daily', isCompleted: false, isSystemSuggested: true, category: 'Emotional', createdAt: new Date().toISOString() });
                notifications.push("New Task: Focus on Emotional Health added.");
            }
        }
        if (lowDimensions.includes('Social')) {
            const taskId = `suggest_${Date.now()}_soc`;
            if (!newTasks.some(t => t.text.includes('Call') || t.text.includes('Meeting'))) {
                newTasks.push({ id: taskId, text: 'Call one support person (Suggested)', type: 'daily', isCompleted: false, isSystemSuggested: true, category: 'Social', createdAt: new Date().toISOString() });
                notifications.push("New Task: Connection helps isolation.");
            }
        }
        if (lowDimensions.includes('Physical')) {
            const taskId = `suggest_${Date.now()}_phy`;
            if (!newTasks.some(t => t.text.includes('Walk') || t.text.includes('Water'))) {
                newTasks.push({ id: taskId, text: 'Take a 10 min walk (Suggested)', type: 'daily', isCompleted: false, isSystemSuggested: true, category: 'Physical', createdAt: new Date().toISOString() });
                notifications.push("New Task: Move the body to heal the mind.");
            }
        }

        return { 
            ...prev, 
            wellnessScores: scores,
            lastWellnessCheck: new Date().toISOString(),
            userTasks: newTasks,
            notifications: notifications
        };
    });
  }, [updateAndSync]);

  const updateCaseFile = useCallback((file: CaseFile) => {
    updateAndSync(prev => {
        const newStage = calculateRecoveryStage(prev.baseline, file);
        return { ...prev, caseFile: file, recoveryStage: newStage };
    });
  }, [updateAndSync]);

  const updateBaseline = useCallback((data: BaselineData) => {
    updateAndSync(prev => {
        const newStage = calculateRecoveryStage(data, prev.caseFile);
        return { ...prev, baseline: data, recoveryStage: newStage };
    });
  }, [updateAndSync]);

  const updateProfile = useCallback((profileUpdates: Partial<UserProfile>) => {
    updateAndSync(prev => ({ ...prev, profile: { ...prev.profile, ...profileUpdates } }));
  }, [updateAndSync]);

  const switchCourse = useCallback((courseId: string) => {
    updateAndSync(prev => {
      const exists = COURSES.find(c => c.id === courseId);
      if (!exists) return prev;
      return { ...prev, activeCourseId: courseId };
    });
  }, [updateAndSync]);

  const toggleChecklistItem = useCallback((nodeId: string, itemId: string, xpReward: number) => {
      updateAndSync(prev => {
          const currentProgress = prev.checklistProgress[nodeId] || [];
          const isCompleted = currentProgress.includes(itemId);
          
          let newProgress;
          let newXP = prev.xp;
          let newLevel = prev.level;

          if (isCompleted) {
              newProgress = currentProgress.filter(id => id !== itemId);
          } else {
              newProgress = [...currentProgress, itemId];
              newXP += xpReward;
              newLevel = computeLevelFromXP(newXP);
          }

          return {
              ...prev,
              xp: newXP,
              level: newLevel,
              checklistProgress: {
                  ...prev.checklistProgress,
                  [nodeId]: newProgress
              }
          };
      });
  }, [updateAndSync]);

  const recordAssessment = useCallback((entry: AssessmentLogEntry) => {
      updateAndSync(prev => ({
          ...prev,
          assessmentHistory: [...(prev.assessmentHistory || []), entry]
      }));
  }, [updateAndSync]);

  const updateClinicalProfile = useCallback((profile: ClinicalConceptualization) => {
      updateAndSync(prev => ({ ...prev, clinicalProfile: profile }));
  }, [updateAndSync]);

  // --- PLANNER ACTIONS ---
  const addUserTask = useCallback((text: string, type: 'daily' | 'weekly') => {
      updateAndSync(prev => ({
          ...prev,
          userTasks: [...prev.userTasks, {
              id: `task_${Date.now()}`,
              text,
              type,
              isCompleted: false,
              createdAt: new Date().toISOString()
          }]
      }));
  }, [updateAndSync]);

  const toggleUserTask = useCallback((taskId: string) => {
      updateAndSync(prev => {
          let xpAdded = 0;
          const updatedTasks = prev.userTasks.map(t => {
              if (t.id === taskId) {
                  // Award XP on completion only
                  if (!t.isCompleted) xpAdded = t.type === 'weekly' ? 50 : 10;
                  return { ...t, isCompleted: !t.isCompleted };
              }
              return t;
          });
          
          return {
              ...prev,
              userTasks: updatedTasks,
              xp: prev.xp + xpAdded
          };
      });
  }, [updateAndSync]);

  const deleteUserTask = useCallback((taskId: string) => {
      updateAndSync(prev => ({
          ...prev,
          userTasks: prev.userTasks.filter(t => t.id !== taskId)
      }));
  }, [updateAndSync]);

  const resetProgress = useCallback(async () => {
     if(window.confirm("Are you sure you want to DELETE this profile? This cannot be undone.")) {
         if (currentUsername) {
             const safeKey = currentUsername.toLowerCase();
             // Try Supabase delete
             try {
                await supabase.from('user_states').delete().eq('username', safeKey);
             } catch(e) {}
             
             // Local delete
             localStorage.removeItem(`rq_user_${safeKey}`);
             
             // Registry update
             const registry = JSON.parse(localStorage.getItem('rq_registry_v1') || '[]');
             const newRegistry = registry.filter((u: string) => u !== safeKey);
             localStorage.setItem('rq_registry_v1', JSON.stringify(newRegistry));

             logout();
         }
     }
  }, [currentUsername]);

  return (
    <UserContext.Provider
      value={{
        state: user || INITIAL_NEW_USER_STATE,
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        addXP,
        addGems,
        spendGems,
        buyShopItem,
        completeNode,
        takeDamage,
        restoreHearts,
        collectTool,
        logMeeting,
        completeQuest,
        claimDailyQuest,
        receiveSponsorQuest,
        clearNotifications,
        updateWellnessScores,
        updateCaseFile,
        updateBaseline,
        updateProfile,
        switchCourse,
        toggleChecklistItem,
        resetProgress,
        checkStreak,
        recordAssessment,
        updateClinicalProfile,
        completeTutorial,
        addUserTask,
        toggleUserTask,
        deleteUserTask
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
