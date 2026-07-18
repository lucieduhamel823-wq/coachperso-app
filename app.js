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
  { id:'developpe_couche', name:'Développé couché barre', nameEn:'Barbell Bench Press', group:'Poitrine', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Pectoraux'], secondaryMuscles:['Triceps','Épaules antérieures'] },
  { id:'developpe_couche_halteres', name:'Développé couché haltères', nameEn:'Dumbbell Bench Press', group:'Poitrine', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Pectoraux'], secondaryMuscles:['Triceps','Épaules antérieures'] },
  { id:'developpe_incline', name:'Développé incliné haltères', nameEn:'Incline Dumbbell Press', group:'Poitrine', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Pectoraux (haut)'], secondaryMuscles:['Épaules antérieures','Triceps'] },
  { id:'developpe_incline_barre', name:'Développé incliné barre', nameEn:'Incline Barbell Press', group:'Poitrine', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Pectoraux (haut)'], secondaryMuscles:['Épaules antérieures','Triceps'] },
  { id:'developpe_decline', name:'Développé décliné barre', nameEn:'Decline Barbell Press', group:'Poitrine', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Pectoraux (bas)'], secondaryMuscles:['Triceps'] },
  { id:'ecarte_couche', name:'Écarté couché haltères', nameEn:'Dumbbell Fly', group:'Poitrine', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Pectoraux'], secondaryMuscles:['Épaules antérieures'] },
  { id:'ecarte_poulie', name:'Écarté poulie vis-à-vis', nameEn:'Cable Crossover', group:'Poitrine', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'intermédiaire', primaryMuscles:['Pectoraux'], secondaryMuscles:['Épaules antérieures'] },
  { id:'pec_deck', name:'Pec deck / Butterfly', nameEn:'Pec Deck Machine', group:'Poitrine', kind:'weighted', tier:'isolation_small', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Pectoraux'], secondaryMuscles:[] },
  { id:'machine_convergente', name:'Machine convergente', nameEn:'Converging Chest Press Machine', group:'Poitrine', kind:'weighted', tier:'medium_compound', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Pectoraux'], secondaryMuscles:['Triceps'] },
  { id:'pullover', name:'Pull-over haltère', nameEn:'Dumbbell Pullover', group:'Poitrine', kind:'weighted', tier:'isolation_large', equipment:'Haltères', difficulty:'intermédiaire', primaryMuscles:['Pectoraux'], secondaryMuscles:['Dorsaux','Triceps'] },
  { id:'dips', name:'Dips (pectoraux)', nameEn:'Chest Dips', group:'Poitrine', kind:'bodyweight_hard', equipment:'Poids du corps', difficulty:'intermédiaire', primaryMuscles:['Pectoraux (bas)'], secondaryMuscles:['Triceps','Épaules antérieures'] },
  { id:'pompes', name:'Pompes', nameEn:'Push-Up', group:'Poitrine', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Pectoraux'], secondaryMuscles:['Triceps','Abdominaux'] },

  // Dos
  { id:'solevede_terre', name:'Soulevé de terre', nameEn:'Deadlift', group:'Dos', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'avancé', primaryMuscles:['Lombaires','Ischio-jambiers','Fessiers'], secondaryMuscles:['Dorsaux','Trapèzes','Avant-bras'] },
  { id:'deadlift_roumain', name:'Soulevé de terre roumain', nameEn:'Romanian Deadlift', group:'Dos', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Ischio-jambiers','Fessiers'], secondaryMuscles:['Lombaires'] },
  { id:'deadlift_sumo', name:'Soulevé de terre sumo', nameEn:'Sumo Deadlift', group:'Dos', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'avancé', primaryMuscles:['Fessiers','Ischio-jambiers'], secondaryMuscles:['Adducteurs','Lombaires'] },
  { id:'rowing_barre', name:'Rowing barre', nameEn:'Barbell Row', group:'Dos', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Dorsaux','Trapèzes'], secondaryMuscles:['Biceps','Lombaires'] },
  { id:'rowing_haltere', name:'Rowing haltère unilatéral', nameEn:'Single-Arm Dumbbell Row', group:'Dos', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Dorsaux'], secondaryMuscles:['Biceps','Trapèzes'] },
  { id:'rowing_tbar', name:'Rowing T-bar', nameEn:'T-Bar Row', group:'Dos', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Dorsaux'], secondaryMuscles:['Biceps','Trapèzes'] },
  { id:'rowing_poulie', name:'Rowing poulie basse', nameEn:'Seated Cable Row', group:'Dos', kind:'weighted', tier:'medium_compound', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Dorsaux'], secondaryMuscles:['Biceps','Trapèzes'] },
  { id:'tirage_vertical', name:'Tirage vertical', nameEn:'Lat Pulldown', group:'Dos', kind:'weighted', tier:'medium_compound', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Dorsaux'], secondaryMuscles:['Biceps'] },
  { id:'tractions', name:'Tractions pronation', nameEn:'Pull-Up', group:'Dos', kind:'bodyweight_hard', equipment:'Poids du corps', difficulty:'avancé', primaryMuscles:['Dorsaux'], secondaryMuscles:['Biceps','Trapèzes'] },
  { id:'tractions_supination', name:'Tractions supination', nameEn:'Chin-Up', group:'Dos', kind:'bodyweight_hard', equipment:'Poids du corps', difficulty:'avancé', primaryMuscles:['Dorsaux','Biceps'], secondaryMuscles:['Trapèzes'] },
  { id:'tractions_neutres', name:'Tractions prise neutre', nameEn:'Neutral-Grip Pull-Up', group:'Dos', kind:'bodyweight_hard', equipment:'Poids du corps', difficulty:'avancé', primaryMuscles:['Dorsaux'], secondaryMuscles:['Biceps','Avant-bras'] },
  { id:'hyperextension', name:'Hyperextensions lombaires', nameEn:'Back Extension', group:'Dos', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Lombaires'], secondaryMuscles:['Fessiers','Ischio-jambiers'] },
  { id:'shrug_barre', name:'Shrugs barre', nameEn:'Barbell Shrug', group:'Dos', kind:'weighted', tier:'isolation_large', equipment:'Barre', difficulty:'débutant', primaryMuscles:['Trapèzes'], secondaryMuscles:['Avant-bras'] },
  { id:'shrug_halteres', name:'Shrugs haltères', nameEn:'Dumbbell Shrug', group:'Dos', kind:'weighted', tier:'isolation_large', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Trapèzes'], secondaryMuscles:['Avant-bras'] },
  { id:'face_pull', name:'Face pull', nameEn:'Face Pull', group:'Dos', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Épaules postérieures'], secondaryMuscles:['Trapèzes','Dorsaux'] },
  { id:'good_morning', name:'Good morning', nameEn:'Good Morning', group:'Dos', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'avancé', primaryMuscles:['Lombaires','Ischio-jambiers'], secondaryMuscles:['Fessiers'] },

  // Jambes
  { id:'squat', name:'Squat', nameEn:'Back Squat', group:'Jambes', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Ischio-jambiers','Lombaires'] },
  { id:'squat_avant', name:'Squat avant (front squat)', nameEn:'Front Squat', group:'Jambes', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'avancé', primaryMuscles:['Quadriceps'], secondaryMuscles:['Fessiers','Abdominaux'] },
  { id:'squat_gobelet', name:'Squat gobelet', nameEn:'Goblet Squat', group:'Jambes', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Abdominaux'] },
  { id:'squat_bulgare', name:'Squat bulgare', nameEn:'Bulgarian Split Squat', group:'Jambes', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'intermédiaire', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'presse_cuisses', name:'Presse à cuisses', nameEn:'Leg Press', group:'Jambes', kind:'weighted', tier:'heavy_compound', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'fentes', name:'Fentes haltères', nameEn:'Dumbbell Lunge', group:'Jambes', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'fentes_marchees', name:'Fentes marchées', nameEn:'Walking Lunge', group:'Jambes', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'intermédiaire', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'souleve_jambes_tendues', name:'Soulevé de terre jambes tendues', nameEn:'Stiff-Leg Deadlift', group:'Jambes', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Ischio-jambiers'], secondaryMuscles:['Fessiers','Lombaires'] },
  { id:'leg_curl', name:'Leg curl', nameEn:'Leg Curl', group:'Jambes', kind:'weighted', tier:'isolation_large', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Ischio-jambiers'], secondaryMuscles:[] },
  { id:'extension_quadriceps', name:'Extension quadriceps', nameEn:'Leg Extension', group:'Jambes', kind:'weighted', tier:'isolation_large', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Quadriceps'], secondaryMuscles:[] },
  { id:'mollets_debout', name:'Mollets debout', nameEn:'Standing Calf Raise', group:'Jambes', kind:'weighted', tier:'isolation_large', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Mollets'], secondaryMuscles:[] },
  { id:'mollets_assis', name:'Mollets assis', nameEn:'Seated Calf Raise', group:'Jambes', kind:'weighted', tier:'isolation_large', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Mollets'], secondaryMuscles:[] },
  { id:'step_up', name:'Step-up', nameEn:'Step-Up', group:'Jambes', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'fentes_bodyweight', name:'Fentes au poids du corps', nameEn:'Bodyweight Lunge', group:'Jambes', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:[] },
  { id:'squat_saute', name:'Squat sauté', nameEn:'Jump Squat', group:'Jambes', kind:'bodyweight', equipment:'Poids du corps', difficulty:'intermédiaire', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Mollets'] },

  // Fessiers
  { id:'hip_thrust', name:'Hip Thrust', nameEn:'Barbell Hip Thrust', group:'Fessiers', kind:'weighted', tier:'heavy_compound', equipment:'Barre', difficulty:'débutant', primaryMuscles:['Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'glute_bridge', name:'Glute bridge', nameEn:'Glute Bridge', group:'Fessiers', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'abducteurs', name:'Abduction (machine)', nameEn:'Hip Abduction Machine', group:'Fessiers', kind:'weighted', tier:'isolation_large', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Fessiers (moyen)'], secondaryMuscles:[] },
  { id:'adducteurs', name:'Adduction (machine)', nameEn:'Hip Adduction Machine', group:'Fessiers', kind:'weighted', tier:'isolation_large', equipment:'Machine', difficulty:'débutant', primaryMuscles:['Adducteurs'], secondaryMuscles:[] },
  { id:'kickback_fessier', name:'Kickback fessier poulie', nameEn:'Cable Glute Kickback', group:'Fessiers', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Fessiers'], secondaryMuscles:['Ischio-jambiers'] },
  { id:'frog_pump', name:'Frog pump', nameEn:'Frog Pump', group:'Fessiers', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Fessiers'], secondaryMuscles:['Adducteurs'] },

  // Épaules
  { id:'developpe_militaire', name:'Développé militaire barre', nameEn:'Barbell Overhead Press', group:'Épaules', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Épaules'], secondaryMuscles:['Triceps','Trapèzes'] },
  { id:'ohp_halteres', name:'Développé militaire haltères', nameEn:'Dumbbell Shoulder Press', group:'Épaules', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Épaules'], secondaryMuscles:['Triceps'] },
  { id:'arnold_press', name:'Développé Arnold', nameEn:'Arnold Press', group:'Épaules', kind:'weighted', tier:'medium_compound', equipment:'Haltères', difficulty:'intermédiaire', primaryMuscles:['Épaules'], secondaryMuscles:['Triceps'] },
  { id:'elevations_laterales', name:'Élévations latérales haltères', nameEn:'Dumbbell Lateral Raise', group:'Épaules', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Épaules (moyen)'], secondaryMuscles:[] },
  { id:'elevations_laterales_poulie', name:'Élévations latérales poulie', nameEn:'Cable Lateral Raise', group:'Épaules', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Épaules (moyen)'], secondaryMuscles:[] },
  { id:'elevations_frontales', name:'Élévations frontales', nameEn:'Front Raise', group:'Épaules', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Épaules antérieures'], secondaryMuscles:[] },
  { id:'oiseau', name:'Oiseau (rear delt fly)', nameEn:'Rear Delt Fly', group:'Épaules', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Épaules postérieures'], secondaryMuscles:['Trapèzes'] },
  { id:'rowing_menton', name:'Rowing menton', nameEn:'Upright Row', group:'Épaules', kind:'weighted', tier:'isolation_large', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Épaules (moyen)','Trapèzes'], secondaryMuscles:['Biceps'] },

  // Bras — Biceps
  { id:'curl_biceps', name:'Curl biceps barre', nameEn:'Barbell Curl', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Barre', difficulty:'débutant', primaryMuscles:['Biceps'], secondaryMuscles:['Avant-bras'] },
  { id:'curl_biceps_halteres', name:'Curl biceps haltères', nameEn:'Dumbbell Curl', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Biceps'], secondaryMuscles:['Avant-bras'] },
  { id:'curl_marteau', name:'Curl marteau', nameEn:'Hammer Curl', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Biceps','Avant-bras'], secondaryMuscles:[] },
  { id:'curl_pupitre', name:'Curl pupitre', nameEn:'Preacher Curl', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Biceps'], secondaryMuscles:[] },
  { id:'curl_concentre', name:'Curl concentré', nameEn:'Concentration Curl', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Biceps'], secondaryMuscles:[] },
  { id:'curl_poulie', name:'Curl poulie', nameEn:'Cable Curl', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Biceps'], secondaryMuscles:[] },

  // Bras — Triceps
  { id:'extension_triceps', name:'Extension triceps poulie', nameEn:'Triceps Pushdown', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'débutant', primaryMuscles:['Triceps'], secondaryMuscles:[] },
  { id:'extension_triceps_nuque', name:'Extension triceps nuque', nameEn:'Overhead Triceps Extension', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Triceps'], secondaryMuscles:[] },
  { id:'barre_au_front', name:'Barre au front', nameEn:'Skull Crusher', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Triceps'], secondaryMuscles:[] },
  { id:'triceps_dips_banc', name:'Dips triceps (banc)', nameEn:'Bench Dips', group:'Bras', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Triceps'], secondaryMuscles:['Épaules antérieures'] },
  { id:'triceps_kickback', name:'Kickback triceps', nameEn:'Triceps Kickback', group:'Bras', kind:'weighted', tier:'isolation_small', equipment:'Haltères', difficulty:'débutant', primaryMuscles:['Triceps'], secondaryMuscles:[] },
  { id:'developpe_serre', name:'Développé couché prise serrée', nameEn:'Close-Grip Bench Press', group:'Bras', kind:'weighted', tier:'medium_compound', equipment:'Barre', difficulty:'intermédiaire', primaryMuscles:['Triceps'], secondaryMuscles:['Pectoraux'] },

  // Abdos / Core
  { id:'gainage', name:'Gainage (planche)', nameEn:'Plank', group:'Abdos', kind:'core', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Abdominaux'], secondaryMuscles:['Lombaires'] },
  { id:'gainage_lateral', name:'Gainage latéral', nameEn:'Side Plank', group:'Abdos', kind:'core', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Obliques'], secondaryMuscles:['Abdominaux'] },
  { id:'crunch', name:'Crunch', nameEn:'Crunch', group:'Abdos', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Abdominaux'], secondaryMuscles:[] },
  { id:'crunch_cable', name:'Crunch câble', nameEn:'Cable Crunch', group:'Abdos', kind:'weighted', tier:'isolation_small', equipment:'Poulie', difficulty:'intermédiaire', primaryMuscles:['Abdominaux'], secondaryMuscles:[] },
  { id:'releve_jambes_suspendu', name:'Relevé de jambes suspendu', nameEn:'Hanging Leg Raise', group:'Abdos', kind:'bodyweight_hard', equipment:'Poids du corps', difficulty:'avancé', primaryMuscles:['Abdominaux'], secondaryMuscles:['Fléchisseurs de hanche'] },
  { id:'releve_jambes_sol', name:'Relevé de jambes au sol', nameEn:'Lying Leg Raise', group:'Abdos', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Abdominaux'], secondaryMuscles:['Fléchisseurs de hanche'] },
  { id:'russian_twist', name:'Russian twist', nameEn:'Russian Twist', group:'Abdos', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Obliques'], secondaryMuscles:['Abdominaux'] },
  { id:'ab_wheel', name:'Roulette abdos', nameEn:'Ab Wheel Rollout', group:'Abdos', kind:'bodyweight_hard', equipment:'Roulette', difficulty:'avancé', primaryMuscles:['Abdominaux'], secondaryMuscles:['Lombaires'] },
  { id:'crunch_inverse', name:'Crunch inversé', nameEn:'Reverse Crunch', group:'Abdos', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Abdominaux (bas)'], secondaryMuscles:[] },

  // Fonctionnel
  { id:'kettlebell_swing', name:'Kettlebell swing', nameEn:'Kettlebell Swing', group:'Fonctionnel', kind:'weighted', tier:'isolation_large', equipment:'Kettlebell', difficulty:'intermédiaire', primaryMuscles:['Fessiers','Ischio-jambiers'], secondaryMuscles:['Lombaires','Épaules'] },
  { id:'burpees', name:'Burpees', nameEn:'Burpee', group:'Fonctionnel', kind:'bodyweight', equipment:'Poids du corps', difficulty:'intermédiaire', primaryMuscles:['Corps entier'], secondaryMuscles:['Pectoraux','Quadriceps'] },
  { id:'mountain_climbers', name:'Mountain climbers', nameEn:'Mountain Climbers', group:'Fonctionnel', kind:'bodyweight', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Abdominaux'], secondaryMuscles:['Épaules','Quadriceps'] },
  { id:'box_jump', name:'Box jump', nameEn:'Box Jump', group:'Fonctionnel', kind:'bodyweight', equipment:'Poids du corps', difficulty:'intermédiaire', primaryMuscles:['Quadriceps','Fessiers'], secondaryMuscles:['Mollets'] },

  // Mobilité
  { id:'etirement_hanches', name:'Étirement des hanches (pigeon)', nameEn:'Pigeon Stretch', group:'Mobilité', kind:'core', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Fléchisseurs de hanche'], secondaryMuscles:['Fessiers'] },
  { id:'mobilite_chevilles', name:'Mobilité chevilles', nameEn:'Ankle Mobility Drill', group:'Mobilité', kind:'core', equipment:'Poids du corps', difficulty:'débutant', primaryMuscles:['Mollets'], secondaryMuscles:[] },
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
    },
    exercises: EXERCISES.slice(),
    customExerciseIds: [],
    sessions: [],
    plan: [],
    runProgress: { targetDistance:2, targetPace:7.0 }, // pace en min/km décimal
    nutrition: {
      targets: { calories:2000, protein:120, carbs:220, fat:65 },
      customFoods: [],
      meals: [], // {id, date, mealType, items:[{foodId,name,qty,calories,protein,carbs,fat}]}
    },
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

/* ---------------- Fiches exercices : consignes, erreurs, variantes ---------------- */
const GROUP_EMOJI = { Poitrine:'💪', Dos:'🏋️', Jambes:'🦵', Fessiers:'🍑', Épaules:'🤸', Bras:'💪', Abdos:'🧘', Fonctionnel:'🔥', Mobilité:'🌊' };

const EXERCISE_DETAILS = {
  hip_thrust:{ instructions:["Épaules calées sur un banc, barre posée sur les hanches (coussin de protection recommandé).","Pieds à plat, tibias verticaux en haut de mouvement.","Pousse dans les talons et contracte les fessiers pour lever les hanches jusqu'à l'alignement épaules-hanches-genoux.","Marque une pause en haut, redescends contrôlé sans faire toucher les fesses au sol."], mistakes:["Hyperextension lombaire en haut de mouvement au lieu de finir par les fessiers.","Pieds trop proches ou trop loin, ce qui change l'angle de travail des fessiers.","Descente trop rapide qui casse la tension musculaire."] },
  solevede_terre:{ instructions:["Barre au sol contre les tibias, pieds largeur bassin.","Dos plat, poitrine haute, prise en pronation juste en dehors des jambes.","Pousse le sol avec les pieds en gardant la barre proche du corps, hanches et épaules montent ensemble.","Termine debout, hanches complètement tendues, sans hyperextension lombaire."], mistakes:["Dos qui s'arrondit (surtout en bas de mouvement).","Barre qui s'éloigne des tibias pendant la montée.","Hanches qui montent plus vite que les épaules ('bon matin' involontaire)."] },
  deadlift_roumain:{ instructions:["Barre tenue en pronation, jambes légèrement fléchies et fixes.","Pousse les hanches vers l'arrière en gardant le dos plat, barre proche des cuisses.","Descends jusqu'à sentir un étirement fort des ischio-jambiers (mi-tibia environ).","Reviens en poussant les hanches vers l'avant, contraction des fessiers en haut."], mistakes:["Plier trop les genoux, ce qui transforme le mouvement en soulevé de terre classique.","Arrondir le dos en fin de descente.","Descendre trop bas en perdant la tension des ischio-jambiers."] },
  deadlift_sumo:{ instructions:["Pieds très larges, pointes légèrement tournées vers l'extérieur, prise étroite entre les jambes.","Hanches plus basses qu'au soulevé classique, dos droit.","Pousse le sol vers l'extérieur avec les pieds en tirant la barre le long des jambes.","Verrouille hanches et genoux en même temps en haut."], mistakes:["Genoux qui rentrent vers l'intérieur pendant la traction.","Hanches qui montent avant les épaules.","Position des pieds trop étroite, perdant l'avantage du sumo."] },
  rowing_barre:{ instructions:["Buste penché à 45° environ, dos plat, genoux légèrement fléchis.","Barre tenue en pronation, bras tendus au départ.","Tire la barre vers le bas des abdominaux en amenant les coudes vers l'arrière.","Contracte les dorsaux en haut, redescends contrôlé sans arrondir le dos."], mistakes:["Utiliser l'élan du bas du dos pour tirer la charge.","Buste qui se redresse à chaque répétition.","Amplitude trop courte, la barre ne descend pas assez bas."] },
  rowing_haltere:{ instructions:["Un genou et une main au sol/banc, dos plat et parallèle au sol.","Haltère tenu bras tendu, tire vers la hanche en gardant le coude proche du corps.","Contracte le dos en haut de mouvement, évite de tourner le buste.","Redescends contrôlé jusqu'à l'extension complète du bras."], mistakes:["Rotation du buste pour aider à tirer la charge.","Coude qui s'écarte du corps, transformant le mouvement en élévation.","Dos qui s'arrondit par manque de gainage."] },
  tractions:{ instructions:["Suspension à la barre, prise pronation légèrement plus large que les épaules.","Démarre bras tendus, omoplates basses et engagées.","Tire le corps vers le haut jusqu'à ce que le menton dépasse la barre.","Redescends de façon contrôlée jusqu'à l'extension complète."], mistakes:["Balancement du corps (kipping non maîtrisé) pour compenser le manque de force.","Amplitude partielle, sans descendre bras tendus.","Épaules qui montent vers les oreilles au lieu de rester basses et engagées."] },
  machine_convergente:{ instructions:["Règle le siège pour que les poignées soient à hauteur du milieu de la poitrine.","Dos plaqué au dossier, poignées tenues fermement.","Pousse en amenant les mains vers l'avant et légèrement vers l'intérieur (mouvement convergent).","Reviens contrôlé sans laisser les charges revenir brutalement en arrière."], mistakes:["Décoller le dos du dossier pour ajouter de l'élan.","Verrouiller complètement les coudes de façon brutale à chaque répétition.","Réglage de siège inadapté qui déplace le travail vers les épaules."] },
  squat_gobelet:{ instructions:["Haltère tenu à deux mains contre la poitrine, coudes pointant vers le bas.","Pieds légèrement plus larges que les épaules, pointes légèrement ouvertes.","Descends en poussant les hanches vers l'arrière et les genoux vers l'extérieur, jusqu'à ce que les coudes touchent presque les genoux.","Remonte en poussant dans les talons, buste droit."], mistakes:["Talons qui décollent du sol en descente.","Dos qui s'arrondit en bas de mouvement.","Genoux qui rentrent vers l'intérieur à la remontée."] },
  squat:{ instructions:["Barre posée sur le haut du dos (trapèzes), pieds largeur épaules.","Inspire, gaine le tronc, descends en poussant les hanches vers l'arrière et les genoux vers l'extérieur.","Descends jusqu'à ce que les hanches passent sous le niveau des genoux (si mobilité suffisante).","Remonte en poussant fort dans les talons/le milieu du pied."], mistakes:["Genoux qui rentrent vers l'intérieur pendant la remontée (valgus).","Talons qui se soulèvent en bas de mouvement.","Dos qui s'arrondit sous la charge, surtout en bas d'amplitude."] },
  developpe_couche:{ instructions:["Allongé sur le banc, omoplates rétractées et basses, légère cambrure naturelle du dos.","Prise juste plus large que les épaules, barre au-dessus de la poitrine.","Descends la barre de façon contrôlée jusqu'à toucher légèrement le bas de la poitrine.","Pousse en gardant les omoplates serrées, jusqu'à l'extension complète des bras."], mistakes:["Rebond de la barre sur la poitrine pour créer de l'élan.","Coudes qui s'écartent à 90° du corps, stressant les épaules.","Fesses qui décollent du banc pendant la poussée."] },
  developpe_militaire:{ instructions:["Debout ou assis, barre au niveau des clavicules, prise juste plus large que les épaules.","Gaine le tronc et les fessiers avant de pousser.","Pousse la barre à la verticale en passant légèrement le visage vers l'arrière puis vers l'avant en haut.","Redescends contrôlé jusqu'aux clavicules."], mistakes:["Cambrure excessive du bas du dos pour compenser un manque de mobilité d'épaule.","Barre qui part vers l'avant au lieu de monter droit.","Utiliser les jambes (push press involontaire) sans le vouloir."] },
  presse_cuisses:{ instructions:["Dos et bassin plaqués au dossier, pieds écartés largeur épaules sur le plateau.","Descends le plateau en contrôlant, jusqu'à un angle de 90° de genou environ.","Ne verrouille jamais complètement les genoux en haut pour garder la tension.","Pousse dans le milieu du pied, pas seulement les orteils."], mistakes:["Bassin qui se décolle du dossier en bas de mouvement (amplitude excessive).","Verrouillage brutal et complet des genoux à chaque répétition.","Pieds trop bas sur le plateau, stressant excessivement les genoux."] },
  tirage_vertical:{ instructions:["Assis, cuisses bloquées, prise large en pronation.","Tire la barre vers le haut de la poitrine en amenant les coudes vers le bas et l'arrière.","Contracte les dorsaux en bas de mouvement, évite de te pencher trop en arrière.","Reviens contrôlé jusqu'à l'extension complète des bras."], mistakes:["Se pencher fortement en arrière pour utiliser l'élan du corps.","Tirer la barre derrière la nuque (risque pour les épaules).","Amplitude partielle sans étirement complet en haut."] },
  leg_curl:{ instructions:["Allongé ou assis selon la machine, coussin placé juste au-dessus des talons.","Fléchis les genoux en amenant les talons vers les fessiers.","Contracte les ischio-jambiers en fin de mouvement, sans décoller les hanches.","Reviens contrôlé jusqu'à l'extension complète."], mistakes:["Décoller les hanches du support pour aider le mouvement.","Aller trop vite et perdre le contrôle sur la phase de retour.","Amplitude trop courte."] },
  extension_quadriceps:{ instructions:["Assis, dos calé, tibias placés derrière le coussin juste au-dessus des chevilles.","Étends les jambes jusqu'à l'extension quasi complète des genoux.","Contracte les quadriceps en haut, sans verrouillage brutal.","Redescends contrôlé jusqu'à 90° de flexion."], mistakes:["Utiliser l'élan en remontant trop vite.","Décoller le dos du dossier.","Verrouillage violent et répété des genoux."] },
  glute_bridge:{ instructions:["Allongé au sol, genoux fléchis, pieds à plat proches des fessiers.","Pousse dans les talons pour lever les hanches jusqu'à l'alignement épaules-hanches-genoux.","Contracte fort les fessiers en haut, marque une pause.","Redescends contrôlé sans reposer complètement les hanches entre les répétitions."], mistakes:["Pousser avec le bas du dos plutôt qu'avec les fessiers.","Pieds trop éloignés des fessiers, réduisant l'amplitude utile.","Aller trop vite sans marquer la contraction en haut."] },
  fentes:{ instructions:["Debout, un haltère dans chaque main, buste droit.","Fais un grand pas vers l'avant, descends jusqu'à ce que le genou arrière frôle le sol.","Le genou avant reste aligné avec la cheville, pas au-delà des orteils.","Pousse dans le talon avant pour revenir à la position de départ."], mistakes:["Genou avant qui dépasse largement les orteils et part vers l'intérieur.","Pas trop court, ce qui limite l'engagement des fessiers.","Buste qui se penche excessivement vers l'avant."] },
  mollets_debout:{ instructions:["Debout, épaules sous les appuis de la machine, avant-pieds sur la plateforme.","Descends les talons le plus bas possible pour étirer les mollets.","Monte sur la pointe des pieds le plus haut possible.","Marque une pause en haut avant de redescendre contrôlé."], mistakes:["Amplitude trop courte, sans descente complète des talons.","Rebonds rapides sans contrôle de la phase descendante.","Genoux qui se plient pour tricher le mouvement."] },
  pompes:{ instructions:["Mains légèrement plus larges que les épaules, corps aligné tête-bassin-talons.","Gaine les abdominaux et les fessiers pour garder le corps droit.","Descends jusqu'à ce que la poitrine frôle le sol, coudes à environ 45° du corps.","Pousse pour revenir à l'extension complète des bras."], mistakes:["Bassin qui s'affaisse ou qui monte trop haut (corps non aligné).","Amplitude partielle sans descendre suffisamment.","Coudes complètement écartés à 90°, stressant les épaules."] },
  dips:{ instructions:["Suspendu aux barres parallèles, bras tendus, buste légèrement penché en avant pour cibler les pectoraux.","Descends en fléchissant les coudes jusqu'à sentir un étirement pectoral, coudes vers l'arrière.","Remonte en poussant, sans verrouiller brutalement les coudes.","Garde les épaules basses tout au long du mouvement."], mistakes:["Descendre trop bas si la mobilité d'épaule ne le permet pas (risque articulaire).","Buste trop droit, ce qui déplace le travail vers les triceps uniquement.","Épaules qui montent vers les oreilles."] },
  ohp_halteres:{ instructions:["Assis ou debout, haltères au niveau des épaules, paumes vers l'avant.","Gaine le tronc, pousse les haltères à la verticale au-dessus de la tête.","Évite de cambrer excessivement le bas du dos.","Redescends contrôlé jusqu'au niveau des épaules."], mistakes:["Cambrure lombaire excessive pour compenser un manque de force/mobilité.","Haltères qui partent vers l'avant au lieu de monter droit au-dessus de la tête.","Amplitude partielle sans descendre complètement."] },
  curl_biceps:{ instructions:["Debout, barre tenue en supination, coudes proches du corps.","Fléchis les coudes pour monter la barre vers les épaules, sans bouger les coudes.","Contracte le biceps en haut, sans hyperextension du poignet.","Redescends contrôlé jusqu'à l'extension complète des bras."], mistakes:["Utiliser le dos et les épaules pour créer de l'élan (tricher la charge).","Coudes qui avancent vers l'avant pendant la montée.","Amplitude partielle sans extension complète en bas."] },
  extension_triceps:{ instructions:["Face à la poulie haute, coudes fixés proches du corps.","Pousse la barre ou la corde vers le bas jusqu'à l'extension complète des coudes.","Garde les coudes immobiles, seul l'avant-bras bouge.","Reviens contrôlé jusqu'à environ 90° de flexion du coude."], mistakes:["Coudes qui s'écartent du corps ou qui bougent vers l'avant.","Utiliser le poids du corps ou les épaules pour aider le mouvement.","Amplitude trop courte."] },
  gainage:{ instructions:["Position de planche sur les avant-bras, coudes sous les épaules.","Corps aligné tête-bassin-talons, comme une planche rigide.","Contracte abdominaux et fessiers pour éviter que le bassin ne s'affaisse ou ne monte.","Respire normalement en maintenant la position."], mistakes:["Bassin qui s'affaisse vers le sol (cambrure lombaire).","Fessiers qui montent trop haut, réduisant le travail abdominal.","Tête qui tombe vers l'avant, tension inutile sur la nuque."] },
  kettlebell_swing:{ instructions:["Pieds largeur épaules, kettlebell tenu à deux mains devant les cuisses.","Bascule les hanches vers l'arrière (hip hinge), le kettlebell part entre les jambes.","Pousse fort les hanches vers l'avant pour projeter le kettlebell jusqu'à hauteur des épaules.","Laisse le kettlebell redescendre en contrôlant le mouvement, genoux légèrement fléchis."], mistakes:["Utiliser les bras et les épaules pour soulever le kettlebell au lieu des hanches.","Squatter au lieu de faire un hip hinge (trop de flexion de genoux).","Cambrure lombaire excessive en fin de mouvement."] },
  burpees:{ instructions:["Position debout, descends en squat et poses les mains au sol.","Envoie les jambes vers l'arrière pour atteindre la position de pompe, corps aligné.","Fais une pompe (optionnelle selon le niveau), puis ramène les jambes vers les mains.","Termine par un saut vertical, bras tendus au-dessus de la tête."], mistakes:["Bassin qui s'affaisse pendant la phase de planche/pompe.","Mouvement trop rapide qui sacrifie la qualité d'exécution.","Réception du saut mal contrôlée (genoux qui rentrent)."] },
};

function exoDetailSafe(exo){
  return Object.assign({ nameEn:'', equipment:'Personnalisé', difficulty:'—', primaryMuscles:[], secondaryMuscles:[] }, exo);
}
function genericInstructions(exo){
  if(exo.kind==='core') return [`Installe-toi en position de ${exo.name.toLowerCase()}, tronc gainé.`, "Contrôle la respiration, évite de bloquer complètement l'air.", "Maintiens une posture stable sans compenser avec le bas du dos.", "Termine la série dès que la qualité d'exécution se dégrade."];
  if(exo.kind==='bodyweight' || exo.kind==='bodyweight_hard') return [`Place le corps dans la position de départ du ${exo.name.toLowerCase()}, gainage actif.`, "Exécute le mouvement de façon contrôlée sur toute l'amplitude disponible.", "Évite les à-coups ou l'élan pour compenser le manque de force.", "Reviens à la position de départ sans relâcher le gainage."];
  const muscles = exo.primaryMuscles.length ? exo.primaryMuscles.join(', ').toLowerCase() : 'la zone ciblée';
  return [`Installe-toi avec un ${exo.equipment.toLowerCase()} adapté à ton niveau.`, "Réalise le mouvement sur toute l'amplitude, de façon contrôlée à la montée comme à la descente.", `Concentre le travail sur : ${muscles}.`, "Termine la série avant que la technique ne se dégrade."];
}
function genericMistakes(exo){
  return ["Charge trop lourde qui dégrade l'amplitude ou la technique.", "Mouvement trop rapide qui réduit le contrôle musculaire.", "Compensation par le bas du dos ou d'autres muscles non ciblés."];
}
function exerciseVariants(exo){
  if(!exo.primaryMuscles.length) return [];
  return EXERCISES.filter(e=> e.id!==exo.id && e.group===exo.group && e.primaryMuscles.some(m=>exo.primaryMuscles.includes(m))).slice(0,4);
}
function exerciseAlternatives(exo){
  if(!exo.primaryMuscles.length) return [];
  const variantIds = exerciseVariants(exo).map(e=>e.id);
  return EXERCISES.filter(e=> e.id!==exo.id && !variantIds.includes(e.id) && e.equipment!==exo.equipment && e.primaryMuscles.some(m=>exo.primaryMuscles.includes(m))).slice(0,4);
}
function youtubeSearchUrl(exo){
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(exo.name+' '+exo.nameEn+' technique exécution')}`;
}
function exerciseMatchesQuery(e, nq, norm){
  const primary = e.primaryMuscles||[], secondary = e.secondaryMuscles||[];
  return norm(e.name).includes(nq) || norm(e.nameEn||'').includes(nq) || norm(e.group).includes(nq)
    || norm(e.equipment||'').includes(nq) || norm(e.difficulty||'').includes(nq)
    || primary.some(m=>norm(m).includes(nq)) || secondary.some(m=>norm(m).includes(nq));
}

function exerciseDetailHtml(rawExo){
  const exo = exoDetailSafe(rawExo);
  const details = EXERCISE_DETAILS[exo.id];
  const instructions = details ? details.instructions : genericInstructions(exo);
  const mistakes = details ? details.mistakes : genericMistakes(exo);
  const variants = exerciseVariants(exo);
  const alternatives = exerciseAlternatives(exo);
  const chipsHtml = (list)=> list.length ? list.map(e=>`<button type="button" class="chip exo-chip-link" data-id="${e.id}">${e.name}</button>`).join('') : `<span class="sr-sub">Aucune trouvée.</span>`;
  return `
    <div class="exo-detail">
      <div class="exo-detail-hero">
        <span class="exo-detail-emoji">${GROUP_EMOJI[exo.group]||'🏋️'}</span>
        <div>
          <div class="exo-detail-name">${exo.name}</div>
          <div class="exo-detail-nameEn">${exo.nameEn}</div>
        </div>
      </div>
      <div class="exo-detail-tags">
        <span class="chip">${exo.group}</span>
        <span class="chip">${exo.equipment}</span>
        <span class="chip">${exo.difficulty}</span>
      </div>
      <div class="exo-detail-section">
        <div class="stat-title">Muscles</div>
        <div class="sr-sub"><b>Principaux :</b> ${exo.primaryMuscles.join(', ')}</div>
        ${exo.secondaryMuscles.length ? `<div class="sr-sub"><b>Secondaires :</b> ${exo.secondaryMuscles.join(', ')}</div>` : ''}
      </div>
      <div class="exo-detail-section">
        <div class="stat-title">Consignes d'exécution</div>
        <ol class="exo-detail-list">${instructions.map(i=>`<li>${i}</li>`).join('')}</ol>
      </div>
      <div class="exo-detail-section">
        <div class="stat-title">Erreurs fréquentes</div>
        <ul class="exo-detail-list">${mistakes.map(i=>`<li>${i}</li>`).join('')}</ul>
      </div>
      <div class="exo-detail-section">
        <div class="stat-title">Variantes</div>
        <div class="exo-chip-row">${chipsHtml(variants)}</div>
      </div>
      <div class="exo-detail-section">
        <div class="stat-title">Alternatives</div>
        <div class="exo-chip-row">${chipsHtml(alternatives)}</div>
      </div>
      <a class="btn secondary" href="${youtubeSearchUrl(exo)}" target="_blank" rel="noopener">▶️ Voir des démonstrations sur YouTube</a>
    </div>`;
}

function openExerciseDetail(exerciseId, onSelect){
  const exo = exoById(exerciseId);
  if(!exo) return;
  const wrap = document.createElement('div');
  wrap.className = 'modal-overlay';
  wrap.id = 'detailOverlay';
  wrap.style.zIndex = 300;
  wrap.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">Fiche exercice</div>
        <button class="modal-close" id="detailCloseBtn">✕</button>
      </div>
      <div id="detailBody">${exerciseDetailHtml(exo)}</div>
      ${onSelect ? `<button type="button" class="btn" id="detailSelectBtn">Ajouter cet exercice</button>` : ''}
    </div>`;
  document.body.appendChild(wrap);
  const close = ()=>{ if(wrap.parentNode) document.body.removeChild(wrap); };
  document.getElementById('detailCloseBtn').onclick = close;
  wrap.addEventListener('click', e=>{ if(e.target===wrap) close(); });
  wrap.querySelectorAll('.exo-chip-link').forEach(btn=>{
    btn.onclick = ()=>{ close(); openExerciseDetail(btn.dataset.id, onSelect); };
  });
  if(onSelect){
    document.getElementById('detailSelectBtn').onclick = ()=>{ close(); onSelect(exo.id); };
  }
}
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

  let reason = 'Charge de départ suggérée selon ton niveau.';
  const ratio = acwr();
  const highLoad = ratio!=null && ratio>1.5;

  const MAX_SETS = goalCfg.sets + 2;

  if(past.length){
    const last = past[0];
    const targetReps = last.targetReps || reps;
    const achieved = (last.sets||[]).length ? (last.sets||[]).every(s=>(s.reps||0) >= targetReps) : false;
    sets = Math.max(sets, (last.sets||[]).length || sets);
    // Progression double/triple : on fait tourner le type d'ajustement (charge, répétition, série)
    // pour éviter de ne jouer que sur le poids d'une séance à l'autre.
    const progressionCycle = past.length % 3;

    if(highLoad && achieved){
      reason = `Charge maintenue : ta charge d'entraînement récente est élevée (ACWR ${ratio.toFixed(1)}), on évite d'en rajouter.`;
      if(exo.kind==='weighted') weight = last.weightUsed ?? weight;
      reps = targetReps;
    } else if(exo.kind==='weighted'){
      weight = last.weightUsed ?? weight;
      reps = targetReps;
      if(achieved && last.difficulty<=3){
        if(progressionCycle===1){
          sets = Math.min(MAX_SETS, sets+1);
          reason = `Série ajoutée (${sets} au total) : charge et répétitions bien maîtrisées la dernière fois.`;
        } else if(progressionCycle===2){
          reps = targetReps+1;
          reason = `Répétition ajoutée (${reps} par série) : continue sur cette charge avant de remonter le poids.`;
        } else {
          weight = Math.round((weight+2.5)*2)/2;
          reason = `Poids augmenté à ${weight}kg : séries précédentes réussies avec une difficulté modérée (${last.difficulty}/5).`;
        }
      } else if(!achieved || last.difficulty>=5){
        weight = Math.max(0, Math.round((weight-2.5)*2)/2);
        reason = !achieved ? 'Poids réduit : les répétitions cibles n\'avaient pas été atteintes la dernière fois.' : 'Poids réduit : la séance précédente était très difficile (ressenti 5/5).';
      } else reason = 'Charge stable : tu es dans une bonne zone d\'effort (ressenti 4/5).';
    } else {
      reps = last.targetReps || reps;
      if(achieved && last.difficulty<=3){
        if(progressionCycle===1 && sets<MAX_SETS){
          sets += 1;
          reason = `Série ajoutée (${sets} au total) : le nombre de répétitions actuel est bien maîtrisé.`;
        } else {
          reps += (exo.kind==='core'?5:1);
          reason = `Objectif augmenté à ${reps}${exo.kind==='core'?'s':' reps'} : bien réussi la dernière fois.`;
        }
      }
      else if(!achieved || last.difficulty>=5){ reps = Math.max(exo.kind==='core'?10:3, reps-1); reason = 'Objectif réduit pour rester sur une progression réaliste.'; }
      else reason = 'Objectif stable : bon niveau d\'effort la dernière fois.';
    }
  }
  return { sets, reps, weight, name: exo.name, exerciseId, reason };
}

const MIN_SESSIONS_BEFORE_SUGGESTION = 3;

/* Pas de programme pré-généré : on mire la composition d'exercices de la séance
   musculation la plus pertinente à répéter (avec surcharge progressive), en
   alternant si l'utilisateur a plusieurs types de séances distincts. */
function pickNextMuscuComposition(){
  const muscuSessions = state.sessions.filter(s=>s.type==='muscu').sort((a,b)=> new Date(b.date)-new Date(a.date));
  if(muscuSessions.length < MIN_SESSIONS_BEFORE_SUGGESTION) return null;
  const sig = s=> s.exercises.map(e=>e.exerciseId).sort().join(',');
  const lastSig = sig(muscuSessions[0]);
  const alt = muscuSessions.find(s=> sig(s) !== lastSig);
  const chosen = alt || muscuSessions[0];
  return chosen.exercises.map(e=>e.exerciseId).filter(id=>exoById(id));
}

function buildMuscuSession(){
  const exerciseIds = pickNextMuscuComposition();
  if(!exerciseIds || !exerciseIds.length) return null;
  return {
    id: uid(),
    type:'muscu',
    status:'pending',
    label: 'Séance suggérée',
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
    reason: rp.reason || 'Cible de départ selon ton objectif.',
  };
}

/* Aucun plan n'est généré à l'avance : la musculation ne propose une
   prochaine séance qu'après quelques séances loguées librement par
   l'utilisateur, et la course ne se programme que sur demande explicite
   (voir generateCourseProgram). */
function ensurePlanFilled(){
  const hasPendingMuscu = state.plan.some(p=>p.status==='pending' && p.type==='muscu');
  if(!hasPendingMuscu){
    const suggestion = buildMuscuSession();
    if(suggestion) state.plan.push(suggestion);
  }
  saveState();
}

function adaptRunProgress(logged){
  const target = logged.targetDistance || state.runProgress.targetDistance;
  const distRatio = logged.distance_km / target;
  const diff = logged.difficulty;
  let { targetDistance, targetPace } = state.runProgress;
  let reason;

  const ratio = acwr();
  const shouldHoldBack = ratio!=null && ratio>1.5;

  if(distRatio >= 0.95 && diff<=3){
    if(shouldHoldBack){
      reason = `Distance maintenue : ta charge d'entraînement récente est élevée (ACWR ${ratio.toFixed(1)}).`;
    } else {
      targetDistance = Math.round((target*1.1)*10)/10;
      reason = `Distance augmentée : objectif précédent atteint avec un ressenti confortable (${diff}/5).`;
      if(logged.pace <= targetPace){ targetPace = Math.max(3.5, targetPace - 1/6); reason += ' Allure resserrée aussi.'; }
    }
  } else if(diff>=4 || distRatio < 0.8){
    targetDistance = Math.max(1.5, Math.round((target*0.9)*10)/10);
    targetPace = targetPace + 1/6;
    reason = diff>=4 ? `Distance réduite : la sortie précédente était difficile (ressenti ${diff}/5).` : "Distance réduite : l'objectif précédent n'a pas été complété.";
  } else {
    reason = 'Cible stable : bon équilibre entre effort et charge d\'entraînement.';
  }
  // rapprocher progressivement de l'objectif si en dessous
  const goalDist = state.settings.runTargetDistance;
  if(goalDist && targetDistance > goalDist) targetDistance = goalDist;
  state.runProgress = { targetDistance, targetPace, reason };
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
function renderEntrainementToday(){
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

/* ---------------- Météo (Open-Meteo, gratuit, sans clé) ---------------- */
let weatherCache = null; // { data, fetchedAt }
function fetchWeather(){
  return new Promise((resolve)=>{
    if(weatherCache && Date.now()-weatherCache.fetchedAt < 30*60000){ resolve(weatherCache.data); return; }
    if(!('geolocation' in navigator)){ resolve(null); return; }
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code,wind_speed_10m`);
        const json = await res.json();
        const data = json.current;
        weatherCache = { data, fetchedAt: Date.now() };
        resolve(data);
      }catch(e){ resolve(null); }
    }, ()=> resolve(null), { timeout:6000, maximumAge:1800000 });
  });
}
function weatherIcon(code){
  if(code===0) return '☀️';
  if(code<=3) return '⛅';
  if(code<=48) return '🌫️';
  if(code<=67) return '🌧️';
  if(code<=77) return '🌨️';
  if(code<=82) return '🌦️';
  if(code>=95) return '⛈️';
  return '🌡️';
}
function weatherAdvice(w){
  if(!w) return null;
  const t = w.temperature_2m;
  const bits = [];
  if(t>=28) bits.push("chaleur importante — hydrate-toi bien et réduis l'intensité");
  else if(t<=2) bits.push('température très basse — échauffe-toi davantage et couvre les extrémités');
  if(w.precipitation>0.3) bits.push('pluie prévue');
  if(w.wind_speed_10m>=30) bits.push('vent fort');
  if(!bits.length) return null;
  return bits.join(' · ');
}

function renderNextSession(){
  const el = document.getElementById('nextSessionCard');
  const next = state.plan.find(p=>p.status==='pending');
  if(!next){
    const muscuCount = state.sessions.filter(s=>s.type==='muscu').length;
    const remaining = Math.max(0, MIN_SESSIONS_BEFORE_SUGGESTION - muscuCount);
    el.innerHTML = `<div class="card empty-hero">
      <span class="eh-emoji">💪</span>
      ${remaining>0
        ? `Enregistre librement tes séances de musculation.<br>Ton coach proposera la prochaine automatiquement dans ${remaining} séance${remaining>1?'s':''}.`
        : `Enregistre ta prochaine séance librement, ou laisse ton coach s'en charger.`}
      <div style="display:flex; gap:10px; margin-top:16px;">
        <button class="btn" id="emptyLogMuscuBtn" style="margin-top:0;">Enregistrer une séance</button>
        <button class="btn secondary" id="emptyGenCourseBtn" style="margin-top:0;">Programme course</button>
      </div>
    </div>`;
    document.getElementById('emptyLogMuscuBtn').onclick = ()=> openLogModal('muscu', null);
    document.getElementById('emptyGenCourseBtn').onclick = ()=> openCourseProgramGenerator();
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
    const repReason = (next.exercises.find(e=>e.reason && !e.reason.startsWith('Charge de départ')) || next.exercises[0]||{}).reason;
    el.innerHTML = `
      <div class="hero-card muscu">
        <div class="hc-type">Musculation · ${next.label}</div>
        <div class="hc-title">Prochaine séance</div>
        <div class="hc-detail">${detail}</div>
        ${repReason ? `<div class="hc-weather">🧠 ${repReason}</div>` : ''}
        <button class="hc-btn" id="startSessionBtn">Commencer la séance</button>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="hero-card course">
        <div class="hc-type">Course à pied</div>
        <div class="hc-title">Prochaine sortie</div>
        <div class="hc-detail">Distance cible : ${next.targetDistance} km<br>Allure cible : ${fmtPace(next.targetPace)}</div>
        ${next.reason ? `<div class="hc-weather">🧠 ${next.reason}</div>` : ''}
        <div id="weatherAdvice"></div>
        <button class="hc-btn" id="startSessionBtn">Commencer la sortie</button>
      </div>`;
    fetchWeather().then(w=>{
      const slot = document.getElementById('weatherAdvice');
      if(!slot || !w) return;
      const advice = weatherAdvice(w);
      slot.innerHTML = `<div class="hc-weather">${weatherIcon(w.weather_code)} ${Math.round(w.temperature_2m)}°C${advice? ' — '+advice : ''}</div>`;
    });
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
let histSearchQuery='';
function sessionMatchesHistSearch(s, nq, norm){
  if(!nq) return true;
  if(norm(s.label||'').includes(nq) || norm(s.title||'').includes(nq) || norm(s.notes||'').includes(nq)) return true;
  if(norm(fmtDate(s.date)).includes(nq)) return true;
  if(s.type==='muscu') return s.exercises.some(e=> norm(e.name).includes(nq));
  const runTypeLabel = RUN_TYPES.find(t=>t.v===s.runType)?.l || '';
  return norm(runTypeLabel).includes(nq);
}
function renderHistorique(){
  const el = document.getElementById('historyList');
  const norm = s=> s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const nq = norm(histSearchQuery);
  const list = state.sessions
    .filter(s=> histFilter==='all' || s.type===histFilter)
    .filter(s=> sessionMatchesHistSearch(s, nq, norm))
    .sort((a,b)=> new Date(b.date)-new Date(a.date));
  if(!list.length){
    el.innerHTML = `<div class="hist-empty">${histSearchQuery ? 'Aucune séance ne correspond à ta recherche.' : "Aucune séance enregistrée pour l'instant."}</div>`;
    return;
  }
  el.innerHTML = list.map(s=>{
    if(s.type==='muscu'){
      const detail = s.exercises.map(e=>{
        const exo = exoById(e.exerciseId);
        const setsStr = (e.sets||[]).map(st=> (exo && exo.kind==='core') ? `${st.reps}s` : `${st.reps}${(exo && exo.kind==='weighted')?`×${st.weight}kg`:''}`).join(', ');
        return `<div>${e.name}: ${setsStr||'—'}</div>`;
      }).join('');
      return `<div class="hist-item">
        <div class="hist-top">
          <div class="hist-title"><span class="hist-tag muscu">MUSCU</span>${s.label||''}</div>
          <div class="hist-date">${fmtDate(s.date)}</div>
        </div>
        <div class="hist-detail">
          ${s.duration_min ? `Durée : ${s.duration_min} min<br>` : ''}
          ${detail}Ressenti : ${'⭐'.repeat(s.difficulty)}
          ${s.notes ? `<div class="hist-notes">💬 ${s.notes}</div>` : ''}
        </div>
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
        ${s.notes ? `<div class="hist-notes">💬 ${s.notes}</div>` : ''}
      </div>
      ${miniRouteMapHtml(s.route)}
    </div>`;
  }).join('');
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
    saveState();
    ensurePlanFilled();
    toast('Suggestion régénérée');
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

function lastSessionByLabel(label){
  if(!label) return null;
  const norm = s=>s.trim().toLowerCase();
  const matches = state.sessions.filter(s=>s.type==='muscu' && s.label && norm(s.label)===norm(label))
    .sort((a,b)=> new Date(b.date)-new Date(a.date));
  return matches[0] || null;
}
function sessionExerciseSummaryHtml(session){
  return session.exercises.map(e=>{
    const exo = exoById(e.exerciseId);
    const setsStr = (e.sets||[]).map(st=> (exo && exo.kind==='core') ? `${st.reps}s` : `${st.reps}${st.weight?'×'+st.weight+'kg':''}`).join(', ');
    return `<div class="cmp-exo"><span class="cmp-exo-name">${e.name}</span><span class="cmp-exo-sets">${setsStr||'—'}</span></div>`;
  }).join('');
}
function comparisonPanelHtml(label){
  if(!label) return `<div class="cmp-panel"><div class="cmp-empty">Nomme ta séance pour voir automatiquement ta dernière séance similaire.</div></div>`;
  const last = lastSessionByLabel(label);
  return `<div class="cmp-panel">
    <div class="cmp-col">
      <div class="cmp-col-title">🎯 Aujourd'hui</div>
      <div class="cmp-col-sub">${label}</div>
    </div>
    <div class="cmp-col">
      <div class="cmp-col-title">📅 Dernière fois</div>
      ${last ? `<div class="cmp-col-sub">${fmtDate(last.date)}</div>${sessionExerciseSummaryHtml(last)}` : `<div class="cmp-empty">Aucune séance "${label}" enregistrée encore.</div>`}
    </div>
  </div>`;
}

function muscuModalHtml(planItem){
  const exos = planItem ? planItem.exercises : defaultFreeMuscuExos();
  const blocks = exos.map(exoBlockHtml).join('');
  const label = planItem ? planItem.label : '';
  const existingLabels = [...new Set(state.sessions.filter(s=>s.type==='muscu' && s.label).map(s=>s.label))];

  return `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">${planItem? 'Musculation · '+planItem.label : 'Séance libre'}</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>
      ${planItem ? '' : `<div class="field">
        <label>Nom de la séance</label>
        <input type="text" id="sessionLabelInput" list="sessionLabelsList" placeholder="Fessiers, Push, Dos, Jambes..." value="${label}">
        <datalist id="sessionLabelsList">${existingLabels.map(l=>`<option value="${l}"></option>`).join('')}</datalist>
      </div>`}
      <div id="comparisonPanel">${comparisonPanelHtml(label)}</div>
      <div id="exoBlocksWrap">${blocks}</div>
      <button type="button" class="btn secondary" id="addExoToSessionBtn">+ Ajouter un exercice</button>
      <div class="field" style="margin-top:14px;">
        <label>Durée (minutes, optionnel)</label>
        <input type="number" step="1" id="muscuDurationInput" placeholder="45">
      </div>
      <div class="field">
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
      <div class="field"><input type="text" id="pickerSearch" placeholder="Rechercher : nom FR/EN, muscle, matériel, difficulté..."></div>
      <div id="pickerList"></div>
    </div>`;
  document.body.appendChild(wrap);

  const renderList = (q='')=>{
    const norm = s=> s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const nq = norm(q);
    const list = document.getElementById('pickerList');
    const filtered = state.exercises.filter(e=> exerciseMatchesQuery(e, nq, norm));
    if(!filtered.length){ list.innerHTML = `<div class="empty-stat">Aucun exercice trouvé.</div>`; return; }
    const byGroup = {};
    filtered.forEach(e=>{ (byGroup[e.group] = byGroup[e.group]||[]).push(e); });
    list.innerHTML = Object.entries(byGroup).map(([group, list])=>`
      <div class="picker-group">
        <div class="picker-group-label">${group}</div>
        ${list.map(e=>`<div class="picker-row">
          <button type="button" class="picker-item" data-id="${e.id}">${e.name}</button>
          <button type="button" class="picker-info-btn" data-info-id="${e.id}" aria-label="Fiche exercice">ⓘ</button>
        </div>`).join('')}
      </div>`).join('');
    list.querySelectorAll('.picker-item').forEach(btn=>{
      btn.onclick = ()=>{ onSelect(btn.dataset.id); document.body.removeChild(wrap); };
    });
    list.querySelectorAll('.picker-info-btn').forEach(btn=>{
      btn.onclick = ()=> openExerciseDetail(btn.dataset.infoId, (id)=>{ onSelect(id); document.body.removeChild(wrap); });
    });
  };
  renderList();
  document.getElementById('pickerSearch').addEventListener('input', e=> renderList(e.target.value));
  document.getElementById('pickerCloseBtn').onclick = ()=> document.body.removeChild(wrap);
  wrap.addEventListener('click', e=>{ if(e.target===wrap) document.body.removeChild(wrap); });
}

function defaultFreeMuscuExos(){
  const exerciseIds = pickNextMuscuComposition();
  return exerciseIds ? exerciseIds.map(weightedTargetsFor) : [];
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

    const labelInput = document.getElementById('sessionLabelInput');
    if(labelInput){
      labelInput.addEventListener('input', ()=>{
        document.getElementById('comparisonPanel').innerHTML = comparisonPanelHtml(labelInput.value.trim());
      });
    }

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
      const durationVal = parseInt(document.getElementById('muscuDurationInput').value);
      const sessionData = {
        id: uid(), type:'muscu', date: new Date().toISOString(),
        label: planItem? planItem.label : ((labelInput && labelInput.value.trim()) || 'Séance libre'),
        exercises, difficulty: rpe||3,
        duration_min: isNaN(durationVal) ? undefined : durationVal,
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
      </div>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
  document.getElementById('chooseMuscu').onclick = ()=> openLogModal('muscu', null);
  document.getElementById('chooseCourse').onclick = ()=> startCourseFlow(null);
  document.getElementById('chooseRepas').onclick = ()=> openFoodLogModal('collation');
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
        <button class="ob-option" id="chooseGenerate">🎯 Générer un programme<span class="oo-sub">Demande une séance ou un objectif chronométré au coach</span></button>
      </div>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });
  document.getElementById('chooseGps').onclick = ()=> openRunTracker(planItem);
  document.getElementById('chooseManual').onclick = ()=> openLogModal('course', planItem);
  document.getElementById('chooseGenerate').onclick = ()=> openCourseProgramGenerator();
}

/* ============================================================
   GÉNÉRATEUR DE PROGRAMME COURSE (à la demande, pas automatique)
   ============================================================ */
function currentRunBaseline(){
  const est = estimateVMA();
  if(est) return { paceMinKm: 60/est.vma };
  const lvl = state.settings.level;
  const pace = lvl==='avance' ? 5.2 : lvl==='intermediaire' ? 6.2 : 7.2;
  return { paceMinKm: pace };
}
function recentAvgDistance(){
  const runs = state.sessions.filter(s=>s.type==='course').slice(0,5);
  return runs.length ? runs.reduce((a,r)=>a+r.distance_km,0)/runs.length : 5;
}

function generateTimeGoalProgram(distanceKm, targetTimeMin){
  const targetPace = targetTimeMin/distanceKm;
  const baseline = currentRunBaseline();
  state.plan = state.plan.filter(p=> !(p.type==='course' && p.status==='pending'));

  const startDist = Math.max(2, Math.round(distanceKm*0.4*10)/10);
  const startPace = baseline.paceMinKm;
  const N = 6;
  const types = ['endurance','fractionne','longue'];
  const goalLabel = `${distanceKm}km en ${fmtElapsed(targetTimeMin*60000)}`;
  for(let i=0;i<N;i++){
    const t = i/(N-1);
    const dist = Math.round((startDist + (distanceKm-startDist)*t)*10)/10;
    const pace = startPace + (targetPace-startPace)*t;
    const type = types[i%types.length];
    const isFractionne = type==='fractionne';
    state.plan.push({
      id: uid(), type:'course', status:'pending',
      targetDistance: isFractionne ? Math.max(3, Math.round(dist*0.6*10)/10) : dist,
      targetPace: isFractionne ? Math.max(3.5, pace-0.5) : pace,
      runType: type,
      reason: `Étape ${i+1}/${N} vers ton objectif ${goalLabel}.`,
    });
  }
  saveState();
  toast(`Programme généré : ${goalLabel} 🎯`);
  refreshCurrentView();
}

function generateSingleSession(kind, value){
  const baseline = currentRunBaseline();
  const avgDist = recentAvgDistance();
  let targetDistance, targetPace, runType, reason;
  if(kind==='duration'){
    targetPace = baseline.paceMinKm;
    targetDistance = Math.max(1, Math.round((value/targetPace)*10)/10);
    runType = 'endurance';
    reason = `Séance de ${value} minutes demandée, à ton allure habituelle.`;
  } else if(kind==='distance'){
    targetDistance = value;
    targetPace = baseline.paceMinKm;
    runType = 'endurance';
    reason = `Sortie de ${value} km demandée.`;
  } else if(kind==='fractionne'){
    targetDistance = Math.max(3, Math.round(avgDist*0.7*10)/10);
    targetPace = Math.max(3.5, baseline.paceMinKm-0.7);
    runType = 'fractionne';
    reason = 'Séance de fractionné : alterne efforts rapides et récupération active.';
  } else {
    targetDistance = Math.round(avgDist*1.5*10)/10;
    targetPace = baseline.paceMinKm+0.5;
    runType = 'longue';
    reason = 'Sortie longue à allure confortable pour développer ton endurance de fond.';
  }
  state.plan.unshift({ id:uid(), type:'course', status:'pending', targetDistance, targetPace, runType, reason });
  saveState();
  toast('Séance générée 🎯');
  refreshCurrentView();
}

const SINGLE_SESSION_TYPES = {
  duration: { label:'Séance par durée', unit:'minutes', placeholder:'ex : 45' },
  distance: { label:'Sortie par distance', unit:'km', placeholder:'ex : 12' },
  fractionne: { label:'Fractionné', unit:null },
  longue: { label:'Sortie longue', unit:null },
};

function openCourseProgramGenerator(){
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-overlay" id="overlay">
    <div class="modal-sheet">
      <div class="modal-header">
        <div class="modal-title">🎯 Générer un programme</div>
        <button class="modal-close" id="closeModalBtn">✕</button>
      </div>

      <h3 class="section-title">Objectif chronométré</h3>
      <div class="field">
        <label>Distance</label>
        <select id="goalDistance">
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="21.1">Semi-marathon (21,1 km)</option>
          <option value="42.2">Marathon (42,2 km)</option>
        </select>
      </div>
      <div class="field"><label>Temps cible (minutes)</label><input type="number" id="goalTime" placeholder="ex : 50"></div>
      <button class="btn" id="genGoalBtn">Générer le programme</button>

      <h3 class="section-title">Séance unique</h3>
      <div class="ob-options" id="singleTypeOptions">
        <button class="ob-option" data-single="duration">⏱️ ${SINGLE_SESSION_TYPES.duration.label}<span class="oo-sub">Ex : 45 minutes</span></button>
        <button class="ob-option" data-single="distance">📏 ${SINGLE_SESSION_TYPES.distance.label}<span class="oo-sub">Ex : 12 km</span></button>
        <button class="ob-option" data-single="fractionne">⚡ ${SINGLE_SESSION_TYPES.fractionne.label}<span class="oo-sub">Travail en intervalles</span></button>
        <button class="ob-option" data-single="longue">🏞️ ${SINGLE_SESSION_TYPES.longue.label}<span class="oo-sub">Endurance fondamentale prolongée</span></button>
      </div>
      <div id="singleParamWrap" class="hidden">
        <div class="field"><label id="singleParamLabel">Valeur</label><input type="number" id="singleParamInput"></div>
        <button class="btn" id="genSingleBtn">Générer cette séance</button>
      </div>
    </div>
  </div>`;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });

  document.getElementById('genGoalBtn').onclick = ()=>{
    const distanceKm = parseFloat(document.getElementById('goalDistance').value);
    const targetTimeMin = parseFloat(document.getElementById('goalTime').value);
    if(!targetTimeMin || targetTimeMin<=0){ toast('Indique un temps cible'); return; }
    generateTimeGoalProgram(distanceKm, targetTimeMin);
    closeModal();
  };

  let selectedKind = null;
  document.querySelectorAll('#singleTypeOptions .ob-option').forEach(btn=>{
    btn.onclick = ()=>{
      selectedKind = btn.dataset.single;
      document.querySelectorAll('#singleTypeOptions .ob-option').forEach(b=>b.classList.toggle('on', b===btn));
      const cfg = SINGLE_SESSION_TYPES[selectedKind];
      if(!cfg.unit){
        generateSingleSession(selectedKind);
        closeModal();
        return;
      }
      document.getElementById('singleParamWrap').classList.remove('hidden');
      document.getElementById('singleParamLabel').textContent = `Valeur (${cfg.unit})`;
      document.getElementById('singleParamInput').placeholder = cfg.placeholder;
      document.getElementById('singleParamWrap').scrollIntoView({behavior:'smooth', block:'nearest'});
    };
  });
  document.getElementById('genSingleBtn').onclick = ()=>{
    const value = parseFloat(document.getElementById('singleParamInput').value);
    if(!value || value<=0){ toast('Indique une valeur'); return; }
    generateSingleSession(selectedKind, value);
    closeModal();
  };
}

/* ============================================================
   SUIVI GPS EN DIRECT
   Fonctionne uniquement au premier plan (limitation iOS PWA :
   pas de géolocalisation en arrière-plan pour une app à l'écran
   d'accueil). Nécessite un contexte sécurisé (https ou localhost).
   ============================================================ */
const GPS_ACCURACY_MAX_M = 30;
const MIN_POINT_DELTA_KM = 0.002;
const MAX_SPEED_MPS = 8; // ~28.8 km/h : au-delà, on considère que c'est une erreur GPS, pas un vrai déplacement
const SIGNAL_GAP_MS = 15000; // au-delà, on ne compte pas le saut de position comme distance parcourue
const INSTANT_PACE_WINDOW_MS = 30000; // fenêtre glissante pour l'allure instantanée

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
      <div class="tracker-stat"><div class="ts-val" id="trackerInstantPace">--:--</div><div class="ts-label">allure instant. /km</div></div>
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

  // seuil de précision adaptatif : on se resserre si on a déjà eu du bon signal,
  // pour éviter qu'un point moyen ne vienne polluer un tracé jusque-là propre
  const dynamicMax = tracker.points.length>5 ? Math.min(GPS_ACCURACY_MAX_M, 20) : GPS_ACCURACY_MAX_M;
  if(accuracy != null && accuracy > dynamicMax){
    statusEl.textContent = `Signal GPS faible (±${Math.round(accuracy)}m)…`;
    return;
  }

  const prev = tracker.points[tracker.points.length-1];
  const nowMs = Date.now();
  const point = { lat, lon, alt: altitude, tMs: nowMs-tracker.startTime };

  if(prev){
    const dtMs = point.tMs - prev.tMs;
    const d = haversineKm(prev.lat, prev.lon, lat, lon);

    if(dtMs > SIGNAL_GAP_MS){
      // trou de signal (tunnel, immeuble...) : on repart proprement d'ici sans compter le saut
      statusEl.textContent = '🟢 Signal retrouvé';
      tracker.points.push(point);
      maybePushRoutePoint(point);
      return;
    }

    const impliedSpeed = dtMs>0 ? (d*1000)/(dtMs/1000) : 0; // m/s
    if(impliedSpeed > MAX_SPEED_MPS){
      // saut GPS aberrant (rebond satellite) : on ignore ce point, on attend le suivant
      return;
    }

    statusEl.textContent = '🟢 Suivi en cours';
    if(d >= MIN_POINT_DELTA_KM){
      tracker.distanceKm += d;
      if(altitude!=null && prev.alt!=null){
        const diff = altitude - prev.alt;
        if(diff>0) tracker.elevGain += diff; else tracker.elevLoss += -diff;
      }
      tracker.points.push(point);
      maybePushRoutePoint(point);
      checkSplit();
      updateInstantPace();
      document.getElementById('trackerDistance').textContent = tracker.distanceKm.toFixed(2);
      document.getElementById('trackerElev').textContent = Math.round(tracker.elevGain);
      drawTrackerRoute();
    }
  } else {
    statusEl.textContent = '🟢 Suivi en cours';
    tracker.points.push(point);
    maybePushRoutePoint(point);
  }
}

function updateInstantPace(){
  const pts = tracker.points;
  const last = pts[pts.length-1];
  const cutoff = last.tMs - INSTANT_PACE_WINDOW_MS;
  let refIdx = pts.length-1;
  while(refIdx>0 && pts[refIdx-1].tMs >= cutoff) refIdx--;
  const ref = pts[refIdx];
  if(ref===last) return;
  const distKm = haversineKmPath(pts, refIdx, pts.length-1);
  const durMin = (last.tMs-ref.tMs)/60000;
  const el = document.getElementById('trackerInstantPace');
  if(!el) return;
  if(distKm < 0.02 || durMin<=0){ el.textContent='--:--'; return; }
  el.textContent = fmtPace(durMin/distKm).replace('/km','');
}
function haversineKmPath(pts, from, to){
  let total = 0;
  for(let i=from; i<to; i++){
    total += haversineKm(pts[i].lat, pts[i].lon, pts[i+1].lat, pts[i+1].lon);
  }
  return total;
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

function routePolylinePoints(route, w, h, pad){
  const lats = route.map(p=>p.lat), lons = route.map(p=>p.lon);
  const lat0 = lats[0];
  const mPerLat = 110540, mPerLon = 111320*Math.cos(lat0*Math.PI/180);
  const xs = lons.map(lon=> (lon - lons[0]) * mPerLon);
  const ys = lats.map(lat=> -(lat - lat0) * mPerLat);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const spanX = Math.max(maxX-minX, 10), spanY = Math.max(maxY-minY, 10);
  const scale = Math.min((w-pad*2)/spanX, (h-pad*2)/spanY);
  const offX = (w - spanX*scale)/2 - minX*scale;
  const offY = (h - spanY*scale)/2 - minY*scale;
  return xs.map((x,i)=> `${(x*scale+offX).toFixed(1)},${(ys[i]*scale+offY).toFixed(1)}`).join(' ');
}
function drawTrackerRoute(){
  if(tracker.route.length < 2) return;
  document.getElementById('trackerRoutePath').setAttribute('points', routePolylinePoints(tracker.route, 300, 220, 20));
}
function miniRouteMapHtml(route){
  if(!route || route.length<2) return '';
  const pts = routePolylinePoints(route, 300, 120, 12);
  return `<svg class="mini-route" viewBox="0 0 300 120"><polyline points="${pts}"></polyline></svg>`;
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
  { id:'nutrition_week', label:'20 repas suivis', emoji:'🍎', check:s=> s.nutrition.meals.length>=20 },
  { id:'coach_unlocked', label:'Coach débloqué', emoji:'🧠', check:s=> s.sessions.filter(x=>x.type==='muscu').length>=MIN_SESSIONS_BEFORE_SUGGESTION },
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

function detectPlateaus(){
  const weighted = state.exercises.filter(e=>e.kind==='weighted');
  const plateaus = [];
  weighted.forEach(exo=>{
    const hist = state.sessions.filter(s=>s.type==='muscu')
      .flatMap(s=> s.exercises.filter(e=>e.exerciseId===exo.id).map(e=>({ date:s.date, w:Math.max(0,...(e.sets||[]).map(st=>st.weight||0)) })))
      .sort((a,b)=> new Date(a.date)-new Date(b.date));
    if(hist.length<4) return;
    const last4 = hist.slice(-4);
    const maxW = Math.max(...last4.map(h=>h.w));
    const minW = Math.min(...last4.map(h=>h.w));
    if(maxW>0 && maxW-minW < 0.01){
      plateaus.push({ name: exo.name, weight:maxW });
    }
  });
  return plateaus;
}

function detectMuscleImbalance(){
  const cutoff = Date.now() - 28*86400000;
  const volumeByGroup = {};
  state.sessions.filter(s=>s.type==='muscu' && new Date(s.date).getTime()>=cutoff).forEach(s=>{
    s.exercises.forEach(e=>{
      const exo = exoById(e.exerciseId);
      if(!exo) return;
      const vol = (e.sets||[]).reduce((a,st)=>a+(st.reps||0),0);
      volumeByGroup[exo.group] = (volumeByGroup[exo.group]||0)+vol;
    });
  });
  const entries = Object.entries(volumeByGroup);
  if(entries.length<3) return null;
  const total = entries.reduce((a,[,v])=>a+v,0);
  const avg = total/entries.length;
  const under = entries.filter(([,v])=> v < avg*0.4).map(([g])=>g);
  if(!under.length) return null;
  return under;
}

function detectFatigueWeek(){
  const thisWeekStart = startOfWeek();
  const lastWeekStart = new Date(thisWeekStart.getTime()-7*86400000);
  const thisWeekSessions = state.sessions.filter(s=> new Date(s.date)>=thisWeekStart);
  const lastWeekSessions = state.sessions.filter(s=> new Date(s.date)>=lastWeekStart && new Date(s.date)<thisWeekStart);
  if(thisWeekSessions.length<2 || lastWeekSessions.length<2) return null;
  const avg = arr=> arr.reduce((a,s)=>a+(s.difficulty||3),0)/arr.length;
  const thisAvg = avg(thisWeekSessions), lastAvg = avg(lastWeekSessions);
  if(thisAvg - lastAvg >= 1) return { thisAvg, lastAvg, verdict:'fatigue' };
  if(lastAvg - thisAvg >= 1) return { thisAvg, lastAvg, verdict:'progression' };
  return null;
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
      ${macroBarHtml('Calories', totals.calories, t.calories, 'var(--gradient-accent)')}
      ${macroBarHtml('Protéines', totals.protein, t.protein, 'var(--gradient-muscu)')}
      ${macroBarHtml('Glucides', totals.carbs, t.carbs, 'var(--gradient-course)')}
      ${macroBarHtml('Lipides', totals.fat, t.fat, 'var(--gradient-warn)')}
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

/* ---------------- Scanner de codes-barres (Open Food Facts, gratuit) ---------------- */
async function lookupOpenFoodFacts(barcode){
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,nutriments,nutriscore_grade,allergens_hierarchy,ingredients_text_fr,ingredients_text`);
  const data = await res.json();
  if(data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments || {};
  return {
    id: 'off_'+barcode,
    name: p.product_name || `Produit ${barcode}`,
    cal: n['energy-kcal_100g'] || 0,
    p: n.proteins_100g || 0,
    c: n.carbohydrates_100g || 0,
    f: n.fat_100g || 0,
    fiber: n.fiber_100g,
    sugars: n.sugars_100g,
    salt: n.salt_100g,
    nutriscore: p.nutriscore_grade,
    allergens: (p.allergens_hierarchy||[]).map(a=>a.replace('en:','')).join(', '),
    ingredients: p.ingredients_text_fr || p.ingredients_text,
  };
}

function openBarcodeScanner(onDetected){
  if(typeof ZXing==='undefined'){ toast('Scanner indisponible hors-ligne'); return; }
  const root = document.createElement('div');
  root.id = 'scannerRoot';
  root.innerHTML = `<div class="tracker-overlay" id="scannerOverlay" style="background:#000;">
    <div class="tracker-top">
      <button class="modal-close" id="scannerCloseBtn">✕</button>
      <div class="tracker-status" id="scannerStatus">Vise le code-barres du produit</div>
      <div style="width:32px;"></div>
    </div>
    <video id="scannerVideo" style="width:100%; flex:1; object-fit:cover; border-radius:16px; background:#111;" playsinline muted></video>
  </div>`;
  document.body.appendChild(root);

  const reader = new ZXing.BrowserMultiFormatReader();
  let stopped = false;
  const cleanup = ()=>{
    if(stopped) return;
    stopped = true;
    try{ reader.reset(); }catch(e){}
    root.remove();
  };
  document.getElementById('scannerCloseBtn').onclick = cleanup;

  reader.decodeFromConstraints(
    { video: { facingMode:'environment' } },
    'scannerVideo',
    (result, err)=>{
      if(stopped) return;
      if(result){
        const text = result.getText();
        cleanup();
        onDetected(text);
      }
    }
  ).catch(()=>{
    document.getElementById('scannerStatus').textContent = "Impossible d'accéder à la caméra. Vérifie les autorisations dans Réglages.";
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
      <button type="button" class="btn secondary" id="scanBarcodeBtn">📷 Scanner un code-barres</button>
      <div class="field" style="margin-top:12px;"><input type="text" id="foodSearch" placeholder="Rechercher un aliment..."></div>
      <div id="foodResults"></div>
      <div id="foodQtyWrap" class="hidden">
        <div class="exo-block" id="foodPreview"></div>
        <div id="foodOffDetail"></div>
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
        selectFood(foodDbAll().find(f=>f.id===btn.dataset.id));
      };
    });
  };
  const selectFood = (food)=>{
    selectedFood = food;
    document.getElementById('foodQtyWrap').classList.remove('hidden');
    const offBits = [];
    if(food.nutriscore) offBits.push(`Nutri-Score ${food.nutriscore.toUpperCase()}`);
    if(food.fiber!=null) offBits.push(`Fibres ${food.fiber}g/100g`);
    if(food.sugars!=null) offBits.push(`Sucres ${food.sugars}g/100g`);
    if(food.salt!=null) offBits.push(`Sel ${food.salt}g/100g`);
    if(food.allergens) offBits.push(`Allergènes : ${food.allergens}`);
    document.getElementById('foodOffDetail').innerHTML = offBits.length ? `<div class="sr-sub" style="margin:-4px 0 10px;">${offBits.join(' · ')}</div>` : '';
    updatePreview();
    document.getElementById('foodQtyWrap').scrollIntoView({behavior:'smooth', block:'nearest'});
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
  document.getElementById('scanBarcodeBtn').onclick = ()=>{
    openBarcodeScanner(async (barcode)=>{
      toast('Code détecté, recherche du produit...');
      try{
        const food = await lookupOpenFoodFacts(barcode);
        if(!food){ toast('Produit introuvable dans la base Open Food Facts'); return; }
        selectFood(food);
      }catch(e){
        toast('Erreur réseau — vérifie ta connexion');
      }
    });
  };
  document.getElementById('confirmFoodBtn').onclick = ()=>{
    if(!selectedFood) return;
    const qty = parseFloat(document.getElementById('foodQtyInput').value)||0;
    const ratio = qty/100;
    state.nutrition.meals.push({
      id: uid(), date: new Date().toISOString(), mealType,
      foodId: selectedFood.id, name: selectedFood.name, qty,
      calories: selectedFood.cal*ratio, protein: selectedFood.p*ratio, carbs: selectedFood.c*ratio, fat: selectedFood.f*ratio,
      nutriscore: selectedFood.nutriscore,
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
   DASHBOARD — cartes de score (Accueil)
   ============================================================ */
function caloriesBurnedForSession(s){
  const weight = state.settings.weightKg || 70;
  if(s.type==='course') return weight * s.distance_km * 1.036;
  const totalSets = (s.exercises||[]).reduce((a,e)=> a + (e.sets? e.sets.length:0), 0);
  const durationH = (totalSets*3)/60;
  return 5 * weight * durationH; // MET ≈5 pour la musculation
}
function caloriesBurnedToday(){
  return state.sessions.filter(s=> new Date(s.date).toDateString()===todayStr())
    .reduce((a,s)=> a+caloriesBurnedForSession(s), 0);
}

function buildCoachMessage(ratio){
  const fatigueWeek = detectFatigueWeek();
  if(fatigueWeek && fatigueWeek.verdict==='fatigue') return `⚠️ Ressenti d'effort en hausse cette semaine (${fatigueWeek.lastAvg.toFixed(1)} → ${fatigueWeek.thisAvg.toFixed(1)}/5) — envisage une séance plus légère ou un jour de repos.`;
  const plateaus = detectPlateaus();
  if(plateaus.length) return `📊 Plateau sur ${plateaus[0].name} (${plateaus[0].weight}kg depuis 4 séances) — varie les répétitions/le tempo ou intercale une semaine plus légère.`;
  const imbalance = detectMuscleImbalance();
  if(imbalance) return `⚖️ Peu travaillé ces 4 dernières semaines : ${imbalance.join(', ')} — pense à les inclure dans ta prochaine séance.`;
  if(ratio!=null && ratio>1.5) return "⚠️ Ta charge d'entraînement a beaucoup augmenté récemment — envisage une séance allégée ou un jour de repos.";
  if(ratio!=null && ratio<0.8) return '📉 Charge en baisse — tu peux augmenter progressivement le volume si tu te sens bien.';
  return '✅ Tout est équilibré. Suis le plan du jour normalement.';
}

function renderDashboardScores(){
  const el = document.getElementById('dashboardScores');
  const ratio = acwr();
  const totals = macroTotals(mealsForDate(todayStr()));
  const xp = state.gamification.xp;
  const level = levelFromXp(xp);
  const xpIntoLevel = xp - xpForLevel(level);
  const xpForNext = xpForLevel(level+1) - xpForLevel(level);
  const burned = caloriesBurnedToday();
  const remaining = Math.round((state.nutrition.targets.calories||2000) - totals.calories);

  el.innerHTML = `
    <div class="coach-msg">${buildCoachMessage(ratio)}</div>
    <div class="dash-grid">
      <div class="dash-card ${acwrLabel(ratio).cls}">
        <div class="dash-val">${ratio!=null? ratio.toFixed(1) : '—'}</div>
        <div class="dash-label">Charge (ACWR)</div>
      </div>
      <div class="dash-card">
        <div class="dash-val">${remaining}</div>
        <div class="dash-label">kcal restantes</div>
      </div>
      <div class="dash-card">
        <div class="dash-val">${Math.round(burned)}</div>
        <div class="dash-label">kcal dépensées</div>
      </div>
      <div class="dash-card">
        <div class="dash-val">${state.gamification.streak}j</div>
        <div class="dash-label">Série en cours</div>
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
  state.runProgress.targetDistance = Math.max(1.5, Math.round((state.settings.runTargetDistance*0.4)*10)/10);
  state.runProgress.targetPace = state.settings.level==='avance' ? 5.5 : state.settings.level==='intermediaire' ? 6.3 : 7.2;
  saveState();
  closeModal();
  renderAll();
  toast('Objectifs enregistrés — à toi de jouer 💪');
}

/* ============================================================
   ÉCRAN D'ACCUEIL — mantra & citation du jour
   ============================================================ */
const MANTRAS = [
"Aujourd'hui je choisis de devenir plus forte qu'hier.","Mon corps est capable de bien plus que ce que je crois.",
"Chaque répétition me rapproche de la femme que je veux devenir.","Je n'ai pas besoin d'être parfaite, j'ai juste besoin de commencer.",
"La discipline d'aujourd'hui est la liberté de demain.","Je respecte mon corps en le faisant bouger.",
"Ma force intérieure grandit à chaque séance.","Je suis fière du chemin que je parcours, pas seulement du résultat.",
"Mon énergie du jour est un cadeau que je m'offre.","Je choisis la constance plutôt que la perfection.",
"Chaque pas compte, même le plus petit.","Je suis exactement là où je dois être dans mon parcours.",
"Ma détermination est plus forte que mes excuses.","Je transforme la fatigue en motivation.",
"Mon corps me porte, je le remercie en le faisant progresser.","Je deviens plus forte à chaque défi que je relève.",
"La femme que je deviens mérite tous mes efforts.","Je choisis l'action plutôt que le doute.",
"Ma confiance se construit une séance à la fois.","Je célèbre chaque petite victoire du quotidien.",
"Rien ne peut arrêter une femme déterminée.","Je suis capable de recommencer autant de fois qu'il le faut.",
"Mon corps est mon allié, pas mon ennemi.","Je cultive la patience envers moi-même.",
"Chaque goutte de sueur est une preuve de mon engagement.","Je me choisis, aujourd'hui et chaque jour.",
"Ma progression n'appartient qu'à moi.","Je suis plus résiliente que je ne le pense.",
"L'effort d'aujourd'hui écrit la force de demain.","Je me nourris de discipline et de douceur à la fois.",
"Ma volonté est mon plus bel atout.","Je fais de mon mieux, et c'est suffisant.",
"Je grandis dans l'inconfort, pas dans la facilité.","Chaque séance est un acte d'amour envers moi-même.",
"Je suis la source de ma propre motivation.","J'avance à mon rythme, sans me comparer.",
"Mon corps se transforme parce que je crois en lui.","Je suis capable de tenir mes engagements envers moi-même.",
"La régularité est ma plus grande force.","Je choisis de me sentir puissante aujourd'hui.",
"Mes efforts d'aujourd'hui façonnent la femme de demain.","Je respire, je me recentre, et j'avance.",
"Ma détermination ne dépend pas de mon humeur.","Je suis fière de me montrer jusqu'au bout.",
"Chaque entraînement renforce mon corps et mon esprit.","Je transforme mes doutes en énergie positive.",
"Je suis capable de dépasser mes propres limites.","Mon corps mérite ma bienveillance, pas ma sévérité.",
"Je construis ma force un jour à la fois.","Je choisis de croire en mon potentiel.",
"Aujourd'hui, je me dépasse avec le sourire.","Ma progression est un cadeau que je m'offre chaque jour.",
"Je suis capable de grandes choses, une étape à la fois.","Ma féminité et ma force ne font qu'une.",
"Je m'autorise à être fière de moi.","Rien ne vaut la satisfaction d'avoir tenu bon.",
"Je fais de chaque séance une victoire personnelle.","Mon énergie attire les bonnes choses dans ma vie.",
"Je choisis la version de moi qui ne renonce pas.","Chaque jour est une nouvelle occasion de me surpasser.",
"Je suis plus déterminée que mes doutes.","Ma discipline aujourd'hui construit ma liberté demain.",
"Je célèbre mon corps pour tout ce qu'il accomplit.","J'avance avec grâce et détermination.",
"Ma force vient de l'intérieur, pas des autres.","Je transforme chaque obstacle en tremplin.",
"Je mérite de me sentir bien dans mon corps.","Ma persévérance parle plus fort que mes excuses.",
"Je choisis d'être douce avec moi-même et exigeante avec mes objectifs.","Chaque effort investi aujourd'hui me rapproche de mes rêves.",
"Je suis une femme qui se relève, toujours.","Mon corps est le reflet de ma discipline et de mon amour-propre.",
"Je grandis à travers chaque défi que je choisis d'affronter.","Aujourd'hui, je choisis le mouvement plutôt que l'immobilité.",
"Ma volonté façonne mon avenir.","Je suis reconnaissante pour ce que mon corps me permet de faire.",
"Chaque séance me rapproche de la meilleure version de moi-même.","Je choisis la confiance plutôt que la comparaison.",
"Mon rythme est le bon rythme.","Je suis capable d'aimer l'effort autant que le résultat.",
"Ma force tranquille inspire les autres autant que moi-même.","Je fais de la discipline un acte d'amour, pas de punition.",
"Chaque respiration profonde me ramène à ma détermination.","Je suis plus forte que la version de moi d'hier.",
"Mon corps se souvient de chaque victoire, même petite.","Je choisis d'avancer même quand c'est difficile.",
"Ma détermination est silencieuse mais inébranlable.","Je transforme ma fatigue en fierté.",
"Aujourd'hui, je fais un pas de plus vers mes objectifs.","Je suis maîtresse de mes choix et de mon énergie.",
"Ma progression se mesure en constance, pas en perfection.","Je m'engage envers moi-même avant tout.",
"Chaque entraînement est une déclaration de confiance en moi.","Je choisis de nourrir mon corps et mon esprit avec soin.",
"Ma force intérieure ne demande la permission de personne.","Je suis capable de tenir mes promesses envers moi-même.",
"Chaque jour d'effort ajoute une pierre à mon édifice.","Je respecte mon repos autant que mon travail.",
"Ma détermination grandit à chaque difficulté surmontée.","Je choisis d'être fière de mon parcours, pas seulement de la ligne d'arrivée.",
"Mon énergie du matin façonne ma journée entière.","Je suis une femme qui avance, avec ou sans motivation parfaite.",
"Chaque geste sportif est un cadeau que je m'offre.","Je crois en la force que je construis, séance après séance.",
"Ma discipline d'aujourd'hui est un cadeau pour la femme de demain.","Je choisis la persévérance plutôt que la perfection immédiate.",
"Mon corps est capable de s'adapter, de grandir, de guérir.","Je m'autorise à être fière, même des petites victoires.",
"Chaque séance renforce ma confiance autant que mes muscles.","Je suis en train de devenir la femme forte que j'admire.",
"Ma volonté est plus grande que mes doutes du matin.","Je choisis de me traiter avec la même bienveillance que j'offre aux autres.",
"Aujourd'hui, je fais preuve de courage en me présentant.","Ma force ne se mesure pas seulement en kilos soulevés.",
"Je grandis en dehors de ma zone de confort.","Je suis fière de chaque effort, visible ou invisible.",
"Ma détermination construit la vie que je veux vivre.","Je choisis d'écouter mon corps sans jamais abandonner mes objectifs.",
"Chaque victoire, même minime, mérite d'être célébrée.","Je suis la preuve vivante que la constance fonctionne.",
"Mon énergie intérieure ne dépend pas des circonstances extérieures.","Je transforme chaque doute en une raison supplémentaire d'essayer.",
"Ma force et ma douceur coexistent parfaitement.","Je choisis de célébrer mon corps plutôt que de le critiquer.",
"Chaque jour, je deviens un peu plus la femme que je veux être.","Ma discipline personnelle est mon plus grand acte de liberté.",
"Je suis capable d'affronter ce que cette journée m'apporte.","Mon engagement envers moi-même ne faiblit pas.",
"Je choisis la version de moi qui se donne une chance chaque jour.","Aujourd'hui, je marche fièrement vers mes objectifs.",
];

const QUOTES = [
"Chaque entraînement construit la femme que tu rêves d'être.","La force ne vient pas du corps, elle vient de la volonté.",
"Ce n'est pas facile, mais ça vaut la peine.","Le corps atteint ce que l'esprit croit possible.",
"Les grandes réussites commencent par de petites décisions quotidiennes.","La discipline est le pont entre les objectifs et les résultats.",
"Tu n'as pas besoin d'être extraordinaire, juste constante.","Chaque goutte de sueur est un pas vers la meilleure version de toi-même.",
"Le progrès, pas la perfection.","Ton seul concurrent, c'est la personne que tu étais hier.",
"La motivation te lance, l'habitude te porte.","On ne regrette jamais une séance, seulement celles qu'on a sautées.",
"La force naît de la lutte, pas du confort.","Fais-le pour la version de toi qui te remerciera plus tard.",
"Le succès est la somme de petits efforts répétés jour après jour.","Ton corps peut presque tout, c'est ton esprit qu'il faut convaincre.",
"Une femme forte se relève, encore et encore.","La confiance se construit par l'action, pas par l'attente.",
"Il n'y a pas de raccourci vers un endroit qui vaut le détour.","Chaque jour est une nouvelle chance de recommencer.",
"Le plus dur n'est pas de commencer, c'est de continuer.","Ta seule limite, c'est celle que tu acceptes.",
"On ne devient pas fort en restant dans sa zone de confort.","Les excuses ne construisent rien, les efforts construisent tout.",
"La beauté d'une femme se voit dans sa détermination.","Rien de grandiose n'a jamais été accompli sans enthousiasme.",
"Prends soin de ton corps, c'est le seul endroit où tu es obligée de vivre.","La patience et la persévérance ont un effet magique.",
"Chaque petite victoire compte, célèbre-la.","La vraie force, c'est de continuer quand personne ne regarde.",
"Ce que tu fais aujourd'hui peut améliorer tous tes lendemains.","Le changement demande de l'effort, mais rester pareil aussi.",
"Sois plus forte que ta meilleure excuse.","Une femme déterminée est une force de la nature.",
"Les rêves n'ont pas de date d'expiration, respire et recommence.","On récolte toujours ce que l'on a semé avec constance.",
"Il n'y a pas d'ascenseur vers le succès, il faut prendre les escaliers.","La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux vraiment.",
"Ta force intérieure est plus puissante que n'importe quelle difficulté.","Le corps accomplit ce que l'esprit s'autorise à croire.",
"Chaque séance est un dépôt sur ton compte de confiance en toi.","Les jours difficiles construisent les femmes fortes.",
"Ne t'arrête pas quand tu es fatiguée, arrête-toi quand tu as fini.","Le succès commence toujours par la volonté de commencer.",
"Rien ne pousse dans la zone de confort.","Sois la raison pour laquelle quelqu'un croit encore en la force des femmes.",
"Ce que tu penses, tu le deviens ; ce que tu ressens, tu l'attires.","Une graine de discipline plantée chaque jour devient une forêt de résultats.",
"La douleur d'aujourd'hui est la force de demain.","On ne perd jamais, on apprend seulement.",
"Le plus grand risque est de ne jamais essayer.","Ta détermination d'aujourd'hui écrit ton histoire de demain.",
"Il vaut mieux avancer lentement que ne pas avancer du tout.","Le corps humain est la seule machine qui s'améliore avec l'usage.",
"Aime le processus, pas seulement le résultat.","Une femme qui se lève tôt pour s'entraîner a déjà gagné sa journée.",
"La motivation ne dure pas, mais les habitudes si.","Fais confiance au processus, les résultats suivent toujours.",
"Ton avenir est créé par ce que tu fais aujourd'hui, pas demain.","La croissance commence à la fin de ta zone de confort.",
"Aucun effort sincère n'est jamais perdu.","Chaque championne a été un jour une débutante qui a refusé d'abandonner.",
"Le courage, ce n'est pas l'absence de peur, c'est d'agir malgré elle.","Investis en toi, c'est le placement le plus rentable qui existe.",
"Une femme forte inspire d'autres femmes à devenir fortes.","Ce qui ne te tue pas te muscle.",
"Ne compare jamais ton chapitre 1 au chapitre 20 de quelqu'un d'autre.","Les résultats arrivent à celles qui continuent malgré la lenteur du progrès.",
"La constance transforme l'ordinaire en extraordinaire.","Rien ne remplace le travail acharné, pas même le talent.",
"Un petit progrès chaque jour finit par créer de grands résultats.","Sois assez forte pour te relever et assez douce pour y croire.",
"Le meilleur moment pour commencer, c'était hier ; le deuxième meilleur, c'est maintenant.","Ta seule tâche est de te battre pour la vie que tu veux.",
"On ne peut pas revenir en arrière, mais on peut recommencer maintenant.","Deviens la meilleure version de toi-même, pas une copie de quelqu'un d'autre.",
"L'énergie que tu mets dans ton corps revient toujours vers toi.","Un rêve sans action reste juste un rêve.",
"La force que tu montres cache souvent une bataille que personne ne voit.","Il n'existe pas d'échec, seulement des retours d'expérience.",
"Chaque femme forte a commencé par un simple premier pas.","La vraie compétition est intérieure.",
"Fais aujourd'hui ce que ton futur toi te remerciera d'avoir fait.","La transformation commence toujours dans la tête, avant le corps.",
"Sois fière de la distance parcourue, pas seulement du chemin restant.","Rien ne vaut la fierté ressentie après un effort honnête.",
"Ta discipline parle plus fort que tes doutes.","On ne devient pas plus forte en restant immobile.",
"Le progrès silencieux est souvent le plus puissant.","Chaque jour est une occasion de se prouver quelque chose à soi-même.",
"La force se construit dans la répétition, pas dans la perfection.","Un esprit fort porte un corps fort.",
"Il n'y a pas de mauvais jour pour recommencer.","On ne peut pas tout contrôler, mais on peut contrôler son effort.",
"La beauté du progrès, c'est qu'il ne s'arrête jamais si on continue.","Choisis-toi, encore et encore.",
"Ta force est plus grande que tes excuses les plus convaincantes.","Le respect de soi commence par tenir ses propres engagements.",
"On récolte la confiance en soi une action à la fois.","Les femmes fortes ne naissent pas ainsi, elles le deviennent.",
"Il n'est jamais trop tard pour devenir celle que tu veux être.","Le succès, c'est tomber sept fois et se relever huit.",
"Ta seule obligation est envers la personne que tu veux devenir.","Le mouvement est la meilleure médecine pour l'esprit et le corps.",
"Une petite discipline quotidienne vaut mieux qu'une grande motivation ponctuelle.","La confiance se construit en tenant les promesses qu'on se fait.",
"Chaque respiration est une nouvelle chance de recommencer.","On ne peut pas attendre l'inspiration, il faut aller la chercher en bougeant.",
"Les efforts que personne ne voit sont souvent les plus importants.","La force intérieure ne fait jamais de bruit.",
"Deviens l'énergie que tu veux attirer.","Un jour à la fois, une séance à la fois, une victoire à la fois.",
"Rien de bon n'est jamais venu de rester dans sa zone de confort.","L'estime de soi se construit par des preuves, pas par des promesses.",
"Chaque femme qui avance ouvre un chemin pour celles qui suivent.","Le corps oublie la douleur, mais jamais la fierté.",
"La discipline est un acte d'amour envers son futur soi.","Rien ne vaut la sensation d'avoir tenu une promesse envers soi-même.",
"Le courage de commencer est déjà la moitié du chemin.","Chaque pas, même petit, te rapproche de ton objectif.",
"La force ne se mesure pas en poids soulevé, mais en persévérance.","On ne construit pas une femme forte en un jour, mais chaque jour compte.",
"La meilleure version de toi t'attend de l'autre côté de l'effort.","Ta détermination aujourd'hui est le socle de ta confiance demain.",
"Rien ne remplace le pouvoir d'une décision prise avec conviction.","La progression est parfois invisible, mais jamais absente si tu persévères.",
"On ne perd rien à essayer, on perd tout à ne jamais commencer.","La lumière que tu cherches est déjà en toi, il suffit de la nourrir.",
"Chaque objectif atteint commence par la décision de ne pas abandonner.","Sois la femme qui inspire, en commençant par t'inspirer toi-même.",
];

function dayIndex(){ return Math.floor(Date.now()/86400000); }
function todaysMantra(){ return MANTRAS[dayIndex() % MANTRAS.length]; }
function todaysQuote(){ return QUOTES[(dayIndex()*7 + 3) % QUOTES.length]; }

function timeOfDayBucket(){
  const h = new Date().getHours();
  if(h>=5 && h<12) return 'morning';
  if(h>=12 && h<18) return 'afternoon';
  return 'evening';
}

function renderGreetingScreen(){
  const screen = document.getElementById('greetingScreen');
  const bucket = timeOfDayBucket();
  screen.className = 'greeting-screen tod-' + bucket;
  const name = state.settings.name || 'championne';
  const emoji = bucket==='morning' ? '☀️' : bucket==='afternoon' ? '🌤️' : '🌙';
  document.getElementById('greetingHello').textContent = `Bonjour ${name} ${emoji}`;
  document.getElementById('greetingMantra').textContent = todaysMantra();
  document.getElementById('greetingQuote').textContent = todaysQuote();
}

/* ============================================================
   NAVIGATION / INIT
   ============================================================ */
let currentView='accueil';
let entTab='mes';
const TITLES = { accueil:"", entrainement:'Entraînement', nutrition:'Nutrition', reglages:'Réglages' };

function switchView(view){
  currentView = view;
  document.querySelectorAll('.view').forEach(v=> v.classList.toggle('hidden', v.id!=='view-'+view));
  document.querySelectorAll('.navbtn').forEach(b=> b.classList.toggle('active', b.dataset.view===view));
  document.getElementById('topbarTitle').textContent = TITLES[view];
  document.querySelector('.topbar').classList.toggle('topbar-transparent', view==='accueil');
  refreshCurrentView();
}
function refreshCurrentView(){
  if(currentView==='accueil') renderGreetingScreen();
  else if(currentView==='entrainement') renderEntrainement();
  else if(currentView==='nutrition') renderNutrition();
  else if(currentView==='reglages') renderReglages();
}
function renderAll(){ refreshCurrentView(); }

function renderEntrainement(){
  document.getElementById('entMes').classList.toggle('hidden', entTab!=='mes');
  document.getElementById('entHistorique').classList.toggle('hidden', entTab!=='historique');
  document.getElementById('entNouvelle').classList.toggle('hidden', entTab!=='nouvelle');
  if(entTab==='mes') renderEntrainementToday();
  else if(entTab==='historique') renderHistorique();
  else renderNouvelleSeance();
}

function renderNouvelleSeance(){
  const el = document.getElementById('nouvelleSeanceContent');
  el.innerHTML = `
    <button class="hero-card muscu" id="nsMuscuBtn" style="width:100%; text-align:left; cursor:pointer; border:none;">
      <div class="hc-type">Musculation</div>
      <div class="hc-title">Démarrer une séance</div>
      <div class="hc-detail">Enregistre tes exercices, charges, séries et répétitions en comparant à ta dernière séance du même type.</div>
    </button>
    <button class="hero-card course" id="nsCourseBtn" style="width:100%; text-align:left; cursor:pointer; border:none; margin-top:14px;">
      <div class="hc-type">Course à pied</div>
      <div class="hc-title">Démarrer une sortie</div>
      <div class="hc-detail">Suivi GPS, saisie manuelle, ou génération d'un programme sur mesure.</div>
    </button>
  `;
  document.getElementById('nsMuscuBtn').onclick = ()=> openLogModal('muscu', null);
  document.getElementById('nsCourseBtn').onclick = ()=> startCourseFlow(null);
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
  document.getElementById('histSearchInput').addEventListener('input', e=>{
    histSearchQuery = e.target.value;
    renderHistorique();
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
