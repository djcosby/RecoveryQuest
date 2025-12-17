
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

    if (!units.length) {
      return { primaryNodeIds: [], secondaryNodeIds: [], rationale, debugByNodeId };
    }

    // 1) Context gathering
    const riskText = normalize(personalityProfile?.riskAreas.join(' ') ?? '');
    const isIntrovert = personalityProfile?.traits.energy === 'Introverted';

    const avgMoodValue =
      MOOD_HISTORY.reduce((acc, m) => acc + m.value, 0) / MOOD_HISTORY.length;
    const hasRecentStruggle = MOOD_HISTORY.some(
      (m) => m.mood === 'Struggling' || m.mood === 'Anxious'
    );

    const needsSocialSupport = isIntrovert || riskText.includes('isolation');
    const needsBoundaries =
      riskText.includes('burnout') ||
      riskText.includes('over-committing') ||
      riskText.includes('people pleaser');

    const needsStabilityBoost = avgMoodValue < 2.5 || hasRecentStruggle;

    // Identify low scoring dimensions from wellness scores
    const lowDimensions: WellnessDimension[] = [];
    if (userState.wellnessScores) {
        (Object.keys(userState.wellnessScores) as WellnessDimension[]).forEach(dim => {
            // Max score is typically 40 (10 questions * 4). Low is <= 20.
            if ((userState.wellnessScores![dim] || 0) <= 20) {
                lowDimensions.push(dim);
            }
        });
    }

    type ScoredNode = { node: PathNodeData; score: number; reasons: string[] };
    const scored: ScoredNode[] = [];

    // 2) Score nodes + fill debug map
    for (const unit of units) {
      for (const node of unit.nodes) {
        const baseDebug = debugByNodeId[node.id] || {
          score: 0,
          reasons: [] as string[],
          unitTitle: unit.title,
          nodeTitle: node.title,
          type: node.type,
          targetDimension: node.targetDimension,
        };

        // Boss nodes: we show them as "not auto-scored"
        if (node.type === 'boss') {
          baseDebug.reasons.push('Boss node – gated by prerequisites, not auto-recommended');
          debugByNodeId[node.id] = baseDebug;
          continue;
        }

        let score = 0;
        const reasons: string[] = [];

        const isCompleted = userState.completedNodes.includes(node.id);
        const isUnlocked = node.status !== 'locked';

        if (!isCompleted && isUnlocked) {
          score += 2;
          reasons.push('Unlocked and not completed');
        }

        // Boost nodes targeting low wellness dimensions
        if (node.targetDimension && lowDimensions.includes(node.targetDimension)) {
            score += 4;
            reasons.push(`Targets critical dimension: ${node.targetDimension} (Low Wellness Score)`);
        }

        if (needsSocialSupport && node.targetDimension === 'Social') {
          score += 3;
          reasons.push('Social support to counter isolation / introversion risks');
        }

        if (
          needsBoundaries &&
          node.title.toLowerCase().includes('boundar')
        ) {
          score += 3;
          reasons.push('Boundaries focus to prevent burnout / over-committing');
        }

        if (node.recoveryStage === 'Action') {
          score += 1;
          reasons.push('Aligned with Action-stage change');
        }

        if (node.riskLevel === 'moderate' || node.riskLevel === 'high') {
          score += 1;
          reasons.push('Targets moderate/high-risk themes');
        }

        if (needsStabilityBoost) {
          if (node.targetDimension === 'Emotional') {
            score += 2;
            reasons.push('Emotional regulation support during low mood');
          }
          if (node.targetDimension === 'Physical') {
            score += 1;
            reasons.push('Physical self-care to stabilize mood');
          }
        }

        baseDebug.score = score;
        baseDebug.reasons = reasons;
        debugByNodeId[node.id] = baseDebug;

        if (score > 0) {
          scored.push({ node, score, reasons });
        }
      }
    }

    // 3) Sort & choose primary / secondary recommendations
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.node.xpReward || 0) - (a.node.xpReward || 0);
    });

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
