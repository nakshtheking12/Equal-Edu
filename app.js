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

const state = {
  authMode: "signup",
  demo: !firebaseConfigured,
  user: null,
  profile: {
    uid: "demo-user",
    name: "Demo Learner",
    email: "demo@equalstart.local",
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
  tasks: JSON.parse(localStorage.getItem("equalstartTasks") || "[]")
};

const lessons = {
  Science: [
    {
      title: "Sustainable Tech & Photosynthesis",
      intro: "Innovating for a better tomorrow: Harnessing bio-inspired systems and light energy.",
      blocks: [
        "Photosynthesis mainly occurs in chloroplasts. Chlorophyll absorbs light energy and helps convert carbon dioxide and water into glucose.",
        "Water travels from roots to leaves through xylem. Carbon dioxide enters through stomata. Oxygen leaves the leaf as a by-product.",
        "Engineers study natural photosynthesis to design artificial solar fuels and clean energy systems aimed at innovating for a better tomorrow.",
        "Light intensity, carbon dioxide concentration, temperature, water supply and chlorophyll content can limit the rate of photosynthesis."
      ],
      keywords: ["chloroplast", "chlorophyll", "clean energy", "xylem", "glucose", "innovation"],
      quiz: { question: "Which structure contains chlorophyll?", options: ["Nucleus", "Chloroplast", "Vacuole", "Cell wall"], answer: 1 }
    },
    {
      title: "Force, Pressure & Clean Mobility",
      intro: "Engineering efficient transport systems for tomorrow's infrastructure.",
      blocks: [
        "A force is a push or pull that can change an object's motion, direction or shape.",
        "Pressure describes how a force is distributed over an area. The same force produces greater pressure when applied over a smaller area.",
        "Modern hyperloop systems and high-speed rail reduce friction and air pressure resistance, demonstrating how physics drives sustainable transit.",
        "In liquids, pressure acts in all directions and generally increases with depth."
      ],
      keywords: ["force", "pressure", "area", "transit innovation", "fluid pressure"],
      quiz: { question: "How can the same force create more pressure?", options: ["Increase area", "Decrease area", "Remove contact", "Increase time"], answer: 1 }
    }
  ],
  Mathematics: [
    {
      title: "Fractions & Sustainable Data",
      intro: "Quantifying resource distribution to build equitable systems.",
      blocks: [
        "The numerator tells how many equal parts are selected. The denominator tells how many equal parts form the whole.",
        "Equivalent fractions have the same value. Multiply or divide the numerator and denominator by the same non-zero number.",
        "Data analysts use fractional metrics to measure clean energy allocation across communities, innovating for a better tomorrow.",
        "To divide by a fraction, multiply by its reciprocal."
      ],
      keywords: ["numerator", "denominator", "equivalent", "metrics", "reciprocal"],
      quiz: { question: "Which fraction equals 1/2?", options: ["2/3", "2/4", "3/5", "5/8"], answer: 1 }
    }
  ],
  "Social Science": [
    {
      title: "Global Collaboration & History",
      intro: "Learning from historical conflicts to build global sustainable peace.",
      blocks: [
        "World War II began in Europe when Germany invaded Poland on 1 September 1939.",
        "The Allied powers and global treaties reshaped modern international governance and peacemaking standards.",
        "Global institutions created after historical conflicts continue to collaborate on climate policy and sustainable future frameworks.",
        "Understanding past turning points enables society to innovate better policy solutions for tomorrow."
      ],
      keywords: ["Axis", "Allies", "Global Governance", "United Nations", "Future Policy"],
      quiz: { question: "Which event began the war in Europe?", options: ["D-Day", "Invasion of Poland", "Pearl Harbor", "Battle of Midway"], answer: 1 }
    }
  ],
  English: [
    {
      title: "Persuasive Writing for Change",
      intro: "Crafting impactful narratives for sustainable global action.",
      blocks: [
        "A persuasive text presents a clear position and attempts to convince the reader.",
        "Strong arguments use reasons supported by relevant evidence, social impact data, and logical structure.",
        "Linking words such as therefore, however and consequently help ideas flow logically.",
        "Effective advocacy communication drives policy changes, inspiring communities to innovate for a better tomorrow."
      ],
      keywords: ["position", "argument", "evidence", "advocacy", "impact"],
      quiz: { question: "What strengthens a persuasive argument?", options: ["Unrelated details", "Relevant evidence", "No conclusion", "Repeated slogans only"], answer: 1 }
    }
  ],
  "Computer Science": [
    {
      title: "AI & Sustainable Tech",
      intro: "Exploring artificial intelligence solutions for tomorrow's challenges.",
      blocks: [
        "Artificial intelligence describes systems that perform tasks associated with human intelligence, including language processing and pattern recognition.",
        "Machine-learning models learn patterns from training data rather than receiving every rule directly.",
        "Generative AI and smart grids optimize renewable energy consumption across smart cities.",
        "Responsible AI requires privacy protection, bias testing, energy efficiency, and ethical human oversight."
      ],
      keywords: ["AI", "machine learning", "smart grid", "sustainability", "ethics"],
      quiz: { question: "What does a machine-learning model learn from?", options: ["Training data", "Only batteries", "Paper files", "No examples"], answer: 0 }
    }
  ],
  "Environmental Studies": [
    {
      title: "E-Waste & Circular Economy",
      intro: "Innovating for a better tomorrow through sustainable resource recovery.",
      blocks: [
        "E-waste includes discarded phones, computers, batteries, appliances and other electronics.",
        "Electronic devices contain useful metals but may also contain hazardous materials such as lead and mercury.",
        "Circular economy innovations focus on urban mining, closed-loop recycling, and material reuse.",
        "Personal data should be securely erased, and lithium-ion batteries must be recycled safely to protect our shared future."
      ],
      keywords: ["e-waste", "circular economy", "recycling", "sustainability", "innovation"],
      quiz: { question: "Where should unusable electronics go?", options: ["Open field", "Household fire", "Authorised recycler", "Water drain"], answer: 2 }
    }
  ]
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

function saveProfileLocal() {
  localStorage.setItem("equalstartProfile", JSON.stringify(state.profile));
}

function loadDemoProfile() {
  const stored = JSON.parse(localStorage.getItem("equalstartProfile") || "null");
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
  $("heroName").textContent = p.name.split(" ")[0];
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
  $("pageTitle").textContent = button?.innerText.trim() || "EqualStart";
  $("mainContent").focus();
  if (pageId === "communityPage" || pageId === "doubtPage") loadChats();
}

function renderLessonTopics() {
  const courseLessons = lessons[state.profile.course] || lessons.Science;
  $("lessonTopicSelect").innerHTML = courseLessons.map((lesson, index) =>
    `<option value="${index}">${safeText(lesson.title)}</option>`
  ).join("");
}

function currentLesson() {
  const courseLessons = lessons[state.profile.course] || lessons.Science;
  return courseLessons[Number($("lessonTopicSelect").value || 0)] || courseLessons[0];
}

function renderLesson() {
  const lesson = currentLesson();
  $("lessonHeading").textContent = lesson.title;
  $("lessonSubheading").textContent = lesson.intro;
  $("lessonBody").innerHTML = `
    <h2>${safeText(lesson.title)}</h2>
    <p>${safeText(lesson.intro)}</p>
    ${lesson.blocks.map((block, index) => `<div class="lesson-block"><b>${index + 1}.</b> ${safeText(block)}</div>`).join("")}
  `;
  $("lessonKeywords").innerHTML = lesson.keywords.map(word => `<span>${safeText(word)}</span>`).join("");
  renderQuickCheck(lesson.quiz);
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
      toast(chosen === quiz.answer ? "Correct — great work!" : "Review the highlighted answer.");
    });
  });
}

function addLessonCards(lesson) {
  state.cards = [
    ...lesson.keywords.map((word, index) => ({
      front: `What is ${word}?`,
      back: lesson.blocks.find(block => block.toLowerCase().includes(word.toLowerCase())) || lesson.blocks[index % lesson.blocks.length]
    })),
    ...lesson.blocks.map((block, index) => ({
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
  localStorage.setItem("equalstartTasks", JSON.stringify(state.tasks));
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
  $$("[data-close-dialog]").forEach(button => button.addEventListener("click", () => $(button.dataset.closeDialog).close()));

  $("profileForm").addEventListener("submit", async event => {
    event.preventDefault();
    state.profile.name = $("profileName").value.trim();
    state.profile.role = $("profileRole").value;
    state.profile.bio = $("profileBio").value.trim();
    saveProfileLocal();
    
    /* Update saved local storage chat histories so old messages display updated profile info */
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

  /* AUDIO / TEXT-TO-SPEECH CONTROLS */
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

  /* FLASHCARD CONTROLS WITH FLIP & SEARCH */
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
    localStorage.setItem("equalstartDark", String(active));
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
  if (localStorage.getItem("equalstartDark") === "true") document.body.classList.add("dark");
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