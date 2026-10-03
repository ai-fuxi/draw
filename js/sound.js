/* ============================================================
   音效（WebAudio 合成，无需音频文件）
   ============================================================ */
const Snd = {
  ctx: null,
  muted: false,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  tone(freq, dur, type = 'sine', vol = 0.16, delay = 0) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) { /* 忽略音频异常 */ }
  },

  click()  { this.tone(540, 0.07, 'triangle', 0.10); },
  fill()   { this.tone(320, 0.12, 'sine', 0.18); this.tone(480, 0.10, 'sine', 0.10, 0.05); },
  paper()  { this.tone(900, 0.05, 'sine', 0.06); },
  success(){ [523, 659, 784].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.18, i * 0.09)); },
  bigWin() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.18, i * 0.10)); },
  fail()   { this.tone(220, 0.16, 'triangle', 0.16); this.tone(176, 0.2, 'triangle', 0.13, 0.08); },
  save()   { this.tone(659, 0.1, 'triangle', 0.16); this.tone(880, 0.16, 'triangle', 0.14, 0.08); },
  stamp()  { this.tone(700, 0.06, 'sine', 0.10); }
};