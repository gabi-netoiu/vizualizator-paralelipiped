# Vizualizator paralelipiped — aplicație „Hello World” pentru Claude Code

## Despre utilizator
- Gabi, inginer structurist; cunoaște bazele programării (algoritmi, OOP, funcții, variabile). Explică pe scurt conceptele de programare noi, fără a simplifica partea inginerească
- Comunică în limba română
- Propune proactiv îmbunătățiri și verificări; semnalează riscurile chiar dacă nu a întrebat
- La depanare: întâi un script minimal de test, apoi modificarea codului principal
- Lucrează de pe telefon: rezultatul vizual îl vede doar prin GitHub Pages

## Scop
Aplicație web didactică: un paralelipiped 3D cu dimensiuni introduse de utilizator, rotit continuu în jurul axei verticale, cu o siluetă umană alături pentru scară.
Obiectivul principal este învățarea fluxului de lucru în Claude Code, nu complexitatea aplicației. Păstrează soluțiile simple.

## Funcționalități
- Dimensiuni L × l × h în metri (câmpuri numerice); checkbox „cub” care impune L = l = h
- Slider pentru viteza de rotație (0 inclus) și buton de pauză
- Checkbox pentru comutare perspectivă / ortografic
- Câmp text pentru eticheta obiectului, afișată în scenă
- Dropdown material (beton, oțel, lemn), folosit pentru calculul masei
- Panou de rezultate: volum [m³], arie totală [m²], masă [kg]
- Grilă de sol cu pas de 1 m; cote afișate pe obiect
- Siluetă umană de 1,75 m, plasată în afara cercului descris de colțurile obiectului la rotire (raza = ½ din diagonala bazei), plus o marjă de 0,5 m
- Camera se reîncadrează automat după fiecare schimbare de dimensiune
- Interfață utilizabilă pe ecran de telefon (controale sub scenă pe ecrane înguste)

## Structura proiectului
- `index.html` — interfața și controalele
- `src/scena.js` — scena Three.js: randare, cameră, rotație, siluetă, cote
- `src/calcule.js` — DOAR funcții pure, fără acces la DOM sau la Three.js
- `teste/calcule.test.js` — teste pentru `calcule.js`

## Tehnologie
- JavaScript cu module ES, fără framework și fără pas de build
- Three.js încărcat din CDN, cu versiune fixată explicit
- Fără dependențe npm; testele folosesc rulatorul nativ Node
- Toate căile din HTML sunt relative (`./src/...`), deoarece GitHub Pages servește site-ul dintr-un subfolder

## Comenzi
- Teste: `node --test 'teste/**/*.test.js'`
- Publicare: GitHub Pages din ramura `main`, rădăcina depozitului

## Convenții de cod
- Nume de variabile și funcții, comentarii și texte din interfață în limba română
- Calculele interne în unități SI; afișarea cu virgulă zecimală (format românesc)
- Inputurile numerice acceptă atât „2,5” cât și „2.5”
- Valorile ≤ 0 sau nenumerice sunt respinse cu mesaj clar lângă câmp
- Densități: beton 2500 kg/m³, oțel 7850 kg/m³, lemn 500 kg/m³
- Dimensiuni permise: 0,1–100 m (constantele `DIMENSIUNE_MIN`, `DIMENSIUNE_MAX` din `src/calcule.js`)
- Rotunjiri la afișare: volum și arie cu 2 zecimale, masă cu 0 zecimale; miile separate cu spațiu (ex.: „15 000 kg”)

## Mod de lucru
- Lucrăm în iterații numerotate; fiecare iterație se încheie cu un pull request care are numărul iterației în titlu
- Înainte de modificări care ating mai multe fișiere, propune un plan și așteaptă aprobarea
- Rulează `node --test 'teste/**/*.test.js'` după orice modificare în `src/calcule.js`; nu deschide PR cu teste picate
- Orice funcție nouă din `src/calcule.js` primește cel puțin un test
- La finalul fiecărei iterații, spune exact ce trebuie verificat vizual după publicare
