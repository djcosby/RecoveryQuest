
import { useMemo } from 'react';
import { UnitData, PersonalityProfile, UserState, PathNodeData, NodeType, WellnessDimension } from '../types';
import { MOOD_HISTORY } from '../constants';

interface RecoveryRecommendationResult {
  primaryNodeIds: string[];
  secondaryNodeIds: string[];
  rationale: string[];
  debugByNodeId: Record<
    string,
    {
      score: number;
      reasons: string[];
      unitTitle: string;
      nodeTitle: string;
      type: NodeType;
      targetDimension?: WellnessDimension;
    }
  >;
}

const normalize = (s: string) => s.toLowerCase();

export const useRecoveryRecommender = (
  units: UnitData[],
  personalityProfile: PersonalityProfile | null,
  userState: UserState
): RecoveryRecommendationResult => {
  return useMemo(() => {
    const primary: Set<string> = new Set();
    const secondary: Set<string> = new Set();
    const rationale: string[] = [];
    const debugByNodeId: RecoveryRecommendationResult['debugByNodeId'] = {};

    if (!units || !units.length) {
      return { primaryNodeIds: [], secondaryNodeIds: [], rationale, debugByNodeId };
    }

    const riskText = normalize(personalityProfile?.riskAreas.join(' ') ?? '');
    const avgMoodValue = MOOD_HISTORY.reduce((acc, m) => acc + m.value, 0) / MOOD_HISTORY.length;
    
    const lowDimensions: WellnessDimension[] = [];
    if (userState.wellnessScores) {
        (Object.keys(userState.wellnessScores) as WellnessDimension[]).forEach(dim => {
            if ((userState.wellnessScores![dim] || 0) <= 20) {
                lowDimensions.push(dim);
            }
        });
    }

    type ScoredNode = { node: any; score: number; reasons: string[] };
    const scored: ScoredNode[] = [];

    for (const unit of units) {
      const nodes = unit.nodes || (unit as any).levels || [];
      for (const node of nodes) {
        const baseDebug = debugByNodeId[node.id] || {
          score: 0,
          reasons: [] as string[],
          unitTitle: unit.title,
          nodeTitle: node.title,
          type: node.type || (node.isBoss ? 'boss' : 'lesson'),
          targetDimension: node.targetDimension || node.dimension,
        };

        if (node.type === 'boss' || node.isBoss) {
          baseDebug.reasons.push('Boss node – excluded from recs');
          debugByNodeId[node.id] = baseDebug;
          continue;
        }

        let score = 0;
        const reasons: string[] = [];
        const isCompleted = userState.completedNodes.includes(node.id);

        if (!isCompleted) {
          score += 2;
          reasons.push('Uncompleted task');
        }

        const dimension = node.targetDimension || node.dimension;
        if (dimension && lowDimensions.includes(dimension)) {
            score += 4;
            reasons.push(`Targets low wellness: ${dimension}`);
        }

        if (node.recoveryStage === 'Action' || node.riskLevel === 'high') {
          score += 1;
        }

        baseDebug.score = score;
        baseDebug.reasons = reasons;
        debugByNodeId[node.id] = baseDebug;

        if (score > 0) {
          scored.push({ node, score, reasons });
        }
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 5);
    const primaryNodes = top.slice(0, 3);
    const secondaryNodes = top.slice(3, 5);

    primaryNodes.forEach((s) => primary.add(s.node.id));
    secondaryNodes.forEach((s) => secondary.add(s.node.id));

    const allReasons = new Set<string>();
    primaryNodes.forEach((s) => s.reasons.forEach((r) => allReasons.add(r)));
    rationale.push(...Array.from(allReasons));

    return {
      primaryNodeIds: Array.from(primary),
      secondaryNodeIds: Array.from(secondary),
      rationale,
      debugByNodeId,
    };
  }, [units, personalityProfile, userState]);
};
