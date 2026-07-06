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
    "Data Analyst with 5+ years' experience in FinTech and banking, specialising in " +
    'SQL- and Python-driven statistical analysis, transaction monitoring, and Power BI ' +
    'business intelligence dashboarding for leading institutions including Bendigo & ' +
    'Adelaide Bank and Remitano. Applies advanced statistical modelling, machine learning, ' +
    'NLP, and Generative AI / ' +
    'LLM solutions on AWS and GCP — building ETL pipelines and data-driven tools that ' +
    'reduced false positives by up to 67%, cut regulatory reporting time by 80%, and ' +
    'lifted marketing conversion by 30%. Passionate about translating complex data into ' +
    'measurable business outcomes across compliance, cost, and performance.',
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
  tags: string[];
}

export const projects: Project[] = [
  {
    id: 'typology-extractor',
    name: 'AUSTRAC Typology Extractor',
    description:
      'Agentic-AI web app that transforms AUSTRAC guidance documents into structured typology data, enabling transaction-monitoring framework comparison and gap analysis.',
    url: 'https://typologyextractor.vercel.app/',
    tags: ['Agentic AI', 'LLM', 'AUSTRAC'],
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
        text: 'Scenario Design: Researched and designed 9 new detection scenarios, applying statistical analysis to calibrate each to an effective ~70% false-positive baseline — maximising coverage while avoiding overly narrow scope.',
        skills: ['stats', 'sql'],
      },
      {
        text: 'Agentic AI Framework: Engineered a typology extractor using Agentic AI and advanced ETL to transform 156 AUSTRAC guidance documents into structured data for framework comparison and national monitoring.',
        skills: ['genai', 'nlp', 'etl'],
        highlight: true,
      },
      {
        text: 'Engineered Power BI dashboards that eliminated 70% of recurring ad-hoc requests and cut alert-prioritisation time by 60%, serving operations, transformation, and governance teams.',
        skills: ['powerbi'],
      },
      {
        text: 'Built SQL & Python scenarios outside vendor platforms with automated daily workflows feeding alerts and internal SMRs into vendor systems — 150+ alerts daily at 99.9% data integrity, eliminating manual transfers.',
        skills: ['sql', 'python', 'etl'],
      },
      {
        text: 'Led the annual performance review using statistical confidence testing, sampling, and SQL recalibration — reducing false positives by 5%, removing 5,000+ unnecessary alerts and saving 300+ investigation hours annually.',
        skills: ['stats', 'sql', 'r'],
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
