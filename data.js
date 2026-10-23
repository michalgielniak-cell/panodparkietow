/* Dane z cennika detalicznego Jawor-Parkiet ważnego od 01.09.2026 (ceny katalogowe netto zł/m²).
   UWAGA: w wersji produkcyjnej cennik, rabat i marża są wyłącznie po stronie serwera. */
window.JP = {
  params: {
    discount: 0.42, margin: 75, staff: 30,
    waste: { mijanka: 0.10, jodelka_klasyczna: 0.15, jodelka_francuska: 0.15 },
    install: { mijanka: 80, jodelka_klasyczna: 95, jodelka_francuska: 95 },
    glue: 38, vatInstall: 0.08, vatMaterial: 0.23,
    bondKgM2: 1.2, bondKg: 16, primerKgM2: 0.15, primerKg: 6
  },
  layouts: [
    { id: 'mijanka', name: 'Mijanka', sub: 'Wzór prosty, klasyczny', waste: '10%' },
    { id: 'jodelka_klasyczna', name: 'Jodełka klasyczna', sub: 'Klepki pod kątem prostym', waste: '15%' },
    { id: 'jodelka_francuska', name: 'Jodełka francuska', sub: 'Klepki cięte pod 45°', waste: '15%' }
  ],
  species: [
    { id: 'dab', name: 'Dąb', sub: 'Najbardziej uniwersalny, twardy, ponadczasowy', tone: '#b8895a' },
    { id: 'jesion', name: 'Jesion', sub: 'Jasny, wyrazisty rysunek słojów', tone: '#d7bf98' },
    { id: 'orzech', name: 'Orzech', sub: 'Głęboki, czekoladowy odcień', tone: '#6b4a34' },
    { id: 'merbau', name: 'Merbau', sub: 'Egzotyczny, ciepły brąz z czerwienią', tone: '#7a3f2a' }
  ],
  classes: {
    dab: [
      { id: 'Elegance', name: 'Elegance', sub: 'Najspokojniejszy rysunek: bez bieli, małe sęki, dopuszczalne zmiany barwy.', knots: 1 },
      { id: 'Classic', name: 'Classic', sub: 'Więcej charakteru: sęki dopuszczalne, mikropęknięcia, bez bieli.', knots: 2 },
      { id: 'Country', name: 'Country', sub: 'Najwięcej natury: słój dowolny, różnice w barwie, sęki i biel dopuszczalne.', knots: 3 }
    ],
    jesion: [
      { id: 'Elegance', name: 'Elegance', sub: 'Sęki sporadyczne, kolorystyka naturalna jasna.', knots: 1 },
      { id: 'Elegance Dark', name: 'Elegance Dark', sub: 'Dopuszczalna twardziel, kolorystyka naturalna ciemna.', knots: 2 },
      { id: 'Elegance Kolor', name: 'Elegance Kolor', sub: 'Znaczne różnice kolorystyczne, efekt jasno-ciemny.', knots: 2 },
      { id: 'Elegance Kolor Bielony', name: 'Elegance Kolor Bielony', sub: 'Jasno-ciemny, z białym podkładem lub białym olejowoskiem.', knots: 2 },
      { id: 'Bursztyn', name: 'Bursztyn (termowany)', sub: 'Kolorystyka ciemna, produkt termowany.', knots: 1 },
      { id: 'Koniak', name: 'Koniak (termowany)', sub: 'Kolorystyka bardzo ciemna, produkt termowany.', knots: 1 },
      { id: 'Polar', name: 'Polar', sub: 'Zróżnicowana kolorystyka, biały olejowosk, szczotkowanie w cenie.', knots: 2 }
    ],
    orzech: [
      { id: 'Premium', name: 'Premium', sub: 'Najwyższa selekcja orzecha amerykańskiego.', knots: 1 },
      { id: 'Elegance Plus', name: 'Elegance Plus', sub: 'Naturalny rysunek, zróżnicowana barwa.', knots: 2 }
    ],
    merbau: [
      { id: 'Elegance', name: 'Elegance', sub: 'Dowolny przebieg słojów, kolorystyka zbliżona.', knots: 1 }
    ]
  },
  /* formaty: layouts, gatunek, ceny transparentne wg klasy, ceny Color Inspiration (olejowosk / Fusion Hybrid wg Country/Classic/Elegance),
     inc: co jest w cenie (V4, SZ) */
  formats: [
    { id: 'fp', name: 'FertigParkiet', dims: '65–70 × 480–490 mm', w: 68, l: 485, thick: '14 mm (dąb) / 13 mm (jesion)', layouts: ['mijanka','jodelka_klasyczna'],
      price: { dab: { Elegance: 345, Classic: 290, Country: 255 },
               jesion: { 'Elegance': 388, 'Elegance Dark': 388, 'Elegance Kolor': 318, 'Elegance Kolor Bielony': 368, 'Bursztyn': 318, 'Koniak': 318, 'Polar': 268 } },
      ci: { ol: [310,345,385], fh: [345,380,420] }, inc: { dab: [], jesion: ['V4'] }, note: 'Jodełka klasyczna z piórem prawym i lewym na zamówienie' },
    { id: 'fd', name: 'FertigDeska', dims: '130–150 × 600–1500 mm', w: 140, l: 1100, thick: '14 mm (dąb) / 13 mm', layouts: ['mijanka'],
      price: { dab: { Elegance: 445, Classic: 365, Country: 315 },
               jesion: { 'Elegance': 438, 'Elegance Dark': 438, 'Elegance Kolor': 368, 'Elegance Kolor Bielony': 418, 'Bursztyn': 368, 'Koniak': 368 },
               orzech: { 'Premium': 650, 'Elegance Plus': 550 }, merbau: { 'Elegance': 500 } },
      ci: { ol: [365,415,485], fh: [400,450,520] }, inc: { dab: [], jesion: ['V4'], orzech: ['V4'], merbau: ['V4'] } },
    { id: 'fdm', name: 'FertigDeska Maxi', dims: '140–150 × 1500–2200 mm', w: 145, l: 1850, thick: '13 mm', layouts: ['mijanka'],
      price: { dab: { Elegance: 465, Classic: 385, Country: 335 } }, ci: { ol: [385,435,505], fh: [420,470,540] }, inc: { dab: ['V4'] } },
    { id: 'lux', name: 'FertigDeska Luxury 220', dims: '180–200 × 1500–2200 mm', w: 190, l: 1850, thick: '15 mm', layouts: ['mijanka'],
      price: { dab: { Elegance: 625, Classic: 445, Country: 375 } }, ci: { ol: [425,505,675], fh: [460,540,710] }, inc: { dab: ['V4'] }, incClass: { Country: ['SZ'] } },
    { id: 'luxm', name: 'FertigDeska Luxury Maxi', dims: '250–260 × 2000–2500 mm', w: 255, l: 2250, thick: '15 mm', layouts: ['mijanka'],
      price: { dab: { Classic: 570 } }, ci: { ol: [615,null,null], fh: [650,null,null] }, inc: { dab: ['V4','SZ'] } },
    { id: 'de', name: 'Design Experience', dims: '120 × 590–600 mm', w: 120, l: 595, thick: '13 mm', layouts: ['mijanka','jodelka_klasyczna'],
      price: { dab: { Elegance: 395, Classic: 340 } }, ci: { ol: [360,390,445], fh: [395,425,480] }, inc: { dab: ['V4','SZ'] }, note: 'Pióro prawe i lewe w standardzie' },
    { id: 'dem', name: 'Design Experience Maxi', dims: '140/150 × 750 mm', w: 145, l: 750, thick: '13 mm', layouts: ['mijanka','jodelka_klasyczna'],
      price: { dab: { Elegance: 450, Classic: 380 } }, ci: { ol: [395,430,500], fh: [430,465,535] }, inc: { dab: ['V4','SZ'] }, note: 'Pióro prawe i lewe w standardzie' },
    { id: 'demp', name: 'Design Experience Maxi+', dims: '180 × 900 mm', w: 180, l: 900, thick: '13 mm', layouts: ['mijanka','jodelka_klasyczna'],
      price: { dab: { Elegance: 505, Classic: 420 } }, ci: { ol: [430,470,555], fh: [465,505,590] }, inc: { dab: ['V4','SZ'] }, note: 'Pióro prawe i lewe w standardzie' },
    { id: 'fpc', name: 'FertigParkiet Chevron', dims: 'szer. 65/70 mm · krawędź 400–420 mm', w: 68, l: 470, thick: '13 mm', layouts: ['jodelka_francuska'],
      price: { dab: { Elegance: 445, Classic: 390, Country: 355 }, jesion: { 'Bursztyn': 420 } }, ci: { ol: [405,440,495], fh: [440,475,530] }, inc: { dab: ['V4','SZ'], jesion: ['V4','SZ'] }, note: 'Fabrycznie cięte pod 45°' },
    { id: 'fdc', name: 'FertigDeska Chevron', dims: 'szer. 130–150 mm · krawędź 440–850 mm', w: 140, l: 740, thick: '13 mm', layouts: ['jodelka_francuska'],
      price: { dab: { Elegance: 555, Classic: 465, Country: 405 } }, ci: { ol: [465,525,595], fh: [500,560,630] }, inc: { dab: ['V4','SZ'] }, note: 'Fabrycznie cięte pod 45°' }
  ],
  surcharge: { V4: 8, SZ: 16 },
  /* kolory Color Inspiration – próbki poglądowe */
  colors: [
    ['Alabastro','#e6dccb'],['Alba','#dccdb4'],['Avorio','#d3bd98'],['Bianco','#ebe5da'],
    ['Caldo','#b5845a'],['Capri','#a39079'],['Como','#8a755c'],['Ferro','#6d6a64'],
    ['Luna','#c8c0b2'],['Marone','#6a4931'],['Nero','#2c2724'],['Oro','#c69a5f'],
    ['Rosolare','#9a6849'],['Sole','#d4ad78'],['Vento','#b1a797'],['Vulcano','#4a3f37']
  ]
};
