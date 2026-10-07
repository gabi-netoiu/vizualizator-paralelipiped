// Calcule pentru paralelipiped — DOAR funcții pure (fără DOM, fără Three.js).
// Toate mărimile sunt în unități SI: metri, m², m³, kg, kg/m³.

// Densități [kg/m³]
export const DENSITATI = {
  beton: 2500,
  otel: 7850,
  lemn: 500,
};

// Intervalul permis pentru dimensiuni [m]
export const DIMENSIUNE_MIN = 0.1;
export const DIMENSIUNE_MAX = 100;

// Distanța suplimentară dintre cercul descris de colțuri și siluetă [m]
export const MARJA_SILUETA = 0.5;

// Dimensiunile siluetei umane [m]; lățimea include brațele
export const INALTIME_SILUETA = 1.75;
export const LATIME_SILUETA = 0.6;

// Numărul de zecimale la afișare
export const ZECIMALE = {
  volum: 2,
  arie: 2,
  masa: 0,
};

// Acceptă „2,5” sau „2.5”, cu spații la capete; respinge „1e3”, „2,5,3”, „1.000,5”.
const FORMAT_NUMAR = /^[+-]?(\d+([.,]\d*)?|[.,]\d+)$/;

/**
 * Citește o dimensiune introdusă ca text.
 * Întoarce { ok: true, valoare } sau { ok: false, mesaj }, ca interfața
 * să poată afișa mesajul lângă câmp fără să trateze excepții.
 */
export function citesteNumar(text, min = DIMENSIUNE_MIN, max = DIMENSIUNE_MAX) {
  const curat = String(text ?? '').trim();
  if (curat === '') {
    return { ok: false, mesaj: 'Introduceți o valoare.' };
  }
  if (!FORMAT_NUMAR.test(curat)) {
    return { ok: false, mesaj: 'Introduceți un număr, de exemplu 2,5.' };
  }
  const valoare = Number(curat.replace(',', '.'));
  if (valoare <= 0) {
    return { ok: false, mesaj: 'Valoarea trebuie să fie mai mare decât 0.' };
  }
  if (valoare < min) {
    return { ok: false, mesaj: `Valoarea minimă este ${formateazaNumar(min, 1)} m.` };
  }
  if (valoare > max) {
    return { ok: false, mesaj: `Valoarea maximă este ${formateazaNumar(max, 0)} m.` };
  }
  return { ok: true, valoare };
}

/** Volumul [m³] */
export function volum(L, l, h) {
  return L * l * h;
}

/** Aria totală (suprafața desfășurată a celor 6 fețe) [m²] */
export function arieTotala(L, l, h) {
  return 2 * (L * l + L * h + l * h);
}

/**
 * Masa [kg] = densitate × volum.
 * Un material necunoscut e o greșeală de program (dropdown-ul are valori fixe),
 * deci aruncă o eroare în loc să întoarcă un mesaj pentru utilizator.
 */
export function masa(L, l, h, material) {
  const densitate = DENSITATI[material];
  if (densitate === undefined) {
    throw new Error(`Material necunoscut: ${material}`);
  }
  return densitate * volum(L, l, h);
}

/**
 * Distanța de la axa de rotație până la marginea apropiată a siluetei [m]:
 * raza cercului descris de colțuri (½ din diagonala bazei) plus marja.
 */
export function razaSilueta(L, l) {
  return Math.hypot(L, l) / 2 + MARJA_SILUETA;
}

/**
 * Raza sferei care cuprinde tot ce trebuie să încapă în cadru [m]:
 * obiectul în rotire și silueta. Sfera are centrul pe axa de rotație,
 * la jumătatea înălțimii celui mai înalt element.
 */
export function razaIncadrare(L, l, h) {
  const razaOrizontala = razaSilueta(L, l) + LATIME_SILUETA; // până la marginea îndepărtată
  const inaltime = Math.max(h, INALTIME_SILUETA);
  return Math.hypot(razaOrizontala, inaltime / 2);
}

/**
 * Distanța de la cameră la centrul sferei, astfel încât sfera să încapă
 * exact în cadru: d = raza / sin(½·unghi). Unghiul folosit este cel mai mic
 * dintre unghiul vertical și cel orizontal (ecranele înguste limitează pe orizontală).
 * @param unghiVerticalGrade unghiul de vizualizare vertical al camerei [°]
 * @param raport lățime / înălțime a imaginii
 */
export function distantaCamera(raza, unghiVerticalGrade, raport = 1) {
  const jumatateVerticala = (unghiVerticalGrade * Math.PI) / 180 / 2;
  const jumatateOrizontala = Math.atan(Math.tan(jumatateVerticala) * raport);
  return raza / Math.sin(Math.min(jumatateVerticala, jumatateOrizontala));
}

/**
 * Jumătatea înălțimii cadrului pentru camera ortografică [m], astfel încât
 * sfera de rază `raza` să încapă: pe verticală e nevoie de raza, pe orizontală
 * de raza / raport (pe ecranele înguste lățimea e cea care limitează).
 * @param raport lățime / înălțime a imaginii
 */
export function semiInaltimeOrtografica(raza, raport = 1) {
  return raza / Math.min(1, raport);
}

/** Viteza unghiulară [rad/s] din turație [rot/min]: ω = 2π·n / 60 */
export function vitezaUnghiulara(rotPeMinut) {
  return (2 * Math.PI * rotPeMinut) / 60;
}

/**
 * Formatează un număr în stil românesc: virgulă zecimală și spațiu
 * între grupele de trei cifre (ex.: 15000 → „15 000”, 2.5 → „2,50” cu 2 zecimale).
 */
export function formateazaNumar(x, zecimale = 2) {
  const [intreg, fractie] = Math.abs(x).toFixed(zecimale).split('.');
  const grupat = intreg.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const semn = x < 0 && Number(Math.abs(x).toFixed(zecimale)) !== 0 ? '-' : '';
  return semn + grupat + (fractie ? ',' + fractie : '');
}
