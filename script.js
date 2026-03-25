// BioHealth Assistant - Pure frontend logic
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle: Dark/Light mode with persistence
  const toggleBtn = document.getElementById('theme-toggle');
  const DARK_CLASS = 'dark-mode';
  const storageKey = 'theme';

  function updateIcon(){
    if (document.body.classList.contains(DARK_CLASS)){
      toggleBtn.textContent = '☀️';
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
      toggleBtn.setAttribute('title', 'Switch to light mode');
    } else {
      toggleBtn.textContent = '🌙';
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      toggleBtn.setAttribute('title', 'Switch to dark mode');
    }
  }

  // Load saved theme on start
  const saved = localStorage.getItem(storageKey);
  if (saved === 'dark') {
    document.body.classList.add(DARK_CLASS);
  }

  if (toggleBtn) {
    updateIcon();
    toggleBtn.addEventListener('click', function () {
      const isDark = document.body.classList.toggle(DARK_CLASS);
      localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
      updateIcon();
    });
  }
  // Scroll-based active navbar highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav .nav-links a');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', current && href === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveLink);
  // Initialize on load
  window.addEventListener('load', updateActiveLink);
  // BMI Calculator
  const heightInput = document.getElementById('height');
  const weightInput = document.getElementById('weight');
  const bmiResult = document.getElementById('bmi-result');
  const btnBMICalc = document.getElementById('btn-calculate-bmi');
  btnBMICalc.addEventListener('click', () => {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      bmiResult.textContent = 'Please enter valid height and weight.';
      bmiResult.style.display = 'block';
      bmiResult.style.borderColor = '#eab308';
      return;
    }
    const bmi = w / (h * h);
    const cat = getBMICategory(bmi);
    bmiResult.innerHTML = `Your BMI is <strong>${bmi.toFixed(1)}</strong> (<em>${cat}</em>)`;
    bmiResult.style.display = 'block';
    bmiResult.style.borderLeft = '6px solid var(--primary)';
  });

  function getBMICategory(bmi){
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  // Blood compatibility
  const donorSel = document.getElementById('donor');
  const receiverSel = document.getElementById('receiver');
  const bloodResult = document.getElementById('blood-result');
  const btnBlood = document.getElementById('btn-check-blood');
  btnBlood.addEventListener('click', () => {
    const donor = donorSel.value;
    const receiver = receiverSel.value;
    const ok = isCompatible(donor, receiver);
    bloodResult.style.display = 'block';
    if (ok) {
      bloodResult.textContent = 'Compatible';
      bloodResult.style.color = '#256e3a';
      bloodResult.style.borderLeft = '6px solid #16a34a';
    } else {
      bloodResult.textContent = 'Not Compatible';
      bloodResult.style.color = '#991b1b';
      bloodResult.style.borderLeft = '6px solid #e11d48';
    }
  });

  function isCompatible(donor, receiver){
    // Compatibility table derived from ABO/Rh rules simplified for the exercise
    const table = {
      'O-':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
      'O+':  ['O+','A+','B+','AB+'],
      'A-':  ['A-','A+','AB-','AB+'],
      'A+':  ['A+','AB+'],
      'B-':  ['B-','B+','AB-','AB+'],
      'B+':  ['B+','AB+'],
      'AB-': ['AB-','AB+'],
      'AB+': ['AB+']
    };
    return table[donor] && table[donor].includes(receiver);
  }

  // Disease Symptom Checker
  const diseaseResult = document.getElementById('disease-result');
  const medicineResult = document.getElementById('medicine-result');
  const tipsResult = document.getElementById('tips-result');
  const checkDiseaseBtn = document.getElementById('btn-check-disease');
  checkDiseaseBtn.addEventListener('click', () => {
    // Gather checked symptoms
    const checks = Array.from(document.querySelectorAll('#symptoms input[type="checkbox"]'));
    const selected = checks.filter(c => c.checked).map(c => c.value);
    const diseases = diagnose(selected);
    if (diseases.length === 0){
      diseaseResult.style.display = 'block';
      diseaseResult.textContent = 'No strong prediction. Please select more symptoms.';
      medicineResult.style.display = 'none';
      tipsResult.style.display = 'none';
      return;
    }
    const top = diseases[0];
    diseaseResult.style.display = 'block';
    diseaseResult.innerHTML = `Predicted disease: <strong>${top.name}</strong> (score ${top.score})`;
    medicineResult.style.display = 'block';
    medicineResult.innerHTML = `Medicines: ${top.medicine.join(', ')}`;
    tipsResult.style.display = 'block';
    tipsResult.innerHTML = `Health Tips: <ul>${top.tips.map(t => `<li>${t}</li>`).join('')}</ul>`;
  });

  function diagnose(symptoms){
    // Simple heuristic disease scoring
    const map = [
      {name:'Common Cold', keys:['Cough','Runny Nose','Sore Throat','Sneezing'], medicine:['Paracetamol','Cetirizine'], tips:['Drink warm fluids','Take proper rest','Use steam inhalation']},
      {name:'Flu', keys:['Fever','Cough','Fatigue','Body Pain'], medicine:['Paracetamol','Ibuprofen'], tips:['Stay hydrated','Get adequate sleep','Avoid cold foods']},
      {name:'Migraine', keys:['Headache','Nausea'], medicine:['Ibuprofen'], tips:['Reduce screen time','Stay hydrated','Rest in a dark room']},
      {name:'Food Poisoning', keys:['Vomiting','Diarrhea','Abdominal Pain','Nausea'], medicine:['ORS','Antiemetic'], tips:['Drink ORS','Avoid oily foods','Eat light meals']},
      {name:'Gastroenteritis', keys:['Vomiting','Diarrhea','Abdominal Pain','Fever'], medicine:['ORS','Probiotics'], tips:['Hydration','Rest','Eat bland foods']},
      {name:'Viral Fever', keys:['Fever','Fatigue'], medicine:['Paracetamol'], tips:['Rest','Hydration','Light meals']},
      {name:'Allergy', keys:['Sneezing','Runny Nose','Itchy Eyes'], medicine:['Antihistamines'], tips:['Avoid allergens','Keep environment clean']},
      {name:'Sinusitis', keys:['Headache','Nasal Congestion','Fever'], medicine:['Decongestants','Analgesics'], tips:['Steam inhalation','Stay hydrated','Nasal saline rinse']},
      {name:'Pneumonia', keys:['Fever','Cough','Shortness of Breath','Fatigue','Chest Pain'], medicine:['Antibiotics (prescribed by clinician)'], tips:['Seek medical advice','Stay hydrated','Rest']},
      {name:'Strep Throat', keys:['Sore Throat','Fever'], medicine:['Penicillin','Amoxicillin'], tips:['Gargle salt water','Stay hydrated','Rest']},
      {name:'Gastritis', keys:['Abdominal Pain','Nausea','Vomiting'], medicine:['Antacids','Proton Pump Inhibitors'], tips:['Avoid spicy foods','Eat small meals','Limit alcohol']},
      {name:'COVID-19', keys:['Fever','Cough','Fatigue','Loss of Taste','Loss of Smell'], medicine:['Paracetamol','Hydration'], tips:['Isolate','Follow local guidelines','Monitor symptoms']},
      {name:'Allergy (Severe)', keys:['Itchy Eyes','Rash','Sneezing'], medicine:['Antihistamines'], tips:['Seek medical advice if severe']}
    ];
    const scores = symptoms.map(s => {
      for (const d of map){
        if (d.keys.includes(s)) return {name: d.name, score: 1, medicine: d.medicine, tips: d.tips};
      }
      return null;
    }).filter(x => x);
    // Aggregate by disease name
    const agg = {};
    scores.forEach(s => { if(!agg[s.name]) agg[s.name] = {name:s.name, score:0, medicine:s.medicine, tips:s.tips}; agg[s.name].score += 1; });
    const list = Object.values(agg).sort((a,b)=> b.score - a.score);
    // Return top results (up to 3)
    return list.length ? list.map(x => ({...x})) : [];
  }
});
