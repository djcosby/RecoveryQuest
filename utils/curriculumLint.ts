import { DesignerCurriculum, DesignerBossScenario, LintResult, LintIssue } from '../types';

export interface BossValidationIssue {
  level: 'error' | 'warning';
  message: string;
  sceneId?: string;
  optionId?: string;
}

export function validateSingleBossScenario(
  scenario: DesignerBossScenario
): BossValidationIssue[] {
  const issues: BossValidationIssue[] = [];
  const sceneIds = new Set(scenario.scenes.map((s) => s.id));

  if (!sceneIds.has(scenario.initialSceneId)) {
    issues.push({
      level: 'error',
      message: `Initial scene "${scenario.initialSceneId}" does not exist in scenes.`,
    });
  }

  // Map from sceneId to "incoming" count for orphan detection
  const incomingCount: Record<string, number> = {};
  scenario.scenes.forEach((s) => {
    incomingCount[s.id] = 0;
  });

  for (const scene of scenario.scenes) {
    for (const opt of scene.options) {
      if (opt.nextSceneId) {
        if (!sceneIds.has(opt.nextSceneId)) {
          issues.push({
            level: 'error',
            message: `Option "${opt.id}" in scene "${scene.id}" points to missing nextSceneId "${opt.nextSceneId}".`,
            sceneId: scene.id,
            optionId: opt.id,
          });
        } else {
          incomingCount[opt.nextSceneId] = (incomingCount[opt.nextSceneId] || 0) + 1;
        }
      }
    }
  }

  // Orphan scenes = not initialSceneId + no incoming references
  for (const scene of scenario.scenes) {
    if (
      scene.id !== scenario.initialSceneId &&
      (incomingCount[scene.id] ?? 0) === 0
    ) {
      issues.push({
        level: 'warning',
        message: `Scene "${scene.id}" is never reached (no options point to it).`,
        sceneId: scene.id,
      });
    }
  }

  return issues;
}

export function lintDesignerCurriculum(
  curriculum: DesignerCurriculum
): LintResult {
  const issues: LintIssue[] = [];

  const bossById = new Map<string | number, DesignerBossScenario>();
  (curriculum.bossScenarios || []).forEach((boss) => {
    bossById.set(boss.id, boss);
  });

  const bossReferenceCount = new Map<string | number, number>();
  const allNodeIds = new Set<string>();

  curriculum.units.forEach((unit) => {
    unit.nodes.forEach((node) => {
      allNodeIds.add(node.id);
    });
  });

  // 1) Per-boss validation (scenes, nextSceneId, orphans)
  for (const boss of curriculum.bossScenarios || []) {
    const sceneIds = new Set(boss.scenes.map((s) => s.id));

    if (!sceneIds.has(boss.initialSceneId)) {
      issues.push({
        level: 'error',
        scope: 'bossScenario',
        bossId: boss.id,
        message: `Boss "${boss.title}" (${boss.id}) has initialSceneId "${boss.initialSceneId}" that does not exist.`,
      });
    }

    const incomingCount: Record<string, number> = {};
    boss.scenes.forEach((s) => {
      incomingCount[s.id] = 0;
    });

    for (const scene of boss.scenes) {
      for (const opt of scene.options) {
        if (opt.nextSceneId) {
          if (!sceneIds.has(opt.nextSceneId)) {
            issues.push({
              level: 'error',
              scope: 'option',
              bossId: boss.id,
              sceneId: scene.id,
              optionId: opt.id,
              message: `Boss "${boss.id}" option "${opt.id}" in scene "${scene.id}" points to missing scene "${opt.nextSceneId}".`,
            });
          } else {
            incomingCount[opt.nextSceneId] =
              (incomingCount[opt.nextSceneId] || 0) + 1;
          }
        }
      }
    }

    for (const scene of boss.scenes) {
      if (
        scene.id !== boss.initialSceneId &&
        (incomingCount[scene.id] ?? 0) === 0
      ) {
        issues.push({
          level: 'warning',
          scope: 'scene',
          bossId: boss.id,
          sceneId: scene.id,
          message: `Boss "${boss.id}" scene "${scene.id}" is never reached (no options reference it, and it is not the initial scene).`,
        });
      }
    }
  }

  // 2) Units/nodes: prerequisites & boss references
  for (const unit of curriculum.units) {
    for (const node of unit.nodes) {
      if (node.prerequisites && node.prerequisites.length > 0) {
        for (const preId of node.prerequisites) {
          if (!allNodeIds.has(preId)) {
            issues.push({
              level: 'error',
              scope: 'node',
              unitId: unit.id,
              nodeId: node.id,
              message: `Node "${node.id}" in unit "${unit.id}" has prerequisite "${preId}" that does not exist in any unit.`,
            });
          }
        }
      }

      if (node.type === 'boss') {
        if (node.bossScenarioId == null) {
          issues.push({
            level: 'error',
            scope: 'node',
            unitId: unit.id,
            nodeId: node.id,
            message: `Boss node "${node.id}" in unit "${unit.id}" has no bossScenarioId.`,
          });
        } else if (!bossById.has(node.bossScenarioId)) {
          issues.push({
            level: 'error',
            scope: 'node',
            unitId: unit.id,
            nodeId: node.id,
            message: `Boss node "${node.id}" in unit "${unit.id}" references bossScenarioId "${node.bossScenarioId}" that does not exist.`,
          });
        } else {
          const current = bossReferenceCount.get(node.bossScenarioId) || 0;
          bossReferenceCount.set(node.bossScenarioId, current + 1);
        }

        if (!node.prerequisites || node.prerequisites.length === 0) {
          issues.push({
            level: 'warning',
            scope: 'node',
            unitId: unit.id,
            nodeId: node.id,
            message: `Boss node "${node.id}" in unit "${unit.id}" has no prerequisites and will be unlocked immediately.`,
          });
        }
      }
    }
  }

  // 3) Boss scenarios that no node ever points to
  for (const boss of curriculum.bossScenarios || []) {
    const count = bossReferenceCount.get(boss.id) || 0;
    if (count === 0) {
      issues.push({
        level: 'warning',
        scope: 'bossScenario',
        bossId: boss.id,
        message: `Boss scenario "${boss.title}" (${boss.id}) is not referenced by any node (orphan boss).`,
      });
    }
  }

  const errorCount = issues.filter((i) => i.level === 'error').length;
  const warningCount = issues.filter((i) => i.level === 'warning').length;

  return { issues, errorCount, warningCount };
}
