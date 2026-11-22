(() => {
'use strict';
const D = window.JP, P = D.params, CFG = D.config, PR = window.JPPricing;
const $ = (s, el = document) => el.querySelector(s);
const panel = $('#panel');

/* ---------- helpers ---------- */
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ESC[c]);
const fmt = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' zł';
const fmt1 = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const tel = n => String(n).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const phoneOk = v => v.replace(/\D/g, '').replace(/^48(?=\d{9}$)/, '').length === 9;
const salonOf = id => D.salons.find(x => x.id === id) || D.salons[0];
const layoutName = id => D.layouts.find(l => l.id === id).name;
function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous'; s.dataset.src = src;
    s.onload = res; s.onerror = () => { s.remove(); rej(new Error('script')); };
    document.head.appendChild(s);
  });
}

const STEPS = ['Układ', 'Gatunek', 'Klasa', 'Format', 'Kolor', 'Zakres', 'Metraż', 'Dane'];
const state = { step: 0 };

/* ---------- pictograms ---------- */
function picto(id) {
  let s = '';
  if (id === 'mijanka') {
    for (let r = 0; r < 8; r++) {
      const off = [0, -22, -11, -33][r % 4];
      for (let x = off; x < 130; x += 44) s += `<rect x="${x}" y="${r * 10}" width="44" height="10" />`;
    }
  } else if (id === 'jodelka_klasyczna') {
    const w = 9, L = 36; let g = '';
    for (let t = -6; t <= 6; t++) for (let k = -8; k <= 12; k++) {
      const ox = t * L, oy = -t * L;
      g += `<rect x="${ox + k * w}" y="${oy + k * w}" width="${L}" height="${w}"/><rect x="${ox + k * w - w}" y="${oy + k * w}" width="${w}" height="${L}"/>`;
    }
    s = `<g transform="translate(60 40) rotate(45) translate(-20 -20)">${g}</g>`;
  } else {
    const a = 20, h = 9;
    for (let c2 = -1; c2 < 4; c2++) for (let r = -3; r < 12; r++) {
      const x = c2 * 2 * a, y = r * h;
      s += `<polygon points="${x},${y} ${x + a},${y + a} ${x + a},${y + a + h} ${x},${y + h}"/>`;
      s += `<polygon points="${x + a},${y + a} ${x + 2 * a},${y} ${x + 2 * a},${y + h} ${x + a},${y + a + h}"/>`;
    }
  }
  const uid = 'cp-' + id + '-' + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" class="picto" aria-hidden="true"><defs><clipPath id="${uid}"><rect width="120" height="80" rx="6"/></clipPath></defs><g clip-path="url(#${uid})" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round">${s}</g></svg>`;
}

/* ---------- availability ---------- */
const formatsFor = (layout, species, cls) => PR.formatsFor(D, layout, species, cls);
const speciesOk = sp => formatsFor(state.layout, sp).length > 0;
const classOk = cl => formatsFor(state.layout, state.species, cl).length > 0;
const curFormat = () => D.formats.find(f => f.id === state.format);
const included = f => PR.included(f, state.species, state.cls);

/* ---------- pricing (ten sam moduł liczy cenę w n8n) ---------- */
const selection = () => ({
  layout: state.layout, species: state.species, cls: state.cls, format: state.format,
  finishType: state.finishType, finish: state.finish, coat: state.coat, color: state.color,
  v4: !!state.v4, sz: !!state.sz, scope: state.scope, area: +state.area
});
const quote = () => PR.quote(D, selection());

/* ---------- swatch (zdjęcia dekorów Jawor-Parkiet) ---------- */
function decorNow() {
  if (state.finishType === 'ci' && state.color) { const c = D.colors.find(x => x[0] === state.color); return { tone: c[1], img: c[2] }; }
  const cl = state.species && state.cls && (D.classes[state.species] || []).find(c => c.id === state.cls);
  if (cl) return { tone: cl.tone, img: cl.img };
  const sp = D.species.find(s => s.id === state.species);
  return sp ? { tone: sp.tone, img: sp.img } : { tone: '#cdb58f', img: null };
}
const isDark = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) < 120; };
const woodStyle = (tone, img) => `--tone:${tone};color:${isDark(tone) ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.35)'}` + (img ? `;background-image:url('${img}');background-size:cover;background-position:center` : '');
const decorStyle = () => { const d = decorNow(); return woodStyle(d.tone, d.img); };

/* ---------- summary ---------- */
function finishLabel() {
  if (state.finishType === 'ci') return `Color Inspiration ${state.color || ''} · ${state.coat === 'fh' ? 'Fusion Hybrid' : 'olejowosk'}`;
  const f = curFormat(); const inc = f ? included(f) : {};
  const parts = [state.finish === 'OL' ? 'Olejowosk transparentny' : 'Lakier UV transparentny'];
  if (state.v4 || inc.V4) parts.push('V4'); if (state.sz || inc.SZ) parts.push('szczotkowanie');
  return parts.join(' · ');
}
function renderSummary() {
  const rows = [];
  if (state.layout) rows.push(['Układ', layoutName(state.layout)]);
  if (state.species) rows.push(['Drewno', D.species.find(s => s.id === state.species).name]);
  if (state.cls) rows.push(['Klasa', state.cls]);
  if (state.format) rows.push(['Format', curFormat().name]);
  if (state.finishType) rows.push(['Wykończenie', finishLabel()]);
  if (state.scope) rows.push(['Zakres', PR.SCOPES[state.scope].install ? 'Z montażem' : 'Sam materiał']);
  if (+state.area) rows.push(['Powierzchnia', fmt1(+state.area) + ' m² netto']);
  $('#sumList').innerHTML = rows.length ? rows.map(r => `<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('') : '<dd class="muted">Zacznij od wyboru układu.</dd>';
  const sw = $('#sumSwatch');
  sw.style.cssText = decorStyle();
  sw.innerHTML = state.layout ? picto(state.layout) : '';
}

/* ---------- step templates ---------- */
const card = o => `<button type="button" class="opt ${o.sel ? 'is-sel' : ''}" data-v="${esc(o.v)}" ${o.dis ? 'disabled aria-disabled="true"' : ''} aria-pressed="${!!o.sel}">${o.html}</button>`;
const head = (t, s) => `<h3 class="step__t" tabindex="-1">${t}</h3>${s ? `<p class="step__s">${s}</p>` : ''}`;

function stepLayout() {
  return head('Jak chcesz ułożyć podłogę?', 'Każdy układ ma inny zapas na docinki – doliczymy go automatycznie.') +
  `<div class="opts opts--3" data-k="layout">${D.layouts.map(l => card({ v: l.id, sel: state.layout === l.id,
    html: `<span class="opt__pic">${picto(l.id)}</span><span class="opt__n">${l.name}</span><span class="opt__d">${l.sub}</span><span class="chip">zapas ${l.waste}</span>` })).join('')}</div>`;
}
function stepSpecies() {
  return head('Jaki gatunek drewna?', `Pokazuję gatunki dostępne w układzie: <b>${layoutName(state.layout)}</b>.`) +
  `<div class="opts opts--4" data-k="species">${D.species.map(s => { const ok = speciesOk(s.id); return card({ v: s.id, sel: state.species === s.id, dis: !ok,
    html: `<span class="wood" style="${woodStyle(s.tone, s.img)}" role="img" aria-label="Deska: ${s.name}"></span><span class="opt__n">${s.name}</span><span class="opt__d">${ok ? s.sub : 'Niedostępne w tym układzie'}</span>` }); }).join('')}</div>`;
}
const knotDots = n => `<span class="knots" role="img" aria-label="Ilość cech drewna: ${n} z 3">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
function stepClass() {
  const list = D.classes[state.species];
  return head('Ile natury w podłodze?', 'Klasa selekcji określa, ile sęków, bieli i różnic w barwie znajdzie się w Twojej podłodze.') +
  `<div class="opts opts--${list.length > 3 ? 4 : 3}" data-k="cls">${list.map(c => { const ok = classOk(c.id); return card({ v: c.id, sel: state.cls === c.id, dis: !ok,
    html: `<span class="wood wood--cls" style="${woodStyle(c.tone, c.img)}" role="img" aria-label="Wygląd klasy ${c.name}"></span><span class="opt__n">${c.name}</span>${knotDots(c.knots)}<span class="opt__d">${ok ? c.sub : 'Niedostępne w tym układzie'}</span>` }); }).join('')}</div>`;
}
function plankSvg(f) {
  const max = 2250, W = 200, Lpx = 40 + f.l / max * 160, Hpx = 5 + f.w / 260 * 26;
  return `<svg viewBox="0 0 ${W + 4} 40" class="plank" aria-hidden="true"><rect x="2" y="${20 - Hpx / 2}" width="${Lpx}" height="${Hpx}" rx="1.5"/></svg>`;
}
function stepFormat() {
  const list = formatsFor(state.layout, state.species, state.cls);
  return head('Wielkość elementu', 'Większy format optycznie powiększa wnętrze, mniejszy – podkreśla wzór.') +
  `<div class="opts opts--list" data-k="format">${list.map(f => card({ v: f.id, sel: state.format === f.id,
    html: `<span class="row"><span><span class="opt__n">${f.name}</span><span class="opt__d">${f.dims} · grubość ${f.thick}</span>${f.note ? `<span class="opt__d opt__d--note">${f.note}</span>` : ''}</span>${plankSvg(f)}</span>` })).join('')}</div>`;
}
function stepColor() {
  const f = curFormat(); const tOk = PR.transparentOk(f, state.species, state.cls), cOk = PR.ciOk(f, state.species, state.cls);
  if (!state.finishType) state.finishType = tOk ? 't' : 'ci';
  if (state.finishType === 't' && !tOk) state.finishType = 'ci';
  if (state.finishType === 'ci' && !cOk) state.finishType = 't';
  const inc = included(f);
  const tab = `<div class="tabs" role="group" aria-label="Rodzaj wykończenia">
    <button type="button" class="tab ${state.finishType === 't' ? 'is-sel' : ''}" data-ft="t" ${tOk ? '' : 'disabled'} aria-pressed="${state.finishType === 't'}">Transparentne</button>
    <button type="button" class="tab ${state.finishType === 'ci' ? 'is-sel' : ''}" data-ft="ci" ${cOk ? '' : 'disabled'} aria-pressed="${state.finishType === 'ci'}">Color Inspiration · 16 kolorów</button></div>`;
  let body;
  if (state.finishType === 't') {
    state.finish = state.finish || 'LA';
    const tog = (k, label, sub) => inc[k]
      ? `<div class="toggle is-inc"><span><b>${label}</b><small>${sub}</small></span><span class="chip chip--ok">w cenie</span></div>`
      : `<label class="toggle"><span><b>${label}</b><small>${sub}</small></span><span class="chip">+${D.surcharge[k]} zł/m²</span><input type="checkbox" data-tg="${k.toLowerCase()}" ${state[k.toLowerCase()] ? 'checked' : ''}><i class="sw"></i></label>`;
    body = `<div class="opts opts--2" data-k="finish">
      ${card({ v: 'LA', sel: state.finish === 'LA', html: `<span class="opt__n">Lakier UV transparentny</span><span class="opt__d">8 warstw lakieru. Najłatwiejszy w codziennym utrzymaniu.</span>` })}
      ${card({ v: 'OL', sel: state.finish === 'OL', html: `<span class="opt__n">Olejowosk transparentny</span><span class="opt__d">4 warstwy olejowosku. Naturalny, aksamitny dotyk. W cenie lakieru.</span>` })}
    </div>
    <div class="toggles">${tog('V4', 'Fazowanie V4', 'Delikatnie ścięte krawędzie każdej klepki')}${tog('SZ', 'Szczotkowanie', 'Wyczuwalna, uwypuklona struktura słojów')}</div>`;
  } else {
    state.coat = state.coat || 'ol';
    body = `<p class="step__s">Tylko dąb. Szczotkowanie i fazowanie V4 w cenie. Zdjęcia dekorów pochodzą od producenta, ale ekran zawsze trochę zmienia barwę – prawdziwe próbki czekają w salonie.</p>
    <div class="colors" data-k="color">${D.colors.map(([n, h, img]) => `<button type="button" class="color ${state.color === n ? 'is-sel' : ''}" data-v="${n}" aria-pressed="${state.color === n}" aria-label="Kolor ${n}"><span class="wood wood--sq" style="${woodStyle(h, img)}"></span><span>${n}</span></button>`).join('')}</div>
    <div class="opts opts--2" data-k="coat">
      ${card({ v: 'ol', sel: state.coat === 'ol', html: `<span class="opt__n">Olejowosk</span><span class="opt__d">4 warstwy olejowosku utwardzanego oksydacyjnie.</span>` })}
      ${card({ v: 'fh', sel: state.coat === 'fh', html: `<span class="opt__n">Fusion Hybrid <span class="chip chip--acc">nowość</span></span><span class="opt__d">Ultramat, 14× odporniejszy na ścieranie niż olejowosk. Bez okresowego olejowania.</span>` })}
    </div>`;
  }
  return head('Kolor i wykończenie') + tab + body;
}
function stepScope() {
  return head('Sam materiał czy z montażem?', 'Montaż wykonuje ekipa salonu – klejenie całopowierzchniowe zgodne z warunkami 30-letniej gwarancji.') +
  `<div class="opts opts--3" data-k="scope">
    ${card({ v: 'install8', sel: state.scope === 'install8', html: `<span class="opt__n">Z montażem – mieszkanie lub dom</span><span class="opt__d">Mieszkanie do 150 m² lub dom do 300 m² powierzchni użytkowej. W cenie montaż, klej i grunt.</span><span class="chip chip--ok">VAT 8%</span>` })}
    ${card({ v: 'install23', sel: state.scope === 'install23', html: `<span class="opt__n">Z montażem – lokal użytkowy</span><span class="opt__d">Biuro, sklep, lokal usługowy lub większy dom/mieszkanie. W cenie montaż, klej i grunt.</span><span class="chip">VAT 23%</span>` })}
    ${card({ v: 'material', sel: state.scope === 'material', html: `<span class="opt__n">Sam materiał</span><span class="opt__d">Podłoga z zapasem + informacja, ile kleju i gruntu potrzebujesz.</span><span class="chip">VAT 23%</span>` })}
  </div>
  <p class="micro">Przy domach powyżej 300 m² i mieszkaniach powyżej 150 m² stawka 8% dotyczy tylko części powierzchni – dokładne rozliczenie przygotuje salon.</p>`;
}
function stepArea() {
  const w = Math.round(P.waste[state.layout] * 100);
  const rooms = state.rooms || [];
  return head('Ile metrów podłogi?', `Podaj powierzchnię netto – bez zapasu. ${w}% na docinki dla układu „${layoutName(state.layout)}” doliczymy sami.`) +
  `<label class="field field--big"><span>Powierzchnia do ułożenia</span><span class="field__wrap"><input id="area" type="number" inputmode="decimal" min="${P.minArea}" max="${P.maxArea}" step="0.1" placeholder="np. 45" value="${esc(state.area || '')}"><b>m²</b></span></label>
  <details class="rooms" ${rooms.length ? 'open' : ''}><summary>Nie znasz metrażu? Dodaj pomieszczenia</summary>
    <div id="roomList">${rooms.map(roomRow).join('')}</div>
    <button type="button" class="link" id="addRoom">+ Dodaj pomieszczenie</button>
  </details>
  <p class="hint" id="areaHint" aria-live="polite"></p>`;
}
const roomRow = r => `<div class="room"><input aria-label="Nazwa pomieszczenia" value="${esc(r.n || '')}" placeholder="Salon" data-f="n" maxlength="40"><input aria-label="Długość w metrach" type="number" inputmode="decimal" step="0.01" min="0" value="${esc(r.a || '')}" placeholder="dł. m" data-f="a"><span>×</span><input aria-label="Szerokość w metrach" type="number" inputmode="decimal" step="0.01" min="0" value="${esc(r.b || '')}" placeholder="szer. m" data-f="b"><button type="button" class="room__x" aria-label="Usuń pomieszczenie">×</button></div>`;
function stepContact() {
  const c = state.contact || {};
  return head('Twój kosztorys jest gotowy. Gdzie go wysłać?', 'Kosztorys wyślemy na Twój e-mail, a doradca z wybranego salonu skontaktuje się, by umówić pomiar.') +
  `<form id="contactForm" novalidate>
    <div class="grid2">
      <label class="field"><span>Imię</span><input name="fn" autocomplete="given-name" required maxlength="40" value="${esc(c.fn)}"></label>
      <label class="field"><span>Nazwisko</span><input name="ln" autocomplete="family-name" required maxlength="60" value="${esc(c.ln)}"></label>
      <label class="field"><span>E-mail</span><input name="em" type="email" autocomplete="email" required maxlength="120" value="${esc(c.em)}"></label>
      <label class="field"><span>Telefon</span><input name="ph" type="tel" autocomplete="tel" placeholder="+48 ___ ___ ___" required maxlength="20" value="${esc(c.ph)}"></label>
      <label class="field"><span>Najbliższy salon</span><select name="salon" required><option value="">Wybierz salon</option>${D.salons.map(x => `<option value="${x.id}">${x.name}${x.place ? ' · ' + x.place : ''}</option>`).join('')}</select></label>
      <label class="field"><span>Miejscowość inwestycji <small>(opcjonalnie)</small></span><input name="city" autocomplete="address-level2" maxlength="60" value="${esc(c.city)}"></label>
      <label class="field"><span>Planowany termin <small>(opcjonalnie)</small></span><select name="when"><option value="">Wybierz</option><option>Do 1 miesiąca</option><option>1–3 miesiące</option><option>3–6 miesięcy</option><option>Powyżej 6 miesięcy</option></select></label>
      <input name="website" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
    </div>
    <fieldset class="consents"><legend class="sr">Zgody</legend>
      <label class="check"><input type="checkbox" name="c1" required><span><b>*</b> Akceptuję <a href="regulamin.html" target="_blank" rel="noopener">regulamin kalkulatora</a> i zapoznałem/am się z <a href="polityka-prywatnosci.html" target="_blank" rel="noopener">informacją o przetwarzaniu danych osobowych</a>.</span></label>
      <label class="check"><input type="checkbox" name="c3" ${c.c3 ? 'checked' : ''}><span>Zgadzam się na kontakt telefoniczny w celach marketingowych (informacje o ofercie i promocjach salonów). <small>Opcjonalnie.</small></span></label>
      <label class="check"><input type="checkbox" name="c4" ${c.c4 ? 'checked' : ''}><span>Chcę otrzymywać e-mailem informacje o promocjach i nowościach. <small>Opcjonalnie.</small></span></label>
      <p class="rodo">Administratorem danych jest ${esc(D.company.name)}, ${esc(D.company.addr)}. Dane przetwarzamy, aby przygotować i przesłać kosztorys oraz skontaktować się w jego sprawie (art. 6 ust. 1 lit. b RODO), przez 12 miesięcy. Zgody marketingowe możesz wycofać w każdej chwili. <a href="polityka-prywatnosci.html" target="_blank" rel="noopener">Pełna informacja</a>.</p>
    </fieldset>
    <div class="ts" id="tsQuote"></div>
    <p class="err" id="formErr" role="alert"></p>
    <button type="submit" hidden></button>
  </form>`;
}

/* ---------- quote view ---------- */
function statusHtml() {
  const c = state.contact, sl = salonOf(c.salon), st = state.sendStatus;
  if (st === 'sending') return `<p class="status status--wait">Wysyłam kosztorys na ${esc(c.em)}…</p>`;
  if (st === 'sent') return `<p class="status status--ok">✓ ${CFG.demo ? 'Tryb demo: wysyłka zasymulowana.' : `Kosztorys wysłaliśmy na <b>${esc(c.em)}</b>. ${esc(sl.name)} skontaktuje się z Tobą w najbliższy dzień roboczy.`}</p>`;
  if (st === 'error') return `<div class="status status--bad"><p>Nie udało się wysłać kosztorysu automatycznie.</p><p><button type="button" class="link" id="retrySend">Spróbuj ponownie</button> · <a class="link" href="${mailtoHref()}">wyślij e-mailem do salonu</a> · <a class="link" href="tel:+48${sl.phone}">zadzwoń ${tel(sl.phone)}</a></p></div>`;
  return '';
}
function renderQuote() {
  const q = quote(), f = curFormat(), c = state.contact, sl = salonOf(c.salon);
  const today = new Date(), valid = new Date(today.getTime() + 14 * 864e5);
  const d = x => x.toLocaleDateString('pl-PL');
  panel.innerHTML = `<div class="quote" id="quote">
    <div class="quote__brand"><img src="img/brand/jp-logo-h120.png" alt="Jawor-Parkiet" class="quote__jp" width="183" height="40"><span><b>Pan od Parkietów</b> · ${esc(D.company.name)}</span><span>${esc(sl.name)} · ${esc(sl.street)}, ${esc(sl.city)} · tel. ${tel(sl.phone)}</span></div>
    <div class="quote__head"><div><p class="eyebrow">Wstępny kosztorys</p><h3 class="step__t" tabindex="-1">${esc(c.fn)}, oto Twoja podłoga</h3></div><div class="quote__meta"><span>Nr ${esc(state.no)}</span><span>z dnia ${d(today)}</span><span>ważny do ${d(valid)}</span></div></div>
    <div id="sendStatus" aria-live="polite" data-html2canvas-ignore="true">${statusHtml()}</div>
    <div class="quote__spec">
      <div class="quote__vis" style="${decorStyle()}">${picto(state.layout)}</div>
      <dl>
        <dt>Układ</dt><dd>${q.labels.layout}</dd>
        <dt>Drewno i klasa</dt><dd>${q.labels.species} ${esc(q.labels.cls)}</dd>
        <dt>Format</dt><dd>${f.name} · ${f.dims}</dd>
        <dt>Wykończenie</dt><dd>${esc(q.labels.finish)}</dd>
      </dl>
    </div>
    <table class="qt">
      <tbody>
        <tr><td>Podłoga ${f.name}<small>${fmt1(q.net)} m² + zapas ${q.wastePct}% = ${fmt1(q.matArea)} m² × ${fmt(q.unit)}/m²</small></td><td>${fmt(q.material)}</td></tr>
        ${q.inst ? `<tr><td>Montaż – ${layoutName(state.layout).toLowerCase()}<small>${fmt1(q.net)} m² × ${fmt(q.installRate)}/m²</small></td><td>${fmt(q.install)}</td></tr>
        <tr><td>Klej i grunt<small>${fmt1(q.net)} m² × ${fmt(q.glueRate)}/m²</small></td><td>${fmt(q.glue)}</td></tr>` : ''}
        <tr class="qt__sub"><td>Razem netto</td><td>${fmt(q.netSum)}</td></tr>
        <tr><td>VAT ${q.vatPct}%${q.vatPct === 8 ? '<small>stawka obniżona – do potwierdzenia przez salon</small>' : ''}</td><td>${fmt(q.vat)}</td></tr>
      </tbody>
      <tfoot><tr><td>Do zapłaty brutto</td><td>${fmt(q.gross)}</td></tr></tfoot>
    </table>
    <div class="quote__glue">
      <p><b>Zapotrzebowanie na Twoją budowę</b></p>
      <ul><li><span class="bucket">${q.bond}×</span> J-P Bond Elastic 1K, wiadro 16 kg <small>(zużycie do 1,2 kg/m²; alternatywnie Bond 2K – dobierze doradca)</small></li>
      <li><span class="bucket">${q.primer}×</span> J-P Primer Eko, opakowanie 6 kg <small>(zużycie do 150 g/m²)</small></li></ul>
      ${q.inst ? '<p class="muted small">Klej i grunt są wliczone w cenę montażu.</p>' : '<p class="muted small">Klej i grunt możesz dokupić w salonie.</p>'}
    </div>
    <div class="quote__tech"><p><b>Zanim przyjedzie ekipa</b></p><p class="small">Wilgotność jastrychu cementowego z ogrzewaniem maks. 1,8% CM, anhydrytu maks. 0,3% CM. Wymagany 30-dniowy cykl wygrzewania posadzki. Klimat we wnętrzu: 45–60% wilgotności, 18–24°C.</p></div>
    <p class="disclaimer">Kosztorys ma charakter wstępny i nie stanowi oferty w rozumieniu art. 66 Kodeksu cywilnego. Ostateczna cena i stawka VAT zależą od pomiaru, stanu podłoża, rodzaju inwestycji i dostępności towaru.</p>
    <div class="quote__cta" data-html2canvas-ignore="true">
      <button type="button" class="btn" id="measureBtn">Umów wizytę lub pomiar</button>
      <button type="button" class="btn btn--ghost" id="homeBtn">Bezpłatna wizyta z wzornikami</button>
      <button type="button" class="btn btn--ghost" id="printBtn">Pobierz PDF</button>
    </div>
    <button type="button" class="link restart" id="restart" data-html2canvas-ignore="true">← Zmień konfigurację</button>
  </div>`;
  $('#progLabel').textContent = 'Kosztorys gotowy';
  $('#progBar').style.width = '100%';
  $('#printBtn').onclick = downloadPdf;
  $('#measureBtn').onclick = () => openMeasure(c.salon);
  $('#homeBtn').onclick = () => openMeasure(c.salon, 'dom');
  $('#restart').onclick = () => { state.step = 0; delete state.done; delete state.sendStatus; render(true); };
  bindStatus();
}
function setStatus(st) {
  state.sendStatus = st;
  const box = $('#sendStatus'); if (!box) return;
  box.innerHTML = statusHtml(); bindStatus();
  const no = $('.quote__meta span'); if (no) no.textContent = 'Nr ' + state.no;
}
function bindStatus() { const r = $('#retrySend'); if (r) r.onclick = () => sendQuote(true); }

/* ---------- wizard ---------- */
const templates = [stepLayout, stepSpecies, stepClass, stepFormat, stepColor, stepScope, stepArea, stepContact];
const required = [
  () => state.layout, () => state.species, () => state.cls, () => state.format,
  () => state.finishType === 'ci' ? !!state.color : !!state.finish,
  () => state.scope, () => +state.area >= P.minArea && +state.area <= P.maxArea, () => true
];
function nav() {
  const i = state.step, last = i === templates.length - 1;
  return `<div class="nav">
    ${i > 0 ? '<button type="button" class="btn btn--ghost" id="back">← Wstecz</button>' : '<span></span>'}
    <button type="button" class="btn" id="next" ${required[i]() ? '' : 'disabled'}>${last ? 'Pokaż i wyślij kosztorys' : 'Dalej →'}</button>
  </div>`;
}
function render(focus) {
  renderSummary();
  document.querySelector('.calc__body').classList.toggle('is-done', !!state.done);
  if (state.done) renderQuote();
  else {
    const i = state.step;
    panel.innerHTML = `<div class="step" data-step="${i}">${templates[i]()}</div>${nav()}`;
    $('#progLabel').textContent = `Krok ${i + 1} z ${STEPS.length} · ${STEPS[i]}`;
    $('#progBar').style.width = ((i + 1) / STEPS.length * 100) + '%';
    bind();
  }
  if (focus) {
    const calc = document.getElementById('kalkulator');
    if (calc.getBoundingClientRect().top < 0) calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const h = panel.querySelector('.step__t'); if (h) h.focus({ preventScroll: true });
  }
}

/* reset downstream choices when upstream changes */
const chain = ['layout', 'species', 'cls', 'format'];
function setKey(k, v) {
  if (state[k] === v) return;
  state[k] = v;
  const idx = chain.indexOf(k);
  if (idx > -1) {
    chain.slice(idx + 1).forEach(x => {
      if (x === 'species' && state.species && !speciesOk(state.species)) delete state.species;
      if (x === 'cls' && state.cls && (!state.species || !D.classes[state.species].some(c => c.id === state.cls) || !classOk(state.cls))) delete state.cls;
      if (x === 'format' && state.format && (!state.cls || !formatsFor(state.layout, state.species, state.cls).some(f => f.id === state.format))) delete state.format;
    });
    if (!state.format) { delete state.finishType; delete state.color; }
  }
}

function bind() {
  panel.querySelectorAll('[data-k]').forEach(group => {
    const k = group.dataset.k;
    group.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
      setKey(k, b.dataset.v);
      const auto = ['layout', 'species', 'cls', 'format', 'scope'].includes(k);
      if (auto && state.step < templates.length - 1) { state.step++; render(true); }
      else { render(); const again = panel.querySelector(`[data-k="${k}"] [data-v="${CSS.escape(b.dataset.v)}"]`); if (again) again.focus(); }
    }));
  });
  panel.querySelectorAll('[data-ft]').forEach(b => b.addEventListener('click', () => { state.finishType = b.dataset.ft; render(); const t = panel.querySelector(`[data-ft="${b.dataset.ft}"]`); if (t) t.focus(); }));
  panel.querySelectorAll('[data-tg]').forEach(cb => cb.addEventListener('change', () => { state[cb.dataset.tg] = cb.checked; renderSummary(); }));
  const back = $('#back'); if (back) back.onclick = () => { state.step--; render(true); };
  const next = $('#next');
  next.onclick = () => {
    if (state.step === templates.length - 1) return submit();
    state.step++; render(true);
  };
  const area = $('#area');
  if (area) {
    const upd = () => {
      state.area = area.value;
      const v = +area.value, w = P.waste[state.layout];
      $('#areaHint').textContent = v >= P.minArea && v <= P.maxArea ? `Zamówimy ${fmt1(Math.round(v * (1 + w) * 100) / 100)} m² podłogi (z zapasem ${Math.round(w * 100)}%).` : (area.value ? `Podaj wartość od ${P.minArea} do ${P.maxArea} m².` : '');
      next.disabled = !required[state.step](); renderSummary();
    };
    area.addEventListener('input', upd); upd();
    area.addEventListener('keydown', e => { if (e.key === 'Enter' && !next.disabled) next.click(); });
    const list = $('#roomList');
    const sync = () => {
      state.rooms = [...list.querySelectorAll('.room')].map(r => ({ n: r.querySelector('[data-f=n]').value, a: r.querySelector('[data-f=a]').value, b: r.querySelector('[data-f=b]').value }));
      const sum = state.rooms.reduce((s, r) => s + (Math.max(0, +r.a) || 0) * (Math.max(0, +r.b) || 0), 0);
      if (sum > 0) { area.value = Math.round(sum * 10) / 10; upd(); }
    };
    list.addEventListener('input', sync);
    list.addEventListener('click', e => { if (e.target.classList.contains('room__x')) { e.target.parentElement.remove(); sync(); $('#addRoom').focus(); } });
    $('#addRoom').onclick = () => { list.insertAdjacentHTML('beforeend', roomRow({})); list.lastElementChild.querySelector('input').focus(); };
  }
  const form = $('#contactForm');
  if (form) {
    const c = state.contact || {}; if (c.when) form.when.value = c.when; if (c.salon) form.salon.value = c.salon;
    form.addEventListener('input', () => { state.contact = { ...readContact(form), c3: form.c3.checked, c4: form.c4.checked }; });
    form.addEventListener('submit', e => { e.preventDefault(); submit(); });
    Turnstile.mount('tsQuote');
  }
}
const readContact = form => Object.fromEntries(['fn', 'ln', 'em', 'ph', 'salon', 'city', 'when'].map(n => [n, form[n].value.trim()]));

async function submit() {
  const form = $('#contactForm'), err = $('#formErr'), next = $('#next');
  form.querySelectorAll('.is-bad').forEach(x => x.classList.remove('is-bad'));
  form.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  err.textContent = '';
  const bad = [];
  ['fn', 'ln'].forEach(n => { if (form[n].value.trim().length < 2) bad.push(form[n]); });
  if (!EMAIL_RE.test(form.em.value.trim())) bad.push(form.em);
  if (!phoneOk(form.ph.value)) bad.push(form.ph);
  if (!form.salon.value) bad.push(form.salon);
  if (!form.c1.checked) bad.push(form.c1);
  if (bad.length) {
    bad.forEach(x => { x.setAttribute('aria-invalid', 'true'); (x.closest('.field') || x.closest('.check')).classList.add('is-bad'); });
    err.textContent = 'Uzupełnij zaznaczone pola i zaakceptuj regulamin (*).';
    bad[0].focus();
    return;
  }
  const token = Turnstile.token('tsQuote');
  if (Turnstile.enabled && !token) { err.textContent = 'Potwierdź, że nie jesteś robotem.'; return; }
  state.contact = { ...readContact(form), c3: form.c3.checked, c4: form.c4.checked };
  state.honeypot = form.website.value;
  state.tsToken = token;
  next.disabled = true; next.textContent = 'Przygotowuję kosztorys…';
  const res = await sendQuote(false);
  if (res && res.reason === 'invalid') {
    next.disabled = false; next.textContent = 'Pokaż i wyślij kosztorys';
    err.textContent = res.message || 'Sprawdź poprawność danych i spróbuj ponownie.';
    Turnstile.reset('tsQuote');
    return;
  }
  state.done = true; render(true);
}

/* ---------- integracja n8n ---------- */
const utm = Object.fromEntries([...new URLSearchParams(location.search)].filter(([k]) => /^(utm_|fbclid|gclid)/.test(k)).map(([k, v]) => [k, v.slice(0, 120)]));
async function callN8n(kind, payload) {
  if (CFG.demo) { await new Promise(r => setTimeout(r, 500)); return demoReply(kind, payload); }
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(CFG.n8n[kind], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
    const j = await r.json().catch(() => ({}));
    if (!r.ok && !j.reason) throw new Error('HTTP ' + r.status);
    return j;
  } finally { clearTimeout(to); }
}
function demoReply(kind, p) {
  if (kind === 'slots') {
    const d = new Date(p.date + 'T00:00:00'), sat = d.getDay() === 6;
    const all = sat ? ['10:00', '11:00', '12:00', '13:00'] : ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const seed = d.getDate() + p.salon.length;
    return { ok: true, duration: 60, slots: all.filter((_, i) => (i * 7 + seed) % 3 !== 0) };
  }
  if (kind === 'quote') return { ok: true, demo: true, number: 'PP-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-D' + String(Math.floor(100 + Math.random() * 900)) };
  return { ok: true, demo: true };
}
function quoteText() {
  const q = quote(), c = state.contact, sl = salonOf(c.salon), L = q.labels;
  const lines = [
    `Wstępny kosztorys ${state.no || ''} – Pan od Parkietów`, '',
    `Klient: ${c.fn} ${c.ln}, tel. ${c.ph}, ${c.em}`, '',
    `Układ: ${L.layout}`, `Drewno i klasa: ${L.species} ${L.cls}`, `Format: ${L.format} (${L.dims}, ${L.thickness})`,
    `Wykończenie: ${L.finish}`, `Zakres: ${L.scope}`, '',
    `Podłoga: ${fmt1(q.net)} m² + zapas ${q.wastePct}% = ${fmt1(q.matArea)} m² × ${fmt(q.unit)}/m² = ${fmt(q.material)}`
  ];
  if (q.inst) lines.push(`Montaż: ${fmt1(q.net)} m² × ${fmt(q.installRate)} = ${fmt(q.install)}`, `Klej i grunt: ${fmt1(q.net)} m² × ${fmt(q.glueRate)} = ${fmt(q.glue)}`);
  lines.push(`Razem netto: ${fmt(q.netSum)}`, `VAT ${q.vatPct}%: ${fmt(q.vat)}`, `DO ZAPŁATY BRUTTO: ${fmt(q.gross)}`, '', `Salon: ${sl.name}, ${sl.street}, ${sl.city}`);
  return lines.join('\n');
}
const mailtoHref = () => { const c = state.contact, sl = salonOf(c.salon); return `mailto:${sl.email}?cc=${encodeURIComponent(c.em)}&subject=${encodeURIComponent('Kosztorys podłogi – ' + c.fn + ' ' + c.ln)}&body=${encodeURIComponent(quoteText())}`; };

/* Wysyła lead do salonu i kopię kosztorysu do klienta – automatycznie, przy pokazaniu kosztorysu.
   Serwer (n8n) sam przelicza cenę i buduje treść e-maili; przeglądarka przesyła tylko wybór i dane kontaktowe. */
async function sendQuote(retry) {
  const c = state.contact;
  if (retry) {
    if (Turnstile.enabled) { state.tsToken = await Turnstile.fresh(); }
    setStatus('sending');
  } else state.sendStatus = 'sending';
  try {
    const res = await callN8n('quote', {
      type: 'kosztorys', createdAt: new Date().toISOString(), source: location.origin + location.pathname, utm,
      website: state.honeypot || '', turnstile: state.tsToken || '',
      client: { firstName: c.fn, lastName: c.ln, email: c.em, phone: c.ph, city: c.city || '', timeframe: c.when || '' },
      consents: { terms: true, phoneMarketing: !!c.c3, newsletter: !!c.c4, version: CFG.consentVersion },
      salonId: c.salon,
      selection: selection(),
      clientGross: quote().gross
    });
    if (res.ok === false) {
      if (res.reason === 'invalid') return res;
      throw new Error(res.reason || 'odmowa');
    }
    if (res.number) state.no = res.number;
    if (retry) setStatus('sent'); else state.sendStatus = 'sent';
    return res;
  } catch (e) {
    if (!state.no) state.no = 'do nadania';
    if (retry) setStatus('error'); else state.sendStatus = 'error';
    return null;
  }
}

/* ---------- PDF (biblioteka ładowana dopiero na żądanie) ----------
   Osobny układ A4 (190 mm treści), renderowany poza ekranem w wysokiej rozdzielczości – zawsze 1 strona. */
function pdfHtml() {
  const q = quote(), f = curFormat(), c = state.contact, sl = salonOf(c.salon), dec = decorNow();
  const today = new Date(), valid = new Date(today.getTime() + 14 * 864e5), d = x => x.toLocaleDateString('pl-PL');
  const row = (a, s, v, cls) => `<tr class="${cls || ''}"><td>${a}${s ? `<small>${s}</small>` : ''}</td><td>${v}</td></tr>`;
  return `<div class="pdfdoc">
  <header class="pdfdoc__top"><img src="img/brand/jp-logo-h160.png" alt="Jawor-Parkiet" class="pdfdoc__logo">
    <div class="pdfdoc__firm"><b>Pan od Parkietów</b><span>${esc(D.company.name)}</span><span>${esc(sl.name)} · ${esc(sl.street)}, ${esc(sl.city)}</span><span>tel. ${tel(sl.phone)} · ${esc(sl.email || '')}</span></div></header>
  <div class="pdfdoc__head"><div><p class="pdfdoc__eye">Wstępny kosztorys</p><h1>${esc(c.fn)}, oto Twoja podłoga</h1></div>
    <div class="pdfdoc__meta"><b>Nr ${esc(state.no)}</b><span>z dnia ${d(today)}</span><span>ważny do ${d(valid)}</span></div></div>
  <div class="pdfdoc__spec">${dec.img ? `<img src="${dec.img}" alt="">` : `<i style="background:${dec.tone}"></i>`}
    <dl><dt>Układ</dt><dd>${q.labels.layout}</dd><dt>Drewno i klasa</dt><dd>${q.labels.species} ${esc(q.labels.cls)}</dd><dt>Format</dt><dd>${f.name} · ${f.dims}</dd><dt>Wykończenie</dt><dd>${esc(q.labels.finish)}</dd><dt>Powierzchnia</dt><dd>${fmt1(q.net)} m² netto</dd></dl></div>
  <table class="pdfdoc__t"><tbody>
    ${row(`Podłoga ${f.name}`, `${fmt1(q.net)} m² + zapas ${q.wastePct}% = ${fmt1(q.matArea)} m² × ${fmt(q.unit)}/m²`, fmt(q.material))}
    ${q.inst ? row(`Montaż – ${layoutName(state.layout).toLowerCase()}`, `${fmt1(q.net)} m² × ${fmt(q.installRate)}/m²`, fmt(q.install)) + row('Klej i grunt', `${fmt1(q.net)} m² × ${fmt(q.glueRate)}/m²`, fmt(q.glue)) : ''}
    ${row('Razem netto', '', fmt(q.netSum), 'sub')}
    ${row(`VAT ${q.vatPct}%`, q.vatPct === 8 ? 'stawka obniżona – do potwierdzenia przez salon' : '', fmt(q.vat))}
  </tbody><tfoot><tr><td>Do zapłaty brutto</td><td>${fmt(q.gross)}</td></tr></tfoot></table>
  <div class="pdfdoc__cols">
    <div><b>Zapotrzebowanie na budowę</b><p>${q.bond}× J-P Bond Elastic 1K, wiadro 16 kg (zużycie do 1,2 kg/m²)</p><p>${q.primer}× J-P Primer Eko, opakowanie 6 kg (zużycie do 150 g/m²)</p><p class="m">${q.inst ? 'Klej i grunt są wliczone w cenę montażu.' : 'Klej i grunt możesz dokupić w salonie.'}</p></div>
    <div><b>Zanim przyjedzie ekipa</b><p>Wilgotność jastrychu cementowego z ogrzewaniem maks. 1,8% CM, anhydrytu maks. 0,3% CM. Wymagany 30-dniowy cykl wygrzewania posadzki. Klimat we wnętrzu: 45–60% wilgotności, 18–24°C.</p></div>
  </div>
  <p class="pdfdoc__disc">Kosztorys ma charakter wstępny i nie stanowi oferty w rozumieniu art. 66 Kodeksu cywilnego. Ostateczna cena i stawka VAT zależą od pomiaru, stanu podłoża, rodzaju inwestycji i dostępności towaru.</p>
  <footer class="pdfdoc__foot">${esc(D.company.name)} · ${esc(D.company.addr)} · NIP ${esc(D.company.nip)} · salony firmowe Jawor-Parkiet</footer>
</div>`;
}
async function downloadPdf() {
  const b = $('#printBtn');
  b.disabled = true; b.textContent = 'Przygotowuję PDF…';
  const host = document.createElement('div');
  host.className = 'pdfhost'; host.setAttribute('aria-hidden', 'true'); host.innerHTML = pdfHtml();
  document.body.appendChild(host);
  try {
    if (!window.html2pdf) await loadScript(CFG.pdfLib);
    await Promise.all([...host.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    await window.html2pdf().set({
      margin: [10, 10, 10, 10], filename: `Kosztorys-${String(state.no).replace(/[^\w-]/g, '')}.pdf`,
      image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff', scrollX: 0, scrollY: 0, windowWidth: 760 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }, pagebreak: { mode: ['avoid-all'] }
    }).from(host.firstElementChild).save();
  } catch (e) { window.print(); }
  host.remove(); b.disabled = false; b.textContent = 'Pobierz PDF';
}

/* ---------- Cloudflare Turnstile (opcjonalnie) ---------- */
const Turnstile = (() => {
  const key = CFG.turnstileSiteKey, ids = {}; let ready = null;
  const load = () => ready || (ready = loadScript('https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'));
  return {
    enabled: !!key,
    async mount(elId) {
      if (!key) return;
      const el = document.getElementById(elId); if (!el) return;
      try { await load(); el.innerHTML = ''; ids[elId] = window.turnstile.render(el, { sitekey: key, language: 'pl', size: 'flexible' }); } catch (e) { /* brak skryptu – serwer i tak odrzuci bez tokenu */ }
    },
    token(elId) { return key && window.turnstile && ids[elId] != null ? window.turnstile.getResponse(ids[elId]) || '' : ''; },
    reset(elId) { if (key && window.turnstile && ids[elId] != null) window.turnstile.reset(ids[elId]); },
    async fresh() {
      if (!key) return '';
      await load();
      return new Promise(res => {
        const box = document.createElement('div'); box.className = 'ts ts--inline'; ($('#sendStatus') || document.body).appendChild(box);
        window.turnstile.render(box, { sitekey: key, language: 'pl', size: 'flexible', callback: t => { res(t); setTimeout(() => box.remove(), 300); } });
      });
    }
  };
})();

/* ---------- salony ---------- */
function renderSalons() {
  $('#salonsGrid').innerHTML = D.salons.map(x => `<article class="salon">
    <h3>${x.name}</h3>
    ${x.place ? `<p class="salon__place">${x.place}</p>` : ''}
    <p class="salon__addr">${x.street}<br>${x.city}</p>
    <p class="salon__contact"><a href="tel:+48${x.phone}">${tel(x.phone)}</a><a href="mailto:${x.email}">${x.email.replace('@', '<wbr>@')}</a></p>
    <button type="button" class="btn btn--ghost btn--sm" data-measure="${x.id}">Umów wizytę</button>
  </article>`).join('');
  document.querySelectorAll('[data-measure]').forEach(b => b.onclick = () => openMeasure(b.dataset.measure));
}

/* ---------- rezerwacja wizyty (Kalendarz Google przez n8n) ---------- */
const dlg = $('#measureDlg'), mf = $('#measureForm');
const field = n => mf.elements.namedItem(n);
const bk = { date: null, time: null, duration: 60, req: 0 };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function renderDays() {
  const out = []; const d = new Date(); d.setDate(d.getDate() + 1);
  while (out.length < 12) { if (d.getDay() !== 0) out.push(new Date(d)); d.setDate(d.getDate() + 1); }
  $('#mDays').innerHTML = out.map(x => `<button type="button" class="day ${bk.date === iso(x) ? 'is-sel' : ''}" data-d="${iso(x)}" aria-pressed="${bk.date === iso(x)}" aria-label="${x.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}"><small>${x.toLocaleDateString('pl-PL', { weekday: 'short' })}</small><b>${x.getDate()}</b><small>${x.toLocaleDateString('pl-PL', { month: 'short' })}</small></button>`).join('');
  $('#mDays').querySelectorAll('.day').forEach(b => b.onclick = () => { bk.date = b.dataset.d; bk.time = null; renderDays(); loadSlots(); $(`#mDays [data-d="${bk.date}"]`).focus(); });
}
async function loadSlots() {
  const box = $('#mSlots'); updBook();
  if (!bk.date) { box.innerHTML = '<p class="muted small">Wybierz dzień, aby zobaczyć wolne godziny.</p>'; return; }
  box.innerHTML = '<p class="muted small">Sprawdzam wolne terminy w kalendarzu salonu…</p>';
  const req = ++bk.req;
  try {
    const r = await callN8n('slots', { salon: field('salon').value, type: field('vtype').value, date: bk.date });
    if (req !== bk.req) return; // nowsze zapytanie w toku
    bk.duration = r.duration || 60;
    const list = r.slots || [];
    box.innerHTML = list.length ? list.map(t => `<button type="button" class="slot ${bk.time === t ? 'is-sel' : ''}" data-t="${esc(t)}" aria-pressed="${bk.time === t}">${esc(t)}</button>`).join('') : '<p class="muted small">Brak wolnych terminów tego dnia. Wybierz inny dzień.</p>';
    box.querySelectorAll('.slot').forEach(b => b.onclick = () => { bk.time = b.dataset.t; box.querySelectorAll('.slot').forEach(x => { x.classList.toggle('is-sel', x === b); x.setAttribute('aria-pressed', x === b); }); updBook(); });
  } catch (e) {
    if (req !== bk.req) return;
    const sl = salonOf(field('salon').value);
    box.innerHTML = `<p class="err">Nie udało się pobrać terminów. Zadzwoń: <a href="tel:+48${sl.phone}">${tel(sl.phone)}</a></p>`;
  }
}
function updBook() {
  const sl = salonOf(field('salon').value), a = $('#mCall');
  a.href = 'tel:+48' + sl.phone; a.textContent = `Wolisz zadzwonić? ${tel(sl.phone)}`;
  $('#mPicked').textContent = bk.date && bk.time ? `Wybrany termin: ${new Date(bk.date + 'T12:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}, godz. ${bk.time}` : '';
}
function sampleOptions() {
  const opts = [];
  if (state.done) { try { const L = quote().labels; opts.push(`Mój wybór: ${L.format} ${L.species} ${L.cls}, ${L.finish}`); } catch (e) { /* brak kosztorysu */ } }
  D.species.forEach(sp => (D.classes[sp.id] || []).forEach(cl => opts.push(`${sp.name} ${cl.name}`)));
  D.colors.forEach(col => opts.push(`Dąb Color Inspiration – ${col[0]}`));
  return [...new Set(opts)];
}
function fillSamples() {
  const o = sampleOptions(), cur1 = field('sample1').value, cur2 = field('sample2').value;
  $('#mS1').innerHTML = '<option value="">Dobierzemy razem z doradcą</option>' + o.map(x => `<option${x === cur1 ? ' selected' : ''}>${esc(x)}</option>`).join('');
  $('#mS2').innerHTML = '<option value="">— bez drugiego wzornika —</option>' + o.map(x => `<option${x === cur2 ? ' selected' : ''}>${esc(x)}</option>`).join('');
  if (!cur1 && state.done && o[0] && o[0].startsWith('Mój wybór')) $('#mS1').value = o[0];
}
function syncVisitType() {
  const t = field('vtype').value, onsite = t === 'dom' || t === 'pomiar';
  $('#mAddrF').hidden = t !== 'dom'; $('#mSamplesF').hidden = t !== 'dom';
  $('#mCityReq').textContent = onsite ? '(wymagana)' : '(opcjonalnie)';
  $('#mTitle').textContent = t === 'dom' ? 'Bezpłatna wizyta Pana od Parkietów' : 'Umów wizytę';
}
function openMeasure(salonId, type) {
  $('#mSalon').innerHTML = D.salons.map(x => `<option value="${x.id}">${x.name}${x.place ? ' · ' + x.place : ''} · ${x.street}</option>`).join('');
  $('#mType').innerHTML = CFG.visitTypes.map(t => `<option value="${t.id}">${t.name} – ${t.sub}</option>`).join('');
  if (salonId) field('salon').value = salonId;
  if (type) field('vtype').value = type;
  fillSamples(); syncVisitType();
  const c = state.contact;
  if (c) {
    field('name').value = field('name').value || `${c.fn} ${c.ln}`.trim();
    field('phone').value = field('phone').value || c.ph || '';
    field('email').value = field('email').value || c.em || '';
    field('city').value = field('city').value || c.city || '';
  }
  $('#mErr').textContent = ''; bk.time = null;
  renderDays(); loadSlots();
  dlg.showModal();
  Turnstile.mount('tsBook');
}
field('salon').addEventListener('change', () => { bk.time = null; loadSlots(); });
field('vtype').addEventListener('change', () => { bk.time = null; syncVisitType(); loadSlots(); });
field('sample2').addEventListener('change', () => { if (field('sample2').value && field('sample2').value === field('sample1').value) field('sample2').value = ''; });
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
$('#mClose').onclick = () => dlg.close();
mf.addEventListener('submit', e => { e.preventDefault(); book(); });
async function book() {
  const err = $('#mErr'), b = $('#mSend');
  mf.querySelectorAll('.is-bad').forEach(x => x.classList.remove('is-bad'));
  mf.querySelectorAll('[aria-invalid]').forEach(x => x.removeAttribute('aria-invalid'));
  err.textContent = '';
  if (!bk.date || !bk.time) { err.textContent = 'Wybierz dzień i godzinę wizyty.'; return; }
  const bad = [];
  if (field('name').value.trim().length < 3) bad.push(field('name'));
  if (!phoneOk(field('phone').value)) bad.push(field('phone'));
  if (!EMAIL_RE.test(field('email').value.trim())) bad.push(field('email'));
  const vtype = field('vtype').value;
  if ((vtype === 'pomiar' || vtype === 'dom') && field('city').value.trim().length < 2) bad.push(field('city'));
  if (vtype === 'dom' && field('address').value.trim().length < 3) bad.push(field('address'));
  if (!field('agree').checked) bad.push(field('agree'));
  if (bad.length) {
    bad.forEach(x => { x.setAttribute('aria-invalid', 'true'); (x.closest('.field') || x.closest('.check')).classList.add('is-bad'); });
    err.textContent = vtype === 'dom' && (bad.includes(field('city')) || bad.includes(field('address'))) ? 'Przy wizycie u Ciebie podaj miejscowość i adres. Uzupełnij też pozostałe zaznaczone pola.' : vtype === 'pomiar' && bad.includes(field('city')) ? 'Przy pomiarze podaj miejscowość inwestycji. Uzupełnij też pozostałe zaznaczone pola.' : 'Uzupełnij zaznaczone pola i zaakceptuj regulamin (*).';
    bad[0].focus(); return;
  }
  const token = Turnstile.token('tsBook');
  if (Turnstile.enabled && !token) { err.textContent = 'Potwierdź, że nie jesteś robotem.'; return; }
  const sl = salonOf(field('salon').value), vt = CFG.visitTypes.find(t => t.id === field('vtype').value);
  b.disabled = true; b.textContent = 'Rezerwuję…';
  try {
    const r = await callN8n('book', {
      type: 'rezerwacja', visitType: vt.id, visitName: vt.name, date: bk.date, time: bk.time, duration: bk.duration, timezone: 'Europe/Warsaw',
      salon: { id: sl.id, name: sl.name, email: sl.email, phone: sl.phone, address: `${sl.street}, ${sl.city}` },
      client: { name: field('name').value.trim().slice(0, 80), email: field('email').value.trim().slice(0, 120), phone: field('phone').value.trim().slice(0, 20), city: field('city').value.trim().slice(0, 60), address: vtype === 'dom' ? field('address').value.trim().slice(0, 120) : '', note: field('note').value.trim().slice(0, 500) },
      consents: { terms: true, version: CFG.consentVersion }, source: location.origin + location.pathname, utm,
      samples: vtype === 'dom' ? [field('sample1').value, field('sample2').value].filter(Boolean).slice(0, 2) : [],
      website: field('website').value, turnstile: token,
      quote: state.done ? { number: state.no, selection: selection(), text: quoteText() } : null
    });
    if (r.ok === false) {
      if (r.reason === 'taken') { err.textContent = 'Ten termin został właśnie zajęty. Wybierz inną godzinę.'; bk.time = null; loadSlots(); }
      else err.textContent = r.message || 'Nie udało się zarezerwować terminu.';
      Turnstile.reset('tsBook');
    } else {
      dlg.close();
      const when = `${new Date(bk.date + 'T12:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}, godz. ${bk.time}`;
      toast(CFG.demo ? `Tryb demo: rezerwacja ${when} zasymulowana.` : `Zarezerwowano: ${vt.name.toLowerCase()} – ${when}, ${sl.name}. Potwierdzenie wysłaliśmy na e-mail.`);
      mf.reset(); bk.date = bk.time = null; syncVisitType();
    }
  } catch (e) {
    err.textContent = `Nie udało się zarezerwować. Zadzwoń: ${tel(sl.phone)} lub napisz: ${sl.email}`;
    Turnstile.reset('tsBook');
  }
  b.disabled = false; b.textContent = 'Zarezerwuj termin';
}

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 6000); }

/* mobile sticky CTA hides when calculator is in view */
const cta = $('#mobileCta');
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => cta.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.05 }).observe($('#kalkulator'));

if (CFG.demo) console.warn('[Pan od Parkietów] Tryb DEMO – wysyłka i kalendarz są symulowane. Przed startem ustaw JP.config.demo = false w data.js.');
renderSalons();
/* sekcja „Bezpłatna wizyta Pana od Parkietów” */
$('#visitBtn').onclick = () => openMeasure(null, 'dom');
render();
})();

