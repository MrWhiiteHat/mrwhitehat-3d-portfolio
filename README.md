# 🛡️ MrWhiteHat // 3D Interactive Cyber Command Portfolio & CTF CyberOS

[![Live Deployment](https://img.shields.io/badge/Live%20Demo-Online%2024%2F7-00ffcc?style=for-the-badge&logo=googlechrome&logoColor=black)](https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/)
[![Three.js](https://img.shields.io/badge/Three.js-r172-black?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/R3F-8.17-white?style=for-the-badge&logo=three.js&logoColor=black)](https://docs.pmnd.rs/react-three-fiber)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Neural%20Audio-orange?style=for-the-badge&logo=soundcharts&logoColor=white)](https://elevenlabs.io/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)](LICENSE)

> **Live Production URL:** 🌐 [https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/](https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/)

An immersive, production-grade **3D Cybersecurity Operations Studio, In-Browser Kali CyberOS, and Developer Portfolio** engineered by **Sadashiba Sarangi (MrWhiteHat)**. Built with **Three.js, React Three Fiber, WebGL, and Tailwind CSS**, this experience fuses offensive red-teaming aesthetics with a fully interactive cyber command environment, tactile first-person locomotion, an authentic Kali Linux CyberOS workstation, 14 live CTF challenges with automated cryptographic validation, dual-persona ElevenLabs sarcastic voice acting, and an instant Executive Recruiter Dossier.

---

## ⚡ Key Highlights & Architectural Features

### 🕹️ First-Person Tactical Free-Roam Locomotion
- **FPS Controller with Pointer Lock**: Smooth WASD movement mapped directly to the camera's directional vector with pitch/yaw mouse look.
- **AABB Collision Physics Engine**: Real-time bounding-box collision detection preventing clipping through office desks, chairs, server racks, bookcases, and perimeter walls.
- **Adaptive Mobile Touch Controls**: On-screen tactical virtual D-pad and responsive touch joystick with adaptive sensitivity for mobile and tablet visitors.
- **Proximity Raycasting**: Proximity sensors highlight interactive terminals, hardware gadgets, and workstations as the operative approaches.

---

### 💻 Kali Cyber-OS Desktop & Professional Security Suite
Integrated directly into the portfolio is a full-featured, retro-futuristic **CyberOS Desktop Environment** equipped with realistic offensive security and forensic tooling:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [APPLICATIONS]   [>_ Kali]   [Wireshark]   [Burp]   [Ghidra]  ...      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  >_ Kali Bash Terminal       Interactive CLI with VFS & real tools     │
│  🌐 Burp Suite v2026.1        Repeater, Intruder (Fuzzer), Timing      │
│  ⚡ Ghidra & GDB Debugger     x86 Disassembly, Live Registers, Stack   │
│  📊 Wireshark Analyzer        PCAP Dissection, Hex Inspector, Streams  │
│  🔑 CyberChef Workbench       Chained Modular Recipe Cryptanalysis     │
│  🎛️ PulseView Logic           Hardware UART Waveforms & Baud Sync      │
│  📻 SonicVisualizer           Audio Spectrogram & DSP High-Pass        │
│  🚩 CTF Mission Control       Real-time scoring, hints & writeups      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### 1. Kali Linux Bash Terminal (`CyberOSTerminal.jsx`)
- **Realistic Virtual Filesystem (VFS)**: Complete directory structure including `/challenges/pwn/`, `/challenges/web/`, `/challenges/crypto/`, `/challenges/forensics/`, `/challenges/reverse/`, `/etc/passwd`, `/etc/hosts`, and `.bash_history`.
- **Authentic Hacker CLI Utilities**:
  - `nmap` / `scan`: Port scanning against subnet `10.0.0.0/24` and `10.0.0.80` revealing open services (FTP, SSH, HTTP, MySQL, Sentinel Gateway).
  - `curl`: Probes HTTP endpoints with support for headers, JSON responses, and live SQL injection exploitation (`curl "http://10.0.0.80/api/v1/accounts?username=' OR 1=1--"`).
  - `strings`: Extracts printable ASCII/UTF-8 strings from compiled binaries (`vuln_server`, `sentinel_daemon`).
  - `file`: Determines ELF 64-bit headers, pcap-ng captures, C source, and script types.
  - `hexdump` / `xxd`: Canonical 16-byte hex dump with byte offsets and ASCII side-by-side display.
  - `base64`: Direct `-d` decoding and encoding right from the CLI.
  - `python3`: One-liner execution (`python3 -c "print('A'*24 + ...)"`) and script execution.
  - `ps`, `top`, `ping`, `netstat`/`ss`, and `gdb`.
- **Shell Productivity**: Tab-key autocompletion for commands and files, with Up/Down arrow command history.

#### 2. Burp Suite Community Edition (`BurpSuiteApp.jsx`)
- **HTTP Repeater**: Dual-mode request editor (Param-based or Raw HTTP RFC format).
- **HTTP Intruder (Parameter Fuzzer)**:
  - Sniper attack mode with payload injection markers (`§alice§`).
  - Wordlist presets for **SQL Injection** and **IDOR / User Enumeration**.
  - Multithreaded fuzzing attack runner with live progress and anomaly detection (highlighting anomalous byte lengths and response status codes).
  - Click-to-inspect result rows with raw Request/Response split viewer and one-click flag copying.
- **Timing Oracle**: Side-channel timing attack analyzer measuring microsecond latency deltas on non-constant-time string comparisons.
- **Decoder Workbench**: Quick-access Base64, Hex, and URL encoding/decoding.

#### 3. Ghidra & GDB Workbench (`GhidraGdbApp.jsx`)
- **Live x86_64 CPU Registers Panel**: Dynamically monitors `RIP`, `RBP`, `RSP`, `RAX`, and `RDI` with real-time color highlights as instructions execute or memory is corrupted.
- **Dynamic Stack Frame Memory Visualizer**: Visual diagram showing the 16-byte local buffer, 8-byte saved RBP, and 8-byte saved RIP with real-time feedback on payload overflow into `win()`.
- **Instruction Stepper**: `Step [SI]` single-step execution alongside full sandbox execution.
- **Opcode Patcher**: Real-time assembly patching (e.g. neutralizing anti-debug conditional jump `74 12` with `90 90` NOP NOP).

#### 4. Wireshark Packet Analyzer (`WiresharkApp.jsx`)
- **Interactive Hex & ASCII Inspector**: 16-byte offset rows with interactive cross-hair byte inspection (hovering or clicking on hex bytes highlights both hex and ASCII, showing offset, hex, decimal, and character).
- **Wireshark Filter Engine**: Supports `http`, `dns`, `tcp`, `arp`, `tcp.port == 80`, `frame contains "FLAG"`, and `post`.
- **Follow TCP Stream**: Reconstructed full bidirectional TCP conversations with one-click credential extraction.

#### 5. CyberChef Cryptanalysis Suite (`CyberChefApp.jsx`)
- **Chained Modular Recipe Pipeline**: Sequential pipeline supporting Caesar Cipher (with interactive shift slider and presets), ROT13, XOR with secret key, From/To Base64, From/To Hex, URL Encode/Decode, and Reverse.
- **Real-Time Auto-Baking**: Instant plaintext preview with automatic flag detection and one-click submission.

#### 6. PulseView Logic Analyzer & SonicVisualizer
- **PulseView**: Live digital signal waveforms, hardware pinout tracing (CH0, GND), baud rate synchronization (115200 8-N-1), and UART serial console exfiltration.
- **SonicVisualizer**: Real-time spectral waterfall canvas, carrier frequency tuning (142.8 kHz), Butterworth DSP high-pass filtering, and ultrasonic spectral watermark demodulation.

---

### 🎯 Unified Cybersecurity CTF Challenge Platform (`Key: C`)
Transformed all interactive office stations and hidden Easter eggs into a professional Capture The Flag (CTF) challenge playground covering 8 cybersecurity disciplines across 4 difficulty levels with SHA-256 hashed verification:

| # | Challenge Name | Discipline | Difficulty | Points | Target Station |
| :-: | :--- | :--- | :-: | :-: | :--- |
| **01** | **Operation Caesar: The Red Team Shift Cipher** | Cryptography | `EASY` | 100 PTS | `about` |
| **02** | **Silicon Evidence: UART Pinout & Flash Dump** | Forensics | `EASY` | 150 PTS | `resume` |
| **03** | **Deconstructed Payload: DuckyScript & HID Injection** | Reverse Eng | `EASY` | 150 PTS | `hardware_arsenal` |
| **04** | **Physical Recon: Dropped USB Firmware Exfiltration** | Forensics | `EASY` | 100 PTS | `desk gadgets` |
| **05** | **Stack Smash: Matrix Return Address Hijack** | Pwn / BinExp | `MEDIUM` | 200 PTS | `skills` |
| **06** | **Packet Infiltration: DNS Tunneling & PCAP Analysis** | Forensics | `MEDIUM` | 250 PTS | `wireshark_monitor` |
| **07** | **Firewall Breach: SQL Injection & WAF Filter Evasion** | Web Exploitation | `MEDIUM` | 250 PTS | `projects` / `burp` |
| **08** | **Phantom Frequency: Audio Spectrogram Demodulation** | Steganography | `MEDIUM` | 200 PTS | `contact` |
| **09** | **Acoustic Eavesdropping: Thermal Vent Metadata Carrier** | Steganography | `MEDIUM` | 200 PTS | `ceiling vent` |
| **10** | **Side-Channel Probe: Time-Based String Enumeration** | Web Exploitation | `HARD` | 350 PTS | `operator` |
| **11** | **Subnet Pivoting: Active Directory DC Infiltration** | Network Sec | `HARD` | 350 PTS | `server_rack` |
| **12** | **Binary Patching: Anti-Debugging Bypass** | Reverse Eng | `HARD` | 400 PTS | `secret_vault` |
| **13** | **Zero-Day Exploit: Heap Overflow & Use-After-Free** | Pwn / BinExp | `EXPERT` | 500 PTS | `secret_vault` |
| **14** | **Ghost in the Grid: Deep OSINT & Shadow Recon** | OSINT | `EXPERT` | 500 PTS | `bunker laptop` |

- **SHA-256 Hashed Flag Validation**: Flags (`FLAG{...}`) are verified client-side using pure JavaScript SHA-256 hashes without exposing plaintext flags in the DOM.
- **Persistent Progression & Badges**: LocalStorage state tracking with 9 unlockable achievement badges.
- **Recruiter Fast View / DEV BYPASS**: Every station retains an instant Recruiter Bypass option so non-technical or executive visitors can browse the portfolio resume and projects without completing the challenge.
- **Automated Verification**: Full automated test suite (`tests/test_ctf_engine.js`) verifying all flag hashes, submission logic, hint penalties, and station unlock synchronization.

---

### 🎙️ Dual-Persona Studio Voice Engine & ElevenLabs Neural TTS
Upgraded from robotic browser speech to ultra-realistic, studio-grade neural voice acting powered by **ElevenLabs**:
- **Desi Mom Persona (`Sarah` - Hyper-Expressive Neural Voice)**:
  - Hilarious, high-strung, sarcastic Indian mother roasting the operative for bypassing mainframes while failing basic vegetable errands.
  - Authentic Hinglish delivery with dynamic emotional range: scolding phone calls, WhatsApp voice notes, and threat escalations.
- **Deadpan BBC Narrator (`Daniel` - Authoritative British Voice)**:
  - Documentary-style voiceover delivering dry, serious, comedic contrast to Mom's furious outbursts.
  - Officially recites evaluation findings, telemetry breakdowns, and tactical advice.
- **Procedural Web Audio SFX Suite**:
  - Integrated custom sound effects: Dhaniya fanfare trumpets, cash register dings, pressure cooker whistles, sad sarcastic trombones, digital shock chimes, rejection buzzers, retro ringtones, and aerodynamic slipper whooshes.

---

### 🕵️‍♂️ 3D Circuit Hacking Easter Egg & Secret Bunker
Unlocks after completing portfolio stations or discovering the classified air-gap breach:
- **Multiple Discovery Methods**:
  - ⌨️ **Keyboard Shortcut**: Type `mrwhite` or `hack` anywhere on your keyboard.
  - 💻 **Terminal Command**: Type `white` or `mrwhite` into the Kali Bash Terminal.
  - 👤 **Interactive Avatar**: Tap/click the 3D operator avatar 5 times.
- **3D Spatial Circuit Network**: Inspired by *Watch Dogs 2*, features high-voltage power conduits mapped to the room's walls, ceiling, and floor with strictly orthogonal Manhattan-grid topology. Features interactive rotatable switch junctions (straight, elbow, T-splitter), security padlocks, hostile IDS nodes, and synchronized directional flow chevrons.
- **3 Progressive Hacker Stages**: Escalating network complexity with interactive stage selectors, camera vantage presets, and quick auto-solve controls (`[F]`).
- **Cinematic Quantum Teleportation Warp Engine**: Fullscreen sci-fi hyperspace warp sequence with radiating energy rings, digital glitch scanlines, telemetry HUD, and synthesized sub-bass & laser shimmer audio (`playTeleportWarp()`) that transports the operative away from the office studio into an isolated underground facility.
- **Dedicated Standalone 360° Secret Bunker Room**:
  - Completely isolated underground chamber: 7m × 7m heavy steel plating, perimeter safety hazard stripes, emerald green LED sub-floor ventilation grates, recessed server racks with blinking LEDs, and an overhead dangling tungsten cage lamp.
- **The Ridiculous Discovery & In-Laptop Window Operating System**:
  - Detailed 3D assets: Folding utility table, blue swivel chair draped with an authentic pile of unfolded laundry, open 3D gaming laptop with backlit chiclet keyboard & glowing matrix code, steaming Maggi ramen bowl with **live rising 3D steam particles**, holy bunch of fresh dhaniya (coriander) with red rubber band, two fresh glossy green chillies (mirchi), and shiny golden ₹10 coin.
  - **In-Laptop Window Manager**:
    - **Phase 1: Incoming Satellite Emergency Call**: Urgent retro phone call from Mom demanding why you haven't bought coriander yet.
    - **Phase 2: Terminal Reality Check**: BBC Narrator roasting the hacker's priorities with interactive dialogue chips.
    - **Phase 3: Leaked WhatsApp Audio Notes**: Interactive audio player featuring 3 voicemail dispatches from Mom (*Emergency Sabzi*, *DEFCON 1 Chappal*, *Sharma Ji's Son*).
    - **Phase 4: Official Evaluation Report (`Official_Evaluation_Report.pdf`)**: Interactive soundboard stat cards with narrator voice commentary.
    - **Sarcastic Meme Gallery**: Dynamic 5-meme carousel (*Cyber Hacker vs Mom*, *Matrix vs Sabzi*, *Sharma Ji's Son*, *Dhaniya vs Pudina Crisis*, *DEFCON 1 Radar*).
  - **3D Tactical Flying Indian Chappal (Hawai Slipper 🩴)**: Programmed with **real 3D supersonic Bezier ballistic trajectory physics** that swoops right past the camera at Mach 3.4 when Mom's wrath is provoked!

---

### 📋 Executive Recruiter Quick-Access Dossier (`Key: R`)
- Press **`R`** on the keyboard or tap the floating **Executive Dossier** badge for an instant 2D recruiter-optimized modal.
- Provides immediate access to resume highlights, candidate summary, flagship project case studies, verified achievements, and direct communication channels—ideal for recruiters who need high-signal information without navigating 3D space.

### 📱 Full View & Mobile Responsive Architecture
- **Optimized 3D Camera Angles**: Hand-calibrated zoom distance factors ensure crisp readability for the Laser Printer Output Tray (Resume) and Archive Bookcase (Skills Competency Matrix).
- **Responsive Station Cards**: Adaptive bottom modals and floating action bars with zero viewport clipping across portrait smartphones, tablets, and 4K monitors.

---

## 🎮 Locomotion & Control Reference

| Input | Action |
| :--- | :--- |
| **`W`** / **`↑`** | Walk Forward (aligned with camera gaze) |
| **`S`** / **`↓`** | Walk Backward |
| **`A`** / **`←`** | Strafe Left |
| **`D`** / **`→`** | Strafe Right |
| **`Shift`** | Sprint / Tactical Rush |
| **`Mouse Move`** | Look Around (click canvas to lock cursor) |
| **`Left Click`** / **`E`** | Interact / Hack / Inspect targeted terminal |
| **`C`** | Open CyberOS / CTF Mission Control |
| **`R`** | Open Executive Recruiter Dossier |
| **`M`** | Toggle Procedural Audio Synthesis |
| **`Esc`** | Unlock Cursor / Close Modal / Open Main Menu |
| **`Type "mrwhite" / "hack"`** | Keyboard Easter Egg trigger |
| **`F` (in Hacker Mode)** | Instant auto-solve / bypass circuit puzzle stage |
| **`Touch Joystick / D-Pad`** | Full mobile and tablet on-screen locomotion |

---

## 🛠️ Technology Stack

```
Frontend Architecture      React 18.3 · Modern ESNext · HTML5 / CSS3 · Tailwind CSS
3D Scene & Rendering       Three.js (r172) · React Three Fiber (@react-three/fiber)
3D Helpers & Controls      React Three Drei (@react-three/drei)
Physics & Particle Engine  AABB Collision Physics · Bezier Ballistics · 3D Steam Particles
Motion & Transitions       Framer Motion 11 · Quantum Warp Glitch Shaders
Audio & Voice Acting       ElevenLabs Neural Voice (Sarah & Daniel) · Web Audio API
Cyber Tools & Simulation   Raw HTTP Repeater · Parameter Fuzzer · Packet Dissector · x86 Stepper
Iconography & Visuals      Lucide React · Canvas 2D Oscilloscope · FFT Spectrogram
Testing & Validation       Node.js Automated Test Suite · Pure JS SHA-256 Hashing
Build Tooling & Bundler    Vite 6.0
Hosting & Deployment       GitHub Pages (Automated via gh-pages)
```

---

## 🏆 Featured Flagship Projects

### 1. [LLM Autonomous Mobile AppSec Penetration Testing Agent](https://github.com/MrWhiiteHat/LLM-Powered-Autonomous-Mobile-Application-Security-Penetration-Testing-Platform)
- **Tech Stack:** `Python` · `FastAPI` · `Frida` · `Ollama` · `RAG` · `Qwen 2.5-Coder` · `ADB` · `OWASP Mobile Top 10`
- **Impact:** 10-phase autonomous Android APK security scanning pipeline achieving a **94.2% detection rate** with only 7.8% false positives.
- **Key Innovation:** Custom RAG engine indexing 2,075 security documents (OWASP, CWE, CAPEC, NVD) with BM25/TF-IDF hybrid retrieval and 100% offline, privacy-preserving local LLM inference via Ollama.

### 2. [AegisAI / KSecurity – AI Community Threat Intelligence Platform](https://github.com/MrWhiiteHat/KSecurity-Ai-Intelligence-Discord-bot)
- **Tech Stack:** `TypeScript` · `Next.js 14` · `Node.js` · `OpenAI API (GPT-4o-mini)` · `PostgreSQL` · `Docker`
- **Impact:** Real-time threat detection system protecting Discord communities from phishing, brand impersonation, and social engineering.
- **Key Innovation:** 3 parallel analyzers with weighted risk scoring, 3-second LLM circuit-breaker with heuristic fallback, and brand typosquatting detection across 10+ major brands.

### 3. [RealFake Detection – Deepfake Media Analysis Platform](https://github.com/MrWhiiteHat)
- **Tech Stack:** `Python` · `PyTorch` · `ResNet50` · `Computer Vision` · `FastAPI` · `Docker`
- **Impact:** Neural computer-vision classifier detecting subtle GAN/diffusion boundary distortions and frequency artifacts in facial synthetic media with containerized high-throughput REST inference.

### 4. [KrishiMitra – Multimodal AI Agricultural Advisory Assistant](https://github.com/MrWhiiteHat/AI-Powered-Agricultural-Advisory-Chatbot-for-Indian-Farmers)
- **Tech Stack:** `Python` · `FastAPI` · `Google Gemini` · `TensorFlow` · `MobileNetV2` · `Whisper` · `Twilio` · `Redis`
- **Impact:** Multimodal WhatsApp advisory bot serving Indian farmers, pairing MobileNetV2 CNN (**94.7% crop disease accuracy** across 54k images) with zero-hallucination Gemini prompt guardrails and async webhook queues.

### 5. [NeuroFlux – Multimodal Real-Time Input Pipeline](https://neuroflux-alpha.vercel.app)
- **Tech Stack:** `TypeScript` · `React 18` · `Computer Vision` · `WebSockets` · `Tailwind CSS` · `Vercel`
- **Impact:** Ultra-low-latency browser gesture classification and live voice command recognition pipeline for hands-free control and telemetry routing in cyber operations centers.

---

## 🎖️ Honors & State Competitions

- 🥉 **Bronze Medal (3rd Position) — Odisha Skills Competition 2025–2026**
  - *Track:* Cyber Security
  - *Issuer:* Skill Development & Technical Education Department, Govt. of Odisha
  - Evaluated on live-fire incident response, packet capture forensics, system hardening, and web application exploitation under competitive constraints.
- 🥉 **Bronze Medal (3rd Position) — Odisha Skills Competition 2020–2021**
  - *Track:* Cyber Security
  - *Issuer:* Skill Development & Technical Education Department, Govt. of Odisha
  - State-level recognition in vulnerability assessment, penetration testing, cryptography, and network defense.
- 🌐 **BRICS Hi-Tech Future Skills Development Program (2026)**
  - *Track:* International Cybersecurity Skills Development
  - Represented technical proficiency in international future skills initiative focused on resilient digital infrastructure and AI defense.

---

## 💻 Local Development & Installation

### Prerequisites
- **Node.js 18.18+** (Node 20+ LTS recommended)
- **npm** or **yarn**

### Quickstart
```bash
# 1. Clone the repository
git clone https://github.com/MrWhiiteHat/mrwhitehat-3d-portfolio.git

# 2. Navigate to project root
cd mrwhitehat-3d-portfolio/mrwhitehat-3d-portfolio

# 3. Install dependencies
npm install

# 4. Run automated CTF engine verification suite
node tests/test_ctf_engine.js

# 5. Start local development server
npm run dev
```

Open the local development URL printed by Vite (typically `http://localhost:5173`).

---

## 📦 Production Build & Deployment

### Build Locally
```bash
# Build optimized production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

### 1-Command Deploy to GitHub Pages
```bash
npm run deploy
```
*This command executes `vite build` followed by `npx gh-pages -d dist`, pushing the compiled production assets directly to the `gh-pages` branch.*

---

## 👤 Author & Connect

**Sadashiba Sarangi (MrWhiteHat)**  
*Cybersecurity-Focused Software Developer · AppSec & AI Engineer*  
📍 Bhubaneswar, Odisha, India

- 🌐 **Interactive Portfolio:** [https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/](https://mrwhiitehat.github.io/mrwhitehat-3d-portfolio/)
- 💻 **GitHub:** [@MrWhiiteHat](https://github.com/MrWhiiteHat)
- 💼 **LinkedIn:** [linkedin.com/in/sadashiba-sarangi](https://www.linkedin.com/in/sadashiba-sarangi/)
- 💬 **Discord:** `mr.whitehat`
- 📧 **Email:** [kanhasarangi39@gmail.com](mailto:kanhasarangi39@gmail.com)

---

## ⚖️ License & Intellectual Property

Copyright © 2026 **Sadashiba Sarangi (MrWhiteHat)**. All Rights Reserved.

This repository and all original code, custom 3D shaders, dynamic procedural textures, audio synthesis engines, UI designs, and branding are strictly **Proprietary & All Rights Reserved**.

- 🚫 **No Portfolio Cloning**: You are strictly prohibited from copying, rebranding, or deploying this codebase (or substantial parts thereof) as your own personal or commercial portfolio website.
- 🚫 **Commercial Use Prohibited**: You may not sell, sublicense, monetize, or use this project for any commercial endeavor.
- 🚫 **No Unauthorized Redistribution**: Mirroring, redistributing, or re-licensing this codebase is forbidden.
- 👁️ **Evaluation & Educational Study Only**: Permission is granted solely to inspect the source code on GitHub for peer review, educational study, and recruitment evaluation.

For the full legal terms and conditions, please consult the [LICENSE](LICENSE) file.
