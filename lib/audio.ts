/**
 * Web Audio API Sound Synthesizer — Ayò Ọlọ́pọ́n Digital
 * Synthesizes organic West African timber clacks, seed clicks, and capture chimes
 * with zero network latency and zero asset dependency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Synthesizes the tactile click of a Caesalpinia bonduc seed dropping into an iroko pit.
   */
  public playSeedClick(pitchVariance = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Wood-block click frequency
    const baseFreq = 380 + (Math.random() * 80 - 40);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * pitchVariance, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Synthesizes the wooden scoop sound of picking seeds from a hollow.
   */
  public playScoop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playSeedClick(0.9 + i * 0.15);
      }, i * 25);
    }
  }

  /**
   * Synthesizes a resonant wooden chime when seeds are scooped (Jẹ — 2 or 3 seeds).
   */
  public playCapture() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.07);

      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  }

  /**
   * Synthesizes celebratory African log drum rolls on victory.
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
      }, i * 120);
    });
  }
}

export const sound = new SoundEngine();
