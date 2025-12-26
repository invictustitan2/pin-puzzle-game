export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    try {
      // Defer initialization until user interaction
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized || !this.enabled) return;

    try {
      this.context = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.3; // Default volume
      this.initialized = true;

      // Resume context if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
    } catch (e) {
      console.error('Failed to init audio', e);
      this.enabled = false;
    }
  }

  public setVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }

  public setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value && this.context) {
      this.context.suspend();
    } else if (value && this.context) {
      this.context.resume();
    }
  }

  public play(effect: 'pull' | 'win' | 'lose' | 'steam' | 'water'): void {
    if (!this.enabled || !this.initialized || !this.context || !this.masterGain)
      return;

    const t = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    switch (effect) {
      case 'pull':
        // Short high blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'win':
        // Ascending major arpeggio
        this.playNote(523.25, t, 0.1); // C5
        this.playNote(659.25, t + 0.1, 0.1); // E5
        this.playNote(783.99, t + 0.2, 0.4); // G5
        break;

      case 'lose':
        // Descending low tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.5);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;

      case 'steam':
        // White noise burst
        this.playNoise(0.2);
        break;

      case 'water':
        // Softer noise/low rumble?
        // Simulating generic splash with low freq noise if possible, or just ignore for now
        break;
    }
  }

  private playNote(freq: number, time: number, duration: number): void {
    if (!this.context || !this.masterGain) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playNoise(duration: number): void {
    if (!this.context || !this.masterGain) return;
    const bufferSize = this.context.sampleRate * duration;
    const buffer = this.context.createBuffer(
      1,
      bufferSize,
      this.context.sampleRate
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    const gain = this.context.createGain();

    // Filter the noise to sound more like steam (low pass)
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + duration
    );

    noise.start();
  }
}
