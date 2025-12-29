
import { supabase } from './supabaseClient';
import { Scenario, Beat } from '../types';

export const fetchScenarioById = async (id: string): Promise<Scenario> => {
  // 1. Get the Scenario Metadata
  const { data: scenario, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // 2. Get all Beats for this Scenario
  const { data: beats } = await supabase
    .from('scenario_beats')
    .select(`
      *,
      choices:scenario_choices(*) 
    `)
    .eq('scenario_id', id);

  // 3. Reassemble into your TypeScript structure
  // FIX: Map the database 'beats' array into a Record<string, Beat> to satisfy the Scenario type
  const beatsMap: Record<string, Beat> = {};
  if (beats) {
    beats.forEach((b: any) => {
      beatsMap[b.id] = b as Beat;
    });
  }

  return { ...scenario, beats: beatsMap } as Scenario;
};
