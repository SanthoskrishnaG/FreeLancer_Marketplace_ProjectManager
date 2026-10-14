import { envConfig } from '../config/env.config.js';

export class AiProjectAnalysisService {
  /**
   * Main entry point to analyze natural-language project requirements and generate
   * category, complexity, skills, timeline, and structured milestones.
   */
  static async analyzeRequirement(prompt, requestedBudget, requestedTimelineWeeks) {
    // 1. Prioritize Groq API (High-performance inference engine)
    if (envConfig.groq?.apiKey) {
      try {
        return await this.callGroq(prompt, requestedBudget, requestedTimelineWeeks);
      } catch (err) {
        console.warn('⚠️ Groq API call failed or timed out. Falling back to Mock AI engine:', err.message);
        return this.generateMockAnalysis(prompt, requestedBudget, requestedTimelineWeeks);
      }
    }

    // 2. OpenAI API fallback if Groq is not configured
    if (envConfig.openai?.apiKey) {
      try {
        return await this.callOpenAi(prompt, requestedBudget, requestedTimelineWeeks);
      } catch (err) {
        console.warn('⚠️ OpenAI API call failed or timed out. Falling back to Mock AI engine:', err.message);
        return this.generateMockAnalysis(prompt, requestedBudget, requestedTimelineWeeks);
      }
    }

    // 3. Default development mock fallback
    return this.generateMockAnalysis(prompt, requestedBudget, requestedTimelineWeeks);
  }

  static async analyzeRequirements({ description, category, budget }) {
    const analysis = await this.analyzeRequirement(description, budget);
    return {
      category: category || analysis.category,
      complexity: analysis.complexity,
      estimatedWeeks: analysis.estimatedTimelineWeeks,
      features: analysis.requirements,
      recommendedSkills: analysis.skills,
    };
  }

  static async generateMilestones({ title, description, budget, durationWeeks }) {
    const analysis = await this.analyzeRequirement(description, budget, durationWeeks);
    const calculatedBudget = Number(budget) || 5000;

    const milestones = analysis.milestones.map((m, idx) => ({
      order: idx + 1,
      title: m.title,
      description: m.description,
      amount: Math.round((calculatedBudget * m.budgetPercentage) / 100),
      durationDays: m.estimatedDuration,
      acceptanceCriteria: Array.isArray(m.acceptanceCriteria)
        ? m.acceptanceCriteria.join('; ')
        : m.acceptanceCriteria || 'Acceptance criteria verification',
    }));

    // Adjust any rounding discrepancy on the final milestone so the sum matches budget exactly
    const sum = milestones.reduce((acc, curr) => acc + curr.amount, 0);
    const diff = calculatedBudget - sum;
    if (diff !== 0 && milestones.length > 0) {
      milestones[milestones.length - 1].amount += diff;
    }

    return {
      title,
      totalBudget: calculatedBudget,
      durationWeeks: durationWeeks || analysis.estimatedTimelineWeeks,
      milestones,
    };
  }

  static async callGroq(prompt, requestedBudget, requestedTimelineWeeks) {
    const systemPrompt = `You are a Principal Software Architect and Project Manager.
Analyze the user's project requirements and respond ONLY with a valid JSON object matching this schema:
{
  "category": string (e.g. "Web Development", "Mobile App Development", "AI & Machine Learning", "E-Commerce Solutions", "UI/UX Design"),
  "complexity": "Low" | "Medium" | "High" | "Enterprise",
  "estimatedTimelineWeeks": number,
  "estimatedBudget": number,
  "skills": string[],
  "requirements": string[],
  "milestones": [
    {
      "title": string,
      "description": string,
      "deliverables": string[],
      "estimatedDuration": number (in days),
      "budgetPercentage": number (sum must equal 100),
      "dependencies": string[],
      "acceptanceCriteria": string[]
    }
  ]
}
Do NOT wrap the output in markdown code blocks or commentary. Output raw JSON only.`;

    const userMessage = `Project Requirement: "${prompt}".
Target Budget: ${requestedBudget ? `$${requestedBudget}` : 'Flexible'}.
Target Timeline: ${requestedTimelineWeeks ? `${requestedTimelineWeeks} weeks` : 'Standard'}.`;

    const model = envConfig.groq?.model || 'openai/gpt-oss-120b';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${envConfig.groq.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Groq responded with status ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    return JSON.parse(content);
  }

  static async callOpenAi(prompt, requestedBudget, requestedTimelineWeeks) {
    const systemPrompt = `You are a Principal Software Architect and Project Manager.
Analyze the user's project requirements and respond ONLY with a valid JSON object matching this schema:
{
  "category": string (e.g. "Web Development", "Mobile App Development", "AI & Machine Learning", "E-Commerce Solutions", "UI/UX Design"),
  "complexity": "Low" | "Medium" | "High" | "Enterprise",
  "estimatedTimelineWeeks": number,
  "estimatedBudget": number,
  "skills": string[],
  "requirements": string[],
  "milestones": [
    {
      "title": string,
      "description": string,
      "deliverables": string[],
      "estimatedDuration": number (in days),
      "budgetPercentage": number (sum must equal 100),
      "dependencies": string[],
      "acceptanceCriteria": string[]
    }
  ]
}
Do NOT wrap the output in markdown code blocks or commentary. Output raw JSON only.`;

    const userMessage = `Project Requirement: "${prompt}".
Target Budget: ${requestedBudget ? `$${requestedBudget}` : 'Flexible'}.
Target Timeline: ${requestedTimelineWeeks ? `${requestedTimelineWeeks} weeks` : 'Standard'}.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${envConfig.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: envConfig.openai?.model || 'gpt-4o',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI responded with status ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    return JSON.parse(content);
  }

  /**
   * High quality fallback generator that dynamically adapts to keywords in the user's prompt
   */
  static generateMockAnalysis(prompt, requestedBudget, requestedTimelineWeeks) {
    const p = prompt.toLowerCase();
    const budget = requestedBudget || 5000;
    const weeks = requestedTimelineWeeks || 6;

    let category = 'Web Development';
    let skills = ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'];
    let complexity = 'Medium';

    if (p.includes('mobile') || p.includes('app') || p.includes('ios') || p.includes('android')) {
      category = 'Mobile App Development';
      skills = ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST API'];
    } else if (p.includes('ai') || p.includes('llm') || p.includes('chatbot') || p.includes('gpt')) {
      category = 'AI & Machine Learning';
      skills = ['Python', 'OpenAI API', 'LangChain', 'FastAPI', 'PostgreSQL'];
      complexity = 'High';
    } else if (p.includes('ecommerce') || p.includes('e-commerce') || p.includes('store') || p.includes('shop')) {
      category = 'E-Commerce Solutions';
      skills = ['React', 'Node.js', 'Stripe Integration', 'PostgreSQL', 'Tailwind CSS'];
    } else if (p.includes('design') || p.includes('figma') || p.includes('ui') || p.includes('ux')) {
      category = 'UI/UX Design';
      skills = ['Figma', 'UI/UX Design', 'Wireframing', 'User Research'];
      complexity = 'Low';
    }

    const milestones = [
      {
        title: 'Project Architecture, SRS & UI/UX Wireframes',
        description: 'Complete system requirements document, entity-relationship diagrams, API specifications, and interactive wireframes.',
        deliverables: ['System Architecture Document', 'Figma Interactive Prototypes', 'Database ERD Diagram'],
        estimatedDuration: Math.max(Math.round((weeks * 7) * 0.2), 3),
        budgetPercentage: 20,
        dependencies: [],
        acceptanceCriteria: [
          'All database schemas and relations are mapped out',
          'Client signs off on visual layout and design system',
          'API contract specifications completed',
        ],
      },
      {
        title: 'Core Backend Development & Database Schema',
        description: 'Implementation of the core data models, RESTful API endpoints, authentication, and role authorization.',
        deliverables: ['Database Migrations', 'Secure Authentication Endpoints', 'Core CRUD API Services'],
        estimatedDuration: Math.max(Math.round((weeks * 7) * 0.3), 5),
        budgetPercentage: 35,
        dependencies: ['Project Architecture, SRS & UI/UX Wireframes'],
        acceptanceCriteria: [
          'All core endpoints tested with 100% pass rate',
          'JWT authentication with role guards operational',
          'PostgreSQL migrations execute cleanly',
        ],
      },
      {
        title: 'Frontend Client Integration & Workflow Execution',
        description: 'Connecting user interfaces to backend APIs, client-side validation, error states, and real-time feeds.',
        deliverables: ['Fully Integrated User Portal', 'Responsive Component Views', 'Real-Time Notification Feeds'],
        estimatedDuration: Math.max(Math.round((weeks * 7) * 0.3), 5),
        budgetPercentage: 30,
        dependencies: ['Core Backend Development & Database Schema'],
        acceptanceCriteria: [
          'Zero console errors across all pages',
          'Responsive design tested on mobile, tablet, and desktop',
          'Interactive forms validate input according to schema',
        ],
      },
      {
        title: 'QA Automated Testing, Security Audit & Cloud Deployment',
        description: 'End-to-end integration tests, load testing, performance tuning, and production hosting setup.',
        deliverables: ['Automated Test Suite Suite', 'Deployment Configuration', 'Final Acceptance Walkthrough'],
        estimatedDuration: Math.max(Math.round((weeks * 7) * 0.2), 4),
        budgetPercentage: 15,
        dependencies: ['Frontend Client Integration & Workflow Execution'],
        acceptanceCriteria: [
          'All automated test suites pass without regression',
          'Security audit checks pass with zero high-severity issues',
          'Live staging build verified by client',
        ],
      },
    ];

    return {
      category,
      complexity,
      estimatedTimelineWeeks: weeks,
      estimatedBudget: budget,
      skills,
      requirements: [
        'Responsive, modern SaaS layout',
        'Secure token-based authentication and role enforcement',
        'Data persistence in PostgreSQL with transactional safety',
        'Real-time updates and notification indicators',
      ],
      milestones,
    };
  }
}
