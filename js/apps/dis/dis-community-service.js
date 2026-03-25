const DIS_COMMUNITY_APP_ID_STORAGE_KEY = "mammoncity.firebaseAppId";
const DIS_COMMUNITY_COLLECTION_ID = "dcSingularityPosts";
const DIS_COMMUNITY_MAX_POSTS = 40;
let disCommunityAuthPromise = null;
let disCommunityRealtimeStarted = false;
let disCommunityRealtimeUnsubscribe = null;
let disCommunityCachedPosts = [];
let disCommunityConnectionState = {
  mode: "offline",
  live: false,
  ready: false,
  statusLabel: "오프라인 미리보기",
  detail: "Firebase 연결 전",
  userId: "",
};

function getDisCommunityStateTarget(targetState = null) {
  if (targetState && typeof targetState === "object") {
    return targetState;
  }

  return typeof state !== "undefined" && state && typeof state === "object"
    ? state
    : null;
}

function createDefaultDisCommunityState() {
  return {
    selectedPostId: "",
    tab: "all",
    draft: {
      author: "",
      title: "",
      content: "",
    },
    commentDraft: {
      author: "",
      content: "",
    },
  };
}

function syncDisCommunityState(targetState = null) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  if (!resolvedTargetState) {
    return createDefaultDisCommunityState();
  }

  const defaults = createDefaultDisCommunityState();
  const rawState = resolvedTargetState.disCommunity && typeof resolvedTargetState.disCommunity === "object"
    ? resolvedTargetState.disCommunity
    : {};

  resolvedTargetState.disCommunity = {
    ...defaults,
    ...rawState,
    selectedPostId: String(rawState.selectedPostId || ""),
    tab: rawState.tab === "best" ? "best" : "all",
    draft: {
      ...defaults.draft,
      ...(rawState.draft || {}),
    },
    commentDraft: {
      ...defaults.commentDraft,
      ...(rawState.commentDraft || {}),
    },
  };

  return resolvedTargetState.disCommunity;
}

function setDisCommunitySelectedPostId(postId = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.selectedPostId = String(postId || "").trim();
  return communityState.selectedPostId;
}

function setDisCommunityTab(tab = "all", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  communityState.tab = tab === "best" ? "best" : "all";
  return communityState.tab;
}

function setDisCommunityDraftField(field = "", value = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  if (!communityState.draft || typeof communityState.draft !== "object") {
    communityState.draft = { ...createDefaultDisCommunityState().draft };
  }

  if (Object.prototype.hasOwnProperty.call(communityState.draft, field)) {
    communityState.draft[field] = String(value ?? "");
  }

  return communityState.draft[field] || "";
}

function setDisCommunityCommentDraftField(field = "", value = "", targetState = null) {
  const communityState = syncDisCommunityState(targetState);
  if (!communityState.commentDraft || typeof communityState.commentDraft !== "object") {
    communityState.commentDraft = { ...createDefaultDisCommunityState().commentDraft };
  }

  if (Object.prototype.hasOwnProperty.call(communityState.commentDraft, field)) {
    communityState.commentDraft[field] = String(value ?? "");
  }

  return communityState.commentDraft[field] || "";
}

function normalizeDisCommunityTimestamp(value, fallback = Date.now()) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (value && typeof value.toMillis === "function") {
    return Math.max(0, Math.floor(value.toMillis()));
  }

  if (value && typeof value.seconds === "number") {
    return Math.max(0, Math.floor(value.seconds * 1000));
  }

  return Math.max(0, Math.floor(fallback || Date.now()));
}

function normalizeDisCommunityComment(comment = {}, index = 0) {
  return {
    id: String(comment.id || `comment-${Date.now()}-${index}`),
    author: String(comment.author || "익명"),
    content: String(comment.content || ""),
    createdAt: normalizeDisCommunityTimestamp(comment.createdAt, Date.now() - (index * 60000)),
  };
}

function normalizeDisCommunityPost(post = {}, index = 0) {
  const createdAt = normalizeDisCommunityTimestamp(post.createdAt, Date.now() - (index * 120000));
  const comments = Array.isArray(post.comments)
    ? post.comments.map((comment, commentIndex) => normalizeDisCommunityComment(comment, commentIndex))
    : [];

  return {
    id: String(post.id || `post-${createdAt}-${index}`),
    title: String(post.title || "제목 없음"),
    author: String(post.author || "익명"),
    content: String(post.content || ""),
    createdAt,
    views: Math.max(0, Math.floor(Number(post.views) || 0)),
    likes: Math.max(0, Math.floor(Number(post.likes) || 0)),
    comments,
  };
}

function cloneDisCommunityPost(post = {}) {
  return normalizeDisCommunityPost(post);
}

function getDisCommunityAppId() {
  const storageAppId = typeof localStorage !== "undefined"
    ? String(localStorage.getItem(DIS_COMMUNITY_APP_ID_STORAGE_KEY) || "").trim()
    : "";
  const windowAppId = typeof window !== "undefined"
    ? String(window.__MAMMONCITY_FIREBASE_APP_ID__ || "").trim()
    : "";

  return windowAppId || storageAppId || "mammoncity";
}

function isDisCommunityFirebaseReady() {
  return Boolean(
    typeof firebase !== "undefined"
    && typeof firebase.firestore === "function"
    && typeof window !== "undefined"
    && window.__FIREBASE_CONFIG_SET__,
  );
}

function canUseDisCommunityAuth() {
  return Boolean(
    isDisCommunityFirebaseReady()
    && typeof firebase.auth === "function",
  );
}

function getDisCommunityCollectionRef() {
  if (!isDisCommunityFirebaseReady()) {
    return null;
  }

  return firebase.firestore()
    .collection("artifacts")
    .doc(getDisCommunityAppId())
    .collection("public")
    .doc("data")
    .collection(DIS_COMMUNITY_COLLECTION_ID);
}

function updateDisCommunityConnectionState(patch = {}) {
  disCommunityConnectionState = {
    ...disCommunityConnectionState,
    ...patch,
  };
}

function getDisCommunityConnectionState() {
  return {
    ...disCommunityConnectionState,
  };
}

function getDisCommunityPosts() {
  return disCommunityCachedPosts.map((post) => cloneDisCommunityPost(post));
}

function getDisCommunityPostById(postId = "") {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId) {
    return null;
  }

  const post = disCommunityCachedPosts.find((entry) => entry.id === normalizedPostId);
  return post ? cloneDisCommunityPost(post) : null;
}

function renderDisCommunityIfPossible() {
  if (typeof renderGame === "function") {
    renderGame();
  }
}

async function ensureDisCommunityAuth() {
  if (!canUseDisCommunityAuth()) {
    return null;
  }

  const auth = firebase.auth();
  if (auth.currentUser) {
    updateDisCommunityConnectionState({
      userId: auth.currentUser.uid || "",
    });
    return auth.currentUser;
  }

  if (!disCommunityAuthPromise) {
    disCommunityAuthPromise = auth.signInAnonymously()
      .then((credential) => {
        updateDisCommunityConnectionState({
          userId: credential?.user?.uid || "",
        });
        return credential?.user || null;
      })
      .catch((error) => {
        console.warn("[dis-community] 익명 로그인 실패:", error);
        updateDisCommunityConnectionState({
          mode: "error",
          live: false,
          ready: false,
          statusLabel: "연결 실패",
          detail: "익명 로그인 실패",
          userId: "",
        });
        return null;
      })
      .finally(() => {
        disCommunityAuthPromise = null;
      });
  }

  return disCommunityAuthPromise;
}

function hydrateDisCommunitySnapshot(posts = []) {
  const normalizedPosts = posts
    .map((post, index) => normalizeDisCommunityPost(post, index))
    .sort((left, right) => right.createdAt - left.createdAt);

  disCommunityCachedPosts = normalizedPosts;
}

function ensureDisCommunityRealtime(targetState = null) {
  syncDisCommunityState(targetState);

  if (disCommunityRealtimeStarted) {
    return;
  }

  if (!isDisCommunityFirebaseReady()) {
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "오프라인 미리보기",
      detail: "Firebase 연결 전",
      userId: "",
    });
    return;
  }

  disCommunityRealtimeStarted = true;
  updateDisCommunityConnectionState({
    mode: "connecting",
    live: false,
    ready: false,
    statusLabel: "연결 중",
    detail: "실시간 갤러리 접속 중",
  });

  Promise.resolve()
    .then(() => ensureDisCommunityAuth())
    .then(() => {
      const collectionRef = getDisCommunityCollectionRef();
      if (!collectionRef) {
        updateDisCommunityConnectionState({
          mode: "offline",
          live: false,
          ready: false,
          statusLabel: "오프라인 미리보기",
          detail: "Firebase 경로 없음",
        });
        disCommunityRealtimeStarted = false;
        return;
      }

      disCommunityRealtimeUnsubscribe = collectionRef
        .orderBy("createdAt", "desc")
        .limit(DIS_COMMUNITY_MAX_POSTS)
        .onSnapshot((snapshot) => {
          const nextPosts = snapshot.docs.map((entry) => ({
            id: entry.id,
            ...entry.data(),
          }));
          hydrateDisCommunitySnapshot(nextPosts);
          updateDisCommunityConnectionState({
            mode: "live",
            live: true,
            ready: true,
            statusLabel: "실시간 온라인",
            detail: `게시글 ${disCommunityCachedPosts.length}개 동기화`,
          });
          renderDisCommunityIfPossible();
        }, (error) => {
          console.warn("[dis-community] 실시간 구독 실패:", error);
          updateDisCommunityConnectionState({
            mode: "error",
            live: false,
            ready: false,
            statusLabel: "연결 실패",
            detail: "실시간 구독 실패",
          });
          disCommunityRealtimeStarted = false;
          renderDisCommunityIfPossible();
        });
    })
    .catch((error) => {
      console.warn("[dis-community] 초기화 실패:", error);
      updateDisCommunityConnectionState({
        mode: "error",
        live: false,
        ready: false,
        statusLabel: "연결 실패",
        detail: "실시간 갤러리 초기화 실패",
      });
      disCommunityRealtimeStarted = false;
      renderDisCommunityIfPossible();
    });
}

function createDisCommunityLocalPost(payload = {}) {
  return normalizeDisCommunityPost({
    id: `local-post-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title: payload.title,
    author: payload.author,
    content: payload.content,
    createdAt: Date.now(),
    views: 0,
    likes: 0,
    comments: [],
  });
}

function upsertDisCommunityLocalPost(nextPost) {
  const normalizedPost = normalizeDisCommunityPost(nextPost);
  const remainingPosts = disCommunityCachedPosts.filter((post) => post.id !== normalizedPost.id);
  disCommunityCachedPosts = [normalizedPost, ...remainingPosts]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, DIS_COMMUNITY_MAX_POSTS);
  renderDisCommunityIfPossible();
  return normalizedPost;
}

function replaceDisCommunityLocalPost(nextPost) {
  const normalizedPost = normalizeDisCommunityPost(nextPost);
  disCommunityCachedPosts = disCommunityCachedPosts
    .map((post) => (post.id === normalizedPost.id ? normalizedPost : post))
    .sort((left, right) => right.createdAt - left.createdAt);
  renderDisCommunityIfPossible();
  return normalizedPost;
}

async function submitDisCommunityPost(payload = {}, targetState = null) {
  const resolvedTargetState = getDisCommunityStateTarget(targetState);
  const title = String(payload.title || "").trim();
  const author = String(payload.author || "").trim() || "익명";
  const content = String(payload.content || "").trim();

  if (!title || !content) {
    return {
      ok: false,
      reason: "empty",
    };
  }

  const localPost = createDisCommunityLocalPost({ title, author, content });
  const connectionReady = isDisCommunityFirebaseReady();
  if (!connectionReady) {
    const createdPost = upsertDisCommunityLocalPost(localPost);
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(createdPost.id, resolvedTargetState);
    }
    return {
      ok: true,
      online: false,
      postId: createdPost.id,
    };
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    const docRef = await collectionRef.add({
      title,
      author,
      content,
      createdAt: Date.now(),
      views: 0,
      likes: 0,
      comments: [],
    });
    upsertDisCommunityLocalPost({
      ...localPost,
      id: docRef.id,
    });
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(docRef.id, resolvedTargetState);
    }
    return {
      ok: true,
      online: true,
      postId: docRef.id,
    };
  } catch (error) {
    console.warn("[dis-community] 글 작성 실패:", error);
    const createdPost = upsertDisCommunityLocalPost(localPost);
    if (resolvedTargetState) {
      setDisCommunitySelectedPostId(createdPost.id, resolvedTargetState);
    }
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "오프라인 저장",
      detail: "로컬 미리보기로 저장됨",
    });
    return {
      ok: true,
      online: false,
      postId: createdPost.id,
    };
  }
}

async function submitDisCommunityComment(postId = "", payload = {}) {
  const normalizedPostId = String(postId || "").trim();
  const author = String(payload.author || "").trim() || "익명";
  const content = String(payload.content || "").trim();

  if (!normalizedPostId || !content) {
    return {
      ok: false,
      reason: "empty",
    };
  }

  const currentPost = getDisCommunityPostById(normalizedPostId);
  if (!currentPost) {
    return {
      ok: false,
      reason: "missing",
    };
  }

  const nextComment = normalizeDisCommunityComment({
    id: `comment-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    author,
    content,
    createdAt: Date.now(),
  });

  if (!isDisCommunityFirebaseReady()) {
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    return {
      ok: true,
      online: false,
    };
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    await collectionRef.doc(normalizedPostId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(nextComment),
    });
    return {
      ok: true,
      online: true,
    };
  } catch (error) {
    console.warn("[dis-community] 댓글 작성 실패:", error);
    replaceDisCommunityLocalPost({
      ...currentPost,
      comments: [...(currentPost.comments || []), nextComment],
    });
    updateDisCommunityConnectionState({
      mode: "offline",
      live: false,
      ready: false,
      statusLabel: "오프라인 저장",
      detail: "댓글을 로컬에 저장함",
    });
    return {
      ok: true,
      online: false,
    };
  }
}

async function incrementDisCommunityPostMetric(postId = "", metric = "views", amount = 1) {
  const normalizedPostId = String(postId || "").trim();
  if (!normalizedPostId || !["views", "likes"].includes(metric)) {
    return false;
  }

  const currentPost = getDisCommunityPostById(normalizedPostId);
  if (!currentPost) {
    return false;
  }

  const normalizedAmount = Math.max(1, Math.floor(Number(amount) || 1));
  if (!isDisCommunityFirebaseReady()) {
    replaceDisCommunityLocalPost({
      ...currentPost,
      [metric]: Math.max(0, Math.floor(Number(currentPost[metric]) || 0) + normalizedAmount),
    });
    return true;
  }

  try {
    await ensureDisCommunityAuth();
    const collectionRef = getDisCommunityCollectionRef();
    replaceDisCommunityLocalPost({
      ...currentPost,
      [metric]: Math.max(0, Math.floor(Number(currentPost[metric]) || 0) + normalizedAmount),
    });
    await collectionRef.doc(normalizedPostId).update({
      [metric]: firebase.firestore.FieldValue.increment(normalizedAmount),
    });
    return true;
  } catch (error) {
    console.warn(`[dis-community] ${metric} 갱신 실패:`, error);
    replaceDisCommunityLocalPost({
      ...currentPost,
      [metric]: Math.max(0, Math.floor(Number(currentPost[metric]) || 0) + normalizedAmount),
    });
    return true;
  }
}

function incrementDisCommunityPostView(postId = "") {
  return incrementDisCommunityPostMetric(postId, "views", 1);
}

function likeDisCommunityPost(postId = "") {
  return incrementDisCommunityPostMetric(postId, "likes", 1);
}
