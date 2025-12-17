
import { DesignerCurriculum, DesignerUnit, DesignerBossScenario, BossScenario } from '../types';
import { CURRICULUM_TREE, BOSS_SCENARIOS } from '../constants';

// Convert runtime BOSS_SCENARIOS -> DesignerBossScenario[]
const DESIGNER_BOSS_SCENARIOS: DesignerBossScenario[] = Object.values(BOSS_SCENARIOS as Record<number, BossScenario>).map(
  (boss) => ({
    id: boss.id,
    title: boss.title,
    description: '', // Runtime doesn't have description on BossScenario root consistently, usually in node
    initialSceneId: boss.initialSceneId,
    scenes: Object.values(boss.scenes).map((scene) => ({
      id: scene.id,
      text: scene.text,
      options: scene.options.map((opt, idx) => ({
        id: `opt_${idx + 1}`, // Generate IDs for options as they are arrays in runtime
        text: opt.text,
        outcome: opt.outcome,
        feedback: opt.feedback,
        damage: opt.damage,
        xp: opt.xp,
        nextSceneId: opt.nextSceneId,
      })),
    })),
  })
);

// Convert runtime CURRICULUM_TREE -> DesignerUnit[]
const DESIGNER_UNITS: DesignerUnit[] = CURRICULUM_TREE.map((unit) => ({
  id: unit.id,
  title: unit.title,
  description: unit.description,
  color: unit.color,
  nodes: unit.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    title: node.title,
    description: node.description,
    xpReward: node.xpReward,
    targetDimension: node.targetDimension,
    recoveryStage: node.recoveryStage,
    riskLevel: node.riskLevel,
    bossScenarioId: node.bossScenarioId,
    prerequisites: node.prerequisites || [],
  })),
}));

export const DESIGNER_CURRICULUM: DesignerCurriculum = {
  units: DESIGNER_UNITS,
  bossScenarios: DESIGNER_BOSS_SCENARIOS,
};
