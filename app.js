/* ============================================================
   CoachPerso — suivi musculation & course à pied
   Stockage 100% local (localStorage). Plan adaptatif simple :
   après chaque séance loguée, les cibles de la séance suivante
   du même type sont ajustées selon la performance et le ressenti.
   ============================================================ */

const STORAGE_KEY = 'coachperso_state_v1';

/* ---------------- Catalogue d'exercices ----------------
   kind: 'weighted' | 'bodyweight' | 'bodyweight_hard' | 'core'
   tier (weighted only): 'heavy_compound' | 'medium_compound' | 'isolation_large' | 'isolation_small'
   sert à proposer une charge de départ réaliste selon le niveau, sans avoir
   à définir un poids exercice par exercice. */
const EXERCISES = [
  // Poitrine
  { id:'developpe_couche', name:'Développé couché barre', group:'Poitrine', kind:'weighted', tier:'heavy_compound' },
  { id:'developpe_couche_halteres', name:'Développé couché haltères', group:'Poitrine', kind:'weighted', tier:'medium_compound' },
  { id:'developpe_incline', name:'Développé incliné haltères', group:'Poitrine', kind:'weighted', tier:'medium_compound' },
  { id:'developpe_incline_barre', name:'Développé incliné barre', group:'Poitrine', kind:'weighted', tier:'medium_compound' },
  { id:'developpe_decline', name:'Développé décliné barre', group:'Poitrine', kind:'weighted', tier:'medium_compound' },
  { id:'ecarte_couche', name:'Écarté couché haltères', group:'Poitrine', kind:'weighted', tier:'isolation_small' },
  { id:'ecarte_poulie', name:'Écarté poulie vis-à-vis', group:'Poitrine', kind:'weighted', tier:'isolation_small' },
  { id:'pec_deck', name:'Pec deck / Butterfly', group:'Poitrine', kind:'weighted', tier:'isolation_small' },
  { id:'pullover', name:'Pull-over haltère', group:'Poitrine', kind:'weighted', tier:'isolation_large' },
  { id:'dips', name:'Dips (pectoraux)', group:'Poitrine', kind:'bodyweight_hard' },
  { id:'pompes', name:'Pompes', group:'Poitrine', kind:'bodyweight' },

  // Dos
  { id:'solevede_terre', name:'Soulevé de terre', group:'Dos', kind:'weighted', tier:'heavy_compound' },
  { id:'deadlift_roumain', name:'Soulevé de terre roumain', group:'Dos', kind:'weighted', tier:'heavy_compound' },
  { id:'deadlift_sumo', name:'Soulevé de terre sumo', group:'Dos', kind:'weighted', tier:'heavy_compound' },
  { id:'rowing_barre', name:'Rowing barre', group:'Dos', kind:'weighted', tier:'medium_compound' },
  { id:'rowing_haltere', name:'Rowing haltère unilatéral', group:'Dos', kind:'weighted', tier:'medium_compound' },
  { id:'rowing_tbar', name:'Rowing T-bar', group:'Dos', kind:'weighted', tier:'medium_compound' },
  { id:'rowing_poulie', name:'Rowing poulie basse', group:'Dos', kind:'weighted', tier:'medium_compound' },
  { id:'tirage_vertical', name:'Tirage vertical', group:'Dos', kind:'weighted', tier:'medium_compound' },
  { id:'tractions', name:'Tractions pronation', group:'Dos', kind:'bodyweight_hard' },
  { id:'tractions_supination', name:'Tractions supination', group:'Dos', kind:'bodyweight_hard' },
  { id:'tractions_neutres', name:'Tractions prise neutre', group:'Dos', kind:'bodyweight_hard' },
  { id:'hyperextension', name:'Hyperextensions lombaires', group:'Dos', kind:'bodyweight' },
  { id:'shrug_barre', name:'Shrugs barre', group:'Dos', kind:'weighted', tier:'isolation_large' },
  { id:'shrug_halteres', name:'Shrugs haltères', group:'Dos', kind:'weighted', tier:'isolation_large' },
  { id:'face_pull', name:'Face pull', group:'Dos', kind:'weighted', tier:'isolation_small' },
  { id:'good_morning', name:'Good morning', group:'Dos', kind:'weighted', tier:'medium_compound' },

  // Jambes
  { id:'squat', name:'Squat', group:'Jambes', kind:'weighted', tier:'heavy_compound' },
  { id:'squat_avant', name:'Squat avant (front squat)', group:'Jambes', kind:'weighted', tier:'heavy_compound' },
  { id:'squat_gobelet', name:'Squat gobelet', group:'Jambes', kind:'weighted', tier:'medium_compound' },
  { id:'squat_bulgare', name:'Squat bulgare', group:'Jambes', kind:'weighted', tier:'medium_compound' },
  { id:'presse_cuisses', name:'Presse à cuisses', group:'Jambes', kind:'weighted', tier:'heavy_compound' },
  { id:'fentes', name:'Fentes haltères', group:'Jambes', kind:'weighted', tier:'medium_compound' },
  { id:'fentes_marchees', name:'Fentes marchées', group:'Jambes', kind:'weighted', tier:'medium_compound' },
  { id:'souleve_jambes_tendues', name:'Soulevé de terre jambes tendues', group:'Jambes', kind:'weighted', tier:'heavy_compound' },
  { id:'leg_curl', name:'Leg curl', group:'Jambes', kind:'weighted', tier:'isolation_large' },
  { id:'extension_quadriceps', name:'Extension quadriceps', group:'Jambes', kind:'weighted', tier:'isolation_large' },
  { id:'hip_thrust', name:'Hip thrust', group:'Jambes', kind:'weighted', tier:'heavy_compound' },
  { id:'mollets_debout', name:'Mollets debout', group:'Jambes', kind:'weighted', tier:'isolation_large' },
  { id:'mollets_assis', name:'Mollets assis', group:'Jambes', kind:'weighted', tier:'isolation_large' },
  { id:'adducteurs', name:'Adducteurs (machine)', group:'Jambes', kind:'weighted', tier:'isolation_large' },
  { id:'abducteurs', name:'Abducteurs (machine)', group:'Jambes', kind:'weighted', tier:'isolation_large' },
  { id:'step_up', name:'Step-up', group:'Jambes', kind:'weighted', tier:'medium_compound' },
  { id:'fentes_bodyweight', name:'Fentes au poids du corps', group:'Jambes', kind:'bodyweight' },
  { id:'glute_bridge', name:'Glute bridge', group:'Jambes', kind:'bodyweight' },
  { id:'squat_saute', name:'Squat sauté', group:'Jambes', kind:'bodyweight' },

  // Épaules
  { id:'developpe_militaire', name:'Développé militaire barre', group:'Épaules', kind:'weighted', tier:'medium_compound' },
  { id:'ohp_halteres', name:'Développé militaire haltères', group:'Épaules', kind:'weighted', tier:'medium_compound' },
  { id:'arnold_press', name:'Développé Arnold', group:'Épaules', kind:'weighted', tier:'medium_compound' },
  { id:'elevations_laterales', name:'Élévations latérales haltères', group:'Épaules', kind:'weighted', tier:'isolation_small' },
  { id:'elevations_laterales_poulie', name:'Élévations latérales poulie', group:'Épaules', kind:'weighted', tier:'isolation_small' },
  { id:'elevations_frontales', name:'Élévations frontales', group:'Épaules', kind:'weighted', tier:'isolation_small' },
  { id:'oiseau', name:'Oiseau (rear delt fly)', group:'Épaules', kind:'weighted', tier:'isolation_small' },
  { id:'rowing_menton', name:'Rowing menton', group:'Épaules', kind:'weighted', tier:'isolation_large' },

  // Bras — Biceps
  { id:'curl_biceps', name:'Curl biceps barre', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'curl_biceps_halteres', name:'Curl biceps haltères', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'curl_marteau', name:'Curl marteau', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'curl_pupitre', name:'Curl pupitre', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'curl_concentre', name:'Curl concentré', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'curl_poulie', name:'Curl poulie', group:'Bras', kind:'weighted', tier:'isolation_small' },

  // Bras — Triceps
  { id:'extension_triceps', name:'Extension triceps poulie', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'extension_triceps_nuque', name:'Extension triceps nuque', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'barre_au_front', name:'Barre au front', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'triceps_dips_banc', name:'Dips triceps (banc)', group:'Bras', kind:'bodyweight' },
  { id:'triceps_kickback', name:'Kickback triceps', group:'Bras', kind:'weighted', tier:'isolation_small' },
  { id:'developpe_serre', name:'Développé couché prise serrée', group:'Bras', kind:'weighted', tier:'medium_compound' },

  // Abdos / Core
  { id:'gainage', name:'Gainage (planche)', group:'Abdos', kind:'core' },
  { id:'gainage_lateral', name:'Gainage latéral', group:'Abdos', kind:'core' },
  { id:'crunch', name:'Crunch', group:'Abdos', kind:'bodyweight' },
  { id:'crunch_cable', name:'Crunch câble', group:'Abdos', kind:'weighted', tier:'isolation_small' },
  { id:'releve_jambes_suspendu', name:'Relevé de jambes suspendu', group:'Abdos', kind:'bodyweight_hard' },
  { id:'releve_jambes_sol', name:'Relevé de jambes au sol', group:'Abdos', kind:'bodyweight' },
  { id:'russian_twist', name:'Russian twist', group:'Abdos', kind:'bodyweight' },
  { id:'ab_wheel', name:'Roulette abdos', group:'Abdos', kind:'bodyweight_hard' },
  { id:'crunch_inverse', name:'Crunch inversé', group:'Abdos', kind:'bodyweight' },

  // Fonctionnel
  { id:'kettlebell_swing', name:'Kettlebell swing', group:'Fonctionnel', kind:'weighted', tier:'isolation_large' },
  { id:'burpees', name:'Burpees', group:'Fonctionnel', kind:'bodyweight' },
  { id:'mountain_climbers', name:'Mountain climbers', group:'Fonctionnel', kind:'bodyweight' },
  { id:'box_jump', name:'Box jump', group:'Fonctionnel', kind:'bodyweight' },
];

/* Poids de départ (kg) par niveau et par "tier" de difficulté */
const TIER_START_WEIGHT = {
  debutant:      { heavy_compound:20, medium_compound:14, isolation_large:10, isolation_small:5 },
  intermediaire: { heavy_compound:50, medium_compound:28, isolation_large:20, isolation_small:10 },
  avance:        { heavy_compound:90, medium_compound:52, isolation_large:32, isolation_small:16 },
};
/* Répétitions de départ pour les exercices au poids du corps difficiles (tractions, dips...) */
const HARD_BW_REPS = { debutant:3, intermediaire:6, avance:10 };
/* Durée de gainage de départ (secondes) */
const CORE_SECONDS = { debutant:20, intermediaire:35, avance:50 };

const TEMPLATES = {
  fullbody: [
    ['squat','developpe_couche','rowing_barre','developpe_militaire','gainage'],
    ['solevede_terre','tractions','developpe_incline','fentes','crunch'],
  ],
  ppl: [
    ['developpe_couche','developpe_militaire','extension_triceps','elevations_laterales','dips'],
    ['tractions','rowing_barre','tirage_vertical','curl_biceps','gainage'],
    ['squat','presse_cuisses','fentes','leg_curl','extension_quadriceps'],
  ],
  upperlower: [
    ['developpe_couche','rowing_barre','developpe_militaire','curl_biceps','extension_triceps'],
    ['squat','fentes','leg_curl','extension_quadriceps','gainage'],
    ['developpe_incline','tractions','elevations_laterales','dips','crunch'],
    ['solevede_terre','presse_cuisses','extension_quadriceps','leg_curl','gainage'],
  ],
};
const TEMPLATE_LABELS = {
  fullbody:['Full Body A','Full Body B'],
  ppl:['Push','Pull','Legs'],
  upperlower:['Haut du corps A','Bas du corps A','Haut du corps B','Bas du corps B'],
};

const GOAL_SETS_REPS = {
  force:{ sets:4, reps:5 },
  prise_masse:{ sets:4, reps:8 },
  perte_poids:{ sets:3, reps:14 },
  general:{ sets:3, reps:10 },
};

/* ---------------- State / Storage ---------------- */
let state = loadState();

function defaultState(){
  return {
    settings: {
      onboarded:false,
      name:'',
      age:null,
      sex:'',
      heightCm:null,
      weightKg:null,
      hrMax:null,
      hrRest:null,
      level:'debutant',
      goal:'general',
      muscuDaysPerWeek:2,
      courseDaysPerWeek:1,
      runTargetDistance:5,
      templateKey:'fullbody',
    },
    exercises: EXERCISES.slice(),
    customExerciseIds: [],
    sessions: [],
    plan: [],
    cycleIndex: 0,
    runProgress: { targetDistance:2, targetPace:7.0 }, // pace en min/km décimal
    nutrition: {
      targets: { calories:2000, protein:120, carbs:220, fat:65 },
      customFoods: [],
      meals: [], // {id, date, mealType, items:[{foodId,name,qty,calories,protein,carbs,fat}]}
    },
    bodyLogs: [], // {id, date, weightKg, bodyFatPct, waist, chest, hips, arms, thighs, photo}
    sleepLogs: [], // {id, date, durationH, quality, soreness, energy, notes}
    gamification: { xp:0, streak:0, lastActiveDate:null, badges:[] },
  };
}

function mergeDeep(base, override){
  if(override==null) return base;
  if(Array.isArray(base) || typeof base!=='object'){
    return override;
  }
  const out = {...base};
  Object.keys(override).forEach(k=>{
    const bv = base[k], ov = override[k];
    const bothPlainObjects = bv && ov && typeof bv==='object' && typeof ov==='object' && !Array.isArray(bv) && !Array.isArray(ov);
    out[k] = bothPlainObjects ? mergeDeep(bv, ov) : ov;
  });
  return out;
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return mergeDeep(defaultState(), parsed);
  }catch(e){
    return defaultState();
  }
}
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

/* ---------------- Helpers ---------------- */
function exoById(id){ return state.exercises.find(e=>e.id===id); }
function fmtPace(paceDecimal){
  const min = Math.floor(paceDecimal);
  const sec = Math.round((paceDecimal-min)*60);
  return `${min}:${sec.toString().padStart(2,'0')}/km`;
}
function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
}
function startOfWeek(d=new Date()){
  const day = (d.getDay()+6)%7; // lundi=0
  const s = new Date(d); s.setHours(0,0,0,0); s.setDate(d.getDate()-day);
  return s;
}
function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 1800);
}

/* ============================================================
   PLAN — génération & adaptation
   ============================================================ */
function weightedTargetsFor(exerciseId){
  const goalCfg = GOAL_SETS_REPS[state.settings.goal] || GOAL_SETS_REPS.general;
  // dernière perf loguée pour cet exercice
  const past = state.sessions
    .filter(s=>s.type==='muscu')
    .flatMap(s=>s.exercises.filter(e=>e.exerciseId===exerciseId).map(e=>({...e, difficulty:s.difficulty, date:s.date})))
    .sort((a,b)=> new Date(b.date)-new Date(a.date));

  const exo = exoById(exerciseId);
  const level = state.settings.level;
  let weight = 0, reps = goalCfg.reps, sets = goalCfg.sets;

  if(exo.kind==='weighted'){
    weight = (TIER_START_WEIGHT[level] && TIER_START_WEIGHT[level][exo.tier]) || 20;
  } else if(exo.kind==='bodyweight_hard'){
    reps = HARD_BW_REPS[level] || 5;
  } else if(exo.kind==='core'){
    reps = CORE_SECONDS[level] || 30;
    sets = Math.min(sets, 3);
  }
  // sinon 'bodyweight' classique : on garde reps = goalCfg.reps

  if(past.length){
    const last = past[0];
    const targetReps = last.targetReps || reps;
    const achieved = (last.sets||[]).length ? (last.sets||[]).every(s=>(s.reps||0) >= targetReps) : false;
    if(exo.kind==='weighted'){
      weight = last.weightUsed ?? weight;
      if(achieved && last.difficulty<=3) weight = Math.round((weight+2.5)*2)/2;
      else if(!achieved || last.difficulty>=5) weight = Math.max(0, Math.round((weight-2.5)*2)/2);
      reps = targetReps;
    } else {
      reps = last.targetReps || reps;
      if(achieved && last.difficulty<=3) reps += (exo.kind==='core'?5:1);
      else if(!achieved || last.difficulty>=5) reps = Math.max(exo.kind==='core'?10:3, reps-1);
    }
  }
  return { sets, reps, weight, name: exo.name, exerciseId };
}

function buildMuscuSession(dayIndex){
  const key = state.settings.templateKey;
  const days = TEMPLATES[key];
  const labels = TEMPLATE_LABELS[key];
  const idx = dayIndex % days.length;
  const exerciseIds = days[idx];
  return {
    id: uid(),
    type:'muscu',
    status:'pending',
    label: labels[idx],
    exercises: exerciseIds.map(weightedTargetsFor),
  };
}

function buildCourseSession(){
  const rp = state.runProgress;
  return {
    id: uid(),
    type:'course',
    status:'pending',
    targetDistance: Math.round(rp.targetDistance*10)/10,
    targetPace: rp.targetPace,
  };
}

function ensurePlanFilled(){
  const pending = state.plan.filter(p=>p.status==='pending');
  const muscuRatio = state.settings.muscuDaysPerWeek;
  const courseRatio = state.settings.courseDaysPerWeek;
  const total = Math.max(1, muscuRatio+courseRatio);

  while(pending.length + state.plan.filter(p=>p.status==='pending').length < 0){ break; } // no-op guard

  while(state.plan.filter(p=>p.status==='pending').length < 4){
    // décide du type suivant selon ratio (répartition équilibrée façon "plus grand reste")
    const doneCounts = countTypesInQueueAndRecent();
    const nextType = pickNextType(doneCounts, muscuRatio, courseRatio);
    if(nextType==='muscu'){
      state.plan.push(buildMuscuSession(state.cycleIndex));
      state.cycleIndex++;
    } else {
      state.plan.push(buildCourseSession());
    }
  }
  saveState();
}

function countTypesInQueueAndRecent(){
  const queue = state.plan.filter(p=>p.status==='pending');
  return {
    muscu: queue.filter(p=>p.type==='muscu').length,
    course: queue.filter(p=>p.type==='course').length,
  };
}
function pickNextType(counts, muscuRatio, courseRatio){
  if(courseRatio<=0) return 'muscu';
  if(muscuRatio<=0) return 'course';
  const muscuShare = counts.muscu / muscuRatio;
  const courseShare = counts.course / courseRatio;
  return muscuShare <= courseShare ? 'muscu' : 'course';
}

function adaptRunProgress(logged){
  const target = logged.targetDistance || state.runProgress.targetDistance;
  const distRatio = logged.distance_km / target;
  const diff = logged.difficulty;
  let { targetDistance, targetPace } = state.runProgress;

  if(distRatio >= 0.95 && diff<=3){
    targetDistance = Math.round((target*1.1)*10)/10;
    if(logged.pace <= targetPace) targetPace = Math.max(3.5, targetPace - 1/6); // -10s/km
  } else if(diff>=4 || distRatio < 0.8){
    targetDistance = Math.max(1.5, Math.round((target*0.9)*10)/10);
    targetPace = targetPace + 1/6; // +10s/km plus facile
  }
  // rapprocher progressivement de l'objectif si en dessous
  const goalDist = state.settings.runTargetDistance;
  if(goalDist && targetDistance > goalDist) targetDistance = goalDist;
  state.runProgress = { targetDistance, targetPace };
}

/* ============================================================
   LOG — enregistrement d'une séance
   ============================================================ */
function completePlanItem(planId, sessionData){
  const item = state.plan.find(p=>p.id===planId);
  if(item) item.status='done';
  state.sessions.unshift(sessionData);
  if(sessionData.type==='course') adaptRunProgress(sessionData);
  saveState();
  ensurePlanFilled();
  awardXp(20);
}

function logFreeSession(sessionData){
  state.sessions.unshift(sessionData);
  if(sessionData.type==='course') adaptRunProgress(sessionData);
  saveState();
  awardXp(20);
}

/* ============================================================
   RENDER — Accueil
   ============================================================ */
function renderAccueil(){
  ensurePlanFilled();
  renderDashboardScores();
  renderWeekProgress();
  renderNextSession();
  renderUpcoming();
}

function renderWeekProgress(){
  const el = document.getElementById('weekProgress');
  const weekStart = startOfWeek();
  const doneThisWeek = state.sessions.filter(s=> new Date(s.date) >= weekStart).length;
  const goal = state.settings.muscuDaysPerWeek + state.settings.courseDaysPerWeek;
  const dots = Array.from({length:Math.max(goal,1)}, (_,i)=>
    `<span class="wp-dot ${i<doneThisWeek?'done':''}"></span>`).join('');
  el.innerHTML = `
    <div>
      <div class="wp-label">Cette semaine</div>
      <div class="wp-count">${doneThisWeek}/${goal} séances</div>
    </div>
    <div class="wp-dots">${dots}</div>
  `;
}

function renderNextSession(){
  const el = document.getElementById('nextSessionCard');
  const next = state.plan.find(p=>p.status==='pending');
  if(!next){
    el.innerHTML = `<div class="card empty-hero"><span class="eh-emoji">🎉</span>Aucune séance prévue.<br>Configure tes objectifs dans Réglages.</div>`;
    return;
  }
  if(next.type==='muscu'){
    const detail = next.exercises.map(e=>{
      const exo = exoById(e.exerciseId);
      const detailStr = exo.kind==='weighted' ? `${e.sets}×${e.reps} · ${e.weight}kg`
        : exo.kind==='core' ? `${e.sets}× ${e.reps}s`
        : `${e.sets}×${e.reps} reps`;
      return `${e.name} — ${detailStr}`;
    }).join('<br>');
    el.innerHTML = `
      <div class="hero-card muscu">
        <div class="hc-type">Musculation · ${next.label}</div>
        <div class="hc-title">Prochaine séance</div>
        <div class="hc-detail">${detail}</div>
        <button class="hc-btn" id="startSessionBtn">Commencer la séance</button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="hero-card course">
        <div class="hc-type">Course à pied</div>
        <div class="hc-title">Prochaine sortie</div>
        <div class="hc-detail">Distance cible : ${next.targetDistance} km<br>Allure cible : ${fmtPace(next.targetPace)}</div>
        <button class="hc-btn" id="startSessionBtn">Commencer la sortie</button>
      </div>`;
  }
  document.getElementById('startSessionBtn').onclick = ()=>{
    if(next.type==='muscu') openLogModal('muscu', next);
    else startCourseFlow(next);
  };
}

function renderUpcoming(){
  const el = document.getElementById('upcomingList');
  const rest = state.plan.filter(p=>p.status==='pending').slice(1,4);
  if(!rest.length){ el.innerHTML=''; return; }
  el.innerHTML = rest.map(p=>{
    if(p.type==='muscu'){
      return `<div class="upcoming-item">
        <div class="up-badge muscu">🏋️</div>
        <div class="up-main"><div class="up-title">Musculation · ${p.label}</div>
        <div class="up-sub">${p.exercises.length} exercices</div></div>
      </div>`;
    }
    return `<div class="upcoming-item">
      <div class="up-badge course">🏃</div>
      <div class="up-main"><div class="up-title">Course à pied</div>
      <div class="up-sub">${p.targetDistance} km · ${fmtPace(p.targetPace)}</div></div>
    </div>`;
  }).join('');
}

/* ============================================================
   RENDER — Historique
   ============================================================ */
let histFilter='all';
function renderHistorique(){
  const el = document.getElementById('historyList');
  const list = state.sessions.filter(s=> histFilter==='all' || s.type===histFilter);
  if(!list.length){
    el.innerHTML = `<div class="hist-empty">Aucune séance enregistrée pour l'instant.</div>`;
    return;
  }
  el.innerHTML = list.map(s=>{
    if(s.type==='muscu'){
      const detail = s.exercises.map(e=>{
        const exo = exoById(e.exerciseId);
        const setsStr = (e.sets||[]).map(st=> exo.kind==='core' ? `${st.reps}s` : `${st.reps}${exo.kind==='weighted'?`×${st.weight}kg`:''}`).join(', ');
        return `<div>${e.name}: ${setsStr||'—'}</div>`;
      }).join('');
      return `<div class="hist-item">
        <div class="hist-top">
          <div class="hist-title"><span class="hist-tag muscu">MUSCU</span>${s.label||''}</div>
          <div class="hist-date">${fmtDate(s.date)}</div>
        </div>
        <div class="hist-detail">${detail}Ressenti : ${'⭐'.repeat(s.difficulty)}</div>
      </div>`;
    }
    const extras = [];
    if(s.elevationGain_m) extras.push(`D+ ${s.elevationGain_m}m`);
    if(s.elevationLoss_m) extras.push(`D- ${s.elevationLoss_m}m`);
    if(s.avgHr) extras.push(`FC moy ${s.avgHr}bpm`);
    if(s.maxHr) extras.push(`FC max ${s.maxHr}bpm`);
    if(s.cadence_spm) extras.push(`${s.cadence_spm}spm`);
    if(s.calories) extras.push(`${s.calories}kcal`);
    const runTypeLabel = RUN_TYPES.find(t=>t.v===s.runType)?.l;
    return `<div class="hist-item">
      <div class="hist-top">
        <div class="hist-title"><span class="hist-tag course">${s.gpsTracked?'🛰️ COURSE':'COURSE'}</span>${s.title || (s.distance_km+' km')}</div>
        <div class="hist-date">${fmtDate(s.date)}</div>
      </div>
      <div class="hist-detail">
        ${s.distance_km} km · Durée : ${s.duration_min} min · Allure : ${fmtPace(s.pace)}${runTypeLabel? ' · '+runTypeLabel : ''}
        ${extras.length? '<br>'+extras.join(' · ') : ''}
        <br>Ressenti : ${'⭐'.repeat(s.difficulty)}
      </div>
    </div>`;
  }).join('');
}

/* ============================================================
   RENDER — Stats
   ============================================================ */
let statTab='volume';
function renderStats(){
  const el = document.getElementById('statsContent');
  if(statTab==='volume') el.innerHTML = statVolumeHtml();
  else if(statTab==='exo') el.innerHTML = statExoHtml();
  else if(statTab==='records') el.innerHTML = statRecordsHtml();
  else el.innerHTML = statCourseHtml();
  if(statTab==='exo') wireExoSelect();
}

function weeklyVolumes(){
  const byWeek = {};
  state.sessions.filter(s=>s.type==='muscu').forEach(s=>{
    const ws = startOfWeek(new Date(s.date)).toISOString().slice(0,10);
    let vol = 0;
    s.exercises.forEach(e=> (e.sets||[]).forEach(st=> vol += (st.reps||0)*(st.weight||1)));
    byWeek[ws] = (byWeek[ws]||0) + vol;
  });
  return Object.entries(byWeek).sort((a,b)=> a[0]<b[0]?-1:1).slice(-8);
}

function statVolumeHtml(){
  const data = weeklyVolumes();
  if(!data.length) return `<div class="stat-card"><div class="empty-stat">Pas encore de données. Enregistre une séance de musculation !</div></div>`;
  const max = Math.max(...data.map(d=>d[1]), 1);
  const w=320,h=140,bw = w/data.length;
  const bars = data.map(([wk,v],i)=>{
    const bh = (v/max)*(h-24);
    const x = i*bw + bw*0.2;
    return `<rect x="${x}" y="${h-bh-16}" width="${bw*0.6}" height="${bh}" rx="4" fill="var(--muscu)"></rect>
      <text class="bar-label" x="${x+bw*0.3}" y="${h-2}">${wk.slice(5)}</text>`;
  }).join('');
  return `<div class="stat-card">
    <div class="stat-title">Volume hebdomadaire (kg × reps)</div>
    <svg class="chart" viewBox="0 0 ${w} ${h}">${bars}</svg>
  </div>`;
}

function statExoHtml(){
  const weightedExos = state.exercises.filter(e=>e.kind==='weighted');
  const opts = weightedExos.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
  return `<div class="stat-card">
    <div class="stat-title">Progression par exercice</div>
    <select id="exoSelect" class="select-input">${opts}</select>
    <div id="exoChartWrap"></div>
  </div>`;
}
function wireExoSelect(){
  const sel = document.getElementById('exoSelect');
  const draw = ()=>{
    const id = sel.value;
    const points = state.sessions.filter(s=>s.type==='muscu')
      .flatMap(s=> s.exercises.filter(e=>e.exerciseId===id).map(e=>({
        date:s.date, max: Math.max(0,...(e.sets||[]).map(st=>st.weight||0))
      })))
      .sort((a,b)=> new Date(a.date)-new Date(b.date));
    document.getElementById('exoChartWrap').innerHTML = points.length ? lineChart(points.map(p=>p.max), points.map(p=>fmtDate(p.date)), 'var(--muscu)', 'kg') : `<div class="empty-stat">Pas encore de données pour cet exercice.</div>`;
  };
  sel.onchange = draw;
  draw();
}

function statCourseHtml(){
  const runs = state.sessions.filter(s=>s.type==='course').sort((a,b)=> new Date(a.date)-new Date(b.date));
  if(!runs.length) return `<div class="stat-card"><div class="empty-stat">Pas encore de course enregistrée.</div></div>`;
  const last5 = runs.slice(-10);
  const totalDist = runs.reduce((a,r)=>a+r.distance_km,0).toFixed(1);
  const bestPace = Math.min(...runs.map(r=>r.pace));
  const totalElev = runs.reduce((a,r)=>a+(r.elevationGain_m||0),0);
  const hrRuns = runs.filter(r=>r.avgHr);
  const avgHrAll = hrRuns.length ? Math.round(hrRuns.reduce((a,r)=>a+r.avgHr,0)/hrRuns.length) : null;
  return `<div class="stat-card">
    <div class="kpi-row">
      <div class="kpi"><div class="kv">${runs.length}</div><div class="kl">Sorties</div></div>
      <div class="kpi"><div class="kv">${totalDist}</div><div class="kl">km total</div></div>
      <div class="kpi"><div class="kv">${fmtPace(bestPace)}</div><div class="kl">Meilleure allure</div></div>
    </div>
    <div class="kpi-row">
      <div class="kpi"><div class="kv">${totalElev}m</div><div class="kl">D+ total</div></div>
      <div class="kpi"><div class="kv">${avgHrAll || '—'}</div><div class="kl">FC moy. (bpm)</div></div>
    </div>
  </div>
  <div class="stat-card">
    <div class="stat-title">Allure (min/km)</div>
    ${lineChart(last5.map(r=>r.pace), last5.map(r=>fmtDate(r.date)), 'var(--course)', '', true)}
  </div>
  <div class="stat-card">
    <div class="stat-title">Distance (km)</div>
    ${lineChart(last5.map(r=>r.distance_km), last5.map(r=>fmtDate(r.date)), 'var(--course)', 'km')}
  </div>`;
}

function lineChart(values, labels, color, unit='', invert=false){
  const w=320,h=140, pad=20;
  const min = Math.min(...values), max = Math.max(...values);
  const range = (max-min)||1;
  const stepX = values.length>1 ? (w-pad*2)/(values.length-1) : 0;
  const yFor = v=>{
    const norm = (v-min)/range;
    const n = invert ? norm : (1-norm);
    return pad + n*(h-pad*2-10);
  };
  const pts = values.map((v,i)=> [pad+i*stepX, yFor(v)]);
  const path = pts.map((p,i)=> (i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const dots = pts.map((p,i)=>`<circle class="chart-dot" cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${color}"></circle>`).join('');
  const labs = labels.map((l,i)=> i%Math.ceil(labels.length/6||1)===0 ? `<text class="chart-label" x="${pts[i][0]}" y="${h-2}" text-anchor="middle">${l}</text>` : '').join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">
    <line class="chart-axis" x1="${pad}" y1="${h-16}" x2="${w-pad}" y2="${h-16}"></line>
    <path class="chart-line" d="${path}" stroke="${color}"></path>
    ${dots}${labs}
  </svg>`;
}

/* ============================================================
   RENDER — Réglages
   ============================================================ */
function renderReglages(){
  const el = document.getElementById('reglagesContent');
  const s = state.settings;
  const g = state.gamification;
  const unlockedBadges = BADGES.filter(b=> g.badges.includes(b.id));
  el.innerHTML = `
    <div class="stat-card" style="text-align:center;">
      <div class="dash-label" style="margin-bottom:6px;">Niveau ${levelFromXp(g.xp)} · ${g.xp} XP · 🔥 ${g.streak}j de série</div>
      <div class="badge-grid">
        ${BADGES.map(b=>`<div class="badge-item ${unlockedBadges.includes(b)?'':'locked'}" title="${b.label}">${b.emoji}</div>`).join('')}
      </div>
    </div>

    <h3 class="section-title">Profil</h3>
    <div class="settings-group">
      <div class="settings-row"><div class="sr-label">Prénom</div><input type="text" id="setName" value="${s.name||''}" style="width:140px;"></div>
      <div class="settings-row"><div class="sr-label">Âge</div><input type="number" id="setAge" value="${s.age||''}"></div>
      <div class="settings-row">
        <div class="sr-label">Sexe</div>
        <select id="setSex">
          <option value="">—</option>
          <option value="femme" ${s.sex==='femme'?'selected':''}>Femme</option>
          <option value="homme" ${s.sex==='homme'?'selected':''}>Homme</option>
        </select>
      </div>
      <div class="settings-row"><div class="sr-label">Taille (cm)</div><input type="number" id="setHeight" value="${s.heightCm||''}"></div>
      <div class="settings-row"><div class="sr-label">Poids (kg)</div><input type="number" step="0.1" id="setWeight" value="${s.weightKg||''}"></div>
      <div class="settings-row"><div class="sr-label">FC max (bpm)</div><input type="number" id="setHrMax" value="${s.hrMax||''}"></div>
      <div class="settings-row"><div class="sr-label">FC repos (bpm)</div><input type="number" id="setHrRest" value="${s.hrRest||''}"></div>
    </div>

    <h3 class="section-title">Entraînement</h3>
    <div class="settings-group">
      <div class="settings-row">
        <div><div class="sr-label">Niveau</div></div>
        <select id="setLevel">
          <option value="debutant" ${s.level==='debutant'?'selected':''}>Débutant</option>
          <option value="intermediaire" ${s.level==='intermediaire'?'selected':''}>Intermédiaire</option>
          <option value="avance" ${s.level==='avance'?'selected':''}>Avancé</option>
        </select>
      </div>
      <div class="settings-row">
        <div><div class="sr-label">Objectif muscu</div></div>
        <select id="setGoal">
          <option value="force" ${s.goal==='force'?'selected':''}>Force</option>
          <option value="prise_masse" ${s.goal==='prise_masse'?'selected':''}>Prise de masse</option>
          <option value="perte_poids" ${s.goal==='perte_poids'?'selected':''}>Perte de poids</option>
          <option value="general" ${s.goal==='general'?'selected':''}>Forme générale</option>
        </select>
      </div>
      <div class="settings-row">
        <div><div class="sr-label">Séances muscu / semaine</div></div>
        <input type="number" id="setMuscuDays" min="0" max="6" value="${s.muscuDaysPerWeek}">
      </div>
      <div class="settings-row">
        <div><div class="sr-label">Séances course / semaine</div></div>
        <input type="number" id="setCourseDays" min="0" max="6" value="${s.courseDaysPerWeek}">
      </div>
      <div class="settings-row">
        <div><div class="sr-label">Objectif distance course</div><div class="sr-sub">km, à long terme</div></div>
        <input type="number" id="setRunTarget" min="1" max="100" value="${s.runTargetDistance}">
      </div>
    </div>

    <button class="btn" id="saveSettingsBtn">Enregistrer</button>

    <h3 class="section-title">Exercices personnalisés</h3>
    <div class="settings-group" style="padding:14px 16px;">
      <div class="exo-list" id="customExoList"></div>
      <div class="row2" style="margin-top:8px;">
        <div class="field" style="margin-bottom:0;"><input id="newExoName" placeholder="Nom de l'exercice"></div>
      </div>
      <button class="btn secondary" id="addExoBtn" style="margin-top:10px;">Ajouter un exercice</button>
    </div>

    <h3 class="section-title">Données</h3>
    <button class="btn danger" id="resetPlanBtn">Régénérer le plan</button>
    <button class="btn danger" id="resetAllBtn" style="margin-top:10px;">Réinitialiser toutes les données</button>
  `;

  renderCustomExoList();

  document.getElementById('saveSettingsBtn').onclick = ()=>{
    s.name = document.getElementById('setName').value.trim();
    s.age = parseInt(document.getElementById('setAge').value)||null;
    s.sex = document.getElementById('setSex').value;
    s.heightCm = parseFloat(document.getElementById('setHeight').value)||null;
    s.weightKg = parseFloat(document.getElementById('setWeight').value)||null;
    s.hrMax = parseInt(document.getElementById('setHrMax').value)||null;
    s.hrRest = parseInt(document.getElementById('setHrRest').value)||null;
    s.level = document.getElementById('setLevel').value;
    s.goal = document.getElementById('setGoal').value;
    s.muscuDaysPerWeek = parseInt(document.getElementById('setMuscuDays').value)||0;
    s.courseDaysPerWeek = parseInt(document.getElementById('setCourseDays').value)||0;
    s.runTargetDistance = parseFloat(document.getElementById('setRunTarget').value)||5;
    s.templateKey = s.muscuDaysPerWeek>=4 ? 'upperlower' : s.muscuDaysPerWeek===3 ? 'ppl' : 'fullbody';
    state.plan = state.plan.filter(p=>p.status!=='pending'); // regénère la file avec nouveaux réglages
    saveState();
    ensurePlanFilled();
    toast('Réglages enregistrés');
  };

  document.getElementById('addExoBtn').onclick = ()=>{
    const name = document.getElementById('newExoName').value.trim();
    if(!name) return;
    const id = 'custom_'+uid();
    state.exercises.push({ id, name, group:'Personnalisé', kind:'weighted' });
    state.customExerciseIds.push(id);
    saveState();
    document.getElementById('newExoName').value='';
    renderCustomExoList();
    toast('Exercice ajouté');
  };

  document.getElementById('resetPlanBtn').onclick = ()=>{
    state.plan = [];
    state.cycleIndex = 0;
    saveState();
    ensurePlanFilled();
    toast('Plan régénéré');
  };

  document.getElementById('resetAllBtn').onclick = ()=>{
    if(confirm('Supprimer définitivement toutes tes séances et réglages ?')){
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      saveState();
      location.reload();
    }
  };
}

function renderCustomExoList(){
  const el = document.getElementById('customExoList');
  if(!el) return;
  const custom = state.exercises.filter(e=> state.customExerciseIds.includes(e.id));
  el.innerHTML = custom.length ? custom.map(e=>`
    <div class="exo-tag-row">
      <span>${e.name}</span>
      <button class="remove-exo" data-id="${e.id}">Supprimer</button>
    </div>`).join('') : `<div class="sr-sub">Aucun exercice personnalisé.</div>`;
  el.querySelectorAll('.remove-exo').forEach(btn=>{
    btn.onclick = ()=>{
      const id = btn.dataset.id;
      state.exercises = state.exercises.filter(e=>e.id!==id);
      state.customExerciseIds = state.customExerciseIds.filter(x=>x!==id);
      saveState();
      renderCustomExoList();
    };
  });
}

/* ============================================================
   MODAL — Log de séance
   ============================================================ */
function openLogModal(type, planItem, gps){
  const root = document.getElementById('modalRoot');
  if(type==='muscu') root.innerHTML = muscuModalHtml(planItem);
  else root.innerHTML = courseModalHtml(planItem, gps);
  wireModal(type, planItem, gps);
  if(type==='course'){
    document.getElementById('toggleDetailsBtn').onclick = (e)=>{
      document.getElementById('extraDetails').classList.toggle('hidden');
      e.target.textContent = document.getElementById('extraDetails').classList.contains('hidden')
        ? '+ Plus de détails (D+/D-, FC, cadence, calories...)' : '– Masquer les détails';
    };
  }
}
function closeModal(){ document.getElementById('modalRoot').innerHTML=''; }

function exoBlockHtml(e){
  const exo = exoById(e.exerciseId);
  const unit = exo.kind==='core' ? 'sec' : 'reps';
  const setsCount = e.sets || 3;
  const setsHtml = Array.from({length:setsCount},(_,si)=>`
    <div class="set-row">
      <span class="set-idx">${si+1}</span>
      <input type="number" class="reps-input" placeholder="${unit}" value="${e.reps||''}">
      ${exo.kind==='weighted' ? `<input type="number" class="weight-input" placeholder="kg" value="${e.weight||''}">` : ''}
    </div>`).join('');
  return `<div class="exo-block" data-exercise-id="${e.exerciseId}" data-target-reps="${e.reps||''}">
    <div class="exo-block-head">
      <span class="exo-block-name">${e.name}</span>
      <button type="button" class="remove-exo-block" aria-label="Retirer">✕</button>
    </div>
    <div class="exo-target">Cible : ${e.sets||3}×${e.reps||''} ${exo.kind==='weighted'?(e.weight||'')+'kg':unit}</div>
    <div class="sets-wrap">${setsHtml}</div>
    <button type="button" class="add-set-btn">+ Ajouter une série</button>
  </div>`;
}

function muscuModalHtml(planItem){
  const exos = planItem ? planItem.exercises : defaultFreeMuscuExos();
  const blocks = exos.map(exoBlockHtml).join('');

  return `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">${planItem? 'Musculation · '+planItem.label : 'Séance libre'}</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      <div id="exoBlocksWrap">${blocks}</div>
      <button type="button" class="btn secondary" id="addExoToSessionBtn">+ Ajouter un exercice</button>
      <div class="field" style="margin-top:14px;">
        <label>Ressenti de la séance</label>
        <div class="rpe-row" id="rpeRow">
          ${[1,2,3,4,5].map(n=>`<button type="button" class="rpe-btn" data-v="${n}">${n}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Notes (optionnel)</label>
        <textarea id="notesInput" placeholder="Comment tu t'es senti·e..."></textarea>
      </div>
      <button class="btn" id="saveSessionBtn">Enregistrer la séance</button>
    </div>
  </div>`;
}

/* ---------------- Sélecteur d'exercices (catalogue complet) ---------------- */
function openExercisePicker(onSelect){
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  wrap.id = 'pickerOverlay';
  wrap.style.zIndex = 200;
  const groups = [...new Set(EXERCISES.map(e=>e.group))];
  wrap.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Choisir un exercice</div>
        <button class="modal-close" id="pickerCloseBtn">✕</button>
      </div>
      <div class="field"><input type="text" id="pickerSearch" placeholder="Rechercher un exercice..."></div>
      <div id="pickerList"></div>
    </div>`;
  document.body.appendChild(wrap);

  const renderList = (q='')=>{
    const norm = s=> s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const nq = norm(q);
    const list = document.getElementById('pickerList');
    const filtered = state.exercises.filter(e=> norm(e.name).includes(nq));
    if(!filtered.length){ list.innerHTML = `<div class="empty-stat">Aucun exercice trouvé.</div>`; return; }
    const byGroup = {};
    filtered.forEach(e=>{ (byGroup[e.group] = byGroup[e.group]||[]).push(e); });
    list.innerHTML = Object.entries(byGroup).map(([group, list])=>`
      <div class="picker-group">
        <div class="picker-group-label">${group}</div>
        ${list.map(e=>`<button type="button" class="picker-item" data-id="${e.id}">${e.name}</button>`).join('')}
      </div>`).join('');
    list.querySelectorAll('.picker-item').forEach(btn=>{
      btn.onclick = ()=>{ onSelect(btn.dataset.id); document.body.removeChild(wrap); };
    });
  };
  renderList();
  document.getElementById('pickerSearch').addEventListener('input', e=> renderList(e.target.value));
  document.getElementById('pickerCloseBtn').onclick = ()=> document.body.removeChild(wrap);
  wrap.addEventListener('click', e=>{ if(e.target===wrap) document.body.removeChild(wrap); });
}

function defaultFreeMuscuExos(){
  const key = state.settings.templateKey;
  return TEMPLATES[key][0].map(weightedTargetsFor);
}

const RUN_TYPES = [
  { v:'endurance', l:'Endurance fondamentale' },
  { v:'fractionne', l:'Fractionné' },
  { v:'tempo', l:'Tempo' },
  { v:'longue', l:'Sortie longue' },
  { v:'recuperation', l:'Récupération' },
  { v:'course', l:'Course / Race' },
];

function courseModalHtml(planItem, gps){
  const d = gps || {};
  const splitsHtml = (d.splits && d.splits.length) ? `
    <div class="field">
      <label>Splits</label>
      <div class="splits-list">
        ${d.splits.map(s=>`<div class="split-row"><span>Km ${s.km}</span><span>${fmtPace(s.pace)}</span></div>`).join('')}
      </div>
    </div>` : '';
  return `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">${d.gpsTracked? '🛰️ Course suivie en GPS' : 'Course à pied'}</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      ${planItem? `<div class="field"><label>Cible</label><div class="sr-sub">${planItem.targetDistance} km à ${fmtPace(planItem.targetPace)}</div></div>` : ''}
      <div class="field"><label>Titre (optionnel)</label><input type="text" id="titleInput" placeholder="Ex : Sortie au parc" value="${d.title||''}"></div>
      <div class="row2">
        <div class="field"><label>Distance (km)</label><input type="number" step="0.01" id="distInput" value="${d.distance_km ?? (planItem? planItem.targetDistance:'')}" ${d.gpsTracked?'readonly':''}></div>
        <div class="field"><label>Durée (min)</label><input type="number" step="1" id="durInput" value="${d.duration_min ?? ''}" ${d.gpsTracked?'readonly':''}></div>
      </div>
      <div class="field">
        <label>Type de séance</label>
        <select id="runTypeInput">${RUN_TYPES.map(t=>`<option value="${t.v}">${t.l}</option>`).join('')}</select>
      </div>
      ${splitsHtml}
      <div class="field">
        <label>Ressenti de la sortie</label>
        <div class="rpe-row" id="rpeRow">
          ${[1,2,3,4,5].map(n=>`<button type="button" class="rpe-btn" data-v="${n}">${n}</button>`).join('')}
        </div>
      </div>
      <button type="button" class="btn secondary" id="toggleDetailsBtn">+ Plus de détails (D+/D-, FC, cadence, calories...)</button>
      <div id="extraDetails" class="hidden">
        <div class="row2">
          <div class="field"><label>Dénivelé + (m)</label><input type="number" step="1" id="elevGainInput" value="${d.elevationGain_m ?? ''}"></div>
          <div class="field"><label>Dénivelé - (m)</label><input type="number" step="1" id="elevLossInput" value="${d.elevationLoss_m ?? ''}"></div>
        </div>
        <div class="row2">
          <div class="field"><label>FC moyenne (bpm)</label><input type="number" step="1" id="avgHrInput"></div>
          <div class="field"><label>FC max (bpm)</label><input type="number" step="1" id="maxHrInput"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Cadence (spm)</label><input type="number" step="1" id="cadenceInput"></div>
          <div class="field"><label>Calories</label><input type="number" step="1" id="caloriesInput"></div>
        </div>
      </div>
      <div class="field">
        <label>Notes (optionnel)</label>
        <textarea id="notesInput" placeholder="Météo, sensations...">${d.notes||''}</textarea>
      </div>
      <button class="btn" id="saveSessionBtn">Enregistrer la sortie</button>
    </div>
  </div>`;
}

function wireModal(type, planItem, gps){
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });

  let rpe = 0;
  document.getElementById('rpeRow').querySelectorAll('.rpe-btn').forEach(btn=>{
    btn.onclick = ()=>{
      rpe = parseInt(btn.dataset.v);
      document.querySelectorAll('.rpe-btn').forEach(b=>b.classList.toggle('on', b===btn));
    };
  });

  if(type==='muscu'){
    const exoBlocksWrap = document.getElementById('exoBlocksWrap');

    exoBlocksWrap.addEventListener('click', e=>{
      const addBtn = e.target.closest('.add-set-btn');
      if(addBtn){
        const block = addBtn.closest('.exo-block');
        const wrap = block.querySelector('.sets-wrap');
        const exo = exoById(block.dataset.exerciseId);
        const idx = wrap.children.length;
        const row = document.createElement('div');
        row.className='set-row';
        row.innerHTML = `<span class="set-idx">${idx+1}</span>
          <input type="number" class="reps-input" placeholder="${exo.kind==='core'?'sec':'reps'}">
          ${exo.kind==='weighted' ? `<input type="number" class="weight-input" placeholder="kg">` : ''}`;
        wrap.appendChild(row);
        return;
      }
      const removeBtn = e.target.closest('.remove-exo-block');
      if(removeBtn){
        removeBtn.closest('.exo-block').remove();
      }
    });

    document.getElementById('addExoToSessionBtn').onclick = ()=>{
      openExercisePicker(exerciseId=>{
        const target = weightedTargetsFor(exerciseId);
        exoBlocksWrap.insertAdjacentHTML('beforeend', exoBlockHtml(target));
      });
    };

    document.getElementById('saveSessionBtn').onclick = ()=>{
      const blocks = document.querySelectorAll('.exo-block');
      const exercises = [];
      blocks.forEach(block=>{
        const exerciseId = block.dataset.exerciseId;
        const exo = exoById(exerciseId);
        const targetReps = parseInt(block.dataset.targetReps)||0;
        const sets = [];
        block.querySelectorAll('.set-row').forEach(row=>{
          const reps = parseInt(row.querySelector('.reps-input').value);
          const weightInput = row.querySelector('.weight-input');
          const weight = weightInput ? parseFloat(weightInput.value) : undefined;
          if(!isNaN(reps) && reps>0) sets.push({ reps, weight: isNaN(weight)?0:weight });
        });
        const weightUsed = sets.length ? Math.max(...sets.map(s=>s.weight||0)) : undefined;
        exercises.push({ exerciseId, name: exo.name, sets, targetReps, weightUsed });
      });
      if(!exercises.some(e=>e.sets.length)){ toast('Ajoute au moins une série'); return; }
      const sessionData = {
        id: uid(), type:'muscu', date: new Date().toISOString(),
        label: planItem? planItem.label : 'Séance libre',
        exercises, difficulty: rpe||3,
        notes: document.getElementById('notesInput').value.trim(),
      };
      if(planItem) completePlanItem(planItem.id, sessionData);
      else logFreeSession(sessionData);
      closeModal();
      toast('Séance enregistrée 💪');
      refreshCurrentView();
    };
  } else {
    document.getElementById('saveSessionBtn').onclick = ()=>{
      const distance_km = parseFloat(document.getElementById('distInput').value);
      const duration_min = parseFloat(document.getElementById('durInput').value);
      if(!distance_km || !duration_min){ toast('Renseigne distance et durée'); return; }
      const pace = duration_min/distance_km;
      const numOrUndef = id=>{ const v = parseFloat(document.getElementById(id).value); return isNaN(v)? undefined : v; };
      const sessionData = {
        id: uid(), type:'course', date: new Date().toISOString(),
        title: document.getElementById('titleInput').value.trim(),
        distance_km, duration_min, pace,
        runType: document.getElementById('runTypeInput').value,
        elevationGain_m: numOrUndef('elevGainInput'),
        elevationLoss_m: numOrUndef('elevLossInput'),
        avgHr: numOrUndef('avgHrInput'),
        maxHr: numOrUndef('maxHrInput'),
        cadence_spm: numOrUndef('cadenceInput'),
        calories: numOrUndef('caloriesInput'),
        splits: gps ? gps.splits : undefined,
        route: gps ? gps.route : undefined,
        gpsTracked: !!(gps && gps.gpsTracked),
        targetDistance: planItem? planItem.targetDistance : undefined,
        difficulty: rpe||3,
        notes: document.getElementById('notesInput').value.trim(),
      };
      if(planItem) completePlanItem(planItem.id, sessionData);
      else logFreeSession(sessionData);
      closeModal();
      toast('Sortie enregistrée 🏃');
      refreshCurrentView();
    };
  }
}

function openFreeLogChooser(){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Nouvelle séance</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      <div class="ob-options">
        <button class="ob-option" id="chooseMuscu">🏋️ Musculation<span class="oo-sub">Enregistrer une séance libre</span></button>
        <button class="ob-option" id="chooseCourse">🏃 Course à pied<span class="oo-sub">Enregistrer une sortie libre</span></button>
        <button class="ob-option" id="chooseRepas">🥗 Repas<span class="oo-sub">Ajouter un aliment</span></button>
        <button class="ob-option" id="choosePesee">📏 Relevé corporel<span class="oo-sub">Poids, mensurations, photo</span></button>
        <button class="ob-option" id="chooseSommeil">😴 Sommeil<span class="oo-sub">Enregistrer une nuit</span></button>
      </div>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
  document.getElementById('chooseMuscu').onclick = ()=> openLogModal('muscu', null);
  document.getElementById('chooseCourse').onclick = ()=> startCourseFlow(null);
  document.getElementById('chooseRepas').onclick = ()=> openFoodLogModal('collation');
  document.getElementById('choosePesee').onclick = ()=> openBodyLogModal();
  document.getElementById('chooseSommeil').onclick = ()=> openSleepLogModal();
}

/* ---------------- Choix GPS / saisie manuelle pour une course ---------------- */
function startCourseFlow(planItem){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Course à pied</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      <div class="ob-options">
        <button class="ob-option" id="chooseGps">🛰️ Suivi GPS en direct<span class="oo-sub">L'app trace ta distance, ton allure et ton parcours pendant que tu cours</span></button>
        <button class="ob-option" id="chooseManual">✏️ Saisie manuelle<span class="oo-sub">Tu renseignes les stats toi-même après coup</span></button>
      </div>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
  document.getElementById('chooseGps').onclick = ()=> openRunTracker(planItem);
  document.getElementById('chooseManual').onclick = ()=> openLogModal('course', planItem);
}

/* ============================================================
   SUIVI GPS EN DIRECT
   Fonctionne uniquement au premier plan (limitation iOS PWA :
   pas de géolocalisation en arrière-plan pour une app à l'écran
   d'accueil). Nécessite un contexte sécurisé (https ou localhost).
   ============================================================ */
const GPS_ACCURACY_MAX_M = 30;
const MIN_POINT_DELTA_KM = 0.002;

function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

let tracker = null; // état du suivi GPS en cours

function trackerOverlayHtml(){
  return `<div class="tracker-overlay" id="trackerOverlay">
    <div class="tracker-top">
      <button class="modal-close" id="trackerCloseBtn">✕</button>
      <div class="tracker-status" id="trackerStatus">Recherche du signal GPS…</div>
      <div style="width:32px;"></div>
    </div>
    <div class="tracker-timer" id="trackerTimer">00:00</div>
    <div class="tracker-stats-grid">
      <div class="tracker-stat"><div class="ts-val" id="trackerDistance">0.00</div><div class="ts-label">km</div></div>
      <div class="tracker-stat"><div class="ts-val" id="trackerPace">--:--</div><div class="ts-label">allure moy. /km</div></div>
      <div class="tracker-stat"><div class="ts-val" id="trackerElev">0</div><div class="ts-label">m D+</div></div>
    </div>
    <svg class="tracker-route" id="trackerRouteSvg" viewBox="0 0 300 220"><polyline id="trackerRoutePath" points=""></polyline></svg>
    <div class="tracker-controls">
      <button class="tracker-btn secondary" id="trackerPauseBtn">⏸ Pause</button>
      <button class="tracker-btn stop" id="trackerStopBtn">⏹ Terminer</button>
    </div>
  </div>`;
}

function openRunTracker(planItem){
  if(!('geolocation' in navigator)){
    toast('Géolocalisation non disponible sur cet appareil');
    return;
  }
  document.getElementById('modalRoot').innerHTML='';
  const root = document.createElement('div');
  root.id = 'trackerRoot';
  root.innerHTML = trackerOverlayHtml();
  document.body.appendChild(root);

  tracker = {
    planItem,
    points: [], // {lat, lon, alt, tMs}
    route: [], // points échantillonnés pour stockage/tracé
    distanceKm: 0,
    elevGain: 0,
    elevLoss: 0,
    splits: [],
    startTime: Date.now(),
    pausedMs: 0,
    pausedAt: null,
    paused: false,
    watchId: null,
    wakeLock: null,
    timerHandle: null,
    lastRoutePush: 0,
  };

  tracker.timerHandle = setInterval(updateTrackerTimer, 1000);

  if('wakeLock' in navigator){
    navigator.wakeLock.request('screen').then(wl=> tracker.wakeLock = wl).catch(()=>{});
  }

  tracker.watchId = navigator.geolocation.watchPosition(onTrackerPosition, onTrackerError, {
    enableHighAccuracy: true, maximumAge: 1000, timeout: 15000,
  });

  document.getElementById('trackerCloseBtn').onclick = ()=>{
    if(confirm('Abandonner ce suivi ? Rien ne sera enregistré.')) stopTracker(true);
  };
  document.getElementById('trackerPauseBtn').onclick = toggleTrackerPause;
  document.getElementById('trackerStopBtn').onclick = ()=> finishTracker();
}

function updateTrackerTimer(){
  if(!tracker || tracker.paused) return;
  const elapsedMs = Date.now() - tracker.startTime - tracker.pausedMs;
  document.getElementById('trackerTimer').textContent = fmtElapsed(elapsedMs);
  const min = elapsedMs/60000;
  const pace = tracker.distanceKm>0.02 ? min/tracker.distanceKm : null;
  document.getElementById('trackerPace').textContent = pace ? fmtPace(pace).replace('/km','') : '--:--';
}

function fmtElapsed(ms){
  const totalSec = Math.floor(ms/1000);
  const h = Math.floor(totalSec/3600), m = Math.floor((totalSec%3600)/60), s = totalSec%60;
  return h>0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
}

function onTrackerError(err){
  if(!tracker) return;
  const msgs = { 1:'Accès à la position refusé — active la localisation dans Réglages Safari.', 2:'Position indisponible pour le moment.', 3:'Signal GPS trop lent.' };
  document.getElementById('trackerStatus').textContent = msgs[err.code] || 'Erreur GPS';
}

function onTrackerPosition(pos){
  if(!tracker || tracker.paused) return;
  const { latitude:lat, longitude:lon, altitude, accuracy } = pos.coords;
  const statusEl = document.getElementById('trackerStatus');

  if(accuracy != null && accuracy > GPS_ACCURACY_MAX_M){
    statusEl.textContent = `Signal GPS faible (±${Math.round(accuracy)}m)…`;
    return;
  }
  statusEl.textContent = '🟢 Suivi en cours';

  const prev = tracker.points[tracker.points.length-1];
  const point = { lat, lon, alt: altitude, tMs: Date.now()-tracker.startTime };

  if(prev){
    const d = haversineKm(prev.lat, prev.lon, lat, lon);
    if(d >= MIN_POINT_DELTA_KM){
      tracker.distanceKm += d;
      if(altitude!=null && prev.alt!=null){
        const diff = altitude - prev.alt;
        if(diff>0) tracker.elevGain += diff; else tracker.elevLoss += -diff;
      }
      tracker.points.push(point);
      maybePushRoutePoint(point);
      checkSplit();
      document.getElementById('trackerDistance').textContent = tracker.distanceKm.toFixed(2);
      document.getElementById('trackerElev').textContent = Math.round(tracker.elevGain);
      drawTrackerRoute();
    }
  } else {
    tracker.points.push(point);
    maybePushRoutePoint(point);
  }
}

function maybePushRoutePoint(point){
  const last = tracker.route[tracker.route.length-1];
  if(!last || point.tMs - tracker.lastRoutePush >= 3000){
    tracker.route.push(point);
    tracker.lastRoutePush = point.tMs;
  }
}

function checkSplit(){
  const nextKm = tracker.splits.length + 1;
  if(tracker.distanceKm >= nextKm){
    const elapsedMs = Date.now() - tracker.startTime - tracker.pausedMs;
    const prevSplitMs = tracker.splits.length ? tracker.splits[tracker.splits.length-1].elapsedMs : 0;
    const splitPace = (elapsedMs - prevSplitMs) / 60000;
    tracker.splits.push({ km: nextKm, elapsedMs, pace: splitPace });
  }
}

function drawTrackerRoute(){
  if(tracker.route.length < 2) return;
  const lats = tracker.route.map(p=>p.lat), lons = tracker.route.map(p=>p.lon);
  const lat0 = lats[0];
  const mPerLat = 110540, mPerLon = 111320*Math.cos(lat0*Math.PI/180);
  const xs = lons.map(lon=> (lon - lons[0]) * mPerLon);
  const ys = lats.map(lat=> -(lat - lat0) * mPerLat);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const spanX = Math.max(maxX-minX, 10), spanY = Math.max(maxY-minY, 10);
  const pad = 20, w = 300, h = 220;
  const scale = Math.min((w-pad*2)/spanX, (h-pad*2)/spanY);
  const offX = (w - spanX*scale)/2 - minX*scale;
  const offY = (h - spanY*scale)/2 - minY*scale;
  const pts = xs.map((x,i)=> `${(x*scale+offX).toFixed(1)},${(ys[i]*scale+offY).toFixed(1)}`).join(' ');
  document.getElementById('trackerRoutePath').setAttribute('points', pts);
}

function toggleTrackerPause(){
  if(!tracker) return;
  const btn = document.getElementById('trackerPauseBtn');
  if(tracker.paused){
    tracker.pausedMs += Date.now() - tracker.pausedAt;
    tracker.paused = false;
    btn.textContent = '⏸ Pause';
    document.getElementById('trackerStatus').textContent = '🟢 Suivi en cours';
  } else {
    tracker.pausedAt = Date.now();
    tracker.paused = true;
    btn.textContent = '▶ Reprendre';
    document.getElementById('trackerStatus').textContent = '⏸ En pause';
  }
}

function stopTracker(discard){
  if(!tracker) return;
  clearInterval(tracker.timerHandle);
  if(tracker.watchId!=null) navigator.geolocation.clearWatch(tracker.watchId);
  if(tracker.wakeLock) tracker.wakeLock.release().catch(()=>{});
  const root = document.getElementById('trackerRoot');
  if(root) root.remove();
  const result = discard ? null : {
    distanceKm: tracker.distanceKm,
    elapsedMs: Date.now() - tracker.startTime - tracker.pausedMs,
    elevGain: tracker.elevGain,
    elevLoss: tracker.elevLoss,
    splits: tracker.splits,
    route: tracker.route,
    planItem: tracker.planItem,
  };
  tracker = null;
  return result;
}

function finishTracker(){
  if(!tracker) return;
  if(tracker.distanceKm < 0.05){
    toast('Distance trop courte pour être enregistrée');
    return;
  }
  const planItem = tracker.planItem;
  const result = stopTracker(false);
  const durationMin = result.elapsedMs/60000;
  openLogModal('course', planItem, {
    distance_km: Math.round(result.distanceKm*100)/100,
    duration_min: Math.round(durationMin*10)/10,
    elevationGain_m: Math.round(result.elevGain),
    elevationLoss_m: Math.round(result.elevLoss),
    splits: result.splits.map(s=>({ km:s.km, pace: s.pace })),
    route: result.route.map(p=>({ lat:p.lat, lon:p.lon, alt:p.alt })),
    gpsTracked: true,
  });
}

/* ============================================================
   GAMIFICATION — XP, séries, badges
   ============================================================ */
const BADGES = [
  { id:'first_session', label:'Première séance', emoji:'🎬', check:s=> s.sessions.length>=1 },
  { id:'ten_sessions', label:'10 séances', emoji:'🔟', check:s=> s.sessions.length>=10 },
  { id:'fifty_sessions', label:'50 séances', emoji:'🏅', check:s=> s.sessions.length>=50 },
  { id:'streak_7', label:'Série de 7 jours', emoji:'🔥', check:s=> s.gamification.streak>=7 },
  { id:'streak_30', label:'Série de 30 jours', emoji:'⚡', check:s=> s.gamification.streak>=30 },
  { id:'ten_runs', label:'10 sorties course', emoji:'🏃', check:s=> s.sessions.filter(x=>x.type==='course').length>=10 },
  { id:'fifty_km', label:'50 km cumulés', emoji:'🗺️', check:s=> s.sessions.filter(x=>x.type==='course').reduce((a,x)=>a+x.distance_km,0)>=50 },
  { id:'hundred_km', label:'100 km cumulés', emoji:'🌍', check:s=> s.sessions.filter(x=>x.type==='course').reduce((a,x)=>a+x.distance_km,0)>=100 },
  { id:'thirty_muscu', label:'30 séances muscu', emoji:'💪', check:s=> s.sessions.filter(x=>x.type==='muscu').length>=30 },
  { id:'nutrition_track', label:'Premier repas suivi', emoji:'🥗', check:s=> s.nutrition.meals.length>=1 },
  { id:'sleep_week', label:'7 nuits suivies', emoji:'😴', check:s=> s.sleepLogs.length>=7 },
  { id:'body_tracker', label:'Premier relevé corporel', emoji:'📏', check:s=> s.bodyLogs.length>=1 },
];

function awardXp(amount){
  state.gamification.xp += amount;
  const today = new Date().toDateString();
  const last = state.gamification.lastActiveDate;
  if(last !== today){
    const yesterday = new Date(Date.now()-86400000).toDateString();
    state.gamification.streak = (last===yesterday) ? state.gamification.streak+1 : 1;
    state.gamification.lastActiveDate = today;
  }
  saveState();
  checkBadges();
}

function checkBadges(){
  const newly = [];
  BADGES.forEach(b=>{
    if(!state.gamification.badges.includes(b.id) && b.check(state)){
      state.gamification.badges.push(b.id);
      newly.push(b);
    }
  });
  if(newly.length){
    saveState();
    newly.forEach((b,i)=> setTimeout(()=> toast(`${b.emoji} Badge débloqué : ${b.label}`), i*1600));
  }
}

function xpForLevel(level){ return level*level*50; } // XP cumulé requis pour atteindre `level`
function levelFromXp(xp){
  let lvl = 1;
  while(xp >= xpForLevel(lvl+1)) lvl++;
  return lvl;
}

/* ============================================================
   ANALYTICS AVANCÉES — VMA/VO2max, records, charge d'entraînement
   ============================================================ */
function sessionLoad(s){
  if(s.type==='course') return (s.duration_min||0) * (s.difficulty||3);
  const totalSets = (s.exercises||[]).reduce((a,e)=> a + (e.sets? e.sets.length:0), 0);
  return totalSets * 3 * (s.difficulty||3);
}
function loadInWindow(days){
  const since = Date.now() - days*86400000;
  return state.sessions.filter(s=> new Date(s.date).getTime() >= since).reduce((a,s)=> a+sessionLoad(s), 0);
}
function acwr(){
  if(state.sessions.length < 4) return null;
  const oldest = state.sessions.reduce((a,s)=> Math.min(a, new Date(s.date).getTime()), Date.now());
  if(Date.now() - oldest < 13*86400000) return null; // trop peu d'historique pour un ratio fiable
  const acute = loadInWindow(7)/7;
  const chronic = loadInWindow(28)/28;
  if(chronic < 1) return null;
  return acute/chronic;
}
function acwrLabel(ratio){
  if(ratio==null) return { text:'Pas assez de données', cls:'' };
  if(ratio>1.5) return { text:'Charge élevée — risque accru', cls:'danger' };
  if(ratio>1.3) return { text:'Charge en hausse rapide', cls:'warn' };
  if(ratio<0.8) return { text:'Charge faible (récup/désentraînement)', cls:'' };
  return { text:'Charge équilibrée', cls:'good' };
}

function estimateVMA(){
  const cutoff = Date.now() - 60*86400000;
  const candidates = state.sessions.filter(s=> s.type==='course' && s.distance_km>=3 && new Date(s.date).getTime()>=cutoff);
  if(!candidates.length) return null;
  const best = candidates.reduce((a,b)=> a.pace<b.pace? a:b);
  const speedKmh = 60/best.pace;
  const vma = speedKmh/0.90;
  return { vma, vo2max: vma*3.5, basedOn: best };
}
function predictRaceTimeMin(distanceKm){
  const est = estimateVMA();
  if(!est) return null;
  const refDist = est.basedOn.distance_km, refTimeMin = est.basedOn.duration_min;
  return refTimeMin * Math.pow(distanceKm/refDist, 1.06);
}
function personalRecordsRun(){
  const buckets = [ {label:'5 km', min:4.5, max:5.5}, {label:'10 km', min:9, max:11}, {label:'Semi (21 km)', min:19, max:23}, {label:'Marathon (42 km)', min:39, max:45} ];
  return buckets.map(b=>{
    const matches = state.sessions.filter(s=> s.type==='course' && s.distance_km>=b.min && s.distance_km<=b.max);
    if(!matches.length) return { label:b.label, value:null };
    const best = matches.reduce((a,c)=> a.duration_min<c.duration_min? a:c);
    return { label:b.label, value: fmtElapsed(best.duration_min*60000), date:best.date };
  });
}
function personalRecordsMuscu(){
  const weighted = state.exercises.filter(e=>e.kind==='weighted');
  const prs = weighted.map(exo=>{
    const maxW = state.sessions.filter(s=>s.type==='muscu')
      .flatMap(s=> s.exercises.filter(e=>e.exerciseId===exo.id))
      .flatMap(e=> (e.sets||[]).map(st=>st.weight||0));
    return maxW.length ? { name:exo.name, weight:Math.max(...maxW) } : null;
  }).filter(Boolean).sort((a,b)=> b.weight-a.weight);
  return prs.slice(0,8);
}

function statRecordsHtml(){
  const vmaEst = estimateVMA();
  const runPRs = personalRecordsRun();
  const muscuPRs = personalRecordsMuscu();
  const ratio = acwr();
  const acwrInfo = acwrLabel(ratio);

  const vmaHtml = vmaEst ? `
    <div class="kpi-row">
      <div class="kpi"><div class="kv">${vmaEst.vma.toFixed(1)}</div><div class="kl">VMA est. (km/h)</div></div>
      <div class="kpi"><div class="kv">${Math.round(vmaEst.vo2max)}</div><div class="kl">VO2max est.</div></div>
    </div>
    <div class="sr-sub" style="margin-top:8px;">Basé sur ta meilleure sortie récente (${vmaEst.basedOn.distance_km} km à ${fmtPace(vmaEst.basedOn.pace)}). Estimation indicative, pas une mesure en laboratoire.</div>
  ` : `<div class="empty-stat">Fais au moins une course de 3 km pour estimer ta VMA.</div>`;

  const predHtml = vmaEst ? `
    <div class="splits-list">
      ${[5,10,21.1,42.2].map(d=>`<div class="split-row"><span>${d===21.1?'Semi':d===42.2?'Marathon':d+' km'}</span><span>${fmtElapsed(predictRaceTimeMin(d)*60000)}</span></div>`).join('')}
    </div>` : '';

  const runPrHtml = runPRs.map(p=> `<div class="split-row"><span>${p.label}</span><span>${p.value ? p.value : '—'}</span></div>`).join('');
  const muscuPrHtml = muscuPRs.length ? muscuPRs.map(p=>`<div class="split-row"><span>${p.name}</span><span>${p.weight} kg</span></div>`).join('') : `<div class="empty-stat">Pas encore de charge enregistrée.</div>`;

  return `
    <div class="stat-card">
      <div class="stat-title">VMA / VO2max estimés</div>
      ${vmaHtml}
    </div>
    ${predHtml ? `<div class="stat-card"><div class="stat-title">Temps de course prédits</div>${predHtml}</div>` : ''}
    <div class="stat-card">
      <div class="stat-title">Charge d'entraînement</div>
      <div class="acwr-badge ${acwrInfo.cls}">${ratio!=null? ratio.toFixed(2):'—'} · ${acwrInfo.text}</div>
      <div class="sr-sub" style="margin-top:8px;">Ratio charge aiguë (7j) / chronique (28j). Zone idéale : 0.8 – 1.3.</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Records personnels · Course</div>
      <div class="splits-list">${runPrHtml}</div>
    </div>
    <div class="stat-card">
      <div class="stat-title">Records personnels · Musculation</div>
      <div class="splits-list">${muscuPrHtml}</div>
    </div>`;
}

/* ============================================================
   NUTRITION
   ============================================================ */
const FOOD_DB = [
  { id:'poulet', name:'Blanc de poulet', cal:165, p:31, c:0, f:3.6 },
  { id:'boeuf_hache', name:'Bœuf haché 5%', cal:137, p:21, c:0, f:5 },
  { id:'saumon', name:'Saumon', cal:208, p:20, c:0, f:13 },
  { id:'thon', name:'Thon (nature)', cal:116, p:26, c:0, f:1 },
  { id:'oeuf', name:'Œuf', cal:155, p:13, c:1.1, f:11 },
  { id:'jambon_blanc', name:'Jambon blanc', cal:107, p:18, c:1, f:3 },
  { id:'dinde', name:'Blanc de dinde', cal:135, p:29, c:0, f:1.5 },
  { id:'porc', name:'Filet de porc', cal:143, p:26, c:0, f:4 },
  { id:'crevettes', name:'Crevettes', cal:99, p:24, c:0.2, f:0.3 },
  { id:'tofu', name:'Tofu', cal:76, p:8, c:1.9, f:4.8 },
  { id:'riz_blanc', name:'Riz blanc cuit', cal:130, p:2.7, c:28, f:0.3 },
  { id:'riz_complet', name:'Riz complet cuit', cal:123, p:2.7, c:26, f:1 },
  { id:'pates', name:'Pâtes cuites', cal:158, p:5.8, c:31, f:0.9 },
  { id:'quinoa', name:'Quinoa cuit', cal:120, p:4.4, c:21, f:1.9 },
  { id:'pomme_de_terre', name:'Pomme de terre', cal:87, p:1.9, c:20, f:0.1 },
  { id:'patate_douce', name:'Patate douce', cal:86, p:1.6, c:20, f:0.1 },
  { id:'pain_blanc', name:'Pain blanc', cal:265, p:9, c:49, f:3.2 },
  { id:'pain_complet', name:'Pain complet', cal:247, p:13, c:41, f:3.4 },
  { id:'flocons_avoine', name:"Flocons d'avoine", cal:389, p:17, c:66, f:7 },
  { id:'lentilles', name:'Lentilles cuites', cal:116, p:9, c:20, f:0.4 },
  { id:'pois_chiches', name:'Pois chiches cuits', cal:164, p:9, c:27, f:2.6 },
  { id:'haricots_rouges', name:'Haricots rouges cuits', cal:127, p:8.7, c:23, f:0.5 },
  { id:'pomme', name:'Pomme', cal:52, p:0.3, c:14, f:0.2 },
  { id:'banane', name:'Banane', cal:89, p:1.1, c:23, f:0.3 },
  { id:'orange', name:'Orange', cal:47, p:0.9, c:12, f:0.1 },
  { id:'fraises', name:'Fraises', cal:32, p:0.7, c:7.7, f:0.3 },
  { id:'myrtilles', name:'Myrtilles', cal:57, p:0.7, c:14, f:0.3 },
  { id:'raisin', name:'Raisin', cal:69, p:0.7, c:18, f:0.2 },
  { id:'avocat', name:'Avocat', cal:160, p:2, c:9, f:15 },
  { id:'brocoli', name:'Brocoli', cal:34, p:2.8, c:7, f:0.4 },
  { id:'epinards', name:'Épinards', cal:23, p:2.9, c:3.6, f:0.4 },
  { id:'carotte', name:'Carotte', cal:41, p:0.9, c:10, f:0.2 },
  { id:'tomate', name:'Tomate', cal:18, p:0.9, c:3.9, f:0.2 },
  { id:'courgette', name:'Courgette', cal:17, p:1.2, c:3.1, f:0.3 },
  { id:'salade', name:'Salade verte', cal:15, p:1.4, c:2.9, f:0.2 },
  { id:'concombre', name:'Concombre', cal:15, p:0.7, c:3.6, f:0.1 },
  { id:'poivron', name:'Poivron', cal:31, p:1, c:6, f:0.3 },
  { id:'champignons', name:'Champignons', cal:22, p:3.1, c:3.3, f:0.3 },
  { id:'lait_demi_ecreme', name:'Lait demi-écrémé', cal:46, p:3.3, c:4.8, f:1.6 },
  { id:'yaourt_nature', name:'Yaourt nature', cal:61, p:3.5, c:4.7, f:3.3 },
  { id:'yaourt_grec', name:'Yaourt grec', cal:97, p:9, c:3.6, f:5 },
  { id:'fromage_blanc', name:'Fromage blanc 0%', cal:47, p:8, c:3.5, f:0.2 },
  { id:'fromage', name:'Fromage (emmental)', cal:380, p:28, c:0.5, f:30 },
  { id:'beurre', name:'Beurre', cal:717, p:0.9, c:0.1, f:81 },
  { id:'huile_olive', name:"Huile d'olive", cal:884, p:0, c:0, f:100 },
  { id:'amandes', name:'Amandes', cal:579, p:21, c:22, f:50 },
  { id:'noix', name:'Noix', cal:654, p:15, c:14, f:65 },
  { id:'cacahuetes', name:'Cacahuètes', cal:567, p:26, c:16, f:49 },
  { id:'beurre_cacahuete', name:'Beurre de cacahuète', cal:588, p:25, c:20, f:50 },
  { id:'chocolat_noir', name:'Chocolat noir 70%', cal:598, p:7.8, c:46, f:43 },
  { id:'miel', name:'Miel', cal:304, p:0.3, c:82, f:0 },
  { id:'sucre', name:'Sucre', cal:387, p:0, c:100, f:0 },
  { id:'whey', name:'Whey protéine (poudre)', cal:380, p:75, c:8, f:5 },
  { id:'granola', name:'Granola', cal:471, p:10, c:64, f:20 },
  { id:'cereales', name:"Céréales petit-déj", cal:378, p:7, c:84, f:1.5 },
  { id:'houmous', name:'Houmous', cal:166, p:8, c:14, f:10 },
  { id:'olives', name:'Olives', cal:115, p:0.8, c:6, f:11 },
  { id:'pizza', name:'Pizza (margherita)', cal:266, p:11, c:33, f:10 },
  { id:'frites', name:'Frites', cal:312, p:3.4, c:41, f:15 },
  { id:'burger', name:'Burger', cal:295, p:17, c:24, f:14 },
  { id:'sushi', name:'Sushi (assortiment)', cal:150, p:6, c:28, f:1 },
  { id:'soupe_legumes', name:'Soupe de légumes', cal:35, p:1.5, c:6, f:0.5 },
  { id:'lait_amande', name:"Lait d'amande", cal:24, p:0.5, c:2.5, f:1.1 },
  { id:'jus_orange', name:"Jus d'orange", cal:45, p:0.7, c:10, f:0.2 },
  { id:'cafe', name:'Café noir', cal:2, p:0.3, c:0, f:0 },
  { id:'biere', name:'Bière', cal:43, p:0.5, c:3.6, f:0 },
  { id:'vin_rouge', name:'Vin rouge', cal:85, p:0.1, c:2.6, f:0 },
];
const MEAL_TYPES = [
  { v:'petit_dej', l:'Petit-déjeuner', emoji:'🥐' },
  { v:'dejeuner', l:'Déjeuner', emoji:'🍽️' },
  { v:'diner', l:'Dîner', emoji:'🌙' },
  { v:'collation', l:'Collation', emoji:'🍎' },
];

function todayStr(){ return new Date().toDateString(); }
function foodDbAll(){ return [...FOOD_DB, ...state.nutrition.customFoods]; }
function mealsForDate(dateStr){ return state.nutrition.meals.filter(m=> new Date(m.date).toDateString()===dateStr); }
function macroTotals(meals){
  return meals.reduce((a,m)=>({
    calories:a.calories+m.calories, protein:a.protein+m.protein, carbs:a.carbs+m.carbs, fat:a.fat+m.fat
  }), {calories:0,protein:0,carbs:0,fat:0});
}
function suggestNutritionTargets(){
  const s = state.settings;
  if(!s.weightKg || !s.heightCm || !s.age || !s.sex){
    toast('Renseigne ton profil (âge, sexe, taille, poids) dans Réglages');
    return null;
  }
  const bmr = 10*s.weightKg + 6.25*s.heightCm - 5*s.age + (s.sex==='homme'? 5 : -161);
  let tdee = bmr * 1.4;
  if(s.goal==='perte_poids') tdee -= 400;
  else if(s.goal==='prise_masse') tdee += 300;
  const calories = Math.round(tdee);
  const protein = Math.round(s.weightKg * 1.8);
  const fat = Math.round(calories*0.28/9);
  const carbs = Math.round((calories - protein*4 - fat*9)/4);
  return { calories, protein, carbs, fat:Math.max(0,fat) };
}

function macroBarHtml(label, value, target, color){
  const pct = target>0 ? Math.min(100, Math.round(value/target*100)) : 0;
  return `<div class="macro-bar">
    <div class="macro-bar-label"><span>${label}</span><span>${Math.round(value)} / ${target}${label==='Calories'?' kcal':'g'}</span></div>
    <div class="macro-bar-track"><div class="macro-bar-fill" style="width:${pct}%; background:${color};"></div></div>
  </div>`;
}

function renderNutrition(){
  const el = document.getElementById('santeContent');
  const meals = mealsForDate(todayStr());
  const totals = macroTotals(meals);
  const t = state.nutrition.targets;

  const mealsByType = MEAL_TYPES.map(mt=>{
    const items = meals.filter(m=>m.mealType===mt.v);
    return { ...mt, items };
  });

  const shopping = state.nutrition.shoppingList || [];

  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-title">Aujourd'hui</div>
      ${macroBarHtml('Calories', totals.calories, t.calories, 'var(--accent)')}
      ${macroBarHtml('Protéines', totals.protein, t.protein, 'var(--muscu)')}
      ${macroBarHtml('Glucides', totals.carbs, t.carbs, 'var(--course)')}
      ${macroBarHtml('Lipides', totals.fat, t.fat, '#e0a336')}
    </div>
    <button class="btn secondary" id="suggestTargetsBtn">Suggérer mes objectifs (selon profil)</button>

    <h3 class="section-title">Repas d'aujourd'hui</h3>
    ${mealsByType.map(mt=>`
      <div class="meal-group">
        <div class="meal-group-head">${mt.emoji} ${mt.l}</div>
        ${mt.items.length ? mt.items.map(it=>`
          <div class="meal-item" data-id="${it.id}">
            <span>${it.name} <span class="sr-sub">${it.qty}g</span></span>
            <span>${Math.round(it.calories)} kcal <button class="remove-exo-block remove-meal-btn" data-id="${it.id}">✕</button></span>
          </div>`).join('') : `<div class="sr-sub" style="padding:4px 0 10px;">Rien enregistré</div>`}
        <button type="button" class="add-set-btn add-food-btn" data-mealtype="${mt.v}">+ Ajouter un aliment</button>
      </div>`).join('')}

    <h3 class="section-title">Liste de courses</h3>
    <div class="settings-group" style="padding:10px 16px;">
      <div id="shoppingListWrap">${shoppingListHtml(shopping)}</div>
      <div class="row2" style="margin-top:10px;">
        <div class="field" style="margin-bottom:0; flex:2;"><input id="newShopItem" placeholder="Ajouter un article"></div>
        <button class="btn secondary" id="addShopItemBtn" style="margin-top:0; flex:1;">Ajouter</button>
      </div>
    </div>
  `;

  document.getElementById('suggestTargetsBtn').onclick = ()=>{
    const sug = suggestNutritionTargets();
    if(sug){ state.nutrition.targets = sug; saveState(); renderNutrition(); toast('Objectifs mis à jour'); }
  };
  el.querySelectorAll('.add-food-btn').forEach(btn=>{
    btn.onclick = ()=> openFoodLogModal(btn.dataset.mealtype);
  });
  el.querySelectorAll('.remove-meal-btn').forEach(btn=>{
    btn.onclick = ()=>{
      state.nutrition.meals = state.nutrition.meals.filter(m=>m.id!==btn.dataset.id);
      saveState();
      renderNutrition();
    };
  });
  document.getElementById('addShopItemBtn').onclick = ()=>{
    const input = document.getElementById('newShopItem');
    const name = input.value.trim();
    if(!name) return;
    state.nutrition.shoppingList = state.nutrition.shoppingList || [];
    state.nutrition.shoppingList.push({ id:uid(), name, checked:false });
    saveState();
    input.value='';
    document.getElementById('shoppingListWrap').innerHTML = shoppingListHtml(state.nutrition.shoppingList);
    wireShoppingList();
  };
  wireShoppingList();
}

function shoppingListHtml(list){
  if(!list.length) return `<div class="sr-sub">Liste vide.</div>`;
  return list.map(it=>`
    <div class="exo-tag-row">
      <label style="display:flex; align-items:center; gap:8px; ${it.checked?'opacity:.5; text-decoration:line-through;':''}">
        <input type="checkbox" class="shop-check" data-id="${it.id}" ${it.checked?'checked':''}> ${it.name}
      </label>
      <button class="remove-exo shop-remove" data-id="${it.id}">Supprimer</button>
    </div>`).join('');
}
function wireShoppingList(){
  document.querySelectorAll('.shop-check').forEach(cb=>{
    cb.onchange = ()=>{
      const item = state.nutrition.shoppingList.find(i=>i.id===cb.dataset.id);
      if(item){ item.checked = cb.checked; saveState(); renderNutrition(); }
    };
  });
  document.querySelectorAll('.shop-remove').forEach(btn=>{
    btn.onclick = ()=>{
      state.nutrition.shoppingList = state.nutrition.shoppingList.filter(i=>i.id!==btn.dataset.id);
      saveState();
      renderNutrition();
    };
  });
}

function openFoodLogModal(mealType){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Ajouter un aliment</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      <div class="field"><input type="text" id="foodSearch" placeholder="Rechercher un aliment..."></div>
      <div id="foodResults"></div>
      <div id="foodQtyWrap" class="hidden">
        <div class="exo-block" id="foodPreview"></div>
        <div class="field"><label>Quantité (g)</label><input type="number" id="foodQtyInput" value="100"></div>
        <button class="btn" id="confirmFoodBtn">Ajouter</button>
      </div>
      <button type="button" class="btn secondary" id="customFoodBtn" style="margin-top:14px;">Créer un aliment personnalisé</button>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });

  let selectedFood = null;
  const renderResults = (q='')=>{
    const norm = s=> s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const nq = norm(q);
    const list = foodDbAll().filter(f=> norm(f.name).includes(nq)).slice(0,25);
    document.getElementById('foodResults').innerHTML = list.map(f=>
      `<button type="button" class="picker-item" data-id="${f.id}">${f.name} <span class="sr-sub">${f.cal} kcal /100g</span></button>`).join('');
    document.querySelectorAll('#foodResults .picker-item').forEach(btn=>{
      btn.onclick = ()=>{
        selectedFood = foodDbAll().find(f=>f.id===btn.dataset.id);
        document.getElementById('foodQtyWrap').classList.remove('hidden');
        updatePreview();
      };
    });
  };
  const updatePreview = ()=>{
    if(!selectedFood) return;
    const qty = parseFloat(document.getElementById('foodQtyInput').value)||0;
    const ratio = qty/100;
    document.getElementById('foodPreview').innerHTML = `
      <div class="exo-block-name">${selectedFood.name} · ${qty}g</div>
      <div class="exo-target">${Math.round(selectedFood.cal*ratio)} kcal · P ${Math.round(selectedFood.p*ratio)}g · G ${Math.round(selectedFood.c*ratio)}g · L ${Math.round(selectedFood.f*ratio)}g</div>`;
  };
  renderResults();
  document.getElementById('foodSearch').addEventListener('input', e=> renderResults(e.target.value));
  document.getElementById('foodQtyInput').addEventListener('input', updatePreview);
  document.getElementById('confirmFoodBtn').onclick = ()=>{
    if(!selectedFood) return;
    const qty = parseFloat(document.getElementById('foodQtyInput').value)||0;
    const ratio = qty/100;
    state.nutrition.meals.push({
      id: uid(), date: new Date().toISOString(), mealType,
      foodId: selectedFood.id, name: selectedFood.name, qty,
      calories: selectedFood.cal*ratio, protein: selectedFood.p*ratio, carbs: selectedFood.c*ratio, fat: selectedFood.f*ratio,
    });
    saveState();
    awardXp(5);
    closeModal();
    toast('Aliment ajouté 🥗');
    renderNutrition();
  };
  document.getElementById('customFoodBtn').onclick = ()=>{
    root.innerHTML = `<div class="modal-overlay" id="overlay">
      <div class="modal-sheet">
        <div class="modal-header">
          <div class="modal-title">Aliment personnalisé</div>
          <button class="modal-close" id="closeModalBtn">✕</button>
        </div>
        <div class="field"><label>Nom</label><input type="text" id="cfName"></div>
        <div class="sr-sub" style="margin-bottom:10px;">Valeurs pour 100g</div>
        <div class="row2">
          <div class="field"><label>Calories</label><input type="number" id="cfCal"></div>
          <div class="field"><label>Protéines (g)</label><input type="number" id="cfP"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Glucides (g)</label><input type="number" id="cfC"></div>
          <div class="field"><label>Lipides (g)</label><input type="number" id="cfF"></div>
        </div>
        <button class="btn" id="saveCustomFoodBtn">Enregistrer l'aliment</button>
      </div>
    </div>`;
    document.getElementById('closeModalBtn').onclick = closeModal;
    document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
    document.getElementById('saveCustomFoodBtn').onclick = ()=>{
      const name = document.getElementById('cfName').value.trim();
      if(!name){ toast('Donne un nom à l\'aliment'); return; }
      const food = {
        id:'custom_'+uid(), name,
        cal: parseFloat(document.getElementById('cfCal').value)||0,
        p: parseFloat(document.getElementById('cfP').value)||0,
        c: parseFloat(document.getElementById('cfC').value)||0,
        f: parseFloat(document.getElementById('cfF').value)||0,
      };
      state.nutrition.customFoods.push(food);
      saveState();
      openFoodLogModal(mealType);
    };
  };
}

/* ============================================================
   SUIVI PHYSIQUE (CORPS)
   ============================================================ */
function computeBmi(weightKg, heightCm){
  if(!weightKg || !heightCm) return null;
  const h = heightCm/100;
  return weightKg/(h*h);
}

function renderCorps(){
  const el = document.getElementById('santeContent');
  const logs = [...state.bodyLogs].sort((a,b)=> new Date(b.date)-new Date(a.date));
  const last = logs[0];
  const bmi = last ? computeBmi(last.weightKg, state.settings.heightCm) : null;

  const weightSeries = [...state.bodyLogs].sort((a,b)=> new Date(a.date)-new Date(b.date)).filter(l=>l.weightKg);

  el.innerHTML = `
    <div class="stat-card">
      <div class="kpi-row">
        <div class="kpi"><div class="kv">${last&&last.weightKg? last.weightKg+' kg' : '—'}</div><div class="kl">Poids actuel</div></div>
        <div class="kpi"><div class="kv">${bmi? bmi.toFixed(1) : '—'}</div><div class="kl">IMC</div></div>
        <div class="kpi"><div class="kv">${last&&last.bodyFatPct? last.bodyFatPct+'%' : '—'}</div><div class="kl">Masse grasse</div></div>
      </div>
    </div>
    ${weightSeries.length>=2 ? `<div class="stat-card"><div class="stat-title">Évolution du poids (kg)</div>${lineChart(weightSeries.map(l=>l.weightKg), weightSeries.map(l=>fmtDate(l.date)), 'var(--accent)', 'kg')}</div>` : ''}
    <button class="btn" id="addBodyLogBtn">+ Nouveau relevé</button>
    <h3 class="section-title">Historique</h3>
    <div class="history-list">
      ${logs.length ? logs.map(l=>`
        <div class="hist-item">
          <div class="hist-top">
            <div class="hist-title">${l.weightKg? l.weightKg+' kg' : 'Relevé'}</div>
            <div class="hist-date">${fmtDate(l.date)}</div>
          </div>
          <div class="hist-detail">
            ${[
              l.bodyFatPct?`MG ${l.bodyFatPct}%`:null,
              l.waist?`Taille ${l.waist}cm`:null,
              l.chest?`Poitrine ${l.chest}cm`:null,
              l.hips?`Hanches ${l.hips}cm`:null,
              l.arms?`Bras ${l.arms}cm`:null,
              l.thighs?`Cuisses ${l.thighs}cm`:null,
            ].filter(Boolean).join(' · ') || 'Aucun détail'}
          </div>
          ${l.photo? `<img src="${l.photo}" class="body-photo-thumb">` : ''}
        </div>`).join('') : `<div class="hist-empty">Aucun relevé pour l'instant.</div>`}
    </div>
  `;
  document.getElementById('addBodyLogBtn').onclick = openBodyLogModal;
}

function compressImage(file, maxSize=500, quality=0.7){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=>{
        const scale = Math.min(1, maxSize/Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width*scale;
        canvas.height = img.height*scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function openBodyLogModal(){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Nouveau relevé corporel</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      <div class="row2">
        <div class="field"><label>Poids (kg)</label><input type="number" step="0.1" id="bwWeight" value="${state.settings.weightKg||''}"></div>
        <div class="field"><label>Masse grasse (%)</label><input type="number" step="0.1" id="bwFat"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Tour de taille (cm)</label><input type="number" id="bwWaist"></div>
        <div class="field"><label>Tour de poitrine (cm)</label><input type="number" id="bwChest"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Tour de hanches (cm)</label><input type="number" id="bwHips"></div>
        <div class="field"><label>Tour de bras (cm)</label><input type="number" id="bwArms"></div>
      </div>
      <div class="field"><label>Tour de cuisses (cm)</label><input type="number" id="bwThighs"></div>
      <div class="field"><label>Photo (optionnel)</label><input type="file" accept="image/*" id="bwPhoto"></div>
      <button class="btn" id="saveBodyLogBtn">Enregistrer</button>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
  document.getElementById('saveBodyLogBtn').onclick = async ()=>{
    const num = id=>{ const v = parseFloat(document.getElementById(id).value); return isNaN(v)?undefined:v; };
    let photo;
    const file = document.getElementById('bwPhoto').files[0];
    if(file){ try{ photo = await compressImage(file); }catch(e){} }
    const weightKg = num('bwWeight');
    if(!weightKg && !document.getElementById('bwFat').value && !photo){ toast('Renseigne au moins le poids'); return; }
    state.bodyLogs.push({
      id: uid(), date: new Date().toISOString(),
      weightKg, bodyFatPct: num('bwFat'), waist: num('bwWaist'), chest: num('bwChest'),
      hips: num('bwHips'), arms: num('bwArms'), thighs: num('bwThighs'), photo,
    });
    if(weightKg) state.settings.weightKg = weightKg;
    saveState();
    awardXp(10);
    closeModal();
    toast('Relevé enregistré 📏');
    refreshCurrentView();
  };
}

/* ============================================================
   SOMMEIL & RÉCUPÉRATION
   ============================================================ */
function computeRecoveryScore(){
  const logs = [...state.sleepLogs].sort((a,b)=> new Date(b.date)-new Date(a.date));
  const last = logs[0];
  let score = 70;
  if(last){
    score += (last.quality-3)*8;
    score += (last.durationH-7)*5;
    score -= (last.soreness-1)*6;
    score += (last.energy-3)*5;
  }
  const ratio = acwr();
  if(ratio!=null){
    if(ratio>1.5) score -= 20;
    else if(ratio>1.3) score -= 10;
    else if(ratio<0.8) score -= 5;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}
function recoveryLabel(score){
  if(score>=80) return { text:'Excellente forme', cls:'good' };
  if(score>=60) return { text:'Bonne récupération', cls:'good' };
  if(score>=40) return { text:'Récupération moyenne', cls:'warn' };
  return { text:'Fatigue élevée — repos conseillé', cls:'danger' };
}

function renderSommeil(){
  const el = document.getElementById('santeContent');
  const logs = [...state.sleepLogs].sort((a,b)=> new Date(b.date)-new Date(a.date));
  const score = computeRecoveryScore();
  const info = recoveryLabel(score);
  const series = [...state.sleepLogs].sort((a,b)=> new Date(a.date)-new Date(b.date)).slice(-10);

  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-title">Score de récupération</div>
      <div class="recovery-score ${info.cls}">${score}<span>/100</span></div>
      <div class="acwr-badge ${info.cls}">${info.text}</div>
    </div>
    ${series.length>=2 ? `<div class="stat-card"><div class="stat-title">Durée de sommeil (h)</div>${lineChart(series.map(l=>l.durationH), series.map(l=>fmtDate(l.date)), 'var(--muscu)', 'h')}</div>` : ''}
    <button class="btn" id="addSleepLogBtn">+ Enregistrer une nuit</button>
    <h3 class="section-title">Historique</h3>
    <div class="history-list">
      ${logs.length ? logs.map(l=>`
        <div class="hist-item">
          <div class="hist-top">
            <div class="hist-title">${l.durationH}h de sommeil</div>
            <div class="hist-date">${fmtDate(l.date)}</div>
          </div>
          <div class="hist-detail">Qualité ${'⭐'.repeat(l.quality)} · Courbatures ${'💥'.repeat(l.soreness)} · Énergie ${'⚡'.repeat(l.energy)}${l.notes? '<br>'+l.notes:''}</div>
        </div>`).join('') : `<div class="hist-empty">Aucune nuit enregistrée pour l'instant.</div>`}
    </div>
  `;
  document.getElementById('addSleepLogBtn').onclick = openSleepLogModal;
}

function ratingRowHtml(id, label){
  return `<div class="field">
    <label>${label}</label>
    <div class="rpe-row" id="${id}Row">${[1,2,3,4,5].map(n=>`<button type="button" class="rpe-btn" data-v="${n}">${n}</button>`).join('')}</div>
  </div>`;
}
function wireRatingRow(id, onChange){
  let val = 0;
  document.getElementById(id+'Row').querySelectorAll('.rpe-btn').forEach(btn=>{
    btn.onclick = ()=>{
      val = parseInt(btn.dataset.v);
      document.getElementById(id+'Row').querySelectorAll('.rpe-btn').forEach(b=>b.classList.toggle('on', b===btn));
      onChange(val);
    };
  });
  return ()=>val;
}

function openSleepLogModal(){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Enregistrer une nuit</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      <div class="field"><label>Durée de sommeil (h)</label><input type="number" step="0.1" id="slDuration" value="7.5"></div>
      ${ratingRowHtml('slQuality', 'Qualité du sommeil')}
      ${ratingRowHtml('slSoreness', 'Courbatures (1=aucune, 5=intenses)')}
      ${ratingRowHtml('slEnergy', "Niveau d'énergie")}
      <div class="field"><label>Notes (optionnel)</label><textarea id="slNotes"></textarea></div>
      <button class="btn" id="saveSleepBtn">Enregistrer</button>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
  const getQuality = wireRatingRow('slQuality', ()=>{});
  const getSoreness = wireRatingRow('slSoreness', ()=>{});
  const getEnergy = wireRatingRow('slEnergy', ()=>{});
  document.getElementById('saveSleepBtn').onclick = ()=>{
    const durationH = parseFloat(document.getElementById('slDuration').value)||0;
    const quality = getQuality()||3, soreness = getSoreness()||1, energy = getEnergy()||3;
    state.sleepLogs.push({
      id: uid(), date: new Date().toISOString(), durationH, quality, soreness, energy,
      notes: document.getElementById('slNotes').value.trim(),
    });
    saveState();
    awardXp(5);
    closeModal();
    toast('Nuit enregistrée 😴');
    refreshCurrentView();
  };
}

/* ============================================================
   DASHBOARD — cartes de score (Accueil)
   ============================================================ */
function renderDashboardScores(){
  const el = document.getElementById('dashboardScores');
  const recovery = computeRecoveryScore();
  const recInfo = recoveryLabel(recovery);
  const ratio = acwr();
  const totals = macroTotals(mealsForDate(todayStr()));
  const lastSleep = [...state.sleepLogs].sort((a,b)=> new Date(b.date)-new Date(a.date))[0];
  const xp = state.gamification.xp;
  const level = levelFromXp(xp);
  const xpIntoLevel = xp - xpForLevel(level);
  const xpForNext = xpForLevel(level+1) - xpForLevel(level);

  el.innerHTML = `
    <div class="dash-grid">
      <div class="dash-card ${recInfo.cls}">
        <div class="dash-val">${recovery}</div>
        <div class="dash-label">Récupération</div>
      </div>
      <div class="dash-card ${acwrLabel(ratio).cls}">
        <div class="dash-val">${ratio!=null? ratio.toFixed(1) : '—'}</div>
        <div class="dash-label">Charge (ACWR)</div>
      </div>
      <div class="dash-card">
        <div class="dash-val">${Math.round(totals.calories)}</div>
        <div class="dash-label">kcal aujourd'hui</div>
      </div>
      <div class="dash-card">
        <div class="dash-val">${lastSleep? lastSleep.durationH+'h' : '—'}</div>
        <div class="dash-label">Sommeil dernière nuit</div>
      </div>
    </div>
    <div class="xp-row">
      <div class="xp-level">Niveau ${level} 🔥 ${state.gamification.streak}j</div>
      <div class="xp-track"><div class="xp-fill" style="width:${Math.min(100, Math.round(xpIntoLevel/xpForNext*100))}%"></div></div>
    </div>
  `;
}

/* ============================================================
   ONBOARDING
   ============================================================ */
const OB_STEPS = [
  {
    key:'level', title:'Quel est ton niveau ?', sub:'Ça nous aide à proposer des charges de départ réalistes.',
    options:[
      {v:'debutant', l:'Débutant·e', s:'Moins de 6 mois de pratique'},
      {v:'intermediaire', l:'Intermédiaire', s:'6 mois à 2 ans'},
      {v:'avance', l:'Avancé·e', s:'Plus de 2 ans'},
    ]
  },
  {
    key:'goal', title:'Quel est ton objectif principal en muscu ?',
    options:[
      {v:'force', l:'Force', s:'Séries lourdes, peu de répétitions'},
      {v:'prise_masse', l:'Prise de masse', s:'Hypertrophie musculaire'},
      {v:'perte_poids', l:'Perte de poids', s:'Séries plus longues, plus de volume'},
      {v:'general', l:'Forme générale', s:'Équilibre force / endurance'},
    ]
  },
  {
    key:'muscuDaysPerWeek', title:'Combien de séances de muscu par semaine ?',
    options:[
      {v:1,l:'1 séance'},{v:2,l:'2 séances'},{v:3,l:'3 séances'},{v:4,l:'4 séances'},{v:5,l:'5 séances'},
    ]
  },
  {
    key:'courseDaysPerWeek', title:'Combien de sorties course par semaine ?',
    options:[
      {v:0,l:'Aucune'},{v:1,l:'1 sortie'},{v:2,l:'2 sorties'},{v:3,l:'3 sorties'},
    ]
  },
  {
    key:'runTargetDistance', title:'Ton objectif de distance en course ?', sub:'On ajustera ton plan progressivement vers cet objectif.',
    options:[
      {v:5,l:'5 km'},{v:10,l:'10 km'},{v:21,l:'Semi-marathon (21km)'},{v:42,l:'Marathon (42km)'},
    ]
  },
];

let obIndex=0, obAnswers={};
function startOnboarding(){
  obIndex=0; obAnswers={};
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="onboard-overlay" id="obOverlay">
    <div class="ob-progress" id="obProgress"></div>
    <div id="obStepsWrap"></div>
    <div class="ob-nav">
      <button class="btn secondary" id="obBack">Retour</button>
      <button class="btn" id="obNext">Continuer</button>
    </div>
  </div>`;
  renderObStep();
  document.getElementById('obBack').onclick = ()=>{ if(obIndex>0){ obIndex--; renderObStep(); } };
  document.getElementById('obNext').onclick = ()=>{
    const step = OB_STEPS[obIndex];
    if(obAnswers[step.key]===undefined){ toast('Choisis une option'); return; }
    if(obIndex < OB_STEPS.length-1){ obIndex++; renderObStep(); }
    else finishOnboarding();
  };
}
function renderObStep(){
  const step = OB_STEPS[obIndex];
  document.getElementById('obProgress').innerHTML = OB_STEPS.map((_,i)=>`<span class="${i<=obIndex?'on':''}"></span>`).join('');
  document.getElementById('obStepsWrap').innerHTML = `
    <div class="ob-step active">
      <div class="ob-title">${step.title}</div>
      ${step.sub?`<div class="ob-sub">${step.sub}</div>`:''}
      <div class="ob-options">
        ${step.options.map(o=>`<button type="button" class="ob-option ${obAnswers[step.key]===o.v?'on':''}" data-v="${o.v}">${o.l}${o.s?`<span class="oo-sub">${o.s}</span>`:''}</button>`).join('')}
      </div>
    </div>`;
  document.getElementById('obStepsWrap').querySelectorAll('.ob-option').forEach(btn=>{
    btn.onclick = ()=>{
      const raw = btn.dataset.v;
      obAnswers[step.key] = isNaN(raw) ? raw : parseFloat(raw);
      document.querySelectorAll('.ob-option').forEach(b=>b.classList.toggle('on', b===btn));
    };
  });
  document.getElementById('obBack').style.visibility = obIndex===0 ? 'hidden':'visible';
  document.getElementById('obNext').textContent = obIndex===OB_STEPS.length-1 ? 'C\'est parti !' : 'Continuer';
}
function finishOnboarding(){
  Object.assign(state.settings, obAnswers, { onboarded:true });
  state.settings.templateKey = state.settings.muscuDaysPerWeek>=4 ? 'upperlower' : state.settings.muscuDaysPerWeek===3 ? 'ppl' : 'fullbody';
  state.runProgress.targetDistance = Math.max(1.5, Math.round((state.settings.runTargetDistance*0.4)*10)/10);
  state.runProgress.targetPace = state.settings.level==='avance' ? 5.5 : state.settings.level==='intermediaire' ? 6.3 : 7.2;
  // le plan a pu être pré-rempli avec les réglages par défaut pendant que l'onboarding
  // était affiché par-dessus (rendu de fond) : on le régénère avec les vrais choix.
  state.plan = [];
  state.cycleIndex = 0;
  saveState();
  closeModal();
  ensurePlanFilled();
  renderAll();
  toast('Ton plan est prêt 🎉');
}

/* ============================================================
   NAVIGATION / INIT
   ============================================================ */
let currentView='accueil';
let entTab='historique';
let santeTab='nutrition';
const TITLES = { accueil:"Aujourd'hui", entrainement:'Entraînement', sante:'Santé', reglages:'Réglages' };

function switchView(view){
  currentView = view;
  document.querySelectorAll('.view').forEach(v=> v.classList.toggle('hidden', v.id!=='view-'+view));
  document.querySelectorAll('.navbtn').forEach(b=> b.classList.toggle('active', b.dataset.view===view));
  document.getElementById('topbarTitle').textContent = TITLES[view];
  refreshCurrentView();
}
function refreshCurrentView(){
  if(currentView==='accueil') renderAccueil();
  else if(currentView==='entrainement') renderEntrainement();
  else if(currentView==='sante') renderSante();
  else if(currentView==='reglages') renderReglages();
}
function renderAll(){ refreshCurrentView(); }

function renderEntrainement(){
  document.getElementById('entHistorique').classList.toggle('hidden', entTab!=='historique');
  document.getElementById('entStats').classList.toggle('hidden', entTab!=='stats');
  if(entTab==='historique') renderHistorique(); else renderStats();
}

function renderSante(){
  if(santeTab==='nutrition') renderNutrition();
  else if(santeTab==='corps') renderCorps();
  else renderSommeil();
}

function init(){
  if(window.__coachPersoInit) return;
  window.__coachPersoInit = true;
  document.querySelectorAll('.navbtn').forEach(btn=>{
    btn.onclick = ()=> switchView(btn.dataset.view);
  });
  document.getElementById('settingsBtn').onclick = ()=> switchView('reglages');
  document.getElementById('fabLog').onclick = openFreeLogChooser;

  document.getElementById('entrainementTabs').addEventListener('click', e=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    entTab = chip.dataset.etab;
    document.querySelectorAll('#entrainementTabs .chip').forEach(c=>c.classList.toggle('active', c===chip));
    renderEntrainement();
  });
  document.getElementById('histFilters').addEventListener('click', e=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    histFilter = chip.dataset.filter;
    document.querySelectorAll('#histFilters .chip').forEach(c=>c.classList.toggle('active', c===chip));
    renderHistorique();
  });
  document.getElementById('statsTabs').addEventListener('click', e=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    statTab = chip.dataset.stat;
    document.querySelectorAll('#statsTabs .chip').forEach(c=>c.classList.toggle('active', c===chip));
    renderStats();
  });
  document.getElementById('santeTabs').addEventListener('click', e=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    santeTab = chip.dataset.sante;
    document.querySelectorAll('#santeTabs .chip').forEach(c=>c.classList.toggle('active', c===chip));
    renderSante();
  });

  if(!state.settings.onboarded){
    startOnboarding();
  } else {
    ensurePlanFilled();
  }
  switchView('accueil');

  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
