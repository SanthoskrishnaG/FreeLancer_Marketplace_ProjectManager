import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'WorkPulse AI — Freelancer Marketplace & Project Manager API',
    version: '1.0.0',
    description: 'Enterprise REST API powering AI-driven requirement analysis, milestone decomposition, escrow contracts, time tracking, real-time messaging, and admin arbitration.',
    contact: {
      name: 'API Support',
      email: 'support@marketplace.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Primary API Gateway',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user (Client or Freelancer)',
        responses: { 201: { description: 'User created' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login and obtain JWT access token',
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign out and invalidate session',
        responses: { 200: { description: 'Logged out' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh expired access token',
        responses: { 200: { description: 'New access token granted' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        responses: { 200: { description: 'Profile data' } },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List and filter marketplace projects',
        responses: { 200: { description: 'List of projects' } },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create and publish a new project',
        responses: { 201: { description: 'Project created' } },
      },
    },
    '/projects/{id}': {
      get: {
        tags: ['Projects'],
        summary: 'Get project details by ID',
        responses: { 200: { description: 'Project details' } },
      },
    },
    '/projects/{id}/generate-milestones': {
      post: {
        tags: ['AI Engine'],
        summary: 'Generate structured AI milestones for a project',
        responses: { 200: { description: 'AI generated milestones' } },
      },
    },
    '/projects/{id}/proposals': {
      get: {
        tags: ['Proposals'],
        summary: 'List proposals received for a project',
        responses: { 200: { description: 'Proposals list' } },
      },
      post: {
        tags: ['Proposals'],
        summary: 'Submit a new proposal (Freelancers only)',
        responses: { 201: { description: 'Proposal submitted' } },
      },
    },
    '/proposals/{id}/accept': {
      post: {
        tags: ['Contracts'],
        summary: 'Accept proposal and automatically initialize escrow contract',
        responses: { 200: { description: 'Contract initialized' } },
      },
    },
    '/contracts': {
      get: {
        tags: ['Contracts'],
        summary: 'List active contracts for authenticated user',
        responses: { 200: { description: 'Contracts list' } },
      },
    },
    '/milestones/{id}/start': {
      post: {
        tags: ['Milestones'],
        summary: 'Start working on a milestone',
        responses: { 200: { description: 'Milestone set to IN_PROGRESS' } },
      },
    },
    '/milestones/{id}/submit': {
      post: {
        tags: ['Milestones'],
        summary: 'Submit deliverable for milestone review',
        responses: { 200: { description: 'Deliverable submitted' } },
      },
    },
    '/milestones/{id}/approve': {
      post: {
        tags: ['Milestones'],
        summary: 'Approve milestone deliverable and release escrow payment',
        responses: { 200: { description: 'Milestone approved & payment released' } },
      },
    },
    '/time-tracking/start': {
      post: {
        tags: ['Time Tracking'],
        summary: 'Start active stopwatch timer',
        responses: { 201: { description: 'Timer started' } },
      },
    },
    '/invoices/{id}/pdf': {
      get: {
        tags: ['Invoicing'],
        summary: 'Download generated PDF invoice',
        responses: { 200: { description: 'PDF stream' } },
      },
    },
    '/disputes': {
      get: {
        tags: ['Disputes'],
        summary: 'List disputes',
        responses: { 200: { description: 'Disputes' } },
      },
      post: {
        tags: ['Disputes'],
        summary: 'Open a new dispute on a contract',
        responses: { 201: { description: 'Dispute filed' } },
      },
    },
    '/admin/overview': {
      get: {
        tags: ['Admin Governance'],
        summary: 'Full platform metrics & financial velocity overview',
        responses: { 200: { description: 'Platform metrics' } },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'WorkPulse AI API Documentation',
  }));
};
