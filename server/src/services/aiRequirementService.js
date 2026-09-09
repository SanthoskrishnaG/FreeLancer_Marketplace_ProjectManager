import { AiProjectAnalysisService } from './aiProjectAnalysisService.js';

export class AiRequirementService {
  static async analyze(prompt, budget, timeline) {
    return AiProjectAnalysisService.analyzeRequirement(prompt, budget, timeline);
  }
}

export class AiMilestoneService {
  static async generate(prompt, budget, timeline) {
    const analysis = await AiProjectAnalysisService.analyzeRequirement(prompt, budget, timeline);
    return analysis.milestones;
  }
}
