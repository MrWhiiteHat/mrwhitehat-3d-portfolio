export const profile = {
  name: 'MrWhiteHat',
  role: 'Cybersecurity Engineer · AI Developer',
  intro: 'I build security-focused tools and intelligent systems that turn complex technical problems into practical solutions.',
  location: 'India',
  email: 'your.email@example.com',
  github: 'https://github.com/MrWhiiteHat',
  linkedin: 'https://www.linkedin.com/',
  resume: '/resume.pdf',
};

export const projects = [
  {
    title: 'Mobile Security Agent',
    short: 'LLM-assisted mobile application security analysis',
    description: 'A mobile application security research project combining static analysis, reverse-engineering signals, vulnerability mapping, retrieval-augmented knowledge, and an LLM-assisted false-positive review workflow.',
    tags: ['Python', 'Android Security', 'RAG', 'Ollama'],
    link: 'https://github.com/MrWhiiteHat',
    status: 'Research project',
  },
  {
    title: 'AegisAI',
    short: 'AI-powered Discord moderation platform',
    description: 'A modular moderation platform concept using a Discord bot, API services, persistent storage, and AI-assisted content intelligence to help communities respond to risky content.',
    tags: ['TypeScript', 'Python', 'FastAPI', 'PostgreSQL'],
    link: 'https://github.com/MrWhiiteHat',
    status: 'Platform project',
  },
  {
    title: 'RealFake Detection',
    short: 'Deepfake detection web application',
    description: 'A computer-vision project for classifying manipulated facial media, with a model-serving API and a web interface for submitting media for analysis.',
    tags: ['PyTorch', 'ResNet50', 'FastAPI', 'Docker'],
    link: 'https://github.com/MrWhiiteHat',
    status: 'Deployed project',
  },
];

export const skills = [
  { group: 'Security', items: ['Mobile application security', 'Static analysis', 'Reverse engineering', 'Burp Suite', 'Wireshark'] },
  { group: 'AI / ML', items: ['Python', 'PyTorch', 'LLM integration', 'RAG', 'Model evaluation'] },
  { group: 'Development', items: ['JavaScript / TypeScript', 'React', 'Node.js', 'FastAPI', 'REST APIs'] },
  { group: 'Infrastructure', items: ['Docker', 'PostgreSQL', 'Git / GitHub', 'Vercel', 'Linux'] },
];

export const achievements = [
  { title: 'Odisha Skills — Cyber Security', detail: 'Bronze medal · 2021', note: 'Add the official event or certificate link here.' },
  { title: 'Odisha Skills — Cyber Security', detail: 'Bronze medal · 2025–2026', note: 'Add the official event or certificate link here.' },
  { title: 'BRICS Hi-Tech Future Skills', detail: 'Cybersecurity international skills development session · 2026', note: 'Add a certificate or event page if available.' },
];

export const objectMap = [
  { match: /monitor|screen|computer|keyboard|simple_desk|desk/i, section: 'projects', label: 'Workstation · Projects' },
  { match: /book|cabinet|shelf|wardrobe|box/i, section: 'skills', label: 'Bookshelf & Archives · Skills' },
  { match: /projector|meeting table|remote|clock/i, section: 'achievements', label: 'Presentation Area · Achievements' },
  { match: /chair|armchair|couch|reception/i, section: 'about', label: 'Office Lounge · About Me' },
  { match: /printer|paper/i, section: 'resume', label: 'Printer Station · Resume' },
  { match: /water|mug|phone|mobile/i, section: 'contact', label: 'Refreshment & Phone · Contact' },
];

export const hotspots = [
  { id: 'projects', label: 'Projects', position: [-1.2, 1.55, 0.15], icon: '💻' },
  { id: 'skills', label: 'Skills', position: [0.6, 2.5, -4.7], icon: '📚' },
  { id: 'achievements', label: 'Awards', position: [-4.86, 2.7, -2.0], icon: '🏆' },
  { id: 'about', label: 'About', position: [4.95, 2.8, 1.6], icon: '👤' },
  { id: 'resume', label: 'Resume', position: [-3.6, 1.45, 1.05], icon: '📄' },
  { id: 'contact', label: 'Contact', position: [-0.15, 1.15, 0.65], icon: '📞' },
];

