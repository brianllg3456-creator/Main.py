const COLS = 5, ROWS = 4;
const SYM = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'], WILD = 'wild', SCAT = 'scat';
const PAY = { t1: [.04, .1, .3], t2: [.04, .1, .3], t3: [.06, .16, .4], t4: [.06, .16, .4], t5: [.1, .3, .8], t6: [.14, .4, 1], t7: [.2, .6, 1.6], t8: [.3, .9, 2.4] };
const WEIGHT = { t1: 14, t2: 14, t3: 12, t4: 12, t5: 10, t6: 8, t7: 6, t8: 5 };
const MULT = [1, 2, 3, 5], MULT_FREE = [2, 4, 6, 10];
const BETS = [3, 6, 12, 30, 60, 120, 300];
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const S = { bal: 100000, bet: 2, win: 0, free: 0, busy: false, auto: 0, turbo: false, cells: [], pick: 10 };
const board = $('board');

function rnd(c) {
  const pool = [];
  SYM.forEach(s => { for (let i = 0; i < WEIGHT[s]; i++) pool.push(s); });
  if (c >= 1 && c <= 3) pool.push(WILD, WILD);
  pool.push(SCAT);
  return pool[Math.floor(Math.random() * pool.length)];
}
function mk(s, c, r) {
  const el = document.createElement('img');
  el.className = 'tile'; el.src = `assets/img/${s}.svg`; el.draggable = false;
  place(el, c, r); board.appendChild(el);
  return { s, el };
}
function place(el, c, r) { el.style.transform = `translate(${c * 100}%,${r * 100}%)`; }
const dur = () => (S.turbo ? .4 : 1);

function ui() {
  $('bal').textContent = fmt(S.bal); $('betTxt').textContent = fmt(BETS[S.bet]); $('winTxt').textContent = fmt(S.win);
  $('spinInfo').textContent = S.free > 0 ? S.free : '';
}
function setMult(i) {
  const arr = S.free > 0 ? MULT_FREE : MULT;
  [...$('mults').children].forEach((el, k) => { el.textContent = 'x' + arr[k]; el.classList.toggle('on', k === i); });
}
function msg(t) { $('msg').textContent = t; }

async function dropAll() {
  S.cells.forEach((col, c) => col.forEach(t => { t.el.style.transitionDuration = '.25s'; place(t.el, c, 6); }));
  const old = S.cells; setTimeout(() => old.forEach(col => col.forEach(t => t.el.remove())), 300);
  S.cells = [];
  for (let c = 0; c < COLS; c++) {
    S.cells[c] = [];
    for (let r = 0; r < ROWS; r++) S.cells[c].push(mk(rnd(c), c, r - 6));
  }
  board.offsetHeight;
  for (let c = 0; c < COLS; c++) {
    await sleep(110 * dur());
    S.cells[c].forEach((t, r) => { t.el.style.transitionDelay = r * 30 + 'ms'; place(t.el, c, r); });
    setTimeout(() => SFX.play('land'), 300 * dur());
  }
  await sleep(500 * dur());
  S.cells.forEach(col => col.forEach(t => t.el.style.transitionDelay = '0ms'));
}

function evaluate() {
  const res = [];
  for (const s of SYM) {
    const counts = [];
    for (let c = 0; c < COLS; c++) {
      const k = S.cells[c].filter(t => t.s === s || t.s === WILD).length;
      if (!k) break; counts.push(k);
    }
    if (counts.length >= 3) res.push({ s, len: counts.length, ways: counts.reduce((a, b) => a * b, 1) });
  }
  return res;
}

async function cascade() {
  let total = 0, step = 0;
  while (true) {
    const res = evaluate();
    if (!res.length) break;
    const arr = S.free > 0 ? MULT_FREE : MULT, m = arr[Math.min(step, 3)];
    setMult(Math.min(step, 3));
    const hit = new Set(); let pay = 0;
    res.forEach(w => {
      pay += PAY[w.s][w.len - 3] * w.ways * BETS[S.bet] * m;
      for (let c = 0; c < w.len; c++) S.cells[c].forEach(t => { if (t.s === w.s || t.s === WILD) hit.add(t); });
    });
    total += pay; S.win = total;
    hit.forEach(t => t.el.classList.add('win'));
    SFX.play('win', step); SFX.play('coin');
    msg('WIN ' + fmt(total)); ui();
    await sleep(650 * dur());
    hit.forEach(t => t.el.classList.add('pop'));
    SFX.play('pop');
    await sleep(320 * dur());
    for (let c = 0; c < COLS; c++) {
      const keep = S.cells[c].filter(t => !hit.has(t));
      S.cells[c].filter(t => hit.has(t)).forEach(t => t.el.remove());
      const need = ROWS - keep.length, fresh = [];
      for (let i = 0; i < need; i++) fresh.push(mk(rnd(c), c, -need + i - 1));
      board.offsetHeight;
      S.cells[c] = fresh.concat(keep);
      S.cells[c].forEach((t, r) => place(t.el, c, r));
    }
    SFX.play('land');
    await sleep(520 * dur());
    step++;
  }
  return total;
}

async function bigWin(amount) {
  SFX.play('bigwin');
  $('bigwin').classList.remove('hidden');
  const t0 = performance.now(), D = 2200;
  await new Promise(res => { (function f(t) { const k = Math.min(1, (t - t0) / D); $('bigAmt').textContent = fmt(amount * k); k < 1 ? requestAnimationFrame(f) : res(); })(t0); });
  await sleep(900);
  $('bigwin').classList.add('hidden');
}

async function spin() {
  if (S.busy) return;
  const bet = BETS[S.bet];
  if (S.free > 0) S.free--;
  else { if (S.bal < bet) { msg('SALDO TIDAK CUKUP'); S.auto = 0; return; } S.bal -= bet; }
  S.busy = true; S.win = 0; $('spin').classList.add('spinning'); setMult(0); msg('BERPUTAR...'); ui();
  SFX.play('spin');
  await dropAll();
  const scat = S.cells.flat().filter(t => t.s === SCAT).length;
  if (scat >= 3) {
    SFX.play('scatter'); S.cells.flat().filter(t => t.s === SCAT).forEach(t => t.el.classList.add('win'));
    const add = 10 + (scat - 3) * 2; S.free += add; msg(`FREE SPIN +${add}! MULTIPLIER HINGGA x10`);
    await sleep(1600);
    S.cells.flat().forEach(t => t.el.classList.remove('win'));
  }
  const won = await cascade();
  if (won > 0) {
    S.bal += won;
    if (won >= bet * 15) await bigWin(won);
    msg('TOTAL WIN ' + fmt(won));
  } else msg(S.free > 0 ? 'FREE SPIN: ' + S.free + ' tersisa' : 'COBA LAGI!');
  S.cells.flat().forEach(t => t.el.classList.remove('win'));
  S.win = won; ui(); setMult(-1);
  S.busy = false; $('spin').classList.remove('spinning');
  if (S.free > 0) { await sleep(700); spin(); }
  else if (S.auto > 0) { S.auto--; $('auto').classList.toggle('on', S.auto > 0); if (S.auto > 0) { await sleep(500); spin(); } }
}

// ===== Kontrol =====
$('spin').onclick = () => { SFX.startMusic(); SFX.play('click'); S.auto = 0; $('auto').classList.remove('on'); spin(); };
$('plus').onclick = () => { if (!S.busy) { S.bet = Math.min(BETS.length - 1, S.bet + 1); SFX.play('click'); ui(); } };
$('minus').onclick = () => { if (!S.busy) { S.bet = Math.max(0, S.bet - 1); SFX.play('click'); ui(); } };
$('turbo').onclick = () => { S.turbo = !S.turbo; $('turbo').classList.toggle('on', S.turbo); SFX.play('click'); };
$('muteBtn').onclick = () => { $('muteBtn').textContent = SFX.toggle() ? '🔇' : '🔊'; };
$('auto').onclick = () => { SFX.play('click'); if (S.auto > 0) { S.auto = 0; $('auto').classList.remove('on'); } else $('modal').classList.remove('hidden'); };
$('closeAuto').onclick = () => $('modal').classList.add('hidden');
[10, 30, 50, 80, 1000].forEach(n => {
  const b = document.createElement('button'); b.textContent = n; if (n === 10) b.className = 'sel';
  b.onclick = () => { S.pick = n; [...$('opts').children].forEach(x => x.classList.toggle('sel', x === b)); SFX.play('click'); };
  $('opts').appendChild(b);
});
$('startAuto').onclick = () => { $('modal').classList.add('hidden'); S.auto = S.pick; $('auto').classList.add('on'); spin(); };
$('go').onclick = () => { $('start').remove(); SFX.startMusic(); };

// ===== Awal =====
for (let c = 0; c < COLS; c++) { S.cells[c] = []; for (let r = 0; r < ROWS; r++) S.cells[c].push(mk(rnd(c), c, r)); }
ui(); setMult(-1);