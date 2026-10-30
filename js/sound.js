/**
 * ROSSDOOR® — Bộ tổng hợp âm thanh cơ khí cửa cuốn bằng Web Audio API
 * Không cần file MP3 ngoài, mô phỏng tiếng nút bấm Remote, tiếng Motor êm và còi báo vật cản.
 */

class RossSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.motorOsc = null;
    this.motorGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMotorHum();
    }
    return this.enabled;
  }

  // Tiếng "Bíp" ngắn khi bấm Remote điều khiển cửa cuốn
  playRemoteBeep(freq = 2400, duration = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Ignore audio autoplay restrictions
    }
  }

  // Tiếng cảnh báo 2 tiếng bíp khi cửa cuốn gặp vật cản tự đảo chiều
  playObstacleAlert() {
    if (!this.enabled) return;
    this.playRemoteBeep(1950, 0.11);
    setTimeout(() => this.playRemoteBeep(1950, 0.14), 150);
  }

  // Tiếng rì rầm trầm ấm của động cơ & nan nhôm trượt trong ray
  startMotorHum(durationSec = 1.8) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      this.stopMotorHum();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(68, now);
      osc.frequency.linearRampToValueAtTime(76, now + durationSec * 0.8);

      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(136, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.15);
      gain.gain.setValueAtTime(0.035, now + Math.max(0.2, durationSec - 0.25));
      gain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + durationSec);
      subOsc.stop(now + durationSec);

      this.motorOsc = osc;
      this.motorGain = gain;
    } catch (e) {
      // Ignore
    }
  }

  stopMotorHum() {
    if (this.motorOsc) {
      try {
        this.motorOsc.stop();
      } catch (e) {}
      this.motorOsc = null;
    }
  }
}

window.rossSound = new RossSoundEngine();

