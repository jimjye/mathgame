const LOCAL_STORAGE_KEY = "mathgame.bulls-and-cows.scores";
const MAX_LOCAL_SCORES = 20;

function readLocalScores() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeLocalScores(scores) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_LOCAL_SCORES)));
}

function normalizeScore(score) {
  return {
    playerCode: score.playerCode,
    answer: score.answer,
    attempts: score.attempts,
    seconds: score.seconds,
    won: score.won,
    createdAt: score.createdAt,
  };
}

async function createFirestoreStore(config) {
  const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  const app = appModule.initializeApp(config);
  const auth = authModule.getAuth(app);
  const db = firestoreModule.getFirestore(app);
  const scoresRef = firestoreModule.collection(db, "bullsAndCowsScores");

  if (!auth.currentUser) {
    await authModule.signInAnonymously(auth);
  }

  return {
    label: "Firestore",
    async save(score) {
      await firestoreModule.addDoc(scoresRef, normalizeScore(score));
    },
    async list() {
      const queryRef = firestoreModule.query(
        scoresRef,
        firestoreModule.orderBy("createdAt", "desc"),
        firestoreModule.limit(10),
      );
      const snapshot = await firestoreModule.getDocs(queryRef);
      return snapshot.docs.map((doc) => doc.data());
    },
  };
}

function createLocalStore() {
  return {
    label: "本機記錄",
    async save(score) {
      const scores = [normalizeScore(score), ...readLocalScores()];
      writeLocalScores(scores);
    },
    async list() {
      return readLocalScores();
    },
  };
}

export async function createScoreStore() {
  try {
    await import("./firebase-config.public.js");
  } catch {
    // Public config is expected on GitHub Pages. Missing file means local score storage.
  }

  try {
    // Optional local override. This file is ignored by Git.
    await import("./firebase-config.js");
  } catch {
  }

  const config = window.MATHGAME_FIREBASE_CONFIG;

  if (config) {
    try {
      return await createFirestoreStore(config);
    } catch (error) {
      console.warn("Firebase unavailable, falling back to local score store.", error);
    }
  }

  return createLocalStore();
}
