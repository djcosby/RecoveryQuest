import { useMemo } from 'react';
import { UserState } from '../types';
import { ClipboardList, Stethoscope, Briefcase, Users, Brain, HeartHandshake, ShieldAlert, Home, Utensils } from 'lucide-react';

export interface PriorityTask {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  type: 'baseline' | 'wellness' | 'case_file' | 'network' | 'practice' | 'treatment';
  modalTrigger: 'baseline' | 'wellness' | 'case' | 'network' | 'practice' | 'treatment';
  icon: any;
  priorityLevel: 'critical' | 'high' | 'normal';
}

export const usePriorityEngine = (user: UserState) => {
  return useMemo(() => {
    const tasks: PriorityTask[] = [];
    const caseFile = user.caseFile;

    // --- LEVEL 1: PHYSIOLOGICAL & SAFETY (Maslow's Base) ---
    // If these are missing, nothing else matters as much.
    
    if (caseFile) {
        // 1. Food Security
        if (!caseFile.dignity.foodSource || caseFile.dignity.foodSource === 'None') {
            tasks.push({
                id: 'maslow_food',
                title: 'Secure Food Source',
                subtitle: 'CRITICAL: Connect with SNAP or local pantries.',
                xpReward: 1000,
                type: 'case_file',
                modalTrigger: 'case',
                icon: Utensils,
                priorityLevel: 'critical'
            });
        }

        // 2. Housing Safety
        if (['Homeless', 'Shelter'].includes(caseFile.recovery.housingStatus) || !caseFile.recovery.isEnvironmentSafe) {
            tasks.push({
                id: 'maslow_housing',
                title: 'Stabilize Housing',
                subtitle: 'Priority: Secure a safe sleeping environment.',
                xpReward: 1000,
                type: 'case_file',
                modalTrigger: 'case',
                icon: Home,
                priorityLevel: 'critical'
            });
        }

        // 3. Identity (The Key to Services)
        if (!caseFile.dignity.stateId && !caseFile.dignity.birthCertificate) {
             tasks.push({
                id: 'maslow_id',
                title: 'Reclaim Identity',
                subtitle: 'You need an ID to access almost all services.',
                xpReward: 800,
                type: 'case_file',
                modalTrigger: 'case',
                icon: Briefcase,
                priorityLevel: 'critical'
            });
        }
    }

    // If we have critical survival tasks, return ONLY those to focus the user.
    if (tasks.length > 0) return tasks;

    // --- LEVEL 2: TREATMENT & RECOVERY FOUNDATION ---
    
    // Treatment Compliance Check
    if (user.profile.treatmentPlan) {
        user.profile.treatmentPlan.forEach(req => {
            if (req.currentCount < req.targetCount) {
                tasks.push({
                    id: `tx_${req.id}`,
                    title: req.label,
                    subtitle: `${req.currentCount}/${req.targetCount} sessions completed this week.`,
                    xpReward: 250,
                    type: 'treatment',
                    modalTrigger: 'treatment', // New modal needed
                    icon: ShieldAlert,
                    priorityLevel: 'high'
                });
            }
        });
    }

    // Baseline Assessment
    if (!user.baseline) {
      tasks.push({
        id: 'baseline_init',
        title: 'Establish Baseline',
        subtitle: 'Define your history and goals.',
        xpReward: 500,
        type: 'baseline',
        modalTrigger: 'baseline',
        icon: ClipboardList,
        priorityLevel: 'high'
      });
    }

    // --- LEVEL 3: GROWTH & SKILLS ---
    
    // Only show if base needs are met
    tasks.push({
        id: 'emotional_kombat',
        title: 'Emotional Kombat',
        subtitle: 'Train your emotional defense reflexes.',
        xpReward: 100,
        type: 'practice',
        modalTrigger: 'practice',
        icon: Brain,
        priorityLevel: 'normal'
    });

    return tasks.sort((a, b) => {
        const pMap = { critical: 3, high: 2, normal: 1 };
        return pMap[b.priorityLevel] - pMap[a.priorityLevel];
    });

  }, [user.baseline, user.caseFile, user.profile.treatmentPlan]);
};