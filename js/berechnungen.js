/**
 * Hoher Elektrosammlung - Berechnungen
 * Alle Formeln nach DIN VDE korrigiert
 */

// ============================================
// KONSTANTEN
// ============================================
const KAPPA_CU = 56;  // Leitfähigkeit Kupfer in m/(Ω·mm²)
const KAPPA_AL = 35;  // Leitfähigkeit Aluminium in m/(Ω·mm²)

// Standardquerschnitte in mm²
const QUERSCHNITTE = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

// Sicherungsgrößen in A
const SICHERUNGEN = [6, 10, 13, 16, 20, 25, 32, 35, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];

// Trafogrößen in kVA
const TRAFOGROESSEN = [100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500];

// Strombelastbarkeit nach DIN VDE 0298-4 (Kupfer, 3 belastete Adern)
const BELASTBARKEIT = {
  'b1': {1.5:13.5, 2.5:18, 4:24, 6:31, 10:42, 16:56, 25:73, 35:89, 50:108, 70:136, 95:164, 120:188, 150:216, 185:245, 240:286, 300:328},
  'b2': {1.5:15.5, 2.5:21, 4:28, 6:36, 10:50, 16:68, 25:89, 35:110, 50:134, 70:171, 95:207, 120:239, 150:275, 185:314, 240:367, 300:424},
  'c':  {1.5:17.5, 2.5:24, 4:32, 6:41, 10:57, 16:76, 25:101, 35:125, 50:151, 70:192, 95:232, 120:269, 150:309, 185:353, 240:415, 300:480},
  'e':  {1.5:19.5, 2.5:27, 4:36, 6:46, 10:63, 16:85, 25:112, 35:138, 50:168, 70:213, 95:258, 120:299, 150:344, 185:392, 240:461, 300:530}
};

// Reduktionsfaktoren für parallele Leitungen (DIN VDE 0298-4)
const REDUKTION_PARALLEL = {
  1: 1.00,
  2: 0.88,
  3: 0.82,
  4: 0.77,
  5: 0.73,
  6: 0.70
};

// Kabelgewichte in g/m (NYM-J)
const KABELGEWICHTE = {
  nym: {
    1.5: {3:85, 4:105, 5:125},
    2.5: {3:115, 4:145, 5:175},
    4:   {3:160, 4:200, 5:245},
    6:   {3:210, 4:265, 5:325},
    10:  {3:320, 4:410, 5:500},
    16:  {3:475, 4:610, 5:750},
    25:  {3:710, 4:920, 5:1130},
    35:  {3:960, 4:1250, 5:1540},
    50:  {3:1310, 4:1710, 5:2110}
  },
  nyy: {
    1.5: {3:115, 4:140, 5:170},
    2.5: {3:155, 4:195, 5:235},
    4:   {3:215, 4:270, 5:330},
    6:   {3:285, 4:365, 5:445},
    10:  {3:435, 4:560, 5:685},
    16:  {3:650, 4:840, 5:1030},
    25:  {3:980, 4:1270, 5:1560},
    35:  {3:1330, 4:1730, 5:2130},
    50:  {3:1820, 4:2370, 5:2920}
  }
};

// ============================================
// OHMSCHES GESETZ
// ============================================
function updateOhmFields() {
  const typeEl = document.getElementById('ohm-calc-type');
  const container = document.getElementById('ohm-inputs');
  
  // Null-Check: Elemente existieren nur auf Berechnungsseite
  if (!typeEl || !container) return;
  
  const type = typeEl.value;
  let html = '';
  
  switch(type) {
    case 'voltage':
      html = `
        <div class="grid-2">
          <div class="form-group">
            <label>Stromstärke I (A)</label>
            <input type="number" id="ohm-current" step="0.001" placeholder="z.B. 10">
          </div>
          <div class="form-group">
            <label>Widerstand R (Ω)</label>
            <input type="number" id="ohm-resistance" step="0.001" placeholder="z.B. 23">
          </div>
        </div>`;
      break;
    case 'current':
      html = `
        <div class="grid-2">
          <div class="form-group">
            <label>Spannung U (V)</label>
            <input type="number" id="ohm-voltage" step="0.01" placeholder="z.B. 230">
          </div>
          <div class="form-group">
            <label>Widerstand R (Ω)</label>
            <input type="number" id="ohm-resistance" step="0.001" placeholder="z.B. 23">
          </div>
        </div>`;
      break;
    case 'resistance':
      html = `
        <div class="grid-2">
          <div class="form-group">
            <label>Spannung U (V)</label>
            <input type="number" id="ohm-voltage" step="0.01" placeholder="z.B. 230">
          </div>
          <div class="form-group">
            <label>Stromstärke I (A)</label>
            <input type="number" id="ohm-current" step="0.001" placeholder="z.B. 10">
          </div>
        </div>`;
      break;
    case 'power':
      html = `
        <div class="grid-2">
          <div class="form-group">
            <label>Spannung U (V)</label>
            <input type="number" id="ohm-voltage" step="0.01" placeholder="z.B. 230">
          </div>
          <div class="form-group">
            <label>Stromstärke I (A)</label>
            <input type="number" id="ohm-current" step="0.001" placeholder="z.B. 10">
          </div>
        </div>`;
      break;
  }
  container.innerHTML = html;
}

function calculateOhm() {
  const type = document.getElementById('ohm-calc-type').value;
  let result = '';
  
  switch(type) {
    case 'voltage': {
      const I = parseFloat(document.getElementById('ohm-current').value);
      const R = parseFloat(document.getElementById('ohm-resistance').value);
      if (isNaN(I) || isNaN(R)) return showError('Bitte alle Felder ausfüllen');
      const U = I * R;
      const P = U * I;
      result = `
        <div class="result">
          <h3>Ergebnis: Spannung</h3>
          <div class="result-item">
            <span class="result-label">Spannung U:</span>
            <span class="result-value">${U.toFixed(2)} V</span>
          </div>
          <div class="result-item">
            <span class="result-label">Leistung P:</span>
            <span class="result-value">${P.toFixed(2)} W</span>
          </div>
        </div>`;
      break;
    }
    case 'current': {
      const U = parseFloat(document.getElementById('ohm-voltage').value);
      const R = parseFloat(document.getElementById('ohm-resistance').value);
      if (isNaN(U) || isNaN(R) || R === 0) return showError('Bitte alle Felder ausfüllen (R ≠ 0)');
      const I = U / R;
      const P = U * I;
      result = `
        <div class="result">
          <h3>Ergebnis: Stromstärke</h3>
          <div class="result-item">
            <span class="result-label">Stromstärke I:</span>
            <span class="result-value">${I.toFixed(3)} A</span>
          </div>
          <div class="result-item">
            <span class="result-label">Leistung P:</span>
            <span class="result-value">${P.toFixed(2)} W</span>
          </div>
        </div>`;
      break;
    }
    case 'resistance': {
      const U = parseFloat(document.getElementById('ohm-voltage').value);
      const I = parseFloat(document.getElementById('ohm-current').value);
      if (isNaN(U) || isNaN(I) || I === 0) return showError('Bitte alle Felder ausfüllen (I ≠ 0)');
      const R = U / I;
      const P = U * I;
      result = `
        <div class="result">
          <h3>Ergebnis: Widerstand</h3>
          <div class="result-item">
            <span class="result-label">Widerstand R:</span>
            <span class="result-value">${R.toFixed(3)} Ω</span>
          </div>
          <div class="result-item">
            <span class="result-label">Leistung P:</span>
            <span class="result-value">${P.toFixed(2)} W</span>
          </div>
        </div>`;
      break;
    }
    case 'power': {
      const U = parseFloat(document.getElementById('ohm-voltage').value);
      const I = parseFloat(document.getElementById('ohm-current').value);
      if (isNaN(U) || isNaN(I)) return showError('Bitte alle Felder ausfüllen');
      const P = U * I;
      const R = I !== 0 ? U / I : 0;
      result = `
        <div class="result">
          <h3>Ergebnis: Leistung</h3>
          <div class="result-item">
            <span class="result-label">Leistung P:</span>
            <span class="result-value">${P.toFixed(2)} W (${(P/1000).toFixed(3)} kW)</span>
          </div>
          <div class="result-item">
            <span class="result-label">Widerstand R:</span>
            <span class="result-value">${R.toFixed(3)} Ω</span>
          </div>
        </div>`;
      break;
    }
  }
  
  document.getElementById('ohm-result').innerHTML = result;
}

// ============================================
// LEITUNGSQUERSCHNITT - KORRIGIERT
// ============================================
function calculateCableSize() {
  const art = document.getElementById('leitung-art').value;
  const strom = parseFloat(document.getElementById('leitung-strom').value);
  const laenge = parseFloat(document.getElementById('leitung-laenge').value);
  const verlegeart = document.getElementById('leitung-verlegeart').value;
  const material = document.getElementById('leitung-material').value;
  const maxSFProzent = parseFloat(document.getElementById('leitung-spannungsfall').value);
  const cosPhi = parseFloat(document.getElementById('leitung-cosphi')?.value || 1);
  
  if (isNaN(strom) || isNaN(laenge) || strom <= 0 || laenge <= 0) {
    return showError('Bitte alle Felder korrekt ausfüllen');
  }
  
  const kappa = material === 'cu' ? KAPPA_CU : KAPPA_AL;
  const nennspannung = art === 'ac1' ? 230 : 400;
  const alFaktor = material === 'al' ? 0.78 : 1; // Reduktionsfaktor für Alu
  const faktor = art === 'ac1' ? 2 : Math.sqrt(3);
  
  // Max. zulässiger Spannungsfall in Volt
  const maxDeltaU = nennspannung * (maxSFProzent / 100);
  
  // Funktion: Berechne Lösung für n parallele Systeme
  function berechneLoesung(anzahlSysteme) {
    const stromProSystem = strom / anzahlSysteme;
    const reduktionParallel = REDUKTION_PARALLEL[anzahlSysteme] || 0.65;
    
    // 1. Querschnitt nach Strombelastbarkeit
    let qBelastbarkeit = null;
    for (const q of QUERSCHNITTE) {
      const belastbar = BELASTBARKEIT[verlegeart][q] * alFaktor * reduktionParallel;
      if (belastbar >= stromProSystem) {
        qBelastbarkeit = q;
        break;
      }
    }
    
    // 2. Querschnitt nach Spannungsfall (parallele Systeme reduzieren Widerstand)
    // Gesamtquerschnitt = n × Einzelquerschnitt
    const qSpannungsfallGesamt = (faktor * laenge * strom * cosPhi) / (kappa * maxDeltaU);
    const qSpannungsfallEinzel = qSpannungsfallGesamt / anzahlSysteme;
    
    // Nächst größeren Standardquerschnitt für beide Kriterien
    let empfohlenerQ = QUERSCHNITTE[QUERSCHNITTE.length - 1];
    const minQ = Math.max(qBelastbarkeit || 999, qSpannungsfallEinzel);
    
    for (const q of QUERSCHNITTE) {
      if (q >= minQ) {
        empfohlenerQ = q;
        break;
      }
    }
    
    // Prüfen ob Lösung gültig
    if (qBelastbarkeit === null || empfohlenerQ > 300) {
      return null; // Keine gültige Lösung mit dieser Anzahl
    }
    
    // Tatsächlichen Spannungsfall berechnen
    const gesamtQuerschnitt = empfohlenerQ * anzahlSysteme;
    const tatsaechlicherDeltaU = (faktor * laenge * strom * cosPhi) / (kappa * gesamtQuerschnitt);
    const tatsaechlicherSFProzent = (tatsaechlicherDeltaU / nennspannung) * 100;
    
    // Belastbarkeit pro System
    const maxBelastbarkeit = BELASTBARKEIT[verlegeart][empfohlenerQ] * alFaktor * reduktionParallel;
    const auslastung = (stromProSystem / maxBelastbarkeit) * 100;
    
    return {
      anzahl: anzahlSysteme,
      querschnitt: empfohlenerQ,
      gesamtQuerschnitt: gesamtQuerschnitt,
      stromProSystem: stromProSystem,
      maxBelastbarkeit: maxBelastbarkeit,
      auslastung: auslastung,
      spannungsfall: tatsaechlicherDeltaU,
      spannungsfallProzent: tatsaechlicherSFProzent,
      reduktion: reduktionParallel,
      ok: tatsaechlicherSFProzent <= maxSFProzent && auslastung <= 100
    };
  }
  
  // Berechne Lösungen für 1 bis 4 Systeme
  const loesungen = [];
  for (let n = 1; n <= 4; n++) {
    const loesung = berechneLoesung(n);
    if (loesung && loesung.ok) {
      loesungen.push(loesung);
    }
  }
  
  // Auch ungültige Lösungen anzeigen wenn keine gültige existiert
  if (loesungen.length === 0) {
    for (let n = 1; n <= 4; n++) {
      const loesung = berechneLoesung(n);
      if (loesung) loesungen.push(loesung);
    }
  }
  
  // Ergebnis ausgeben
  let html = '<div class="result"><h3>Leitungsquerschnitt</h3>';
  
  if (loesungen.length === 0) {
    html += '<p class="danger">Keine Lösung gefunden - Strom zu hoch oder Leitung zu lang!</p>';
  } else {
    // Beste Lösung (kleinster Gesamtquerschnitt der gültigen)
    const gueltige = loesungen.filter(l => l.ok);
    const beste = gueltige.length > 0 
      ? gueltige.reduce((a, b) => a.gesamtQuerschnitt < b.gesamtQuerschnitt ? a : b)
      : loesungen[0];
    
    html += `
      <div class="result-item" style="background:#dcfce7;padding:10px;border-radius:8px;margin-bottom:15px;">
        <span style="font-weight:bold;font-size:1.1em;">✅ Empfehlung: ${beste.anzahl}× ${beste.querschnitt} mm²</span>
      </div>
      <div class="result-item"><span>Gesamtquerschnitt:</span><span>${beste.gesamtQuerschnitt} mm²</span></div>
      <div class="result-item"><span>Strom pro System:</span><span>${beste.stromProSystem.toFixed(1)} A</span></div>
      <div class="result-item"><span>Max. Belastbarkeit:</span><span>${beste.maxBelastbarkeit.toFixed(1)} A (${beste.auslastung.toFixed(0)}%)</span></div>
      <div class="result-item"><span>Spannungsfall:</span><span>${beste.spannungsfall.toFixed(2)} V (${beste.spannungsfallProzent.toFixed(2)}%)</span></div>
    `;
    
    if (beste.anzahl > 1) {
      html += `<div class="result-item"><span>Reduktionsfaktor:</span><span>${beste.reduktion} (${beste.anzahl} parallele Systeme)</span></div>`;
    }
    
    // Weitere Optionen anzeigen
    if (loesungen.length > 1) {
      html += '<h4 style="margin-top:20px;">Weitere Optionen:</h4><table class="data-table"><thead><tr><th>Variante</th><th>Ges.-Q</th><th>ΔU</th><th>Status</th></tr></thead><tbody>';
      for (const l of loesungen) {
        if (l === beste) continue;
        const status = l.ok ? '✅' : (l.auslastung > 100 ? '⚠️ Überlast' : '⚠️ ΔU');
        html += `<tr><td>${l.anzahl}× ${l.querschnitt} mm²</td><td>${l.gesamtQuerschnitt} mm²</td><td>${l.spannungsfallProzent.toFixed(2)}%</td><td>${status}</td></tr>`;
      }
      html += '</tbody></table>';
    }
  }
  
  html += '</div>';
  
  // Hinweise
  if (strom > 500) {
    html += `<div class="info-box"><h4>💡 Hinweis Hochstrom</h4><p>Bei Strömen über 500A sind oft Stromschienen wirtschaftlicher als Kabel.</p></div>`;
  }
  
  document.getElementById('leitung-result').innerHTML = html;
}

// ============================================
// STROMSTÄRKE / AMPERE BERECHNUNG
// ============================================
function calculateAmpere() {
  const netz = document.getElementById('amp-netz').value;
  const leistung = parseFloat(document.getElementById('amp-leistung').value);
  const einheit = parseFloat(document.getElementById('amp-einheit').value);
  const cosPhi = parseFloat(document.getElementById('amp-cosphi').value);
  const eta = parseFloat(document.getElementById('amp-eta').value);
  
  if (isNaN(leistung) || leistung <= 0) {
    document.getElementById('amp-result').innerHTML = '<div class="danger">Bitte Leistung eingeben</div>';
    return;
  }
  
  // Netz parsen: "230-ac1" -> spannung=230, art="ac1"
  const [spannungStr, art] = netz.split('-');
  const spannung = parseFloat(spannungStr);
  const isDC = art === 'dc';
  const is3Phase = art === 'ac3';
  
  const P = leistung * einheit; // Leistung in Watt
  const Pmech = P / eta; // Aufgenommene elektrische Leistung bei Motor
  
  let strom, formel, scheinleistung;
  
  if (isDC) {
    // Gleichstrom: I = P / U
    strom = Pmech / spannung;
    formel = `I = P / U = ${Pmech.toFixed(0)} W / ${spannung} V`;
    scheinleistung = Pmech;
  } else if (!is3Phase) {
    // Wechselstrom 1~: I = P / (U × cos φ)
    strom = Pmech / (spannung * cosPhi);
    scheinleistung = Pmech / cosPhi;
    formel = `I = P / (U × cos φ) = ${Pmech.toFixed(0)} W / (${spannung} V × ${cosPhi})`;
  } else {
    // Drehstrom 3~: I = P / (√3 × U × cos φ)
    strom = Pmech / (Math.sqrt(3) * spannung * cosPhi);
    scheinleistung = Pmech / cosPhi;
    formel = `I = P / (√3 × U × cos φ) = ${Pmech.toFixed(0)} W / (1,732 × ${spannung} V × ${cosPhi})`;
  }
  
  // Empfohlene Sicherung
  const sicherungen = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400];
  const empfohlene = sicherungen.find(s => s >= strom * 1.1) || '>400';
  
  // Empfohlener Querschnitt (vereinfacht, Verlegeart C)
  let querschnitt;
  if (strom <= 13) querschnitt = '1,5 mm²';
  else if (strom <= 18) querschnitt = '2,5 mm²';
  else if (strom <= 25) querschnitt = '4 mm²';
  else if (strom <= 32) querschnitt = '6 mm²';
  else if (strom <= 44) querschnitt = '10 mm²';
  else if (strom <= 59) querschnitt = '16 mm²';
  else if (strom <= 77) querschnitt = '25 mm²';
  else if (strom <= 96) querschnitt = '35 mm²';
  else if (strom <= 117) querschnitt = '50 mm²';
  else if (strom <= 149) querschnitt = '70 mm²';
  else if (strom <= 180) querschnitt = '95 mm²';
  else if (strom <= 208) querschnitt = '120 mm²';
  else querschnitt = '>120 mm² (prüfen)';
  
  let artText = isDC ? 'Gleichstrom' : (is3Phase ? 'Drehstrom 3~' : 'Wechselstrom 1~');
  
  document.getElementById('amp-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Stromstärke I:</span>
        <span class="result-value"><strong>${strom.toFixed(2)} A</strong></span>
      </div>
      ${!isDC ? `
      <div class="result-item">
        <span class="result-label">Scheinleistung S:</span>
        <span class="result-value">${(scheinleistung/1000).toFixed(2)} kVA</span>
      </div>
      ` : ''}
      <div class="result-item">
        <span class="result-label">Empf. Sicherung:</span>
        <span class="result-value">${empfohlene} A</span>
      </div>
      <div class="result-item">
        <span class="result-label">Empf. Querschnitt:</span>
        <span class="result-value">${querschnitt}</span>
      </div>
    </div>
    <div class="info-box">
      <h4>📐 Formel (${artText})</h4>
      <p>${formel}</p>
      <p>= <strong>${strom.toFixed(2)} A</strong></p>
      ${eta < 1 ? `<p style="font-size:12px;color:#6b7280;">η = ${(eta*100).toFixed(0)}% → Pelektr = ${Pmech.toFixed(0)} W</p>` : ''}
    </div>`;
}

// Update Ampere fields visibility based on DC/AC selection
function updateAmpFields() {
  const netz = document.getElementById('amp-netz');
  if (!netz) return;
  const isDC = netz.value.includes('-dc');
  const cosPhiGroup = document.getElementById('amp-cosphi-group');
  if (cosPhiGroup) {
    cosPhiGroup.style.display = isDC ? 'none' : 'block';
  }
}

// ============================================
// SPANNUNGSFALL - KORRIGIERT
// ============================================
function calculateVoltageDrop() {
  const art = document.getElementById('sf-art').value;
  const laenge = parseFloat(document.getElementById('sf-laenge').value);
  const querschnitt = parseFloat(document.getElementById('sf-querschnitt').value);
  const strom = parseFloat(document.getElementById('sf-strom').value);
  const material = document.getElementById('sf-material').value;
  const cosPhi = parseFloat(document.getElementById('sf-cosphi').value) || 1;
  
  if (isNaN(laenge) || isNaN(querschnitt) || isNaN(strom)) {
    return showError('Bitte alle Felder ausfüllen');
  }
  
  const kappa = material === 'cu' ? KAPPA_CU : KAPPA_AL;
  const nennspannung = art === 'ac1' ? 230 : 400;
  
  // KORRIGIERTE FORMEL für Spannungsfall:
  // Einphasig (Hin + Rück): ΔU = (2 × L × I × cos φ) / (κ × A)
  // Drehstrom symmetrisch: ΔU = (√3 × L × I × cos φ) / (κ × A)
  const faktor = art === 'ac1' ? 2 : Math.sqrt(3);
  const deltaU = (faktor * laenge * strom * cosPhi) / (kappa * querschnitt);
  const deltaUProzent = (deltaU / nennspannung) * 100;
  const spannungVerbraucher = nennspannung - deltaU;
  
  // Bewertung
  let bewertung, boxClass;
  if (deltaUProzent <= 3) {
    bewertung = '✓ In Ordnung (≤3%)';
    boxClass = 'result';
  } else if (deltaUProzent <= 5) {
    bewertung = '⚠ Grenzwertig (3-5%)';
    boxClass = 'warning';
  } else {
    bewertung = '✗ Zu hoch (>5%)';
    boxClass = 'danger';
  }
  
  document.getElementById('sf-result').innerHTML = `
    <div class="${boxClass}">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Spannungsfall ΔU:</span>
        <span class="result-value">${deltaU.toFixed(2)} V (${deltaUProzent.toFixed(2)}%)</span>
      </div>
      <div class="result-item">
        <span class="result-label">Spannung am Verbraucher:</span>
        <span class="result-value">${spannungVerbraucher.toFixed(2)} V</span>
      </div>
      <div class="result-item">
        <span class="result-label">Bewertung:</span>
        <span class="result-value">${bewertung}</span>
      </div>
    </div>
    <div class="info-box">
      <h4>📐 Verwendete Formel (${art === 'ac1' ? 'Einphasig' : 'Drehstrom'})</h4>
      <p>ΔU = (${art === 'ac1' ? '2' : '√3'} × L × I × cos φ) / (κ × A)</p>
      <p>ΔU = (${faktor.toFixed(3)} × ${laenge} × ${strom} × ${cosPhi}) / (${kappa} × ${querschnitt})</p>
    </div>`;
}

// ============================================
// LEISTUNGSBERECHNUNG
// ============================================
function updateLeistungFields() {
  const artEl = document.getElementById('leistung-art');
  const container = document.getElementById('leistung-inputs');
  
  // Null-Check: Elemente existieren nur auf Berechnungsseite
  if (!artEl || !container) return;
  
  const art = artEl.value;
  let html = '';
  
  if (art === 'dc') {
    html = `
      <div class="grid-2">
        <div class="form-group">
          <label>Spannung U (V)</label>
          <input type="number" id="leistung-spannung" placeholder="z.B. 24">
        </div>
        <div class="form-group">
          <label>Stromstärke I (A)</label>
          <input type="number" id="leistung-strom" placeholder="z.B. 5">
        </div>
      </div>`;
  } else if (art === 'ac1') {
    html = `
      <div class="grid-2">
        <div class="form-group">
          <label>Spannung U (V)</label>
          <input type="number" id="leistung-spannung" value="230">
        </div>
        <div class="form-group">
          <label>Stromstärke I (A)</label>
          <input type="number" id="leistung-strom" placeholder="z.B. 10">
        </div>
      </div>
      <div class="form-group">
        <label>Leistungsfaktor cos φ</label>
        <input type="number" id="leistung-cosphi" value="1" step="0.01" min="0" max="1">
      </div>`;
  } else {
    html = `
      <div class="grid-2">
        <div class="form-group">
          <label>Spannung U (V) - Außenleiter</label>
          <input type="number" id="leistung-spannung" value="400">
        </div>
        <div class="form-group">
          <label>Stromstärke I (A)</label>
          <input type="number" id="leistung-strom" placeholder="z.B. 16">
        </div>
      </div>
      <div class="form-group">
        <label>Leistungsfaktor cos φ</label>
        <input type="number" id="leistung-cosphi" value="0.85" step="0.01" min="0" max="1">
      </div>`;
  }
  container.innerHTML = html;
}

function calculatePower() {
  const art = document.getElementById('leistung-art').value;
  const U = parseFloat(document.getElementById('leistung-spannung').value);
  const I = parseFloat(document.getElementById('leistung-strom').value);
  
  if (isNaN(U) || isNaN(I)) return showError('Bitte alle Felder ausfüllen');
  
  let P, S, Q, result;
  
  if (art === 'dc') {
    P = U * I;
    result = `
      <div class="result">
        <h3>Ergebnis: Gleichstrom</h3>
        <div class="result-item">
          <span class="result-label">Leistung P:</span>
          <span class="result-value">${P.toFixed(2)} W (${(P/1000).toFixed(3)} kW)</span>
        </div>
      </div>`;
  } else {
    const cosPhi = parseFloat(document.getElementById('leistung-cosphi').value);
    if (isNaN(cosPhi)) return showError('Bitte Leistungsfaktor eingeben');
    
    const sinPhi = Math.sin(Math.acos(cosPhi));
    
    if (art === 'ac1') {
      S = U * I;
    } else {
      S = Math.sqrt(3) * U * I;
    }
    
    P = S * cosPhi;
    Q = S * sinPhi;
    
    result = `
      <div class="result">
        <h3>Ergebnis: ${art === 'ac1' ? 'Wechselstrom 1~' : 'Drehstrom 3~'}</h3>
        <div class="result-item">
          <span class="result-label">Wirkleistung P:</span>
          <span class="result-value">${P.toFixed(2)} W (${(P/1000).toFixed(2)} kW)</span>
        </div>
        <div class="result-item">
          <span class="result-label">Scheinleistung S:</span>
          <span class="result-value">${S.toFixed(2)} VA (${(S/1000).toFixed(2)} kVA)</span>
        </div>
        <div class="result-item">
          <span class="result-label">Blindleistung Q:</span>
          <span class="result-value">${Q.toFixed(2)} var (${(Q/1000).toFixed(2)} kvar)</span>
        </div>
      </div>`;
  }
  
  document.getElementById('leistung-result').innerHTML = result;
}

// ============================================
// ABSICHERUNG
// ============================================
function calculateFuse() {
  let P = parseFloat(document.getElementById('sicherung-leistung').value);
  const U = parseFloat(document.getElementById('sicherung-spannung').value);
  const cosPhi = parseFloat(document.getElementById('sicherung-cosphi').value);
  
  if (isNaN(P) || isNaN(U) || isNaN(cosPhi)) {
    return showError('Bitte alle Felder ausfüllen');
  }
  
  // Wenn Wert klein, als kW interpretieren
  if (P < 100) P = P * 1000;
  
  // Strom berechnen
  let I;
  if (U === 230) {
    I = P / (U * cosPhi);
  } else {
    I = P / (Math.sqrt(3) * U * cosPhi);
  }
  
  // Sicherung mit Reserve wählen (1,25 × Betriebsstrom)
  const sicherungStrom = I * 1.25;
  let empfohlene = SICHERUNGEN.find(s => s >= sicherungStrom) || 250;
  
  // Mindestquerschnitt zur Sicherung
  const querschnitte = {
    6: 1.5, 10: 1.5, 13: 1.5, 16: 2.5, 20: 2.5, 25: 4, 32: 6, 35: 6,
    40: 10, 50: 10, 63: 16, 80: 25, 100: 35, 125: 50, 160: 70, 200: 95, 250: 120
  };
  
  // Auslösecharakteristik empfehlen
  let charakteristik;
  if (P >= 15000) {
    charakteristik = 'D (hoher Anlaufstrom)';
  } else if (P >= 3000 || empfohlene >= 20) {
    charakteristik = 'C (Motor/Gewerbe)';
  } else {
    charakteristik = 'B (Haushalt/ohmsche Last)';
  }
  
  document.getElementById('sicherung-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Geräteleistung:</span>
        <span class="result-value">${(P/1000).toFixed(2)} kW</span>
      </div>
      <div class="result-item">
        <span class="result-label">Betriebsstrom:</span>
        <span class="result-value">${I.toFixed(2)} A</span>
      </div>
      <div class="result-item">
        <span class="result-label">Empfohlene Sicherung:</span>
        <span class="result-value">${empfohlene} A</span>
      </div>
      <div class="result-item">
        <span class="result-label">Charakteristik:</span>
        <span class="result-value">${charakteristik}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Mindestquerschnitt:</span>
        <span class="result-value">${querschnitte[empfohlene]} mm² (Cu)</span>
      </div>
    </div>`;
}

// ============================================
// ERDUNG
// ============================================
function updateErdungFields() {
  // Felder je nach Erdungsart anpassen (optional)
}

function calculateEarthing() {
  const art = document.getElementById('erdung-art').value;
  const laenge = parseFloat(document.getElementById('erdung-laenge').value);
  const durchmesser = parseFloat(document.getElementById('erdung-durchmesser').value) / 1000; // in m
  const rhoE = parseFloat(document.getElementById('erdung-boden').value);
  
  if (isNaN(laenge) || isNaN(durchmesser) || isNaN(rhoE)) {
    return showError('Bitte alle Felder ausfüllen');
  }
  
  let Ra;
  
  switch(art) {
    case 'stab':
      // Staberder: Ra = (ρE / 2πL) × ln(4L/d)
      Ra = (rhoE / (2 * Math.PI * laenge)) * Math.log(4 * laenge / durchmesser);
      break;
    case 'ring':
      // Ringerder mit Umfang L: Ra ≈ ρE / (4r) mit r = L/(2π)
      const radius = laenge / (2 * Math.PI);
      Ra = rhoE / (4 * radius);
      break;
    case 'band':
      // Banderder horizontal: Ra = (ρE / 2πL) × ln(2L²/bd)
      // Vereinfacht mit Standardbreite 30mm, Tiefe 0.5m
      Ra = (rhoE / (2 * Math.PI * laenge)) * Math.log(2 * laenge / 0.5);
      break;
  }
  
  // Bewertung
  let status, boxClass;
  if (Ra <= 2) {
    status = '✓ Sehr gut (≤2Ω) - TN-System optimal';
    boxClass = 'result';
  } else if (Ra <= 10) {
    status = '✓ Gut (≤10Ω) - Blitzschutz OK';
    boxClass = 'result';
  } else {
    status = '⚠ Verbesserung empfohlen (>10Ω)';
    boxClass = 'warning';
  }
  
  let html = `
    <div class="${boxClass}">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Erdungswiderstand Ra:</span>
        <span class="result-value">${Ra.toFixed(2)} Ω</span>
      </div>
      <div class="result-item">
        <span class="result-label">Bewertung:</span>
        <span class="result-value">${status}</span>
      </div>
    </div>`;
  
  if (Ra > 10) {
    html += `<div class="info-box"><h4>💡 Verbesserungsmöglichkeiten</h4>
      <ul>
        <li>Mehrere Erder parallel schalten</li>
        <li>Längeren Erder verwenden</li>
        <li>Erdreich mit Bentonit oder Salz verbessern</li>
        <li>Tiefenerder bis ins Grundwasser</li>
      </ul></div>`;
  }
  
  document.getElementById('erdung-result').innerHTML = html;
}

// ============================================
// KURZSCHLUSSSTROM - KORRIGIERT
// ============================================
function calculateShortCircuit() {
  const Sn = parseFloat(document.getElementById('kss-trafo').value) * 1000; // VA
  const uk = parseFloat(document.getElementById('kss-uk').value) / 100;
  const Un = parseFloat(document.getElementById('kss-spannung').value);
  const laenge = parseFloat(document.getElementById('kss-laenge').value);
  const querschnitt = parseFloat(document.getElementById('kss-querschnitt').value);
  const material = document.getElementById('kss-material').value;
  
  if (isNaN(Sn) || isNaN(uk) || isNaN(laenge) || isNaN(querschnitt)) {
    return showError('Bitte alle Felder ausfüllen');
  }
  
  const kappa = material === 'cu' ? KAPPA_CU : KAPPA_AL;
  
  // Kurzschlussstrom am Trafo
  // Ik" = Sn / (√3 × Un × uk)
  const IkTrafo = Sn / (Math.sqrt(3) * Un * uk);
  
  // Trafoimpedanz
  const ZTrafo = (Un * uk) / (Math.sqrt(3) * (Sn / (Math.sqrt(3) * Un)));
  
  // Leitungsimpedanz (Hin + Rück)
  // ZL = 2 × L / (κ × A)
  const ZLeitung = (2 * laenge) / (kappa * querschnitt);
  
  // Gesamtimpedanz
  const ZGes = ZTrafo + ZLeitung;
  
  // Kurzschlussstrom an Fehlerstelle
  const IkFehler = Un / (Math.sqrt(3) * ZGes);
  
  document.getElementById('kss-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Ik" am Trafo:</span>
        <span class="result-value">${(IkTrafo/1000).toFixed(2)} kA</span>
      </div>
      <div class="result-item">
        <span class="result-label">Trafoimpedanz ZT:</span>
        <span class="result-value">${(ZTrafo*1000).toFixed(2)} mΩ</span>
      </div>
      <div class="result-item">
        <span class="result-label">Leitungsimpedanz ZL:</span>
        <span class="result-value">${(ZLeitung*1000).toFixed(2)} mΩ</span>
      </div>
      <div class="result-item">
        <span class="result-label">Ik" an Fehlerstelle:</span>
        <span class="result-value">${(IkFehler/1000).toFixed(2)} kA</span>
      </div>
    </div>
    <div class="info-box">
      <h4>📌 Hinweise</h4>
      <ul>
        <li>Schutzeinrichtungen müssen mindestens ${(IkFehler/1000).toFixed(1)} kA Schaltvermögen haben</li>
        <li>Selektivität: Vorsicherung muss höheren Ik aushalten</li>
        <li>Thermische Kurzschlussfestigkeit des Kabels prüfen</li>
      </ul>
    </div>`;
}

// ============================================
// TRAFO-DIMENSIONIERUNG
// ============================================
function calculateTransformer() {
  const PAnschluss = parseFloat(document.getElementById('trafo-leistung').value);
  const g = parseFloat(document.getElementById('trafo-gleich').value);
  const cosPhi = parseFloat(document.getElementById('trafo-cosphi').value);
  const reserve = parseFloat(document.getElementById('trafo-reserve').value) / 100;
  
  if (isNaN(PAnschluss) || isNaN(g) || isNaN(cosPhi)) {
    return showError('Bitte alle Felder ausfüllen');
  }
  
  // Gleichzeitige Leistung
  const PGleich = PAnschluss * g;
  
  // Scheinleistung
  const S = PGleich / cosPhi;
  
  // Mit Reserve
  const SMitReserve = S * (1 + reserve);
  
  // Nächste Trafogröße finden
  const empfohlen = TRAFOGROESSEN.find(t => t >= SMitReserve) || TRAFOGROESSEN[TRAFOGROESSEN.length - 1];
  
  document.getElementById('trafo-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Anschlussleistung:</span>
        <span class="result-value">${PAnschluss} kW</span>
      </div>
      <div class="result-item">
        <span class="result-label">Gleichzeitige Leistung:</span>
        <span class="result-value">${PGleich.toFixed(1)} kW</span>
      </div>
      <div class="result-item">
        <span class="result-label">Scheinleistung:</span>
        <span class="result-value">${S.toFixed(1)} kVA</span>
      </div>
      <div class="result-item">
        <span class="result-label">Mit Reserve (${(reserve*100).toFixed(0)}%):</span>
        <span class="result-value">${SMitReserve.toFixed(1)} kVA</span>
      </div>
      <div class="result-item">
        <span class="result-label">Empfohlener Trafo:</span>
        <span class="result-value">${empfohlen} kVA</span>
      </div>
    </div>`;
}

// ============================================
// KABELGEWICHT
// ============================================
function calculateCableWeight() {
  const typ = document.getElementById('gewicht-typ').value;
  const q = parseFloat(document.getElementById('gewicht-querschnitt').value);
  const adern = parseInt(document.getElementById('gewicht-adern').value);
  const laenge = parseFloat(document.getElementById('gewicht-laenge').value);
  
  if (isNaN(q) || isNaN(adern) || isNaN(laenge)) {
    return showError('Bitte alle Felder ausfüllen');
  }
  
  // Gewicht aus Tabelle oder schätzen
  let gewichtProMeter;
  if (KABELGEWICHTE[typ] && KABELGEWICHTE[typ][q] && KABELGEWICHTE[typ][q][adern]) {
    gewichtProMeter = KABELGEWICHTE[typ][q][adern];
  } else {
    // Schätzformel: Basisgewicht + Kupfergewicht
    const kupferGewicht = q * adern * 8.9; // Cu-Dichte 8.9 g/cm³
    const mantelGewicht = q * 2 + 30;
    gewichtProMeter = kupferGewicht + mantelGewicht;
  }
  
  const gesamtgewicht = (gewichtProMeter * laenge) / 1000; // in kg
  
  document.getElementById('gewicht-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Gewicht pro Meter:</span>
        <span class="result-value">${gewichtProMeter.toFixed(0)} g/m</span>
      </div>
      <div class="result-item">
        <span class="result-label">Gesamtgewicht (${laenge}m):</span>
        <span class="result-value">${gesamtgewicht.toFixed(2)} kg</span>
      </div>
    </div>
    <div class="info-box">
      <p><strong>Hinweis:</strong> Bei Trassen und Leitern Traglast beachten!</p>
    </div>`;
}

// ============================================
// TRASSEN-DIMENSIONIERUNG
// ============================================
function calculateTray() {
  const methode = document.getElementById('trasse-methode')?.value || 'manuell';
  const fuellgrad = parseInt(document.getElementById('trasse-fuellgrad').value) / 100;
  
  let kabelFlaeche = 0;
  let kabelListe = '';
  
  if (methode === 'manuell') {
    const anzahl = parseInt(document.getElementById('trasse-anzahl').value);
    const durchmesser = parseFloat(document.getElementById('trasse-durchmesser').value);
    
    if (isNaN(anzahl) || isNaN(durchmesser) || anzahl <= 0 || durchmesser <= 0) {
      return showError('Bitte alle Felder ausfüllen');
    }
    
    kabelFlaeche = anzahl * Math.PI * Math.pow(durchmesser / 2, 2);
    kabelListe = `${anzahl}× Ø${durchmesser}mm`;
  } else {
    // Aus Kabel-Auswahl berechnen
    const eintraege = document.querySelectorAll('.kabel-eintrag');
    let details = [];
    
    eintraege.forEach(eintrag => {
      const typSelect = eintrag.querySelector('.kabel-typ');
      const mengeInput = eintrag.querySelector('.kabel-menge');
      if (typSelect && mengeInput) {
        const durchmesser = parseFloat(typSelect.value);
        const menge = parseInt(mengeInput.value) || 0;
        if (menge > 0 && durchmesser > 0) {
          kabelFlaeche += menge * Math.PI * Math.pow(durchmesser / 2, 2);
          details.push(`${menge}× ${typSelect.options[typSelect.selectedIndex].text}`);
        }
      }
    });
    
    if (kabelFlaeche === 0) {
      return showError('Bitte mindestens ein Kabel mit Anzahl angeben');
    }
    kabelListe = details.join(', ');
  }
  
  // Benötigte Trassenfläche (mit Füllgrad)
  const benoetigteFläche = kabelFlaeche / fuellgrad;
  
  // Trassenbreite berechnen (Annahme: Höhe = 60mm Standard)
  const trassenHoehe = 60;
  const benotigteBreite = benoetigteFläche / trassenHoehe;
  
  // Standard-Trassenbreiten
  const standardBreiten = [50, 75, 100, 150, 200, 300, 400, 500, 600];
  const empfohleneBreite = standardBreiten.find(b => b >= benotigteBreite) || 600;
  
  document.getElementById('trasse-result').innerHTML = `
    <div class="result">
      <h3>Ergebnis</h3>
      <div class="result-item">
        <span class="result-label">Kabel:</span>
        <span class="result-value" style="font-size:12px;">${kabelListe}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Kabelfläche gesamt:</span>
        <span class="result-value">${kabelFlaeche.toFixed(0)} mm²</span>
      </div>
      <div class="result-item">
        <span class="result-label">Benötigt (${(fuellgrad*100).toFixed(0)}% Füllung):</span>
        <span class="result-value">${benoetigteFläche.toFixed(0)} mm²</span>
      </div>
      <div class="result-item">
        <span class="result-label">Empfohlene Trasse:</span>
        <span class="result-value">${empfohleneBreite} × ${trassenHoehe} mm</span>
      </div>
    </div>`;
}

// Trasse Hilfsfunktionen
function updateTrasseFields() {
  const methode = document.getElementById('trasse-methode').value;
  const manuellFields = document.getElementById('trasse-manuell-fields');
  const auswahlFields = document.getElementById('trasse-auswahl-fields');
  
  if (methode === 'manuell') {
    manuellFields.style.display = 'block';
    auswahlFields.style.display = 'none';
  } else {
    manuellFields.style.display = 'none';
    auswahlFields.style.display = 'block';
  }
}

function addKabelZeile() {
  const liste = document.getElementById('kabel-liste');
  const div = document.createElement('div');
  div.className = 'kabel-eintrag';
  div.style.cssText = 'display:flex;gap:10px;margin-bottom:10px;';
  div.innerHTML = `
    <select class="kabel-typ" style="flex:2">
      <option value="9.5">NYM-J 3×1,5 (Ø9,5)</option>
      <option value="11">NYM-J 3×2,5 (Ø11)</option>
      <option value="11">NYM-J 5×1,5 (Ø11)</option>
      <option value="13">NYM-J 5×2,5 (Ø13)</option>
      <option value="15">NYM-J 5×4 (Ø15)</option>
      <option value="17">NYM-J 5×6 (Ø17)</option>
      <option value="20">NYM-J 5×10 (Ø20)</option>
      <option value="24">NYM-J 5×16 (Ø24)</option>
      <option value="14">NYY-J 5×1,5 (Ø14)</option>
      <option value="16">NYY-J 5×2,5 (Ø16)</option>
      <option value="20">NYY-J 5×6 (Ø20)</option>
      <option value="24">NYY-J 5×10 (Ø24)</option>
      <option value="28">NYY-J 5×16 (Ø28)</option>
      <option value="33">NYY-J 5×25 (Ø33)</option>
      <option value="6">Cat.6 (Ø6)</option>
      <option value="7">Cat.7 (Ø7)</option>
    </select>
    <input type="number" class="kabel-menge" placeholder="Anzahl" style="flex:1" value="1">
    <button type="button" onclick="this.parentElement.remove()" style="background:#dc2626;color:white;border:none;padding:5px 10px;border-radius:4px;">×</button>
  `;
  liste.appendChild(div);
}

// Helper
function showError(msg) {
  alert(msg);
}

// ============================================
// BLITZSCHUTZ - TRENNUNGSABSTAND
// ============================================
function calcTrennungsabstand() {
  const ki = parseFloat(document.getElementById('bs-klasse').value);
  const km = parseFloat(document.getElementById('bs-material').value);
  const l = parseFloat(document.getElementById('bs-laenge').value);
  
  if (isNaN(l) || l <= 0) {
    document.getElementById('bs-result').innerHTML = '<div class="danger">Bitte Länge eingeben</div>';
    return;
  }
  
  // Formel: s = ki × (kc/km) × l
  // kc = 1 für eine Ableitung, vereinfacht
  const kc = 1;
  const s = ki * (kc / km) * l;
  
  document.getElementById('bs-result').innerHTML = `
    <div class="result">
      <h3>Trennungsabstand</h3>
      <div class="result-item"><span>ki:</span><span>${ki}</span></div>
      <div class="result-item"><span>km:</span><span>${km}</span></div>
      <div class="result-item"><span>Länge:</span><span>${l} m</span></div>
      <div class="result-item"><span>Erforderlicher Abstand s:</span><span><strong>${(s * 100).toFixed(0)} cm</strong></span></div>
    </div>
    <div class="info-box" style="margin-top:10px">
      <p>Wird s unterschritten, ist Potentialausgleich erforderlich!</p>
    </div>`;
}

// ============================================
// MOTORSCHUTZ
// ============================================
function calcMotor() {
  const p = parseFloat(document.getElementById('mot-leistung').value);
  const u = parseFloat(document.getElementById('mot-spannung').value);
  const ia_faktor = parseFloat(document.getElementById('mot-anlauf').value);
  
  if (isNaN(p) || p <= 0) {
    document.getElementById('mot-result').innerHTML = '<div class="danger">Bitte Leistung eingeben</div>';
    return;
  }
  
  // Nennstrom berechnen
  const eta = 0.85; // Wirkungsgrad
  const cosPhi = 0.8; // Leistungsfaktor
  let i_n;
  
  if (u === 400) {
    // Drehstrom: In = P / (√3 × U × η × cos φ)
    i_n = (p * 1000) / (Math.sqrt(3) * u * eta * cosPhi);
  } else {
    // Wechselstrom: In = P / (U × η × cos φ)
    i_n = (p * 1000) / (u * eta * cosPhi);
  }
  
  const i_a = i_n * ia_faktor;
  const sicherung = Math.ceil(i_n * 1.6 / 10) * 10; // Nächste 10er-Stufe
  
  document.getElementById('mot-result').innerHTML = `
    <div class="result">
      <h3>Motorstrom</h3>
      <div class="result-item"><span>Nennstrom In:</span><span><strong>${i_n.toFixed(1)} A</strong></span></div>
      <div class="result-item"><span>Anlaufstrom Ia:</span><span><strong>${i_a.toFixed(0)} A</strong></span></div>
      <div class="result-item"><span>Verhältnis Ia/In:</span><span>${ia_faktor}</span></div>
      <div class="result-item"><span>Sicherung (gL):</span><span>ca. ${sicherung} A</span></div>
      <div class="result-item"><span>Motorschutzschalter:</span><span>${i_n.toFixed(1)} A eingestellt</span></div>
    </div>`;
}

// ============================================
// BLINDLEISTUNGSKOMPENSATION
// ============================================
function calcKompensation() {
  const p = parseFloat(document.getElementById('ko-p').value);
  const cosPhiIst = parseFloat(document.getElementById('ko-ist').value);
  const cosPhiSoll = parseFloat(document.getElementById('ko-soll').value);
  
  if (isNaN(p) || p <= 0 || isNaN(cosPhiIst) || cosPhiIst <= 0 || cosPhiIst > 1) {
    document.getElementById('ko-result').innerHTML = '<div class="danger">Bitte gültige Werte eingeben</div>';
    return;
  }
  
  // tan φ berechnen
  const tanPhiIst = Math.tan(Math.acos(cosPhiIst));
  const tanPhiSoll = Math.tan(Math.acos(cosPhiSoll));
  
  // Qc = P × (tan φ1 - tan φ2)
  const qc = p * (tanPhiIst - tanPhiSoll);
  
  // Blindleistung vorher/nachher
  const qIst = p * tanPhiIst;
  const qSoll = p * tanPhiSoll;
  
  // Scheinleistung vorher/nachher
  const sIst = p / cosPhiIst;
  const sSoll = p / cosPhiSoll;
  const reduktion = ((sIst - sSoll) / sIst) * 100;
  
  document.getElementById('ko-result').innerHTML = `
    <div class="result">
      <h3>Kompensation</h3>
      <div class="result-item"><span>Wirkleistung P:</span><span>${p} kW</span></div>
      <div class="result-item"><span>Blindleistung Q (vorher):</span><span>${qIst.toFixed(1)} kvar</span></div>
      <div class="result-item"><span>Blindleistung Q (nachher):</span><span>${qSoll.toFixed(1)} kvar</span></div>
      <div class="result-item"><span>Kompensationsleistung Qc:</span><span><strong>${qc.toFixed(1)} kvar</strong></span></div>
      <div class="result-item"><span>Scheinleistung S (vorher):</span><span>${sIst.toFixed(1)} kVA</span></div>
      <div class="result-item"><span>Scheinleistung S (nachher):</span><span>${sSoll.toFixed(1)} kVA</span></div>
      <div class="result-item"><span>Entlastung:</span><span>${reduktion.toFixed(1)}%</span></div>
    </div>`;
}

