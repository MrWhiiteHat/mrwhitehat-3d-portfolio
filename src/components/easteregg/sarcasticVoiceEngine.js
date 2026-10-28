import { isMuted } from '../../utils/audio.js';

const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

let currentAudio = null;
const audioCache = new Map();

function getOrCreateAudio(url) {
  if (audioCache.has(url)) {
    const cached = audioCache.get(url);
    try {
      cached.pause();
      cached.currentTime = 0;
    } catch (e) {}
    return cached;
  }
  const audio = new Audio(url);
  audio.preload = 'auto';
  audioCache.set(url, audio);
  return audio;
}

export function preloadEasterEggVoiceClips() {
  const clips = [
    'mom_initial_call',
    'narrator_punchline',
    'cert_official_reading',
    'cert_stat_hack',
    'cert_stat_respect',
    'cert_stat_coriander',
    'cert_stat_mirchi',
    'cert_stat_sabzi',
    'cert_stat_chappal',
  ];
  clips.forEach((name) => {
    try {
      const url = getAssetUrl('audio/easteregg/' + name + '.mp3');
      if (!audioCache.has(url)) {
        const a = new Audio(url);
        a.preload = 'auto';
        audioCache.set(url, a);
      }
    } catch (e) {}
  });
}

/**
 * Cancel and stop any active real voice audio or fallback speech synthesis
 */
export function stopAllSpeech() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Play Studio Voice Clip with Cascading Fallback:
 * 1. ElevenLabs / Studio WAV / MP3
 * 2. Secondary audio format
 * 3. Browser Speech Synthesis fallback (if audio blocked by policy)
 */
export function playRealVoiceClip(baseName, onComplete, fallbackText = '') {
  if (isMuted()) {
    onComplete?.();
    return;
  }

  stopAllSpeech();

  const tryPlay = (ext) => {
    try {
      const audioUrl = getAssetUrl('audio/easteregg/' + baseName + '.' + ext);
      const audio = getOrCreateAudio(audioUrl);
      audio.volume = 1.0;
      currentAudio = audio;

      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        onComplete?.();
      };

      audio.onerror = (e) => {
        console.warn(`[RealVoiceEngine] ${baseName}.${ext} failed, falling back...`, e);
        if (ext === 'mp3') {
          tryPlay('wav');
        } else {
          if (currentAudio === audio) currentAudio = null;
          if (fallbackText && typeof window !== 'undefined' && window.speechSynthesis) {
            speakFallback(fallbackText, onComplete);
          } else {
            onComplete?.();
          }
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn(`[RealVoiceEngine] Play error for ${ext}:`, err);
          if (ext === 'mp3') {
            tryPlay('wav');
          } else {
            if (fallbackText && typeof window !== 'undefined' && window.speechSynthesis) {
              speakFallback(fallbackText, onComplete);
            } else {
              onComplete?.();
            }
          }
        });
      }
    } catch (err) {
      if (ext === 'mp3') {
        tryPlay('wav');
      } else {
        onComplete?.();
      }
    }
  };

  tryPlay('mp3');
}

function speakFallback(text, onComplete) {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.25;
    utterance.onend = () => onComplete?.();
    utterance.onerror = () => onComplete?.();
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    onComplete?.();
  }
}

// 1. Mom's Initial Furious Calling Transmission
export function playMomInitialCall(onComplete) {
  playRealVoiceClip(
    'mom_initial_call',
    onComplete,
    'AREY NALAYAK! OYE HERO! Dal poori jal gayi stove pe aur pressure cooker seetiyan maar raha hai! Stop clicking click-click in fake Matrix! Go to market and bring ₹10 DHANIYA right now!'
  );
}

// 2. Mom's Retort to "Bypassed Military Firewall"
export function playMomRetortFirewall(onComplete) {
  playRealVoiceClip(
    'mom_retort_firewall',
    onComplete,
    "Military firewall?! Arey wah, Nalayak! Last week you couldn't even fix bathroom ka door latch! Go get the dhaniya before I disconnect your Wi-Fi router forever!"
  );
}

// 3. Mom's Retort to "Order on Blinkit / Zepto"
export function playMomRetortBlinkit(onComplete) {
  playRealVoiceClip(
    'mom_retort_blinkit',
    onComplete,
    'Blinkit?! You want to pay 40 rupees delivery fee for 10 rupees dhaniya?! Kya main yahan paise ka ped uga rahi hoon?! Wear your slippers and RUN!'
  );
}

// 4. Mom's Retort to "What if vendor refuses free mirchi?"
export function playMomRetortMirchi(onComplete) {
  playRealVoiceClip(
    'mom_retort_mirchi',
    onComplete,
    'Negotiate?! Agar ek mirchi ke bhi paise diye na, family WhatsApp group se nikaal dungi! Stare into his soul until he gives free mirchi! Now move!'
  );
}

// 5. Mom's Retort to "Put it on LinkedIn"
export function playMomRetortLinkedIn(onComplete) {
  playRealVoiceClip(
    'mom_retort_linkedin',
    onComplete,
    "LinkedIn?! Write on LinkedIn: 'Master of staring at glowing cubes while mother's dal burns to ash'! First learn how to chop onions without crying, Mr. Senior Cyber Architect!"
  );
}

// 6. Mom's Retort to "Buy ₹50 in Bulk"
export function playMomRetortBulk(onComplete) {
  playRealVoiceClip(
    'mom_retort_bulk',
    onComplete,
    'Fifty rupees dhaniya?! It will rot in the fridge and turn into black soup in three days! Then who will eat it?! Your father?! Go get ten rupees, not one paise more!'
  );
}

// 7. Narrator's Deadpan BBC Punchline
export function playNarratorPunchline(onComplete) {
  playRealVoiceClip(
    'narrator_punchline',
    onComplete,
    'You spent 20 minutes rotating 3D laser switches and feeling like Mr. Robot. And yet, your mother dismantled your entire clandestine operation with one whistling Hawkins pressure cooker, a supersonic Hawai chappal and Belan air raid, and a demand for coriander. The dal is burned to ash. The chappal is supersonic.'
  );
}

// 8. Mom's Replay Scolding on Certificate Soundboard
export function playMomScoldingReplay(onComplete) {
  playRealVoiceClip(
    'mom_scolding_replay',
    onComplete,
    'Arey Nalayak! Did you buy the dhaniya yet?! Put down the computer and run to the market before I launch another chappal!'
  );
}

// 9. System_Root Desktop Shortcut Voice Line
export function playIconRootAudio(onComplete) {
  playRealVoiceClip(
    'icon_root',
    onComplete,
    'Access denied! Sudo password change kar diya maine! True root authority of this house is Mummy! Pehle room saaf karo!'
  );
}

// 10. Neural_Firewall Desktop Shortcut Voice Line
export function playIconFirewallAudio(onComplete) {
  playRealVoiceClip(
    'icon_firewall',
    onComplete,
    'Tera neural firewall Pentagon ko rok sakta hai, par meri aawaz seedha tere kaan phadegi! Jaldi market bhaag!'
  );
}

// 11. Dhaniya_₹10.xlsx Desktop Shortcut Voice Line
export function playIconDhaniyaAudio(onComplete) {
  playRealVoiceClip(
    'icon_dhaniya',
    onComplete,
    'Dhyan se sun! Pure das rupaye ka dhaniya aur saath mein chaar mirchi free lani hai! Ek rupaya bhi extra diya toh dekhna!'
  );
}

// 12. Cold_Maggi.log Desktop Shortcut Voice Line
export function playIconMaggiAudio(onComplete) {
  playRealVoiceClip(
    'icon_maggi',
    onComplete,
    'Ek ghante pehle Maggi banayi thi! Ab wo concrete ka pathar ban chuki hai! Computer chhod aur bartan dho!'
  );
}

// 13. Desi_Memes.exe Desktop Shortcut Voice Line
export function playIconMemesAudio(onComplete) {
  playRealVoiceClip(
    'icon_memes',
    onComplete,
    'Behold: the digital coping mechanism of a cyber hacker who commands neural firewalls, yet cannot find coriander at the local grocery stall.'
  );
}

// 14. Sharma_Beta.pdf Desktop Shortcut Voice Line
export function playIconSharmaAudio(onComplete) {
  playRealVoiceClip(
    'icon_sharma',
    onComplete,
    'Sharma ji ka beta subah chaar baje uthta hai! Google mein Senior Engineer hai! Aur ek tu hai... bunker mein laser ghuma raha hai!'
  );
}

// 15. Mom_Dict.txt Desktop Shortcut Voice Line
export function playIconDictAudio(onComplete) {
  playRealVoiceClip(
    'icon_dict',
    onComplete,
    'Section four of the Indian Mother Vocabulary: When she says, Bas do minute ruko, mathematical laws dictate you have exactly zero seconds to comply.'
  );
}

// 16. Official Certificate of Errand Disobedience - BBC Narrator Reading
export function playCertOfficialReading(onComplete) {
  playRealVoiceClip(
    'cert_official_reading',
    onComplete,
    "Official evaluation report. Department of Domestic Household Operations and Cyber Arbitrage. Certificate of Errand Disobedience, awarded to the elite hacker who spent twenty minutes rotating 3D laser switches, yet completely neglected a five minute trip to buy coriander. Final verdict: Sabzi burned to ash, Mother's approval negative nine thousand nine hundred, and tactical Hawai chappal locked on target at Defcon One."
  );
}

// 17. Stat Card: Hacking Aptitude
export function playCertStatHack(onComplete) {
  playRealVoiceClip(
    'cert_stat_hack',
    onComplete,
    'Hacking aptitude: Level 99 Cyber Ghost. Capable of penetrating Pentagon firewalls, yet unable to locate the vegetable stall across the street.'
  );
}

// 18. Stat Card: Mother's Approval
export function playCertStatRespect(onComplete) {
  playRealVoiceClip(
    'cert_stat_respect',
    onComplete,
    'Arey Nalayak! Minus nine thousand nine hundred respect! Sharma ji ka beta respects his mother, aur tu din bhar laser ghuma raha hai!'
  );
}

// 19. Stat Card: Coriander Secured
export function playCertStatCoriander(onComplete) {
  playRealVoiceClip(
    'cert_stat_coriander',
    onComplete,
    'Zero bunches of coriander secured! Das rupaye ka dhaniya nahi laya, ab sookhi roti khao!'
  );
}

// 20. Stat Card: Free Green Chillies
export function playCertStatMirchi(onComplete) {
  playRealVoiceClip(
    'cert_stat_mirchi',
    onComplete,
    'Char free mirchi kahan hai?! Agar ek mirchi ke bhi paise diye na, family WhatsApp group se nikaal dungi!'
  );
}

// 21. Stat Card: Sabzi Status
export function playCertStatSabzi(onComplete) {
  playRealVoiceClip(
    'cert_stat_sabzi',
    onComplete,
    'Sabzi jal ke poori kaali koyla ban gayi! Pressure cooker seetiyan maar raha hai aur tu yahan certificate dekh raha hai!'
  );
}

// 22. Stat Card: Chappal Threat Level
export function playCertStatChappal(onComplete) {
  playRealVoiceClip(
    'cert_stat_chappal',
    onComplete,
    'Warning: Chappal threat level elevated to Defcon One. Supersonic Hawai slipper air raid initiated. Seek immediate domestic cover.'
  );
}
