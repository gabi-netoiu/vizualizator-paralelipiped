import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DENSITATI,
  citesteNumar,
  volum,
  arieTotala,
  masa,
  razaSilueta,
  razaIncadrare,
  distantaCamera,
  semiInaltimeOrtografica,
  vitezaUnghiulara,
  formateazaNumar,
} from '../src/calcule.js';

// Compară numere reale cu toleranță (erorile de rotunjire în virgulă mobilă)
function aproape(real, asteptat, toleranta = 1e-9) {
  assert.ok(Math.abs(real - asteptat) <= toleranta, `${real} ≠ ${asteptat}`);
}

test('citesteNumar acceptă virgula și punctul zecimal', () => {
  assert.deepEqual(citesteNumar('2,5'), { ok: true, valoare: 2.5 });
  assert.deepEqual(citesteNumar('2.5'), { ok: true, valoare: 2.5 });
  assert.deepEqual(citesteNumar('  3 '), { ok: true, valoare: 3 });
  assert.deepEqual(citesteNumar(',5'), { ok: true, valoare: 0.5 });
});

test('citesteNumar acceptă limitele intervalului', () => {
  assert.deepEqual(citesteNumar('0,1'), { ok: true, valoare: 0.1 });
  assert.deepEqual(citesteNumar('100'), { ok: true, valoare: 100 });
});

test('citesteNumar respinge câmpul gol', () => {
  assert.equal(citesteNumar('').ok, false);
  assert.equal(citesteNumar('   ').ok, false);
  assert.equal(citesteNumar(undefined).ok, false);
});

test('citesteNumar respinge textul nenumeric', () => {
  for (const text of ['abc', '2,5,3', '1.000,5', '1e3', '2 m', 'NaN', 'Infinity']) {
    const rezultat = citesteNumar(text);
    assert.equal(rezultat.ok, false, `ar fi trebuit respins: „${text}”`);
    assert.match(rezultat.mesaj, /număr/);
  }
});

test('citesteNumar respinge valorile ≤ 0', () => {
  for (const text of ['0', '-1', '-2,5', '0,0']) {
    const rezultat = citesteNumar(text);
    assert.equal(rezultat.ok, false, `ar fi trebuit respins: „${text}”`);
    assert.match(rezultat.mesaj, /mai mare decât 0/);
  }
});

test('citesteNumar respinge valorile în afara intervalului 0,1–100 m', () => {
  const mic = citesteNumar('0,05');
  assert.equal(mic.ok, false);
  assert.equal(mic.mesaj, 'Valoarea minimă este 0,1 m.');

  const mare = citesteNumar('100,5');
  assert.equal(mare.ok, false);
  assert.equal(mare.mesaj, 'Valoarea maximă este 100 m.');
});

test('volum', () => {
  assert.equal(volum(2, 3, 4), 24);
  aproape(volum(0.1, 0.1, 0.1), 0.001);
});

test('arieTotala', () => {
  assert.equal(arieTotala(2, 3, 4), 52); // 2·(6 + 8 + 12)
  assert.equal(arieTotala(1, 1, 1), 6); // cub unitar
});

test('masa pentru fiecare material', () => {
  assert.equal(masa(1, 1, 1, 'beton'), 2500);
  assert.equal(masa(1, 1, 1, 'otel'), 7850);
  assert.equal(masa(1, 1, 1, 'lemn'), 500);
  assert.equal(masa(2, 3, 4, 'beton'), 60000);
});

test('masa aruncă eroare pentru material necunoscut', () => {
  assert.throws(() => masa(1, 1, 1, 'aluminiu'), /Material necunoscut/);
});

test('densitățile sunt cele din CLAUDE.md', () => {
  assert.deepEqual(DENSITATI, { beton: 2500, otel: 7850, lemn: 500 });
});

test('razaSilueta = ½ din diagonala bazei + 0,5 m', () => {
  assert.equal(razaSilueta(3, 4), 3); // diagonala 5 → 2,5 + 0,5
  aproape(razaSilueta(1, 1), Math.SQRT2 / 2 + 0.5);
});

test('formateazaNumar folosește virgula zecimală', () => {
  assert.equal(formateazaNumar(2.5, 2), '2,50');
  assert.equal(formateazaNumar(0.001, 2), '0,00');
  assert.equal(formateazaNumar(1.005, 1), '1,0');
});

test('formateazaNumar grupează miile cu spațiu', () => {
  assert.equal(formateazaNumar(15000, 0), '15 000');
  assert.equal(formateazaNumar(1234567.891, 2), '1 234 567,89');
  assert.equal(formateazaNumar(999, 0), '999');
});

test('formateazaNumar nu afișează „-0”', () => {
  assert.equal(formateazaNumar(-0.001, 2), '0,00');
  assert.equal(formateazaNumar(-2.5, 1), '-2,5');
});

test('razaIncadrare cuprinde silueta când obiectul e mai jos decât ea', () => {
  // 3×4×1 m: pe orizontală 3 m până la siluetă + 0,6 m lățimea ei; pe verticală 1,75 m (silueta)
  aproape(razaIncadrare(3, 4, 1), Math.hypot(3.6, 0.875));
});

test('razaIncadrare cuprinde obiectul când e mai înalt decât silueta', () => {
  // 3×4×10 m: înălțimea relevantă devine 10 m
  aproape(razaIncadrare(3, 4, 10), Math.hypot(3.6, 5));
});

test('distantaCamera = raza / sin(½·unghi) pentru imagine pătrată', () => {
  aproape(distantaCamera(1, 60, 1), 2); // sin 30° = 0,5
  aproape(distantaCamera(2.5, 90, 1), 2.5 / Math.sin(Math.PI / 4));
});

test('distantaCamera: imaginea lată limitează pe vertical, cea îngustă pe orizontal', () => {
  aproape(distantaCamera(1, 60, 2), 2); // lată: contează unghiul vertical
  const orizontal = Math.atan(Math.tan(Math.PI / 6) * 0.5); // îngustă: unghiul orizontal e mai mic
  aproape(distantaCamera(1, 60, 0.5), 1 / Math.sin(orizontal));
  assert.ok(distantaCamera(1, 60, 0.5) > distantaCamera(1, 60, 1));
});

test('semiInaltimeOrtografica: imaginea lată limitează pe vertical', () => {
  assert.equal(semiInaltimeOrtografica(2, 1), 2);
  assert.equal(semiInaltimeOrtografica(2, 4 / 3), 2);
});

test('semiInaltimeOrtografica: imaginea îngustă limitează pe orizontal', () => {
  // raport 0,5: lățimea cadrului = 2·H·0,5 = H, deci H trebuie să fie 2·raza
  assert.equal(semiInaltimeOrtografica(2, 0.5), 4);
});

test('vitezaUnghiulara transformă rot/min în rad/s', () => {
  assert.equal(vitezaUnghiulara(0), 0);
  aproape(vitezaUnghiulara(60), 2 * Math.PI); // o rotație pe secundă
  aproape(vitezaUnghiulara(5), Math.PI / 6); // ≈ 0,524 rad/s
});
