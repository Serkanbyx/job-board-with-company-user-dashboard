import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';

dotenv.config();

const ADMIN_ONLY = process.argv.includes('--admin-only');

/* ------------------------------------------------------------------ */
/*  ADMIN CONFIG                                                       */
/* ------------------------------------------------------------------ */

const getAdminConfig = () => ({
  firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
  lastName: process.env.ADMIN_LAST_NAME || 'User',
  email: process.env.ADMIN_EMAIL || 'admin@jobboard.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  role: 'admin',
});

/* ------------------------------------------------------------------ */
/*  DEMO DATA                                                          */
/* ------------------------------------------------------------------ */

const companyUsers = [
  {
    firstName: 'Tech',
    lastName: 'Nova',
    email: 'technova@jobboard.com',
    password: 'Demo123!',
    role: 'company',
    phone: '+90 212 555 0101',
    location: 'Istanbul, Turkey',
    companyName: 'TechNova Solutions',
    companyWebsite: 'https://technova.dev',
    companyLocation: 'Istanbul, Turkey',
    companySize: '51-200',
    companyAbout:
      'TechNova Solutions is a full-stack development agency specializing in scalable web and mobile applications. We partner with startups and enterprises to turn bold ideas into production-ready products using cutting-edge technologies.',
    companyIndustry: 'technology',
    companyFounded: 2018,
    companySocials: { linkedin: 'https://linkedin.com/company/technova', twitter: 'https://twitter.com/technova' },
  },
  {
    firstName: 'Green',
    lastName: 'Leaf',
    email: 'greenleaf@jobboard.com',
    password: 'Demo123!',
    role: 'company',
    phone: '+90 312 555 0202',
    location: 'Ankara, Turkey',
    companyName: 'GreenLeaf Analytics',
    companyWebsite: 'https://greenleaf.io',
    companyLocation: 'Ankara, Turkey',
    companySize: '11-50',
    companyAbout:
      'GreenLeaf Analytics is a data analytics startup focused on turning raw financial data into actionable insights. Our AI-powered dashboards help fintech companies make better investment decisions.',
    companyIndustry: 'finance',
    companyFounded: 2021,
    companySocials: { linkedin: 'https://linkedin.com/company/greenleaf' },
  },
  {
    firstName: 'Health',
    lastName: 'Bridge',
    email: 'healthbridge@jobboard.com',
    password: 'Demo123!',
    role: 'company',
    phone: '+90 232 555 0303',
    location: 'Izmir, Turkey',
    companyName: 'HealthBridge Corp',
    companyWebsite: 'https://healthbridge.com',
    companyLocation: 'Izmir, Turkey',
    companySize: '201-500',
    companyAbout:
      'HealthBridge Corp is a digital health platform that connects patients with healthcare providers through telemedicine, appointment scheduling, and electronic health record management.',
    companyIndustry: 'healthcare',
    companyFounded: 2015,
    companySocials: { linkedin: 'https://linkedin.com/company/healthbridge', facebook: 'https://facebook.com/healthbridge' },
  },
  {
    firstName: 'Creative',
    lastName: 'Minds',
    email: 'creativeminds@jobboard.com',
    password: 'Demo123!',
    role: 'company',
    phone: '+90 555 555 0404',
    location: 'Remote',
    companyName: 'CreativeMinds Agency',
    companyWebsite: 'https://creativeminds.agency',
    companyLocation: 'Remote',
    companySize: '1-10',
    companyAbout:
      'CreativeMinds Agency is a boutique digital marketing studio delivering brand strategy, social media management, and growth campaigns for global clients from a fully remote team.',
    companyIndustry: 'marketing',
    companyFounded: 2022,
    companySocials: { twitter: 'https://twitter.com/creativeminds', linkedin: 'https://linkedin.com/company/creativeminds' },
  },
  {
    firstName: 'Edu',
    lastName: 'Next',
    email: 'edunext@jobboard.com',
    password: 'Demo123!',
    role: 'company',
    phone: '+90 216 555 0505',
    location: 'Istanbul, Turkey',
    companyName: 'EduNext',
    companyWebsite: 'https://edunext.io',
    companyLocation: 'Istanbul, Turkey',
    companySize: '51-200',
    companyAbout:
      'EduNext is an e-learning platform that democratizes education through interactive courses, live workshops, and AI-powered personalized learning paths for students and professionals.',
    companyIndustry: 'education',
    companyFounded: 2019,
    companySocials: { linkedin: 'https://linkedin.com/company/edunext', facebook: 'https://facebook.com/edunext' },
  },
];

const candidateUsers = [
  {
    firstName: 'Ayse',
    lastName: 'Yilmaz',
    email: 'ayse@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Istanbul, Turkey',
    title: 'Senior Frontend Developer',
    bio: 'Passionate frontend developer with 5+ years of experience building high-performance web applications with React, TypeScript, and modern CSS frameworks.',
    skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'GraphQL'],
    experience: 'senior',
    linkedinUrl: 'https://linkedin.com/in/ayseyilmaz',
    githubUrl: 'https://github.com/ayseyilmaz',
    desiredSalary: { min: 8000, max: 12000, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'remote'], locations: ['Istanbul'], remote: true },
  },
  {
    firstName: 'Mehmet',
    lastName: 'Kaya',
    email: 'mehmet@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Ankara, Turkey',
    title: 'Backend Developer',
    bio: 'Node.js and Python backend developer experienced in building RESTful APIs, microservices, and real-time data pipelines. Strong background in database design and cloud infrastructure.',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS'],
    experience: 'mid',
    linkedinUrl: 'https://linkedin.com/in/mehmetkaya',
    desiredSalary: { min: 6000, max: 9000, currency: 'USD' },
    jobPreferences: { types: ['full-time'], locations: ['Ankara', 'Istanbul'], remote: false },
  },
  {
    firstName: 'Elif',
    lastName: 'Demir',
    email: 'elif@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Izmir, Turkey',
    title: 'Full-Stack Developer',
    bio: 'Full-stack developer who enjoys bridging design and engineering. Comfortable with React on the frontend and Express/NestJS on the backend with 4 years of professional experience.',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Docker'],
    experience: 'mid',
    linkedinUrl: 'https://linkedin.com/in/elifdemir',
    githubUrl: 'https://github.com/elifdemir',
    desiredSalary: { min: 5000, max: 8000, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'hybrid'], locations: ['Izmir'], remote: true },
  },
  {
    firstName: 'Can',
    lastName: 'Ozturk',
    email: 'can@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Istanbul, Turkey',
    title: 'UI/UX Designer',
    bio: 'Creative UI/UX designer with a strong foundation in user research, wireframing, and prototyping. Proficient in Figma and skilled at translating business goals into delightful user experiences.',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems', 'CSS'],
    experience: 'senior',
    portfolioUrl: 'https://canozturk.design',
    linkedinUrl: 'https://linkedin.com/in/canozturk',
    desiredSalary: { min: 7000, max: 10000, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'remote', 'contract'], locations: ['Istanbul'], remote: true },
  },
  {
    firstName: 'Zeynep',
    lastName: 'Arslan',
    email: 'zeynep@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Ankara, Turkey',
    title: 'Data Analyst',
    bio: 'Detail-oriented data analyst skilled in SQL, Python, and visualization tools. Experienced in financial reporting, A/B testing, and building dashboards that drive data-informed decisions.',
    skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Excel', 'R'],
    experience: 'junior',
    linkedinUrl: 'https://linkedin.com/in/zeyneparslan',
    desiredSalary: { min: 3500, max: 5500, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'internship'], locations: ['Ankara'], remote: false },
  },
  {
    firstName: 'Burak',
    lastName: 'Sahin',
    email: 'burak@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Istanbul, Turkey',
    title: 'DevOps Engineer',
    bio: 'DevOps engineer with expertise in CI/CD pipelines, Kubernetes, Terraform, and cloud-native architectures. Focused on reliability, automation, and infrastructure as code.',
    skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Prometheus'],
    experience: 'senior',
    linkedinUrl: 'https://linkedin.com/in/buraksahin',
    githubUrl: 'https://github.com/buraksahin',
    desiredSalary: { min: 9000, max: 14000, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'remote'], locations: ['Istanbul'], remote: true },
  },
  {
    firstName: 'Selin',
    lastName: 'Celik',
    email: 'selin@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Remote',
    title: 'Project Manager',
    bio: 'Certified PMP project manager with 6+ years leading cross-functional agile teams. Strong communicator who thrives in fast-paced environments and delivers projects on time and under budget.',
    skills: ['Agile', 'Scrum', 'Jira', 'Confluence', 'Risk Management', 'Stakeholder Management'],
    experience: 'lead',
    linkedinUrl: 'https://linkedin.com/in/selincelik',
    desiredSalary: { min: 7000, max: 11000, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'contract'], locations: ['Remote'], remote: true },
  },
  {
    firstName: 'Emre',
    lastName: 'Yildiz',
    email: 'emre@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Izmir, Turkey',
    title: 'Mobile Developer',
    bio: 'React Native and Flutter mobile developer who has shipped 10+ apps to App Store and Google Play. Passionate about smooth animations and pixel-perfect implementations.',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'TypeScript'],
    experience: 'mid',
    linkedinUrl: 'https://linkedin.com/in/emreyildiz',
    githubUrl: 'https://github.com/emreyildiz',
    desiredSalary: { min: 5500, max: 8500, currency: 'USD' },
    jobPreferences: { types: ['full-time', 'remote'], locations: ['Izmir', 'Istanbul'], remote: true },
  },
  {
    firstName: 'Deniz',
    lastName: 'Korkmaz',
    email: 'deniz@jobboard.com',
    password: 'Demo123!',
    role: 'candidate',
    location: 'Ankara, Turkey',
    title: 'QA Engineer',
    bio: 'Quality assurance engineer experienced in manual and automated testing with Cypress, Selenium, and Playwright. Strong advocate for shift-left testing and continuous quality improvement.',
    skills: ['Cypress', 'Selenium', 'Playwright', 'Jest', 'Postman', 'SQL'],
    experience: 'junior',
    linkedinUrl: 'https://linkedin.com/in/denizkorkmaz',
    desiredSalary: { min: 3000, max: 5000, currency: 'USD' },
    jobPreferences: { types: ['full-time'], locations: ['Ankara'], remote: false },
  },
];

const buildJobs = (companyMap) => {
  const now = new Date();
  const future = (days) => new Date(now.getTime() + days * 86400000);

  return [
    // ─── TechNova Solutions (4) ───
    {
      title: 'Senior React Developer',
      description:
        'We are looking for a Senior React Developer to lead frontend architecture decisions, mentor junior developers, and build scalable UI components for our enterprise SaaS platform. You will work closely with designers and backend engineers to deliver pixel-perfect, performant interfaces.',
      requirements: 'Minimum 4 years of professional React experience. Strong TypeScript skills. Familiarity with state management libraries and testing frameworks.',
      responsibilities: 'Lead frontend architecture. Review pull requests. Mentor team members. Collaborate with product and design teams.',
      benefits: 'Competitive salary, remote-friendly, health insurance, annual learning budget of $2,000, flexible hours.',
      company: companyMap['technova@jobboard.com'],
      location: 'Istanbul, Turkey',
      type: 'full-time',
      salary: { min: 8000, max: 12000, currency: 'USD', period: 'monthly' },
      skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Jest'],
      experience: 'senior',
      education: 'bachelor',
      department: 'Engineering',
      positions: 2,
      deadline: future(45),
      isActive: true,
      isFeatured: true,
      views: 234,
    },
    {
      title: 'Node.js Backend Engineer',
      description:
        'Join our backend team to design and implement RESTful APIs, microservices, and real-time data processing pipelines. You will own critical services handling millions of requests per day and ensure high availability.',
      requirements: '3+ years Node.js experience. Proficient in MongoDB and Redis. Experience with message queues (RabbitMQ or Kafka).',
      responsibilities: 'Build and maintain APIs. Optimize database queries. Implement caching strategies. Write unit and integration tests.',
      benefits: 'Stock options, remote work, health and dental insurance, conference sponsorship.',
      company: companyMap['technova@jobboard.com'],
      location: 'Istanbul, Turkey',
      type: 'remote',
      salary: { min: 7000, max: 11000, currency: 'USD', period: 'monthly' },
      skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker'],
      experience: 'mid',
      education: 'bachelor',
      department: 'Engineering',
      positions: 1,
      deadline: future(30),
      isActive: true,
      isFeatured: false,
      views: 178,
    },
    {
      title: 'DevOps Engineer',
      description:
        'We need a DevOps engineer to build and maintain CI/CD pipelines, manage Kubernetes clusters on AWS, and improve our infrastructure-as-code practices. You will be the bridge between development and operations.',
      requirements: 'Strong Linux skills. Experience with Terraform, Docker, and Kubernetes. AWS certifications are a plus.',
      responsibilities: 'Manage cloud infrastructure. Automate deployments. Monitor system health. Implement security best practices.',
      benefits: 'Fully remote, competitive pay, home-office stipend, 25 days PTO.',
      company: companyMap['technova@jobboard.com'],
      location: 'Remote',
      type: 'remote',
      salary: { min: 9000, max: 14000, currency: 'USD', period: 'monthly' },
      skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux'],
      experience: 'senior',
      education: 'any',
      department: 'Infrastructure',
      positions: 1,
      deadline: future(60),
      isActive: true,
      isFeatured: true,
      views: 312,
    },
    {
      title: 'Junior Frontend Developer',
      description:
        'Great opportunity for a junior developer to grow within a supportive team. You will build React components, fix bugs, and learn best practices from senior engineers while contributing to real projects.',
      requirements: 'Basic knowledge of HTML, CSS, JavaScript. Familiarity with React is a plus. Eager to learn and grow.',
      responsibilities: 'Implement UI components from designs. Write unit tests. Participate in code reviews. Document features.',
      benefits: 'Mentorship program, flexible hours, learning budget, social events.',
      company: companyMap['technova@jobboard.com'],
      location: 'Istanbul, Turkey',
      type: 'hybrid',
      salary: { min: 2500, max: 4000, currency: 'USD', period: 'monthly' },
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      experience: 'entry',
      education: 'any',
      department: 'Engineering',
      positions: 3,
      deadline: future(20),
      isActive: true,
      isFeatured: false,
      views: 89,
    },

    // ─── GreenLeaf Analytics (4) ───
    {
      title: 'Data Analyst',
      description:
        'GreenLeaf Analytics is hiring a Data Analyst to transform raw financial data into clear, actionable reports. You will work with product and business teams to identify trends, build dashboards, and support data-driven decision-making.',
      requirements: 'Proficiency in SQL and Python. Experience with Tableau or Power BI. Understanding of statistical methods.',
      responsibilities: 'Build and maintain dashboards. Perform ad-hoc analysis. Present findings to stakeholders. Ensure data quality.',
      benefits: 'Competitive salary, health insurance, free lunch, modern office in Ankara.',
      company: companyMap['greenleaf@jobboard.com'],
      location: 'Ankara, Turkey',
      type: 'full-time',
      salary: { min: 4000, max: 6500, currency: 'USD', period: 'monthly' },
      skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Statistics'],
      experience: 'junior',
      education: 'bachelor',
      department: 'Analytics',
      positions: 2,
      deadline: future(35),
      isActive: true,
      isFeatured: true,
      views: 156,
    },
    {
      title: 'Python Backend Developer',
      description:
        'Develop high-performance data processing services in Python. You will work on ETL pipelines, API services, and machine learning model deployments supporting our financial analytics platform.',
      requirements: '2+ years Python experience. Familiarity with FastAPI or Django. Experience with data processing (Pandas, NumPy).',
      responsibilities: 'Build data pipelines. Develop API services. Optimize query performance. Deploy ML models.',
      benefits: 'Health insurance, performance bonuses, gym membership, flexible schedule.',
      company: companyMap['greenleaf@jobboard.com'],
      location: 'Ankara, Turkey',
      type: 'full-time',
      salary: { min: 5500, max: 8500, currency: 'USD', period: 'monthly' },
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Pandas', 'Docker'],
      experience: 'mid',
      education: 'bachelor',
      department: 'Engineering',
      positions: 1,
      deadline: future(25),
      isActive: true,
      isFeatured: false,
      views: 98,
    },
    {
      title: 'Data Analyst Intern',
      description:
        'Kickstart your analytics career at GreenLeaf. As an intern, you will learn SQL, build reports, assist senior analysts, and gain hands-on experience with real financial datasets in a collaborative environment.',
      requirements: 'Currently pursuing a degree in Computer Science, Statistics, or related field. Basic SQL knowledge preferred.',
      responsibilities: 'Assist with data cleaning. Create simple reports. Learn BI tools. Shadow senior analysts.',
      benefits: 'Paid internship, mentorship, certificate of completion, potential full-time offer.',
      company: companyMap['greenleaf@jobboard.com'],
      location: 'Ankara, Turkey',
      type: 'internship',
      salary: { min: 1500, max: 2000, currency: 'USD', period: 'monthly' },
      skills: ['SQL', 'Excel', 'Python'],
      experience: 'entry',
      education: 'any',
      department: 'Analytics',
      positions: 2,
      deadline: future(15),
      isActive: true,
      isFeatured: false,
      views: 67,
    },
    {
      title: 'QA Engineer',
      description:
        'Ensure the quality of our analytics platform through comprehensive testing strategies. You will design test plans, automate regression suites, and work with developers to maintain product reliability.',
      requirements: 'Experience with automated testing tools. Familiarity with CI/CD. Strong analytical mindset.',
      responsibilities: 'Write test plans. Automate tests. Report bugs. Verify fixes. Maintain test infrastructure.',
      benefits: 'Health insurance, flexible hours, team outings, learning stipend.',
      company: companyMap['greenleaf@jobboard.com'],
      location: 'Ankara, Turkey',
      type: 'full-time',
      salary: { min: 4000, max: 6000, currency: 'USD', period: 'monthly' },
      skills: ['Cypress', 'Selenium', 'Jest', 'Postman', 'SQL'],
      experience: 'junior',
      education: 'bachelor',
      department: 'Quality Assurance',
      positions: 1,
      deadline: future(5),
      isActive: false,
      isFeatured: false,
      views: 45,
    },

    // ─── HealthBridge Corp (4) ───
    {
      title: 'Full-Stack Developer',
      description:
        'HealthBridge Corp is looking for a full-stack developer to work on our telemedicine platform. You will build features that connect patients with doctors, manage appointments, and handle sensitive health records securely.',
      requirements: '3+ years full-stack experience. React and Node.js required. HIPAA compliance knowledge is a plus.',
      responsibilities: 'Develop new features end-to-end. Ensure HIPAA compliance. Write secure code. Participate in sprint planning.',
      benefits: 'Health and life insurance, 401k equivalent, annual wellness budget, hybrid work model.',
      company: companyMap['healthbridge@jobboard.com'],
      location: 'Izmir, Turkey',
      type: 'hybrid',
      salary: { min: 6500, max: 10000, currency: 'USD', period: 'monthly' },
      skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'],
      experience: 'mid',
      education: 'bachelor',
      department: 'Product Engineering',
      positions: 2,
      deadline: future(40),
      isActive: true,
      isFeatured: true,
      views: 201,
    },
    {
      title: 'Mobile Developer (React Native)',
      description:
        'Build and maintain our patient-facing mobile application used by thousands daily. You will implement new features, optimize performance, and ensure a smooth experience across iOS and Android.',
      requirements: '2+ years React Native. Published apps on App Store / Google Play. Knowledge of push notifications and offline storage.',
      responsibilities: 'Develop mobile features. Fix platform-specific bugs. Integrate with REST APIs. Publish updates to stores.',
      benefits: 'Competitive salary, free meals, shuttle service, health insurance.',
      company: companyMap['healthbridge@jobboard.com'],
      location: 'Izmir, Turkey',
      type: 'full-time',
      salary: { min: 5500, max: 8500, currency: 'USD', period: 'monthly' },
      skills: ['React Native', 'TypeScript', 'Firebase', 'Redux', 'REST API'],
      experience: 'mid',
      education: 'bachelor',
      department: 'Mobile',
      positions: 1,
      deadline: future(50),
      isActive: true,
      isFeatured: false,
      views: 134,
    },
    {
      title: 'UI/UX Designer',
      description:
        'Design intuitive and accessible user interfaces for our digital health platform. You will conduct user research, create wireframes and prototypes, and collaborate with engineers to ensure design fidelity.',
      requirements: 'Portfolio demonstrating healthcare or SaaS design experience. Proficiency in Figma. Knowledge of WCAG accessibility standards.',
      responsibilities: 'Conduct user research. Design wireframes and prototypes. Maintain design system. Collaborate with developers.',
      benefits: 'Remote-friendly, health insurance, design conference budget, modern equipment.',
      company: companyMap['healthbridge@jobboard.com'],
      location: 'Remote',
      type: 'remote',
      salary: { min: 6000, max: 9000, currency: 'USD', period: 'monthly' },
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
      experience: 'mid',
      education: 'any',
      department: 'Design',
      positions: 1,
      deadline: future(30),
      isActive: true,
      isFeatured: false,
      views: 167,
    },
    {
      title: 'Project Manager — Healthcare IT',
      description:
        'Lead cross-functional teams delivering healthcare IT projects. You will manage timelines, communicate with stakeholders, mitigate risks, and ensure regulatory compliance throughout the project lifecycle.',
      requirements: 'PMP or Agile certification. 4+ years project management experience. Healthcare domain knowledge preferred.',
      responsibilities: 'Plan sprints and releases. Manage stakeholder expectations. Track budgets. Report progress to leadership.',
      benefits: 'Competitive package, leadership training, annual retreat, flexible hours.',
      company: companyMap['healthbridge@jobboard.com'],
      location: 'Izmir, Turkey',
      type: 'full-time',
      salary: { min: 7000, max: 11000, currency: 'USD', period: 'monthly' },
      skills: ['Agile', 'Scrum', 'Jira', 'Risk Management', 'Stakeholder Management'],
      experience: 'lead',
      education: 'bachelor',
      department: 'Project Management',
      positions: 1,
      deadline: future(55),
      isActive: true,
      isFeatured: false,
      views: 78,
    },

    // ─── CreativeMinds Agency (4) ───
    {
      title: 'Digital Marketing Specialist',
      description:
        'Run multi-channel marketing campaigns for our global clients. You will plan, execute, and optimize paid and organic campaigns across Google, Meta, and LinkedIn while tracking ROI and reporting performance.',
      requirements: 'Google Ads and Meta Business Suite certifications. 2+ years digital marketing experience. Strong analytical skills.',
      responsibilities: 'Manage ad campaigns. Analyze performance. Optimize budgets. Create monthly reports for clients.',
      benefits: 'Fully remote, flexible hours, quarterly bonuses, education budget.',
      company: companyMap['creativeminds@jobboard.com'],
      location: 'Remote',
      type: 'remote',
      salary: { min: 3500, max: 5500, currency: 'USD', period: 'monthly' },
      skills: ['Google Ads', 'SEO', 'Content Marketing', 'Analytics', 'Social Media'],
      experience: 'mid',
      education: 'any',
      department: 'Marketing',
      positions: 1,
      deadline: future(20),
      isActive: true,
      isFeatured: false,
      views: 112,
    },
    {
      title: 'Freelance Graphic Designer',
      description:
        'We need a talented graphic designer for a 3-month contract to support branding projects. You will create logos, social media assets, and marketing collateral for multiple client accounts.',
      requirements: 'Portfolio of branding work. Proficiency in Adobe Creative Suite and Figma. Ability to work independently.',
      responsibilities: 'Design brand identities. Create social media graphics. Prepare print materials. Revise based on feedback.',
      benefits: 'Flexible schedule, project-based payment, portfolio exposure.',
      company: companyMap['creativeminds@jobboard.com'],
      location: 'Remote',
      type: 'contract',
      salary: { min: 3000, max: 4500, currency: 'USD', period: 'monthly' },
      skills: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Branding', 'Typography'],
      experience: 'mid',
      education: 'any',
      department: 'Design',
      positions: 2,
      deadline: future(10),
      isActive: true,
      isFeatured: false,
      views: 89,
    },
    {
      title: 'Content Writer',
      description:
        'Write compelling blog posts, case studies, and website copy that engages audiences and drives organic traffic. You will collaborate with SEO specialists and designers to create content that converts.',
      requirements: 'Excellent English writing skills. SEO knowledge. Experience with CMS platforms (WordPress, Webflow).',
      responsibilities: 'Write blog posts and landing pages. Edit and proofread content. Research topics. Optimize for SEO.',
      benefits: 'Remote work, flexible schedule, byline credit, writing workshops.',
      company: companyMap['creativeminds@jobboard.com'],
      location: 'Remote',
      type: 'contract',
      salary: { min: 2000, max: 3500, currency: 'USD', period: 'monthly' },
      skills: ['Copywriting', 'SEO', 'WordPress', 'Content Strategy', 'Editing'],
      experience: 'junior',
      education: 'any',
      department: 'Content',
      positions: 1,
      deadline: future(3),
      isActive: false,
      isFeatured: false,
      views: 56,
    },
    {
      title: 'Social Media Manager Intern',
      description:
        'Learn the ins and outs of social media management at a creative agency. You will schedule posts, track engagement metrics, and assist in campaign brainstorming sessions for real clients.',
      requirements: 'Active on social media platforms. Basic knowledge of scheduling tools. Creative mindset.',
      responsibilities: 'Schedule content. Track metrics. Assist in campaigns. Create simple graphics using Canva.',
      benefits: 'Paid internship, mentorship, portfolio projects, potential contract offer.',
      company: companyMap['creativeminds@jobboard.com'],
      location: 'Remote',
      type: 'internship',
      salary: { min: 1000, max: 1500, currency: 'USD', period: 'monthly' },
      skills: ['Social Media', 'Canva', 'Analytics', 'Communication'],
      experience: 'entry',
      education: 'any',
      department: 'Marketing',
      positions: 1,
      deadline: future(25),
      isActive: true,
      isFeatured: false,
      views: 41,
    },

    // ─── EduNext (4) ───
    {
      title: 'Senior Full-Stack Developer',
      description:
        'Lead the development of our e-learning platform features including course builder, live workshop engine, and student analytics dashboard. You will define technical direction and ensure code quality.',
      requirements: '5+ years full-stack experience. React and Node.js expert. Experience with video streaming or real-time collaboration is a plus.',
      responsibilities: 'Architect new features. Write clean, tested code. Mentor developers. Define coding standards.',
      benefits: 'Competitive salary, stock options, health insurance, unlimited learning access on EduNext.',
      company: companyMap['edunext@jobboard.com'],
      location: 'Istanbul, Turkey',
      type: 'full-time',
      salary: { min: 9000, max: 13000, currency: 'USD', period: 'monthly' },
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'WebSocket', 'Redis'],
      experience: 'senior',
      education: 'bachelor',
      department: 'Engineering',
      positions: 1,
      deadline: future(40),
      isActive: true,
      isFeatured: true,
      views: 287,
    },
    {
      title: 'React Native Developer',
      description:
        'Build the mobile version of EduNext for iOS and Android. You will implement offline course viewing, push notifications, and integrate with our existing REST API to provide a seamless learning experience on the go.',
      requirements: '2+ years React Native experience. Published app(s). Familiarity with offline storage and background sync.',
      responsibilities: 'Develop mobile features. Ensure cross-platform consistency. Integrate push notifications. Optimize performance.',
      benefits: 'Health insurance, remote-first, education stipend, equipment budget.',
      company: companyMap['edunext@jobboard.com'],
      location: 'Istanbul, Turkey',
      type: 'remote',
      salary: { min: 6000, max: 9000, currency: 'USD', period: 'monthly' },
      skills: ['React Native', 'TypeScript', 'Firebase', 'Redux', 'REST API'],
      experience: 'mid',
      education: 'any',
      department: 'Mobile',
      positions: 1,
      deadline: future(35),
      isActive: true,
      isFeatured: false,
      views: 145,
    },
    {
      title: 'Instructional Designer',
      description:
        'Design engaging online course content that helps learners achieve their goals. You will work with subject matter experts, video producers, and engineers to create interactive learning experiences.',
      requirements: 'Experience in e-learning or instructional design. Familiarity with LMS platforms. Strong storytelling skills.',
      responsibilities: 'Design course curricula. Create assessments. Collaborate with SMEs. Review learner feedback.',
      benefits: 'Remote work, education budget, health insurance, flexible hours.',
      company: companyMap['edunext@jobboard.com'],
      location: 'Remote',
      type: 'hybrid',
      salary: { min: 4000, max: 6500, currency: 'USD', period: 'monthly' },
      skills: ['Instructional Design', 'LMS', 'Content Creation', 'Assessment Design', 'Communication'],
      experience: 'mid',
      education: 'bachelor',
      department: 'Education',
      positions: 2,
      deadline: future(28),
      isActive: true,
      isFeatured: false,
      views: 76,
    },
    {
      title: 'Customer Support Specialist',
      description:
        'Be the first point of contact for EduNext users. You will troubleshoot issues, guide learners through the platform, and relay user feedback to the product team to improve the overall experience.',
      requirements: 'Excellent communication skills. Patience and empathy. Experience with ticketing systems (Zendesk, Freshdesk).',
      responsibilities: 'Respond to user inquiries. Resolve technical issues. Document common problems. Provide product feedback.',
      benefits: 'Health insurance, free EduNext subscription, supportive team, career growth.',
      company: companyMap['edunext@jobboard.com'],
      location: 'Istanbul, Turkey',
      type: 'full-time',
      salary: { min: 2500, max: 3500, currency: 'USD', period: 'monthly' },
      skills: ['Customer Support', 'Zendesk', 'Communication', 'Problem Solving'],
      experience: 'entry',
      education: 'any',
      department: 'Support',
      positions: 2,
      deadline: future(15),
      isActive: true,
      isFeatured: false,
      views: 53,
    },
  ];
};

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const coverLetters = [
  'I am very excited about this opportunity and believe my skills make me a strong candidate. I have been following your company for some time and admire the work you do in the industry.',
  'With my background and passion for this field, I am confident I can contribute meaningfully to your team. I look forward to discussing how my experience aligns with your needs.',
  'I am eager to bring my expertise to your organization. My previous roles have prepared me well for this position, and I am ready to make an immediate impact.',
  '',
  'Having worked on similar challenges in my previous role, I am well-prepared for this position. I am particularly drawn to your company culture and the opportunity for growth.',
  '',
];

const statusOptions = ['pending', 'reviewed', 'shortlisted', 'rejected'];
const statusWeights = [0.45, 0.25, 0.2, 0.1];

const weightedStatus = () => {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < statusOptions.length; i++) {
    cumulative += statusWeights[i];
    if (rand <= cumulative) return statusOptions[i];
  }
  return 'pending';
};

/**
 * Returns a random Date in the past, between `minDays` and `maxDays` ago.
 * Used to backdate seeded records so dashboard analytics (Today / Month-over-
 * Month growth) reflect realistic activity instead of all-time totals.
 */
const daysAgo = (minDays, maxDays) => {
  const days = randomInt(minDays, maxDays);
  const ms = days * 86400000 + randomInt(0, 86_399_999);
  return new Date(Date.now() - ms);
};

/* ------------------------------------------------------------------ */
/*  SEED: ADMIN ONLY                                                   */
/* ------------------------------------------------------------------ */

const seedAdminOnly = async () => {
  const adminConfig = getAdminConfig();

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
    process.exit(1);
  }

  console.log(`📧 Admin email: ${adminConfig.email}`);

  const existingAdmin = await User.findOne({ role: 'admin' });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
  } else {
    const admin = await User.create(adminConfig);
    console.log('Admin user created:', admin.email);
  }
};

/* ------------------------------------------------------------------ */
/*  SEED: FULL (admin + demo data)                                     */
/* ------------------------------------------------------------------ */

const seedFull = async () => {
  // Drop existing data
  console.log('Dropping existing data...');
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    SavedJob.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // ── 1. Create admin user ──
  const adminConfig = getAdminConfig();
  console.log(`Creating admin user (${adminConfig.email})...`);
  await User.create(adminConfig);

  // ── 2. Create company users ──
  // Backdate company registrations across the last ~90 days so dashboard
  // metrics like "Today" and "Month-over-Month growth" produce realistic
  // numbers instead of equaling all-time totals.
  console.log('Creating company users...');
  const companies = [];
  for (const [index, data] of companyUsers.entries()) {
    // Spread registrations: oldest 90 days ago, newest a few days ago.
    const offsetDays = 8 + index * 10;
    const createdAt = daysAgo(offsetDays, offsetDays + 6);
    const company = await User.create({ ...data, createdAt, updatedAt: createdAt });
    companies.push(company);
  }
  const companyMap = {};
  companies.forEach((c) => {
    companyMap[c.email] = c._id;
  });

  // ── 3. Create candidate users ──
  // Backdate across last ~75 days; ensure a couple of "today" registrations
  // and a handful in the previous 30-day window for realistic growth %.
  console.log('Creating candidate users...');
  const candidates = [];
  for (const [index, data] of candidateUsers.entries()) {
    let createdAt;
    if (index === 0) {
      createdAt = daysAgo(0, 0); // today
    } else if (index === 1) {
      createdAt = daysAgo(2, 5);
    } else if (index < 5) {
      createdAt = daysAgo(8, 28);
    } else {
      createdAt = daysAgo(35, 75);
    }
    const candidate = await User.create({ ...data, createdAt, updatedAt: createdAt });
    candidates.push(candidate);
  }

  // ── 4. Create jobs ──
  // Backdate job postings across the last ~60 days. A few are "today" so
  // the dashboard's todayStats panel actually has data to display.
  console.log('Creating jobs...');
  const jobDataList = buildJobs(companyMap);
  const jobs = [];
  for (const [index, data] of jobDataList.entries()) {
    let createdAt;
    if (index < 2) {
      createdAt = daysAgo(0, 0); // today
    } else if (index < 6) {
      createdAt = daysAgo(2, 6);
    } else if (index < 14) {
      createdAt = daysAgo(8, 28);
    } else {
      createdAt = daysAgo(30, 60);
    }
    const job = await Job.create({ ...data, createdAt, updatedAt: createdAt });
    jobs.push(job);
  }

  // ── 5. Create applications (40 total) ──
  console.log('Creating applications...');
  const applications = [];
  const applicationPairs = new Set();

  // Backdate applications across the last ~45 days, with a few created
  // today so the dashboard's "Today → Applications" tile reflects real
  // recent activity rather than the all-time total.
  for (const candidate of candidates) {
    const applyCount = randomInt(3, 6);
    const shuffledJobs = shuffleArray(jobs);
    let applied = 0;

    for (const job of shuffledJobs) {
      if (applied >= applyCount) break;
      if (applications.length >= 40) break;

      const pairKey = `${candidate._id}-${job._id}`;
      if (applicationPairs.has(pairKey)) continue;
      applicationPairs.add(pairKey);

      // Application can only be created on/after the job's creation date.
      const earliestMs = new Date(job.createdAt).getTime();
      const nowMs = Date.now();
      const minDaysSinceJob = Math.max(0, Math.floor((nowMs - earliestMs) / 86400000));
      const maxAge = Math.min(45, minDaysSinceJob);

      let appCreatedAt;
      if (applications.length < 4) {
        appCreatedAt = daysAgo(0, 0); // today
      } else if (applications.length < 12) {
        appCreatedAt = daysAgo(1, 6);
      } else if (applications.length < 25 && maxAge >= 8) {
        appCreatedAt = daysAgo(8, Math.min(28, maxAge));
      } else if (maxAge >= 30) {
        appCreatedAt = daysAgo(30, Math.min(45, maxAge));
      } else {
        appCreatedAt = daysAgo(0, Math.max(0, maxAge));
      }

      const status = weightedStatus();
      const statusHistory = [
        { status: 'pending', changedAt: appCreatedAt, changedBy: candidate._id },
      ];

      if (status !== 'pending') {
        statusHistory.push({
          status,
          note: status === 'rejected' ? 'Position has been filled.' : undefined,
          changedAt: new Date(appCreatedAt.getTime() + randomInt(1, 7) * 86400000),
          changedBy: job.company,
        });
      }

      const app = await Application.create({
        job: job._id,
        candidate: candidate._id,
        company: job.company,
        cvUrl: `https://res.cloudinary.com/demo/raw/upload/sample_cv_${candidate.firstName.toLowerCase()}.pdf`,
        coverLetter: randomPick(coverLetters) || undefined,
        status,
        statusNote: status === 'rejected' ? 'Position has been filled.' : undefined,
        statusHistory,
        createdAt: appCreatedAt,
        updatedAt: appCreatedAt,
      });

      applications.push(app);
      applied++;
    }
  }

  // ── 6. Update applicationCount on jobs ──
  console.log('Updating application counts...');
  const countMap = {};
  applications.forEach((app) => {
    const jobId = app.job.toString();
    countMap[jobId] = (countMap[jobId] || 0) + 1;
  });
  for (const [jobId, count] of Object.entries(countMap)) {
    await Job.findByIdAndUpdate(jobId, { applicationCount: count });
  }

  // ── 7. Create saved jobs (15) ──
  console.log('Creating saved jobs...');
  const savedJobs = [];
  const savedPairs = new Set();

  while (savedJobs.length < 15) {
    const candidate = randomPick(candidates);
    const job = randomPick(jobs);
    const pairKey = `${candidate._id}-${job._id}`;
    if (savedPairs.has(pairKey)) continue;
    savedPairs.add(pairKey);

    const saved = await SavedJob.create({ candidate: candidate._id, job: job._id });
    savedJobs.push(saved);
  }

  // ── 8. Create notifications (20) ──
  console.log('Creating notifications...');
  const notifications = [];

  for (const app of applications.slice(0, 12)) {
    const job = jobs.find((j) => j._id.toString() === app.job.toString());
    if (!job) continue;

    notifications.push({
      recipient: app.company,
      sender: app.candidate,
      type: 'new_application',
      title: 'New Application Received',
      message: `A candidate applied for "${job.title}".`,
      link: `/company/jobs/${job._id}/applications`,
      relatedJob: job._id,
      relatedApplication: app._id,
      isRead: Math.random() > 0.5,
    });
  }

  const nonPendingApps = applications.filter((a) => a.status !== 'pending');
  for (const app of nonPendingApps.slice(0, 8)) {
    const job = jobs.find((j) => j._id.toString() === app.job.toString());
    if (!job) continue;

    notifications.push({
      recipient: app.candidate,
      sender: app.company,
      type: 'status_update',
      title: 'Application Status Updated',
      message: `Your application for "${job.title}" has been ${app.status}.`,
      link: `/candidate/applications`,
      relatedJob: job._id,
      relatedApplication: app._id,
      isRead: Math.random() > 0.6,
    });
  }

  await Notification.insertMany(notifications.slice(0, 20));

  // ── Summary ──
  const totalUsers = 1 + companies.length + candidates.length;
  console.log('\nSeed completed successfully!');
  console.log('─'.repeat(50));
  console.log(`   Users:          ${totalUsers} (1 admin, ${companies.length} companies, ${candidates.length} candidates)`);
  console.log(`   Jobs:           ${jobs.length}`);
  console.log(`   Applications:   ${applications.length}`);
  console.log(`   Saved Jobs:     ${savedJobs.length}`);
  console.log(`   Notifications:  ${Math.min(notifications.length, 20)}`);
  console.log('─'.repeat(50));
  console.log('\nTest Accounts:');
  console.log(`   Admin:     ${adminConfig.email} / ***`);
  console.log('   Company:   technova@jobboard.com / Demo123!');
  console.log('   Candidate: ayse@jobboard.com / Demo123!');
};

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */

const main = async () => {
  const { MONGO_URI } = process.env;
  const mode = ADMIN_ONLY ? 'admin-only' : 'full';

  console.log(`\n--- Seed Started [${mode}] ---\n`);

  if (!MONGO_URI) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }

  console.log(`MONGO_URI: ${MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log('Connected to MongoDB\n');

    if (ADMIN_ONLY) {
      await seedAdminOnly();
    } else {
      await seedFull();
    }
  } catch (error) {
    console.error('Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('--- Seed Completed ---\n');
  }
};

await main();
