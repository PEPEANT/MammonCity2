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
async function submitRanking({ name, money, rank, job }) {
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

// Firebase 미설정 시 폴백 Mock 데이터
function getMockRankings() {
  return [
    { name: "배금고수", money: 2920000, rank: "S", job: "오피스 청소" },
    { name: "돈냄새", money: 2450000, rank: "A", job: "야간 편의점" },
    { name: "알바왕", money: 2180000, rank: "A", job: "새벽 물류" },
    { name: "생존러", money: 1840000, rank: "B", job: "점심 배달" },
    { name: "버티기", money: 1560000, rank: "C", job: "오픈 카페" },
    { name: "첫주급", money: 1230000, rank: "C", job: "중학생 과외" },
    { name: "힘들다", money: 980000, rank: "D", job: "무직" },
  ];
}
