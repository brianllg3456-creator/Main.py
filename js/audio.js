const SFX = (() => {
  let ctx, master, musicGain, muted = false, musicTimer = null, step = 0;
  const init = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .8; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = .18; musicGain.connect(master);
  };
  const tone = (f, t0, d, type = 'sine', v = .3, dest, slide) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .01);
    g.gain.exponentialRampToValueAtTime(.001, t0 + d);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + d + .05);
  };
  const noise = (t0, d, v, f0, f1) => {
    const b = ctx.createBuffer(1, ctx.sampleRate * d, ctx.sampleRate), a = b.getChannelData(0);
    for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const fl = ctx.createBiquadFilter(); fl.type = 'bandpass';
    fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d);
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + d);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0);
  };
  const N = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3, 784, 880]; // pentatonik
  const play = {
    click() { tone(700, ctx.currentTime, .06, 'square', .15); },
    spin() { noise(ctx.currentTime, .5, .35, 300, 3000); tone(200, ctx.currentTime, .3, 'sawtooth', .1, 0, 600); },
    land() { tone(140, ctx.currentTime, .12, 'sine', .35, 0, 60); noise(ctx.currentTime, .05, .12, 2000, 800); },
    pop() { tone(900, ctx.currentTime, .15, 'triangle', .22, 0, 1500); },
    win(i = 0) { const t = ctx.currentTime, b = 3 + i * 2; [0, 2, 4].forEach((k, j) => tone(N[Math.min(b + k - 2, 9)] * (b > 7 ? 1 : 2), t + j * .07, .35, 'triangle', .22)); },
    scatter() { const t = ctx.currentTime; [0, 2, 4, 5, 7, 9].forEach((k, j) => tone(N[k], t + j * .09, .5, 'square', .12)); },
    bigwin() { const t = ctx.currentTime; for (let j = 0; j < 16; j++) tone(N[(j * 3) % 10] * 2, t + j * .09, .3, 'triangle', .2); tone(130, t, 1.6, 'sawtooth', .15, 0, 260); },
    coin() { tone(1318, ctx.currentTime, .06, 'square', .08); tone(1760, ctx.currentTime + .05, .1, 'square', .08); },
  };
  const music = () => {
    const mel = [4, 5, 6, 5, 4, 2, 3, 4, 2, 1, 2, 0, 1, 2, 4, 3], bass = [0, 0, 2, 2, 3, 3, 1, 1];
    const t = ctx.currentTime + .05, s = step++ % 16;
    tone(N[mel[s]], t, .4, 'triangle', .5, musicGain);
    if (s % 2 === 0) tone(N[bass[s / 2]] / 2, t, .5, 'sine', .6, musicGain);
  };
  return {
    init, play: (n, ...a) => { if (ctx && !muted) play[n](...a); },
    startMusic() { init(); if (ctx.state === 'suspended') ctx.resume(); if (!musicTimer) musicTimer = setInterval(() => { if (!muted) music(); }, 280); },
    toggle() { muted = !muted; return muted; },
  };
})();