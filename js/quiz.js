/**
 * Hoher Elektrosammlung - Quiz System
 */

const quizData = {
  basis: [
    {q: 'Welche Spannung hat das deutsche Niederspannungsnetz?', a: ['230V AC / 400V AC', '220V DC', '400V DC', '110V AC'], c: 0},
    {q: 'Was bedeutet die Schutzart IP44?', a: ['Schutz gegen Spritzwasser', 'Vollständig wasserdicht', 'Nur staubgeschützt', 'Schutz gegen Strahlwasser'], c: 0},
    {q: 'Welche Farbe hat der Schutzleiter (PE)?', a: ['Grün-Gelb', 'Blau', 'Braun', 'Schwarz'], c: 0},
    {q: 'Was ist die Aufgabe eines FI-Schutzschalters (RCD)?', a: ['Schutz bei Fehlerstrom gegen Erde', 'Schutz bei Überlast', 'Schutz bei Kurzschluss', 'Blitzschutz'], c: 0},
    {q: 'Welcher Querschnitt für 16A Steckdosen im Wohnungsbau?', a: ['2,5 mm²', '1,5 mm²', '4 mm²', '6 mm²'], c: 0},
    {q: 'Wie lauten die 5 Sicherheitsregeln?', a: ['Freischalten → Sichern → Prüfen → Erden → Abdecken', 'Prüfen → Freischalten → Erden → Sichern → Abdecken', 'Sichern → Freischalten → Prüfen → Abdecken → Erden', 'Freischalten → Prüfen → Sichern → Abdecken → Erden'], c: 0},
    {q: 'Wann löst ein B16-Automat magnetisch (sofort) aus?', a: ['Bei 48-80A (3-5×In)', 'Bei 16A', 'Bei 20A', 'Bei 160A (10×In)'], c: 0},
    {q: 'Was ist die max. Berührungsspannung im trockenen Wohnbereich?', a: ['50V AC', '230V AC', '12V AC', '25V AC'], c: 0},
    {q: 'Welche Norm regelt Badezimmer-Installationen?', a: ['DIN VDE 0100-701', 'DIN VDE 0100-100', 'DIN 18015', 'DIN VDE 0298'], c: 0},
    {q: 'Was ist SELV?', a: ['Sicherheitskleinspannung (max. 50V AC / 120V DC)', 'Eine Kabeltype', 'Ein Messgerät', 'Eine Prüfnorm'], c: 0},
    {q: 'Welche Farbe hat der Neutralleiter (N)?', a: ['Blau', 'Grün-Gelb', 'Braun', 'Schwarz'], c: 0},
    {q: 'Was bedeutet das "L" in L1, L2, L3?', a: ['Außenleiter (Phase/Line)', 'Lampe', 'Leitung', 'Leitfähigkeit'], c: 0},
    {q: 'Standard-Installationshöhe für Steckdosen?', a: ['30 cm', '50 cm', '105 cm', '150 cm'], c: 0},
    {q: 'Standard-Installationshöhe für Lichtschalter?', a: ['105 cm', '30 cm', '150 cm', '85 cm'], c: 0},
    {q: 'Maximale Leistung an einer 16A/230V Steckdose?', a: ['3680 W', '2300 W', '5000 W', '1600 W'], c: 0},
    {q: 'Was ist ein RCD (Residual Current Device)?', a: ['FI-Schutzschalter', 'Ein Kabeltyp', 'Ein Messgerät', 'Ein Trafo'], c: 0},
    {q: 'Geräte mit Schutzisolierung haben welche Schutzklasse?', a: ['Schutzklasse II (doppelte Isolierung)', 'Schutzklasse I', 'Schutzklasse III', 'Schutzklasse 0'], c: 0},
    {q: 'Was bedeutet "NYM-J"?', a: ['Mantelleitung für feste Verlegung innen', 'Erdkabel', 'Flexible Leitung', 'Starkstromkabel'], c: 0},
    {q: 'Maximaler Spannungsfall bei Endstromkreisen?', a: ['3%', '5%', '1%', '10%'], c: 0},
    {q: 'Ab welcher Spannung besteht Lebensgefahr?', a: ['Ab ca. 50V AC / 120V DC', 'Ab 230V', 'Ab 12V', 'Ab 400V'], c: 0}
  ],
  
  geselle: [
    {q: 'Ein Drehstrommotor 11kW, cos φ = 0,85, 400V: Welcher Strom fließt?', a: ['~18,7A', '~27,5A', '~11A', '~15,7A'], c: 0},
    {q: 'Welcher Spannungsfall ist bei Endstromkreisen maximal zulässig?', a: ['3%', '5%', '10%', '1%'], c: 0},
    {q: 'Welchen Erdungswiderstand sollte ein Erder im TN-System haben?', a: ['Empfohlen ≤2Ω', 'Immer <100Ω', '<1Ω', '<0,1Ω'], c: 0},
    {q: 'Welche Aussage zu Selektivität ist richtig?', a: ['Vorsicherung muss langsamer auslösen als nachgeordnete', 'Vorsicherung muss schneller auslösen', 'Beide müssen gleichzeitig auslösen', 'Selektivität ist nur bei FI wichtig'], c: 0},
    {q: 'NYM-J 5×10mm² auf Wand: Welche Strombelastbarkeit (Verlegeart C)?', a: ['~57A', '~42A', '~63A', '~50A'], c: 0},
    {q: 'Drehstrom 400V zwischen Außenleitern: Spannung gegen Erde (N)?', a: ['~230V', '~400V', '~690V', '~115V'], c: 0},
    {q: 'Was muss VOR Beginn von Arbeiten an elektrischen Anlagen geprüft werden?', a: ['Spannungsfreiheit mit zweipoligem Spannungsprüfer', 'Durchgangsprüfung', 'Isolationsmessung', 'Erdungsmessung'], c: 0},
    {q: 'Mindestisolationswiderstand einer Installation bei 500V Prüfspannung?', a: ['1 MΩ', '100 kΩ', '10 MΩ', '0,5 MΩ'], c: 0},
    {q: 'Was bedeutet "uk" bei einem Transformator?', a: ['Kurzschlussspannung in %', 'Übersetzungsverhältnis', 'Kupferverluste', 'Leerlaufstrom'], c: 0},
    {q: 'NYM-Kabel Außen-Ø 15mm: Minimaler Biegeradius?', a: ['60mm (4× Durchmesser)', '15mm', '30mm', '120mm'], c: 0},
    {q: 'Welchen Auslösebereich hat ein C-Charakteristik LSS?', a: ['5-10 × In', '3-5 × In', '10-20 × In', '1-3 × In'], c: 0},
    {q: 'Formel für Scheinleistung bei Drehstrom?', a: ['S = √3 × U × I', 'S = U × I', 'S = 3 × U × I', 'S = U × I × cos φ'], c: 0},
    {q: 'Wann darf in Zone 1 (Bad) eine Steckdose installiert werden?', a: ['Nie, Zone 1 ist verboten für Steckdosen', 'Immer', 'Mit IPX4 Schutz', 'Mit FI-Schutzschalter'], c: 0},
    {q: 'Was ist der Zweck des Potentialausgleichs?', a: ['Verbindet alle leitfähigen Teile auf gleiches Potential', 'Nur für Metallrohre', 'Nur im Bad notwendig', 'Ersetzt den Schutzleiter'], c: 0},
    {q: 'Welche Prüfspannung für Isolationsmessung bei 230/400V Anlagen?', a: ['500V DC', '230V AC', '1000V DC', '250V DC'], c: 0},
    {q: 'Unterschied TN-C und TN-S System?', a: ['TN-C: PEN kombiniert, TN-S: PE und N getrennt', 'TN-C für Industrie, TN-S für Wohnungen', 'TN-C hat höhere Spannung', 'Kein Unterschied'], c: 0},
    {q: 'Wie viele Adern hat ein 5-adriges Drehstromkabel?', a: ['L1, L2, L3, N, PE', 'L1, L2, L3, PE, PE', 'L, N, PE, Reserve, Reserve', '5× Phase'], c: 0},
    {q: 'Mindestquerschnitt für Hauptpotentialausgleich?', a: ['6 mm² Cu oder 16 mm² Al', '2,5 mm²', '10 mm²', '1,5 mm²'], c: 0},
    {q: 'Was prüft die Schleifenimpedanzmessung?', a: ['Ob Abschaltbedingung bei Fehlerstrom erfüllt ist', 'Isolationswiderstand', 'Nur die Erdung', 'Durchgang PE'], c: 0},
    {q: 'Mindestabstand Elektroinstallation zu Gasleitung?', a: ['200 mm', '30 mm', '500 mm', '100 mm'], c: 0}
  ]
};

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let quizType = '';

function startQuiz(type) {
  quizType = type;
  currentQuiz = [...quizData[type]]; // Kopie erstellen
  
  // Zufällige Reihenfolge
  shuffleArray(currentQuiz);
  
  currentIndex = 0;
  score = 0;
  
  showQuestion();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showQuestion() {
  const container = quizType === 'basis' ? 'quiz-container' : 'quiz-geselle-container';
  
  if (currentIndex >= currentQuiz.length) {
    showScore();
    return;
  }
  
  const q = currentQuiz[currentIndex];
  
  // Antworten mischen mit Index-Tracking
  const shuffledAnswers = q.a.map((text, originalIndex) => ({
    text: text,
    isCorrect: originalIndex === q.c
  }));
  shuffleArray(shuffledAnswers);
  
  // Neuen Index der richtigen Antwort finden
  const correctIndex = shuffledAnswers.findIndex(a => a.isCorrect);
  
  let html = `
    <div class="quiz-card">
      <div style="color:#6b7280;margin-bottom:10px;font-size:14px">
        Frage ${currentIndex + 1} von ${currentQuiz.length}
      </div>
      <div class="quiz-question">${q.q}</div>
      <div class="quiz-options">`;
  
  shuffledAnswers.forEach((option, i) => {
    html += `<div class="quiz-option" data-correct="${option.isCorrect}" onclick="selectAnswer(${i}, ${correctIndex})">${option.text}</div>`;
  });
  
  html += `</div></div>`;
  
  document.getElementById(container).innerHTML = html;
}

function selectAnswer(index, correctIndex) {
  const options = document.querySelectorAll('.quiz-option');
  
  // Klicks deaktivieren
  options.forEach(opt => opt.style.pointerEvents = 'none');
  
  // Auswahl markieren
  options[index].classList.add('selected');
  
  setTimeout(() => {
    // Richtige Antwort zeigen
    options[correctIndex].classList.add('correct');
    
    if (index !== correctIndex) {
      options[index].classList.add('wrong');
    } else {
      score++;
    }
    
    // Nächste Frage nach kurzer Pause
    setTimeout(() => {
      currentIndex++;
      showQuestion();
    }, 1500);
  }, 300);
}

function showScore() {
  const container = quizType === 'basis' ? 'quiz-container' : 'quiz-geselle-container';
  const percent = Math.round((score / currentQuiz.length) * 100);
  
  let message, color;
  if (percent >= 90) {
    message = 'Hervorragend! 🌟';
    color = '#10b981';
  } else if (percent >= 70) {
    message = 'Gut gemacht! 👍';
    color = '#3b82f6';
  } else if (percent >= 50) {
    message = 'Noch üben! 📚';
    color = '#f59e0b';
  } else {
    message = 'Mehr lernen nötig! 💪';
    color = '#dc2626';
  }
  
  document.getElementById(container).innerHTML = `
    <div class="quiz-score" style="border: 3px solid ${color}">
      <h3 style="color:${color}">${message}</h3>
      <p style="font-size:48px;font-weight:bold;margin:20px 0;color:${color}">${percent}%</p>
      <p style="color:${color}">${score} von ${currentQuiz.length} Fragen richtig</p>
      <button class="btn" onclick="startQuiz('${quizType}')" style="margin-top:20px;max-width:300px">
        Nochmal versuchen
      </button>
    </div>`;
}
