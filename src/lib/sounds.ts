"use client";

/** Available sound effect names that can be played via {@link playSound}. */
type SoundName = "success" | "click" | "achievement" | "pop" | "whoosh" | "splash";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainValue: number = 0.3,
  startTime: number = ctx.currentTime
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playNoise(
  ctx: AudioContext,
  duration: number,
  gainValue: number = 0.1,
  startTime: number = ctx.currentTime
) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainValue, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1000, startTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(startTime);
  source.stop(startTime + duration);
}

function playSuccess(ctx: AudioContext) {
  const now = ctx.currentTime;
  playTone(ctx, 523.25, 0.15, "sine", 0.3, now);        // C5
  playTone(ctx, 659.25, 0.15, "sine", 0.3, now + 0.1);   // E5
  playTone(ctx, 783.99, 0.25, "sine", 0.3, now + 0.2);   // G5
}

function playClick(ctx: AudioContext) {
  const now = ctx.currentTime;
  playTone(ctx, 800, 0.05, "square", 0.1, now);
}

function playAchievement(ctx: AudioContext) {
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playTone(ctx, freq, 0.2, "sine", 0.25, now + i * 0.12);
  });
  // Add a shimmer
  playTone(ctx, 1318.5, 0.4, "triangle", 0.15, now + 0.5);
}

function playPop(ctx: AudioContext) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

function playWhoosh(ctx: AudioContext) {
  const now = ctx.currentTime;
  const duration = 0.3;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(3000, now + 0.15);
  filter.frequency.exponentialRampToValueAtTime(500, now + duration);
  filter.Q.setValueAtTime(2, now);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + duration);
}

function playSplash(ctx: AudioContext) {
  const now = ctx.currentTime;
  // Initial impact
  playNoise(ctx, 0.3, 0.15, now);
  // Droplets
  playTone(ctx, 600, 0.08, "sine", 0.1, now + 0.1);
  playTone(ctx, 500, 0.06, "sine", 0.08, now + 0.18);
  playTone(ctx, 700, 0.05, "sine", 0.06, now + 0.25);
  playTone(ctx, 450, 0.04, "sine", 0.05, now + 0.3);
}

/**
 * Play a synthesised sound effect using the Web Audio API.
 * Safe to call server-side (no-ops if window is unavailable).
 * Automatically resumes the AudioContext if suspended by browser autoplay policy.
 *
 * Available sounds:
 * - `success` — ascending C-E-G chord (correct answer)
 * - `click` — short tap feedback
 * - `achievement` — celebratory fanfare (badge unlocked)
 * - `pop` — bubble/item pop
 * - `whoosh` — transition/swipe effect
 * - `splash` — water splash with droplets
 *
 * @param name - The sound effect to play
 */
export function playSound(name: SoundName): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  switch (name) {
    case "success":
      playSuccess(ctx);
      break;
    case "click":
      playClick(ctx);
      break;
    case "achievement":
      playAchievement(ctx);
      break;
    case "pop":
      playPop(ctx);
      break;
    case "whoosh":
      playWhoosh(ctx);
      break;
    case "splash":
      playSplash(ctx);
      break;
  }
}

/** Speaks a word aloud using the Web Speech API. */
export function speakWord(word: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.75;
  utterance.pitch = 1.0;
  utterance.lang = 'en-GB';
  window.speechSynthesis.speak(utterance);
}
