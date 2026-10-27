import { isMuted } from '../../utils/audio.js';

const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

let currentAudio = null;

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
 * Play Real Human Studio Voice Audio Clip
 * @param {string} audioFileName - filename in public/audio/easteregg/
 * @param {Function} [onComplete]
 * @param {string} [fallbackText] - fallback text for speech synthesis if audio blocked
 */
export function playRealVoiceClip(audioFileName, onComplete, fallbackText = '') {
  if (isMuted()) {
    onComplete?.();
    return;
  }

  stopAllSpeech();

  try {
    const audioUrl = getAssetUrl(`audio/easteregg/${audioFileName}`);
    const audio = new Audio(audioUrl);
    audio.volume = 1.0;
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      onComplete?.();
    };

    audio.onerror = (e) => {
      console.warn(`[RealVoiceEngine] Audio file error (${audioFileName}), using fallback:`, e);
      if (currentAudio === audio) currentAudio = null;
      if (fallbackText && typeof window !== 'undefined' && window.speechSynthesis) {
        speakFallback(fallbackText, onComplete);
      } else {
        onComplete?.();
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[RealVoiceEngine] Audio play prevented, using fallback:', err);
        if (fallbackText && typeof window !== 'undefined' && window.speechSynthesis) {
          speakFallback(fallbackText, onComplete);
        } else {
          onComplete?.();
        }
      });
    }
  } catch (err) {
    console.warn('[RealVoiceEngine] Exception playing audio:', err);
    onComplete?.();
  }
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
    'mom_initial_call.mp3',
    onComplete,
    'AREY NALAYAK! OYE HERO! Dal poori jal gayi stove pe aur pressure cooker seetiyan maar raha hai! Stop clicking click-click in fake Matrix! Go to market and bring ₹10 DHANIYA right now!'
  );
}

// 2. Mom's Retort to "Bypassed Military Firewall"
export function playMomRetortFirewall(onComplete) {
  playRealVoiceClip(
    'mom_retort_firewall.mp3',
    onComplete,
    "Military firewall?! Arey wah, Nalayak! Last week you couldn't even fix bathroom ka door latch! Go get the dhaniya before I disconnect your Wi-Fi router forever!"
  );
}

// 3. Mom's Retort to "Order on Blinkit / Zepto"
export function playMomRetortBlinkit(onComplete) {
  playRealVoiceClip(
    'mom_retort_blinkit.mp3',
    onComplete,
    'Blinkit?! You want to pay 40 rupees delivery fee for 10 rupees dhaniya?! Kya main yahan paise ka ped uga rahi hoon?! Wear your slippers and RUN!'
  );
}

// 4. Mom's Retort to "What if vendor refuses free mirchi?"
export function playMomRetortMirchi(onComplete) {
  playRealVoiceClip(
    'mom_retort_mirchi.mp3',
    onComplete,
    'Negotiate?! Agar ek mirchi ke bhi paise diye na, family WhatsApp group se nikaal dungi! Stare into his soul until he gives free mirchi! Now move!'
  );
}

// 5. Narrator's Deadpan BBC Punchline
export function playNarratorPunchline(onComplete) {
  playRealVoiceClip(
    'narrator_punchline.mp3',
    onComplete,
    'You spent 20 minutes rotating 3D laser switches and feeling like Mr. Robot. And yet, your mother dismantled your entire clandestine operation with one whistling Hawkins pressure cooker, a supersonic Hawai chappal and Belan air raid, and a demand for coriander. The dal is burned to ash. The chappal is supersonic.'
  );
}

// 6. Mom's Replay Scolding on Certificate Soundboard
export function playMomScoldingReplay(onComplete) {
  playRealVoiceClip(
    'mom_scolding_replay.mp3',
    onComplete,
    'Arey Nalayak! Did you buy the dhaniya yet?! Put down the computer and run to the market before I launch another chappal!'
  );
}
