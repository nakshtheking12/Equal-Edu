import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

/* FIREBASE CONFIGURATION */
const firebaseConfig = {
  apiKey: "AIzaSyC2_D_EMldDtOGwuj85qbim6gFMvaCv3YU",
  authDomain: "equal-edu.firebaseapp.com",
  projectId: "equal-edu",
  storageBucket: "equal-edu.firebasestorage.app",
  messagingSenderId: "22950291231",
  appId: "1:22950291231:web:40a62239b1478b62c9322a",
  measurementId: "G-4K5EF1PND5"
};

const firebaseConfigured = !Object.values(firebaseConfig).some(value => String(value).startsWith("PASTE_"));
let firebaseApp = null;
let auth = null;
let db = null;
let communityUnsubscribe = null;
let doubtUnsubscribe = null;

if (firebaseConfigured) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

const $ = id => document.getElementById(id);
const $$ = selector => [...document.querySelectorAll(selector)];

/* i18n DICTIONARY FOR LANGUAGE SWITCHER */
const translations = {
  en: {
    hero_title: "Turn every chapter into an interactive learning journey.",
    hero_copy: "Upload study material, generate scalable notes, revise with flashcards, discuss with classmates and ask teachers for help.",
    auth_title: "Create your learning profile",
    btn_create: "Create account",
    btn_switch: "Already registered? Sign in",
    btn_demo: "Continue in demo mode",
    nav_dashboard: "Dashboard",
    nav_lesson: "Smart Lesson",
    nav_pdf: "PDF Studio",
    nav_flashcards: "Flashcards",
    nav_community: "Community",
    nav_doubt: "Doubt Room",
    nav_planner: "Study Planner",
    action_course: "Change course",
    action_profile: "Edit profile",
    action_logout: "Log out",
    dash_welcome: "Ready to make progress",
    dash_welcome_sub: "Continue your course, process a chapter, or help a classmate in the community.",
    dash_upload_btn: "Upload today's chapter",
    dash_xp: "XP earned",
    stat_current_course: "Current course",
    stat_pdf_words: "PDF words studied",
    stat_flashcards: "Flashcards",
    stat_tasks: "Tasks completed",
    panel_toolkit: "Learning toolkit",
    panel_sprint: "25-minute timer",
    btn_start: "Start",
    btn_pause: "Pause",
    btn_reset: "Reset",
    lesson_hub_eyebrow: "COURSE HUB",
    lesson_hub_sub: "Choose a lesson topic and start learning.",
    btn_read_aloud: "Read aloud",
    btn_stop: "Stop",
    pdf_studio_eyebrow: "PDF STUDIO",
    pdf_studio_title: "Notes that grow with the document",
    pdf_studio_sub: "A longer PDF creates a longer summary, more key points and more flashcards."
  },
  es: {
    hero_title: "Convierte cada capítulo en un viaje de aprendizaje interactivo.",
    hero_copy: "Sube material de estudio, genera notas escalables, repasa con fichas, debate con compañeros y pide ayuda a los profesores.",
    auth_title: "Crea tu perfil de aprendizaje",
    btn_create: "Crear cuenta",
    btn_switch: "¿Ya estás registrado? Inicia sesión",
    btn_demo: "Continuar en modo demostración",
    nav_dashboard: "Panel Principal",
    nav_lesson: "Lección Inteligente",
    nav_pdf: "Estudio PDF",
    nav_flashcards: "Tarjetas de Memoria",
    nav_community: "Comunidad",
    nav_doubt: "Sala de Dudas",
    nav_planner: "Planificador",
    action_course: "Cambiar curso",
    action_profile: "Editar perfil",
    action_logout: "Cerrar sesión",
    dash_welcome: "Listo para progresar",
    dash_welcome_sub: "Continúa tu curso, procesa un capítulo o ayuda a un compañero.",
    dash_upload_btn: "Sube el capítulo de hoy",
    dash_xp: "XP ganado",
    stat_current_course: "Curso actual",
    stat_pdf_words: "Palabras PDF estudiadas",
    stat_flashcards: "Tarjetas",
    stat_tasks: "Tareas completadas",
    panel_toolkit: "Herramientas de aprendizaje",
    panel_sprint: "Temporizador de 25 min",
    btn_start: "Iniciar",
    btn_pause: "Pausa",
    btn_reset: "Reiniciar",
    lesson_hub_eyebrow: "CENTRO DE CURSOS",
    lesson_hub_sub: "Elige un tema de lección y comienza a aprender.",
    btn_read_aloud: "Leer en voz alta",
    btn_stop: "Detener",
    pdf_studio_eyebrow: "ESTUDIO PDF",
    pdf_studio_title: "Notas que crecen con el documento",
    pdf_studio_sub: "Un PDF más largo crea un resumen más extenso y más tarjetas."
  },
  hi: {
    hero_title: "हर अध्याय को एक इंटरैक्टिव सीखने की यात्रा में बदलें।",
    hero_copy: "अध्ययन सामग्री अपलोड करें, नोट्स बनाएं, फ्लैशकार्ड के साथ दोहराएं, और शिक्षकों से मदद मांगें।",
    auth_title: "अपना लर्निंग प्रोफ़ाइल बनाएं",
    btn_create: "खाता बनाएं",
    btn_switch: "पहले से पंजीकृत हैं? साइन इन करें",
    btn_demo: "डेमो मोड में जारी रखें",
    nav_dashboard: "डैशबोर्ड",
    nav_lesson: "स्मार्ट पाठ",
    nav_pdf: "पीडीएफ स्टूडियो",
    nav_flashcards: "फ्लैशकार्ड",
    nav_community: "समुदाय",
    nav_doubt: "संदेह कक्ष",
    nav_planner: "अध्ययन योजनाकार",
    action_course: "कोर्स बदलें",
    action_profile: "प्रोफ़ाइल संपादित करें",
    action_logout: "लॉग आउट",
    dash_welcome: "प्रगति करने के लिए तैयार हैं",
    dash_welcome_sub: "अपना कोर्स जारी रखें, अध्याय अपलोड करें, या समुदाय में मदद करें।",
    dash_upload_btn: "आज का अध्याय अपलोड करें",
    dash_xp: "XP अर्जित",
    stat_current_course: "वर्तमान कोर्स",
    stat_pdf_words: "पीडीएफ शब्द पढ़े गए",
    stat_flashcards: "फ्लैशकार्ड",
    stat_tasks: "कार्य पूरे हुए",
    panel_toolkit: "लर्निंग टूलकिट",
    panel_sprint: "25-मिनट टाइमर",
    btn_start: "शुरू",
    btn_pause: "रोकें",
    btn_reset: "रीसेट",
    lesson_hub_eyebrow: "कोर्स हब",
    lesson_hub_sub: "एक पाठ विषय चुनें और सीखना शुरू करें।",
    btn_read_aloud: "जोर से पढ़ें",
    btn_stop: "बंद करें",
    pdf_studio_eyebrow: "पीडीएफ स्टूडियो",
    pdf_studio_title: "दस्तावेज़ के साथ बढ़ने वाले नोट्स",
    pdf_studio_sub: "एक लंबा पीडीएफ लंबा सारांश और अधिक फ्लैशकार्ड बनाता है।"
  },
  fr: {
    hero_title: "Transformez chaque chapitre en un voyage d'apprentissage interactif.",
    hero_copy: "Téléchargez des documents, générez des notes évolutives, révisez avec des cartes mémoire et posez des questions aux enseignants.",
    auth_title: "Créez votre profil d'apprentissage",
    btn_create: "Créer un compte",
    btn_switch: "Déjà inscrit ? Connexion",
    btn_demo: "Continuer en mode démo",
    nav_dashboard: "Tableau de bord",
    nav_lesson: "Leçon intelligente",
    nav_pdf: "Studio PDF",
    nav_flashcards: "Cartes mémoire",
    nav_community: "Communauté",
    nav_doubt: "Salle de questions",
    nav_planner: "Planificateur",
    action_course: "Changer de cours",
    action_profile: "Modifier le profil",
    action_logout: "Déconnexion",
    dash_welcome: "Prêt à progresser",
    dash_welcome_sub: "Continuez votre cours, traitez un chapitre ou aidez un camarade.",
    dash_upload_btn: "Télécharger le chapitre",
    dash_xp: "XP gagné",
    stat_current_course: "Cours actuel",
    stat_pdf_words: "Mots PDF étudiés",
    stat_flashcards: "Cartes mémoire",
    stat_tasks: "Tâches terminées",
    panel_toolkit: "Outils d'apprentissage",
    panel_sprint: "Minuteur de 25 min",
    btn_start: "Démarrer",
    btn_pause: "Pause",
    btn_reset: "Réinitialiser",
    lesson_hub_eyebrow: "CENTRE DE COURS",
    lesson_hub_sub: "Choisissez un sujet de leçon et commencez à apprendre.",
    btn_read_aloud: "Lire à voix haute",
    btn_stop: "Arrêter",
    pdf_studio_eyebrow: "STUDIO PDF",
    pdf_studio_title: "Des notes qui grandissent avec le document",
    pdf_studio_sub: "Un PDF plus long crée un résumé plus long et plus de cartes."
  }
};

const state = {
  authMode: "signup",
  demo: !firebaseConfigured,
  user: null,
  profile: {
    uid: "demo-user",
    name: "Demo Learner",
    email: "demo@equaledu.local",
    role: "student",
    course: "Science",
    bio: ""
  },
  cards: [],
  filteredCards: [],
  cardIndex: 0,
  cardFlipped: false,
  pdfText: "",
  timerSeconds: 1500,
  timerId: null,
  tasks: JSON.parse(localStorage.getItem("equaleduTasks") || "[]"),
  lang: localStorage.getItem("equaleduLang") || "en"
};

const lessons = {
  science: {
    en: [
      { 
        title: "Nutrition in Plants and Animals", 
        intro: "Exploring how living organisms obtain, process, and utilize nutrients for sustaining life functions, growth, and cellular repair.", 
        blocks: [
          "Plants use photosynthesis to convert sunlight, carbon dioxide, and water into chemical energy in the form of glucose.", 
          "Animals rely on heterotrophic nutrition, involving ingestion, mechanical and chemical digestion, absorption of nutrients, and egestion of waste.", 
          "Symbiotic relationships, such as those between legumes and nitrogen-fixing bacteria, play a critical role in nutrient cycling within terrestrial ecosystems.", 
          "Vascular tissues like xylem and phloem act as the primary transport systems for distributing water, minerals, and synthesized organic food throughout the plant body."
        ], 
        keywords: ["Nutrition", "Photosynthesis", "Digestion", "Vascular Tissues"], 
        quiz: { question: "How do plants make food?", options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"], answer: 1 } 
      },
      { 
        title: "Heat and Temperature", 
        intro: "Understanding thermal energy, molecular kinetics, and the underlying thermodynamic laws governing heat transfer mechanisms.", 
        blocks: [
          "Heat represents the total kinetic energy of constituent particles, flowing naturally from regions of higher temperature to regions of lower temperature.", 
          "Conduction transfers heat through direct physical contact via lattice vibrations and free electron collisions, predominantly occurring in solid materials.", 
          "Convection involves the bulk movement of fluid molecules, creating circulating currents that distribute thermal energy efficiently through liquids and gases.", 
          "Radiation transfers thermal energy entirely through electromagnetic waves, requiring no intervening medium and allowing heat to travel through a vacuum."
        ], 
        keywords: ["Heat", "Temperature", "Conduction", "Radiation"], 
        quiz: { question: "Which unit is used for temperature?", options: ["Joule", "Celsius", "Watt", "Newton"], answer: 1 } 
      },
      { 
        title: "Light: Shadows and Reflections", 
        intro: "Studying light propagation, electromagnetic spectrum properties, and geometrical optical phenomena like reflection and refraction.", 
        blocks: [
          "Light travels in straight lines known as rectilinear propagation, which leads directly to the formation of distinct shadows behind opaque objects.", 
          "Regular reflection occurs on smooth, polished surfaces like mirrors, obeying the law of incidence where the angle of incidence equals the angle of reflection.", 
          "Diffuse reflection happens on rough or irregular surfaces, scattering light rays in various directions and making non-luminous objects visible from multiple angles.", 
          "Lenses and optical systems bend light through refraction, changing its speed and wavelength as it passes from one transparent medium into another."
        ], 
        keywords: ["Light", "Shadow", "Reflection", "Refraction"], 
        quiz: { question: "How does light travel?", options: ["Curved lines", "Straight lines", "Waves only", "Zig-zag"], answer: 1 } 
      },
      {
        title: "States of Matter and Changes", 
        intro: "Examining the molecular structure, kinetic energy differences, and phase transitions between solid, liquid, gas, and plasma states.", 
        blocks: [
          "Solids possess tightly packed particles with strong intermolecular forces, giving them a definite shape and a fixed volume under normal conditions.", 
          "Liquids have moderate intermolecular spaces, allowing particles to flow past each other while maintaining a constant volume but taking the shape of their container.", 
          "Gases consist of widely separated particles possessing high kinetic energy, resulting in neither a fixed shape nor a definite volume as they expand freely.", 
          "Phase changes such as melting, vaporization, condensation, and sublimation involve the absorption or release of latent heat without altering chemical composition."
        ],
        keywords: ["Solids", "Liquids", "Gases", "Phase Transitions"],
        quiz: { question: "Which state of matter has a fixed shape and volume?", options: ["Gas", "Liquid", "Solid", "Plasma"], answer: 2 }
      }
    ],
    hi: [
      { 
        title: "पौधों और जंतुओं में पोषण", 
        intro: "जीवित जीवों द्वारा जीवन कार्यों, विकास और सेलुलर मरम्मत को बनाए रखने के लिए पोषक तत्वों को प्राप्त करने, संसाधित करने और उपयोग करने की खोज।", 
        blocks: [
          "पौधे ग्लूकोज के रूप में रासायनिक ऊर्जा में सूर्य के प्रकाश, कार्बन डाइऑक्साइड और पानी को बदलने के लिए प्रकाश संश्लेषण का उपयोग करते हैं।", 
          "जानवर विषमपोषी पोषण पर निर्भर करते हैं, जिसमें अंतर्ग्रहण, यांत्रिक और रासायनिक पाचन, पोषक तत्वों का अवशोषण और कचरे का उत्सर्जन शामिल है।", 
          "सहजीवी संबंध, जैसे कि फलदार पौधों और नाइट्रोजन-स्थिरीकरण बैक्टीरिया के बीच, स्थलीय पारिस्थितिकी तंत्र के भीतर पोषक तत्वों के चक्रण में महत्वपूर्ण भूमिका निभाते हैं।", 
          "ाइलम और फ्लोएम जैसे संवहनी ऊतक पूरे पौधे के शरीर में पानी, खनिजों और संश्लेषित कार्बनिक भोजन के वितरण के लिए प्राथमिक परिवहन प्रणाली के रूप में कार्य करते हैं।"
        ], 
        keywords: ["पोषण", "प्रकाश संश्लेषण", "पाचन", "संवहनी ऊतक"], 
        quiz: { question: "पौधे अपना भोजन कैसे बनाते हैं?", options: ["श्वसन", "प्रकाश संश्लेषण", "वाष्पोत्सर्जन", "पाचन"], answer: 1 } 
      },
      { 
        title: "ऊष्मा और तापमान", 
        intro: "तापीय ऊर्जा, आणविक गतिकी और ऊष्मा स्थानांतरण तंत्र को नियंत्रित करने वाले अंतर्निहित थर्मोडायनामिक नियमों को समझना।", 
        blocks: [
          "ऊष्मा घटक कणों की कुल गतिज ऊर्जा का प्रतिनिधित्व करती है, जो स्वाभाविक रूप से उच्च तापमान वाले क्षेत्रों से निम्न तापमान वाले क्षेत्रों की ओर प्रवाहित होती है।", 
          "चालन जालक कंपनों और मुक्त इलेक्ट्रॉन टक्करों के माध्यम से प्रत्यक्ष भौतिक संपर्क के माध्यम से गर्मी स्थानांतरित करता है, जो मुख्य रूप से ठोस पदार्थों में होता है।", 
          "संवहन में तरल अणुओं की थोक गति शामिल होती है, जो परिसंचारी धाराएँ बनाती हैं जो तरल पदार्थों और गैसों के माध्यम से थर्मल ऊर्जा को कुशलता से वितरित करती हैं।", 
          "विकिरण पूरी तरह से विद्युत चुम्बकीय तरंगों के माध्यम से थर्मल ऊर्जा स्थानांतरित करता है, जिसमें किसी मध्यवर्ती माध्यम की आवश्यकता नहीं होती है और गर्मी को निर्वात में यात्रा करने की अनुमति मिलती है।"
        ], 
        keywords: ["ऊष्मा", "तापमान", "चालन", "विकिरण"], 
        quiz: { question: "तापमान के लिए किस इकाई का उपयोग किया जाता है?", options: ["जूल", "सेल्सियस", "वाट", "न्यूटन"], answer: 1 } 
      },
      { 
        title: "प्रकाश: छाया और परावर्तन", 
        intro: "प्रकाश प्रसार, विद्युत चुम्बकीय स्पेक्ट्रम गुणों और परावर्तन और अपवर्तन जैसी ज्यामितीय ऑप्टिकल घटनाओं का अध्ययन।", 
        blocks: [
          "प्रकाश सीधी रेखाओं में यात्रा करता है जिसे सीधी रेखा प्रसार के रूप में जाना जाता है, जो सीधे अपारदर्शी वस्तुओं के पीछे विशिष्ट छाया के गठन की ओर जाता है।", 
          "नियमित परावर्तन दर्पण जैसी चिकनी, पॉलिश सतहों पर होता है, जो घटना के नियम का पालन करता है जहां घटना का कोण परावर्तन के कोण के बराबर होता है।", 
          "विसरित परावर्तन खुरदरी या अनियमित सतहों पर होता है, जो विभिन्न दिशाओं में प्रकाश किरणों को बिखेरता है और गैर-चमकदार वस्तुओं को कई कोणों से दृश्यमान बनाता है।", 
          "लेंस और ऑप्टिकल सिस्टम अपवर्तन के माध्यम से प्रकाश को मोड़ते हैं, इसकी गति और तरंग दैर्ध्य को बदलते हैं क्योंकि यह एक पारदर्शी माध्यम से दूसरे माध्यम में जाता है।"
        ], 
        keywords: ["प्रकाश", "छाया", "परावर्तन", "अपवर्तन"], 
        quiz: { question: "प्रकाश कैसे गमन करता है?", options: ["घुमावदार रेखाएँ", "सीधी रेखाएँ", "केवल तरंगें", "टेढ़ी-मीढ़ी"], answer: 1 } 
      },
      {
        title: "पदार्थ की अवस्थाएँ और परिवर्तन", 
        intro: "ठोस, तरल, गैस और प्लाज्मा अवस्थाओं के बीच आणविक संरचना, गतिज ऊर्जा अंतर और चरण संक्रमण की जांच करना।", 
        blocks: [
          "ठोस पदार्थों में मजबूत अंतर-आणविक बलों के साथ कसकर पैक किए गए कण होते हैं, जो उन्हें सामान्य परिस्थितियों में एक निश्चित आकार और एक निश्चित आयतन देते हैं।", 
          "तरल पदार्थों में मध्यम अंतर-आणविक स्थान होते हैं, जिससे कणों को एक निश्चित आयतन बनाए रखते हुए एक दूसरे के पिछले हिस्से में बहने की अनुमति मिलती है लेकिन उनके कंटेनर का आकार ले लिया जाता है।", 
          "गैसों में व्यापक रूप से अलग किए गए कण होते हैं जो उच्च गतिज ऊर्जा के अधिकारी होते हैं, जिसके परिणामस्वरूप न तो एक निश्चित आकार होता है और न ही एक निश्चित आयतन होता है क्योंकि वे स्वतंत्र रूप से फैलते हैं।", 
          "चरण परिवर्तन जैसे पिघलना, वाष्पीकरण, संघनन और ऊर्ध्वपातन में रासायनिक संरचना को बदले बिना गुप्त गर्मी का अवशोषण या रिलीज शामिल है।"
        ],
        keywords: ["ठोस", "तरल", "गैसों", "चरण परिवर्तन"],
        quiz: { question: "पदार्थ की किस अवस्था का आकार और आयतन निश्चित होता है?", options: ["गैस", "तरल", "ठोस", "प्लाज्मा"], answer: 2 }
      }
    ],
    es: [
      { 
        title: "Nutrición en plantas y animales", 
        intro: "Explorando cómo los organismos obtienen, procesan y utilizan nutrientes para sostener las funciones vitales, el crecimiento y la reparación celular.", 
        blocks: [
          "Las plantas utilizan la fotosíntesis para convertir la luz solar, el dióxido de carbono y el agua en energía química en forma de glucosa.", 
          "Los animales dependen de la nutrición heterótrofa, que implica la ingestión, la digestión mecánica y química, la absorción de nutrientes y la egestión de desechos.", 
          "Las relaciones simbióticas, como las que existen entre las leguminosas y las bacterias fijadoras de nitrógeno, desempeñan un papel fundamental en el ciclo de nutrientes dentro de los ecosistemas terrestres.", 
          "Los tejidos vasculares como el xilema y el floema actúan como los principales sistemas de transporte para distribuir agua, minerales y alimentos orgánicos sintetizados por todo el cuerpo de la planta."
        ], 
        keywords: ["Nutrición", "Fotosíntesis", "Digestión", "Tejidos Vasculares"], 
        quiz: { question: "¿Cómo hacen las plantas su comida?", options: ["Respiración", "Fotosíntesis", "Transpiración", "Digestión"], answer: 1 } 
      },
      { 
        title: "Calor y temperatura", 
        intro: "Comprender la energía térmica, la cinética molecular y las leyes termodinámicas subyacentes que rigen los mecanismos de transferencia de calor.", 
        blocks: [
          "El calor representa la energía cinética total de las partículas constituyentes, fluyendo naturalmente desde regiones de mayor temperatura a regiones de menor temperatura.", 
          "La conducción transfiere calor a través del contacto físico directo mediante vibraciones de red y colisiones de electrones libres, ocurriendo predominantemente en materiales sólidos.", 
          "La convección implica el movimiento masivo de moléculas de fluido, creando corrientes circulantes que distribuyen eficientemente la energía térmica a través de líquidos y gases.", 
          "La radiación transfiere energía térmica enteramente a través de ondas electromagnéticas, sin requerir ningún medio interviniente y permitiendo que el calor viaje a través del vacío."
        ], 
        keywords: ["Calor", "Temperatura", "Conducción", "Radiación"], 
        quiz: { question: "¿Qué unidad se usa para la temperatura?", options: ["Julio", "Celsius", "Vatio", "Newton"], answer: 1 } 
      },
      { 
        title: "Luz: Sombras y reflejos", 
        intro: "Estudiar la propagación de la luz, las propiedades del espectro electromagnético y los fenómenos ópticos geométricos como la reflexión y la refracción.", 
        blocks: [
          "La luz viaja en línea recta conocida como propagación rectilínea, lo que conduce directamente a la formación de sombras distintas detrás de objetos opacos.", 
          "La reflexión regular ocurre en superficies lisas y pulidas como espejos, obedeciendo la ley de incidencia donde el ángulo de incidencia es igual al ángulo de reflexión.", 
          "La reflexión difusa ocurre en superficies rugosas o irregulares, dispersando los rayos de luz en varias direcciones y haciendo que los objetos no luminosos sean visibles desde múltiples ángulos.", 
          "Las lentes y los sistemas ópticos doblan la luz a través de la refracción, cambiando su velocidad y longitud de onda a medida que pasa de un medio transparente a otro."
        ], 
        keywords: ["Luz", "Sombra", "Reflexión", "Refracción"], 
        quiz: { question: "¿Cómo viaja la luz?", options: ["Líneas curvas", "Líneas rectas", "Solo ondas", "Zig-zag"], answer: 1 } 
      },
      {
        title: "Estados de la materia y cambios", 
        intro: "Examinar la estructura molecular, las diferencias de energía cinética y las transiciones de fase entre los estados sólido, líquido, gaseoso y plasma.", 
        blocks: [
          "Los sólidos poseen partículas empaquetadas densamente con fuertes fuerzas intermoleculares, dándoles una forma definida y un volumen fijo en condiciones normales.", 
          "Los líquidos tienen espacios intermoleculares moderados, lo que permite que las partículas fluyan entre sí mientras mantienen un volumen constante pero adoptan la forma de su recipiente.", 
          "Los gases constan de partículas ampliamente separadas que poseen una alta energía cinética, lo que da como resultado ni una forma fija ni un volumen definido a medida que se expanden libremente.", 
          "Los cambios de fase como la fusión, la vaporización, la condensación y la sublimación implican la absorción o liberación de calor latente sin alterar la composición química."
        ],
        keywords: ["Sólidos", "Líquidos", "Gases", "Transiciones de fase"],
        quiz: { question: "¿Qué estado de la materia tiene forma y volumen fijos?", options: ["Gas", "Líquido", "Sólido", "Plasma"], answer: 2 }
      }
    ],
    fr: [
      { 
        title: "Nutrition des plantes et des animaux", 
        intro: "Exploration de la manière dont les organismes vivants obtiennent, traitent et utilisent les nutriments pour soutenir les fonctions vitales, la croissance et la réparation cellulaire.", 
        blocks: [
          "Les plantes utilisent la photosynthèse pour convertir la lumière du soleil, le dioxyde de carbone et l'eau en énergie chimique sous forme de glucose.", 
          "Les animaux dépendent d'une nutrition hétérotrophe, impliquant l'ingestion, la digestion mécanique et chimique, l'absorption des nutriments et l'égestion des déchets.", 
          "Les relations symbiotiques, telles que celles entre les légumineuses et les bactéries fixatrices d'azote, jouent un rôle essentiel dans le cycle des nutriments au sein des écosystèmes terrestres.", 
          "Les tissus vasculaires tels que le xylème et le phloème agissent comme les principaux systèmes de transport pour distribuer l'eau, les minéraux et les aliments organiques synthétisés dans tout le corps de la plante."
        ], 
        keywords: ["Nutrition", "Photosynthèse", "Digestion", "Tissus Vasculaires"], 
        quiz: { question: "Comment les plantes font-elles de la nourriture?", options: ["Respiration", "Photosynthèse", "Transpiration", "Digestion"], answer: 1 } 
      },
      { 
        title: "Chaleur et température", 
        intro: "Comprendre l'énergie thermique, la cinétique moléculaire et les lois thermodynamiques sous-jacentes régissant les mécanismes de transfert de chaleur.", 
        blocks: [
          "La chaleur représente l'énergie cinétique totale des particules constituantes, circulant naturellement des régions de température plus élevée vers des régions de température plus basse.", 
          "La conduction transfère la chaleur par contact physique direct via des vibrations de réseau et des collisions d'électrons libres, se produisant principalement dans les matériaux solides.", 
          "La convection implique le mouvement global des molécules de fluides, créant des courants de circulation qui distribuent efficacement l'énergie thermique à travers les liquides et les gaz.", 
          "La radiation transfère l'énergie thermique entièrement par ondes électromagnétiques, ne nécessitant aucun milieu intermédiaire et permettant à la chaleur de voyager à travers le vide."
        ], 
        keywords: ["Chaleur", "Température", "Conduction", "Radiation"], 
        quiz: { question: "Quelle unité est utilisée pour la température?", options: ["Joule", "Celsius", "Watt", "Newton"], answer: 1 } 
      },
      { 
        title: "Lumière : Ombres et reflets", 
        intro: "Étude de la propagation de la lumière, des propriétés du spectre électromagnétique et des phénomènes optiques géométriques comme la réflexion et la réfraction.", 
        blocks: [
          "La lumière se déplace en ligne droite appelée propagation rectiligne, ce qui conduit directement à la formation d'ombres distinctes derrière des objets opaques.", 
          "La réflexion régulière se produit sur des surfaces lisses et polies comme les miroirs, obéissant à la loi d'incidence où l'angle d'incidence est égal à l'angle de réflexion.", 
          "La réflexion diffuse se produit sur des surfaces rugueuses ou irrégulières, dispersant les rayons lumineux dans diverses directions et rendant les objets non lumineux visibles sous plusieurs angles.", 
          "Les lentilles et les systèmes optiques plient la lumière par réfraction, modifiant sa vitesse et sa longueur d'onde lorsqu'elle passe d'un milieu transparent à un autre."
        ], 
        keywords: ["Lumière", "Ombre", "Réflexion", "Réfraction"], 
        quiz: { question: "Comment la lumière se déplace-t-elle?", options: ["Lignes courbes", "Lignes droites", "Ondes seulement", "Zig-zag"], answer: 1 } 
      },
      {
        title: "États de la matière et changements", 
        intro: "Examen de la structure moléculaire, des différences d'énergie cinétique et des transitions de phase entre les états solide, liquide, gazeux et plasma.", 
        blocks: [
          "Les solides possèdent des particules étroitement tassées avec de fortes forces intermoléculaires, leur donnant une forme définie et un volume fixe dans des conditions normales.", 
          "Les liquides ont des espaces intermoléculaires modérés, permettant aux particules de s'écouler les unes sur les autres tout en maintenant un volume constant mais en prenant la forme de leur récipient.", 
          "Les gaz sont constitués de particules largement séparées possédant une énergie cinétique élevée, ce qui n'entraîne ni forme fixe ni volume défini lorsqu'ils s'étendent librement.", 
          "Les changements de phase tels que la fusion, la vaporisation, la condensation et la sublimation impliquent l'absorption ou la libération de chaleur latente sans modifier la composition chimique."
        ],
        keywords: ["Solides", "Liquides", "Gaz", "Transitions de phase"],
        quiz: { question: "Quel état de la matière a une forme et un volume fixes?", options: ["Gaz", "Liquide", "Solide", "Plasma"], answer: 2 }
      }
    ]
  },
  mathematics: {
    en: [
      { 
        title: "Integers and Rational Numbers", 
        intro: "Working with positive and negative numbers, fractional values, and the structural properties of number lines in mathematics.", 
        blocks: [
          "Integers encompass all whole numbers alongside their corresponding negative counterparts, extending infinitely in both directions along the number line.", 
          "Rational numbers are defined as numbers that can be expressed as a simple fraction where both numerator and denominator are integers, with a non-zero denominator.", 
          "Operations involving negative integers require strict adherence to sign rules, particularly during multiplication and division where like signs yield positive results.", 
          "Decimal representations of rational numbers either terminate completely or repeat in a predictable cyclical pattern indefinitely."
        ], 
        keywords: ["Integers", "Fractions", "Rational Numbers", "Number Line"], 
        quiz: { question: "Which is an integer?", options: ["1.5", "-4", "3/4", "Pi"], answer: 1 } 
      },
      { 
        title: "Geometry: Lines and Angles", 
        intro: "Understanding basic geometric shapes, spatial dimensions, angle classifications, and the foundational axioms of Euclidean geometry.", 
        blocks: [
          "A line segment is bounded by two distinct endpoints, whereas a line extends infinitely in opposite directions without any terminal boundaries.", 
          "Angles are classified based on their degree measurements into acute, right, obtuse, straight, and reflex categories depending on their opening span.", 
          "Parallel lines lie within the same plane and never intersect regardless of how far they are extended in either direction.", 
          "Transversal lines intersecting two parallel lines create special angle pairs including corresponding, alternate interior, and consecutive interior angles."
        ], 
        keywords: ["Geometry", "Line", "Angle", "Parallel Lines"], 
        quiz: { question: "What is formed by two intersecting lines?", options: ["Circle", "An angle", "Square", "Sphere"], answer: 1 } 
      },
      {
        title: "Algebraic Expressions and Equations", 
        intro: "Learning how to manipulate variables, simplify complex polynomials, and solve single-variable linear equations efficiently.", 
        blocks: [
          "Algebraic expressions combine numbers, variables, and operational symbols without an equality sign, representing general mathematical relationships.", 
          "Like terms containing identical variable components can be combined directly by adding or subtracting their respective numerical coefficients.", 
          "Linear equations establish an equality between two expressions where the highest exponent of the variable is strictly one.", 
          "Isolating the variable requires applying inverse operations symmetrically to both sides of the equation to maintain mathematical balance."
        ],
        keywords: ["Algebra", "Variables", "Linear Equations", "Polynomials"],
        quiz: { question: "What is the highest exponent in a linear equation?", options: ["0", "1", "2", "3"], answer: 1 }
      },
      {
        title: "Data Handling and Statistics", 
        intro: "Collecting, organizing, interpreting, and analyzing numerical datasets using central tendency measures and probability concepts.", 
        blocks: [
          "The mean represents the mathematical average of a dataset, calculated by summing all values and dividing by the total count of numbers.", 
          "The median pinpoints the exact middle value when a dataset is arranged in ascending or descending numerical order.", 
          "The mode identifies the data value that appears with the highest frequency within a given sample collection.", 
          "Probability quantifies the likelihood of a specific event occurring, expressed as a ratio between favorable outcomes and total possible outcomes."
        ],
        keywords: ["Statistics", "Mean", "Median", "Probability"],
        quiz: { question: "What is the average of a dataset called?", options: ["Median", "Mode", "Mean", "Range"], answer: 2 }
      }
    ],
    hi: [
      { 
        title: "पूर्णांक और परिमेय संख्याएँ", 
        intro: "गणित में धनात्मक और ऋणात्मक संख्याओं, भिन्नात्मक मूल्यों और संख्या रेखाओं के संरचनात्मक गुणों के साथ काम करना।", 
        blocks: [
          "पूर्णांकों में संख्या रेखा के साथ दोनों दिशाओं में असीम रूप से विस्तार करते हुए, उनके संबंधित नकारात्मक समकक्षों के साथ सभी पूर्ण संख्याएँ शामिल हैं।", 
          "परिमेय संख्याओं को उन संख्याओं के रूप में परिभाषित किया जाता है जिन्हें एक साधारण भिन्न के रूप में व्यक्त किया जा सकता है जहाँ अंश और हर दोनों पूर्णांक होते हैं, जिसमें गैर-शून्य हर होता है।", 
          "ऋणात्मक पूर्णांकों से जुड़ी संक्रियाओं के लिए चिह्न नियमों का कड़ाई से पालन करना आवश्यक है, विशेष रूप से गुणा और भाग के दौरान जहाँ समान चिह्न सकारात्मक परिणाम देते हैं।", 
          "परिमेय संख्याओं के दशमलव प्रतिनिधित्व या तो पूरी तरह से समाप्त हो जाते हैं या अनिश्चित काल तक एक अनुमानित चक्रीय पैटर्न में दोहराए जाते हैं।"
        ], 
        keywords: ["पूर्णांक", "भिन्न", "परिमेय संख्याएँ", "संख्या रेखा"], 
        quiz: { question: "इनमें से कौन सा पूर्णांक है?", options: ["1.5", "-4", "3/4", "पाई"], answer: 1 } 
      },
      { 
        title: "ज्यामिति: रेखाएँ और कोण", 
        intro: "बुनियादी ज्यामितीय आकृतियों, स्थानिक आयामों, कोण वर्गीकरण और यूक्लिडियन ज्यामिति के मूलभूत स्वयंसिद्धों को समझना।", 
        blocks: [
          "एक रेखा खंड दो अलग-अलग समापन बिंदुओं से घिरा होता है, जबकि एक रेखा बिना किसी टर्मिनल सीमा के विपरीत दिशाओं में अनिश्चित काल तक फैली होती है।", 
          "कोणों को उनके शुरुआती विस्तार के आधार पर तीव्र, समकोण, अधिक, सीधी और प्रतिवर्ती श्रेणियों में उनके डिग्री माप के आधार पर वर्गीकृत किया जाता है।", 
          "समानांतर रेखाएँ एक ही समतल के भीतर स्थित होती हैं और इस बात की परवाह किए बिना कभी प्रतिच्छेद नहीं करती हैं कि उन्हें दोनों दिशाओं में कितनी दूर तक बढ़ाया जाता है।", 
          "दो समांतर रेखाओं को प्रतिच्छेद करने वाली तिर्यक रेखाएँ संगत, एकांतर आंतरिक और क्रमागत आंतरिक कोणों सहित विशेष कोण युग्म बनाती हैं।"
        ], 
        keywords: ["ज्यामिति", "रेखा", "कोण", "समानांतर रेखाएँ"], 
        quiz: { question: "दो प्रतिच्छेदक रेखाओं से क्या बनता है?", options: ["वृत्त", "कोण", "वर्ग", "गोला"], answer: 1 } 
      },
      {
        title: "बीजगणितीय व्यंजक और समीकरण", 
        intro: "चरों में हेरफेर करना, जटिल बहुपदों को सरल बनाना और एकल-चर रैखिक समीकरणों को कुशलता से हल करना सीखना।", 
        blocks: [
          "बीजगणितीय व्यंजक समानता के चिह्न के बिना संख्याओं, चरों और संक्रियात्मक प्रतीकों को मिलाते हैं, जो सामान्य गणितीय संबंधों का प्रतिनिधित्व करते हैं।", 
          "समान चर घटकों वाले समान पदों को उनके संबंधित संख्यात्मक गुणांकों को जोड़कर या घटाकर सीधे जोड़ा जा सकता है।", 
          "रैखिक समीकरण दो व्यंजकों के बीच समानता स्थापित करते हैं जहाँ चर का उच्चतम घातांक कड़ाई से एक होता है।", 
          "गणितीय संतुलन बनाए रखने के लिए समीकरण के दोनों पक्षों पर व्युत्क्रम संक्रियाओं को सममित रूप से लागू करने की आवश्यकता होती है।"
        ],
        keywords: ["बीजगणित", "चर", "रैखिक समीकरण", "बहुपद"],
        quiz: { question: "रैखिक समीकरण में उच्चतम घातांक क्या होता है?", options: ["0", "1", "2", "3"], answer: 1 }
      },
      {
        title: "डेटा प्रबंधन और सांख्यिकी", 
        intro: "केंद्रीय प्रवृत्ति के उपायों और प्रायिकता अवधारणाओं का उपयोग करके संख्यात्मक डेटासेट का संग्रह, संगठन, व्याख्या और विश्लेषण करना।", 
        blocks: [
          "माध्य डेटासेट के गणितीय औसत का प्रतिनिधित्व करता है, जिसकी गणना सभी मानों को जोड़कर और संख्याओं की कुल संख्या से विभाजित करके की जाती है।", 
          "माध्यिका सटीक मध्य मान को इंगित करती है जब किसी डेटासेट को आरोही या अवरोही संख्यात्मक क्रम में व्यवस्थित किया जाता है।", 
          "बहुलक उस डेटा मान की पहचान करता है जो किसी दिए गए नमूना संग्रह के भीतर उच्चतम आवृत्ति के साथ दिखाई देता है।", 
          "प्रायिकता किसी विशिष्ट घटना के होने की संभावना को मात्राबद्ध करती है, जिसे अनुकूल परिणामों और कुल संभावित परिणामों के बीच के अनुपात के रूप में व्यक्त किया जाता है।"
        ],
        keywords: ["सांख्यिकी", "माध्य", "माध्यिका", "प्रायिकता"],
        quiz: { question: "डेटासेट के औसत को क्या कहा जाता है?", options: ["माध्यिका", "बहुलक", "माध्य", "परिसर"], answer: 2 }
      }
    ],
    es: [
      { 
        title: "Números enteros y racionales", 
        intro: "Trabajando con números positivos y negativos, valores fraccionarios y las propiedades estructurales de las rectas numéricas en matemáticas.", 
        blocks: [
          "Los números enteros abarcan todos los números enteros junto con sus correspondientes contrapartes negativas, extendiéndose infinitamente en ambas direcciones a lo largo de la recta numérica.", 
          "Los números racionales se definen como aquellos que se pueden expresar como una fracción simple donde tanto el numerador como el denominador son enteros, con un denominador distinto de cero.", 
          "Las operaciones que involucran enteros negativos requieren un cumplimiento estricto de las reglas de signos, particularmente durante la multiplicación y la división donde signos iguales producen resultados positivos.", 
          "Las representaciones decimales de los números racionales terminan por completo o se repiten en un patrón cíclico predecible indefinidamente."
        ], 
        keywords: ["Enteros", "Fracciones", "Números Racionales", "Recta Numérica"], 
        quiz: { question: "¿Cuál es un número entero?", options: ["1.5", "-4", "3/4", "Pi"], answer: 1 } 
      },
      { 
        title: "Geometría: Líneas y ángulos", 
        intro: "Entendiendo formas geométricas básicas, dimensiones espaciales, clasificaciones de ángulos y los axiomas fundamentales de la geometría euclidiana.", 
        blocks: [
          "Un segmento de línea está limitado por dos puntos finales distintos, mientras que una línea se extiende infinitamente en direcciones opuestas sin límites terminales.", 
          "Los ángulos se clasifican según sus medidas de grado en categorías agudas, rectas, obtusas, llanas y cóncavas dependiendo de su apertura.", 
          "Las líneas paralelas se encuentran dentro del mismo plano y nunca se cruzan independientemente de cuán lejos se extiendan en cualquier dirección.", 
          "Las líneas transversales que se cruzan con dos líneas paralelas crean pares de ángulos especiales que incluyen ángulos correspondientes, alternos internos y consecutivos internos."
        ], 
        keywords: ["Geometría", "Línea", "Ángulo", "Líneas Paralelas"], 
        quiz: { question: "¿Qué se forma por dos líneas que se cruzan?", options: ["Círculo", "Un ángulo", "Cuadrado", "Esfera"], answer: 1 } 
      },
      {
        title: "Expresiones y ecuaciones algebraicas", 
        intro: "Aprender a manipular variables, simplificar polinomios complejos y resolver ecuaciones lineales de una sola variable de manera eficiente.", 
        blocks: [
          "Las expresiones algebraicas combinan números, variables y símbolos operacionales sin un signo de igualdad, representando relaciones matemáticas generales.", 
          "Los términos semejantes que contienen componentes de variables idénticos se pueden combinar directamente sumando o restando sus respectivos coeficientes numéricos.", 
          "Las ecuaciones lineales establecen una igualdad entre dos expresiones donde el exponente más alto de la variable es estrictamente uno.", 
          "El aislamiento de la variable requiere la aplicación de operaciones inversas simétricamente en ambos lados de la ecuación para mantener el equilibrio matemático."
        ],
        keywords: ["Álgebra", "Variables", "Ecuaciones Lineales", "Polinomios"],
        quiz: { question: "¿Cuál es el exponente más alto en una ecuación lineal?", options: ["0", "1", "2", "3"], answer: 1 }
      },
      {
        title: "Manejo de datos y estadística", 
        intro: "Recopilar, organizar, interpretar y analizar conjuntos de datos numéricos utilizando medidas de tendencia central y conceptos de probabilidad.", 
        blocks: [
          "La media representa el promedio matemático de un conjunto de datos, calculado sumando todos los valores y dividiendo por el recuento total de números.", 
          "La mediana señala el valor medio exacto cuando un conjunto de datos se organiza en orden numérico ascendente o descendente.", 
          "La moda identifica el valor de los datos que aparece con la mayor frecuencia dentro de una muestra dada.", 
          "La probabilidad cuantifica la probabilidad de que ocurra un evento específico, expresado como una relación entre los resultados favorables y los resultados totales posibles."
        ],
        keywords: ["Estadística", "Media", "Mediana", "Probabilidad"],
        quiz: { question: "¿Cómo se llama el promedio de un conjunto de datos?", options: ["Mediana", "Moda", "Media", "Rango"], answer: 2 }
      }
    ],
    fr: [
      { 
        title: "Nombres entiers et rationnels", 
        intro: "Travailler avec des nombres positifs et négatifs, des valeurs fractionnaires et les propriétés structurelles des droites numériques en mathématiques.", 
        blocks: [
          "Les nombres entiers englobent tous les nombres entiers ainsi que leurs contreparties négatives correspondantes, s'étendant à l'infini dans les deux directions le long de la droite numérique.", 
          "Les nombres rationnels sont définis comme des nombres pouvant être exprimés sous forme de fraction simple où le numérateur et le dénominateur sont des entiers, avec un dénominateur non nul.", 
          "Les opérations impliquant des entiers négatifs nécessitent un respect strict des règles de signes, en particulier lors de la multiplication et de la division où des signes identiques donnent des résultats positifs.", 
          "Les représentations décimales des nombres rationnels se terminent complètement ou se répètent selon un modèle cyclique prévisible indéfiniment."
        ], 
        keywords: ["Entiers", "Fractions", "Nombres Rationnels", "Droite Numérique"], 
        quiz: { question: "Lequel est un entier?", options: ["1.5", "-4", "3/4", "Pi"], answer: 1 } 
      },
      { 
        title: "Géométrie : Lignes et angles", 
        intro: "Comprendre les formes géométriques de base, les dimensions spatiales, les classifications des angles et les axiomes fondamentaux de la géométrie euclidienne.", 
        blocks: [
          "Un segment de droite est délimité par deux extrémités distinctes, tandis qu'une droite s'étend à l'infini dans des directions opposées sans aucune limite terminale.", 
          "Les angles sont classés en fonction de leurs mesures en degrés dans des catégories aiguës, droites, obliques, plates et rentrantes selon leur ouverture.", 
          "Les lignes parallèles se trouvent dans le même plan et ne se coupent jamais, peu importe la distance sur laquelle elles sont prolongées dans les deux directions.", 
          "Les lignes transversales coupant deux lignes parallèles créent des paires d'angles spéciales comprenant des angles correspondants, alternes-internes et consécutifs internes."
        ], 
        keywords: ["Géométrie", "Ligne", "Angle", "Lignes Parallèles"], 
        quiz: { question: "Qu'est-ce qui est formé par deux lignes sécantes?", options: ["Cercle", "Un angle", "Carré", "Sphère"], answer: 1 } 
      },
      {
        title: "Expressions et équations algébriques", 
        intro: "Apprendre à manipuler des variables, à simplifier des polynômes complexes et à résoudre efficacement des équations linéaires à une seule variable.", 
        blocks: [
          "Les expressions algébriques combinent des nombres, des variables et des symboles opérationnels sans signe d'égalité, représentant des relations mathématiques générales.", 
          "Les termes semblables contenant des composants variables identiques peuvent être combinés directement en additionnant ou en soustrayant leurs coefficients numériques respectifs.", 
          "Les équations linéaires établissent une égalité entre deux expressions où l'exposant le plus élevé de la variable est strictement un.", 
          "L'isolement de la variable nécessite l'application d'opérations inverses de manière symétrique des deux côtés de l'équation pour maintenir l'équilibre mathématique."
        ],
        keywords: ["Algèbre", "Variables", "Équations Linéaires", "Polynômes"],
        quiz: { question: "Quel est l'exposant le plus élevé dans une équation linéaire?", options: ["0", "1", "2", "3"], answer: 1 }
      },
      {
        title: "Traitement des données et statistiques", 
        intro: "Collecter, organiser, interpréter et analyser des ensembles de données numériques en utilisant des mesures de tendance centrale et des concepts de probabilité.", 
        blocks: [
          "La moyenne représente la moyenne mathématique d'un ensemble de données, calculée en additionnant toutes les valeurs et en divisant par le nombre total de chiffres.", 
          "La médiane indique la valeur centrale exacte lorsqu'un ensemble de données est organisé par ordre numérique croissant ou décroissant.", 
          "Le mode identifie la valeur de données qui apparaît avec la fréquence la plus élevée dans un échantillon donné.", 
          "La probabilité quantifie la probabilité qu'un événement spécifique se produise, exprimée comme un rapport entre les résultats favorables et le nombre total de résultats possibles."
        ],
        keywords: ["Statistiques", "Moyenne", "Médiane", "Probabilité"],
        quiz: { question: "Comment appelle-t-on la moyenne d'un ensemble de données?", options: ["Médiane", "Mode", "Moyenne", "Étendue"], answer: 2 }
      }
    ]
  },
  social_science: {
    en: [
      { 
        title: "Our Changing Earth", 
        intro: "Understanding geological movements, tectonic shifts, internal forces, and surface landform evolution over geological timescales.", 
        blocks: [
          "Tectonic plates float atop the semi-fluid asthenosphere, and their continuous interactions cause major earthquakes, volcanic arcs, and mountain building.", 
          "Exogenic forces such as weathering, running water, glacial movement, and wind action continuously carve, transport, and deposit sediments across landscapes.", 
          "Fluvial erosion by rivers creates distinct valley features like canyons, gorges, meanders, and delta systems near river mouths.", 
          "Coastal landforms are continuously reshaped by wave action, longshore drift, and tidal currents forming beaches, cliffs, and arches."
        ], 
        keywords: ["Tectonics", "Earthquakes", "Landforms", "Weathering"], 
        quiz: { question: "What causes earthquakes?", options: ["Wind", "Tectonic plates", "Tides", "Rain"], answer: 1 } 
      },
      { 
        title: "Understanding Democracy", 
        intro: "Learning about democratic governance structures, citizen participation rights, universal franchise, and institutional accountability.", 
        blocks: [
          "Democracy operates as a system of government where ultimate power rests with the citizens who exercise it directly or through elected representatives.", 
          "Universal adult suffrage guarantees that every eligible adult citizen possesses an equal right to vote regardless of wealth, gender, or social status.", 
          "Fundamental rights protected by constitutional frameworks ensure freedom of speech, assembly, religion, and protection against discrimination.", 
          "Checks and balances among the executive, legislative, and judicial branches prevent the concentration of absolute authority and abuse of power."
        ], 
        keywords: ["Democracy", "Voting", "Rights", "Constitution"], 
        quiz: { question: "Who holds the power in a democracy?", options: ["A king", "The citizens", "The military", "A dictator"], answer: 1 } 
      },
      {
        title: "Major Realms of the Earth", 
        intro: "Exploring the four major environmental domains: lithosphere, atmosphere, hydrosphere, and biosphere, and their complex interactions.", 
        blocks: [
          "The lithosphere comprises the solid crust and upper mantle, providing a rocky platform for terrestrial ecosystems and human habitats.", 
          "The atmosphere forms a gaseous envelope rich in nitrogen and oxygen, shielding life from cosmic radiation and regulating global climate.", 
          "The hydrosphere encompasses all liquid and frozen water bodies, covering over seventy percent of the Earth's surface area.", 
          "The biosphere represents the narrow zone of contact where life thrives, sustained by the constant exchange of energy and matter among the other three realms."
        ],
        keywords: ["Lithosphere", "Atmosphere", "Hydrosphere", "Biosphere"],
        quiz: { question: "What percentage of the Earth's surface is roughly covered by water?", options: ["30%", "50%", "70%", "90%"], answer: 2 }
      },
      {
        title: "Traders, Kings, and Pilgrims", 
        intro: "Studying ancient historical trade routes, the rise of powerful kingdoms, economic exchange, and cultural diffusion via travelers.", 
        blocks: [
          "The Silk Road connected ancient civilizations across Asia and Europe, facilitating the lucrative exchange of silk, spices, and precious metals.", 
          "Coastal maritime trade routes enabled kingdoms in southern India to build prosperous commercial ties with Southeast Asia and the Roman Empire.", 
          "The spread of religious philosophies like Buddhism and Hinduism occurred naturally alongside merchant caravans and royal patronage.", 
          "Famous foreign travelers and pilgrims documented detailed accounts of governance, social structures, and daily life in ancient societies."
        ],
        keywords: ["Silk Road", "Trade", "Buddhism", "History"],
        quiz: { question: "What major ancient route connected Asia and Europe for commerce?", options: ["The Amber Road", "The Silk Road", "The Spice Trail", "The Gold Path"], answer: 1 }
      }
    ],
    hi: [
      { 
        title: "हमारी बदलती पृथ्वी", 
        intro: "भूवैज्ञानिक समयमान पर भूवैज्ञानिक आंदोलनों, टेक्टोनिक बदलावों, आंतरिक बलों और सतह के भू-आकृति विकास को समझना।", 
        blocks: [
          "टेक्टोनिक प्लेटें अर्ध-तरल एस्थेनोस्फीयर के ऊपर तैरती हैं, और उनकी निरंतर बातचीत से बड़े पैमाने पर भूकंप, ज्वालामुखी चाप और पहाड़ों का निर्माण होता है।", 
          "अपक्षय, बहता पानी, हिमनद गति और हवा की कार्रवाई जैसे बहिर्गामी बल पूरे परिदृश्य में लगातार तलछट को तराशते, परिवहन करते और जमा करते हैं।", 
          "नदियों द्वारा नदी के कटाव से नदी के मुहानों के पास कैन्यन, गॉर्ज, मेन्डर्स और डेल्टा प्रणालियों जैसी विशिष्ट घाटी विशेषताएं बनती हैं।", 
          "तटीय भू-आकृतियों को लगातार लहरों की कार्रवाई, लंबी तट की धाराओं और ज्वारीय धाराओं द्वारा समुद्र तटों, चट्टानों और मेहराबों का निर्माण करके फिर से आकार दिया जाता है।"
        ], 
        keywords: ["भूकंप", "प्लेटें", "भू-आकृतियां", "अपक्षय"], 
        quiz: { question: "भूकंप का कारण क्या है?", options: ["हवा", "टेक्टोनिक प्लेटें", "ज्वार", "बारिश"], answer: 1 } 
      },
      { 
        title: "लोकतंत्र को समझना", 
        intro: "लोकतांत्रिक शासन संरचनाओं, नागरिक भागीदारी के अधिकारों, सार्वभौमिक मताधिकार और संस्थागत जवाबदेही के बारे में सीखना।", 
        blocks: [
          "लोकतंत्र सरकार की एक प्रणाली के रूप में संचालित होता है जहाँ अंतिम सत्ता उन नागरिकों के पास होती है जो इसका उपयोग सीधे या चुने हुए प्रतिनिधियों के माध्यम से करते हैं।", 
          "सार्वभौमिक वयस्क मताधिकार यह सुनिश्चित करता है कि प्रत्येक योग्य वयस्क नागरिक को धन, लिंग या सामाजिक स्थिति की परवाह किए बिना वोट देने का समान अधिकार प्राप्त हो।", 
          "संवैधानिक ढाँचों द्वारा सुरक्षित मौलिक अधिकार भाषण, सभा, धर्म की स्वतंत्रता और भेदभाव के खिलाफ सुरक्षा सुनिश्चित करते हैं।", 
          "कार्यपालिका, विधायिका और न्यायपालिका के बीच नियंत्रण और संतुलन पूर्ण अधिकार के संकेंद्रण और सत्ता के दुरुपयोग को रोकते हैं।"
        ], 
        keywords: ["लोकतंत्र", "मतदान", "अधिकार", "संविधान"], 
        quiz: { question: "लोकतंत्र में सत्ता किसके पास होती है?", options: ["एक राजा", "नागरिक", "सेना", "एक तानाशाह"], answer: 1 } 
      },
      {
        title: "पृथ्वी के प्रमुख परिमंडल", 
        intro: "चार प्रमुख पर्यावरणीय डोमेन की खोज करना: स्थलमंडल, वायुमंडल, जलमंडल और जीवमंडल, और उनकी जटिल अंतःक्रियाएं।", 
        blocks: [
          "स्थलमंडल में ठोस पर्पल और ऊपरी आवरण शामिल हैं, जो स्थलीय पारिस्थितिकी तंत्र और मानव आवासों के लिए एक चट्टानी मंच प्रदान करते हैं।", 
          "वायुमंडल नाइट्रोजन और ऑक्सीजन से समृद्ध एक गैसीय आवरण बनाता है, जो जीवन को ब्रह्मांडीय विकिरण से बचाता है और वैश्विक जलवायु को नियंत्रित करता है।", 
          "जलमंडल में सभी तरल और जमे हुए जल निकाय शामिल हैं, जो पृथ्वी के सतह क्षेत्र के सत्तर प्रतिशत से अधिक हिस्से को कवर करते हैं।", 
          "जीवमंडल संपर्क के संकीर्ण क्षेत्र का प्रतिनिधित्व करता है जहाँ अन्य तीन परिमंडलों के बीच ऊर्जा और पदार्थ के निरंतर आदान-प्रदान से जीवन पनपता है।"
        ],
        keywords: ["स्थलमंडल", "वायुमंडल", "जलमंडल", "जीवमंडल"],
        quiz: { question: "पृथ्वी की सतह का लगभग कितना प्रतिशत भाग पानी से ढका है?", options: ["30%", "50%", "70%", "90%"], answer: 2 }
      },
      {
        title: "व्यापारी, राजा और तीर्थयात्री", 
        intro: "प्राचीन ऐतिहासिक व्यापार मार्गों, शक्तिशाली राज्यों के उदय, आर्थिक आदान-प्रदान और यात्रियों के माध्यम से सांस्कृतिक प्रसार का अध्ययन करना।", 
        blocks: [
          "सिल्क रोड ने एशिया और यूरोप की प्राचीन सभ्यताओं को जोड़ा, जिससे रेशम, मसालों और कीमती धातुओं के लाभदायक आदान-प्रदान की सुविधा मिली।", 
          "तटीय समुद्री व्यापार मार्गों ने दक्षिण भारत के राज्यों को दक्षिण पूर्व एशिया और रोमन साम्राज्य के साथ समृद्ध वाणिज्यिक संबंध बनाने में सक्षम बनाया।", 
          "बौद्ध धर्म और हिंदू धर्म जैसे धार्मिक दर्शन का प्रसार व्यापारी काफ़िलों और शाही संरक्षण के साथ स्वाभाविक रूप से हुआ।", 
          "प्रसिद्ध विदेशी यात्रियों और तीर्थयात्रियों ने प्राचीन समाजों में शासन, सामाजिक संरचनाओं और दैनिक जीवन के विस्तृत विवरण दर्ज किए।"
        ],
        keywords: ["सिल्क रोड", "व्यापार", "बौद्ध धर्म", "इतिहास"],
        quiz: { question: "वाणिज्य के लिए एशिया और यूरोप को जोड़ने वाला प्रमुख प्राचीन मार्ग कौन सा था?", options: ["एम्बर रोड", "सिल्क रोड", "स्पाइस ट्रेल", "गोल्ड पाथ"], answer: 1 }
      }
    ],
    es: [
      { 
        title: "Nuestra Tierra cambiante", 
        intro: "Entendiendo los movimientos geológicos, los desplazamientos tectónicos, las fuerzas internas y la evolución de las formas del relieve superficial a lo largo de escalas de tiempo geológicas.", 
        blocks: [
          "Las placas tectónicas flotan sobre la astenosfera semifluida y sus interacciones continuas provocan grandes terremotos, arcos volcánicos y la formación de montañas.", 
          "Las fuerzas exógenas como la meteorización, el agua corriente, el movimiento glacial y la acción del viento esculpen, transportan y depositan continuamente sedimentos en los paisajes.", 
          "La erosión fluvial de los ríos crea características de valle distintivas como cañones, gargantas, meandros y sistemas de delta cerca de las desembocaduras de los ríos.", 
          "Las formas del relieve costero son remodeladas continuamente por la acción de las olas, la deriva litoral y las corrientes de marea formando playas, acantilados y arcos."
        ], 
        keywords: ["Tectónica", "Terremotos", "Relieves", "Meteorización"], 
        quiz: { question: "¿Qué causa los terremotos?", options: ["Viento", "Placas tectónicas", "Mareas", "Lluvia"], answer: 1 } 
      },
      { 
        title: "Entendiendo la democracia", 
        intro: "Aprender sobre las estructuras de gobernanza democrática, los derechos de participación ciudadana, el sufragio universal y la rendición de cuentas institucional.", 
        blocks: [
          "La democracia opera como un sistema de gobierno donde el poder supremo recae en los ciudadanos que lo ejercen directamente o a través de representantes electos.", 
          "El sufragio universal de adultos garantiza que todo ciudadano adulto elegible posea el mismo derecho al voto independientemente de su riqueza, género o estatus social.", 
          "Los derechos fundamentales protegidos por los marcos constitucionales garantizan la libertad de expresión, reunión, religión y protección contra la discriminación.", 
          "Los controles y equilibrios entre los poderes ejecutivo, legislativo y judicial evitan la concentración de autoridad absoluta y el abuso de poder."
        ], 
        keywords: ["Democracia", "Votación", "Derechos", "Constitución"], 
        quiz: { question: "¿Quién tiene el poder en una democracia?", options: ["Un rey", "Los ciudadanos", "Los militares", "Un dictador"], answer: 1 } 
      },
      {
        title: "Los principales reinos de la Tierra", 
        intro: "Explorando los cuatro principales dominios ambientales: litosfera, atmósfera, hidrosfera y biosfera, y sus complejas interacciones.", 
        blocks: [
          "La litosfera comprende la corteza sólida y el manto superior, proporcionando una plataforma rocosa para los ecosistemas terrestres y los hábitats humanos.", 
          "La atmósfera forma una capa gaseosa rica en nitrógeno y oxígeno, protegiendo la vida de la radiación cósmica y regulando el clima global.", 
          "La hidrosfera abarca todos los cuerpos de agua líquida y congelada, cubriendo más del setenta por ciento de la superficie de la Tierra.", 
          "La biosfera representa la estrecha zona de contacto donde prospera la vida, sostenida por el intercambio constante de energía y materia entre los otros tres reinos."
        ],
        keywords: ["Litosfera", "Atmósfera", "Hidrosfera", "Biosfera"],
        quiz: { question: "¿Qué porcentaje de la superficie de la Tierra está cubierto aproximadamente por agua?", options: ["30%", "50%", "70%", "90%"], answer: 2 }
      },
      {
        title: "Comerciantes, reyes y peregrinos", 
        intro: "Estudiando las antiguas rutas comerciales históricas, el surgimiento de reinos poderosos, el intercambio económico y la difusión cultural a través de los viajeros.", 
        blocks: [
          "La Ruta de la Seda conectó civilizaciones antiguas en Asia y Europa, facilitando el lucrativo intercambio de seda, especias y metales preciosos.", 
          "Las rutas comerciales marítimas costeras permitieron a los reinos del sur de la India establecer prósperos lazos comerciales con el sudeste asiático y el Imperio Romano.", 
          "La difusión de filosofías religiosas como el budismo y el hinduismo ocurrió naturalmente junto con las caravanas de comerciantes y el patrocinio real.", 
          "Famosos viajeros extranjeros y peregrinos documentaron relatos detallados de gobernanza, estructuras sociales y vida cotidiana en las sociedades antiguas."
        ],
        keywords: ["Ruta de la Seda", "Comercio", "Budismo", "Historia"],
        quiz: { question: "¿Qué gran ruta antigua conectaba Asia y Europa para el comercio?", options: ["El Camino del Ámbar", "La Ruta de la Seda", "La Ruta de las Especias", "El Camino Dorado"], answer: 1 }
      }
    ],
    fr: [
      { 
        title: "Notre Terre en évolution", 
        intro: "Comprendre les mouvements géologiques, les déplacements tectoniques, les forces internes et l'évolution du relief de surface à l'échelle des temps géologiques.", 
        blocks: [
          "Les plaques tectoniques flottent au sommet de l'asthénosphère semi-fluide, et leurs interactions continues provoquent des tremblements de terre majeurs, des arcs volcaniques et la formation de montagnes.", 
          "Les forces exogènes telles que l'altération, l'eau courante, le mouvement des glaciers et l'action du vent sculptent, transportent et déposent continuellement des sédiments à travers les paysages.", 
          "L'érosion fluviale par les rivières crée des caractéristiques de vallée distinctes telles que des canyons, des gorges, des méandres et des systèmes de deltas près des embouchures des rivières.", 
          "Les reliefs côtiers sont continuellement remodelés par l'action des vagues, la dérive littorale et les courants de marée formant des plages, des falaises et des arches."
        ], 
        keywords: ["Tectonique", "Séismes", "Reliefs", "Altération"], 
        quiz: { question: "Qu'est-ce qui cause les séismes?", options: ["Vent", "Plaques tectoniques", "Marées", "Pluie"], answer: 1 } 
      },
      { 
        title: "Comprendre la démocratie", 
        intro: "Découverte des structures de gouvernance démocratique, des droits de participation citoyenne, du suffrage universel et de la responsabilité institutionnelle.", 
        blocks: [
          "La démocratie fonctionne comme un système de gouvernement où le pouvoir ultime réside chez les citoyens qui l'exercent directement ou par l'intermédiaire de représentants élus.", 
          "Le suffrage universel des adultes garantit que chaque citoyen adulte éligible possède un droit de vote égal, indépendamment de sa fortune, de son genre ou de son statut social.", 
          "Les droits fondamentaux protégés par les cadres constitutionnels garantissent la liberté d'expression, de réunion, de religion et la protection contre la discrimination.", 
          "Les freins et contrepoids entre les pouvoirs exécutif, législatif et judiciaire empêchent la concentration d'une autorité absolue et l'abus de pouvoir."
        ], 
        keywords: ["Démocratie", "Vote", "Droits", "Constitution"], 
        quiz: { question: "Qui détient le pouvoir dans une démocratie?", options: ["Un roi", "Les citoyens", "L'armée", "Un dictateur"], answer: 1 } 
      },
      {
        title: "Les principaux domaines de la Terre", 
        intro: "Exploration des quatre grands domaines environnementaux : lithosphère, atmosphère, hydrosphère et biosphère, et de leurs interactions complexes.", 
        blocks: [
          "La lithosphère comprend la croûte solide et le manteau supérieur, fournissant une plate-forme rocheuse pour les écosystèmes terrestres et les habitats humains.", 
          "L'atmosphère forme une enveloppe gazeuse riche en azote et en oxygène, protégeant la vie des rayonnements cosmiques et régulant le climat mondial.", 
          "L'hydrosphère englobe tous les plans d'eau liquide et gelée, couvrant plus de soixante-dix pour cent de la surface de la Terre.", 
          "La biosphère représente la zone de contact étroite où la vie prospère, soutenue par l'échange constant d'énergie et de matière entre les trois autres domaines."
        ],
        keywords: ["Lithosphère", "Atmosphère", "Hydrosphère", "Biosphère"],
        quiz: { question: "Quel pourcentage de la surface de la Terre est approximativement recouvert d'eau?", options: ["30%", "50%", "70%", "90%"], answer: 2 }
      },
      {
        title: "Marchands, rois et pèlerins", 
        intro: "Étude des anciennes routes commerciales historiques, de l'essor de royaumes puissants, des échanges économiques et de la diffusion culturelle par les voyageurs.", 
        blocks: [
          "La Route de la Soie a relié les anciennes civilisations à travers l'Asie et l'Europe, facilitant l'échange lucratif de soie, d'épices et de métaux précieux.", 
          "Les routes commerciales maritimes côtières ont permis aux royaumes du sud de l'Inde d'établir des liens commerciaux prospères avec l'Asie du Sud-Est et l'Empire romain.", 
          "La diffusion de philosophies religieuses telles que le bouddhisme et l'hindouisme s'est produite naturellement aux côtés des caravanes de marchands et du mécénat royal.", 
          "De célèbres voyageurs étrangers et pèlerins ont documenté des comptes rendus détaillés de la gouvernance, des structures sociales et de la vie quotidienne dans les sociétés anciennes."
        ],
        keywords: ["Route de la Soie", "Commerce", "Bouddhisme", "Histoire"],
        quiz: { question: "Quelle grande route antique reliait l'Asie et l'Europe pour le commerce?", options: ["La route de l'ambre", "La route de la soie", "La route des épices", "Le chemin doré"], answer: 1 }
      }
    ]
  },
  english: {
    en: [
      { 
        title: "Grammar: Active and Passive Voice", 
        intro: "Mastering complex sentence structures, thematic focus shifts, and verb transformations between active and passive constructions.", 
        blocks: [
          "The active voice highlights the subject performing the action directly, creating a clear, direct, and energetic sentence style.", 
          "The passive voice places emphasis on the receiver of the action, often used when the agent is unknown, irrelevant, or intentionally concealed.", 
          "Transforming a sentence from active to passive requires making the direct object the new subject while changing the main verb into its appropriate past participle form preceded by auxiliary 'to be'.", 
          "Overusing the passive voice can make academic or creative writing sound overly formal, detached, or vague compared to active phrasing."
        ], 
        keywords: ["Active Voice", "Passive Voice", "Verb", "Syntax"], 
        quiz: { question: "Which focuses on the receiver of the action?", options: ["Active voice", "Passive voice", "Direct speech", "Imperative"], answer: 1 } 
      },
      { 
        title: "Figures of Speech", 
        intro: "Enhancing descriptive writing, creative expression, and rhetorical depth through figurative language tools and poetic devices.", 
        blocks: [
          "Similes draw explicit comparisons between two distinct things using connecting words such as 'like' or 'as' to highlight shared characteristics.", 
          "Metaphors make implicit, imaginative comparisons by stating that one thing literally is another, creating deeper symbolic resonance.", 
          "Personification attributes human qualities, emotions, or intentional actions to inanimate objects, abstract concepts, or natural elements.", 
          "Hyperbole employs intentional exaggeration for dramatic effect, emphasis, or humor without intending to be taken literally."
        ], 
        keywords: ["Simile", "Metaphor", "Personification", "Hyperbole"], 
        quiz: { question: "Which uses 'like' or 'as' to compare?", options: ["Metaphor", "Simile", "Personification", "Hyperbole"], answer: 1 } 
      },
      {
        title: "Direct and Indirect Speech", 
        intro: "Understanding how to report dialogue accurately by converting direct quotations into indirect or reported speech structures.", 
        blocks: [
          "Direct speech captures the exact words spoken by a speaker, enclosed consistently within quotation marks and set off by reporting verbs.", 
          "Indirect speech conveys the general substance of what someone said without using their exact quoted words, eliminating quotation marks.", 
          "Converting speech requires shifting verb tenses backward, such as changing present simple into past simple, to reflect the passage of time.", 
          "Pronouns, time indicators, and place words must also be adjusted appropriately to maintain grammatical logic and contextual accuracy in reported speech."
        ],
        keywords: ["Direct Speech", "Indirect Speech", "Narration", "Grammar"],
        quiz: { question: "What changes when converting direct speech to indirect speech?", options: ["Only punctuation", "Verb tenses and pronouns", "Nothing", "Only the speaker's name"], answer: 1 }
      },
      {
        title: "Reading Comprehension and Critical Analysis", 
        intro: "Developing advanced strategies for analyzing literary themes, identifying authorial intent, and extracting contextual meaning from complex texts.", 
        blocks: [
          "Skimming allows readers to quickly scan a text to grasp the general overview, main headings, and overall structural layout.", 
          "Scanning involves searching rapidly through a text to locate specific factual details, names, dates, or keywords without deep reading.", 
          "Inferencing requires combining explicit textual clues with background knowledge to deduce unstated conclusions or underlying character motives.", 
          "Critical analysis evaluates an author's tone, rhetorical arguments, structural biases, and persuasive techniques used within the written work."
        ],
        keywords: ["Comprehension", "Analysis", "Inference", "Reading"],
        quiz: { question: "What reading strategy is used to find specific facts quickly?", options: ["Skimming", "Scanning", "Deep reading", "Proofreading"], answer: 1 }
      }
    ],
    hi: [
      { 
        title: "व्याकरण: कर्तृवाच्य और कर्मवाच्य", 
        intro: "जटिल वाक्य संरचनाओं, विषयगत फोकस बदलावों और सक्रिय और निष्क्रिय संरचनाओं के बीच क्रिया परिवर्तनों में महारत हासिल करना।", 
        blocks: [
          "कर्तृवाच्य उस विषय को उजागर करता है जो सीधे कार्रवाई कर रहा है, जिससे एक स्पष्ट, प्रत्यक्ष और ऊर्जावान वाक्य शैली बनती है।", 
          "कर्मवाच्य कार्रवाई के प्राप्तकर्ता पर जोर देता है, अक्सर तब उपयोग किया जाता है जब एजेंट अज्ञात, अप्रासंगिक या जानबूझकर छुपाया गया हो।", 
          "वाक्य को कर्तृवाच्य से कर्मवाच्य में बदलने के लिए प्रत्यक्ष वस्तु को सहायक 'होना' से पहले इसके उपयुक्त पिछले कृदंत रूप में मुख्य क्रिया को बदलते हुए नया विषय बनाने की आवश्यकता होती है।", 
          "कर्मवाच्य का अति प्रयोग सक्रिय वाक्यांश की तुलना में शैक्षणिक या रचनात्मक लेखन को अत्यधिक औपचारिक, अलग या अस्पष्ट लग सकता है।"
        ], 
        keywords: ["कर्तृवाच्य", "कर्मवाच्य", "क्रिया", "वाक्य रचना"], 
        quiz: { question: "कर्मवाच्य में किसका प्रधान होता है?", options: ["कर्ता", "कर्म", "क्रिया", "इनमें से कोई नहीं"], answer: 1 } 
      },
      { 
        title: "अलंकार (Figures of Speech)", 
        intro: "अलंकारिक भाषा उपकरणों और काव्यात्मक उपकरणों के माध्यम से वर्णनात्मक लेखन, रचनात्मक अभिव्यक्ति और बयानबाजी की गहराई को बढ़ाना।", 
        blocks: [
          "उपमा साझा विशेषताओं को उजागर करने के लिए 'जैसे' या 'समान' जैसे कनेक्टिंग शब्दों का उपयोग करके दो अलग-अलग चीजों के बीच स्पष्ट तुलना करती है।", 
          "रूपक यह बताकर कि एक चीज शाब्दिक रूप से दूसरी है, गहरी प्रतीकात्मक गूंज पैदा करते हुए निहित, कल्पनाशील तुलना करते हैं।", 
          "मानवीकरण निर्जीव वस्तुओं, अमूर्त अवधारणाओं या प्राकृतिक तत्वों के लिए मानवीय गुणों, भावनाओं या जानबूझकर किए गए कार्यों का श्रेय देता है।", 
          "अतिशयोक्ति शाब्दिक रूप से लेने के इरादे के बिना नाटकीय प्रभाव, जोर या हास्य के लिए जानबूझकर अतिशयोक्ति का उपयोग करती है।"
        ], 
        keywords: ["उपमा", "रूपक", "मानवीकरण", "अतिशयोक्ति"], 
        quiz: { question: "कौन सा तुलना करने के लिए 'जैसे' या 'समान' का उपयोग करता है?", options: ["रूपक", "उपमा", "मानवीकरण", "अतिशयोक्ति"], answer: 1 } 
      },
      {
        title: "प्रत्यक्ष और अप्रत्यक्ष भाषण", 
        intro: "प्रत्यक्ष उद्धरणों को अप्रत्यक्ष या रिपोर्ट किए गए भाषण संरचनाओं में परिवर्तित करके संवाद की सटीक रिपोर्ट करना समझना।", 
        blocks: [
          "प्रत्यक्ष भाषण एक वक्ता द्वारा बोले गए सटीक शब्दों को कैप्चर करता है, जिसे लगातार उद्धरण चिह्नों के भीतर संलग्न किया जाता है और रिपोर्टिंग क्रियाओं द्वारा बंद किया जाता है।", 
          "अप्रत्यक्ष भाषण उनके सटीक उद्धृत शब्दों का उपयोग किए बिना किसी के द्वारा कही गई बात के सामान्य सार को व्यक्त करता है, उद्धरण चिह्नों को समाप्त करता है।", 
          "भाषण को बदलने के लिए समय बीतने को प्रतिबिंबित करने के लिए, वर्तमान साधारण को अतीत साधारण में बदलने जैसे क्रिया काल को पीछे की ओर स्थानांतरित करने की आवश्यकता होती है।", 
          "रिपोर्ट किए गए भाषण में व्याकरण संबंधी तर्क और प्रासंगिक सटीकता बनाए रखने के लिए सर्वनाम, समय संकेतक और स्थान शब्दों को भी उचित रूप से समायोजित किया जाना चाहिए।"
        ],
        keywords: ["प्रत्यक्ष भाषण", "अप्रत्यक्ष भाषण", "वर्णन", "व्याकरण"],
        quiz: { question: "प्रत्यक्ष भाषण को अप्रत्यक्ष भाषण में बदलते समय क्या बदलता है?", options: ["केवल विराम चिह्न", "क्रिया काल और सर्वनाम", "कुछ नहीं", "केवल वक्ता का नाम"], answer: 1 }
      },
      {
        title: "पठन बोध और आलोचनात्मक विश्लेषण", 
        intro: "साहित्यिक विषयों का विश्लेषण करने, लेखक के इरादे की पहचान करने और जटिल ग्रंथों से प्रासंगिक अर्थ निकालने के लिए उन्नत रणनीतियों का विकास करना।", 
        blocks: [
          "त्वरित पठन (Skimming) पाठकों को सामान्य अवलोकन, मुख्य शीर्षक और समग्र संरचनात्मक लेआउट को समझने के लिए पाठ को जल्दी से स्कैन करने की अनुमति देता है।", 
          "स्कैनिंग में गहरे पठन के बिना विशिष्ट तथ्यात्मक विवरण, नाम, तिथियों या कीवर्ड का पता लगाने के लिए पाठ के माध्यम से तेزی से खोजना शामिल है।", 
          "अनुमान लगाने के लिए बिना कहे निष्कर्षों या अंतर्निहित चरित्र उद्देश्यों को घटाने के लिए पृष्ठभूमि ज्ञान के साथ स्पष्ट पाठ्य सुरागों को संयोजित करने की आवश्यकता होती है।", 
          "आलोचनात्मक विश्लेषण लिखित कार्य के भीतर उपयोग किए जाने वाले लेखक के स्वर, बयानबाजी के तर्क, संरचनात्मक पूर्वाग्रहों और प्रेरक तकनीकों का मूल्यांकन करता है।"
        ],
        keywords: ["समझ", "विश्लेषण", "अनुमान", "पठन"],
        quiz: { question: "विशिष्ट तथ्यों को जल्दी से खोजने के लिए किस पठन रणनीति का उपयोग किया जाता है?", options: ["त्वरित पठन", "स्कैनिंग", "गहरा पठन", "प्रूफ़रीडिंग"], answer: 1 }
      }
    ],
    es: [
      { 
        title: "Gramática: Voz activa y pasiva", 
        intro: "Dominando estructuras de oraciones complejas, cambios de enfoque temático y transformaciones verbales entre construcciones activas y pasivas.", 
        blocks: [
          "La voz activa destaca al sujeto que realiza la acción directamente, creando un estilo de oración claro, directo y enérgico.", 
          "La voz pasiva enfatiza al receptor de la acción, utilizándose a menudo cuando el agente es desconocido, irrelevante o se oculta intencionalmente.", 
          "Transformar una oración de activa a pasiva requiere convertir el objeto directo en el nuevo sujeto mientras se cambia el verbo principal a su forma de participio pasado adecuada precedido por el auxiliar 'ser'.", 
          "El uso excesivo de la voz pasiva puede hacer que la escritura académica o creativa suene demasiado formal, distante o vaga en comparación con la redacción activa."
        ], 
        keywords: ["Voz Activa", "Voz Pasiva", "Verbo", "Sintaxis"], 
        quiz: { question: "¿Qué voz destaca el objeto?", options: ["Voz activa", "Voz pasiva", "Directa", "Imperativa"], answer: 1 } 
      },
      { 
        title: "Figuras retóricas", 
        intro: "Mejorando la escritura descriptiva, la expresión creativa y la profundidad retórica a través de herramientas de lenguaje figurativo y recursos poéticos.", 
        blocks: [
          "Los símiles establecen comparaciones explícitas entre dos cosas distintas utilizando palabras de enlace como 'como' para resaltar características compartidas.", 
          "Las metáforas hacen comparaciones implícitas e imaginativas al afirmar que una cosa literalmente es otra, creando una resonancia simbólica más profunda.", 
          "La personificación atribuye cualidades humanas, emociones o acciones intencionales a objetos inanimados, conceptos abstractos o elementos naturales.", 
          "La hipérbole emplea una exageración intencional para lograr un efecto dramático, énfasis o humor sin la intención de ser tomada literalmente."
        ], 
        keywords: ["Símil", "Metáfora", "Personificación", "Hipérbole"], 
        quiz: { question: "¿Cuál usa 'como' para comparar?", options: ["Metáfora", "Símil", "Personificación", "Hipérbole"], answer: 1 } 
      },
      {
        title: "Discurso directo e indirecto", 
        intro: "Comprender cómo reportar diálogos con precisión convirtiendo citas directas en estructuras de discurso indirecto o reportado.", 
        blocks: [
          "El discurso directo captura las palabras exactas pronunciadas por un hablante, encerradas consistentemente entre comillas y separadas por verbos informativos.", 
          "El discurso indirecto transmite la sustancia general de lo que alguien dijo sin usar sus palabras exactas citadas, eliminando las comillas.", 
          "La conversión del discurso requiere retroceder los tiempos verbales, como cambiar el presente simple al pasado simple, para reflejar el paso del tiempo.", 
          "Los pronombres, los indicadores de tiempo y las palabras de lugar también deben ajustarse adecuadamente para mantener la lógica gramatical y la precisión contextual en el discurso reportado."
        ],
        keywords: ["Discurso Directo", "Discurso Indirecto", "Narración", "Gramática"],
        quiz: { question: "¿Qué cambia al convertir el discurso directo en discurso indirecto?", options: ["Solo puntuación", "Tiempos verbales y pronombres", "Nada", "Solo el nombre del hablante"], answer: 1 }
      },
      {
        title: "Comprensión lectora y análisis crítico", 
        intro: "Desarrollando estrategias avanzadas para analizar temas literarios, identificar la intención del autor y extraer significado contextual de textos complejos.", 
        blocks: [
          "La lectura veloz permite a los lectores hojear rápidamente un texto para captar la visión general, los encabezados principales y la estructura general.", 
          "La búsqueda rápida implica buscar rápidamente a través de un texto para localizar detalles fácticos específicos, nombres, fechas o palabras clave sin una lectura profunda.", 
          "La inferencia requiere combinar pistas textuales explícitas con conocimientos previos para deducir conclusiones no expresadas o motivos de los personajes subyacentes.", 
          "El análisis crítico evalúa el tono del autor, los argumentos retóricos, los sesgos estructurales y las técnicas persuasivas utilizadas dentro de la obra escrita."
        ],
        keywords: ["Comprensión", "Análisis", "Inferencia", "Lectura"],
        quiz: { question: "¿Qué estrategia de lectura se utiliza para encontrar hechos específicos rápidamente?", options: ["Lectura veloz", "Búsqueda rápida", "Lectura profunda", "Corrección de pruebas"], answer: 1 }
      }
    ],
    fr: [
      { 
        title: "Grammaire : Voix active et passive", 
        intro: "Maîtriser des structures de phrases complexes, des changements de focalisation thématique et des transformations verbales entre constructions actives et passives.", 
        blocks: [
          "La voix active met en valeur le sujet effectuant directement l'action, créant un style de phrase clair, direct et énergique.", 
          "La voix passive met l'accent sur le récepteur de l'action, souvent utilisé lorsque l'agent est inconnu, non pertinent ou intentionnellement dissimulé.", 
          "Transformer une phrase de la voix active à la voix passive nécessite de faire du objet direct le nouveau sujet tout en modifiant le verbe principal en sa forme de participe passé appropriée précédée de l'auxiliaire 'être'.", 
          "L'utilisation excessive de la voix passive peut donner à un texte académique ou créatif un son trop formel, distant ou vague par rapport à un phrasé actif."
        ], 
        keywords: ["Voix Active", "Voix Passive", "Verbe", "Syntaxe"], 
        quiz: { question: "Lequel met l'accent sur l'objet?", options: ["Voix active", "Voix passive", "Directe", "Impérative"], answer: 1 } 
      },
      { 
        title: "Figures de style", 
        intro: "Améliorer l'écriture descriptive, l'expression créative et la profondeur rhétorique grâce à des outils de langage figuratif et des procédés poétiques.", 
        blocks: [
          "Les comparaisons établissent des parallèles explicites entre deux choses distinctes en utilisant des mots de liaison tels que 'comme' pour mettre en valeur des caractéristiques partagées.", 
          "Les métaphores font des comparaisons implicites et imaginatives en affirmant qu'une chose est littéralement une autre, créant une résonance symbolique plus profonde.", 
          "La personification attribue des qualités humaines, des émotions ou des actions intentionnelles à des objets inanimés, des concepts abstraits ou des éléments naturels.", 
          "L'hyperbole emploie une exagération intentionnelle pour un effet dramatique, de l'emphase ou de l'humour sans intention d'être prise au pied de la lettre."
        ], 
        keywords: ["Comparaison", "Métaphore", "Personnification", "Hyperbole"], 
        quiz: { question: "Lequel utilise 'comme' pour comparer?", options: ["Métaphore", "Comparaison", "Personnification", "Hyperbole"], answer: 1 } 
      },
      {
        title: "Discours direct et indirect", 
        intro: "Comprendre comment rapporter des dialogues avec précision en convertissant des citations directes en structures de discours indirect ou rapporté.", 
        blocks: [
          "Le discours direct capture les mots exacts prononcés par un locuteur, enfermés systématiquement entre guillemets et introduits par des verbes introducteurs.", 
          "Le discours indirect transmet la substance générale de ce que quelqu'un a dit sans utiliser ses mots exacts cités, éliminant les guillemets.", 
          "La conversion du discours nécessite de reculer les temps des verbes, comme changer le présent simple en passé simple, pour refléter le passage du temps.", 
          "Les pronoms, les indicateurs temporels et les mots de lieu doivent également être ajustés de manière appropriée pour maintenir la logique grammaticale et la précision contextuelle dans le discours rapporté."
        ],
        keywords: ["Discours Direct", "Discours Indirect", "Narration", "Grammaire"],
        quiz: { question: "Qu'est-ce qui change lors de la conversion du discours direct en discours indirect?", options: ["Uniquement la ponctuation", "Les temps des verbes et les pronoms", "Rien", "Uniquement le nom du locuteur"], answer: 1 }
      },
      {
        title: "Compréhension de lecture et analyse critique", 
        intro: "Développer des stratégies avancées pour analyser des thèmes littéraires, identifier l'intention de l'auteur et extraire un sens contextuel de textes complexes.", 
        blocks: [
          "Le survol permet aux lecteurs de parcourir rapidement un texte pour saisir l'aperçu général, les principaux en-têtes et la disposition structurelle globale.", 
          "Le balayage consiste à chercher rapidement dans un texte pour localiser des détails factuels spécifiques, des noms, des dates ou des mots-clés sans lecture approfondie.", 
          "L'inférence nécessite de combiner des indices textuels explicites avec des connaissances préalables pour déduire des conclusions non formulées ou des motivations sous-jacentes des personnages.", 
          "L'analyse critique évalue le ton d'un auteur, ses arguments rhétoriques, ses biais structurels et les techniques persuasives utilisées dans l'œuvre écrite."
        ],
        keywords: ["Compréhension", "Analyse", "Inférence", "Lecture"],
        quiz: { question: "Quelle stratégie de lecture est utilisée pour trouver rapidement des faits spécifiques?", options: ["Survol", "Balayage", "Lecture approfondie", "Correction d'épreuves"], answer: 1 }
      }
    ]
  },
  computer_science: {
    en: [
      { 
        title: "Introduction to Algorithms", 
        intro: "Learning step-by-step logical frameworks, computational problem-solving, and efficiency analysis for software engineering.", 
        blocks: [
          "An algorithm represents a finite, unambiguous sequence of precise computational instructions designed to solve a specific class of problems.", 
          "Flowcharts provide a visual blueprint of algorithmic workflows using standardized geometric symbols to depict process steps and decisions.", 
          "Pseudocode bridges the gap between human language and actual programming syntax, allowing developers to map out logic clearly.", 
          "Algorithmic efficiency is measured through time complexity and space complexity to evaluate scalability under large datasets."
        ], 
        keywords: ["Algorithm", "Logic", "Flowchart", "Pseudocode"], 
        quiz: { question: "What is an algorithm?", options: ["A hardware part", "A step-by-step set of instructions", "A bug", "A database"], answer: 1 } 
      },
      { 
        title: "Basics of Networking", 
        intro: "Understanding how computers communicate, data packets travel across infrastructure, and global connectivity protocols operate.", 
        blocks: [
          "A computer network connects multiple independent hardware devices together to share resources, printers, and data storage files securely.", 
          "The Internet serves as the world's largest interconnected packet-switching global network utilizing standard TCP/IP communication protocols.", 
          "Routers direct data traffic efficiently across distinct network boundaries by determining the optimal path for information packets.", 
          "Cloud computing infrastructure allows users to store data and execute applications on remote server farms rather than local hard drives."
        ], 
        keywords: ["Network", "Internet", "Connection", "Protocols"], 
        quiz: { question: "What is the largest global network?", options: ["Intranet", "The Internet", "Bluetooth", "A router"], answer: 1 } 
      },
      {
        title: "Fundamentals of Programming", 
        intro: "Exploring core software development concepts including variables, control structures, conditional branching, and modular loops.", 
        blocks: [
          "Variables act as named memory containers used within code execution to store, modify, and retrieve various types of data values.", 
          "Conditional statements like if-else structures allow programs to make decisions and execute different code blocks based on criteria.", 
          "Loops (for and while) automate repetitive tasks by executing a block of code multiple times until a terminating condition is met.", 
          "Functions modularize code into reusable blocks, promoting clean architecture, code reusability, and easier debugging maintenance."
        ],
        keywords: ["Programming", "Variables", "Loops", "Functions"],
        quiz: { question: "What structure is used to repeat code execution?", options: ["Variable", "Loop", "Comment", "String"], answer: 1 }
      },
      {
        title: "Cybersecurity Basics", 
        intro: "Learning essential principles for protecting digital systems, securing personal data, and recognizing online threats.", 
        blocks: [
          "Encryption transforms readable plaintext into scrambled ciphertexts to prevent unauthorized interception during data transmission.", 
          "Strong password management practices, including multi-factor authentication, protect online accounts against brute-force intrusion attacks.", 
          "Phishing attacks involve deceptive social engineering tactics designed to trick users into revealing sensitive credential information.", 
          "Firewalls monitor and filter incoming and outgoing network traffic based on predetermined security rules to block malicious access."
        ],
        keywords: ["Cybersecurity", "Encryption", "Password", "Firewall"],
        quiz: { question: "What security method uses multiple steps to verify user identity?", options: ["Single sign-on", "Multi-factor authentication", "Plaintext", "Hypertext"], answer: 1 }
      }
    ],
    hi: [
      { 
        title: "एल्गोरिदम का परिचय", 
        intro: "सॉफ्टवेयर इंजीनियरिंग के लिए चरण-दर-चरण तार्किक ढांचे, कम्प्यूटेशनल समस्या-समाधान और दक्षता विश्लेषण सीखना।", 
        blocks: [
          "एक एल्गोरिदम समस्याओं की एक विशिष्ट कक्षा को हल करने के लिए डिज़ाइन किए गए सटीक कम्प्यूटेशनल निर्देशों का एक परिमित, स्पष्ट क्रम का प्रतिनिधित्व करता है.", 
          "फ़्लोचार्ट प्रक्रिया चरणों और निर्णयों को दर्शाने के लिए मानक ज्यामितीय प्रतीकों का उपयोग करके एल्गोरिथम वर्कफ़्लो का एक दृश्य ब्लूप्रिंट प्रदान करते हैं।", 
          "छद्म कोड (Pseudocode) मानवीय भाषा और वास्तविक प्रोग्रामिंग सिंटैक्स के बीच की खाई को पाटता है, जिससे डेवलपर्स को तर्क को स्पष्ट रूप से मैप करने की अनुमति मिलती है।", 
          "बड़े डेटासेट के तहत मापनीयता का मूल्यांकन करने के लिए एल्गोरिथम दक्षता को समय जटिलता और अंतरिक्ष जटिलता के माध्यम से मापा जाता है।"
        ], 
        keywords: ["एल्गोरिदम", "तर्क", "फ़्लोचार्ट", "छद्म कोड"], 
        quiz: { question: "एल्गोरिदम क्या है?", options: ["हार्डवेयर", "चरण-दर-चरण निर्देश", "बग", "डेटाबेस"], answer: 1 } 
      },
      { 
        title: "नेटवर्किंग की मूल बातें", 
        intro: "यह समझना कि कंप्यूटर कैसे संवाद करते हैं, डेटा पैकेट बुनियादी ढांचे में कैसे यात्रा करते हैं, और वैश्विक कनेक्टिविटी प्रोटोकॉल कैसे काम करते हैं।", 
        blocks: [
          "एक कंप्यूटर नेटवर्क संसाधनों, प्रिंटर और डेटा स्टोरेज फ़ाइलों को सुरक्षित रूप से साझा करने के लिए कई स्वतंत्र हार्डवेयर उपकरणों को एक साथ जोड़ता है।", 
          "इंटरनेट मानक टीसीपी/आईपी संचार प्रोटोकॉल का उपयोग करने वाले दुनिया के सबसे बड़े इंटरकनेक्टेड पैकेट-स्विचिंग वैश्विक नेटवर्क के रूप में कार्य करता है।", 
          "राउटर सूचना पैकेट के लिए इष्टतम पथ निर्धारित करके अलग-अलग नेटवर्क सीमाओं में डेटा ट्रैफ़िक को कुशलता से निर्देशित करते हैं।", 
          "क्लाउड कंप्यूटिंग बुनियादी ढांचा उपयोगकर्ताओं को स्थानीय हार्ड ड्राइव के बजाय दूरस्थ सर्वर खेतों पर डेटा संग्रहीत करने और एप्लिकेशन निष्पादित करने की अनुमति देता है।"
        ], 
        keywords: ["नेटवर्क", "इंटरनेट", "कनेक्शन", "प्रोटोकॉल"], 
        quiz: { question: "सबसे बड़ा वैश्विक नेटवर्क क्या है?", options: ["इंट्रानेट", "इंटरनेट", "ब्लूटूथ", "एक राउटर"], answer: 1 } 
      },
      {
        title: "प्रोग्रामिंग के मूल सिद्धांत", 
        intro: "चर, नियंत्रण संरचनाओं, सशर्त शाखाओं और मॉड्यूलर लूप सहित कोर सॉफ्टवेयर विकास अवधारणाओं की खोज करना।", 
        blocks: [
          "चर विभिन्न प्रकार के डेटा मानों को संग्रहीत करने, संशोधित करने और पुनर्प्राप्त करने के लिए कोड निष्पादन के भीतर उपयोग किए जाने वाले नामित मेमोरी कंटेनर के रूप में कार्य करते हैं।", 
          "यदि-अन्य संरचनाओं जैसे सशर्त कथन कार्यक्रमों को निर्णय लेने और मानदंडों के आधार पर विभिन्न कोड ब्लॉकों को निष्पादित करने की अनुमति देते हैं।", 
          "लूप (फॉर और व्हाइल) एक समाप्ति स्थिति पूरी होने तक कई बार कोड के एक ब्लॉक को निष्पादित करके दोहराए जाने वाले कार्यों को स्वचालित करते हैं।", 
          "फ़ंक्शन कोड को पुन: प्रयोज्य ब्लॉकों में मॉड्यूलर बनाते हैं, स्वच्छ वास्तुकला, कोड पुन: प्रयोज्यता और आसान डिबगिंग रखरखाव को बढ़ावा देते हैं।"
        ],
        keywords: ["प्रोग्रामिंग", "चर", "लूप", "फ़ंक्शन"],
        quiz: { question: "कोड निष्पादन को दोहराने के लिए किस संरचना का उपयोग किया जाता है?", options: ["चर", "लूप", "टिप्पणी", "स्ट्रिंग"], answer: 1 }
      },
      {
        title: "साइबर सुरक्षा की मूल बातें", 
        intro: "डिजिटल प्रणालियों की रक्षा करने, व्यक्तिगत डेटा को सुरक्षित करने और ऑनलाइन खतरों को पहचानने के लिए आवश्यक सिद्धांत सीखना।", 
        blocks: [
          "एन्क्रिप्शन डेटा संचरण के दौरान अनधिकृत अवरोधन को रोकने के लिए पठनीय सादे पाठ को प्रलाप सिphertext में बदल देता है।", 
          "मल्टी-फर्क्टर प्रमाणीकरण सहित मजबूत पासवर्ड प्रबंधन अभ्यास, ऑनलाइन खातों को ब्रूट-फोर्स घुसपैठ के हमलों से बचाते हैं।", 
          "फ़िशिंग हमलों में उपयोगकर्ताओं को संवेदनशील क्रेडेंशियल जानकारी प्रकट करने के लिए बरगलाने के लिए डिज़ाइन की गई भ्रामक सामाजिक इंजीनियरिंग रणनीति शामिल होती है।", 
          "फ़ायरवॉल दुर्भावनापूर्ण पहुंच को ब्लॉक करने के लिए पूर्व निर्धारित सुरक्षा नियमों के आधार पर आने वाले और जाने वाले नेटवर्क ट्रैफ़िक की निगरानी और फ़िल्टर करते हैं।"
        ],
        keywords: ["साइबर सुरक्षा", "एन्क्रिप्शन", "पासवर्ड", "फ़ायरवॉल"],
        quiz: { question: "उपयोगकर्ता की पहचान सत्यापित करने के लिए कौन सी सुरक्षा पद्धति कई चरणों का उपयोग करती है?", options: ["सिंगल साइन-ऑन", "मल्टी-फर्क्टर प्रमाणीकरण", "सादा पाठ", "हाइपरटेक्स्ट"], answer: 1 }
      }
    ],
    es: [
      { 
        title: "Introducción a los algoritmos", 
        intro: "Aprendiendo marcos lógicos paso a paso, resolución de problemas computacionales y análisis de eficiencia para la ingeniería de software.", 
        blocks: [
          "Un algoritmo representa una secuencia finita y sin ambigüedades de instrucciones computacionales precisas diseñadas para resolver una clase específica de problemas.", 
          "Los diagramas de flujo proporcionan un plano visual de los flujos de trabajo algorítmicos utilizando símbolos geométricos estandarizados para representar pasos de proceso y decisiones.", 
          "El pseudocódigo puentea la brecha entre el lenguaje humano y la sintaxis de programación real, permitiendo a los desarrolladores trazar la lógica claramente.", 
          "La eficiencia algorítmica se mide a través de la complejidad temporal y la complejidad espacial para evaluar la escalabilidad bajo grandes conjuntos de datos."
        ], 
        keywords: ["Algoritmo", "Lógica", "Diagrama de flujo", "Pseudocódigo"], 
        quiz: { question: "¿Qué es un algoritmo?", options: ["Hardware", "Un conjunto de instrucciones paso a paso", "Un error", "Una base de datos"], answer: 1 } 
      },
      { 
        title: "Conceptos básicos de redes", 
        intro: "Entendiendo cómo se comunican las computadoras, los paquetes de datos viajan a través de la infraestructura y operan los protocolos de conectividad global.", 
        blocks: [
          "Una red informática conecta múltiples dispositivos de hardware independientes para compartir recursos, impresoras y archivos de almacenamiento de datos de forma segura.", 
          "Internet sirve como la red global de conmutación de paquetes interconectada más grande del mundo utilizando protocolos de comunicación TCP/IP estándar.", 
          "Los enrutadores dirigen el tráfico de datos de manera eficiente a través de límites de red distintos al determinar la ruta óptima para los paquetes de información.", 
          "La infraestructura de computación en la nube permite a los usuarios almacenar datos y ejecutar aplicaciones en granjas de servidores remotos en lugar de discos duros locales."
        ], 
        keywords: ["Red", "Internet", "Conexión", "Protocolos"], 
        quiz: { question: "¿Cuál es la red global más grande?", options: ["Intranet", "Internet", "Bluetooth", "Un enrutador"], answer: 1 } 
      },
      {
        title: "Fundamentos de programación", 
        intro: "Explorando conceptos centrales de desarrollo de software que incluyen variables, estructuras de control, ramificación condicional y bucles modulares.", 
        blocks: [
          "Las variables actúan como contenedores de memoria nombrados utilizados dentro de la ejecución de código para almacenar, modificar y recuperar varios tipos de valores de datos.", 
          "Las declaraciones condicionales como las estructuras si-no permiten que los programas tomen decisiones y ejecuten diferentes bloques de código según criterios.", 
          "Los bucles (para y mientras) automatizan tareas repetitivas ejecutando un bloque de código varias veces hasta que se cumple una condición de terminación.", 
          "Las funciones modularizan el código en bloques reutilizables, promoviendo una arquitectura limpia, la reutilización de código y un mantenimiento de depuración más fácil."
        ],
        keywords: ["Programación", "Variables", "Bucles", "Funciones"],
        quiz: { question: "¿Qué estructura se utiliza para repetir la ejecución del código?", options: ["Variable", "Bucle", "Comentario", "Cadena"], answer: 1 }
      },
      {
        title: "Conceptos básicos de ciberseguridad", 
        intro: "Aprendiendo principios esenciales para proteger sistemas digitales, asegurar datos personales y reconocer amenazas en línea.", 
        blocks: [
          "El cifrado transforma el texto plano legible en texto cifrado codificado para evitar la interceptación no autorizada durante la transmisión de datos.", 
          "Las prácticas sólidas de gestión de contraseñas, incluida la autenticación multifactor, protegen las cuentas en línea contra ataques de intrusión por fuerza bruta.", 
          "Los ataques de phishing implican tácticas engañosas de ingeniería social diseñadas para engañar a los usuarios para que revelen información de credenciales confidenciales.", 
          "Los firewalls monitorean y filtran el tráfico de red entrante y saliente en función de reglas de seguridad predeterminadas para bloquear el acceso malicioso."
        ],
        keywords: ["Ciberseguridad", "Cifrado", "Contraseña", "Firewall"],
        quiz: { question: "¿Qué método de seguridad utiliza múltiples pasos para verificar la identidad del usuario?", options: ["Inicio de sesión único", "Autenticación multifactor", "Texto plano", "Hipertexto"], answer: 1 }
      }
    ],
    fr: [
      { 
        title: "Introduction aux algorithmes", 
        intro: "Apprentissage de cadres logiques étape par étape, de la résolution de problèmes informatiques et de l'analyse d'efficacité pour le génie logiciel.", 
        blocks: [
          "Un algorithme représente une séquence finie et non ambiguë d'instructions informatiques précises conçues pour résoudre une classe spécifique de problèmes.", 
          "Les organigrammes fournissent un plan visuel des flux de travail algorithmiques en utilisant des symboles géométriques standardisés pour représenter les étapes du processus et les décisions.", 
          "Le pseudocode comble le fossé entre le langage humain et la syntaxe de programmation réelle, permettant aux développeurs de cartographier clairement la logique.", 
          "L'efficacité algorithmique est mesurée par la complexité temporelle et la complexité spatiale pour évaluer l'évolutivité sous de grands ensembles de données."
        ], 
        keywords: ["Algorithme", "Logique", "Organigramme", "Pseudocode"], 
        quiz: { question: "Qu'est-ce qu'un algorithme?", options: ["Matériel", "Une suite d'instructions étape par étape", "Un bogue", "Une base de données"], answer: 1 } 
      },
      { 
        title: "Bases des réseaux", 
        intro: "Comprendre comment les ordinateurs communiquent, comment les paquets de données voyagent à travers l'infrastructure et comment fonctionnent les protocoles de connectivité mondiale.", 
        blocks: [
          "Un réseau informatique connecte plusieurs périphériques matériels indépendants pour partager des ressources, des imprimantes et des fichiers de stockage de données en toute sécurité.", 
          "Internet sert de plus grand réseau mondial interconnecté de commutation de paquets utilisant des protocoles de communication TCP/IP standard.", 
          "Les routeurs dirigent efficacement le trafic de données à travers des frontières de réseau distinctes en déterminant le chemin optimal pour les paquets d'informations.", 
          "L'infrastructure de cloud computing permet aux utilisateurs de stocker des données et d'exécuter des applications sur des fermes de serveurs distantes plutôt que sur des disques durs locaux."
        ], 
        keywords: ["Réseau", "Internet", "Connexion", "Protocoles"], 
        quiz: { question: "Quel est le plus grand réseau mondial?", options: ["Intranet", "Internet", "Bluetooth", "Un routeur"], answer: 1 } 
      },
      {
        title: "Fondamentaux de la programmation", 
        intro: "Exploration des concepts clés du développement logiciel, notamment les variables, les structures de contrôle, le branchement conditionnel et les boucles modulaires.", 
        blocks: [
          "Les variables agissent comme des conteneurs de mémoire nommés utilisés lors de l'exécution du code pour stocker, modifier et récupérer divers types de valeurs de données.", 
          "Les instructions conditionnelles telles que les structures si-sinon permettent aux programmes de prendre des décisions et d'exécuter différents blocs de code en fonction de critères.", 
          "Les boucles (pour et tant que) automatisent les tâches répétitives en exécutant un bloc de code plusieurs fois jusqu'à ce qu'une condition de fin soit remplie.", 
          "Les fonctions modularisent le code en blocs réutilisables, favorisant une architecture propre, la réutilisabilité du code et une maintenance de débogage plus facile."
        ],
        keywords: ["Programmation", "Variables", "Boucles", "Fonctions"],
        quiz: { question: "Quelle structure est utilisée pour répéter l'exécution du code?", options: ["Variable", "Boucle", "Commentaire", "Chaîne"], answer: 1 }
      },
      {
        title: "Bases de la cybersécurité", 
        intro: "Apprentissage des principes essentiels pour protéger les systèmes numériques, sécuriser les données personnelles et reconnaître les menaces en ligne.", 
        blocks: [
          "Le chiffrement transforme le texte en clair lisible en texte chiffré brouillé pour empêcher l'interception non autorisée lors de la transmission des données.", 
          "Les pratiques rigoureuses de gestion des mots de passe, y compris l'authentification multifacteur, protègent les comptes en ligne contre les attaques par force brute.", 
          "Les attaques de phishing impliquent des tactiques trompeuses d'ingénierie sociale conçues pour inciter les utilisateurs à révéler des informations d'identification sensibles.", 
          "Les pare-feu surveillent et filtrent le trafic réseau entrant et sortant en fonction de règles de sécurité prédéterminées pour bloquer les accès malveillants."
        ],
        keywords: ["Cybersécurité", "Chiffrement", "Mot de passe", "Pare-feu"],
        quiz: { question: "Quelle méthode de sécurité utilise plusieurs étapes pour vérifier l'identité de l'utilisateur?", options: ["Authentification unique", "Authentification multifacteur", "Texte en clair", "Hypertexte"], answer: 1 }
      }
    ]
  },
  environmental_studies: {
    en: [
      { 
        title: "Ecosystems and Biodiversity", 
        intro: "Examining complex biological interactions, trophic dynamics, ecological balance, and habitat resilience across environments.", 
        blocks: [
          "Biodiversity ensures ecosystem resilience, providing functional redundancy that helps biological communities recover from disturbances.", 
          "Trophic networks consist of producers, primary consumers, secondary consumers, and decomposers executing energy transfers.", 
          "Keystone species exert a disproportionately large effect on their natural environment relative to their actual population abundance.", 
          "Habitat destruction, invasive species, and climate change represent major threats to global biological diversity and species survival."
        ], 
        keywords: ["Ecosystem", "Biodiversity", "Food Web", "Conservation"], 
        quiz: { question: "What ensures ecosystem resilience?", options: ["Pollution", "Biodiversity", "Deforestation", "Urbanization"], answer: 1 } 
      },
      { 
        title: "Renewable Energy Sources", 
        intro: "Exploring sustainable power generation technologies, green transition strategies, and fossil fuel replacement methods.", 
        blocks: [
          "Solar energy harnesses photovoltaic cells to convert abundant sunlight directly into clean, usable electrical power.", 
          "Wind turbines capture kinetic energy from moving air currents, driving generators to produce large-scale renewable electricity.", 
          "Geothermal power taps thermal energy stored deep within the Earth's crust for continuous, reliable power generation.", 
          "Transitioning away from carbon-intensive fossil fuels is vital for mitigating global greenhouse gas emissions and climate change."
        ], 
        keywords: ["Renewable", "Solar", "Energy", "Sustainability"], 
        quiz: { question: "Which of the following is a renewable energy source?", options: ["Coal", "Solar power", "Natural gas", "Oil"], answer: 1 } 
      },
      {
        title: "Water Conservation and Management", 
        intro: "Studying global freshwater distribution, hydrological preservation techniques, and pollution mitigation strategies.", 
        blocks: [
          "Freshwater accounts for a tiny fraction of Earth's total water volume, making conservation critical for future human survival.", 
          "Rainwater harvesting captures runoff from rooftops for agricultural and domestic use, reducing strain on municipal supplies.", 
          "Industrial wastewater treatment processes remove toxic pollutants before effluents are safely discharged back into natural water bodies.", 
          "Drip irrigation systems maximize agricultural water efficiency by delivering moisture directly to plant roots, minimizing evaporation."
        ],
        keywords: ["Water", "Conservation", "Irrigation", "Sustainability"],
        quiz: { question: "What agricultural technique minimizes water waste by targeting plant roots?", options: ["Flood irrigation", "Drip irrigation", "Sprinklers", "Deforestation"], answer: 1 }
      },
      {
        title: "Waste Management and Recycling", 
        intro: "Understanding the environmental impact of municipal refuse, circular economy models, and sustainable disposal methods.", 
        blocks: [
          "The waste hierarchy prioritizes reduction, reuse, recycling, and recovery over traditional landfill dumping and incineration.", 
          "Composting organic kitchen and yard waste converts biological refuse into nutrient-rich soil conditioners naturally.", 
          "Single-use plastics pose severe environmental hazards due to their persistence, fragmenting into microplastics in oceans.", 
          "Circular economy frameworks redesign manufacturing processes to eliminate waste and keep materials in continuous productive use."
        ],
        keywords: ["Waste", "Recycling", "Circular Economy", "Compost"],
        quiz: { question: "What is the most preferred action in the waste hierarchy?", options: ["Landfill", "Incineration", "Reduction and Reuse", "Dumping"], answer: 2 }
      }
    ],
    hi: [
      { 
        title: "पारिस्थितिकी तंत्र और जैव विविधता", 
        intro: "विभिन्न वातावरणों में जटिल जैविक अंतःक्रियाओं, ट्रफिक गतिशीलता, पारिस्थितिक संतुलन और आवास लचीलापन की जांच करना।", 
        blocks: [
          "जैव विविधता पारिस्थितिकी तंत्र की स्थिरता सुनिश्चित करती है, कार्यात्मक अतिरेक प्रदान करती है जो जैविक समुदायों को गड़बड़ी से उबरने में मदद करती है।", 
          "ट्रॉफिक नेटवर्क में उत्पादक, प्राथमिक उपभोक्ता, माध्यमिक उपभोक्ता और अपघटक ऊर्जा हस्तांतरण निष्पादित करते हैं।", 
          "कीस्टोन प्रजातियां अपनी वास्तविक जनसंख्या प्रचुरता के सापेक्ष अपने प्राकृतिक पर्यावरण पर एक बड़ा प्रभाव डालती हैं।", 
          "आवास विनाश, आक्रामक प्रजातियां और जलवायु परिवर्तन वैश्विक जैविक विविधता और प्रजातियों के अस्तित्व के लिए प्रमुख खतरे हैं।"
        ], 
        keywords: ["पारिस्थितिकी तंत्र", "जैव विविधता", "खाद्य जाल", "संरक्षण"], 
        quiz: { question: "पारिस्थितिकी तंत्र की स्थिरता क्या सुनिश्चित करती है?", options: ["प्रदूषण", "जैव विविधता", "वनों की कटाई", "शहरीकरण"], answer: 1 } 
      },
      { 
        title: "नवीकरणीय ऊर्जा स्रोत", 
        intro: "स्थायी बिजली उत्पादन प्रौद्योगिकियों, हरित संक्रमण रणनीतियों और जीवाश्म ईंधन प्रतिस्थापन विधियों की खोज करना।", 
        blocks: [
          "सौर ऊर्जा प्रचुर मात्रा में सूर्य के प्रकाश को सीधे स्वच्छ, उपयोगी विद्युत शक्ति में बदलने के लिए फोटोवोल्टिक कोशिकाओं का उपयोग करती है।", 
          "पवन टरबाइन गतिमान वायु धाराओं से गतिज ऊर्जा कैप्चर करते हैं, बड़े पैमाने पर नवीकरणीय बिजली का उत्पादन करने के लिए जनरेटर चलाते हैं।", 
          "भू-तापीय ऊर्जा निरंतर, विश्वसनीय बिजली उत्पादन के लिए पृथ्वी की पलक के भीतर गहराई में संग्रहीत थर्मल ऊर्जा का दोहन करती है।", 
          "कार्बन-गहन जीवाश्म ईंधन से दूर जाना वैश्विक ग्रीनहाउस गैस उत्सर्जन और जलवायु परिवर्तन को कम करने के लिए महत्वपूर्ण है।"
        ], 
        keywords: ["नवीकरणीय", "सौर", "ऊर्जा", "स्थिरता"], 
        quiz: { question: "निम्नलिखित में से कौन सा एक नवीकरणीय ऊर्जा स्रोत है?", options: ["कोयला", "सौर ऊर्जा", "प्राकृतिक गैस", "तेल"], answer: 1 } 
      },
      {
        title: "जल संरक्षण और प्रबंधन", 
        intro: "वैश्विक मीठे पानी के वितरण, जलवैज्ञानिक संरक्षण तकनीकों और प्रदूषण न्यूनीकरण रणनीतियों का अध्ययन करना।", 
        blocks: [
          "मीठा पानी पृथ्वी के कुल जल आयतन का एक बहुत छोटा अंश है, जो भविष्य के मानव अस्तित्व के लिए संरक्षण को महत्वपूर्ण बनाता है।", 
          "वर्षा जल संचयन कृषि और घरेलू उपयोग के लिए छतों से अपवाह को कैप्चर करता है, नगरपालिका आपूर्ति पर दबाव कम करता है।", 
          "औद्योगिक अपशिष्ट जल उपचार प्रक्रियाएं प्राकृतिक जल निकायों में सुरक्षित रूप से छोड़े जाने से पहले जहरीले प्रदूषकों को हटा देती हैं।", 
          "ड्रिप सिंचाई प्रणाली वाष्पीकरण को कम करते हुए पौधे की जड़ों तक सीधे नमी पहुंचाकर कृषि जल दक्षता को अधिकतम करती है।"
        ],
        keywords: ["जल", "संरक्षण", "सिंचाई", "स्थिरता"],
        quiz: { question: "कौन सी कृषि तकनीक पौधे की जड़ों को लक्षित करके पानी की बर्बादी को कम करती है?", options: ["बाढ़ सिंचाई", "ड्रिप सिंचाई", "छिड़काव", "वनों की कटाई"], answer: 1 }
      },
      {
        title: "अपशिष्ट प्रबंधन और पुनर्चक्रण", 
        intro: "नगरपालिका कचरे के पर्यावरणीय प्रभाव, परिपत्र अर्थव्यवस्था मॉडल और स्थायी निपटान विधियों को समझना।", 
        blocks: [
          "अपशिष्ट पदानुक्रम पारंपरिक लैंडफिल डंपिंग और भस्मीकरण पर कमी, पुनนำ उपयोग, पुनर्चक्रण और पुनर्प्राप्ति को प्राथमिकता देता है।", 
          "जैविक रसोई और यार्ड कचरे की खाद बनाना प्राकृतिक रूप से जैविक कचरे को पोषक तत्वों से भरपूर मिट्टी कंडीशनर में बदल देता है।", 
          "एक बार उपयोग होने वाले प्लास्टिक महासागरों में माइक्रोप्लास्टिक में टूटने के कारण अपनी दृढ़ता के कारण गंभीर पर्यावरणीय खतरा पैदा करते हैं।", 
          "परिपत्र अर्थव्यवस्था के ढांचे कचरे को खत्म करने और सामग्री को निरंतर उत्पादक उपयोग में रखने के लिए विनिर्माण प्रक्रियाओं को नया रूप देते हैं।"
        ],
        keywords: ["अपशिष्ट", "पुनर्चक्रण", "परिपत्र अर्थव्यवस्था", "खाद"],
        quiz: { question: "अपशिष्ट पदानुक्रम में सबसे पसंदीदा कार्रवाई क्या है?", options: ["लैंडफिल", "भस्मीकरण", "कमी और पुन उपयोग", "डंपिंग"], answer: 2 }
      }
    ],
    es: [
      { 
        title: "Ecosistemas y biodiversidad", 
        intro: "Examinando interacciones biológicas complejas, dinámica trófica, equilibrio ecológico y resiliencia de hábitats en todos los entornos.", 
        blocks: [
          "La biodiversidad asegura la resiliencia del ecosistema, proporcionando redundancia funcional que ayuda a las comunidades biológicas a recuperarse de las perturbaciones.", 
          "Las redes tróficas consisten en productores, consumidores primarios, consumidores secundarios y descomponedores que ejecutan transferencias de energía.", 
          "Las especies clave ejercen un efecto desproporcionadamente grande en su entorno natural en relación con su abundancia de población real.", 
          "La destrucción de hábitats, las especies invasoras y el cambio climático representan amenazas importantes para la diversidad biológica global y la supervivencia de las especies."
        ], 
        keywords: ["Ecosistema", "Biodiversidad", "Red Alimentaria", "Conservación"], 
        quiz: { question: "¿Qué asegura la resiliencia del ecosistema?", options: ["Contaminación", "Biodiversidad", "Deforestación", "Urbanización"], answer: 1 } 
      },
      { 
        title: "Fuentes de energía renovable", 
        intro: "Explorando tecnologías sostenibles de generación de energía, estrategias de transición verde y métodos de reemplazo de combustibles fósiles.", 
        blocks: [
          "La energía solar aprovecha las celdas fotovoltaicas para convertir la abundante luz solar directamente en energía eléctrica limpia y utilizable.", 
          "Las turbinas eólicas capturan la energía cinética de las corrientes de aire en movimiento, impulsando generadores para producir electricidad renovable a gran escala.", 
          "La energía geotérmica aprovecha la energía térmica almacenada en las profundidades de la corteza terrestre para una generación de energía continua y confiable.", 
          "Alejarse de los combustibles fósiles intensivos en carbono es vital para mitigar las emisiones globales de gases de efecto invernadero y el cambio climático."
        ], 
        keywords: ["Renovable", "Solar", "Energía", "Sostenibilidad"], 
        quiz: { question: "¿Cuál de las siguientes es una fuente de energía renovable?", options: ["Carbón", "Energía solar", "Gas natural", "Petróleo"], answer: 1 } 
      },
      {
        title: "Conservación y gestión del agua", 
        intro: "Estudiando la distribución global de agua dulce, técnicas de preservación hidrológica y estrategias de mitigación de la contaminación.", 
        blocks: [
          "El agua dulce representa una pequeña fracción del volumen total de agua de la Tierra, lo que hace que la conservación sea fundamental para la futura supervivencia humana.", 
          "La recolección de agua de lluvia captura la escorrentía de los techos para uso agrícola y doméstico, reduciendo la presión sobre los suministros municipales.", 
          "Los procesos industriales de tratamiento de aguas residuales eliminan los contaminantes tóxicos antes de que los efluentes se descarguen de manera segura nuevamente en los cuerpos de agua naturales.", 
          "Los sistemas de riego por goteo maximizan la eficiencia del agua agrícola al entregar humedad directamente a las raíces de las plantas, minimizando la evaporación."
        ],
        keywords: ["Agua", "Conservación", "Riego", "Sostenibilidad"],
        quiz: { question: "¿Qué técnica agrícola minimiza el desperdicio de agua al apuntar a las raíces de las plantas?", options: ["Riego por inundación", "Riego por goteo", "Aspersores", "Deforestación"], answer: 1 }
      },
      {
        title: "Gestión de residuos y reciclaje", 
        intro: "Comprender el impacto ambiental de los residuos municipales, los modelos de economía circular y los métodos de eliminación sostenible.", 
        blocks: [
          "La jerarquía de residuos prioriza la reducción, reutilización, reciclaje y recuperación sobre el vertido tradicional en vertederos y la incineración.", 
          "El compostaje de residuos orgánicos de cocina y jardín convierte los desechos biológicos en acondicionadores de suelo ricos en nutrientes de forma natural.", 
          "Los plásticos de un solo uso plantean graves peligros ambientales debido a su persistencia, fragmentándose en microplásticos en los océanos.", 
          "Los marcos de economía circular redesignan los procesos de fabricación para eliminar los residuos y mantener los materiales en uso productivo continuo."
        ],
        keywords: ["Residuos", "Reciclaje", "Economía Circular", "Compost"],
        quiz: { question: "¿Cuál es la acción más preferida en la jerarquía de residuos?", options: ["Vertedero", "Incineración", "Reducción y Reutilización", "Vertido"], answer: 2 }
      }
    ],
    fr: [
      { 
        title: "Écosystèmes et biodiversité", 
        intro: "Examen des interactions biologiques complexes, de la dynamique trophique, de l'équilibre écologique et de la résilience des habitats dans tous les environnements.", 
        blocks: [
          "La biodiversité assure la résilience des écosystèmes, fournissant une redondance fonctionnelle qui aide les communautés biologiques à se remettre des perturbations.", 
          "Les réseaux trophiques sont constitués de producteurs, de consommateurs primaires, de consommateurs secondaires et de décomposeurs exécutant des transferts d'énergie.", 
          "Les espèces clés exercent un effet disproportionnellement important sur leur environnement naturel par rapport à leur abondance de population réelle.", 
          "La destruction des habitats, les espèces envahissantes et le changement climatique représentent des menaces majeures pour la diversité biologique mondiale et la survie des espèces."
        ], 
        keywords: ["Écosystème", "Biodiversité", "Réseau Trophique", "Conservation"], 
        quiz: { question: "Qu'est-ce qui assure la résilience des écosystèmes?", options: ["Pollution", "Biodiversité", "Déforestation", "Urbanisation"], answer: 1 } 
      },
      { 
        title: "Sources d'énergie renouvelable", 
        intro: "Explorer des technologies durables de production d'énergie, des stratégies de transition verte et des méthodes de remplacement des combustibles fossiles.", 
        blocks: [
          "L'énergie solaire exploite des cellules photovoltaïques pour convertir la lumière abondante du soleil directement en énergie électrique propre et utilisable.", 
          "Les éoliennes captent l'énergie cinétique des courants d'air en mouvement, entraînant des générateurs pour produire de l'électricité renouvelable à grande échelle.", 
          "L'énergie géothermique exploite l'énergie thermique stockée au fond de la croûte terrestre pour une production d'énergie continue et fiable.", 
          "S'éloigner des combustibles fossiles à forte intensité de carbone est essentiel pour atténuer les émissions mondiales de gaz à effet de serre et le changement climatique."
        ], 
        keywords: ["Renouvelable", "Solaire", "Énergie", "Durabilité"], 
        quiz: { question: "Laquelle des sources suivantes est renouvelable?", options: ["Charbon", "Énergie solaire", "Gaz naturel", "Pétrole"], answer: 1 } 
      },
      {
        title: "Conservation et gestion de l'eau", 
        intro: "Étude de la distribution mondiale de l'eau douce, des techniques de préservation hydrologique et des stratégies d'atténuation de la pollution.", 
        blocks: [
          "L'eau douce représente une fraction infime du volume d'eau total de la Terre, ce qui rend la conservation essentielle pour la survie humaine future.", 
          "La récupération de l'eau de pluie capture le ruissellement des toits pour un usage agricole et domestique, réduisant la pression sur les approvisionnements municipaux.", 
          "Les processus industriels de traitement des eaux usées éliminent les polluants toxiques avant que les effluents ne soient rejetés en toute sécurité dans les plans d'eau naturels.", 
          "Les systèmes d'irrigation au goutte-à-goutte maximisent l'efficacité de l'eau agricole en fournissant de l'humidité directement aux racines des plantes, minimisant l'évaporation."
        ],
        keywords: ["Eau", "Conservation", "Irrigation", "Durabilité"],
        quiz: { question: "Quelle technique agricole minimise le gaspillage d'eau en ciblant les racines des plantes?", options: ["Irrigation par inondation", "Irrigation au goutte-à-goutte", "Arroseurs", "Déforestation"], answer: 1 }
      },
      {
        title: "Gestion des déchets et recyclage", 
        intro: "Comprendre l'impact environnemental des déchets municipaux, des modèles d'économie circulaire et des méthodes d'élimination durable.", 
        blocks: [
          "La hiérarchie des déchets donne la priorité à la réduction, la réutilisation, le recyclage et la valorisation par rapport à l'enfouissement et à l'incinération traditionnels.", 
          "Le compostage des déchets organiques de cuisine et de jardin convertit naturellement les déchets biologiques en amendements de sol riches en nutriments.", 
          "Les plastiques à usage unique posent de graves risques environnementaux en raison de leur persistance, se fragmentant en microplastiques dans les océans.", 
          "Les cadres de l'économie circulaire repensent les processus de fabrication pour éliminer les déchets et maintenir les matériaux dans une utilisation productive continue."
        ],
        keywords: ["Déchets", "Recyclage", "Économie Circulaire", "Compost"],
        quiz: { question: "Quelle est l'action la plus privilégiée dans la hiérarchie des déchets?", options: ["Enfouissement", "Incinération", "Réduction et Réutilisation", "Déversement"], answer: 2 }
      }
    ]
  }
};

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("toast").classList.remove("show"), 3200);
}

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function applyLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("equaleduLang", lang);
  const dict = translations[lang] || translations.en;
  
  $$("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  if (!$("appView").classList.contains("hidden")) {
    renderLessonTopics();
    renderLesson();
  }
}

function saveProfileLocal() {
  localStorage.setItem("equaleduProfile", JSON.stringify(state.profile));
}

function loadDemoProfile() {
  const stored = JSON.parse(localStorage.getItem("equaleduProfile") || "null");
  if (stored) state.profile = { ...state.profile, ...stored };
}

function showApp() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  updateProfileUI();
  renderLessonTopics();
  renderLesson();
  renderTasks();
  renderFlashcard();
  loadChats();
}

function showAuth() {
  $("appView").classList.add("hidden");
  $("authView").classList.remove("hidden");
}

function updateProfileUI() {
  const p = state.profile;
  const initial = (p.name || "L").charAt(0).toUpperCase();
  $("avatarInitial").textContent = initial;
  $("headerAvatar").textContent = initial;
  $("sidebarName").textContent = p.name;
  $("headerName").textContent = p.name.split(" ")[0];
  
  const heroNameEl = $("heroName");
  if(heroNameEl) heroNameEl.textContent = p.name.split(" ")[0];

  $("sidebarMeta").textContent = `${capitalize(p.role)} • ${p.course}`;
  $("dashboardCourse").textContent = p.course;
  $("communityCourseBadge").textContent = `${p.course} room`;
  $("roleBadge").textContent = `${capitalize(p.role)} view`;
  $("profileName").value = p.name;
  $("profileRole").value = p.role;
  $("profileBio").value = p.bio || "";
  $("courseSelect").value = p.course;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setAuthMode(mode) {
  state.authMode = mode;
  const signup = mode === "signup";
  $("authTitle").textContent = signup ? "Create your learning profile" : "Welcome back";
  $("authSubmit").textContent = signup ? "Create account" : "Sign in";
  $("authSwitch").textContent = signup ? "Already registered? Sign in" : "New learner? Create account";
  $("nameLabel").classList.toggle("hidden", !signup);
  $("signupFields").classList.toggle("hidden", !signup);
  applyLanguage(state.lang);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!firebaseConfigured || !auth || !db) {
    toast("Firebase is not configured. Use Demo mode or paste your Firebase config.");
    return;
  }

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  try {
    if (state.authMode === "signup") {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const profile = {
        uid: credential.user.uid,
        name: $("authName").value.trim() || "Learner",
        email,
        role: $("authRole").value,
        course: $("authCourse").value,
        bio: "",
        createdAt: serverTimestamp()
      };
      await updateProfile(credential.user, { displayName: profile.name });
      await setDoc(doc(db, "users", credential.user.uid), profile);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    console.error(error);
    toast(error.message.replace("Firebase:", "").trim());
  }
}

async function loadFirebaseProfile(user) {
  const snapshot = await getDoc(doc(db, "users", user.uid));
  if (snapshot.exists()) {
    state.profile = { ...snapshot.data(), uid: user.uid, email: user.email };
  } else {
    state.profile = {
      uid: user.uid,
      name: user.displayName || "Learner",
      email: user.email,
      role: "student",
      course: "Science",
      bio: ""
    };
    await setDoc(doc(db, "users", user.uid), state.profile);
  }
}

function openPage(pageId) {
  $$(".page").forEach(page => page.classList.toggle("active", page.id === pageId));
  $$(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.page === pageId));
  const button = $(`.nav-btn[data-page="${pageId}"]`);
  $("pageTitle").textContent = button?.innerText.trim() || "EqualEdu";
  $("mainContent").focus();
  if (pageId === "communityPage" || pageId === "doubtPage") loadChats();
}

function getNormalizedCourseKey(courseName) {
  const map = {
    "Science": "science",
    "Mathematics": "mathematics",
    "Social Science": "social_science",
    "English": "english",
    "Computer Science": "computer_science",
    "Environmental Studies": "environmental_studies"
  };
  return map[courseName] || "science";
}

function currentLesson() {
  const courseKey = getNormalizedCourseKey(state.profile.course);
  const courseObj = lessons[courseKey] || lessons.science;
  const langList = courseObj[state.lang] || courseObj.en || lessons.science.en;
  const selectedIndex = Number($("lessonTopicSelect")?.value || 0);
  return langList[selectedIndex] || langList[0];
}

function renderLessonTopics() {
  const courseKey = getNormalizedCourseKey(state.profile.course);
  const courseObj = lessons[courseKey] || lessons.science;
  const langList = courseObj[state.lang] || courseObj.en || lessons.science.en;

  const selectEl = $("lessonTopicSelect");
  if (!selectEl) return;

  selectEl.innerHTML = langList.map((lesson, index) =>
    `<option value="${index}">${safeText(lesson.title)}</option>`
  ).join("");
}

function renderLesson() {
  const lesson = currentLesson();
  if(!lesson) return;
  
  $("lessonHeading").textContent = lesson.title;
  $("lessonSubheading").textContent = lesson.intro || "";
  $("lessonBody").innerHTML = `
    <h2>${safeText(lesson.title)}</h2>
    <p>${safeText(lesson.intro || "")}</p>
    ${(lesson.blocks || []).map((block, index) => `<div class="lesson-block"><b>${index + 1}.</b> ${safeText(block)}</div>`).join("")}
  `;
  $("lessonKeywords").innerHTML = (lesson.keywords || []).map(word => `<span>${safeText(word)}</span>`).join("");
  if (lesson.quiz) {
    renderQuickCheck(lesson.quiz);
  }
  addLessonCards(lesson);
}

function renderQuickCheck(quiz) {
  $("quickCheck").innerHTML = `
    <p><strong>${safeText(quiz.question)}</strong></p>
    ${quiz.options.map((option, index) => `<button class="quiz-option" data-option="${index}">${safeText(option)}</button>`).join("")}
  `;
  $$("#quickCheck .quiz-option").forEach(button => {
    button.addEventListener("click", () => {
      const chosen = Number(button.dataset.option);
      $$("#quickCheck .quiz-option").forEach((item, index) => {
        item.disabled = true;
        if (index === quiz.answer) item.classList.add("correct");
      });
      if (chosen !== quiz.answer) button.classList.add("wrong");
      toast(chosen === quiz.answer ? "Correct!" : "Review the highlighted answer.");
    });
  });
}

function addLessonCards(lesson) {
  const keywords = lesson.keywords || [];
  const blocks = lesson.blocks || [];
  state.cards = [
    ...keywords.map((word, index) => ({
      front: `What is ${word}?`,
      back: blocks.find(block => block.toLowerCase().includes(word.toLowerCase())) || blocks[index % blocks.length] || lesson.title
    })),
    ...blocks.map((block, index) => ({
      front: `Explain lesson point ${index + 1}`,
      back: block
    }))
  ];
  state.filteredCards = [...state.cards];
  state.cardIndex = 0;
  state.cardFlipped = false;
  renderFlashcard();
}

function renderFlashcard() {
  const deck = state.filteredCards;
  $("flashcardCount").textContent = state.cards.length;
  if (!deck.length) {
    $("flashcardTextFront").textContent = "No flashcards found.";
    $("flashcardTextBack").textContent = "Try clearing your search or uploading new material.";
    $("flashProgress").textContent = "0 / 0";
    return;
  }
  const card = deck[state.cardIndex];
  $("flashcardTextFront").textContent = card.front;
  $("flashcardTextBack").textContent = card.back;
  $("flashProgress").textContent = `${state.cardIndex + 1} / ${deck.length}`;

  const cardElement = $("flashcard");
  if (state.cardFlipped) cardElement.classList.add("flipped");
  else cardElement.classList.remove("flipped");
}

function getPdfJs() {
  return pdfjsLib || globalThis.pdfjsLib || globalThis["pdfjs-dist/build/pdf"];
}

async function processPdf(file) {
  const pdfjs = getPdfJs();
  if (!pdfjs || typeof pdfjs.getDocument !== "function") {
    toast("PDF engine did not load. Check internet access, then refresh.");
    return;
  }

  $("pdfProgressWrap").classList.remove("hidden");
  $("pdfOutput").classList.add("hidden");
  $("pdfProgressBar").style.width = "3%";
  $("pdfProgressText").textContent = "Opening PDF…";

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), disableFontFace: true });
    const pdf = await loadingTask.promise;
    const pageLimit = Math.min(pdf.numPages, 100);
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(" ").replace(/\s+/g, " ").trim();
      if (text) pageTexts.push(text);
      const progress = Math.round((pageNumber / pageLimit) * 100);
      $("pdfProgressBar").style.width = `${progress}%`;
      $("pdfProgressText").textContent = `Reading page ${pageNumber} of ${pageLimit}…`;
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    const fullText = pageTexts.join("\n").replace(/\s+/g, " ").trim();
    if (fullText.length < 100) {
      throw new Error("Very little selectable text was found. This may be a scanned-image PDF.");
    }

    state.pdfText = fullText;
    const words = fullText.split(/\s+/).filter(Boolean);
    const sentences = splitSentences(fullText);
    const noteData = buildScalableNotes(sentences, words.length, pageLimit);
    const cards = buildPdfCards(noteData.keyPoints, sentences, words.length);

    state.cards = cards;
    state.filteredCards = [...cards];
    state.cardIndex = 0;
    state.cardFlipped = false;

    $("pdfFileName").textContent = file.name;
    $("pdfPages").textContent = pageLimit;
    $("pdfWords").textContent = words.length.toLocaleString();
    $("pdfSummaryCount").textContent = noteData.summary.length;
    $("pdfCardCount").textContent = cards.length;
    $("wordsStudied").textContent = words.length.toLocaleString();
    $("pdfSummary").innerHTML = noteData.summary.map(paragraph => `<p>${safeText(paragraph)}</p>`).join("");
    $("pdfKeyPoints").innerHTML = noteData.keyPoints.map(point => `<li>${safeText(point)}</li>`).join("");

    renderPdfQuiz(noteData.keyPoints);

    $("pdfOutput").classList.remove("hidden");
    $("pdfProgressText").textContent = "PDF processed successfully.";
    renderFlashcard();
    toast(`Created ${noteData.summary.length} note paragraphs and ${cards.length} flashcards.`);
  } catch (error) {
    console.error(error);
    $("pdfProgressText").textContent = "PDF processing failed.";
    toast(error.message || "Could not process this PDF.");
  }
}

function renderPdfQuiz(keyPoints) {
  if (!keyPoints.length) return;
  const samplePoint = keyPoints[0];
  const words = samplePoint.match(/\b[A-Za-z]{4,}\b/g) || ["concept", "definition"];
  const targetWord = words[0];
  const maskedSentence = samplePoint.replace(new RegExp(targetWord, "gi"), "_______");

  $("pdfQuizBox").innerHTML = `
    <p><strong>Fill in the missing key term:</strong></p>
    <blockquote class="quiz-sentence">"${safeText(maskedSentence)}"</blockquote>
    <div class="quiz-input-row">
      <input id="pdfQuizAnswer" placeholder="Type answer...">
      <button id="pdfQuizCheckBtn" class="primary">Check</button>
    </div>
  `;

  $("pdfQuizCheckBtn").addEventListener("click", () => {
    const val = $("pdfQuizAnswer").value.trim().toLowerCase();
    if (val === targetWord.toLowerCase()) {
      toast("Spot on! Correct term.");
    } else {
      toast(`Not quite! The word was "${targetWord}".`);
    }
  });
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length >= 45 && sentence.length <= 900);
}

function scoreSentence(sentence, index, total) {
  const words = sentence.toLowerCase().match(/[a-z]{4,}/g) || [];
  const unique = new Set(words).size;
  const positionBonus = index < total * 0.12 ? 5 : 0;
  const lengthScore = Math.min(sentence.length / 80, 5);
  const signalWords = /(important|because|therefore|means|defined|result|cause|effect|process|includes|requires|however)/i.test(sentence) ? 4 : 0;
  return unique * 0.18 + positionBonus + lengthScore + signalWords;
}

function buildScalableNotes(sentences, wordCount, pageCount) {
  const desiredPoints = Math.min(60, Math.max(8, Math.ceil(wordCount / 220)));
  const desiredParagraphs = Math.min(30, Math.max(4, Math.ceil(wordCount / 650)));
  const ranked = sentences
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence, index, sentences.length) }))
    .sort((a, b) => b.score - a.score);

  const selected = [];
  const seen = new Set();
  for (const item of ranked) {
    const signature = item.sentence.toLowerCase().replace(/[^a-z ]/g, "").slice(0, 80);
    if (!seen.has(signature)) {
      selected.push(item);
      seen.add(signature);
    }
    if (selected.length >= desiredPoints) break;
  }
  selected.sort((a, b) => a.index - b.index);
  const keyPoints = selected.map(item => item.sentence);

  const paragraphSize = Math.max(2, Math.ceil(keyPoints.length / desiredParagraphs));
  const summary = [];
  for (let i = 0; i < keyPoints.length; i += paragraphSize) {
    summary.push(keyPoints.slice(i, i + paragraphSize).join(" "));
  }
  return { summary, keyPoints, pageCount };
}

function buildPdfCards(keyPoints, sentences, wordCount) {
  const desired = Math.min(50, Math.max(10, Math.ceil(wordCount / 300)));
  return keyPoints.slice(0, desired).map((point, index) => {
    const keywords = point.match(/\b[A-Z][a-z]{3,}\b|\b[a-z]{7,}\b/g) || [];
    const keyword = keywords[0] || `key point ${index + 1}`;
    return {
      front: `What does the document explain about “${keyword}”?`,
      back: point
    };
  });
}

function localMessages(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveLocalMessage(key, message) {
  const messages = localMessages(key);
  messages.push(message);
  localStorage.setItem(key, JSON.stringify(messages.slice(-100)));
}

function renderMessages(containerId, messages) {
  const container = $(containerId);
  container.innerHTML = messages.length ? messages.map(message => {
    const isMine = message.uid === state.profile.uid || (state.demo && message.uid === "demo-user");
    const displayName = isMine ? state.profile.name : message.name;
    const displayRole = isMine ? state.profile.role : (message.role || "student");
    return `
    <article class="message ${isMine ? "mine" : ""}">
      <div class="message-head"><span>${safeText(displayName)} • ${safeText(displayRole)}</span><span>${safeText(message.time || "")}</span></div>
      <p>${safeText(message.text)}</p>
    </article>
  `;}).join("") : `<p class="muted">No messages yet. Start a helpful conversation.</p>`;
  container.scrollTop = container.scrollHeight;
}

function loadChats() {
  if (communityUnsubscribe) communityUnsubscribe();
  if (doubtUnsubscribe) doubtUnsubscribe();

  if (!firebaseConfigured || !db) {
    renderMessages("communityMessages", localMessages(`community-${state.profile.course}`));
    renderMessages("doubtMessages", localMessages(`doubts-${state.profile.course}`));
    return;
  }

  const communityQuery = query(
    collection(db, "communityMessages"),
    where("course", "==", state.profile.course),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  communityUnsubscribe = onSnapshot(communityQuery, snapshot => {
    renderMessages("communityMessages", snapshot.docs.map(item => {
      const data = item.data();
      return { ...data, time: data.createdAt?.toDate?.().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) || "" };
    }));
  }, error => {
    console.error(error);
    toast("Community chat needs its Firestore index/rules configured.");
  });

  const doubtQuery = query(
    collection(db, "doubtMessages"),
    where("course", "==", state.profile.course),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  doubtUnsubscribe = onSnapshot(doubtQuery, snapshot => {
    const messages = snapshot.docs.map(item => {
      const data = item.data();
      return { ...data, time: data.createdAt?.toDate?.().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) || "" };
    }).filter(message => state.profile.role === "teacher" || message.studentUid === state.profile.uid || message.replyToUid === state.profile.uid);
    renderMessages("doubtMessages", messages);
  }, error => {
    console.error(error);
    toast("Doubt chat needs its Firestore index/rules configured.");
  });
}

async function sendChat(type, text) {
  const base = {
    text,
    uid: state.profile.uid,
    name: state.profile.name,
    role: state.profile.role,
    course: state.profile.course
  };

  if (!firebaseConfigured || !db) {
    const key = type === "community" ? `community-${state.profile.course}` : `doubts-${state.profile.course}`;
    saveLocalMessage(key, { ...base, studentUid: state.profile.role === "student" ? state.profile.uid : "demo-student", time: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) });
    loadChats();
    return;
  }

  if (type === "community") {
    await addDoc(collection(db, "communityMessages"), { ...base, createdAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, "doubtMessages"), {
      ...base,
      studentUid: state.profile.role === "student" ? state.profile.uid : null,
      replyToUid: state.profile.role === "teacher" ? "course-students" : null,
      createdAt: serverTimestamp()
    });
  }
}

function renderTasks() {
  $("taskList").innerHTML = state.tasks.length ? state.tasks.map(task => `
    <article class="task-item ${task.done ? "done" : ""}">
      <input type="checkbox" data-task-check="${task.id}" ${task.done ? "checked" : ""} aria-label="Mark task complete">
      <div><b>${safeText(task.text)}</b><small>${safeText(task.date || "No deadline")}</small></div>
      <button data-task-delete="${task.id}" aria-label="Delete task">Delete</button>
    </article>
  `).join("") : `<p class="muted">No tasks yet. Add your first study target.</p>`;

  $("completedTasks").textContent = state.tasks.filter(task => task.done).length;
  $$("[data-task-check]").forEach(box => box.addEventListener("change", () => {
    const task = state.tasks.find(item => item.id === box.dataset.taskCheck);
    if (task) task.done = box.checked;
    persistTasks();
  }));
  $$("[data-task-delete]").forEach(button => button.addEventListener("click", () => {
    state.tasks = state.tasks.filter(item => item.id !== button.dataset.taskDelete);
    persistTasks();
  }));
}

function persistTasks() {
  localStorage.setItem("equaleduTasks", JSON.stringify(state.tasks));
  renderTasks();
}

function updateTimer() {
  const minutes = Math.floor(state.timerSeconds / 60).toString().padStart(2, "0");
  const seconds = (state.timerSeconds % 60).toString().padStart(2, "0");
  $("timerDisplay").textContent = `${minutes}:${seconds}`;
}

function bindEvents() {
  $("authForm").addEventListener("submit", handleAuthSubmit);
  $("authSwitch").addEventListener("click", () => setAuthMode(state.authMode === "signup" ? "signin" : "signup"));
  $("demoLogin").addEventListener("click", () => {
    state.demo = true;
    loadDemoProfile();
    showApp();
    toast("Demo mode opened. Chats are stored on this device.");
  });

  $$(".nav-btn").forEach(button => button.addEventListener("click", () => openPage(button.dataset.page)));
  $$("[data-open-page]").forEach(button => button.addEventListener("click", () => openPage(button.dataset.openPage)));

  $("logoutBtn").addEventListener("click", async () => {
    if (auth && auth.currentUser) await signOut(auth);
    showAuth();
  });

  $("editProfileBtn").addEventListener("click", () => $("profileDialog").showModal());
  $("profileShortcut").addEventListener("click", () => $("profileDialog").showModal());
  $("changeCourseBtn").addEventListener("click", () => $("courseDialog").showModal());
  $("a11yBtn").addEventListener("click", () => $("a11yDialog").showModal());
  $$("[data-close-dialog]").forEach(button => button.addEventListener("click", () => $(button.dataset.closeDialog).close()));

  $("a11yForm").addEventListener("submit", event => {
    event.preventDefault();
    const lang = $("langSelect").value;
    applyLanguage(lang);

    const fontFamily = $("fontFamilySelect").value;
    document.documentElement.style.setProperty("--primary-font", `'${fontFamily}', sans-serif`);

    const fontSize = $("fontSizeSelect").value;
    document.documentElement.style.setProperty("--base-font-size", fontSize);

    const dyslexia = $("toggleDyslexia").checked;
    document.body.classList.toggle("dyslexia-mode", dyslexia);

    const readingGuide = $("toggleReadingGuide").checked;
    $("readingGuide").classList.toggle("hidden", !readingGuide);

    const highContrast = $("toggleHighContrast").checked;
    document.body.classList.toggle("high-contrast", highContrast);

    $("a11yDialog").close();
    toast("Accessibility and view settings applied!");
  });

  window.addEventListener("mousemove", e => {
    const guide = $("readingGuide");
    if (!guide.classList.contains("hidden")) {
      guide.style.top = `${e.clientY - 17}px`;
    }
  });

  $("profileForm").addEventListener("submit", async event => {
    event.preventDefault();
    state.profile.name = $("profileName").value.trim();
    state.profile.role = $("profileRole").value;
    state.profile.bio = $("profileBio").value.trim();
    saveProfileLocal();
    
    ["Science", "Mathematics", "Social Science", "English", "Computer Science", "Environmental Studies"].forEach(course => {
      ["community-", "doubts-"].forEach(prefix => {
        const key = `${prefix}${course}`;
        const msgs = localMessages(key).map(m => (m.uid === state.profile.uid || (state.demo && m.uid === "demo-user")) ? { ...m, name: state.profile.name, role: state.profile.role } : m);
        localStorage.setItem(key, JSON.stringify(msgs));
      });
    });

    if (firebaseConfigured && db && auth?.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: state.profile.name, role: state.profile.role, bio: state.profile.bio
      });
      await updateProfile(auth.currentUser, { displayName: state.profile.name });
    }
    updateProfileUI();
    loadChats();
    $("profileDialog").close();
    toast("Profile updated.");
  });

  $("courseForm").addEventListener("submit", async event => {
    event.preventDefault();
    state.profile.course = $("courseSelect").value;
    saveProfileLocal();
    if (firebaseConfigured && db && auth?.currentUser) {
      await updateDoc(doc(db, "users", auth.currentUser.uid), { course: state.profile.course });
    }
    updateProfileUI();
    renderLessonTopics();
    renderLesson();
    loadChats();
    $("courseDialog").close();
    toast(`Course changed to ${state.profile.course}.`);
  });

  $("lessonTopicSelect").addEventListener("change", renderLesson);

  $("speakLessonBtn").addEventListener("click", () => {
    speechSynthesis.cancel();
    const text = $("lessonBody").innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
    toast("Reading lesson...");
  });

  $("pauseAudioBtn").addEventListener("click", () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      toast("Audio paused.");
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume();
      toast("Audio resumed.");
    }
  });

  $("stopAudioBtn").addEventListener("click", () => {
    speechSynthesis.cancel();
    toast("Audio stopped.");
  });

  const dropzone = $("pdfDropzone");
  $("pdfInput").addEventListener("change", event => processPdf(event.target.files[0]));
  ["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault(); dropzone.classList.add("drag");
  }));
  ["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault(); dropzone.classList.remove("drag");
  }));
  dropzone.addEventListener("drop", event => {
    const file = event.dataTransfer.files[0];
    if (file?.type === "application/pdf" || file?.name.toLowerCase().endsWith(".pdf")) processPdf(file);
    else toast("Please choose a PDF file.");
  });

  $("copyNotesBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("pdfSummary").innerText);
    toast("Notes copied.");
  });

  $("downloadNotesBtn").addEventListener("click", () => {
    const blob = new Blob([$("pdfSummary").innerText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${$("pdfFileName").textContent}_Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Notes exported!");
  });

  $("flashcardContainer").addEventListener("click", () => {
    state.cardFlipped = !state.cardFlipped;
    renderFlashcard();
  });

  $("flashcardSearch").addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    state.filteredCards = state.cards.filter(c =>
      c.front.toLowerCase().includes(query) || c.back.toLowerCase().includes(query)
    );
    state.cardIndex = 0;
    state.cardFlipped = false;
    renderFlashcard();
  });

  $("nextCardBtn").addEventListener("click", () => {
    if (!state.filteredCards.length) return;
    state.cardIndex = (state.cardIndex + 1) % state.filteredCards.length;
    state.cardFlipped = false;
    renderFlashcard();
  });

  $("prevCardBtn").addEventListener("click", () => {
    if (!state.filteredCards.length) return;
    state.cardIndex = (state.cardIndex - 1 + state.filteredCards.length) % state.filteredCards.length;
    state.cardFlipped = false;
    renderFlashcard();
  });

  $("shuffleCardsBtn").addEventListener("click", () => {
    for (let i = state.filteredCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.filteredCards[i], state.filteredCards[j]] = [state.filteredCards[j], state.filteredCards[i]];
    }
    state.cardIndex = 0; state.cardFlipped = false; renderFlashcard();
    toast("Flashcards shuffled.");
  });

  $("resetCardsBtn").addEventListener("click", () => {
    state.filteredCards = [...state.cards];
    $("flashcardSearch").value = "";
    state.cardIndex = 0;
    state.cardFlipped = false;
    renderFlashcard();
    toast("Flashcards reset.");
  });

  $("communityForm").addEventListener("submit", async event => {
    event.preventDefault();
    const input = $("communityInput");
    await sendChat("community", input.value.trim());
    input.value = "";
  });

  $("doubtForm").addEventListener("submit", async event => {
    event.preventDefault();
    const input = $("doubtInput");
    await sendChat("doubt", input.value.trim());
    input.value = "";
  });

  $("taskForm").addEventListener("submit", event => {
    event.preventDefault();
    state.tasks.unshift({ id: crypto.randomUUID(), text: $("taskInput").value.trim(), date: $("taskDate").value, done: false });
    $("taskInput").value = ""; $("taskDate").value = ""; persistTasks();
  });

  $("timerStart").addEventListener("click", () => {
    if (state.timerId) return;
    state.timerId = setInterval(() => {
      state.timerSeconds -= 1;
      updateTimer();
      if (state.timerSeconds <= 0) {
        clearInterval(state.timerId); state.timerId = null; state.timerSeconds = 1500; updateTimer();
        toast("Focus sprint complete!");
      }
    }, 1000);
  });

  $("timerPause").addEventListener("click", () => {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
      toast("Timer paused.");
    }
  });

  $("timerReset").addEventListener("click", () => {
    clearInterval(state.timerId); state.timerId = null; state.timerSeconds = 1500; updateTimer();
  });

  $("themeBtn").addEventListener("click", () => {
    const active = document.body.classList.toggle("dark");
    $("themeBtn").setAttribute("aria-pressed", String(active));
    localStorage.setItem("equaleduDark", String(active));
  });

  $("focusModeBtn").addEventListener("click", () => {
    document.body.classList.add("focus-mode");
    $("focusModeBtn").setAttribute("aria-pressed", "true");
    toast("Focus mode enabled. Click 'Exit Focus Mode' at top right to return.");
  });

  $("exitFocusBtn").addEventListener("click", () => {
    document.body.classList.remove("focus-mode");
    $("focusModeBtn").setAttribute("aria-pressed", "false");
    toast("Exited focus mode.");
  });
}

async function init() {
  bindEvents();
  setAuthMode("signup");
  updateTimer();
  applyLanguage(state.lang);
  $("langSelect").value = state.lang;

  if (localStorage.getItem("equaleduDark") === "true") document.body.classList.add("dark");
  $("firebaseStatus").textContent = firebaseConfigured
    ? "Firebase detected. Create an account or sign in."
    : "Firebase is not configured yet. Demo mode is fully usable.";

  if (firebaseConfigured && auth && db) {
    onAuthStateChanged(auth, async user => {
      if (!user) {
        showAuth();
        return;
      }
      state.user = user;
      state.demo = false;
      await loadFirebaseProfile(user);
      showApp();
    });
  } else {
    showAuth();
  }
}

init().catch(error => {
  console.error(error);
  toast("The app could not start. Check the browser console.");
});
