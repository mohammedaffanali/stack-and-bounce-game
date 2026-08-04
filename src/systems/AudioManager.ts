import { SaveManager } from '../utils/SaveManager';

export class AudioManager {
  private scene: Phaser.Scene;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // Without this, toggling SOUND/MUSIC off in the Settings panel had no
    // effect on gameplay audio, since every AudioManager instance defaulted
    // to "on" and never consulted the saved preference.
    const settings = SaveManager.getSettings();
    this.soundEnabled = settings.soundEnabled;
    this.musicEnabled = settings.musicEnabled;
  }

  setSettings(sound: boolean, music: boolean) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
  }

  // Use simple generated sounds or placeholders
  playLanding() {
    if (!this.soundEnabled) return;
    // placeholder: play synth sound
    this.playTone(300, 0.1, 'sine');
  }

  playPerfectHit() {
    if (!this.soundEnabled) return;
    this.playTone(600, 0.2, 'square');
    setTimeout(() => this.playTone(800, 0.3, 'square'), 100);
  }

  playCombo(combo: number) {
    if (!this.soundEnabled) return;
    const freq = 400 + Math.min(combo * 50, 600);
    this.playTone(freq, 0.2, 'triangle');
  }

  playButtonClick() {
    if (!this.soundEnabled) return;
    this.playTone(400, 0.1, 'sine');
  }

  playGameOver() {
    if (!this.soundEnabled) return;
    this.playTone(150, 0.5, 'sawtooth');
    setTimeout(() => this.playTone(100, 0.8, 'sawtooth'), 200);
  }

  playBGM() {
    if (!this.musicEnabled) return;
    // placeholder for BGM, since we can't easily synthesize a full track, we will just leave it empty
    // In a real game, we'd load audio files.
  }

  private playTone(frequency: number, duration: number, type: OscillatorType) {
    try {
      const soundManager = this.scene.sys.game.sound as any;
      if (!soundManager || !soundManager.context) return;
      
      const audioCtx = soundManager.context as AudioContext;
      if (audioCtx.state === 'closed') return;

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors if context is not allowed to start
    }
  }
}
