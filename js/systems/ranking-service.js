// ranking-service.js
// Firebase Firestore 연동 랭킹 서비스
// Firebase config는 index.html에서 초기화됨

const RANKING_COLLECTION = "rankings";
const RANKING_LIMIT = 30;

// Firebase가 준비됐는지 확인
function isFirebaseReady() {
  return (
    typeof firebase !== "undefined" &&
    typeof firebase.firestore === "function" &&
    window.__FIREBASE_CONFIG_SET__ === true
  );
}

// 랭킹 제출
async function submitRanking({ name, money, rank, job, spoon, spoonId }) {
  if (!isFirebaseReady()) {
    console.warn("[ranking] Firebase 미설정 — 제출 건너뜀");
    return null;
  }

  try {
    const db = firebase.firestore();
    const docRef = await db.collection(RANKING_COLLECTION).add({
      name: name || "무명",
      money: money || 0,
      rank: rank || "D",
      job: job || "무직",
      spoon: spoon || "수저 미정",
      spoonId: spoonId || "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn("[ranking] 제출 실패:", err);
    return null;
  }
}

// 상위 랭킹 조회
async function fetchTopRankings(limit = RANKING_LIMIT) {
  if (!isFirebaseReady()) {
    console.warn("[ranking] Firebase 미설정 — Mock 데이터 반환");
    return getMockRankings();
  }

  try {
    const db = firebase.firestore();
    const snapshot = await db
      .collection(RANKING_COLLECTION)
      .orderBy("money", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn("[ranking] 조회 실패:", err);
    return getMockRankings();
  }
}

// Firebase 미설정 시 폴백 — 가짜 데이터 없음
function getMockRankings() {
  return [];
}
