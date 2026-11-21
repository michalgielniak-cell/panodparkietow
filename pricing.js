/* Pan od Parkietów – wspólny moduł wyceny.
   Ten sam kod działa w przeglądarce (window.JPPricing) i w n8n (wklejony do węzła Code),
   dzięki czemu cena w e-mailu zawsze zgadza się z ceną na stronie, a serwer nie ufa liczbom z przeglądarki. */
(function (root) {
  'use strict';
  var CI_IDX = { Country: 0, Classic: 1, Elegance: 2 };
  var SCOPES = {
    install8:  { install: true,  vat: 'vatInstall',  label: 'Materiał z montażem – mieszkanie lub dom' },
    install23: { install: true,  vat: 'vatMaterial', label: 'Materiał z montażem – lokal użytkowy lub ponad limit' },
    material:  { install: false, vat: 'vatMaterial', label: 'Sam materiał' }
  };
  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var has = function (o, k) { return o != null && Object.prototype.hasOwnProperty.call(o, k); };

  function formatsFor(D, layout, species, cls) {
    return D.formats.filter(function (f) {
      if (f.layouts.indexOf(layout) < 0) return false;
      var t = has(f.price, species) && (cls ? f.price[species][cls] != null : true);
      var c = species === 'dab' && f.ci && (cls ? f.ci.ol[CI_IDX[cls]] != null : true);
      return !!(t || c);
    });
  }
  function included(f, species, cls) {
    var inc = {};
    ((f.inc && f.inc[species]) || []).forEach(function (x) { inc[x] = 1; });
    if (f.incClass && f.incClass[cls]) f.incClass[cls].forEach(function (x) { inc[x] = 1; });
    if (cls === 'Polar') inc.SZ = 1;
    return inc;
  }
  function transparentOk(f, species, cls) { return has(f.price, species) && f.price[species][cls] != null; }
  function ciOk(f, species, cls) { return species === 'dab' && !!f.ci && f.ci.ol[CI_IDX[cls]] != null; }

  function fail(field) { var e = new Error('Nieprawidłowa konfiguracja: ' + field); e.code = 'invalid_config'; e.field = field; throw e; }

  /* s = { layout, species, cls, format, finishType:'t'|'ci', finish:'LA'|'OL', coat:'ol'|'fh', color, v4, sz, scope, area } */
  function quote(D, s) {
    var P = D.params;
    var layout = D.layouts.filter(function (x) { return x.id === s.layout; })[0] || fail('layout');
    var species = D.species.filter(function (x) { return x.id === s.species; })[0] || fail('species');
    if (!(D.classes[s.species] || []).some(function (c) { return c.id === s.cls; })) fail('cls');
    var f = formatsFor(D, s.layout, s.species, s.cls).filter(function (x) { return x.id === s.format; })[0] || fail('format');
    var inc = included(f, s.species, s.cls), unit, v4, sz, finish;
    if (s.finishType === 'ci') {
      if (!ciOk(f, s.species, s.cls)) fail('finishType');
      if (!D.colors.some(function (c) { return c[0] === s.color; })) fail('color');
      unit = f.ci[s.coat === 'fh' ? 'fh' : 'ol'][CI_IDX[s.cls]];
      if (unit == null) fail('coat');
      v4 = sz = true;
      finish = 'Color Inspiration ' + s.color + ' · ' + (s.coat === 'fh' ? 'Fusion Hybrid' : 'olejowosk');
    } else if (s.finishType === 't') {
      if (!transparentOk(f, s.species, s.cls)) fail('finishType');
      if (s.finish !== 'LA' && s.finish !== 'OL') fail('finish');
      unit = f.price[s.species][s.cls];
      v4 = !!s.v4 || !!inc.V4; sz = !!s.sz || !!inc.SZ;
      if (s.v4 && !inc.V4) unit += D.surcharge.V4;
      if (s.sz && !inc.SZ) unit += D.surcharge.SZ;
      finish = [s.finish === 'OL' ? 'Olejowosk transparentny' : 'Lakier UV transparentny'].concat(v4 ? ['V4'] : [], sz ? ['szczotkowanie'] : []).join(' · ');
    } else fail('finishType');
    var sc = SCOPES[s.scope] || fail('scope');
    var net = Math.round(Number(s.area) * 10) / 10;
    if (!(net >= P.minArea && net <= P.maxArea)) fail('area');

    var waste = P.waste[s.layout];
    var matArea = r2(net * (1 + waste));
    var material = r2(matArea * unit);
    var installRate = sc.install ? P.install[s.layout] : 0;
    var install = r2(net * installRate);
    var glue = sc.install ? r2(net * P.glue) : 0;
    var netSum = r2(material + install + glue);
    var vatRate = P[sc.vat];
    var vat = r2(netSum * vatRate);
    return {
      unit: unit, net: net, waste: waste, wastePct: Math.round(waste * 100), matArea: matArea,
      material: material, installRate: installRate, install: install, glueRate: P.glue, glue: glue,
      netSum: netSum, vatRate: vatRate, vatPct: Math.round(vatRate * 100), vat: vat, gross: r2(netSum + vat),
      bond: Math.ceil(net * P.bondKgM2 / P.bondKg), primer: Math.ceil(net * P.primerKgM2 / P.primerKg),
      inst: sc.install,
      labels: {
        layout: layout.name, species: species.name, cls: s.cls, format: f.name, dims: f.dims, thickness: f.thick,
        finish: finish, scope: sc.label, v4: v4, sz: sz
      }
    };
  }

  var api = { CI_IDX: CI_IDX, SCOPES: SCOPES, formatsFor: formatsFor, included: included, transparentOk: transparentOk, ciOk: ciOk, quote: quote };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.JPPricing = api;
})(typeof window !== 'undefined' ? window : this);
