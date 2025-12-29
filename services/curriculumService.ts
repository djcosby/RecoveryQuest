
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UnitData, PathNodeData, NodeType, ContentBlock } from '../types';

export const CurriculumService = {
  async fetchTrack(trackId: string): Promise<UnitData[]> {
    if (!isSupabaseConfigured) {
      // Return static data as fallback if needed, or throw
      throw new Error("Supabase not configured");
    }

    // Fetch units for the track
    const { data: units, error: unitError } = await supabase
      .from('curriculum_units')
      .select('*')
      .eq('track_id', trackId)
      .order('order_index', { ascending: true });

    if (unitError) throw unitError;

    // Fetch all nodes for these units
    const unitIds = units.map(u => u.id);
    const { data: nodes, error: nodeError } = await supabase
      .from('curriculum_nodes')
      .select('*')
      .in('unit_id', unitIds)
      .order('order_index', { ascending: true });

    if (nodeError) throw nodeError;

    // Map DB schema to App types
    return units.map(unit => ({
      id: unit.id,
      title: unit.title,
      description: unit.description || '',
      color: unit.color || 'indigo',
      requirements: unit.requirements || { minXP: 0 },
      nodes: nodes
        .filter(n => n.unit_id === unit.id)
        .map(n => ({
          id: n.id,
          type: n.type as NodeType,
          title: n.title,
          description: n.description,
          xpReward: n.xp_reward,
          contentBlocks: n.content_blocks as ContentBlock[], // JSONB interaction blocks
          educationalContent: n.educational_content,
          bossScenarioId: n.boss_scenario_id,
          targetDimension: n.target_dimension,
          recoveryStage: n.recovery_stage,
          riskLevel: n.risk_level,
          prerequisites: [] 
        }))
    }));
  },

  /**
   * Records an interaction result to the database for spaced repetition tracking.
   */
  async logInteraction(nodeId: string, segmentId: string, type: string, isCorrect: boolean) {
    if (!isSupabaseConfigured) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from('user_learning_history').insert({
      user_id: userData.user.id,
      node_id: nodeId,
      segment_id: segmentId,
      interaction_type: type,
      is_correct: isCorrect
    });

    if (error) console.error("Failed to log interaction", error);
  }
};
