/* Cennik konfiguratora Pan od Parkietów – ceny KOŃCOWE netto zł/m² (materiał).
   Plik wygenerowany przez narzedzia-NIE-WGRYWAC/aktualizuj-cennik.js – nie zawiera rabatów ani marż. */
window.JP = {
  params: {"waste":{"mijanka":0.1,"jodelka_klasyczna":0.15,"jodelka_francuska":0.15},"install":{"mijanka":80,"jodelka_klasyczna":95,"jodelka_francuska":95},"glue":38,"vatInstall":0.08,"vatMaterial":0.23,"bondKgM2":1.2,"bondKg":16,"primerKgM2":0.15,"primerKg":6,"minArea":5,"maxArea":1000},
  layouts: [
    {"id":"mijanka","name":"Mijanka","sub":"Wzór prosty, klasyczny","waste":"10%"},
    {"id":"jodelka_klasyczna","name":"Jodełka klasyczna","sub":"Klepki pod kątem prostym","waste":"15%"},
    {"id":"jodelka_francuska","name":"Jodełka francuska","sub":"Klepki cięte pod 45°","waste":"15%"}
  ],
  species: [
    {"id":"dab","name":"Dąb","sub":"Najbardziej uniwersalny, twardy, ponadczasowy","tone":"#c7a473","img":"img/drewno/dab-classic.webp"},
    {"id":"jesion","name":"Jesion","sub":"Jasny, wyrazisty rysunek słojów","tone":"#e9d2a4","img":"img/drewno/jesion-elegance.webp"},
    {"id":"orzech","name":"Orzech","sub":"Głęboki, czekoladowy odcień","tone":"#554232","img":"img/drewno/orzech-premium.webp"},
    {"id":"merbau","name":"Merbau","sub":"Egzotyczny, ciepły brąz z czerwienią","tone":"#71492f","img":"img/drewno/merbau-elegance.webp"}
  ],
  classes: {
    dab: [
      {"id":"Elegance","name":"Elegance","sub":"Najspokojniejszy rysunek: bez bieli, małe sęki, dopuszczalne zmiany barwy.","knots":1,"img":"img/drewno/dab-elegance.webp","tone":"#bc9867"},
      {"id":"Classic","name":"Classic","sub":"Więcej charakteru: sęki dopuszczalne, mikropęknięcia, bez bieli.","knots":2,"img":"img/drewno/dab-classic.webp","tone":"#c7a473"},
      {"id":"Country","name":"Country","sub":"Najwięcej natury: słój dowolny, różnice w barwie, sęki i biel dopuszczalne.","knots":3,"img":"img/drewno/dab-country.webp","tone":"#c4a374"}
    ],
    jesion: [
      {"id":"Elegance","name":"Elegance","sub":"Sęki sporadyczne, kolorystyka naturalna jasna.","knots":1,"img":"img/drewno/jesion-elegance.webp","tone":"#e9d2a4"},
      {"id":"Elegance Dark","name":"Elegance Dark","sub":"Dopuszczalna twardziel, kolorystyka naturalna ciemna.","knots":2,"img":"img/drewno/jesion-elegance-dark.webp","tone":"#ceab7d"},
      {"id":"Elegance Kolor","name":"Elegance Kolor","sub":"Znaczne różnice kolorystyczne, efekt jasno-ciemny.","knots":2,"img":"img/drewno/jesion-elegance-kolor.webp","tone":"#d1b284"},
      {"id":"Elegance Kolor Bielony","name":"Elegance Kolor Bielony","sub":"Jasno-ciemny, z białym podkładem lub białym olejowoskiem.","knots":2,"img":"img/drewno/jesion-elegance-kolor-bielony.webp","tone":"#e7d6b9"},
      {"id":"Bursztyn","name":"Bursztyn (termowany)","sub":"Kolorystyka ciemna, produkt termowany.","knots":1,"img":"img/drewno/jesion-bursztyn.webp","tone":"#6e4a2e"},
      {"id":"Koniak","name":"Koniak (termowany)","sub":"Kolorystyka bardzo ciemna, produkt termowany.","knots":1,"img":"img/drewno/jesion-koniak.webp","tone":"#33231b"},
      {"id":"Polar","name":"Polar","sub":"Zróżnicowana kolorystyka, biały olejowosk, szczotkowanie w cenie.","knots":2,"img":"img/drewno/jesion-polar.webp","tone":"#e5dbcc"}
    ],
    orzech: [
      {"id":"Premium","name":"Premium","sub":"Najwyższa selekcja orzecha amerykańskiego.","knots":1,"img":"img/drewno/orzech-premium.webp","tone":"#554232"},
      {"id":"Elegance Plus","name":"Elegance Plus","sub":"Naturalny rysunek, zróżnicowana barwa.","knots":2,"img":"img/drewno/orzech-elegance-plus.webp","tone":"#49372a"}
    ],
    merbau: [
      {"id":"Elegance","name":"Elegance","sub":"Dowolny przebieg słojów, kolorystyka zbliżona.","knots":1,"img":"img/drewno/merbau-elegance.webp","tone":"#71492f"}
    ]
  },
  /* price: wykończenie transparentne wg gatunku i klasy · ci: Color Inspiration [Country, Classic, Elegance] · inc: co jest w cenie (V4, SZ) */
  formats: [
    {"id":"fp","name":"FertigParkiet","dims":"65–70 × 480–490 mm","w":68,"l":485,"thick":"14 mm (dąb) / 13 mm (jesion)","layouts":["mijanka","jodelka_klasyczna"],"price":{"dab":{"Elegance":305,"Classic":273,"Country":253},"jesion":{"Elegance":330,"Elegance Dark":330,"Elegance Kolor":289,"Elegance Kolor Bielony":318,"Bursztyn":289,"Koniak":289,"Polar":260}},"ci":{"ol":[285,305,328],"fh":[305,325,349]},"inc":{"dab":[],"jesion":["V4"]},"note":"Jodełka klasyczna z piórem prawym i lewym na zamówienie"},
    {"id":"fd","name":"FertigDeska","dims":"130–150 × 600–1500 mm","w":140,"l":1100,"thick":"14 mm (dąb) / 13 mm","layouts":["mijanka"],"price":{"dab":{"Elegance":363,"Classic":317,"Country":288},"jesion":{"Elegance":359,"Elegance Dark":359,"Elegance Kolor":318,"Elegance Kolor Bielony":347,"Bursztyn":318,"Koniak":318},"orzech":{"Premium":482,"Elegance Plus":424},"merbau":{"Elegance":395}},"ci":{"ol":[317,346,386],"fh":[337,366,407]},"inc":{"dab":[],"jesion":["V4"],"orzech":["V4"],"merbau":["V4"]}},
    {"id":"fdm","name":"FertigDeska Maxi","dims":"140–150 × 1500–2200 mm","w":145,"l":1850,"thick":"13 mm","layouts":["mijanka"],"price":{"dab":{"Elegance":375,"Classic":328,"Country":299}},"ci":{"ol":[328,357,398],"fh":[349,378,418]},"inc":{"dab":["V4"]}},
    {"id":"lux","name":"FertigDeska Luxury 220","dims":"180–200 × 1500–2200 mm","w":190,"l":1850,"thick":"15 mm","layouts":["mijanka"],"price":{"dab":{"Elegance":468,"Classic":363,"Country":323}},"ci":{"ol":[352,398,497],"fh":[372,418,517]},"inc":{"dab":["V4"]},"incClass":{"Country":["SZ"]}},
    {"id":"luxm","name":"FertigDeska Luxury Maxi","dims":"250–260 × 2000–2500 mm","w":255,"l":2250,"thick":"15 mm","layouts":["mijanka"],"price":{"dab":{"Classic":436}},"ci":{"ol":[462,null,null],"fh":[482,null,null]},"inc":{"dab":["V4","SZ"]}},
    {"id":"de","name":"Design Experience","dims":"120 × 590–600 mm","w":120,"l":595,"thick":"13 mm","layouts":["mijanka","jodelka_klasyczna"],"price":{"dab":{"Elegance":334,"Classic":302}},"ci":{"ol":[314,331,363],"fh":[334,352,383]},"inc":{"dab":["V4","SZ"]},"note":"Pióro prawe i lewe w standardzie"},
    {"id":"dem","name":"Design Experience Maxi","dims":"140/150 × 750 mm","w":145,"l":750,"thick":"13 mm","layouts":["mijanka","jodelka_klasyczna"],"price":{"dab":{"Elegance":366,"Classic":325}},"ci":{"ol":[334,354,395],"fh":[354,375,415]},"inc":{"dab":["V4","SZ"]},"note":"Pióro prawe i lewe w standardzie"},
    {"id":"demp","name":"Design Experience Maxi+","dims":"180 × 900 mm","w":180,"l":900,"thick":"13 mm","layouts":["mijanka","jodelka_klasyczna"],"price":{"dab":{"Elegance":398,"Classic":349}},"ci":{"ol":[354,378,427],"fh":[375,398,447]},"inc":{"dab":["V4","SZ"]},"note":"Pióro prawe i lewe w standardzie"},
    {"id":"fpc","name":"FertigParkiet Chevron","dims":"szer. 65/70 mm · krawędź 400–420 mm","w":68,"l":470,"thick":"13 mm","layouts":["jodelka_francuska"],"price":{"dab":{"Elegance":363,"Classic":331,"Country":311},"jesion":{"Bursztyn":349}},"ci":{"ol":[340,360,392],"fh":[360,381,412]},"inc":{"dab":["V4","SZ"],"jesion":["V4","SZ"]},"note":"Fabrycznie cięte pod 45°"},
    {"id":"fdc","name":"FertigDeska Chevron","dims":"szer. 130–150 mm · krawędź 440–850 mm","w":140,"l":740,"thick":"13 mm","layouts":["jodelka_francuska"],"price":{"dab":{"Elegance":427,"Classic":375,"Country":340}},"ci":{"ol":[375,410,450],"fh":[395,430,470]},"inc":{"dab":["V4","SZ"]},"note":"Fabrycznie cięte pod 45°"}
  ],
  surcharge: {"V4":5,"SZ":9},
  /* kolory Color Inspiration: [nazwa, średni odcień, zdjęcie dekoru z jawor-parkiet.pl] */
  colors: [["Alabastro","#c2a683","img/drewno/ci-alabastro.webp"],["Alba","#ab9172","img/drewno/ci-alba.webp"],["Avorio","#b29d7d","img/drewno/ci-avorio.webp"],["Bianco","#e1d2ba","img/drewno/ci-bianco.webp"],["Caldo","#af9f90","img/drewno/ci-caldo.webp"],["Capri","#9b805d","img/drewno/ci-capri.webp"],["Como","#836b4f","img/drewno/ci-como.webp"],["Ferro","#7e705c","img/drewno/ci-ferro.webp"],["Luna","#b5a17e","img/drewno/ci-luna.webp"],["Marone","#332a22","img/drewno/ci-marone.webp"],["Nero","#584e3b","img/drewno/ci-nero.webp"],["Oro","#a47f51","img/drewno/ci-oro.webp"],["Rosolare","#695238","img/drewno/ci-rosolare.webp"],["Sole","#d3b490","img/drewno/ci-sole.webp"],["Vento","#483a2d","img/drewno/ci-vento.webp"],["Vulcano","#846c4d","img/drewno/ci-vulcano.webp"]]
};
window.JP.company = { name: 'Studio Parkietu Piotr Wałkowski', addr: 'ul. Moniuszki 7, 63-200 Jarocin', nip: '6171846758' };
window.JP.salons = [
  { id: 'poznan-m1', name: 'Salon Poznań', place: 'Centrum Handlowe M1', street: 'ul. Szwajcarska 14', city: '61-285 Poznań', email: 'jaworparkiet.poznan@gmail.com', phone: '510244220' },
  { id: 'komorniki', name: 'Salon Komorniki', place: 'Galeria Top Meble', street: 'ul. Poznańska 140', city: '62-052 Komorniki', email: 'jaworparkiet.komorniki@gmail.com', phone: '577244220' },
  { id: 'poznan-obornicka', name: 'Salon Poznań Obornicka', place: 'Galeria Wnętrz Obornicka 337', street: 'ul. Obornicka 337', city: '60-689 Poznań', email: 'obornicka.jaworparkiet@gmail.com', phone: '881244220' },
  { id: 'bydgoszcz', name: 'Salon Bydgoszcz', place: '', street: 'ul. Toruńska 276A', city: '85-831 Bydgoszcz', email: 'jaworparkiet.bydgoszcz@gmail.com', phone: '786244220' }
];

/* Konfiguracja integracji.
   demo: true  – strona działa bez n8n (symulacja wysyłki i przykładowe terminy). PRZED STARTEM ustaw demo: false.
   turnstileSiteKey – klucz witryny Cloudflare Turnstile (ochrona przed botami). Pusty = widżet wyłączony.
   consentVersion – data wersji regulaminu i klauzuli; zmień przy każdej zmianie dokumentów. */
window.JP.config = {
  demo: true,
  turnstileSiteKey: '',
  consentVersion: '2026-11-21',
  mainPhone: '510244220',
  pdfLib: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  n8n: {
    quote: 'https://n8n.nextgenbiznes.pl/webhook/panodparkietow-kosztorys',
    slots: 'https://n8n.nextgenbiznes.pl/webhook/panodparkietow-terminy',
    book:  'https://n8n.nextgenbiznes.pl/webhook/panodparkietow-rezerwacja'
  },
  visitTypes: [
    { id: 'salon', name: 'Wizyta w salonie', sub: 'Próbki, kolory, doradztwo · ok. 60 min' },
    { id: 'pomiar', name: 'Pomiar na budowie', sub: 'Pomiar i sprawdzenie podłoża · ok. 60 min' }
  ]
};
