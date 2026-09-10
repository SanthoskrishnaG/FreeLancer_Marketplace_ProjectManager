import { z } from 'zod';
import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

// Strict Zod schema for validated AI milestones output
export const aiGeneratedMilestoneSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  deliverables: z.array(z.string()).min(1),
  estimatedDuration: z.string().min(2),
  budgetPercentage: z.number().min(1).max(100),
  dependencies: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).min(1),
});

export const aiMilestoneListSchema = z.object({
  summary: z.string(),
  milestones: z.array(aiGeneratedMilestoneSchema).min(2).max(12),
});

export type AIGeneratedMilestone = z.infer<typeof aiGeneratedMilestoneSchema> & {
  amount: number;
  order: number;
};

export class AIRequirementService {
  private static getOpenAIClient(): OpenAI | null {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return null;
    }
    return new OpenAI({ apiKey });
  }

  public static async generateMilestones(params: {
    projectTitle: string;
    projectDescription: string;
    projectRequirements?: string | null;
    totalBudget: number;
    customPrompt?: string;
  }): Promise<{
    source: 'openai' | 'rule_based_fallback';
    summary: string;
    milestones: AIGeneratedMilestone[];
    metadata: {
      generatedAt: string;
      model: string;
      milestoneCount: number;
    };
  }> {
    const { projectTitle, projectDescription, projectRequirements, totalBudget, customPrompt } =
      params;

    const fullRequirementsText = `
Project Title: ${projectTitle}
Description: ${projectDescription}
Specific Requirements: ${projectRequirements || 'None provided'}
Total Budget: $${totalBudget}
Client Custom Focus: ${customPrompt || 'Standard milestone breakdown'}
`.trim();

    const openai = this.getOpenAIClient();

    if (openai) {
      try {
        logger.info(`🤖 Invoking OpenAI for requirement analysis on: "${projectTitle}"`);

        const prompt = `You are a Principal Software Project Manager and Agile Estimation Expert.
Analyze the following project requirements and break them down into 4 to 7 structured, logical, sequential milestones.

Requirements:
${fullRequirementsText}

Respond ONLY with valid JSON conforming to this exact structure:
{
  "summary": "Brief 1-2 sentence executive summary of the scope and strategy",
  "milestones": [
    {
      "title": "Clear milestone title (e.g. Architecture & UI/UX Wireframing)",
      "description": "Thorough summary of what is built in this milestone",
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "estimatedDuration": "e.g. 5 days or 1-2 weeks",
      "budgetPercentage": 20,
      "dependencies": ["Previous milestone title or 'None'"],
      "acceptanceCriteria": ["Criteria 1 for milestone approval", "Criteria 2"]
    }
  ]
}

Ensure the sum of 'budgetPercentage' across all milestones equals exactly 100.`;

        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          throw new Error('Empty response from OpenAI');
        }

        const parsedJson = JSON.parse(rawContent);
        const validated = aiMilestoneListSchema.parse(parsedJson);

        // Normalize budget percentages to ensure they sum to 100
        const totalPct = validated.milestones.reduce((acc, m) => acc + m.budgetPercentage, 0);

        const calculatedMilestones: AIGeneratedMilestone[] = validated.milestones.map((m, idx) => {
          const normalizedPct =
            totalPct > 0 ? Math.round((m.budgetPercentage / totalPct) * 100) : 20;
          const amount = Math.round(((totalBudget * normalizedPct) / 100) * 100) / 100;
          return {
            ...m,
            budgetPercentage: normalizedPct,
            amount,
            order: idx + 1,
          };
        });

        logger.info(
          `✅ Successfully generated ${calculatedMilestones.length} milestones via OpenAI`
        );

        return {
          source: 'openai',
          summary: validated.summary,
          milestones: calculatedMilestones,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: response.model,
            milestoneCount: calculatedMilestones.length,
          },
        };
      } catch (err) {
        logger.warn(
          '⚠️ OpenAI milestone generation failed or timed out. Falling back to intelligent rule-based engine:',
          err
        );
      }
    }

    // Intelligent Fallback Engine
    logger.info(
      `💡 Generating milestones using intelligent domain rule-based analyzer for: "${projectTitle}"`
    );
    return this.generateFallbackMilestones(params);
  }

  private static generateFallbackMilestones(params: {
    projectTitle: string;
    projectDescription: string;
    projectRequirements?: string | null;
    totalBudget: number;
  }): {
    source: 'rule_based_fallback';
    summary: string;
    milestones: AIGeneratedMilestone[];
    metadata: {
      generatedAt: string;
      model: string;
      milestoneCount: number;
    };
  } {
    const { projectTitle, projectDescription, projectRequirements, totalBudget } = params;
    const combinedText =
      `${projectTitle} ${projectDescription} ${projectRequirements || ''}`.toLowerCase();

    const isEcommerce = /e-commerce|shop|store|cart|product|checkout|payment/i.test(combinedText);
    const isMobile = /mobile|ios|android|flutter|react native|app/i.test(combinedText);
    const isAI = /ai|machine learning|llm|chatgpt|openai|nlp|model/i.test(combinedText);

    let rawMilestones: Array<z.infer<typeof aiGeneratedMilestoneSchema>> = [];

    if (isEcommerce) {
      rawMilestones = [
        {
          title: 'Architecture, Wireframes & Database Schema',
          description: 'Design system, ERD modeling, product taxonomy, and UI mockups.',
          deliverables: ['Figma design system', 'PostgreSQL database schema', 'API specification'],
          estimatedDuration: '1 week',
          budgetPercentage: 15,
          dependencies: ['Project Kickoff'],
          acceptanceCriteria: ['Approved visual designs', 'Validated schema diagram'],
        },
        {
          title: 'Authentication & Customer / Merchant Roles',
          description:
            'User registration, JWT session management, RBAC, and secure profile management.',
          deliverables: ['Auth API endpoints', 'Login/Registration UI', 'Role guard middleware'],
          estimatedDuration: '1 week',
          budgetPercentage: 15,
          dependencies: ['Architecture, Wireframes & Database Schema'],
          acceptanceCriteria: ['Working auth flow', 'Password encryption and JWT validation'],
        },
        {
          title: 'Product Catalog, Filters & Search Engine',
          description: 'Category hierarchy, product inventory, image uploads, and search indexing.',
          deliverables: ['Product CRUD APIs', 'Catalog grid with filters', 'Search bar component'],
          estimatedDuration: '1.5 weeks',
          budgetPercentage: 20,
          dependencies: ['Authentication & Customer / Merchant Roles'],
          acceptanceCriteria: ['Instant faceted filtering', 'Responsive product cards'],
        },
        {
          title: 'Shopping Cart & Secure Checkout Flow',
          description:
            'Session cart sync, coupon codes, tax calculations, and Stripe/PayPal integration.',
          deliverables: [
            'Cart state manager',
            'Payment gateway webhooks',
            'Order confirmation page',
          ],
          estimatedDuration: '2 weeks',
          budgetPercentage: 25,
          dependencies: ['Product Catalog, Filters & Search Engine'],
          acceptanceCriteria: ['Successful end-to-end test transactions in Stripe Sandbox'],
        },
        {
          title: 'Admin Dashboard & Order Management',
          description:
            'Order fulfillment status transitions, customer insights, and sales analytics.',
          deliverables: [
            'Admin analytics panel',
            'Order management table',
            'Status update actions',
          ],
          estimatedDuration: '1 week',
          budgetPercentage: 15,
          dependencies: ['Shopping Cart & Secure Checkout Flow'],
          acceptanceCriteria: ['Admin order processing works without errors'],
        },
        {
          title: 'Quality Assurance, Load Testing & Cloud Deployment',
          description:
            'End-to-end testing, SSL configuration, performance optimization, and production launch.',
          deliverables: ['CI/CD pipeline', 'Lighthouse 90+ score', 'Production deployment URL'],
          estimatedDuration: '5 days',
          budgetPercentage: 10,
          dependencies: ['Admin Dashboard & Order Management'],
          acceptanceCriteria: ['Passes security audit and load tests on production hosting'],
        },
      ];
    } else if (isMobile) {
      rawMilestones = [
        {
          title: 'Product Discovery & Mobile UI Design',
          description: 'User journey mapping, mobile layout wireframes, and design token system.',
          deliverables: ['Figma mobile kit', 'Architecture RFC'],
          estimatedDuration: '1 week',
          budgetPercentage: 20,
          dependencies: ['Project Kickoff'],
          acceptanceCriteria: ['Client approval on screen prototypes'],
        },
        {
          title: 'Core App Shell & API Integration',
          description: 'Navigation stack, local storage, API client, and authentication screens.',
          deliverables: ['Navigation framework', 'Authentication workflow'],
          estimatedDuration: '1.5 weeks',
          budgetPercentage: 25,
          dependencies: ['Product Discovery & Mobile UI Design'],
          acceptanceCriteria: ['Smooth navigation and persistent auth sessions'],
        },
        {
          title: 'Feature Implementation & Push Notifications',
          description:
            'Core domain features, real-time sync, offline storage, and notification hooks.',
          deliverables: ['Core feature modules', 'Push notification handler'],
          estimatedDuration: '2 weeks',
          budgetPercentage: 35,
          dependencies: ['Core App Shell & API Integration'],
          acceptanceCriteria: ['All user flows functioning offline/online'],
        },
        {
          title: 'App Store / Play Store Release Preparation',
          description:
            'Beta distribution via TestFlight/Internal Track, crash reporting, and store listing assets.',
          deliverables: ['Production release APK / IPA', 'Store submission metadata'],
          estimatedDuration: '1 week',
          budgetPercentage: 20,
          dependencies: ['Feature Implementation & Push Notifications'],
          acceptanceCriteria: ['App submitted and approved in TestFlight / Play Console'],
        },
      ];
    } else if (isAI) {
      rawMilestones = [
        {
          title: 'Dataset Ingestion & Prompt Engineering Pipeline',
          description:
            'System architecture, API keys security, context embedding, and prompt templates.',
          deliverables: ['LLM client wrapper', 'Prompt orchestration templates'],
          estimatedDuration: '1 week',
          budgetPercentage: 25,
          dependencies: ['Project Kickoff'],
          acceptanceCriteria: ['Reliable structured outputs from model'],
        },
        {
          title: 'Application Interface & Streaming Responses',
          description:
            'Chat / analysis interface, markdown rendering, token streaming, and history storage.',
          deliverables: ['React frontend interface', 'Streaming SSE API endpoint'],
          estimatedDuration: '1.5 weeks',
          budgetPercentage: 35,
          dependencies: ['Dataset Ingestion & Prompt Engineering Pipeline'],
          acceptanceCriteria: ['Sub-second latency token streaming in UI'],
        },
        {
          title: 'Guardrails, Evaluation & Production Optimization',
          description:
            'Content moderation filters, error fallbacks, response caching, and cloud deployment.',
          deliverables: ['Caching layer (Redis)', 'Production Docker container'],
          estimatedDuration: '1.5 weeks',
          budgetPercentage: 40,
          dependencies: ['Application Interface & Streaming Responses'],
          acceptanceCriteria: ['99.9% uptime with rate limiting and fallback safeguards'],
        },
      ];
    } else {
      // General Web / Full Stack SaaS Project
      rawMilestones = [
        {
          title: 'Discovery, Technical Specification & UI Architecture',
          description:
            'Detailed scope breakdown, design system tokens, database modeling, and API schemas.',
          deliverables: [
            'Component wireframes',
            'Database migration schema',
            'API specification docs',
          ],
          estimatedDuration: '1 week',
          budgetPercentage: 20,
          dependencies: ['Project Kickoff'],
          acceptanceCriteria: ['Architecture sign-off and visual style guide approval'],
        },
        {
          title: 'Authentication, Access Control & User Dashboard',
          description:
            'Secure authentication, role authorization, responsive layout shell, and user settings.',
          deliverables: ['Auth endpoints', 'Protected dashboard layout', 'User profile settings'],
          estimatedDuration: '1.5 weeks',
          budgetPercentage: 25,
          dependencies: ['Discovery, Technical Specification & UI Architecture'],
          acceptanceCriteria: ['Flawless login, registration, and role security'],
        },
        {
          title: 'Core Business Logic & Interactive Modules',
          description:
            'Primary workflow execution, CRUD operations, search and filtering, and real-time state.',
          deliverables: ['Feature APIs', 'Frontend interactive components', 'State orchestration'],
          estimatedDuration: '2 weeks',
          budgetPercentage: 35,
          dependencies: ['Authentication, Access Control & User Dashboard'],
          acceptanceCriteria: ['End-to-end functionality verified across all user types'],
        },
        {
          title: 'Automated Testing, Optimization & Staging Deployment',
          description:
            'Unit and integration test suites, bundle optimization, security hardening, and staging rollout.',
          deliverables: [
            'Automated test suite',
            'Optimized production bundle',
            'Staging deployment',
          ],
          estimatedDuration: '1 week',
          budgetPercentage: 20,
          dependencies: ['Core Business Logic & Interactive Modules'],
          acceptanceCriteria: ['100% test pass rate and client sign-off on staging environment'],
        },
      ];
    }

    const calculatedMilestones: AIGeneratedMilestone[] = rawMilestones.map((m, idx) => {
      const amount = Math.round(((totalBudget * m.budgetPercentage) / 100) * 100) / 100;
      return {
        ...m,
        amount,
        order: idx + 1,
      };
    });

    return {
      source: 'rule_based_fallback',
      summary: `Automated requirement breakdown for "${projectTitle}" featuring ${calculatedMilestones.length} structured milestones with progressive deliverables and acceptance criteria.`,
      milestones: calculatedMilestones,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'workpulse-intelligent-analyzer-v1',
        milestoneCount: calculatedMilestones.length,
      },
    };
  }
}
