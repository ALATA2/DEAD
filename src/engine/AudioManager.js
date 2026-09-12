// AudioManager.js - Amiga Paula / Retro Procedural Sound Synthesizer
// Zero external files, fully authentic Amiga 1200 / 90s FPS audio

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.enabled = true;
    this.volume = 0.8;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.sfxGain.connect(this.masterGain);
    this.ambientGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Retro Amiga noise generator
  _createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Bitcrush / crunchy Amiga noise emulation
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      if (i % 4 === 0) {
        last = (Math.random() * 2 - 1) * 0.9;
      }
      data[i] = last;
    }
    return buffer;
  }

  playPistol() {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    // Sharp initial noise crack
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.2);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    // Low boom oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    noise.start(t);
    osc.start(t);
    noise.stop(t + 0.2);
    osc.stop(t + 0.22);
  }

  playShotgun(isDouble = false) {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const dur = isDouble ? 0.45 : 0.35;
    const vol = isDouble ? 1.0 : 0.85;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(dur);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isDouble ? 2800 : 2200, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    const sub = this.ctx.createOscillator();
    sub.type = 'square';
    sub.frequency.setValueAtTime(isDouble ? 110 : 130, t);
    sub.frequency.exponentialRampToValueAtTime(20, t + dur);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(vol * 0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);

    noise.start(t);
    sub.start(t);
    noise.stop(t + dur);
    sub.stop(t + dur + 0.05);
  }

  playAxeSwing() {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  playCrossbow() {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.28);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.28);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playDoor(opening = true) {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    const startF = opening ? 75 : 120;
    const endF = opening ? 130 : 60;
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.linearRampToValueAtTime(endF, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.62);
  }

  playLift() {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.82);
  }

  playPickup(type = 'health') {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';

    let f1 = 330, f2 = 660;
    if (type === 'key') { f1 = 520; f2 = 1040; }
    else if (type === 'weapon') { f1 = 260; f2 = 520; }
    else if (type === 'ammo') { f1 = 400; f2 = 800; }

    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.setValueAtTime(f2, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  playMonsterRoar(isBoss = false) {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const dur = isBoss ? 0.7 : 0.4;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    const baseFreq = isBoss ? 55 : 95;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.5, t + dur * 0.4);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, t + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  playPlayerPain() {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playImpact(isFlesh = false) {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = isFlesh ? 'sine' : 'square';
    osc.frequency.setValueAtTime(isFlesh ? 90 : 220, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  playSecretFound() {
    this.ensureContext();
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;

    [392, 523, 659, 784].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.09);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, t + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.09 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.2);
    });
  }
}

export const sound = new AudioManager();
