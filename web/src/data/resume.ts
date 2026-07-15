// Canonical, machine-readable resume — transcribed from resume_andrew_trinh.tex.
// This is the single source of truth for the dashboard and the skills extractor.

export const CURRENT_YEAR = 2026;

export const profile = {
  name: 'Quoc Anh Trinh (Andrew)',
  heroName: 'Andrew Trinh',
  initials: 'AT',
  domain: 'andrewstrinh.github.io/profile',
  eyebrow: 'DATA · AML · RESEARCH',
  tagline:
    'Intelligence & analytics analyst building financial-crime detection systems and privacy-preserving AI.',
  title: 'Data Analyst · M.Sc Business Analytics, Deakin University',
  phone: '+61 451 886 468',
  email: 'andrews.trinh@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/qatrinh/',
  linkedinLabel: 'qatrinh',
  githubUrl: 'https://github.com/AndrewsTrinh',
  summary:
    'Financial crime solutions specialist who builds — not just operates — the analytics ' +
    'and AI systems that keep banks safe. Domain experience spans banking and financial ' +
    'crime (Bendigo & Adelaide Bank), FinTech and cryptocurrency (Remitano), and investment ' +
    'banking (National Citizen Bank) — a breadth that sharpens judgement across regulated ' +
    'and fast-moving environments alike. Works fluently across a diverse tech stack, from ' +
    'SQL, Python, R, Power BI, and Tableau to AWS, GCP, Oracle SQL, NetReveal/RSA-Outseer, ' +
    'and Agentic AI/LLM tooling, turning ambiguous problems into shipped, end-to-end ' +
    'solutions across Technology, Operations, Data, and Group Risk. Driven by a genuine ' +
    'passion for building analytics and AI solutions — from Agentic AI pipelines to ' +
    'self-directed projects like Typology Extractor and PheChat — to strengthen a bank’s ' +
    'defences against financial crime.',
} as const;

export type ItemType = 'experience' | 'education';

export type SkillId =
  | 'python'
  | 'sql'
  | 'r'
  | 'stats'
  | 'ml'
  | 'genai'
  | 'powerbi'
  | 'nlp'
  | 'etl';

export interface Achievement {
  text: string;
  skills: SkillId[]; // focus skills this achievement demonstrates -> drives extraction
  highlight?: boolean; // shown on the experience timeline (top 2–3 per role)
}

// The "at a glance" metric cards. Each value is backed by an achievement below.
export const metrics: { value: string; label: string }[] = [
  { value: '5+', label: 'Years in AML' },
  { value: '67%', label: 'Alert cut' },
  { value: '80%', label: 'Report time ↓' },
  { value: '70%', label: 'True positive' },
];

// Credentials shown alongside education (not tied to a timeline entry).
export const credentials: { title: string; org: string }[] = [
  { title: 'CFA Level 1', org: 'CFA Institute' },
  { title: 'Introduction to Subagents', org: 'Anthropic' },
  { title: 'Building with the Claude API', org: 'Anthropic' },
  { title: 'Introduction to Agent Skills', org: 'Anthropic' },
  { title: 'Claude Code in Action', org: 'Anthropic' },
  { title: 'AI Fluency Framework & Foundations', org: 'Anthropic' },
  { title: 'Engineer Data for Predictive Modeling with BigQuery ML', org: 'Google Skill Badge' },
  { title: 'Create ML Models with BigQuery ML', org: 'Google Skill Badge' },
  { title: 'Modernizing Data Lakes and Data Warehouses with GCP', org: 'Coursera' },
];

export interface TimelineItem {
  id: string;
  type: ItemType;
  role: string;
  org: string;
  orgNote?: string;
  start: string; // 'YYYY-MM'
  end: string | 'present'; // 'YYYY-MM' | 'present'
  achievements: Achievement[];
}

export interface SkillMeta {
  id: SkillId;
  label: string;
  kind: 'language' | 'skill';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  /** Source-code repo, when distinct from the live-app `url` above. */
  repoUrl?: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: 'typology-extractor',
    name: 'Typology Extractor',
    description:
      'Agentic AI and ETL pipeline that transforms AUSTRAC guidance documents into structured data for transaction monitoring framework comparison. Supports enforcement-gap detection and national scenario benchmarking across financial crime typologies.',
    url: 'https://typologyextractor.vercel.app/',
    repoUrl: 'https://github.com/AndrewsTrinh/aml_llm',
    tags: ['Agentic AI', 'LLM', 'AUSTRAC'],
  },
  {
    id: 'phechat',
    name: 'PheChat',
    description:
      'Agentic RAG chatbot built for small and medium businesses, combining retrieval-augmented generation with autonomous agent workflows to answer customer queries and automate routine business tasks.',
    url: 'https://phechat.com',
    repoUrl: 'https://github.com/lf2foce/phechat-agent',
    tags: ['Agentic AI', 'RAG', 'Chatbot'],
  },
  {
    id: 'applied-llm-aml',
    name: 'Applied LLMs in AML/CTF — MPhil Research',
    description:
      'Research proposal on applying large language models to AML/CTF — improving typology detection, regulatory reporting, and explainability in financial-crime analytics.',
    url: 'https://github.com/AndrewsTrinh/mphil_research/blob/main/main.pdf',
    tags: ['LLM', 'Research', 'AML/CTF'],
  },
  {
    id: 'graph-analytics-vn',
    name: 'Cross-Ownership Graph Analytics — VN Public Equity',
    description:
      'Network analysis mapping interlocking directorates and cross-ownership across Vietnamese listed companies, from web-scraped board/management data into an interactive graph visualisation.',
    url: 'https://github.com/AndrewsTrinh/graph_cross_owner_public_equity_vn',
    tags: ['Graph', 'Network Analysis', 'Python'],
  },
];

// Curated set the dashboard highlights. `kind` separates programming languages from competencies.
export const focusSkills: SkillMeta[] = [
  { id: 'python', label: 'Python', kind: 'language' },
  { id: 'sql', label: 'SQL', kind: 'language' },
  { id: 'r', label: 'R', kind: 'language' },
  { id: 'stats', label: 'Statistical Analysis', kind: 'skill' },
  { id: 'ml', label: 'Machine Learning', kind: 'skill' },
  { id: 'genai', label: 'Generative AI / LLMs', kind: 'skill' },
  { id: 'powerbi', label: 'Power BI', kind: 'skill' },
  { id: 'nlp', label: 'NLP', kind: 'skill' },
  { id: 'etl', label: 'Data Engineering / ETL', kind: 'skill' },
];

// Sorted oldest -> newest.
export const timeline: TimelineItem[] = [
  {
    id: 'ncb',
    type: 'experience',
    role: 'Investment Associate',
    org: 'National Citizen Bank',
    orgNote: 'Commercial bank with 20+ years of operation',
    start: '2014-09',
    end: '2018-02',
    achievements: [
      {
        text: 'Secured Investment Council approval for 80% of recommendations, generating a public equity portfolio CAGR of 10%, drawing on field-tested financial analysis skills and public equity market experience.',
        skills: [],
        highlight: true,
      },
      {
        text: 'Reduced investment-approval time by 72 hours and eliminated major process conflicts by drafting the investment procedure with detailed instructions for accounting journal entries, authority levels, and document revision.',
        skills: [],
        highlight: true,
      },
    ],
  },
  {
    id: 'msc',
    type: 'education',
    role: 'Master of Business Analytics',
    org: 'Deakin University',
    start: '2018-01',
    end: '2019-12',
    achievements: [
      { text: 'Master of Business Analytics — analytics, machine learning, and data engineering.', skills: [] },
      { text: 'Kaggle PetFinder Competition: #13 public / #32 private test (Team Vicohub-1, 2019).', skills: [] },
    ],
  },
  {
    id: 'remitano',
    type: 'experience',
    role: 'Data Analyst',
    org: 'Remitano',
    orgNote: 'International crypto exchange — $500M+ matched, 30+ countries',
    start: '2020-03',
    end: '2021-04',
    achievements: [
      {
        text: 'Automated email marketing via customer-classification models (Python/SQL), boosting click-through rates by 30% and enabling scalable campaign personalisation.',
        skills: ['python', 'sql', 'ml', 'stats'],
        highlight: true,
      },
      {
        text: 'Optimised ETL pipelines, indexing, and data normalisation in Redshift, slashing developer workload by 25%, cloud costs by 30%, and dashboard runtime by 70%.',
        skills: ['etl', 'sql'],
        highlight: true,
      },
      {
        text: 'Delivered 100% on-time analytical reports and dashboards with consistent stakeholder satisfaction scores of 8/10 or higher.',
        skills: [],
      },
      {
        text: 'Engineered complex SQL (incl. recursive queries) for MLM commission calculations across 150K+ referral relationships and 4 levels — eliminating the need for a graph database and powering a 4-tier referral program that drove 25% of new-user growth.',
        skills: ['sql'],
      },
    ],
  },
  {
    id: 'bendigo',
    type: 'experience',
    role: 'Analyst — Intelligence & Analytics, Financial Crime Risk',
    org: 'Bendigo & Adelaide Bank',
    orgNote: 'Australian banking group — 4 commercial banks + 1 digital bank',
    start: '2021-05',
    end: 'present',
    achievements: [
      {
        text: 'Decision Engineering: Built vector-search infrastructure and a real-time streaming UI powering an AUSTRAC Knowledge Hub and AML/CTF Program Review Hub; integrated enforcement-action statements to automatically detect and evaluate regulatory gaps.',
        skills: ['genai', 'python'],
      },
      {
        text: 'Led an interim fraud & AML transaction-monitoring function during the DELPHI exit and TechOne transition, engineering advanced SQL detection queries to maintain 100% monitoring continuity across 2M+ transactions with zero compliance breaches.',
        skills: ['sql'],
      },
      {
        text: 'AI Enablement: Co-designed an end-to-end AI-driven UAR-to-SMR pipeline with secure data masking/rehydration and Pydantic-validated LLM prompting; cut regulatory reporting prep time by 80% with strict transparency and data-privacy compliance.',
        skills: ['genai', 'nlp', 'python'],
        highlight: true,
      },
      {
        text: 'Developed and fine-tuned scenarios for Child Exploitation, Sextortion, Drug Trafficking, and Terrorism Financing typologies using genetic algorithms, statistical calibration, and trend modelling — achieving 60–70% true positive rates with a 67% reduction in alert volume.',
        skills: ['stats', 'ml', 'r'],
        highlight: true,
      },
      {
        text: 'Scenario Development Coordination (2025): Executed and supported team members in building 9 new detection scenarios in 2025 — personally delivering 3 with a statistically significant true positive uplift — while providing guidance on design and calibration.',
        skills: ['stats', 'sql'],
        highlight: true,
      },
      {
        text: 'Agentic AI Framework: Engineered a typology extractor using Agentic AI and advanced ETL to transform 156 AUSTRAC guidance documents into structured data for framework comparison and national monitoring.',
        skills: ['genai', 'nlp', 'etl'],
        highlight: true,
      },
      {
        text: 'Dashboard & Reporting: Built Power BI dashboards and monthly reporting used by Operations and presented at Board level, eliminating 70% of ad-hoc requests and cutting prioritisation time by 60%.',
        skills: ['powerbi'],
      },
      {
        text: 'Manual Alert Ingestion Pipeline: Developed, implemented, and maintained a manual fraud/AML alert ingestion pipeline for detection scenarios built outside vendor platforms, feeding 150+ alerts daily into NetReveal and RSA/Outseer with 99.9% data integrity.',
        skills: ['sql', 'python', 'etl'],
      },
      {
        text: 'Annual Rule Review: Executed and peer-reviewed the annual transaction monitoring rule review in 2022 and 2023, supporting team members with statistical confidence testing, data sampling, and SQL-based scenario recalibration to cut false positives by 5%, removing 5,000+ unnecessary alerts and saving 300+ investigation hours a year.',
        skills: ['stats', 'sql', 'r'],
      },
      {
        text: 'Rapid Incident Response: Stood up a full detection service from scratch within 2–3 days to support an urgent brand transition and incident response, maintaining uninterrupted transaction monitoring coverage under significant time pressure.',
        skills: ['sql'],
      },
      {
        text: 'GitLab Migration: Migrated manual detection scenarios from a shared network drive to GitLab, improving version control, auditability, and scenario governance.',
        skills: [],
      },
      {
        text: 'Significant Dashboard Portfolio: Delivered a suite of high-impact Power BI dashboards spanning operational uplift (UAR, TM, and WLM case prioritisation) and detection uplift, including an IFTI SWIFT network graph for cross-border payment analysis and a BEN outlier detection dashboard for anomaly identification.',
        skills: ['powerbi'],
      },
      {
        text: 'Infrastructure Establishment: Initiated and established the team’s Power BI Server, Power BI cloud workspace, and GitLab environment — foundational infrastructure enabling scenario version control and dashboard delivery.',
        skills: ['powerbi', 'etl'],
      },
      {
        text: 'Engineered SQL replication and assurance testing of 40+ scenarios for the Adelaide Bank → Bendigo Bank migration, achieving 100% scenario alignment.',
        skills: ['sql'],
      },
      {
        text: 'AML Workbench: Designed an AML analytics workbench on GCP using dbt and BigQuery for external model validation, threshold calibration, and performance benchmarking.',
        skills: ['etl', 'sql'],
      },
    ],
  },
];
