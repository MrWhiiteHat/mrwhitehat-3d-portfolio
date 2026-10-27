import { isMuted } from '../../utils/audio.js';

let cachedVoices = [];
let voicesLoaded = false;

function loadVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
    voicesLoaded = true;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Find the most realistic, expressive voice for Mother
 * Prioritizes natural Indian English / Hindi voices, then natural female voices
 */
export function getMomVoice() {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact Indian English matches (Heera, Neerja, Veena, Google en-IN, etc.)
  const indVoice = voices.find(
    (v) =>
      (v.lang.includes('en-IN') || v.lang.includes('hi-IN') || v.name.toLowerCase().includes('india')) &&
      !v.name.toLowerCase().includes('male') &&
      !v.name.toLowerCase().includes('david') &&
      !v.name.toLowerCase().includes('ravi')
  );
  if (indVoice) return indVoice;

  // 2. Any Indian voice fallback
  const anyInd = voices.find(
    (v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india')
  );
  if (anyInd) return anyInd;

  // 3. Natural / neural female voices
  const femaleVoice = voices.find(
    (v) =>
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('samantha')) &&
      !v.name.toLowerCase().includes('male')
  );
  if (femaleVoice) return femaleVoice;

  return voices[0] || null;
}

/**
 * Find the most dry, sarcastic, deadpan voice for the Narrator
 * Prioritizes British English / deep male voices (BBC documentary style)
 */
export function getNarratorVoice() {
  const voices = cachedVoices.length > 0 ? cachedVoices : loadVoices();
  if (!voices || voices.length === 0) return null;

  // 1. British male voice (George, Daniel, Oliver, Google UK English Male, en-GB)
  const britMale = voices.find(
    (v) =>
      v.lang.includes('en-GB') &&
      (v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('oliver'))
  );
  if (britMale) return britMale;

  // 2. Any British voice
  const brit = voices.find((v) => v.lang.includes('en-GB'));
  if (brit) return brit;

  // 3. Deep male voice
  const deepMale = voices.find(
    (v) =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('mark')
  );
  if (deepMale) return deepMale;

  return voices[0] || null;
}

/**
 * Cancel and stop any active speech synthesis
 */
export function stopAllSpeech() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {}
}

/**
 * Speak multi-segment expressive sarcastic dialogue with natural human cadence,
 * dynamic pitch shifts, variable rate, and comedic pauses!
 *
 * @param {Array<{ text: string, pitch?: number, rate?: number, volume?: number, pauseAfter?: number }>} segments
 * @param {Function} [onComplete]
 */
export function speakExpressiveDialogue(segments, onComplete) {
  if (typeof window === 'undefined' || !window.speechSynthesis || isMuted()) {
    onComplete?.();
    return;
  }

  stopAllSpeech();

  if (!Array.isArray(segments) || segments.length === 0) {
    onComplete?.();
    return;
  }

  const voice = getMomVoice();
  let currentIndex = 0;

  function speakNextSegment() {
    if (currentIndex >= segments.length) {
      onComplete?.();
      return;
    }

    const seg = segments[currentIndex];
    const utterance = new SpeechSynthesisUtterance(seg.text);

    if (voice) utterance.voice = voice;
    utterance.pitch = seg.pitch !== undefined ? seg.pitch : 1.2;
    utterance.rate = seg.rate !== undefined ? seg.rate : 1.05;
    utterance.volume = seg.volume !== undefined ? seg.volume : 1.0;

    utterance.onend = () => {
      currentIndex++;
      if (seg.pauseAfter && seg.pauseAfter > 0) {
        setTimeout(speakNextSegment, seg.pauseAfter);
      } else {
        speakNextSegment();
      }
    };

    utterance.onerror = () => {
      currentIndex++;
      speakNextSegment();
    };

    window.speechSynthesis.speak(utterance);
  }

  speakNextSegment();
}

/**
 * Speak in deadpan sarcastic Narrator style (low pitch, slow, ultra dry)
 */
export function speakNarratorDialogue(text, onComplete) {
  if (typeof window === 'undefined' || !window.speechSynthesis || isMuted()) {
    onComplete?.();
    return;
  }

  stopAllSpeech();

  const voice = getNarratorVoice();
  const utterance = new SpeechSynthesisUtterance(text);

  if (voice) utterance.voice = voice;
  utterance.pitch = 0.85; // Low deadpan pitch
  utterance.rate = 0.92; // Deliberate, dry sarcastic tempo
  utterance.volume = 1.0;

  utterance.onend = () => onComplete?.();
  utterance.onerror = () => onComplete?.();

  window.speechSynthesis.speak(utterance);
}
