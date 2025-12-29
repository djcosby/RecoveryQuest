import { UnitData, Resource, RecoveryTool } from "../types";
import { CURRICULUM_TREE, RESOURCES_DB, RECOVERY_TOOLS } from "../constants";

export const ContentService = {
  getCurriculum: async (): Promise<UnitData[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(CURRICULUM_TREE), 50));
  },
  getResources: async (): Promise<Resource[]> => {
     return new Promise((resolve) => setTimeout(() => resolve(RESOURCES_DB), 50));
  },
  getTools: async (): Promise<Record<string, RecoveryTool>> => {
      return new Promise((resolve) => setTimeout(() => resolve(RECOVERY_TOOLS), 50));
  }
};