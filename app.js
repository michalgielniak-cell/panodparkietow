(() => {
const D = window.JP, P = D.params;
const $ = (s, el = document) => el.querySelector(s);
const panel = $('#panel');
const fmt = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' zł';
const fmt1 = n => n.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

const STEPS = ['Układ', 'Gatunek', 'Klasa', 'Format', 'Kolor', 'Zakres', 'Metraż', 'Dane'];
let state = { step: 0 };
const save = () => {};

/* ---------- pictograms ---------- */
function picto(id) {
  const c = 'currentColor';
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
  return `<svg viewBox="0 0 120 80" preserveAspectRatio="xMidYMid slice" class="picto" aria-hidden="true"><defs><clipPath id="cp-${id}"><rect width="120" height="80" rx="6"/></clipPath></defs><g clip-path="url(#cp-${id})" fill="none" stroke="${c}" stroke-width="1.3" stroke-linejoin="round">${s}</g></svg>`;
}

/* ---------- availability ---------- */
const layoutName = id => D.layouts.find(l => l.id === id).name;
const ciIdx = { Country: 0, Classic: 1, Elegance: 2 };
function formatsFor(layout, species, cls) {
  return D.formats.filter(f => f.layouts.includes(layout) && (
    (f.price[species] && (cls ? f.price[species][cls] != null : true)) ||
    (species === 'dab' && f.ci && (cls ? f.ci.ol[ciIdx[cls]] != null : true))
  ));
}
const speciesOk = sp => formatsFor(state.layout, sp).length > 0;
const classOk = cl => formatsFor(state.layout, state.species, cl).length > 0;
const curFormat = () => D.formats.find(f => f.id === state.format);
function included(f) {
  const inc = new Set([...(f.inc[state.species] || [])]);
  if (f.incClass && f.incClass[state.cls]) f.incClass[state.cls].forEach(x => inc.add(x));
  if (state.cls === 'Polar') inc.add('SZ');
  return inc;
}
const transparentOk = f => f.price[state.species] && f.price[state.species][state.cls] != null;
const ciOk = f => state.species === 'dab' && f.ci && f.ci.ol[ciIdx[state.cls]] != null;

/* ---------- pricing (w produkcji: serwer) ---------- */
function quote() {
  const f = curFormat();
  let cat;
  const extras = [];
  if (state.finishType === 'ci') {
    cat = f.ci[state.coat === 'fh' ? 'fh' : 'ol'][ciIdx[state.cls]];
  } else {
    cat = f.price[state.species][state.cls];
    const inc = included(f);
    if (state.v4 && !inc.has('V4')) cat += D.surcharge.V4;
    if (state.sz && !inc.has('SZ')) cat += D.surcharge.SZ;
  }
  const unit = cat * (1 - P.discount) + P.margin + P.staff;
  const net = +state.area;
  const waste = P.waste[state.layout];
  const matArea = Math.round(net * (1 + waste) * 100) / 100;
  const material = matArea * unit;
  const inst = state.scope === 'install';
  const install = inst ? net * P.install[state.layout] : 0;
  const glue = inst ? net * P.glue : 0;
  const netSum = material + install + glue;
  const vatRate = inst ? P.vatInstall : P.vatMaterial;
  const vat = netSum * vatRate;
  const bond = Math.ceil(net * P.bondKgM2 / P.bondKg);
  const primer = Math.ceil(net * P.primerKgM2 / P.primerKg);
  return { unit, net, waste, matArea, material, install, glue, netSum, vatRate, vat, gross: netSum + vat, bond, primer, inst };
}

/* ---------- swatch ---------- */
function toneNow() {
  if (state.finishType === 'ci' && state.color) return D.colors.find(c => c[0] === state.color)[1];
  const sp = D.species.find(s => s.id === state.species);
  if (state.cls && /Dark|Koniak/.test(state.cls)) return '#6e4a2c';
  if (state.cls === 'Bursztyn') return '#8a5a32';
  if (state.cls && /Bielony|Polar/.test(state.cls)) return '#e2d6c2';
  return sp ? sp.tone : '#cdb58f';
}
function woodStyle(tone) { return `--tone:${tone}`; }

/* ---------- summary ---------- */
function renderSummary() {
  const rows = [];
  if (state.layout) rows.push(['Układ', layoutName(state.layout)]);
  if (state.species) rows.push(['Drewno', D.species.find(s => s.id === state.species).name]);
  if (state.cls) rows.push(['Klasa', state.cls]);
  if (state.format) rows.push(['Format', curFormat().name]);
  if (state.finishType) rows.push(['Wykończenie', finishLabel()]);
  if (state.scope) rows.push(['Zakres', state.scope === 'install' ? 'Materiał z montażem' : 'Sam materiał']);
  if (state.area) rows.push(['Powierzchnia', fmt1(+state.area) + ' m² netto']);
  $('#sumList').innerHTML = rows.length ? rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') : '<dd class="muted">Zacznij od wyboru układu.</dd>';
  const sw = $('#sumSwatch');
  sw.style.cssText = woodStyle(toneNow());
  sw.innerHTML = state.layout ? picto(state.layout) : '';
}
function finishLabel() {
  if (state.finishType === 'ci') return `Color Inspiration ${state.color || ''} · ${state.coat === 'fh' ? 'Fusion Hybrid' : 'olejowosk'}`;
  const f = curFormat(); const inc = f ? included(f) : new Set();
  const parts = [state.finish === 'OL' ? 'Olejowosk transparentny' : 'Lakier transparentny'];
  if (state.v4 || inc.has('V4')) parts.push('V4'); if (state.sz || inc.has('SZ')) parts.push('szczotkowanie');
  return parts.join(' · ');
}

/* ---------- step templates ---------- */
const card = (o) => `<button type="button" class="opt ${o.sel ? 'is-sel' : ''}" data-v="${o.v}" ${o.dis ? 'disabled aria-disabled="true"' : ''} aria-pressed="${!!o.sel}">${o.html}</button>`;

function stepLayout() {
  return `<h3 class="step__t">Jak chcesz ułożyć podłogę?</h3><p class="step__s">Każdy układ ma inny zapas na docinki – doliczymy go automatycznie.</p>
  <div class="opts opts--3" data-k="layout">${D.layouts.map(l => card({ v: l.id, sel: state.layout === l.id,
    html: `<span class="opt__pic">${picto(l.id)}</span><span class="opt__n">${l.name}</span><span class="opt__d">${l.sub}</span><span class="chip">zapas ${l.waste}</span>` })).join('')}</div>`;
}
function stepSpecies() {
  return `<h3 class="step__t">Jaki gatunek drewna?</h3><p class="step__s">Pokazuję gatunki dostępne w układzie: <b>${layoutName(state.layout)}</b>.</p>
  <div class="opts opts--4" data-k="species">${D.species.map(s => { const ok = speciesOk(s.id); return card({ v: s.id, sel: state.species === s.id, dis: !ok,
    html: `<span class="wood" style="${woodStyle(s.tone)}"></span><span class="opt__n">${s.name}</span><span class="opt__d">${ok ? s.sub : 'Niedostępne w tym układzie'}</span>` }); }).join('')}</div>`;
}
function knotDots(n) { return `<span class="knots" aria-label="Ilość cech drewna: ${n} z 3">${[1,2,3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`; }
function stepClass() {
  const list = D.classes[state.species];
  return `<h3 class="step__t">Ile natury w podłodze?</h3><p class="step__s">Klasa selekcji określa, ile sęków, bieli i różnic w barwie znajdzie się w Twojej podłodze.</p>
  <div class="opts opts--${list.length > 3 ? 4 : 3}" data-k="cls">${list.map(c => { const ok = classOk(c.id); return card({ v: c.id, sel: state.cls === c.id, dis: !ok,
    html: `<span class="opt__n">${c.name}</span>${knotDots(c.knots)}<span class="opt__d">${ok ? c.sub : 'Niedostępne w tym układzie'}</span>` }); }).join('')}</div>`;
}
function plankSvg(f) {
  const max = 2250, W = 200, Lpx = 40 + f.l / max * 160, Hpx = 5 + f.w / 260 * 26;
  return `<svg viewBox="0 0 ${W + 4} 40" class="plank" aria-hidden="true"><title>proporcje klepki</title><rect x="2" y="${20 - Hpx / 2}" width="${Lpx}" height="${Hpx}" rx="1.5"/></svg>`;
}
function stepFormat() {
  const list = formatsFor(state.layout, state.species, state.cls);
  return `<h3 class="step__t">Wielkość elementu</h3><p class="step__s">Większy format optycznie powiększa wnętrze, mniejszy – podkreśla wzór.</p>
  <div class="opts opts--list" data-k="format">${list.map(f => card({ v: f.id, sel: state.format === f.id,
    html: `<span class="row"><span><span class="opt__n">${f.name}</span><span class="opt__d">${f.dims} · grubość ${f.thick}</span>${f.note ? `<span class="opt__d opt__d--note">${f.note}</span>` : ''}</span>${plankSvg(f)}</span>` })).join('')}</div>`;
}
function stepColor() {
  const f = curFormat(); const tOk = transparentOk(f), cOk = ciOk(f);
  if (!state.finishType) state.finishType = tOk ? 't' : 'ci';
  if (state.finishType === 't' && !tOk) state.finishType = 'ci';
  if (state.finishType === 'ci' && !cOk) state.finishType = 't';
  const inc = included(f);
  const tab = `<div class="tabs" role="tablist">
    <button type="button" role="tab" class="tab ${state.finishType === 't' ? 'is-sel' : ''}" data-ft="t" ${tOk ? '' : 'disabled'} aria-selected="${state.finishType === 't'}">Transparentne</button>
    <button type="button" role="tab" class="tab ${state.finishType === 'ci' ? 'is-sel' : ''}" data-ft="ci" ${cOk ? '' : 'disabled'} aria-selected="${state.finishType === 'ci'}">Color Inspiration · 16 kolorów</button></div>`;
  let body;
  if (state.finishType === 't') {
    state.finish = state.finish || 'LA';
    const tog = (k, label, sub) => inc.has(k)
      ? `<div class="toggle is-inc"><span><b>${label}</b><small>${sub}</small></span><span class="chip chip--ok">w cenie</span></div>`
      : `<label class="toggle"><span><b>${label}</b><small>${sub}</small></span><span class="chip">dopłata</span><input type="checkbox" data-tg="${k.toLowerCase()}" ${state[k.toLowerCase()] ? 'checked' : ''}><i class="sw"></i></label>`;
    body = `<div class="opts opts--2" data-k="finish">
      ${card({ v: 'LA', sel: state.finish === 'LA', html: `<span class="opt__n">Lakier UV transparentny</span><span class="opt__d">8 warstw lakieru. Najłatwiejszy w codziennym utrzymaniu.</span>` })}
      ${card({ v: 'OL', sel: state.finish === 'OL', html: `<span class="opt__n">Olejowosk transparentny</span><span class="opt__d">4 warstwy olejowosku. Naturalny, aksamitny dotyk. W cenie lakieru.</span>` })}
    </div>
    <div class="toggles">${tog('V4', 'Fazowanie V4', 'Delikatnie ścięte krawędzie każdej klepki')}${tog('SZ', 'Szczotkowanie', 'Wyczuwalna, uwypuklona struktura słojów')}</div>`;
  } else {
    state.coat = state.coat || 'ol';
    body = `<p class="step__s">Tylko dąb. Szczotkowanie i fazowanie V4 w cenie. Kolory na ekranie są poglądowe – prawdziwe próbki czekają w salonie.</p>
    <div class="colors" data-k="color">${D.colors.map(([n, h]) => `<button type="button" class="color ${state.color === n ? 'is-sel' : ''}" data-v="${n}" aria-pressed="${state.color === n}"><span class="wood wood--sq" style="${woodStyle(h)}"></span><span>${n}</span></button>`).join('')}</div>
    <div class="opts opts--2" data-k="coat">
      ${card({ v: 'ol', sel: state.coat === 'ol', html: `<span class="opt__n">Olejowosk</span><span class="opt__d">4 warstwy olejowosku utwardzanego oksydacyjnie.</span>` })}
      ${card({ v: 'fh', sel: state.coat === 'fh', html: `<span class="opt__n">Fusion Hybrid <span class="chip chip--acc">nowość</span></span><span class="opt__d">Ultramat, 14× odporniejszy na ścieranie niż olejowosk. Bez okresowego olejowania.</span>` })}
    </div>`;
  }
  return `<h3 class="step__t">Kolor i wykończenie</h3>${tab}${body}`;
}
function stepScope() {
  return `<h3 class="step__t">Sam materiał czy z montażem?</h3><p class="step__s">Montaż wykonuje ekipa salonu – klejenie całopowierzchniowe zgodne z warunkami 30-letniej gwarancji.</p>
  <div class="opts opts--2" data-k="scope">
    ${card({ v: 'install', sel: state.scope === 'install', html: `<span class="opt__n">Materiał z montażem</span><span class="opt__d">W cenie: montaż, klej i grunt.</span><span class="chip chip--ok">VAT 8%</span>` })}
    ${card({ v: 'material', sel: state.scope === 'material', html: `<span class="opt__n">Sam materiał</span><span class="opt__d">Podłoga z zapasem + informacja, ile kleju i gruntu potrzebujesz.</span><span class="chip">VAT 23%</span>` })}
  </div>`;
}
function stepArea() {
  const w = Math.round(P.waste[state.layout] * 100);
  const rooms = state.rooms || [];
  return `<h3 class="step__t">Ile metrów podłogi?</h3><p class="step__s">Podaj powierzchnię netto – bez zapasu. ${w}% na docinki dla układu „${layoutName(state.layout)}” doliczymy sami.</p>
  <label class="field field--big"><span>Powierzchnia do ułożenia</span><span class="field__wrap"><input id="area" type="number" inputmode="decimal" min="5" max="1000" step="0.1" placeholder="np. 45" value="${state.area || ''}"><b>m²</b></span></label>
  <details class="rooms" ${rooms.length ? 'open' : ''}><summary>Nie znasz metrażu? Dodaj pomieszczenia</summary>
    <div id="roomList">${rooms.map((r, i) => roomRow(r, i)).join('')}</div>
    <button type="button" class="link" id="addRoom">+ Dodaj pomieszczenie</button>
  </details>
  <p class="hint" id="areaHint"></p>`;
}
const roomRow = (r, i) => `<div class="room" data-i="${i}"><input aria-label="Nazwa" value="${r.n || ''}" placeholder="Salon" data-f="n"><input aria-label="Długość w metrach" type="number" step="0.01" value="${r.a || ''}" placeholder="dł. m" data-f="a"><span>×</span><input aria-label="Szerokość w metrach" type="number" step="0.01" value="${r.b || ''}" placeholder="szer. m" data-f="b"><button type="button" class="room__x" aria-label="Usuń">×</button></div>`;
function stepContact() {
  const c = state.contact || {};
  return `<h3 class="step__t">Twój kosztorys jest gotowy. Gdzie go wysłać?</h3><p class="step__s">Kopię PDF wyślemy na e-mail, a doradca z najbliższego salonu zadzwoni, by umówić pomiar.</p>
  <form id="contactForm" novalidate>
    <div class="grid2">
      <label class="field"><span>Imię</span><input name="fn" autocomplete="given-name" required value="${c.fn || ''}"></label>
      <label class="field"><span>Nazwisko</span><input name="ln" autocomplete="family-name" required value="${c.ln || ''}"></label>
      <label class="field"><span>E-mail</span><input name="em" type="email" autocomplete="email" required value="${c.em || ''}"></label>
      <label class="field"><span>Telefon</span><input name="ph" type="tel" autocomplete="tel" placeholder="+48 ___ ___ ___" required value="${c.ph || ''}"></label>
      <label class="field"><span>Miejscowość inwestycji <small>(opcjonalnie)</small></span><input name="city" value="${c.city || ''}"></label>
      <label class="field"><span>Planowany termin <small>(opcjonalnie)</small></span><select name="when"><option value="">Wybierz</option><option>Do 1 miesiąca</option><option>1–3 miesiące</option><option>3–6 miesięcy</option><option>Powyżej 6 miesięcy</option></select></label>
    </div>
    <fieldset class="consents"><legend class="sr">Zgody</legend>
      <label class="check"><input type="checkbox" name="c1" required><span><b>*</b> Akceptuję <a href="#">regulamin kalkulatora</a> i zapoznałem/am się z <a href="#">informacją o przetwarzaniu danych osobowych</a>.</span></label>
      <label class="check"><input type="checkbox" name="c2" required><span><b>*</b> Wyrażam zgodę na przetwarzanie moich danych w celu przygotowania i przesłania kosztorysu oraz kontaktu w jego sprawie.</span></label>
      <label class="check"><input type="checkbox" name="c3"><span>Wyrażam zgodę na kontakt telefoniczny w celach marketingowych.</span></label>
      <label class="check"><input type="checkbox" name="c4"><span>Chcę otrzymywać informacje o promocjach i nowościach drogą elektroniczną.</span></label>
      <p class="rodo">Administratorem danych jest operator salonów firmowych Jawor-Parkiet. Dane przetwarzamy na podstawie art. 6 ust. 1 lit. a, b i f RODO przez 12 miesięcy od przygotowania wyceny. Masz prawo dostępu, sprostowania, usunięcia danych i wycofania zgody w dowolnym momencie.</p>
    </fieldset>
    <p class="err" id="formErr" role="alert"></p>
  </form>`;
}

function renderQuote() {
  const q = quote(), f = curFormat(), c = state.contact;
  const no = 'PP-2026-10-' + String(Math.floor(1000 + Math.random() * 9000));
  const today = new Date();
  const valid = new Date(today.getTime() + 14 * 864e5);
  const d = x => x.toLocaleDateString('pl-PL');
  panel.innerHTML = `<div class="quote" id="quote">
    <div class="quote__head"><div><p class="eyebrow">Wstępny kosztorys</p><h3 class="step__t">${c.fn}, oto Twoja podłoga</h3></div><div class="quote__meta"><span>Nr ${no}</span><span>z dnia ${d(today)}</span><span>ważny do ${d(valid)}</span></div></div>
    <div class="quote__spec">
      <div class="quote__vis" style="${woodStyle(toneNow())}">${picto(state.layout)}</div>
      <dl>
        <dt>Układ</dt><dd>${layoutName(state.layout)}</dd>
        <dt>Drewno i klasa</dt><dd>${D.species.find(s => s.id === state.species).name} ${state.cls}</dd>
        <dt>Format</dt><dd>${f.name} · ${f.dims}</dd>
        <dt>Wykończenie</dt><dd>${finishLabel()}</dd>
      </dl>
    </div>
    <table class="qt">
      <tbody>
        <tr><td>Podłoga ${f.name}<small>${fmt1(q.net)} m² + zapas ${Math.round(q.waste * 100)}% = ${fmt1(q.matArea)} m² × ${fmt(q.unit)}/m²</small></td><td>${fmt(q.material)}</td></tr>
        ${q.inst ? `<tr><td>Montaż – ${layoutName(state.layout).toLowerCase()}<small>${fmt1(q.net)} m² × ${fmt(P.install[state.layout])}/m²</small></td><td>${fmt(q.install)}</td></tr>
        <tr><td>Klej i grunt<small>${fmt1(q.net)} m² × ${fmt(P.glue)}/m²</small></td><td>${fmt(q.glue)}</td></tr>` : ''}
        <tr class="qt__sub"><td>Razem netto</td><td>${fmt(q.netSum)}</td></tr>
        <tr><td>VAT ${Math.round(q.vatRate * 100)}%</td><td>${fmt(q.vat)}</td></tr>
      </tbody>
      <tfoot><tr><td>Do zapłaty brutto</td><td>${fmt(q.gross)}</td></tr></tfoot>
    </table>
    <div class="quote__glue">
      <p><b>Zapotrzebowanie na Twoją budowę</b></p>
      <ul><li><span class="bucket">${q.bond}×</span> J-P Bond Elastic 1K, wiadro 16 kg <small>(zużycie do 1,2 kg/m²)</small></li>
      <li><span class="bucket">${q.primer}×</span> J-P Primer Eko, opakowanie 6 kg <small>(zużycie do 150 g/m²)</small></li></ul>
      ${q.inst ? '<p class="muted small">Klej i grunt są wliczone w cenę montażu.</p>' : '<p class="muted small">Klej i grunt możesz dokupić w salonie.</p>'}
    </div>
    <div class="quote__tech"><p><b>Zanim przyjedzie ekipa</b></p><p class="small">Wilgotność jastrychu cementowego z ogrzewaniem maks. 1,8% CM, anhydrytu maks. 0,3% CM. Wymagany 30-dniowy cykl wygrzewania posadzki. Klimat we wnętrzu: 45–60% wilgotności, 18–24°C.</p></div>
    <p class="disclaimer">Kosztorys ma charakter wstępny i nie stanowi oferty w rozumieniu art. 66 Kodeksu cywilnego. Ostateczna cena zależy od pomiaru, stanu podłoża i dostępności towaru.</p>
    <div class="quote__cta">
      <button type="button" class="btn" id="sendBtn">Wyślij kosztorys na ${c.em}</button>
      <a class="btn btn--ghost" href="#salony">Umów pomiar w salonie</a>
      <button type="button" class="btn btn--ghost" id="printBtn">Pobierz PDF</button>
    </div>
    <button type="button" class="link restart" id="restart">← Zmień konfigurację</button>
  </div>`;
  $('#progLabel').textContent = 'Kosztorys gotowy';
  $('#progBar').style.width = '100%';
  $('#sendBtn').onclick = () => toast(`Kosztorys wysłany na ${c.em}. Salon oddzwoni w ciągu 24 godzin.`);
  $('#printBtn').onclick = () => window.print();
  $('#restart').onclick = () => { state.step = 0; delete state.done; save(); render(); };
}

const templates = [stepLayout, stepSpecies, stepClass, stepFormat, stepColor, stepScope, stepArea, stepContact];
const required = [
  () => state.layout, () => state.species, () => state.cls, () => state.format,
  () => state.finishType === 'ci' ? !!state.color : !!state.finish,
  () => state.scope, () => +state.area >= 5 && +state.area <= 1000, () => true
];

function nav() {
  const i = state.step, last = i === templates.length - 1;
  return `<div class="nav">
    ${i > 0 ? '<button type="button" class="btn btn--ghost" id="back">← Wstecz</button>' : '<span></span>'}
    <button type="button" class="btn" id="next" ${required[i]() ? '' : 'disabled'}>${last ? 'Pokaż mój kosztorys' : 'Dalej →'}</button>
  </div>`;
}

function render(scroll) {
  renderSummary();
  document.querySelector('.calc__body').classList.toggle('is-done', !!state.done);
  if (state.done) { renderQuote(); return; }
  const i = state.step;
  panel.innerHTML = `<div class="step" data-step="${i}">${templates[i]()}</div>${nav()}`;
  $('#progLabel').textContent = `Krok ${i + 1} z ${STEPS.length} · ${STEPS[i]}`;
  $('#progBar').style.width = ((i + 1) / STEPS.length * 100) + '%';
  bind();
  if (scroll) document.getElementById('kalkulator').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setKey(k, b.dataset.v); save();
      const auto = ['layout', 'species', 'cls', 'format', 'scope'].includes(k);
      if (auto && state.step < templates.length - 1) { state.step++; save(); render(); }
      else render();
    }));
  });
  panel.querySelectorAll('[data-ft]').forEach(b => b.addEventListener('click', () => { state.finishType = b.dataset.ft; save(); render(); }));
  panel.querySelectorAll('[data-tg]').forEach(cb => cb.addEventListener('change', () => { state[cb.dataset.tg] = cb.checked; save(); renderSummary(); }));
  const back = $('#back'); if (back) back.onclick = () => { state.step--; save(); render(); };
  const next = $('#next');
  next.onclick = () => {
    if (state.step === templates.length - 1) return submit();
    state.step++; save(); render();
  };
  const area = $('#area');
  if (area) {
    const upd = () => {
      state.area = area.value; save();
      const v = +area.value, w = P.waste[state.layout];
      $('#areaHint').textContent = v >= 5 && v <= 1000 ? `Zamówimy ${fmt1(Math.round(v * (1 + w) * 100) / 100)} m² podłogi (z zapasem ${Math.round(w * 100)}%).` : (area.value ? 'Podaj wartość od 5 do 1000 m².' : '');
      next.disabled = !required[state.step](); renderSummary();
    };
    area.addEventListener('input', upd); upd();
    const list = $('#roomList');
    const sync = () => {
      state.rooms = [...list.querySelectorAll('.room')].map(r => ({ n: r.querySelector('[data-f=n]').value, a: r.querySelector('[data-f=a]').value, b: r.querySelector('[data-f=b]').value }));
      const sum = state.rooms.reduce((s, r) => s + (+r.a || 0) * (+r.b || 0), 0);
      if (sum > 0) { area.value = Math.round(sum * 10) / 10; upd(); } else save();
    };
    list.addEventListener('input', sync);
    list.addEventListener('click', e => { if (e.target.classList.contains('room__x')) { e.target.parentElement.remove(); sync(); } });
    $('#addRoom').onclick = () => { list.insertAdjacentHTML('beforeend', roomRow({}, list.children.length)); list.lastElementChild.querySelector('input').focus(); };
  }
  const form = $('#contactForm');
  if (form) {
    const c = state.contact || {}; if (c.when) form.when.value = c.when;
    form.addEventListener('input', () => { state.contact = Object.fromEntries(['fn','ln','em','ph','city','when'].map(n => [n, form[n].value])); save(); });
  }
}

function submit() {
  const form = $('#contactForm'), err = $('#formErr');
  form.querySelectorAll('.is-bad').forEach(x => x.classList.remove('is-bad'));
  const bad = [];
  ['fn', 'ln'].forEach(n => { if (form[n].value.trim().length < 2) bad.push(form[n]); });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.em.value.trim())) bad.push(form.em);
  if (form.ph.value.replace(/\D/g, '').replace(/^48/, '').length !== 9) bad.push(form.ph);
  if (!form.c1.checked) bad.push(form.c1.closest('.check'));
  if (!form.c2.checked) bad.push(form.c2.closest('.check'));
  if (bad.length) {
    bad.forEach(x => (x.closest('.field') || x).classList.add('is-bad'));
    err.textContent = 'Uzupełnij zaznaczone pola i wymagane zgody (*).';
    bad[0].querySelector ? (bad[0].querySelector('input') || bad[0]).focus() : bad[0].focus();
    return;
  }
  state.contact = Object.fromEntries(['fn','ln','em','ph','city','when'].map(n => [n, form[n].value.trim()]));
  state.done = true; save(); render(true);
}

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('is-on'); setTimeout(() => t.classList.remove('is-on'), 4200); }

/* mobile sticky CTA hides when calculator is in view */
const cta = $('#mobileCta');
new IntersectionObserver(([e]) => cta.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0.05 }).observe($('#kalkulator'));

render();
})();
