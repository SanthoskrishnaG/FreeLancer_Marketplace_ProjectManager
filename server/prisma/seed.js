import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Categories (15+)
  const categoriesData = [
    { name: 'Web Development', slug: 'web-development', description: 'Full-stack web applications, React, Vue, Node.js, Next.js' },
    { name: 'Mobile App Development', slug: 'mobile-app-development', description: 'iOS, Android, React Native, and Flutter mobile apps' },
    { name: 'AI & Machine Learning', slug: 'ai-machine-learning', description: 'LLM agents, predictive models, NLP, PyTorch, TensorFlow' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface design, Figma, wireframing, UX research' },
    { name: 'Backend & Cloud DevOps', slug: 'backend-devops', description: 'Microservices, Docker, Kubernetes, AWS, GCP, CI/CD' },
    { name: 'Cybersecurity & Auditing', slug: 'cybersecurity', description: 'Penetration testing, security auditing, vulnerability assessment' },
    { name: 'Data Engineering & Analytics', slug: 'data-engineering', description: 'ETL pipelines, data warehousing, PostgreSQL, Snowflake, BI' },
    { name: 'Blockchain & Web3', slug: 'blockchain-web3', description: 'Smart contracts, Ethereum, Solana, decentralized applications' },
    { name: 'Digital Marketing & SEO', slug: 'digital-marketing', description: 'Search engine optimization, PPC, content marketing, growth' },
    { name: 'Content & Technical Writing', slug: 'content-writing', description: 'Technical documentation, whitepapers, developer tutorials' },
    { name: 'Graphic Design & Branding', slug: 'graphic-design', description: 'Brand identity, logos, vector illustration, marketing collateral' },
    { name: 'Video Editing & Motion Graphics', slug: 'video-editing', description: 'Video post-production, After Effects, 3D motion design' },
    { name: 'QA & Test Automation', slug: 'qa-test-automation', description: 'Cypress, Playwright, Jest, manual QA, load testing' },
    { name: 'E-Commerce Solutions', slug: 'ecommerce-solutions', description: 'Shopify, WooCommerce, Stripe custom payments, storefronts' },
    { name: 'Business Consulting & Strategy', slug: 'business-consulting', description: 'Product management, startup scaling, financial modeling' },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }
  console.log(`✅ Seeded ${categoriesData.length} categories`);

  // 2. Skills (50+)
  const skillsData = [
    { name: 'React', slug: 'react', category: 'Web Development' },
    { name: 'Node.js', slug: 'nodejs', category: 'Web Development' },
    { name: 'JavaScript', slug: 'javascript', category: 'Web Development' },
    { name: 'TypeScript', slug: 'typescript', category: 'Web Development' },
    { name: 'PostgreSQL', slug: 'postgresql', category: 'Backend & Cloud DevOps' },
    { name: 'MongoDB', slug: 'mongodb', category: 'Web Development' },
    { name: 'Python', slug: 'python', category: 'AI & Machine Learning' },
    { name: 'Django', slug: 'django', category: 'Web Development' },
    { name: 'Next.js', slug: 'nextjs', category: 'Web Development' },
    { name: 'Express.js', slug: 'expressjs', category: 'Web Development' },
    { name: 'Tailwind CSS', slug: 'tailwind-css', category: 'Web Development' },
    { name: 'Vue.js', slug: 'vuejs', category: 'Web Development' },
    { name: 'Angular', slug: 'angular', category: 'Web Development' },
    { name: 'React Native', slug: 'react-native', category: 'Mobile App Development' },
    { name: 'Flutter', slug: 'flutter', category: 'Mobile App Development' },
    { name: 'Swift', slug: 'swift', category: 'Mobile App Development' },
    { name: 'Kotlin', slug: 'kotlin', category: 'Mobile App Development' },
    { name: 'GraphQL', slug: 'graphql', category: 'Web Development' },
    { name: 'REST API', slug: 'rest-api', category: 'Web Development' },
    { name: 'Docker', slug: 'docker', category: 'Backend & Cloud DevOps' },
    { name: 'Kubernetes', slug: 'kubernetes', category: 'Backend & Cloud DevOps' },
    { name: 'AWS', slug: 'aws', category: 'Backend & Cloud DevOps' },
    { name: 'Google Cloud Platform', slug: 'gcp', category: 'Backend & Cloud DevOps' },
    { name: 'CI/CD Pipelines', slug: 'ci-cd', category: 'Backend & Cloud DevOps' },
    { name: 'Figma', slug: 'figma', category: 'UI/UX Design' },
    { name: 'UI/UX Design', slug: 'ui-ux-design-skill', category: 'UI/UX Design' },
    { name: 'Wireframing', slug: 'wireframing', category: 'UI/UX Design' },
    { name: 'User Research', slug: 'user-research', category: 'UI/UX Design' },
    { name: 'PyTorch', slug: 'pytorch', category: 'AI & Machine Learning' },
    { name: 'TensorFlow', slug: 'tensorflow', category: 'AI & Machine Learning' },
    { name: 'OpenAI API', slug: 'openai-api', category: 'AI & Machine Learning' },
    { name: 'LangChain', slug: 'langchain', category: 'AI & Machine Learning' },
    { name: 'Data Visualization', slug: 'data-visualization', category: 'Data Engineering & Analytics' },
    { name: 'Snowflake', slug: 'snowflake', category: 'Data Engineering & Analytics' },
    { name: 'Apache Kafka', slug: 'apache-kafka', category: 'Data Engineering & Analytics' },
    { name: 'Cybersecurity Auditing', slug: 'cybersecurity-audit', category: 'Cybersecurity & Auditing' },
    { name: 'Penetration Testing', slug: 'penetration-testing', category: 'Cybersecurity & Auditing' },
    { name: 'Solidity', slug: 'solidity', category: 'Blockchain & Web3' },
    { name: 'Web3.js', slug: 'web3js', category: 'Blockchain & Web3' },
    { name: 'SEO Optimization', slug: 'seo-optimization', category: 'Digital Marketing & SEO' },
    { name: 'Google Ads', slug: 'google-ads', category: 'Digital Marketing & SEO' },
    { name: 'Content Marketing', slug: 'content-marketing', category: 'Digital Marketing & SEO' },
    { name: 'Technical Writing', slug: 'technical-writing', category: 'Content & Technical Writing' },
    { name: 'API Documentation', slug: 'api-documentation', category: 'Content & Technical Writing' },
    { name: 'Adobe Illustrator', slug: 'adobe-illustrator', category: 'Graphic Design & Branding' },
    { name: 'Photoshop', slug: 'photoshop', category: 'Graphic Design & Branding' },
    { name: 'Premiere Pro', slug: 'premiere-pro', category: 'Video Editing & Motion Graphics' },
    { name: 'After Effects', slug: 'after-effects', category: 'Video Editing & Motion Graphics' },
    { name: 'Cypress Testing', slug: 'cypress', category: 'QA & Test Automation' },
    { name: 'Playwright', slug: 'playwright', category: 'QA & Test Automation' },
    { name: 'Shopify Development', slug: 'shopify', category: 'E-Commerce Solutions' },
    { name: 'Stripe Integration', slug: 'stripe-integration', category: 'E-Commerce Solutions' },
    { name: 'Socket.IO', slug: 'socket-io', category: 'Web Development' },
    { name: 'Redis', slug: 'redis', category: 'Backend & Cloud DevOps' },
  ];

  const skillMap = {};
  for (const sk of skillsData) {
    const created = await prisma.skill.upsert({
      where: { slug: sk.slug },
      update: {},
      create: {
        name: sk.name,
        slug: sk.slug,
        categoryId: categoryMap[sk.category] || null,
      },
    });
    skillMap[sk.name] = created.id;
  }
  console.log(`✅ Seeded ${skillsData.length} skills`);

  // 3. Admin Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@market.io' },
    update: {},
    create: {
      email: 'admin@market.io',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      location: 'San Francisco, CA',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: {},
    create: {
      email: 'admin@marketplace.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      location: 'San Francisco, CA',
    },
  });
  console.log(`✅ Seeded Admin Users: admin@market.io & admin@marketplace.com`);

  // 4. Clients (10)
  const clientDataList = [
    { firstName: 'Demo', lastName: 'Client', email: 'client1@marketplace.com', company: 'Marketplace Enterprise', industry: 'Technology', country: 'United States', desc: 'Enterprise client account.' },
    { firstName: 'Sarah', lastName: 'Connor', email: 'sarah.c@cyberdyne.io', company: 'Cyberdyne Innovations', industry: 'Robotics & AI', country: 'United States', desc: 'Pioneering autonomous systems and cloud infrastructure.' },
    { firstName: 'Marcus', lastName: 'Vance', email: 'marcus@vancemedia.com', company: 'Vance Media Group', industry: 'Publishing & Media', country: 'United Kingdom', desc: 'Digital media agency specializing in video and interactive publications.' },
    { firstName: 'Elena', lastName: 'Rostova', email: 'elena@biomedix.org', company: 'BioMedix Health', industry: 'Healthcare & Life Sciences', country: 'Canada', desc: 'Next-generation patient tracking and healthcare portal platforms.' },
    { firstName: 'Kenji', lastName: 'Sato', email: 'kenji@sakurafin.jp', company: 'Sakura Fintech Holdings', industry: 'Financial Services', country: 'Japan', desc: 'Modern cross-border banking apps and algorithmic risk analytics.' },
    { firstName: 'David', lastName: 'Kim', email: 'david@solarenergy.kr', company: 'NextGen Solar Tech', industry: 'Renewable Energy', country: 'South Korea', desc: 'IoT monitoring and clean energy distribution grids.' },
    { firstName: 'Amara', lastName: 'Diallo', email: 'amara@safarihub.ke', company: 'SafariHub Logistics', industry: 'Supply Chain', country: 'Kenya', desc: 'Real-time fleet tracking and automated customs broker workflows.' },
    { firstName: 'Liam', lastName: 'O\'Connor', email: 'liam@celticlms.ie', company: 'Celtic Learning Systems', industry: 'EdTech', country: 'Ireland', desc: 'Adaptive learning portals for colleges and corporate compliance.' },
    { firstName: 'Sophia', lastName: 'Mueller', email: 'sophia@urbanmobility.de', company: 'Urban Mobility GmbH', industry: 'Automotive & IoT', country: 'Germany', desc: 'Smart city scooter fleets and multimodal transport integrations.' },
    { firstName: 'Carlos', lastName: 'Mendoza', email: 'carlos@mercadoexpress.mx', company: 'Mercado Express', industry: 'Retail & E-Commerce', country: 'Mexico', desc: 'Direct-to-consumer commerce with automated fulfillment pipelines.' },
    { firstName: 'Rachel', lastName: 'Adams', email: 'rachel@primecrm.com', company: 'Prime CRM Technologies', industry: 'Enterprise SaaS', country: 'United States', desc: 'Scalable CRM solutions for enterprise sales pipelines.' },
  ];

  const clientProfiles = [];
  for (const c of clientDataList) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        role: 'CLIENT',
        isVerified: true,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?w=150`,
        location: c.country,
        clientProfile: {
          create: {
            companyName: c.company,
            industry: c.industry,
            country: c.country,
            description: c.desc,
            totalSpent: 0,
            rating: 4.85,
            reviewCount: 4,
          },
        },
      },
      include: { clientProfile: true },
    });
    clientProfiles.push(u.clientProfile);
  }
  console.log(`✅ Seeded ${clientProfiles.length} Clients with profiles`);

  // 5. Freelancers (20)
  const freelancerDataList = [
    { firstName: 'Demo', lastName: 'Freelancer', email: 'freelancer1@marketplace.com', title: 'Full Stack Web & Realtime Engineer', rate: 90, exp: 6, level: 'EXPERT', country: 'United States', skills: ['React', 'Node.js', 'PostgreSQL', 'Socket.IO'], bio: 'Full stack development and real-time collaboration specialist.' },
    { firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@freelance.io', title: 'Senior Full Stack React & Node Architect', rate: 95, exp: 8, level: 'EXPERT', country: 'United States', skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'], bio: 'Specialized in ultra-responsive SaaS platforms and high-throughput microservices.' },
    { firstName: 'Maya', lastName: 'Patel', email: 'maya.patel@freelance.io', title: 'Lead UI/UX Product Designer & Design Systems', rate: 85, exp: 6, level: 'EXPERT', country: 'India', skills: ['Figma', 'UI/UX Design', 'Wireframing', 'User Research'], bio: 'Crafting aesthetic, high-conversion interfaces and comprehensive design systems.' },
    { firstName: 'Lukas', lastName: 'Novak', email: 'lukas.novak@freelance.io', title: 'AI & Machine Learning Engineer | LLM Specialist', rate: 120, exp: 7, level: 'EXPERT', country: 'Czech Republic', skills: ['Python', 'OpenAI API', 'PyTorch', 'LangChain', 'PostgreSQL'], bio: 'Building custom generative AI workflows, RAG agents, and fine-tuned embeddings.' },
    { firstName: 'Chloe', lastName: 'Dubois', email: 'chloe.dubois@freelance.io', title: 'Mobile App Developer (React Native & Swift)', rate: 80, exp: 5, level: 'INTERMEDIATE', country: 'France', skills: ['React Native', 'Swift', 'JavaScript', 'REST API'], bio: 'Native and cross-platform mobile experiences for fintech and consumer apps.' },
    { firstName: 'Devon', lastName: 'Brooks', email: 'devon.brooks@freelance.io', title: 'DevOps & Cloud Infrastructure Architect', rate: 110, exp: 9, level: 'EXPERT', country: 'United States', skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD Pipelines', 'Redis'], bio: 'Automating zero-downtime deployments and containerized multi-region clusters.' },
    { firstName: 'Ananya', lastName: 'Iyer', email: 'ananya.iyer@freelance.io', title: 'Next.js & Full-Stack TypeScript Specialist', rate: 75, exp: 4, level: 'INTERMEDIATE', country: 'India', skills: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'GraphQL'], bio: 'Blazing fast server-rendered web applications with modern styling.' },
    { firstName: 'Mateo', lastName: 'Silva', email: 'mateo.silva@freelance.io', title: 'Senior Backend Engineer (Node.js & PostgreSQL)', rate: 70, exp: 6, level: 'INTERMEDIATE', country: 'Brazil', skills: ['Node.js', 'PostgreSQL', 'Express.js', 'Redis', 'Socket.IO'], bio: 'Robust database architecture, indexing, and real-time event streaming.' },
    { firstName: 'Emily', lastName: 'Zhang', email: 'emily.zhang@freelance.io', title: 'E-Commerce Architect & Payment Specialist', rate: 90, exp: 7, level: 'EXPERT', country: 'Canada', skills: ['Shopify Development', 'Stripe Integration', 'React', 'Node.js'], bio: 'Scalable checkout flows, payment gateway integrations, and subscription billing.' },
    { firstName: 'Tariq', lastName: 'Mansoor', email: 'tariq.mansoor@freelance.io', title: 'QA Automation Engineer & Cypress Expert', rate: 65, exp: 5, level: 'INTERMEDIATE', country: 'UAE', skills: ['Cypress Testing', 'Playwright', 'JavaScript', 'CI/CD Pipelines'], bio: 'Comprehensive end-to-end testing, integration tests, and performance benchmarks.' },
    { firstName: 'Hannah', lastName: 'Schmidt', email: 'hannah.schmidt@freelance.io', title: 'Data Engineer & ETL Pipeline Specialist', rate: 105, exp: 7, level: 'EXPERT', country: 'Germany', skills: ['Data Visualization', 'Snowflake', 'Apache Kafka', 'Python', 'PostgreSQL'], bio: 'Designing resilient data lakes, real-time analytics dashboards, and warehouse models.' },
    { firstName: 'Gabriel', lastName: 'Santos', email: 'gabriel.santos@freelance.io', title: 'Flutter Cross-Platform Mobile Engineer', rate: 70, exp: 4, level: 'INTERMEDIATE', country: 'Portugal', skills: ['Flutter', 'REST API', 'JavaScript'], bio: 'Clean architecture Flutter apps published across Google Play and iOS App Store.' },
    { firstName: 'Nadia', lastName: 'Petrova', email: 'nadia.petrova@freelance.io', title: 'Technical Writer & API Documentation Lead', rate: 60, exp: 5, level: 'INTERMEDIATE', country: 'Poland', skills: ['Technical Writing', 'API Documentation', 'JavaScript'], bio: 'Creating developer documentation, interactive OpenAPI specs, and tutorials.' },
    { firstName: 'Zackary', lastName: 'Cole', email: 'zack.cole@freelance.io', title: 'Cybersecurity Auditor & Ethical Hacker', rate: 130, exp: 8, level: 'EXPERT', country: 'United States', skills: ['Cybersecurity Auditing', 'Penetration Testing', 'Python'], bio: 'Security compliance, threat modeling, smart contract analysis, and OWASP mitigation.' },
    { firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@freelance.io', title: 'Motion Designer & Video Specialist', rate: 75, exp: 6, level: 'INTERMEDIATE', country: 'Japan', skills: ['After Effects', 'Premiere Pro', 'Photoshop'], bio: 'Visual storytelling, UI micro-interactions, and 3D product animation.' },
    { firstName: 'Aria', lastName: 'Montgomery', email: 'aria.m@freelance.io', title: 'Brand Identity & Graphic Design Consultant', rate: 70, exp: 5, level: 'INTERMEDIATE', country: 'Australia', skills: ['Adobe Illustrator', 'Photoshop', 'Figma'], bio: 'Distinctive brand identities, packaging, typography, and marketing assets.' },
    { firstName: 'Omar', lastName: 'Farooq', email: 'omar.farooq@freelance.io', title: 'Full Stack Web & Realtime WebSockets Engineer', rate: 85, exp: 6, level: 'INTERMEDIATE', country: 'Egypt', skills: ['React', 'Node.js', 'Socket.IO', 'Express.js', 'PostgreSQL'], bio: 'Interactive real-time collaboration tools, whiteboards, and instant chat engines.' },
    { firstName: 'Camila', lastName: 'Reyes', email: 'camila.reyes@freelance.io', title: 'SEO & Growth Marketing Strategist', rate: 65, exp: 5, level: 'INTERMEDIATE', country: 'Spain', skills: ['SEO Optimization', 'Google Ads', 'Content Marketing'], bio: 'Technical SEO audits, keyword ranking growth, and search visibility campaigns.' },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@freelance.io', title: 'Django & Python Web Developer', rate: 80, exp: 6, level: 'INTERMEDIATE', country: 'United Kingdom', skills: ['Python', 'Django', 'PostgreSQL', 'Docker'], bio: 'Scalable backends with Django REST Framework and asynchronous Celery workers.' },
    { firstName: 'Leila', lastName: 'Khoury', email: 'leila.khoury@freelance.io', title: 'Vue.js & Nuxt Frontend Specialist', rate: 75, exp: 4, level: 'INTERMEDIATE', country: 'Lebanon', skills: ['Vue.js', 'JavaScript', 'Tailwind CSS', 'REST API'], bio: 'Modern lightweight SPAs and SSR portals with seamless animations.' },
    { firstName: 'Vikram', lastName: 'Chopra', email: 'vikram.chopra@freelance.io', title: 'Blockchain & Smart Contract Developer', rate: 125, exp: 7, level: 'EXPERT', country: 'India', skills: ['Solidity', 'Web3.js', 'Node.js', 'React'], bio: 'Audited smart contracts, ERC token standards, and Web3 dApps.' },
  ];

  const freelancerProfiles = [];
  for (const f of freelancerDataList) {
    const u = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        email: f.email,
        passwordHash,
        firstName: f.firstName,
        lastName: f.lastName,
        role: 'FREELANCER',
        isVerified: Math.random() > 0.3, // Most verified, some pending verification for admin view
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?w=150`,
        location: f.country,
        freelancerProfile: {
          create: {
            title: f.title,
            bio: f.bio,
            hourlyRate: f.rate,
            experienceYears: f.exp,
            experienceLevel: f.level,
            country: f.country,
            totalEarned: 0,
            rating: 4.9,
            reviewCount: 5,
            isAvailable: true,
          },
        },
      },
      include: { freelancerProfile: true },
    });

    // Attach skills
    for (const skillName of f.skills) {
      if (skillMap[skillName]) {
        await prisma.freelancerSkill.upsert({
          where: {
            freelancerProfileId_skillId: {
              freelancerProfileId: u.freelancerProfile.id,
              skillId: skillMap[skillName],
            },
          },
          update: {},
          create: {
            freelancerProfileId: u.freelancerProfile.id,
            skillId: skillMap[skillName],
            proficiency: 'Expert',
          },
        });
      }
    }
    freelancerProfiles.push(u.freelancerProfile);
  }
  console.log(`✅ Seeded ${freelancerProfiles.length} Freelancers with skills & profiles`);

  // 6. Realistic Projects (30+)
  const projectsList = [
    { title: 'E-Commerce Clothing Store with Stripe Checkout', cat: 'E-Commerce Solutions', budget: 4500, status: 'PUBLISHED', desc: 'Modern responsive apparel storefront with cart, Stripe payment intent, and inventory manager.' },
    { title: 'Food Delivery Multi-Vendor Mobile App', cat: 'Mobile App Development', budget: 7500, status: 'IN_PROGRESS', desc: 'React Native customer and driver app with real-time GPS location tracking and push alerts.' },
    { title: 'AI-Powered Customer Support Chatbot Agent', cat: 'AI & Machine Learning', budget: 5200, status: 'COMPLETED', desc: 'RAG system integrated with OpenAI embeddings to answer customer queries with 95% accuracy.' },
    { title: 'College Student Information Management System', cat: 'Web Development', budget: 3800, status: 'COMPLETED', desc: 'Academic portal for course registration, grading, attendance tracking, and fee records.' },
    { title: 'Mobile Banking & Micro-Loan Application', cat: 'Mobile App Development', budget: 9000, status: 'IN_PROGRESS', desc: 'Secure biometric login, account ledger, peer-to-peer transfers, and credit evaluation.' },
    { title: 'Interactive Portfolio Website for Creative Studio', cat: 'UI/UX Design', budget: 2200, status: 'COMPLETED', desc: 'High-end aesthetic portfolio featuring smooth GSAP page transitions and WebGL visuals.' },
    { title: 'Enterprise CRM & Sales Pipeline Dashboard', cat: 'Web Development', budget: 6800, status: 'PUBLISHED', desc: 'Full-featured CRM with deal kanban stages, automated follow-up emails, and analytics.' },
    { title: 'Real-Time IoT Warehouse Inventory Tracking', cat: 'Backend & Cloud DevOps', budget: 8500, status: 'IN_PROGRESS', desc: 'MQTT broker pipeline feeding PostgreSQL for RFID warehouse inventory reconciliation.' },
    { title: 'Healthcare Doctor Appointment Booking System', cat: 'Web Development', budget: 4200, status: 'COMPLETED', desc: 'Telehealth scheduling platform with calendar sync, SMS reminders, and prescription history.' },
    { title: 'Interactive Learning Management System (LMS)', cat: 'Web Development', budget: 6000, status: 'PUBLISHED', desc: 'Video course hosting, student progress dashboards, interactive quizzes, and certificates.' },
    { title: 'Smart Contract Staking Protocol & Audit', cat: 'Blockchain & Web3', budget: 9500, status: 'COMPLETED', desc: 'Solidity staking pool with automated reward calculations and formal security audit report.' },
    { title: 'High-Throughput ETL Analytics Data Pipeline', cat: 'Data Engineering & Analytics', budget: 7000, status: 'PUBLISHED', desc: 'Apache Kafka to Snowflake pipeline processing over 2 million events per hour.' },
    { title: 'Penetration Testing & Security Compliance Audit', cat: 'Cybersecurity & Auditing', budget: 3500, status: 'COMPLETED', desc: 'Comprehensive blackbox and greybox penetration testing for SOC2 certification readiness.' },
    { title: 'Automated E2E Test Suite with Cypress & CI/CD', cat: 'QA & Test Automation', budget: 3000, status: 'COMPLETED', desc: '100% test coverage for critical user journeys embedded in GitHub Actions workflows.' },
    { title: 'Global SEO Growth & Content Strategy', cat: 'Digital Marketing & SEO', budget: 2500, status: 'PUBLISHED', desc: 'Technical SEO cleanup, keyword gap research, and targeted landing page copywriting.' },
    { title: 'Developer API Documentation & Developer Portal', cat: 'Content & Technical Writing', budget: 2800, status: 'COMPLETED', desc: 'OpenAPI 3.0 documentation, interactive code examples in 4 languages, and guides.' },
    { title: 'Brand Identity, Logo & Design Guidelines', cat: 'Graphic Design & Branding', budget: 1800, status: 'COMPLETED', desc: 'Complete brand guide, vector logomarks, typography palette, and marketing collateral.' },
    { title: 'Product Launch 3D Motion Explainer Video', cat: 'Video Editing & Motion Graphics', budget: 3200, status: 'PUBLISHED', desc: '60-second high-energy 3D product motion video highlighting SaaS features.' },
    { title: 'Shopify Plus Custom Storefront Theme', cat: 'E-Commerce Solutions', budget: 4000, status: 'IN_PROGRESS', desc: 'Bespoke Liquid and React headless theme with sub-second page load times.' },
    { title: 'Real-Time Multi-User Collaboration Whiteboard', cat: 'Web Development', budget: 5500, status: 'PUBLISHED', desc: 'Canvas-based diagramming tool with WebSockets syncing cursors and live drawing.' },
    { title: 'Fleet Telematics & Route Optimization System', cat: 'Mobile App Development', budget: 8200, status: 'IN_PROGRESS', desc: 'Driver GPS route optimization minimizing fuel consumption across 500 delivery trucks.' },
    { title: 'Cryptocurrency Portfolio Tracker Mobile App', cat: 'Mobile App Development', budget: 4800, status: 'PUBLISHED', desc: 'Live price feeds from Binance and CoinGecko with automated P&L alerts.' },
    { title: 'HR Employee Onboarding & Payroll Portal', cat: 'Web Development', budget: 5100, status: 'COMPLETED', desc: 'Document signing, benefits selection, and monthly automated payroll reports.' },
    { title: 'Microservices Migration & Kubernetes Cluster Setup', cat: 'Backend & Cloud DevOps', budget: 9800, status: 'COMPLETED', desc: 'Decomposing legacy monolith into Go/Node microservices orchestrated on AWS EKS.' },
    { title: 'Generative AI Document Summarizer Tool', cat: 'AI & Machine Learning', budget: 4600, status: 'PUBLISHED', desc: 'Upload 100-page PDF financial reports and receive executive summaries with citations.' },
    { title: 'Social Media Management & Scheduling Engine', cat: 'Web Development', budget: 4900, status: 'PUBLISHED', desc: 'OAuth integrations for LinkedIn, Twitter, and Instagram with scheduled publishing.' },
    { title: 'Event Ticketing & QR Code Scanning Portal', cat: 'Mobile App Development', budget: 3700, status: 'DRAFT', desc: 'Organizers scan tickets offline with automated sync to PostgreSQL.' },
    { title: 'Real Estate Property Virtual Tour Platform', cat: 'Web Development', budget: 6200, status: 'DRAFT', desc: 'Interactive 360-degree panoramic room navigation with embedded floor plans.' },
    { title: 'SaaS Subscription Billing & Analytics Engine', cat: 'E-Commerce Solutions', budget: 5300, status: 'DISPUTED', desc: 'Multi-tiered subscription billing with proration, churn reporting, and webhooks.' },
    { title: 'Cross-Border B2B Escrow Payment Gateway', cat: 'Blockchain & Web3', budget: 11000, status: 'CANCELLED', desc: 'Multi-signature smart contract escrow release upon bill of lading approval.' },
  ];

  const createdProjects = [];
  for (let i = 0; i < projectsList.length; i++) {
    const p = projectsList[i];
    const client = clientProfiles[i % clientProfiles.length];
    const catId = categoryMap[p.cat] || Object.values(categoryMap)[0];

    const proj = await prisma.project.create({
      data: {
        clientId: client.id,
        categoryId: catId,
        title: p.title,
        description: p.desc,
        requirements: 'Demonstrated experience in production-grade architecture, unit tests, and clean code.',
        budget: p.budget,
        minBudget: p.budget * 0.9,
        maxBudget: p.budget * 1.15,
        budgetType: 'FIXED',
        status: p.status,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (14 + i * 3)),
        proposalCount: 3,
        milestones: {
          create: [
            {
              title: 'Architecture Planning & UI Prototype',
              description: 'System specifications, database schema design, and Figma prototype approval.',
              amount: p.budget * 0.3,
              order: 1,
              status: p.status === 'COMPLETED' ? 'COMPLETED' : p.status === 'IN_PROGRESS' ? 'APPROVED' : 'PENDING',
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            },
            {
              title: 'Core Feature Implementation & API Integrations',
              description: 'Backend services, database migrations, authentication, and core workflow components.',
              amount: p.budget * 0.4,
              order: 2,
              status: p.status === 'COMPLETED' ? 'COMPLETED' : p.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING',
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
            },
            {
              title: 'Final Testing, Polishing & Production Deployment',
              description: 'Comprehensive test coverage, performance audits, bug resolution, and live deployment.',
              amount: p.budget * 0.3,
              order: 3,
              status: p.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
              dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            },
          ],
        },
      },
      include: { milestones: true },
    });
    createdProjects.push(proj);
  }
  console.log(`✅ Seeded ${createdProjects.length} Projects with Milestones`);

  // 7. Proposals, Contracts, Invoices & Payments for completed/active projects
  for (let i = 0; i < createdProjects.length; i++) {
    const proj = createdProjects[i];
    const freelancer = freelancerProfiles[i % freelancerProfiles.length];

    // Create a proposal
    const proposal = await prisma.proposal.create({
      data: {
        projectId: proj.id,
        freelancerProfileId: freelancer.id,
        coverLetter: `Hello! I have extensive experience in this domain. I have reviewed your project requirements for "${proj.title}" and can deliver this with production excellence.`,
        bidAmount: proj.budget,
        estimatedDuration: '4 weeks',
        status: proj.status === 'COMPLETED' || proj.status === 'IN_PROGRESS' ? 'ACCEPTED' : 'PENDING',
      },
    });

    if (proj.status === 'COMPLETED' || proj.status === 'IN_PROGRESS' || proj.status === 'DISPUTED') {
      const contract = await prisma.contract.create({
        data: {
          projectId: proj.id,
          proposalId: proposal.id,
          clientId: proj.clientId,
          freelancerProfileId: freelancer.id,
          status: proj.status === 'COMPLETED' ? 'COMPLETED' : proj.status === 'DISPUTED' ? 'DISPUTED' : 'ACTIVE',
          totalAmount: proj.budget,
          terms: 'Standard IP assignment and NDA terms apply upon milestone release.',
          startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
          endDate: proj.status === 'COMPLETED' ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) : null,
        },
      });

      // Update milestones with contractId
      await prisma.milestone.updateMany({
        where: { projectId: proj.id },
        data: { contractId: contract.id },
      });

      // Generate invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${i + 1}`,
          clientId: proj.clientId,
          freelancerProfileId: freelancer.id,
          projectId: proj.id,
          contractId: contract.id,
          subtotal: proj.budget,
          tax: 0,
          total: proj.budget,
          status: proj.status === 'COMPLETED' ? 'PAID' : 'ISSUED',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
          paidAt: proj.status === 'COMPLETED' ? new Date() : null,
        },
      });

      // If completed, record payment & reviews
      if (proj.status === 'COMPLETED') {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            contractId: contract.id,
            amount: proj.budget,
            currency: 'USD',
            provider: 'MOCK',
            transactionId: `tx_mock_${Date.now()}_${i}`,
            status: 'SUCCESS',
          },
        });

        // Review from Client to Freelancer
        const clientUser = await prisma.clientProfile.findUnique({ where: { id: proj.clientId } });
        const freelancerUser = await prisma.freelancerProfile.findUnique({ where: { id: freelancer.id } });

        await prisma.review.create({
          data: {
            contractId: contract.id,
            authorId: clientUser.userId,
            recipientId: freelancerUser.userId,
            rating: 5,
            comment: 'Exceptional communication, clean architecture, and timely delivery. Highly recommended!',
          },
        });

        // Review from Freelancer to Client
        await prisma.review.create({
          data: {
            contractId: contract.id,
            authorId: freelancerUser.userId,
            recipientId: clientUser.userId,
            rating: 5,
            comment: 'Clear specifications, fast milestone approvals, and wonderful client to work with.',
          },
        });
      }

      // If disputed, create dispute entry
      if (proj.status === 'DISPUTED') {
        const clientUser = await prisma.clientProfile.findUnique({ where: { id: proj.clientId } });
        await prisma.dispute.create({
          data: {
            contractId: contract.id,
            initiatorId: clientUser.userId,
            reason: 'Milestone deliverable does not match initial acceptance criteria',
            description: 'The API integration has missing webhook support and delayed response times.',
            status: 'OPEN',
          },
        });
      }
    }
  }
  console.log('✅ Seeded Proposals, Contracts, Invoices, Payments, Reviews & Disputes');

  // 8. Notifications
  const firstClient = clientProfiles[0];
  const firstClientUser = await prisma.clientProfile.findUnique({ where: { id: firstClient.id } });
  await prisma.notification.createMany({
    data: [
      {
        userId: firstClientUser.userId,
        title: 'New Proposal Received',
        message: 'Alex Rivera submitted a proposal for "E-Commerce Clothing Store with Stripe Checkout".',
        type: 'PROPOSAL',
      },
      {
        userId: firstClientUser.userId,
        title: 'Milestone Ready for Review',
        message: 'Milestone "Architecture Planning & UI Prototype" has been submitted for your review.',
        type: 'MILESTONE',
      },
      {
        userId: firstClientUser.userId,
        title: 'Payment Processed',
        message: 'Invoice payment of $4,500.00 was successfully settled.',
        type: 'PAYMENT',
      },
    ],
  });

  // 9. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: adminUser.id,
      details: JSON.stringify({ message: 'System database initialized and seeded with demo dataset.' }),
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  });
  console.log('✅ Seeded Notifications and initial AuditLog');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
