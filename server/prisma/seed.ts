import { PrismaClient, UserRole, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Freelancer Marketplace...');

  // 1. Clean existing data in reverse order
  console.log('🧹 Cleaning up database tables...');
  await prisma.auditLog.deleteMany();
  await prisma.file.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.projectSkill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.freelancerSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.category.deleteMany();
  await prisma.freelancerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  // Password hash for all seeded users: "Password123!"
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Seed Admin User
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@freelancermarket.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      isVerified: true,
      phoneNumber: '+1234567890',
    },
  });

  // 3. Seed Client Users & Profiles
  console.log('🏢 Creating sample clients...');
  const clientUser1 = await prisma.user.create({
    data: {
      email: 'alex.rivers@techcorp.io',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Rivers',
      role: UserRole.CLIENT,
      isVerified: true,
      phoneNumber: '+1987654321',
      clientProfile: {
        create: {
          companyName: 'TechCorp Solutions',
          companyWebsite: 'https://techcorp.io',
          description: 'Fast-growing SaaS startup specializing in B2B enterprise automation.',
          country: 'United States',
          totalSpent: 12500.0,
          rating: 4.9,
          reviewCount: 14,
        },
      },
    },
    include: { clientProfile: true },
  });

  const clientUser2 = await prisma.user.create({
    data: {
      email: 'sarah.chen@innovatestudio.co',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: UserRole.CLIENT,
      isVerified: true,
      phoneNumber: '+1555444333',
      clientProfile: {
        create: {
          companyName: 'Innovate Design Studio',
          companyWebsite: 'https://innovatestudio.co',
          description: 'Boutique digital product studio building fintech and consumer apps.',
          country: 'Canada',
          totalSpent: 4500.0,
          rating: 4.8,
          reviewCount: 6,
        },
      },
    },
    include: { clientProfile: true },
  });

  // 4. Seed Freelancer Users & Profiles
  console.log('💼 Creating sample freelancers...');
  const freelancerUser1 = await prisma.user.create({
    data: {
      email: 'marcus.vance@devpro.com',
      passwordHash,
      firstName: 'Marcus',
      lastName: 'Vance',
      role: UserRole.FREELANCER,
      isVerified: true,
      phoneNumber: '+442079460991',
      freelancerProfile: {
        create: {
          title: 'Senior Full-Stack Engineer & Cloud Architect',
          bio: '8+ years building enterprise web apps, microservices, and high-load real-time platforms with React, Node.js, and PostgreSQL.',
          hourlyRate: 85.0,
          experienceYears: 8,
          country: 'United Kingdom',
          totalEarned: 48000.0,
          rating: 4.95,
          reviewCount: 32,
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  const freelancerUser2 = await prisma.user.create({
    data: {
      email: 'elena.rostova@designcraft.io',
      passwordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      role: UserRole.FREELANCER,
      isVerified: true,
      phoneNumber: '+49301234567',
      freelancerProfile: {
        create: {
          title: 'Lead UI/UX Product Designer & Design Systems Expert',
          bio: 'Specialized in Figma component architecture, user journey mapping, and conversion-optimized mobile & web interfaces.',
          hourlyRate: 70.0,
          experienceYears: 6,
          country: 'Germany',
          totalEarned: 29500.0,
          rating: 4.9,
          reviewCount: 21,
          isAvailable: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  // 5. Seed Categories
  console.log('📂 Creating categories...');
  const catWeb = await prisma.category.create({
    data: {
      name: 'Web & Full Stack Development',
      slug: 'web-development',
      description: 'Custom web apps, responsive frontend, API backends, and full-stack solutions.',
    },
  });

  const catMobile = await prisma.category.create({
    data: {
      name: 'Mobile App Development',
      slug: 'mobile-development',
      description: 'Native and cross-platform apps for iOS and Android using Flutter & React Native.',
    },
  });

  const catDesign = await prisma.category.create({
    data: {
      name: 'UI/UX & Product Design',
      slug: 'ui-ux-design',
      description: 'Wireframing, prototypes, UX research, and design system creation.',
    },
  });

  const catDevops = await prisma.category.create({
    data: {
      name: 'DevOps & Cloud Architecture',
      slug: 'devops-cloud',
      description: 'CI/CD pipelines, Kubernetes, Docker, AWS, and GCP infrastructure.',
    },
  });

  // 6. Seed Skills
  console.log('🛠️ Creating skills...');
  const skillsData = [
    { name: 'React', slug: 'react', categoryId: catWeb.id },
    { name: 'TypeScript', slug: 'typescript', categoryId: catWeb.id },
    { name: 'Node.js', slug: 'nodejs', categoryId: catWeb.id },
    { name: 'PostgreSQL', slug: 'postgresql', categoryId: catWeb.id },
    { name: 'Prisma ORM', slug: 'prisma-orm', categoryId: catWeb.id },
    { name: 'Next.js', slug: 'nextjs', categoryId: catWeb.id },
    { name: 'Tailwind CSS', slug: 'tailwind-css', categoryId: catWeb.id },
    { name: 'Figma', slug: 'figma', categoryId: catDesign.id },
    { name: 'UI/UX Prototyping', slug: 'ui-ux-prototyping', categoryId: catDesign.id },
    { name: 'Docker', slug: 'docker', categoryId: catDevops.id },
    { name: 'Flutter', slug: 'flutter', categoryId: catMobile.id },
  ];

  const createdSkills: Record<string, string> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.create({ data: s });
    createdSkills[s.slug] = skill.id;
  }

  // 7. Associate Freelancer Skills
  if (freelancerUser1.freelancerProfile) {
    await prisma.freelancerSkill.createMany({
      data: [
        {
          freelancerProfileId: freelancerUser1.freelancerProfile.id,
          skillId: createdSkills['react'],
          proficiency: 'Expert',
        },
        {
          freelancerProfileId: freelancerUser1.freelancerProfile.id,
          skillId: createdSkills['typescript'],
          proficiency: 'Expert',
        },
        {
          freelancerProfileId: freelancerUser1.freelancerProfile.id,
          skillId: createdSkills['nodejs'],
          proficiency: 'Expert',
        },
        {
          freelancerProfileId: freelancerUser1.freelancerProfile.id,
          skillId: createdSkills['postgresql'],
          proficiency: 'Expert',
        },
        {
          freelancerProfileId: freelancerUser1.freelancerProfile.id,
          skillId: createdSkills['docker'],
          proficiency: 'Intermediate',
        },
      ],
    });
  }

  if (freelancerUser2.freelancerProfile) {
    await prisma.freelancerSkill.createMany({
      data: [
        {
          freelancerProfileId: freelancerUser2.freelancerProfile.id,
          skillId: createdSkills['figma'],
          proficiency: 'Expert',
        },
        {
          freelancerProfileId: freelancerUser2.freelancerProfile.id,
          skillId: createdSkills['ui-ux-prototyping'],
          proficiency: 'Expert',
        },
        {
          freelancerProfileId: freelancerUser2.freelancerProfile.id,
          skillId: createdSkills['tailwind-css'],
          proficiency: 'Intermediate',
        },
      ],
    });
  }

  // 8. Seed Sample Projects
  console.log('📌 Creating sample projects...');
  if (clientUser1.clientProfile) {
    const project1 = await prisma.project.create({
      data: {
        clientId: clientUser1.clientProfile.id,
        categoryId: catWeb.id,
        title: 'Full-Stack Multi-Tenant SaaS Dashboard with Real-Time Analytics',
        description:
          'We need an experienced full-stack engineer to build a high-performance analytics dashboard with React, Node.js, and PostgreSQL. Must support multi-tenant role isolation and exportable reporting.',
        budget: 4500.0,
        budgetType: 'FIXED',
        status: ProjectStatus.PUBLISHED,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        skills: {
          create: [
            { skillId: createdSkills['react'] },
            { skillId: createdSkills['typescript'] },
            { skillId: createdSkills['nodejs'] },
            { skillId: createdSkills['postgresql'] },
          ],
        },
        milestones: {
          create: [
            {
              title: 'Milestone 1: Database Schema & Authentication API',
              description: 'Prisma migrations, RBAC auth endpoints, and user management.',
              amount: 1500.0,
            },
            {
              title: 'Milestone 2: Analytics Aggregation Engine & Charts',
              description: 'Timeseries queries and React chart dashboards.',
              amount: 2000.0,
            },
            {
              title: 'Milestone 3: Deployment, CI/CD & Final Testing',
              description: 'Dockerization, staging rollout, and documentation.',
              amount: 1000.0,
            },
          ],
        },
      },
    });

    console.log(`Created sample project 1: "${project1.title}"`);
  }

  if (clientUser2.clientProfile) {
    const project2 = await prisma.project.create({
      data: {
        clientId: clientUser2.clientProfile.id,
        categoryId: catDesign.id,
        title: 'Design System & Mobile App UI Kit in Figma',
        description:
          'Looking for a UI/UX expert to create an atomic design system with over 60+ responsive mobile components and dark/light token variables in Figma.',
        budget: 2200.0,
        budgetType: 'FIXED',
        status: ProjectStatus.PUBLISHED,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        skills: {
          create: [
            { skillId: createdSkills['figma'] },
            { skillId: createdSkills['ui-ux-prototyping'] },
          ],
        },
        milestones: {
          create: [
            {
              title: 'Phase 1: Design Tokens & Component Library',
              description: 'Colors, typography, buttons, inputs, cards.',
              amount: 1200.0,
            },
            {
              title: 'Phase 2: Screen Flows & Interactive Prototype',
              description: '20+ core user flow screens in high fidelity.',
              amount: 1000.0,
            },
          ],
        },
      },
    });

    console.log(`Created sample project 2: "${project2.title}"`);
  }

  console.log('✅ Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Sample Users Credentials (Password for all: Password123!):');
  console.log('• Admin:       admin@freelancermarket.com');
  console.log('• Client 1:    alex.rivers@techcorp.io');
  console.log('• Client 2:    sarah.chen@innovatestudio.co');
  console.log('• Freelancer 1: marcus.vance@devpro.com');
  console.log('• Freelancer 2: elena.rostova@designcraft.io');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
