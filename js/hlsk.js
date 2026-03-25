/**
 * HLSK Sammlung - Berechnungen
 * Heizung, Lüftung, Sanitär, Klima
 */

// Rohrdimensionen nach DIN
const ROHRDIMENSIONEN = {
  kupfer: [
    {dn: '10×1', di: 8, da: 10},
    {dn: '12×1', di: 10, da: 12},
    {dn: '15×1', di: 13, da: 15},
    {dn: '18×1', di: 16, da: 18},
    {dn: '22×1', di: 20, da: 22},
    {dn: '28×1,5', di: 25, da: 28},
    {dn: '35×1,5', di: 32, da: 35},
    {dn: '42×1,5', di: 39, da: 42},
    {dn: '54×2', di: 50, da: 54}
  ],
  stahl: [
    {dn: 'DN 10', di: 12.5, da: 17.2},
    {dn: 'DN 15', di: 16, da: 21.3},
    {dn: 'DN 20', di: 21.6, da: 26.9},
    {dn: 'DN 25', di: 27.2, da: 33.7},
    {dn: 'DN 32', di: 35.9, da: 42.4},
    {dn: 'DN 40', di: 41.8, da: 48.3},
    {dn: 'DN 50', di: 53, da: 60.3},
    {dn: 'DN 65', di: 68.8, da: 76.1},
    {dn: 'DN 80', di: 80.8, da: 88.9},
    {dn: 'DN 100', di: 107.1, da: 114.3}
  ],
  kunststoff: [
    {dn: '16×2', di: 12, da: 16},
    {dn: '20×2', di: 16, da: 20},
    {dn: '25×2,3', di: 20.4, da: 25},
    {dn: '32×2,9', di: 26.2, da: 32},
    {dn: '40×3,7', di: 32.6, da: 40},
    {dn: '50×4,6', di: 40.8, da: 50},
    {dn: '63×5,8', di: 51.4, da: 63}
  ]
};

// Heizlast-Richtwerte nach DIN EN 12831
const HEIZLAST_RICHTWERTE = {
  neubau: {min: 30, max: 50, label: 'Neubau (EnEV/GEG)'},
  altbau_saniert: {min: 50, max: 80, label: 'Altbau saniert'},
  altbau_unsaniert: {min: 80, max: 120, label: 'Altbau unsaniert'},
  altbau_schlecht: {min: 120, max: 180, label: 'Altbau schlecht gedämmt'}
};

// Luftwechselraten nach DIN 1946-6
const LUFTWECHSEL = {
  wohnzimmer: {min: 0.5, empfohlen: 0.5},
  schlafzimmer: {min: 0.5, empfohlen: 0.5},
  kueche: {min: 40, empfohlen: 60, einheit: 'm³/h'},
  bad: {min: 40, empfohlen: 60, einheit: 'm³/h'},
  wc: {min: 20, empfohlen: 30, einheit: 'm³/h'}
};

// Anschlusswerte Sanitär nach DIN 1988-300
const ANSCHLUSSWERTE = {
  waschbecken: {kalt: 0.07, warm: 0.07, dn: 'DN 15'},
  dusche: {kalt: 0.15, warm: 0.15, dn: 'DN 15'},
  badewanne: {kalt: 0.15, warm: 0.15, dn: 'DN 15'},
  wc_spuelkasten: {kalt: 0.13, warm: 0, dn: 'DN 15'},
  wc_druckspueler: {kalt: 1.0, warm: 0, dn: 'DN 25'},
  spuele: {kalt: 0.07, warm: 0.07, dn: 'DN 15'},
  waschmaschine: {kalt: 0.25, warm: 0, dn: 'DN 15'},
  geschirrspueler: {kalt: 0.15, warm: 0, dn: 'DN 15'}
};

// ============================================
// HEIZLAST BERECHNUNG
// ============================================
function calculateHeizlast() {
  const flaeche = parseFloat(document.getElementById('hl-flaeche').value);
  const gebaeude = document.getElementById('hl-gebaeude').value;
  const hoehe = parseFloat(document.getElementById('hl-hoehe').value) || 2.5;
  
  if (isNaN(flaeche) || flaeche <= 0) {
    return alert('Bitte gültige Fläche eingeben');
  }
  
  const richtwert = HEIZLAST_RICHTWERTE[gebaeude];
  const volumen = flaeche * hoehe;
  
  const heizlastMin = flaeche * richtwert.min;
  const heizlastMax = flaeche * richtwert.max;
  const heizlastMittel = (heizlastMin + heizlastMax) / 2;
  
  document.getElementById('hl-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis - ${richtwert.label}</h3>
      <div class="result-item">
        <span class="result-label">Beheizte Fläche:</span>
        <span class="result-value">${flaeche} m²</span>
      </div>
      <div class="result-item">
        <span class="result-label">Raumvolumen:</span>
        <span class="result-value">${volumen.toFixed(1)} m³</span>
      </div>
      <div class="result-item">
        <span class="result-label">Heizlast (Bereich):</span>
        <span class="result-value">${(heizlastMin/1000).toFixed(1)} - ${(heizlastMax/1000).toFixed(1)} kW</span>
      </div>
      <div class="result-item">
        <span class="result-label">Empfohlene Heizleistung:</span>
        <span class="result-value"><strong>${(heizlastMittel/1000).toFixed(1)} kW</strong></span>
      </div>
    </div>
    <div class="info-box">
      <h4>📌 Hinweis</h4>
      <p>Dies ist eine Überschlagsrechnung. Für genaue Planung: DIN EN 12831 Berechnung erforderlich!</p>
    </div>`;
}

// ============================================
// ROHRDIMENSIONIERUNG
// ============================================
function calculateRohr() {
  const volumenstrom = parseFloat(document.getElementById('rohr-volumenstrom').value);
  const geschwindigkeit = parseFloat(document.getElementById('rohr-geschwindigkeit').value) || 1.0;
  const material = document.getElementById('rohr-material').value;
  
  if (isNaN(volumenstrom) || volumenstrom <= 0) {
    return alert('Bitte gültigen Volumenstrom eingeben');
  }
  
  // Volumenstrom in m³/s
  const Q = volumenstrom / 3600; // l/h zu m³/s = /3600000, aber l/h zu l/s = /3600
  const Qm3s = volumenstrom / 3600000;
  
  // Benötigter Querschnitt A = Q / v
  const A = Qm3s / geschwindigkeit; // m²
  
  // Durchmesser d = sqrt(4*A/π)
  const dBerechnet = Math.sqrt(4 * A / Math.PI) * 1000; // in mm
  
  // Passendes Rohr finden
  const rohre = ROHRDIMENSIONEN[material];
  let empfohlen = rohre[rohre.length - 1];
  
  for (const rohr of rohre) {
    if (rohr.di >= dBerechnet) {
      empfohlen = rohr;
      break;
    }
  }
  
  // Tatsächliche Geschwindigkeit
  const diM = empfohlen.di / 1000;
  const Atats = Math.PI * Math.pow(diM/2, 2);
  const vTats = Qm3s / Atats;
  
  document.getElementById('rohr-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Volumenstrom:</span>
        <span class="result-value">${volumenstrom} l/h = ${(volumenstrom/60).toFixed(2)} l/min</span>
      </div>
      <div class="result-item">
        <span class="result-label">Berechneter Innendurchmesser:</span>
        <span class="result-value">${dBerechnet.toFixed(1)} mm</span>
      </div>
      <div class="result-item">
        <span class="result-label">Empfohlenes Rohr:</span>
        <span class="result-value"><strong>${empfohlen.dn}</strong> (di=${empfohlen.di}mm)</span>
      </div>
      <div class="result-item">
        <span class="result-label">Tatsächliche Geschwindigkeit:</span>
        <span class="result-value">${vTats.toFixed(2)} m/s</span>
      </div>
    </div>`;
}

// ============================================
// LÜFTUNGSBERECHNUNG
// ============================================
function calculateLueftung() {
  const volumen = parseFloat(document.getElementById('lueft-volumen').value);
  const luftwechsel = parseFloat(document.getElementById('lueft-wechsel').value);
  const personen = parseInt(document.getElementById('lueft-personen').value) || 0;
  
  if (isNaN(volumen) || volumen <= 0) {
    return alert('Bitte gültiges Raumvolumen eingeben');
  }
  
  // Nach Luftwechsel
  const volLuftwechsel = volumen * luftwechsel;
  
  // Nach Personen (30 m³/h pro Person)
  const volPersonen = personen * 30;
  
  // Maßgebend ist der größere Wert
  const erforderlich = Math.max(volLuftwechsel, volPersonen);
  
  document.getElementById('lueft-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Raumvolumen:</span>
        <span class="result-value">${volumen} m³</span>
      </div>
      <div class="result-item">
        <span class="result-label">Nach Luftwechsel (${luftwechsel}/h):</span>
        <span class="result-value">${volLuftwechsel.toFixed(0)} m³/h</span>
      </div>
      ${personen > 0 ? `
      <div class="result-item">
        <span class="result-label">Nach Personen (${personen} × 30):</span>
        <span class="result-value">${volPersonen} m³/h</span>
      </div>` : ''}
      <div class="result-item">
        <span class="result-label">Erforderlicher Luftvolumenstrom:</span>
        <span class="result-value"><strong>${erforderlich.toFixed(0)} m³/h</strong></span>
      </div>
    </div>`;
}

// ============================================
// SANITÄR SPITZENDURCHFLUSS
// ============================================
function calculateSanitaer() {
  let summeKalt = 0;
  let summeWarm = 0;
  
  // Alle Eingabefelder durchgehen
  document.querySelectorAll('.sanitaer-input').forEach(input => {
    const typ = input.dataset.typ;
    const anzahl = parseInt(input.value) || 0;
    
    if (anzahl > 0 && ANSCHLUSSWERTE[typ]) {
      summeKalt += anzahl * ANSCHLUSSWERTE[typ].kalt;
      summeWarm += anzahl * ANSCHLUSSWERTE[typ].warm;
    }
  });
  
  if (summeKalt === 0) {
    return alert('Bitte mindestens ein Objekt eingeben');
  }
  
  // Spitzendurchfluss nach Formel (vereinfacht)
  // Vs = a × Σ(VR)^b, typisch a=1, b=0.5
  const spitzeKalt = Math.sqrt(summeKalt) * 1.0;
  const spitzeWarm = Math.sqrt(summeWarm) * 1.0;
  const spitzeGesamt = Math.sqrt(summeKalt + summeWarm) * 1.0;
  
  document.getElementById('san-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Summe Anschlusswerte Kalt:</span>
        <span class="result-value">${summeKalt.toFixed(2)} l/s</span>
      </div>
      <div class="result-item">
        <span class="result-label">Summe Anschlusswerte Warm:</span>
        <span class="result-value">${summeWarm.toFixed(2)} l/s</span>
      </div>
      <div class="result-item">
        <span class="result-label">Spitzendurchfluss Kalt:</span>
        <span class="result-value">${spitzeKalt.toFixed(2)} l/s = ${(spitzeKalt*60).toFixed(1)} l/min</span>
      </div>
      <div class="result-item">
        <span class="result-label">Spitzendurchfluss Warm:</span>
        <span class="result-value">${spitzeWarm.toFixed(2)} l/s = ${(spitzeWarm*60).toFixed(1)} l/min</span>
      </div>
    </div>
    <div class="info-box">
      <h4>📌 Hinweis</h4>
      <p>Vereinfachte Berechnung nach DIN 1988-300. Für genaue Planung Gleichzeitigkeitsfaktoren beachten!</p>
    </div>`;
}

// ============================================
// AUSDEHNUNGSGEFÄSS (MAG)
// ============================================
function calcMAG() {
  const va = parseFloat(document.getElementById('mag-volumen').value);
  const n = parseFloat(document.getElementById('mag-temp').value);
  const h = parseFloat(document.getElementById('mag-hoehe').value);
  let p0 = parseFloat(document.getElementById('mag-vordruck').value);
  
  if (isNaN(va) || va <= 0 || isNaN(h)) {
    document.getElementById('mag-result').innerHTML = '<div class="danger">Bitte alle Werte eingeben</div>';
    return;
  }
  
  // Vordruck automatisch berechnen wenn nicht angegeben
  if (isNaN(p0)) {
    p0 = h / 10 + 0.3;
  }
  
  // Drücke
  const pa = p0 + 0.3; // Anfangsdruck
  const pSV = 3.0; // Sicherheitsventil (Standard)
  const pe = pSV - 0.5; // Enddruck
  
  // Ausdehnungsvolumen
  const ve = va * n;
  
  // Wasservorlage (ca. 0,5% des Anlagenvolumens, min. 3 Liter)
  const vv = Math.max(va * 0.005, 3);
  
  // MAG-Nennvolumen nach Formel
  // Vn = (Ve + Vv) × (pe + 1) / (pe - p0)
  const vn = (ve + vv) * (pe + 1) / (pe - p0);
  
  // Nächste Standard-MAG-Größe
  const magGroessen = [8, 12, 18, 25, 35, 50, 80, 100, 140, 200, 250, 300, 400, 500];
  const empfohlen = magGroessen.find(g => g >= vn) || magGroessen[magGroessen.length - 1];
  
  document.getElementById('mag-result').innerHTML = `
    <div class="result">
      <h3>MAG-Berechnung</h3>
      <div class="result-item"><span>Anlagenvolumen:</span><span>${va} Liter</span></div>
      <div class="result-item"><span>Ausdehnungskoeffizient n:</span><span>${(n * 100).toFixed(2)}%</span></div>
      <div class="result-item"><span>Ausdehnungsvolumen Ve:</span><span>${ve.toFixed(1)} Liter</span></div>
      <div class="result-item"><span>Wasservorlage Vv:</span><span>${vv.toFixed(1)} Liter</span></div>
      <div class="result-item"><span>Vordruck p0:</span><span>${p0.toFixed(1)} bar</span></div>
      <div class="result-item"><span>Anfangsdruck pa:</span><span>${pa.toFixed(1)} bar</span></div>
      <div class="result-item"><span>Enddruck pe:</span><span>${pe.toFixed(1)} bar</span></div>
      <div class="result-item"><span>Berechnetes Volumen:</span><span>${vn.toFixed(1)} Liter</span></div>
      <div class="result-item"><span>Empfohlenes MAG:</span><span><strong>${empfohlen} Liter</strong></span></div>
    </div>`;
}

// ============================================
// DRUCKVERLUST ROHRLEITUNG
// ============================================
function calcDruckverlust() {
  const v = parseFloat(document.getElementById('hy-volumen').value); // l/h
  const di = parseFloat(document.getElementById('hy-dn').value); // mm
  const l = parseFloat(document.getElementById('hy-laenge').value); // m
  
  if (isNaN(v) || v <= 0 || isNaN(l) || l <= 0) {
    document.getElementById('hy-result').innerHTML = '<div class="danger">Bitte alle Werte eingeben</div>';
    return;
  }
  
  // Volumenstrom in m³/s
  const vDot = v / 3600000; // l/h → m³/s
  
  // Rohrquerschnitt
  const a = Math.PI * Math.pow(di / 2000, 2); // m²
  
  // Fließgeschwindigkeit
  const w = vDot / a; // m/s
  
  // Druckverlust nach vereinfachter Formel
  // R ≈ λ × (L/d) × (ρ/2) × w²
  // Vereinfacht für Wasser bei 60°C: R ≈ 15 × w² × L / di (Pa/m)
  const lambda = 0.02; // Rohrreibungszahl (Stahl)
  const rho = 983; // kg/m³ (Wasser 60°C)
  const dpRohr = lambda * (l / (di / 1000)) * (rho / 2) * Math.pow(w, 2);
  
  // Zuschlag für Einbauteile (~30%)
  const zuschlag = 1.3;
  const dpGesamt = dpRohr * zuschlag;
  
  // Umrechnung in mbar und m WS
  const dpMbar = dpGesamt / 100;
  const dpMWS = dpGesamt / 10000;
  
  let bewertung = '✅ OK';
  if (w > 1.5) bewertung = '⚠️ Geschwindigkeit zu hoch!';
  else if (w > 1.0) bewertung = '⚠️ Geschwindigkeit grenzwertig';
  
  document.getElementById('hy-result').innerHTML = `
    <div class="result">
      <h3>Druckverlust</h3>
      <div class="result-item"><span>Volumenstrom:</span><span>${v} l/h</span></div>
      <div class="result-item"><span>Innendurchmesser:</span><span>${di} mm</span></div>
      <div class="result-item"><span>Fließgeschwindigkeit:</span><span><strong>${w.toFixed(2)} m/s</strong></span></div>
      <div class="result-item"><span>Druckverlust Rohr:</span><span>${(dpRohr/100).toFixed(0)} mbar</span></div>
      <div class="result-item"><span>Druckverlust gesamt (+30%):</span><span><strong>${dpMbar.toFixed(0)} mbar</strong></span></div>
      <div class="result-item"><span>Entspricht:</span><span>${dpMWS.toFixed(2)} m WS</span></div>
      <div class="result-item"><span>Bewertung:</span><span>${bewertung}</span></div>
    </div>`;
}

// ============================================
// VOLUMENSTROM BERECHNEN
// ============================================
function calcVolumenstrom() {
  const q = parseFloat(document.getElementById('ab-leistung').value); // W
  const dt = parseFloat(document.getElementById('ab-spreizung').value); // K
  
  if (isNaN(q) || q <= 0) {
    document.getElementById('ab-result').innerHTML = '<div class="danger">Bitte Heizleistung eingeben</div>';
    return;
  }
  
  // Volumenstrom V = Q / (c × ρ × ΔT)
  // c = 4,19 kJ/(kg·K), ρ = 983 kg/m³
  // Vereinfacht: V (l/h) = Q (W) × 0,86 / ΔT (K)
  const vLh = q * 0.86 / dt;
  const vLmin = vLh / 60;
  
  document.getElementById('ab-result').innerHTML = `
    <div class="result">
      <h3>Volumenstrom</h3>
      <div class="result-item"><span>Heizleistung:</span><span>${q} W</span></div>
      <div class="result-item"><span>Spreizung ΔT:</span><span>${dt} K</span></div>
      <div class="result-item"><span>Volumenstrom:</span><span><strong>${vLh.toFixed(0)} l/h</strong></span></div>
      <div class="result-item"><span>Entspricht:</span><span>${vLmin.toFixed(1)} l/min</span></div>
    </div>
    <div class="info-box" style="margin-top:10px">
      <p>Formel: V = Q × 0,86 / ΔT (für Wasser)</p>
    </div>`;
}
