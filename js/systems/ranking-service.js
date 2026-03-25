// ranking-service.js
// Firebase-backed ranking service with anonymous auth and realtime updates.

const RANKING_STORAGE_APP_ID_KEY = "mammoncity.firebaseAppId";
const RANKING_STORAGE_IDENTITY_KEY = "mammoncity.rankingIdentityKey";
const RANKING_COLLECTION_ID = "rankings";
const RANKING_LIMIT = 30;

let rankingAuthPromise = null;
let rankingRealtimeUnsubscribe = null;

function isFirebaseReady() {
  return Boolean(
    typeof firebase !== "undefined"
    && typeof firebase.firestore === "function"
    && typeof window !== "undefined"
    && window.__FIREBASE_CONFIG_SET__ === true,
  );
}

function getRankingAppId() {
  const storageAppId = typeof localStorage !== "undefined"
    ? String(localStorage.getItem(RANKING_STORAGE_APP_ID_KEY) || "").trim()
    : "";
  const windowAppId = typeof window !== "undefined"
    ? String(window.__MAMMONCITY_FIREBASE_APP_ID__ || "").trim()
    : "";

  return windowAppId || storageAppId || "mammoncity";
}

function createRankingIdentityKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `player:${crypto.randomUUID()}`;
  }
  return `player:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getRankingIdentityKey() {
  if (typeof localStorage === "undefined") {
    return "";
  }

  const storedKey = String(localStorage.getItem(RANKING_STORAGE_IDENTITY_KEY) || "").trim();
  if (storedKey) {
    return storedKey;
  }

  const generatedKey = createRankingIdentityKey();
  try {
    localStorage.setItem(RANKING_STORAGE_IDENTITY_KEY, generatedKey);
  } catch (error) {
    console.warn("[ranking] 로컬 식별키 저장 실패:", error);
  }
  return generatedKey;
}

function getRankingDocumentId(identityKey = "") {
  return String(identityKey || "")
    .trim()
    .replaceAll("/", "_")
    .replaceAll("\\", "_")
    .replaceAll(" ", "_");
}

function canUseRankingAuth() {
  return Boolean(
    isFirebaseReady()
    && typeof firebase.auth === "function",
  );
}

function getRankingCollectionRef() {
  if (!isFirebaseReady()) {
    return null;
  }

  return firebase.firestore()
    .collection("artifacts")
    .doc(getRankingAppId())
    .collection("public")
    .doc("data")
    .collection(RANKING_COLLECTION_ID);
}

async function ensureRankingAuth() {
  if (!canUseRankingAuth()) {
    return null;
  }

  const auth = firebase.auth();
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (!rankingAuthPromise) {
    rankingAuthPromise = auth.signInAnonymously()
      .then((credential) => credential?.user || auth.currentUser || null)
      .catch((error) => {
        console.warn("[ranking] 익명 로그인 실패:", error);
        return null;
      })
      .finally(() => {
        rankingAuthPromise = null;
      });
  }

  return rankingAuthPromise;
}

function normalizeRankingEntry(docId = "", entry = {}) {
  const createdAt = entry?.createdAt && typeof entry.createdAt.toMillis === "function"
    ? entry.createdAt.toMillis()
    : Math.max(0, Math.floor(Number(entry?.clientCreatedAt) || 0));

  return {
    id: String(docId || entry?.id || ""),
    identityKey: String(entry?.identityKey || ""),
    name: String(entry?.name || "무명"),
    money: Math.max(0, Math.floor(Number(entry?.money) || 0)),
    rank: String(entry?.rank || "D"),
    job: String(entry?.job || "무직"),
    spoon: String(entry?.spoon || "수저 미정"),
    spoonId: String(entry?.spoonId || ""),
    metricLabel: String(entry?.metricLabel || "최종 순자산"),
    happiness: Math.max(0, Math.floor(Number(entry?.happiness) || 0)),
    createdAt,
  };
}

function sortRankingEntries(entries = []) {
  return [...entries].sort((left, right) => {
    const moneyGap = Number(right?.money || 0) - Number(left?.money || 0);
    if (moneyGap !== 0) {
      return moneyGap;
    }

    const createdAtGap = Number(left?.createdAt || 0) - Number(right?.createdAt || 0);
    if (createdAtGap !== 0) {
      return createdAtGap;
    }

    return String(left?.name || "").localeCompare(String(right?.name || ""), "ko-KR");
  });
}

function getRankingEntryDedupeKey(entry = {}) {
  const identityKey = String(entry?.identityKey || "").trim();
  if (identityKey) {
    return `identity:${identityKey}`;
  }

  const name = String(entry?.name || "").trim().toLowerCase();
  const job = String(entry?.job || "").trim().toLowerCase();
  const rank = String(entry?.rank || "").trim().toLowerCase();
  const spoon = String(entry?.spoonId || entry?.spoon || "").trim().toLowerCase();
  const money = Math.max(0, Math.floor(Number(entry?.money) || 0));
  return `legacy:${name}|${money}|${job}|${rank}|${spoon}`;
}

function dedupeRankingEntries(entries = []) {
  const deduped = new Map();
  const sortedEntries = sortRankingEntries(entries);

  sortedEntries.forEach((entry) => {
    const dedupeKey = getRankingEntryDedupeKey(entry);
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, entry);
    }
  });

  return sortRankingEntries([...deduped.values()]);
}

function stopRankingRealtimeSubscription() {
  if (typeof rankingRealtimeUnsubscribe === "function") {
    rankingRealtimeUnsubscribe();
  }
  rankingRealtimeUnsubscribe = null;
}

async function submitRanking({ name, money, rank, job, spoon, spoonId, metricLabel, happiness } = {}) {
  if (!isFirebaseReady()) {
    console.warn("[ranking] Firebase 미설정: 제출 건너뜀");
    return null;
  }

  try {
    await ensureRankingAuth();
    const collectionRef = getRankingCollectionRef();
    if (!collectionRef) {
      return null;
    }

    const identityKey = getRankingIdentityKey();
    const documentId = getRankingDocumentId(identityKey);
    if (!documentId) {
      return null;
    }

    const normalizedMoney = Math.max(0, Math.floor(Number(money) || 0));
    const normalizedHappiness = Math.max(0, Math.floor(Number(happiness) || 0));
    const stableDocRef = collectionRef.doc(documentId);
    const existingSnapshot = await stableDocRef.get();
    const existingEntry = existingSnapshot.exists
      ? normalizeRankingEntry(existingSnapshot.id, existingSnapshot.data())
      : null;
    const shouldUpdate = !existingEntry
      || normalizedMoney > Number(existingEntry.money || 0)
      || (
        normalizedMoney === Number(existingEntry.money || 0)
        && normalizedHappiness >= Number(existingEntry.happiness || 0)
      );

    if (!shouldUpdate) {
      return documentId;
    }

    const payload = {
      identityKey,
      name: name || "무명",
      money: normalizedMoney,
      rank: rank || "D",
      job: job || "무직",
      spoon: spoon || "수저 미정",
      spoonId: spoonId || "",
      happiness: normalizedHappiness,
      metricLabel: metricLabel || "최종 순자산",
      clientCreatedAt: existingEntry?.createdAt || Date.now(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingSnapshot.exists) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    await stableDocRef.set(payload, { merge: true });
    return documentId;
  } catch (error) {
    console.warn("[ranking] 제출 실패:", error);
    return null;
  }
}

async function fetchTopRankings(limit = RANKING_LIMIT) {
  if (!isFirebaseReady()) {
    console.warn("[ranking] Firebase 미설정: 오프라인 랭킹 사용");
    return [];
  }

  try {
    await ensureRankingAuth();
    const collectionRef = getRankingCollectionRef();
    if (!collectionRef) {
      return [];
    }

    const normalizedLimit = Math.max(1, Math.floor(Number(limit) || RANKING_LIMIT));
    const snapshot = await collectionRef.get();

    const entries = snapshot.docs.map((doc) => normalizeRankingEntry(doc.id, doc.data()));
    return dedupeRankingEntries(entries).slice(0, normalizedLimit);
  } catch (error) {
    console.warn("[ranking] 조회 실패:", error);
    return [];
  }
}

function subscribeTopRankings(onUpdate, limit = RANKING_LIMIT) {
  stopRankingRealtimeSubscription();

  if (!isFirebaseReady() || typeof onUpdate !== "function") {
    return null;
  }

  let cancelled = false;
  const normalizedLimit = Math.max(1, Math.floor(Number(limit) || RANKING_LIMIT));

  ensureRankingAuth().then(() => {
    if (cancelled) {
      return;
    }

    const collectionRef = getRankingCollectionRef();
    if (!collectionRef) {
      onUpdate([]);
      return;
    }

    rankingRealtimeUnsubscribe = collectionRef.onSnapshot((snapshot) => {
      const entries = snapshot.docs.map((doc) => normalizeRankingEntry(doc.id, doc.data()));
      onUpdate(dedupeRankingEntries(entries).slice(0, normalizedLimit));
    }, (error) => {
      console.warn("[ranking] 실시간 구독 실패:", error);
      onUpdate([]);
    });
  }).catch((error) => {
    console.warn("[ranking] 구독 준비 실패:", error);
    onUpdate([]);
  });

  return () => {
    cancelled = true;
    stopRankingRealtimeSubscription();
  };
}

async function deleteCurrentRankingEntry() {
  if (!isFirebaseReady()) {
    return false;
  }

  try {
    await ensureRankingAuth();
    const collectionRef = getRankingCollectionRef();
    const identityKey = getRankingIdentityKey();
    const documentId = getRankingDocumentId(identityKey);
    if (!collectionRef || !documentId) {
      return false;
    }

    await collectionRef.doc(documentId).delete();
    return true;
  } catch (error) {
    console.warn("[ranking] 기존 랭킹 삭제 실패:", error);
    return false;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("#ranking-restart-btn")
      : null;
    if (!target) {
      return;
    }
    void deleteCurrentRankingEntry();
  }, true);
}
