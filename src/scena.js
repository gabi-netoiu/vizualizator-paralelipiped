// Scena 3D: paralelipipedul rotit, grila de sol, silueta umană și camera.
// Geometria încadrării (raze, distanțe) vine din calcule.js; aici doar desenăm.

import * as THREE from 'three';
import {
  razaSilueta,
  razaIncadrare,
  distantaCamera,
  INALTIME_SILUETA,
  LATIME_SILUETA,
} from './calcule.js';

// Culoarea obiectului după material
const CULORI = {
  beton: 0x9e9e9e,
  otel: 0x7d8fa3,
  lemn: 0xa0703c,
};

const UNGHI_CAMERA = 45; // unghiul de vizualizare vertical [°]
const MARJA_CADRU = 1.1; // spațiu liber în jurul obiectelor (10%)
const VITEZA_ROTATIE = 0.5; // [rad/s]; devine reglabilă în Iterația 4

// Direcția din care privește camera: din față-dreapta, puțin de sus
const DIRECTIE_CAMERA = new THREE.Vector3(0.45, 0.5, 1).normalize();

/**
 * Creează scena în elementul `container` și întoarce funcția de actualizare.
 */
export function creeazaScena(container) {
  const randare = new THREE.WebGLRenderer({ antialias: true });
  randare.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.replaceChildren(randare.domElement);

  const scena = new THREE.Scene();
  scena.background = new THREE.Color(0xe8ebf0);
  scena.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 2));
  const soare = new THREE.DirectionalLight(0xffffff, 1.5);
  soare.position.set(3, 5, 4);
  scena.add(soare);

  const camera = new THREE.PerspectiveCamera(UNGHI_CAMERA, 1, 0.01, 1000);

  // Grupul care se rotește în jurul axei verticale (Y în Three.js)
  const rotitor = new THREE.Group();
  scena.add(rotitor);

  const materialObiect = new THREE.MeshStandardMaterial({ color: CULORI.beton });
  const obiect = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materialObiect);
  const muchii = new THREE.LineSegments(
    new THREE.EdgesGeometry(obiect.geometry),
    new THREE.LineBasicMaterial({ color: 0x1d2330 }),
  );
  obiect.add(muchii);
  rotitor.add(obiect);

  const silueta = creeazaSilueta();
  scena.add(silueta);

  let grila = null;
  let razaCurenta = 1;
  let centruVertical = 0;

  // Recalculează distanța camerei; depinde și de forma imaginii (lată/îngustă)
  function incadreaza() {
    const latime = container.clientWidth;
    const inaltime = container.clientHeight;
    if (latime === 0 || inaltime === 0) return;
    randare.setSize(latime, inaltime, false);
    camera.aspect = latime / inaltime;

    const distanta = distantaCamera(razaCurenta * MARJA_CADRU, UNGHI_CAMERA, camera.aspect);
    const centru = new THREE.Vector3(0, centruVertical, 0);
    camera.position.copy(centru).addScaledVector(DIRECTIE_CAMERA, distanta);
    camera.lookAt(centru);
    camera.near = Math.max(0.01, distanta - 3 * razaCurenta);
    camera.far = distanta + 3 * razaCurenta;
    camera.updateProjectionMatrix();
  }

  function actualizeazaScena(L, l, h, material) {
    // Cutia are latura 1 m; o scalăm la L × h × l (Y e verticala în Three.js)
    obiect.scale.set(L, h, l);
    obiect.position.y = h / 2;
    materialObiect.color.setHex(CULORI[material]);

    // Marginea apropiată a siluetei stă la razaSilueta; poziția e a centrului ei
    silueta.position.set(razaSilueta(L, l) + LATIME_SILUETA / 2, 0, 0);

    // Grila: pătrat cu pas de 1 m, destul de mare cât să cuprindă silueta
    const latura = 2 * Math.ceil(razaSilueta(L, l) + LATIME_SILUETA + 1);
    if (grila === null || grila.userData.latura !== latura) {
      if (grila) {
        scena.remove(grila);
        grila.geometry.dispose();
        grila.material.dispose();
      }
      grila = new THREE.GridHelper(latura, latura, 0x5b6475, 0xb7bdc8);
      grila.userData.latura = latura;
      scena.add(grila);
    }
    // Grila puțin sub sol, ca muchiile de jos ale obiectului să nu „pâlpâie” pe ea
    grila.position.y = -0.002 * latura;

    razaCurenta = razaIncadrare(L, l, h);
    centruVertical = Math.max(h, INALTIME_SILUETA) / 2;
    incadreaza();
  }

  new ResizeObserver(incadreaza).observe(container);

  let timpAnterior = performance.now();
  randare.setAnimationLoop((timp) => {
    const dt = Math.min((timp - timpAnterior) / 1000, 0.1); // limitat după o pauză a tab-ului
    timpAnterior = timp;
    rotitor.rotation.y += VITEZA_ROTATIE * dt;
    randare.render(scena, camera);
  });

  return { actualizeazaScena };
}

/**
 * Siluetă umană simplificată, înaltă de 1,75 m, cu tălpile la y = 0.
 * Cotele pe verticală [m]: picioare 0–0,85; trunchi 0,85–1,45; cap până la 1,75.
 */
function creeazaSilueta() {
  const material = new THREE.MeshStandardMaterial({ color: 0x3c4454 });
  const grup = new THREE.Group();

  function adauga(geometrie, x, y) {
    const piesa = new THREE.Mesh(geometrie, material);
    piesa.position.set(x, y, 0);
    grup.add(piesa);
  }

  const picior = new THREE.CylinderGeometry(0.07, 0.06, 0.85);
  adauga(picior, -0.1, 0.425);
  adauga(picior, 0.1, 0.425);

  adauga(new THREE.BoxGeometry(0.4, 0.6, 0.22), 0, 1.15);

  const brat = new THREE.CylinderGeometry(0.05, 0.045, 0.6);
  adauga(brat, -0.25, 1.15);
  adauga(brat, 0.25, 1.15);

  const razaCap = 0.12;
  adauga(new THREE.SphereGeometry(razaCap, 24, 16), 0, INALTIME_SILUETA - razaCap);

  return grup;
}
