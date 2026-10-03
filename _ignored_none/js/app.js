/* ============================================================
   小小画家乐园 · 主逻辑
   ============================================================ */
'use strict';

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ---------------- 存储 ---------------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 忽略配额 */ } },
  del(k) { localStorage.removeItem(k); }
};
const KEYS = {
  profile: 'hh_profile', stars: 'hh_stars', works: 'hh_works',
  colored: 'hh_colored', palette: 'hh_palette', colorsUsed: 'hh_colors',
  mix: 'hh_mix', quiz: 'hh_quiz', achvBonus: 'hh_achv_bonus', muted: 'hh_muted'
};
let stars = store.get(KEYS.stars, 0);

/* ---------------- 通用 UI ---------------- */
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function confettiBurst(n = 110) {
  const cv = $('#confetti');
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');
  const colors = ['#ff4b4b', '#ff9f1c', '#ffd500', '#2ecc40', '#3498db', '#9b59b6', '#ff8ad8', '#86c5ff'];
  const parts = [];
  for (let i = 0; i < n; i++) {
    parts.push({
      x: Math.random() * cv.width,
      y: -24 - Math.random() * cv.height * 0.5,
      w: 6 + Math.random() * 9,
      h: 8 + Math.random() * 11,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4.2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.32,
      c: colors[i % colors.length],
      ttl: 100 + Math.random() * 70
    });
  }
  const t0 = performance.now();
  function step(now) {
    const t = (now - t0) / 16;
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    for (const p of parts) {
      if (t > p.ttl) continue;
      alive = true;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = t > p.ttl - 20 ? (p.ttl - t) / 20 : 1;
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(step);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  }
  requestAnimationFrame(step);
}

function showConfirm(text, onYes) {
  $('#modalText').textContent = text;
  $('#modal').classList.remove('hidden');
  const yes = () => { cleanup(); onYes && onYes(); };
  const no = () => { cleanup(); };
  const cleanup = () => {
    $('#modalYes').removeEventListener('click', yes);
    $('#modalNo').removeEventListener('click', no);
    $('#modal').classList.add('hidden');
  };
  $('#modalYes').addEventListener('click', yes);
  $('#modalNo').addEventListener('click', no);
}

/* ---------------- 星星与导航 ---------------- */
function renderStars() {
  const s = Math.max(0, stars);
  $('#headerStars').textContent = s;
  $('#homeStars').textContent = s;
  if ($('#homeWorks')) $('#homeWorks').textContent = store.get(KEYS.works, []).length;
  $('#homeBadges').textContent = countUnlocked();
}

function showPage(id) {
  $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + id));
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderStars();
  if (id === 'coloring') showColoringMenu();
  if (id === 'gallery') renderGallery();
  if (id === 'journey') renderJourney();
  if (id === 'learn') { Snd.ensure(); }
  if (id === 'paint') { if (!P.ready) initPaint(); }
}

function addStars(n) {
  stars = Math.max(0, stars + n);
  store.set(KEYS.stars, stars);
  renderStars();
}

/* ---------------- 首页 ---------------- */
const TIPS_SRC = COLOR_TIPS.slice();
function randomTip() {
  if (!TIPS_SRC.length) TIPS_SRC.push(...COLOR_TIPS);
  const i = Math.floor(Math.random() * TIPS_SRC.length);
  return TIPS_SRC.splice(i, 1)[0];
}

function initHome() {
  $('#tipCard').textContent = '💡 配色小贴士：' + randomTip();
  const name = store.get(KEYS.profile, '');
  applyName(name);
  $('#editName').addEventListener('click', () => {
    const span = $('#greetingText');
    if ($('.name-input')) { $('#editName').click(); return; }
    const input = document.createElement('input');
    input.className = 'name-input';
    input.value = name;
    input.maxLength = 8;
    input.placeholder = '你的名字';
    span.replaceWith(input);
    input.focus();
    input.select();
    const done = () => {
      const v = input.value.trim();
      store.set(KEYS.profile, v);
      applyName(v);
      toast(v ? '你好，' + v + '！' : '好的，随你喜欢～');
    };
    input.addEventListener('blur', done);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  });
}
function applyName(n) {
  $('#greetingText').textContent = n ? `你好呀，${n}！我们一起画画吧！` : '你好呀，小画家！我们一起画画吧！';
}

/* ---------------- 涂色乐园 ---------------- */
const C = {
  page: null, regions: [], regionFills: [], fillHist: [], overlayHist: [],
  color: PALETTE[0].c, tool: 'fill', size: 2,
  overlayEmpty: true, drawing: false, last: null, overlayDirty: false
};
const WHITE = '#ffffff';

function withPageStyle(svgStr) {
  if (svgStr.includes('<style>')) return svgStr;
  return svgStr.replace(/<svg([^>]*)>/,
    '<svg$1><style>.region{fill:#ffffff;stroke:#374151;stroke-width:5;stroke-linejoin:round;stroke-linecap:round}.sn{fill:none;stroke:#374151;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}</style>');
}
function svgToDataUrl(svgStr) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(withPageStyle(svgStr));
}

function showColoringMenu() {
  $('#coloringWorkspace').classList.add('hidden');
  $('#coloringMenu').classList.remove('hidden');
  const grid = $('#coloringGrid');
  grid.innerHTML = '';
  const doneMap = store.get(KEYS.colored, {});
  COLORING_PAGES.forEach(pg => {
    const card = document.createElement('div');
    card.className = 'thumb-card';
    const done = doneMap[pg.id];
    card.innerHTML = `
      <img src="${svgToDataUrl(pg.svg)}" alt="${pg.name}">
      <div class="thumb-name">${pg.emoji} ${pg.name}</div>
      ${done ? '<div class="thumb-done">✅ 已完成</div>' : ''}
      <button class="thumb-btn">开始涂色</button>`;
    card.querySelector('.thumb-btn').addEventListener('click', () => openColoring(pg.id));
    grid.appendChild(card);
  });
}

function openColoring(pageId) {
  const pg = COLORING_PAGES.find(p => p.id === pageId);
  if (!pg) return;
  C.page = pg;
  C.color = PALETTE[0].c;
  C.tool = 'fill';
  C.size = 2;
  C.fillHist = []; C.overlayHist = [];
  C.overlayEmpty = true; C.drawing = false;
  $('#cwTitle').textContent = pg.emoji + ' ' + pg.name;
  $('#cwStage').innerHTML = withPageStyle(pg.svg);
  setupRegions();
  renderPalette('cwPalette', c => { C.color = c; });
  syncToolUI();
  $('#coloringMenu').classList.add('hidden');
  $('#coloringWorkspace').classList.remove('hidden');
  sizeOverlay();
  updateProgress(true);
  Snd.ensure();
}

function setupRegions() {
  C.regions = $$('#cwStage .region');
  C.regionFills = C.regions.map(() => WHITE);
  C.regions.forEach(r => {
    r.setAttribute('fill', WHITE);
    r.setAttribute('stroke', '#374151');
    r.setAttribute('stroke-width', '5');
    r.setAttribute('stroke-linejoin', 'round');
    r.setAttribute('stroke-linecap', 'round');
    r.setAttribute('data-filled', '0');
  });
  $$('#cwStage .sn').forEach(p => {
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', '#374151');
    p.setAttribute('stroke-width', '5');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
  });
}

function pushFillHist() {
  C.fillHist.push(C.regionFills.slice());
  if (C.fillHist.length > 15) C.fillHist.shift();
}
function restoreRegions(snap) {
  C.regions.forEach((r, i) => {
    const col = snap[i];
    r.setAttribute('fill', col);
    r.setAttribute('data-filled', col === WHITE ? '0' : '1');
  });
  C.regionFills = snap.slice();
}

/* 画布压线层 */
const overlayEl = () => $('#cwOverlay');
function overlayCtx() { return overlayEl().getContext('2d'); }
function sizeOverlay() {
  const wrap = $('#cwStageWrap');
  if (!C.page) return;
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  const backup = C.overlayEmpty ? null : overlayEl().toDataURL();
  overlayEl().width = Math.round(w * dpr);
  overlayEl().height = Math.round(h * dpr);
  overlayEl().style.width = w + 'px';
  overlayEl().style.height = h + 'px';
  overlayCtx().setTransform(dpr, 0, 0, dpr, 0, 0);
  if (backup) {
    const img = new Image();
    img.onload = () => overlayCtx().drawImage(img, 0, 0, w, h);
    img.src = backup;
  }
}
function clearOverlay() {
  const dpr = window.devicePixelRatio || 1;
  overlayCtx().setTransform(1, 0, 0, 1, 0, 0);
  overlayCtx().clearRect(0, 0, overlayEl().width, overlayEl().height);
  overlayCtx().setTransform(dpr, 0, 0, dpr, 0, 0);
  C.overlayEmpty = true;
}
function brushPx() { return [6, 14, 26, 40][C.size - 1]; }
function evtPos(e) {
  const r = overlayEl().getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function bindColoringEvents() {
  /* 填色（点击 SVG 区域） */
  $('#cwStage').addEventListener('click', e => {
    if (C.tool !== 'fill' || !C.page) return;
    const r = e.target.closest('.region');
    if (!r) return;
    const idx = C.regions.indexOf(r);
    if (idx < 0) return;
    const cur = r.getAttribute('fill');
    if (cur === C.color && r.getAttribute('data-filled') === '1') { Snd.click(); return; }
    pushFillHist();
    r.setAttribute('fill', C.color);
    r.setAttribute('data-filled', '1');
    C.regionFills[idx] = C.color;
    recordColor(C.color);
    Snd.fill();
    updateProgress();
  });

  /* 画笔 / 橡皮 */
  const ov = overlayEl();
  ov.addEventListener('pointerdown', e => {
    if (C.tool === 'fill' || !C.page) return;
    e.preventDefault();
    try { ov.setPointerCapture(e.pointerId); } catch (err) {}
    C.drawing = true;
    C.last = evtPos(e);
    /* 落笔前记录当前状态，供"撤销"回退 */
    C.overlayHist.push(overlayEl().toDataURL());
    if (C.overlayHist.length > 12) C.overlayHist.shift();
    C.overlayEmpty = false;
    strokeDot(C.last);
  });
  ov.addEventListener('pointermove', e => {
    if (!C.drawing) return;
    const p = evtPos(e);
    strokeLine(C.last, p);
    C.last = p;
  });
  const endStroke = () => {
    C.drawing = false;
  };
  ov.addEventListener('pointerup', endStroke);
  ov.addEventListener('pointercancel', endStroke);

  /* 工具按钮 */
  $$('#cwTools .tool-btn').forEach(b => b.addEventListener('click', () => {
    C.tool = b.dataset.tool;
    syncToolUI();
    Snd.click();
  }));
  $$('#cwSizes button').forEach(b => {
    b.addEventListener('click', () => { C.size = +b.dataset.size; syncSizeUI('cwSizes', C.size); Snd.click(); });
  });
  $('#cwUndo').addEventListener('click', () => {
    if (C.tool === 'fill') {
      if (!C.fillHist.length) { toast('没有可以撤销的啦～'); return; }
      restoreRegions(C.fillHist.pop());
    } else {
      if (!C.overlayHist.length) { toast('没有可以撤销的啦～'); return; }
      const url = C.overlayHist.pop();
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        overlayCtx().setTransform(1, 0, 0, 1, 0, 0);
        overlayCtx().clearRect(0, 0, overlayEl().width, overlayEl().height);
        overlayEl().width = Math.round($('#cwStageWrap').clientWidth * dpr);
        overlayEl().height = Math.round($('#cwStageWrap').clientHeight * dpr);
        overlayCtx().setTransform(dpr, 0, 0, dpr, 0, 0);
        overlayCtx().drawImage(img, 0, 0, $('#cwStageWrap').clientWidth, $('#cwStageWrap').clientHeight);
      };
      img.src = url;
      C.overlayEmpty = C.overlayHist.length === 0;
    }
    Snd.click();
  });
  $('#cwClear').addEventListener('click', () => {
    if (C.overlayEmpty && C.regionFills.every(f => f === WHITE)) { toast('画布已经干干净净啦～'); return; }
    showConfirm('清空所有颜色和笔迹，重新开始吗？', () => {
      C.fillHist = []; C.overlayHist = [];
      C.regions.forEach(r => { r.setAttribute('fill', WHITE); r.setAttribute('data-filled', '0'); });
      C.regionFills = C.regions.map(() => WHITE);
      clearOverlay();
      updateProgress(true);
      Snd.paper();
      toast('好啦，重新开始！');
    });
  });
  $('#cwSave').addEventListener('click', saveColoring);
  $('#cwBack').addEventListener('click', () => { showColoringMenu(); Snd.click(); });
  $('#cwPalette').addEventListener('change', e => {
    if (e.target.type === 'color') { C.color = e.target.value; markPalette('cwPalette', C.color); Snd.click(); }
  });

  window.addEventListener('resize', debounce(() => { if (C.page && $('.page-coloring.active')) sizeOverlay(); }, 200));
}

function syncToolUI() {
  $$('#cwTools .tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === C.tool));
  overlayEl().classList.toggle('blocked', C.tool === 'fill');
  syncSizeUI('cwSizes', C.size);
}
function syncSizeUI(groupId, size) {
  $$('#' + groupId + ' button').forEach(b => b.classList.toggle('active', +b.dataset.size === size));
}
function strokeDot(p) {
  const ctx = overlayCtx();
  ctx.globalCompositeOperation = C.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.beginPath();
  ctx.arc(p.x, p.y, brushPx() / 2, 0, Math.PI * 2);
  ctx.fillStyle = C.color;
  ctx.fill();
}
function strokeLine(a, b) {
  const ctx = overlayCtx();
  ctx.globalCompositeOperation = C.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = C.color;
  ctx.lineWidth = brushPx();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function updateProgress(force = false) {
  if (!C.page || !C.regions.length) return;
  const colored = C.regionFills.filter(f => f !== WHITE).length;
  const total = C.regions.length;
  const pct = Math.round(colored / total * 100);
  $('#cwProgressFill').style.width = pct + '%';
  $('#cwProgressLabel').textContent = total - colored === 0
    ? '全部涂完啦！太棒了！🎉'
    : `涂色进度 ${pct}%（还剩 ${total - colored} 块）`;
  if (colored === total) {
    const doneMap = store.get(KEYS.colored, {});
    if (!doneMap[C.page.id]) {
      doneMap[C.page.id] = true;
      store.set(KEYS.colored, doneMap);
      addStars(3);
      Snd.bigWin();
      confettiBurst(150);
      toast('🎉 整幅画涂完啦！奖励 3 颗星星！');
    } else if (!force) {
      /* 重复涂完，轻声鼓励即可 */
    }
  }
}

function recordColor(col) {
  if (!col || col === WHITE) return;
  const list = store.get(KEYS.colorsUsed, []);
  if (!list.includes(col)) {
    list.push(col);
    store.set(KEYS.colorsUsed, list);
  }
}

function composeColoring() {
  return new Promise((resolve, reject) => {
    const svgEl = $('#cwStage svg');
    const xml = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = 800; cv.height = 600;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, 800, 600);
      ctx.drawImage(img, 0, 0, 800, 600);
      if (!C.overlayEmpty) {
        ctx.drawImage(overlayEl(), 0, 0, overlayEl().width, overlayEl().height, 0, 0, 800, 600);
      }
      resolve(cv.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = svgToDataUrl(xml);
  });
}

async function saveColoring() {
  if (!C.page) return;
  Snd.ensure();
  try {
    const url = await composeColoring();
    saveWork({ kind: 'coloring', pageId: C.page.id, pageName: C.page.name + '（涂色作品）', dataURL: url });
    addStars(1);
    Snd.save();
    confettiBurst(70);
    toast('💾 保存成功！作品放进画廊，+1 颗星星');
  } catch (e) {
    console.error(e);
    toast('保存失败，请再试一次');
  }
}

/* ---------------- 自由绘画 ---------------- */
const P = {
  ready: false, tool: 'brush', size: 2, color: PALETTE[2].c,
  paper: '#FFFFFF', hist: [], stamp: '⭐', drawing: false, last: null
};

function initPaint() {
  P.ready = true;
  const cv = $('#paintCanvas');
  const ctx = cv.getContext('2d');
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, 800, 600);

  renderPalette('paintPalette', c => { P.color = c; });
  renderStamps();
  renderPapers();

  $$('#paintTools .tool-btn').forEach(b => b.addEventListener('click', () => {
    P.tool = b.dataset.tool;
    $$('#paintTools .tool-btn').forEach(x => x.classList.toggle('active', x === b));
    if (P.tool === 'stamp') { /* 印章通过 stampGroup 选择 */ }
    Snd.click();
  }));
  $$('#paintSizes button').forEach(b => b.addEventListener('click', () => {
    P.size = +b.dataset.size;
    syncSizeUI('paintSizes', P.size);
    Snd.click();
  }));

  cv.addEventListener('pointerdown', e => {
    Snd.ensure();
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    P.drawing = true;
    P.last = pPos(e);
    pushPaintHist();
    if (P.tool === 'stamp') { drawStamp(P.last); endPaintStroke(); return; }
    dot(P.last);
  });
  cv.addEventListener('pointermove', e => {
    if (!P.drawing) return;
    const p = pPos(e);
    line(P.last, p);
    P.last = p;
  });
  const endPaintStroke = () => { P.drawing = false; };
  cv.addEventListener('pointerup', endPaintStroke);
  cv.addEventListener('pointercancel', endPaintStroke);

  $('#paintUndo').addEventListener('click', () => {
    if (!P.hist.length) { toast('没有可以撤销的啦～'); return; }
    const url = P.hist.pop();
    const img = new Image();
    img.onload = () => { cv.getContext('2d').drawImage(img, 0, 0); };
    img.src = url;
    Snd.click();
  });
  $('#paintNew').addEventListener('click', () => {
    pushPaintHist();
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, 800, 600);
    Snd.paper();
    toast('新画布准备好啦！');
  });
  $('#paintSave').addEventListener('click', () => {
    Snd.ensure();
    try {
      const flush = document.createElement('canvas');
      flush.width = 800; flush.height = 600;
      const fctx = flush.getContext('2d');
      fctx.fillStyle = WHITE;
      fctx.fillRect(0, 0, 800, 600);
      fctx.drawImage(cv, 0, 0);
      const url = flush.toDataURL('image/png');
      saveWork({ kind: 'paint', pageId: 'free', pageName: '自由绘画作品', dataURL: url });
      addStars(1);
      Snd.save();
      confettiBurst(70);
      toast('💾 保存成功！作品放进画廊，+1 颗星星');
    } catch (e) {
      console.error(e);
      toast('保存失败，请再试一次');
    }
  });

  $('#paintPalette').addEventListener('change', e => {
    if (e.target.type === 'color') { P.color = e.target.value; markPalette('paintPalette', P.color); }
  });
}

function pPos(e) {
  const r = $('#paintCanvas').getBoundingClientRect();
  return { x: (e.clientX - r.left) * (800 / r.width), y: (e.clientY - r.top) * (600 / r.height) };
}
function pushPaintHist() {
  P.hist.push($('#paintCanvas').toDataURL());
  if (P.hist.length > 12) P.hist.shift();
}
function pWidth() {
  const base = { brush: [5, 12, 22, 34], marker: [8, 18, 30, 44], highlight: [18, 30, 46, 64], eraser: [14, 28, 48, 70] };
  if (P.tool === 'stamp') return 0;
  return base[P.tool][P.size - 1];
}
function dot(p) {
  const ctx = $('#paintCanvas').getContext('2d');
  const w = pWidth();
  if (P.tool === 'highlight') {
    ctx.globalAlpha = 0.32;
  } else {
    ctx.globalAlpha = P.tool === 'marker' ? 0.9 : 1;
  }
  ctx.globalCompositeOperation = P.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.beginPath();
  ctx.arc(p.x, p.y, w / 2, 0, Math.PI * 2);
  ctx.fillStyle = P.color;
  ctx.fill();
  ctx.globalAlpha = 1;
}
function line(a, b) {
  const ctx = $('#paintCanvas').getContext('2d');
  const w = pWidth();
  ctx.globalCompositeOperation = P.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.globalAlpha = P.tool === 'highlight' ? 0.32 : (P.tool === 'marker' ? 0.9 : 1);
  ctx.strokeStyle = P.color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
function drawStamp(p) {
  const ctx = $('#paintCanvas').getContext('2d');
  const size = [22, 34, 52, 78][P.size - 1];
  ctx.globalAlpha = 0.95;
  ctx.font = size + 'px "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(P.stamp, p.x, p.y);
  ctx.globalAlpha = 1;
  Snd.stamp();
}
function renderStamps() {
  const g = $('#stampGroup');
  g.innerHTML = '';
  STAMPS.forEach(s => {
    const b = document.createElement('button');
    b.className = 'stamp-btn' + (s === P.stamp ? ' active' : '');
    b.textContent = s;
    b.addEventListener('click', () => {
      P.stamp = s; P.tool = 'stamp';
      $$('#stampGroup .stamp-btn').forEach(x => x.classList.toggle('active', x === b));
      $$('#paintTools .tool-btn').forEach(x => x.classList.toggle('active', false));
      Snd.click();
    });
    g.appendChild(b);
  });
}
function renderPapers() {
  const g = $('#paperGroup');
  g.innerHTML = '';
  PAPERS.forEach(p => {
    const b = document.createElement('button');
    b.className = 'paper-btn' + (p.c === P.paper ? ' active' : '');
    b.style.background = p.c;
    b.title = p.n;
    b.addEventListener('click', () => {
      P.paper = p.c;
      $$('#paperGroup .paper-btn').forEach(x => x.classList.toggle('active', x === b));
      pushPaintHist();
      const ctx = $('#paintCanvas').getContext('2d');
      ctx.fillStyle = p.c;
      ctx.fillRect(0, 0, 800, 600);
      Snd.paper();
    });
    g.appendChild(b);
  });
  const custom = document.createElement('button');
  custom.className = 'paper-btn custom';
  custom.style.background = 'conic-gradient(#ff4b4b, #ffd500, #2ecc40, #3498db, #9b59b6, #ff4b4b)';
  custom.title = '自定义画纸';
  custom.innerHTML = '<input type="color" value="#FFFFFF">';
  custom.querySelector('input').addEventListener('input', e => {
    P.paper = e.target.value;
    $$('#paperGroup .paper-btn').forEach(x => x.classList.toggle('active', x === custom));
    pushPaintHist();
    const ctx = $('#paintCanvas').getContext('2d');
    ctx.fillStyle = e.target.value;
    ctx.fillRect(0, 0, 800, 600);
  });
  g.appendChild(custom);
}

/* ---------------- 调色盘（共享） ---------------- */
function fullPalette() {
  const extra = store.get(KEYS.palette, []);
  return PALETTE.concat(extra);
}
function withHash(id) { return id[0] === '#' ? id : '#' + id; }
function renderPalette(containerId, onPick) {
  const el = $(withHash(containerId));
  el.innerHTML = '';
  fullPalette().forEach(s => {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.style.background = s.c;
    b.title = s.n;
    b.dataset.c = s.c;
    b.addEventListener('click', () => { onPick(s.c); markPalette(containerId, s.c); Snd.click(); });
    el.appendChild(b);
  });
  const custom = document.createElement('label');
  custom.className = 'swatch custom';
  custom.style.background = '#ffffff';
  custom.innerHTML = '<input type="color" value="#ff5fa2">';
  el.appendChild(custom);
  markPalette(containerId);
}
function markPalette(containerId, color) {
  const el = $(withHash(containerId));
  const cur = color !== undefined ? color : (containerId === 'cwPalette' || containerId === '#cwPalette' ? C.color : P.color);
  el.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s.dataset.c === cur));
}

/* ---------------- 色彩学堂 ---------------- */
const Learn = {
  mixA: null, mixB: null, tab: 'mix', game: 'recognize',
  quiz: store.get(KEYS.quiz, { recognize: 0, warm: 0, comp: 0 }),
  answering: false
};

function initLearn() {
  /* 调色盘基础的 12 色 */
  const pal = $('#mixPalette');
  pal.innerHTML = '';
  MIX_BASE.forEach(s => {
    const b = document.createElement('button');
    b.className = 'mix-chip';
    b.style.background = s.c;
    b.title = s.n;
    b.dataset.c = s.c;
    b.addEventListener('click', () => pickMix(s.c));
    pal.appendChild(b);
  });
  $('#mixAdd').addEventListener('click', () => {
    const res = mixResult();
    if (!res) { toast('先选两个颜色再调色吧～'); return; }
    const extra = store.get(KEYS.palette, []);
    if (!extra.some(x => x.c === res)) {
      extra.push({ c: res, n: '我调的颜色' });
      store.set(KEYS.palette, extra);
    }
    Snd.success();
    toast('🎨 新颜色已加入调色盘！');
  });
  updateMixUI();
  buildWheel();
  bindGameTab();
}

function pickMix(c) {
  if (!Learn.mixA) { Learn.mixA = c; }
  else if (!Learn.mixB) { Learn.mixB = c; }
  else { Learn.mixA = c; Learn.mixB = null; }
  updateMixUI();
  Snd.click();
}
function mixColors(a, b) {
  const p = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const [ra, ga, ba] = p(a);
  const [rb, gb, bb] = p(b);
  const f = (x, y) => Math.round((x + y) / 2);
  return '#' + [f(ra, rb), f(ga, gb), f(ba, bb)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function mixResult() {
  if (!Learn.mixA || !Learn.mixB) return null;
  return Learn.mixA === Learn.mixB ? Learn.mixA : mixColors(Learn.mixA, Learn.mixB);
}
function updateMixUI() {
  const setBit = (id, bit) => {
    const el = $(withHash(id));
    if (bit) {
      el.style.background = bit;
      el.classList.remove('empty');
      el.textContent = MIX_BASE.find(s => s.c === bit)?.n || '颜色';
    } else {
      el.style.background = '';
      el.classList.add('empty');
      el.textContent = '在这里';
    }
  };
  setBit('mixBitA', Learn.mixA);
  setBit('mixBitB', Learn.mixB);
  const res = mixResult();
  const rEl = $('#mixResult');
  if (res) {
    rEl.style.background = res;
    rEl.classList.remove('empty');
    rEl.textContent = '变出来啦！';
    $('#mixCount').textContent = store.get(KEYS.mix, 0);
    if (Learn.mixA && Learn.mixB && !Learn._counted) {
      Learn._counted = true;
      const n = store.get(KEYS.mix, 0) + 1;
      store.set(KEYS.mix, n);
      $('#mixCount').textContent = n;
      Snd.fill();
      if (n % 3 === 0) { addStars(1); toast('调色 3 次成就 +1 星星 ⭐'); }
    }
  } else {
    rEl.style.background = '';
    rEl.classList.add('empty');
    rEl.textContent = '新颜色';
    Learn._counted = false;
  }
}

function buildWheel() {
  const cx = 210, cy = 210, R = 190, rIn = 66;
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" width="100%">';
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * 360 - 90;
    const a1 = ((i + 1) / N) * 360 - 90;
    const rad = a => (a * Math.PI) / 180;
    const p = (a, r) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
    const [x1, y1] = p(a0, R), [x2, y2] = p(a1, R);
    const [x3, y3] = p(a1, rIn), [x4, y4] = p(a0, rIn);
    const hue = Math.round(i * (360 / N));
    svg += `<path d="M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 0 ${x4} ${y4} Z" fill="hsl(${hue}, 85%, 62%)" stroke="#fff" stroke-width="3"/>`;
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="${rIn}" fill="#fff" stroke="#e5d9f5" stroke-width="3"/>`;
  svg += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="22" font-weight="800" fill="#3b3a55">色相环</text>`;
  svg += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="14" fill="#6b6a8e">12 个颜色手拉手</text>`;
  svg += '</svg>';
  $('#wheelSvg').innerHTML = svg;
}

/* 色彩小游戏 */
function bindGameTab() {
  $$('#learnGames .tab-btn').forEach(b => b.addEventListener('click', () => {
    Learn.game = b.dataset.game;
    $$('#learnGames .tab-btn').forEach(x => x.classList.toggle('active', x === b));
    newQuestion();
  }));
  $$('.learn-tabs .tab-btn').forEach(b => b.addEventListener('click', () => {
    Learn.tab = b.dataset.learn;
    $$('.learn-tabs .tab-btn').forEach(x => x.classList.toggle('active', x === b));
    $$('.learn-panel').forEach(p => p.classList.add('hidden'));
    $('#learn' + { mix: 'Mix', wheel: 'Wheel', games: 'Games' }[Learn.tab]).classList.remove('hidden');
    Snd.click();
    if (Learn.tab === 'games') newQuestion();
  }));
  newQuestion();
}

function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }
function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function quizWins() { return Learn.quiz.recognize + Learn.quiz.warm + Learn.quiz.comp; }

function newQuestion() {
  if (!Learn.game) return;
  Learn.answering = false;
  const box = $('#gameBox');
  const g = Learn.game;

  if (g === 'recognize') {
    const target = rnd(PALETTE.filter(s => s.c !== '#FFFFFF'));
    const others = shuffle(PALETTE.filter(s => s.c !== target.c && s.c !== '#FFFFFF')).slice(0, 2);
    const opts = shuffle([target.c, ...others.map(o => o.c)]);
    box.innerHTML = `
      <div class="game-target">👀 找一找，下面哪个颜色和上面的一样？</div>
      <div class="game-swatch" style="background:${target.c}"></div>
      <div class="game-options">${opts.map(c => `<button class="game-opt" data-c="${c}"><span class="opt-emoji" style="background:${c}"></span></button>`).join('')}</div>
      <div class="game-stats">答对 <b>${Learn.quiz.recognize}</b> 次</div>`;
    bindGameOptions(box, c => c === target.c, 'recognize');
    return;
  }

  if (g === 'warmcold') {
    const warm = Math.random() < 0.5;
    const color = rnd(warm ? WARM_COLORS : COOL_COLORS);
    box.innerHTML = `
      <div class="game-target">🔥🧊 这个颜色是暖暖的，还是凉凉的？</div>
      <div class="game-swatch" style="background:${color}"></div>
      <div class="game-options">
        <button class="game-opt" data-ans="warm"><span class="opt-emoji" style="background:#FF6B35">🔥 暖</span></button>
        <button class="game-opt" data-ans="cool"><span class="opt-emoji" style="background:#3B82F6">🧊 冷</span></button>
      </div>
      <div class="game-stats">答对 <b>${Learn.quiz.warm}</b> 次</div>`;
    bindGameOptions(box, c => c === (warm ? 'warm' : 'cool'), 'warm');
    return;
  }

  if (g === 'comp') {
    const pair = rnd(COMP_PAIRS);
    const choose = Math.random() < 0.5 ? pair : { a: pair.b, b: pair.a };
    const allColors = COMP_PAIRS.flatMap(p => [p.a, p.b]).filter(s => s !== choose.b);
    const else1 = rnd(allColors);
    const else2 = rnd(allColors.filter(s => s !== else1));
    const opts = shuffle([choose.b, else1, else2]);
    box.innerHTML = `
      <div class="game-target">🤝 谁是这个颜色最好的朋友（对比色）？</div>
      <div class="game-swatch" style="background:${choose.a}"></div>
      <div class="game-options">${opts.map(c => `<button class="game-opt" data-c="${c}"><span class="opt-emoji" style="background:${c}"></span></button>`).join('')}</div>
      <div class="game-stats">答对 <b>${Learn.quiz.comp}</b> 次</div>`;
    bindGameOptions(box, c => c === choose.b, 'comp');
    return;
  }
}

function bindGameOptions(box, isRight, gameKey) {
  box.querySelectorAll('.game-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      if (Learn.answering) return;
      if (isRight(btn.dataset.c !== undefined ? btn.dataset.c : btn.dataset.ans)) {
        Snd.success();
        confettiBurst(45);
        Learn.quiz[gameKey]++;
        store.set(KEYS.quiz, Learn.quiz);
        Learn.answering = true;
        addStars(1);
        const total = quizWins();
        toast(`✅ 答对啦！+1 颗星星（共答对 ${total} 次）`);
        setTimeout(newQuestion, 750);
      } else {
        Snd.fail();
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 450);
        toast('再想想，换个试试～');
      }
    });
  });
}

/* ---------------- 成长之旅 ---------------- */
const ACHV = [
  { id: 'a1', icon: '🖍️', name: '第一次涂色', desc: '完整涂完一幅画', pct: () => Math.min(100, Object.keys(store.get(KEYS.colored, {})).length * 100) },
  { id: 'a2', icon: '🎨', name: '涂色小能手', desc: '保存 3 幅涂色作品', pct: () => Math.min(100, worksByKind('coloring').length / 3 * 100) },
  { id: 'a3', icon: '✏️', name: '小小创作家', desc: '保存 3 幅自由绘画', pct: () => Math.min(100, worksByKind('paint').length / 3 * 100) },
  { id: 'a4', icon: '🧪', name: '调色大师', desc: '调色实验 5 次', pct: () => Math.min(100, store.get(KEYS.mix, 0) / 5 * 100) },
  { id: 'a5', icon: '💡', name: '色彩小达人', desc: '游戏答题正确 10 次', pct: () => Math.min(100, quizTotal() / 10 * 100) },
  { id: 'a6', icon: '🌈', name: '色彩收藏家', desc: '使用过 10 种不同颜色', pct: () => Math.min(100, store.get(KEYS.colorsUsed, []).length / 10 * 100) }
];
function worksByKind(k) { return store.get(KEYS.works, []).filter(w => w.kind === k); }
function quizTotal() { const q = store.get(KEYS.quiz, {}); return (q.recognize || 0) + (q.warm || 0) + (q.comp || 0); }
function achvDone(a) {
  switch (a.id) {
    case 'a1': return Object.keys(store.get(KEYS.colored, {})).length >= 1;
    case 'a2': return worksByKind('coloring').length >= 3;
    case 'a3': return worksByKind('paint').length >= 3;
    case 'a4': return store.get(KEYS.mix, 0) >= 5;
    case 'a5': return quizTotal() >= 10;
    case 'a6': return store.get(KEYS.colorsUsed, []).length >= 10;
  }
  return false;
}
function countUnlocked() { return ACHV.filter(achvDone).length; }

function renderJourney() {
  const list = $('#achvList');
  list.innerHTML = '';
  const bonus = store.get(KEYS.achvBonus, []);
  ACHV.forEach(a => {
    const done = achvDone(a);
    if (done && !bonus.includes(a.id)) {
      bonus.push(a.id);
      store.set(KEYS.achvBonus, bonus);
      addStars(3);
      setTimeout(() => { toast(`🏅 解锁徽章「${a.name}」！+3 颗星星`); confettiBurst(90); Snd.bigWin(); }, 600);
    }
    const pct = Math.min(100, Math.round(a.pct()));
    const card = document.createElement('div');
    card.className = 'achv-card ' + (done ? 'unlocked' : 'locked');
    card.innerHTML = `
      <div class="achv-icon">${a.icon}</div>
      <div class="achv-info">
        <div class="achv-name">${a.name}</div>
        <div class="achv-desc">${a.desc}</div>
        <div class="achv-progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="achv-status">${done ? '🏅 已解锁' : `${pct}%`}</div>`;
    list.appendChild(card);
  });
}

/* ---------------- 画廊 ---------------- */
function saveWork(w) {
  const works = store.get(KEYS.works, []);
  works.unshift({ ...w, id: Date.now(), date: new Date().toLocaleDateString('zh-CN') });
  store.set(KEYS.works, works.slice(0, 30));
}
function deleteWork(id) {
  const works = store.get(KEYS.works, []).filter(x => x.id !== id);
  store.set(KEYS.works, works);
  renderGallery();
}
function renderGallery() {
  const works = store.get(KEYS.works, []);
  $('#galleryEmpty').classList.toggle('hidden', works.length > 0);
  const grid = $('#galleryGrid');
  grid.innerHTML = '';
  works.forEach(w => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    const tag = w.kind === 'coloring' ? '🖍️ 涂色' : '✏️ 绘画';
    card.innerHTML = `
      <img src="${w.dataURL}" alt="${w.pageName}">
      <div class="gallery-meta">
        <div class="gallery-name">${tag} · ${w.pageName}</div>
        <div class="gallery-date">📅 ${w.date}</div>
      </div>
      <div class="gallery-actions">
        <button class="pill-btn" data-act="view">👁️ 查看</button>
        <button class="pill-btn" data-act="dl">⬇️ 下载</button>
        <button class="pill-btn" data-act="del">🗑️ 删除</button>
      </div>`;
    card.querySelector('img').addEventListener('click', () => openLightbox(w));
    card.querySelector('[data-act="view"]').addEventListener('click', () => openLightbox(w));
    card.querySelector('[data-act="dl"]').addEventListener('click', () => downloadWork(w));
    card.querySelector('[data-act="del"]').addEventListener('click', () =>
      showConfirm('确定删除这幅作品吗？', () => { deleteWork(w.id); Snd.paper(); toast('已删除'); }));
    grid.appendChild(card);
  });
}
function downloadWork(w) {
  const a = document.createElement('a');
  a.href = w.dataURL;
  a.download = '小小画家-' + (w.pageName || '作品') + '-' + Date.now() + '.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('📥 正在下载到你的设备');
}
function openLightbox(w) {
  $('#lightboxImg').src = w.dataURL;
  $('#lbDownload').href = w.dataURL;
  $('#lbDownload').download = '小小画家-' + (w.pageName || '作品') + '.png';
  $('#lightbox').classList.remove('hidden');
  Snd.click();
}
function bindLightbox() {
  $('#lbClose').addEventListener('click', () => $('#lightbox').classList.add('hidden'));
  $('#lightbox').addEventListener('click', e => { if (e.target === $('#lightbox')) $('#lightbox').classList.add('hidden'); });
}

/* ---------------- 工具 ---------------- */
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ---------------- 启动 ---------------- */
function init() {
  Snd.muted = !!store.get(KEYS.muted, false);
  stars = store.get(KEYS.stars, 0);

  /* 首次交互时解锁音频 */
  document.addEventListener('pointerdown', () => Snd.ensure(), { once: false });

  /* 导航 */
  $$('.nav-btn').forEach(b => b.addEventListener('click', () => { showPage(b.dataset.page); Snd.click(); }));
  $$('[data-goto]').forEach(c => c.addEventListener('click', () => { showPage(c.dataset.goto); Snd.click(); }));

  initHome();
  bindColoringEvents();
  initLearn();
  bindLightbox();
  renderStars();
  showPage('home');
}

document.addEventListener('DOMContentLoaded', init);