export const profile = {
  name: 'Sadashiba Sarangi',
  alias: 'MrWhiteHat',
  displayName: 'Sadashiba Sarangi (MrWhiteHat)',
  role: 'Cybersecurity-Focused Software Developer · AppSec & AI Engineer',
  intro:
    'Cybersecurity-focused Software Developer with expertise in Application Security (AppSec), Vulnerability Assessment, Penetration Testing, and SSDLC. 2x Bronze Medalist at Odisha Skills (Cyber Security). Experienced in LLM-powered security automation, mobile penetration testing, RAG systems, and full-stack web development. Proficient in Python, TypeScript, and JavaScript with hands-on Linux administration, network security, and OWASP compliance.',
  bio:
    'Passionate about securing digital infrastructure, reverse-engineering mobile applications, and building intelligent autonomous security agents. Combines deep offensive red-team insights with secure software development life-cycle (SSDLC) practices to engineer resilient, privacy-preserving systems.',
  location: 'Bhubaneswar, Odisha, India',
  email: 'kanhasarangi39@gmail.com',
  phone: '+91 8917512439',
  tel: '+918917512439',
  discord: 'mr.whitehat',
  discordUser: 'mr.whitehat',
  discordUrl: 'https://discord.com/users/mr.whitehat',
  github: 'https://github.com/MrWhiiteHat',
  linkedin: 'https://www.linkedin.com/in/sadashiba-sarangi/',
  resume: './Sadashiba_Sarangi_Resume.pdf',
  resumeFilename: 'Sadashiba_Sarangi_Resume.pdf',
  leadership: [
    {
      role: 'Cyber Security Club Tech Lead & Student Coordinator',
      organization: 'C.V. Raman Global University (CGU)',
      location: 'Bhubaneswar, Odisha',
      period: '2023 – Present',
      badge: 'Campus Lead & Coordinator',
      highlights: [
        'Organized and spearheaded university-wide cybersecurity bootcamps and hands-on workshops for 200+ students covering Web Application Penetration Testing (OWASP Top 10), Network Forensics, and Linux privilege escalation.',
        'Mentored junior student security teams in CTF competitions, packet analysis (Wireshark), secure code review, and vulnerability remediation.',
        'Spearheaded university participation in regional, state, and national cybersecurity initiatives, hackathons, and defense simulations.',
        'Fostered a collaborative campus security community bridging offensive red-teaming techniques with defensive SSDLC best practices.',
      ],
    },
  ],
  availability: {
    status: 'Actively Available // Open to Roles',
    badge: 'Immediate Availability',
    targetRoles: [
      'Application Security (AppSec) Engineer',
      'Penetration Tester / Security Consultant',
      'Security Software Developer',
      'AI Red Teaming & LLM Security',
    ],
    timeframes: 'Summer 2025 / 2026 Internships & Full-Time Positions',
    workPreferences: 'Remote · Hybrid · On-site (India & Global Mobility)',
    contactEmail: 'kanhasarangi39@gmail.com',
    discord: 'mr.whitehat',
  },
  education: [
    {
      institution: 'C.V. Raman Global University (CGU)',
      location: 'Bhubaneswar, Odisha',
      degree: 'Bachelor of Technology (B.Tech)',
      field: 'Computer Science and Information Technology',
      period: '2023 – Present',
      status: 'Pursuing',
    },
    {
      institution: 'C.V. Raman Polytechnic',
      location: 'Bhubaneswar, Odisha',
      degree: 'Diploma',
      field: 'Computer Science Engineering',
      period: 'August 2019 – April 2023',
      status: 'Completed',
    },
  ],
  certifications: [
    {
      title: '3rd Position (Bronze Medal) — Odisha Skills Competition 2025–2026',
      track: 'Cyber Security',
      issuer: 'Skill Development & Technical Education Department, Govt. of Odisha',
      year: '2025–2026',
      details:
        'Evaluated on incident response, network traffic forensics, system hardening, and web application exploitation under competitive live-fire environments.',
    },
    {
      title: '3rd Position (Bronze Medal) — Odisha Skills Competition 2020–2021',
      track: 'Cyber Security',
      issuer: 'Skill Development & Technical Education Department, Govt. of Odisha',
      year: '2020–2021',
      details:
        'Demonstrated state-level proficiency in penetration testing, vulnerability assessment, cryptography, and defensive packet forensics.',
    },
    {
      title: 'BRICS Hi-Tech Future Skills Development Program',
      track: 'International Cybersecurity Skills Initiative',
      issuer: 'BRICS Future Skills Development & Technology Innovation Workgroup',
      year: '2026',
      details:
        'Represented technical skill in international future skills initiative focused on resilient digital infrastructure, AI security, and cross-border defense.',
    },
  ],
  additionalExperience: [
    {
      title: 'Web Application Exploitation & Bug Hunting',
      description:
        'Hands-on exploitation of SQL Injection (SQLi), Cross-Site Scripting (XSS), Authentication Bypass, and Privilege Escalation in CTF competitions and vulnerability research.',
    },
    {
      title: 'Network Forensics & PCAP Telemetry',
      description:
        'Deep packet inspection using Wireshark, traffic anomaly detection, Linux privilege escalation, system hardening labs, and custom iptables rule enforcement.',
    },
    {
      title: 'SSDLC & Vulnerability Management',
      description:
        'Secure Software Development Lifecycle compliance, automated SAST/DAST scanning pipelines, OWASP Mobile Top 10 (2024), and OWASP API Top 10 (2023) benchmarking.',
    },
  ],
};

export const projects = [
  {
    id: 'mobile-sec-agent',
    title: 'LLM-Based Autonomous Mobile App Security Penetration Testing Agent',
    short: '10-phase autonomous Android APK penetration testing pipeline with local Ollama RAG reasoning',
    period: '2025 – 2026',
    status: 'Flagship Research Project',
    type: 'Personal Project',
    link: 'https://github.com/MrWhiiteHat/LLM-Powered-Autonomous-Mobile-Application-Security-Penetration-Testing-Platform',
    tags: [
      'Python',
      'FastAPI',
      'Frida',
      'Ollama',
      'RAG',
      'Qwen 2.5-Coder',
      'Android Security',
      'ADB',
      'OWASP Mobile Top 10',
    ],
    highlights: [
      'Architected a 10-phase autonomous security scanning pipeline for Android APK vulnerability detection using Python, FastAPI, and Frida, achieving a 94.2% detection rate with only 7.8% false positives.',
      'Engineered a Retrieval-Augmented Generation (RAG) engine indexing 2,075 security documents (OWASP, CWE, CAPEC, NVD) with BM25 and TF-IDF hybrid retrieval and Reciprocal Rank Fusion for context-grounded LLM reasoning.',
      'Integrated Ollama-hosted Qwen 2.5-Coder LLM (1.5B parameters) for vulnerability classification, false-positive filtering, and automated remediation code patch generation.',
      'Implemented dynamic runtime analysis using Frida instrumentation and ADB for hooking Android API calls; achieved full OWASP Mobile Top 10 (2024) and OWASP API Top 10 (2023) coverage across 104 real-world applications.',
      'Designed a 100% privacy-preserving architecture with zero cloud dependency – all LLM inference and data processing executed locally via Ollama.',
    ],
    description:
      'A mobile application security research project combining static analysis, reverse-engineering signals, vulnerability mapping, retrieval-augmented knowledge, and an LLM-assisted false-positive review workflow. Achieves 94.2% detection rate with 100% offline, privacy-preserving local LLM inference.',
  },
  {
    id: 'aegis-ksecurity',
    title: 'AegisAI / KSecurity – AI-Powered Community Threat Intelligence Platform',
    short: 'Real-time AI threat detection protecting Discord communities with 3 parallel analyzers and GPT-4o-mini',
    period: '2025',
    status: 'Platform Project',
    type: 'Personal Project',
    link: 'https://github.com/MrWhiiteHat/KSecurity-Ai-Intelligence-Discord-bot',
    tags: [
      'TypeScript',
      'Next.js 14',
      'Node.js',
      'OpenAI API',
      'PostgreSQL',
      'Docker',
      'Railway CI/CD',
    ],
    problem:
      'Online communities and enterprise workspaces face sophisticated phishing, impersonation scams, and malicious link dissemination that bypass traditional static regex filters.',
    solution:
      'Engineered an autonomous AI triage pipeline combining an OpenAI GPT-4o-mini message classifier, an algorithmic URL typosquatting engine across 10+ brands, and a Jaccard behavioral similarity tracker with weighted risk scoring.',
    highlights: [
      'Built a real-time AI-powered threat detection platform protecting Discord communities from phishing and social engineering using three parallel analyzers with weighted composite risk scoring.',
      'Integrated OpenAI GPT-4o-mini for real-time message classification across 6 threat categories with a 3-second circuit breaker and automatic heuristic fallback for zero downtime.',
      'Engineered a URL phishing analysis engine with typosquatting detection for 10+ brands and a behavioral anomaly tracker with Jaccard similarity for burst spam monitoring and account-age risk scoring.',
      'Built a Next.js 14 admin dashboard with JWT authentication, real-time threat telemetry analytics, and audit logs; orchestrated with Docker Compose and Railway CI/CD.',
    ],
    description:
      'A modular moderation and threat intelligence platform using Discord bot services, persistent PostgreSQL storage, and AI-assisted content intelligence to mitigate phishing, brand impersonation, and social engineering in high-volume communities.',
  },
  {
    id: 'realfake-detection',
    title: 'RealFake Detection – Deepfake Media Analysis Platform',
    short: 'Computer-vision pipeline for classifying manipulated facial media with FastAPI inference API and Docker',
    period: '2024 – 2025',
    status: 'Deployed Research Project',
    type: 'Personal Project',
    link: 'https://github.com/MrWhiiteHat',
    tags: [
      'Python',
      'PyTorch',
      'ResNet50',
      'Computer Vision',
      'FastAPI',
      'Docker',
      'Facial Forensics',
    ],
    problem:
      'Rapid proliferation of AI-generated deepfake synthetic media creates significant authentication, disinformation, and identity fraud vulnerabilities.',
    solution:
      'Engineered a computer-vision classification pipeline utilizing a fine-tuned ResNet50 neural architecture with frequency-domain artifact analysis and a high-throughput FastAPI inference microservice.',
    highlights: [
      'Developed a deepfake media classifier trained on benchmark facial forensics datasets to detect subtle GAN/diffusion boundary distortions and eye/facial frequency inconsistencies.',
      'Constructed a containerized FastAPI REST inference service packaged via Docker for high-concurrency media ingestion and classification.',
      'Built an interactive submission interface allowing users to upload suspicious media and inspect localized heatmap confidence scores.',
    ],
    description:
      'A computer-vision project for classifying manipulated facial media, featuring a fine-tuned ResNet50 model, a model-serving API with Docker containerization, and a responsive interface for inspecting forensic confidence indicators.',
  },
  {
    id: 'krishimitra-assistant',
    title: 'KrishiMitra – Multimodal AI-Powered Agricultural Assistant',
    short: 'Multimodal WhatsApp advisory assistant for farmers with Gemini NLP, MobileNetV2 CNN (94.7%), and Whisper',
    period: '2025',
    status: 'Deployed Production System',
    type: 'Personal Project',
    link: 'https://github.com/MrWhiiteHat/AI-Powered-Agricultural-Advisory-Chatbot-for-Indian-Farmers',
    tags: [
      'Python',
      'FastAPI',
      'Google Gemini',
      'TensorFlow',
      'MobileNetV2',
      'OpenAI Whisper',
      'Twilio',
      'MongoDB',
      'Redis',
    ],
    highlights: [
      'Led development of a multimodal AI chatbot deployed on WhatsApp (via Twilio) providing real-time agricultural advisory to Indian farmers, routing text, image, and audio to independent AI pipelines – Gemini for NLP, MobileNetV2 CNN (94.7% accuracy on 54,000+ images), and Whisper for speech-to-text.',
      'Engineered zero-shot prompt guardrails achieving 0% out-of-domain hallucination rate; integrated weather APIs and a RAG-based knowledge retrieval engine for government scheme eligibility.',
      'Resolved production bottlenecks: mitigated Twilio 15-second webhook timeouts via async job queues, eliminated HTTP 429 rate-limit exhaustion with Redis caching layer, and tuned MongoDB connection pooling for high-concurrency throughput.',
    ],
    description:
      'A multimodal agricultural intelligence chatbot deployed on WhatsApp, featuring sub-second asynchronous response processing, crop disease computer-vision diagnosis with 94.7% accuracy, voice queries via Whisper, and zero-hallucination guardrails.',
  },
  {
    id: 'neuroflux-input',
    title: 'NeuroFlux – Multimodal Real-Time Input Pipeline',
    short: 'Real-time hand gesture tracking and speech command capture pipeline deployed on Vercel',
    period: '2025',
    status: 'Live Web Application',
    type: 'Personal Project',
    link: 'https://neuroflux-alpha.vercel.app',
    demoLink: 'https://neuroflux-alpha.vercel.app',
    tags: [
      'TypeScript',
      'React 18',
      'Computer Vision',
      'Speech Recognition',
      'WebSockets',
      'Vercel',
      'Tailwind CSS',
    ],
    highlights: [
      'Engineered an ultra-low-latency browser-based multimodal interaction pipeline combining real-time camera hand gesture classification with live voice command recognition.',
      'Constructed modular streaming input adapters enabling hands-free, voice-assisted control for security monitoring dashboards and automated workspaces.',
      'Deployed live on Vercel with responsive mobile and desktop client interfaces.',
    ],
    description:
      'A real-time multimodal interaction system combining computer-vision hand gesture tracking with speech recognition pipelines to provide hands-free control and telemetry routing in cyber operations environments.',
  },
];

export const skills = [
  {
    group: 'Cybersecurity & AppSec',
    items: [
      'Application Security (AppSec)',
      'Mobile Pen Testing (Android)',
      'Static & Dynamic Analysis',
      'Frida Instrumentation & ADB',
      'Vulnerability Assessment (VAPT)',
      'OWASP Mobile Top 10 (2024)',
      'OWASP API Top 10 (2023)',
      'Burp Suite & OWASP ZAP',
      'Wireshark & PCAP Forensics',
      'Metasploit & Nmap Recon',
      'Linux Hardening & Privilege Escalation',
      'Secure SDLC (SSDLC)',
    ],
  },
  {
    group: 'AI & Machine Learning',
    items: [
      'Local LLM Deployment (Ollama)',
      'Qwen 2.5-Coder (1.5B Parameters)',
      'Retrieval-Augmented Generation (RAG)',
      'Hybrid Retrieval (BM25 + TF-IDF + RRF)',
      'Google Gemini API',
      'OpenAI API (GPT-4o-mini)',
      'TensorFlow & CNN (MobileNetV2)',
      'OpenAI Whisper (Audio/Speech-to-Text)',
      'LangChain & Prompt Guardrails',
      'Vector Embeddings & Semantic Search',
    ],
  },
  {
    group: 'Full-Stack Development',
    items: [
      'Python (FastAPI, AsyncIO, PyTorch)',
      'TypeScript & Modern JavaScript (ESNext)',
      'Next.js 14 (App Router, Server Actions)',
      'React 18 & Three.js / R3F',
      'Node.js & Express.js',
      'Tailwind CSS & Modern UI',
      'REST APIs & Webhooks Architecture',
      'Java & Bash Shell Scripting',
      'SQL & Schema Optimization',
    ],
  },
  {
    group: 'DevOps & Infrastructure',
    items: [
      'Docker & Docker Compose',
      'PostgreSQL & MongoDB',
      'Redis In-Memory Caching',
      'GitHub Actions CI/CD Pipelines',
      'Kali Linux, Ubuntu & Windows',
      'Railway PaaS Deployment',
      'Git Version Control & Monorepo',
      'Zero-Trust Network Hardening',
    ],
  },
];

export const achievements = [
  {
    title: '3rd Position (Bronze Medal) — Odisha Skills Competition',
    detail: 'State Championship · Cyber Security · 2025–2026',
    issuer: 'Skill Development & Technical Education Department, Govt. of Odisha',
    note: 'Awarded Bronze Medal for state-level cybersecurity excellence: live network defense, CTF exploitation, vulnerability analysis, and incident response under competitive constraints.',
    year: '2025–2026',
    level: 'State Championship',
  },
  {
    title: '3rd Position (Bronze Medal) — Odisha Skills Competition',
    detail: 'State Championship · Cyber Security · 2020–2021',
    issuer: 'Skill Development & Technical Education Department, Govt. of Odisha',
    note: 'Recognized as state bronze medalist in cyber defense: infrastructure hardening, packet capture forensics, network traffic telemetry, and vulnerability remediation.',
    year: '2020–2021',
    level: 'State Championship',
  },
  {
    title: 'BRICS Hi-Tech Future Skills Development Program',
    detail: 'International Cybersecurity Skills Development · 2026',
    issuer: 'BRICS Future Skills Development & Technology Innovation Workgroup',
    note: 'Selected to participate in the prestigious international cybersecurity future skills initiative, collaborating on next-generation digital defense and cross-border cyber resilience.',
    year: '2026',
    level: 'International Program',
  },
];

export const objectMap = [
  { match: /drone|hologram|sentinel|operator|whitehat/i, section: 'operator', label: 'MrWhiteHat · Operative Hologram' },
  { match: /monitor|screen|computer|keyboard|simple_desk|desk/i, section: 'projects', label: 'Workstation · Projects' },
  { match: /book|cabinet|shelf|wardrobe|box/i, section: 'skills', label: 'Bookshelf & Archives · Skills' },
  { match: /projector|meeting table|remote|clock/i, section: 'achievements', label: 'Presentation Area · Achievements' },
  { match: /chair|armchair|couch|reception/i, section: 'about', label: 'Office Lounge · About Me' },
  { match: /printer|paper/i, section: 'resume', label: 'Printer Station · Resume' },
  { match: /water|mug|phone|mobile|phonecall/i, section: 'contact', label: 'Refreshment & Phone · Contact' },
];

export const hotspots = [
  { id: 'projects', label: 'Projects', position: [-1.2, 1.55, 0.15], icon: '💻' },
  { id: 'skills', label: 'Skills', position: [0.6, 2.5, -4.7], icon: '📚' },
  { id: 'achievements', label: 'Awards', position: [-4.86, 2.7, -2.0], icon: '🏆' },
  { id: 'about', label: 'About', position: [4.95, 2.8, 1.6], icon: '👤' },
  { id: 'resume', label: 'Resume', position: [-3.6, 1.45, 1.05], icon: '📄' },
  { id: 'contact', label: 'Contact', position: [3.75, 1.45, -1.25], icon: '📞' },
  { id: 'operator', label: 'MrWhiteHat', position: [-2.75, 1.85, -3.45], icon: '🛡️' },
];
