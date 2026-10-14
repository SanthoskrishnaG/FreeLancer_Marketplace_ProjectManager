import { describe, it, expect } from 'vitest';
import { AiProjectAnalysisService } from '../services/aiProjectAnalysisService.js';

describe('AI Project Analysis & Milestone Breakdown', () => {
  it('should generate structured milestones with discrete budgets and acceptance criteria', async () => {
    const input = {
      title: 'Full Stack AI Platform',
      description: 'Need a healthcare AI application with appointment scheduling, doctor dashboard, and Stripe escrow integration.',
      budget: 5000,
      durationWeeks: 4
    };

    const result = await AiProjectAnalysisService.generateMilestones(input);

    expect(result).toBeDefined();
    expect(result.milestones).toBeInstanceOf(Array);
    expect(result.milestones.length).toBeGreaterThan(0);

    const totalCalculated = result.milestones.reduce((acc, m) => acc + m.amount, 0);
    expect(totalCalculated).toBe(5000);

    result.milestones.forEach((m) => {
      expect(m.title).toBeTypeOf('string');
      expect(m.description).toBeTypeOf('string');
      expect(m.amount).toBeGreaterThan(0);
      expect(m.acceptanceCriteria).toBeTypeOf('string');
    });
  }, 15000);

  it('should analyze requirements and return structured features and tech stack recommendations', async () => {
    const input = {
      description: 'Building a real-time collaborative marketplace with WebSockets and payments.',
      category: 'Web Development',
      budget: 3500
    };

    const analysis = await AiProjectAnalysisService.analyzeRequirements(input);

    expect(analysis).toBeDefined();
    expect(analysis.features).toBeInstanceOf(Array);
    expect(analysis.recommendedSkills).toBeInstanceOf(Array);
    expect(analysis.estimatedWeeks).toBeGreaterThan(0);
  }, 15000);
});
