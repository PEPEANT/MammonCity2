const CASINO_BLACKJACK_SUITS = Object.freeze(["S", "H", "D", "C"]);
const CASINO_BLACKJACK_VALUES = Object.freeze(["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]);
const CASINO_BLACKJACK_SUIT_SYMBOLS = Object.freeze({
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
});

function createCasinoBlackjackShoe(deckCount = CASINO_BLACKJACK_DECK_COUNT) {
  const shoe = [];

  for (let index = 0; index < deckCount; index += 1) {
    CASINO_BLACKJACK_SUITS.forEach((suit) => {
      CASINO_BLACKJACK_VALUES.forEach((value) => {
        shoe.push({ suit, value });
      });
    });
  }

  for (let index = shoe.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shoe[index], shoe[swapIndex]] = [shoe[swapIndex], shoe[index]];
  }

  return shoe;
}

function ensureCasinoBlackjackShoe(targetState = state, blackjackState = null) {
  const resolvedBlackjackState = blackjackState || syncCasinoState(targetState).blackjack;
  if (resolvedBlackjackState.shoe.length < 20) {
    resolvedBlackjackState.shoe = createCasinoBlackjackShoe();
  }
  return resolvedBlackjackState.shoe;
}

function drawCasinoBlackjackCard(targetState = state, blackjackState = null) {
  const resolvedBlackjackState = blackjackState || syncCasinoState(targetState).blackjack;
  ensureCasinoBlackjackShoe(targetState, resolvedBlackjackState);
  return resolvedBlackjackState.shoe.pop() || { suit: "S", value: "A" };
}

function getCasinoBlackjackCardValue(card) {
  if (!card) {
    return 0;
  }
  if (["J", "Q", "K"].includes(card.value)) {
    return 10;
  }
  if (card.value === "A") {
    return 1;
  }
  return Math.max(0, Math.floor(Number(card.value) || 0));
}

function calculateCasinoBlackjackScore(hand, { isPlayer = false, acePreference = 11 } = {}) {
  const cards = Array.isArray(hand) ? hand : [];
  let score = 0;
  let aceCount = 0;

  cards.forEach((card) => {
    score += getCasinoBlackjackCardValue(card);
    if (card?.value === "A") {
      aceCount += 1;
    }
  });

  if (!aceCount) {
    return score;
  }

  if (isPlayer) {
    if (acePreference === 11 && score + 10 <= 21) {
      return score + 10;
    }
    return score;
  }

  return score + 10 <= 21 ? score + 10 : score;
}

function calculateCasinoDealerVisibleScore(hand) {
  const visibleCard = Array.isArray(hand) && hand.length ? hand[0] : null;
  if (!visibleCard) {
    return 0;
  }
  return visibleCard.value === "A"
    ? 11
    : getCasinoBlackjackCardValue(visibleCard);
}

function hasCasinoBlackjackAce(hand) {
  return Array.isArray(hand) && hand.some((card) => card?.value === "A");
}

function getCasinoBlackjackQuickBets(targetState = state) {
  const chips = getCasinoChipBalance(targetState);
  return [
    Math.min(chips, 1000),
    Math.min(chips, 5000),
    Math.min(chips, 10000),
    chips,
  ].filter((amount, index, list) => amount >= CASINO_BLACKJACK_MIN_BET && list.indexOf(amount) === index);
}

function buildCasinoBlackjackCardMarkup(card, { hidden = false } = {}) {
  if (hidden) {
    return `
      <div class="casino-bj-card is-back" aria-label="hidden card">
        <div class="casino-bj-card-back"></div>
      </div>
    `;
  }

  const suit = CASINO_BLACKJACK_SUIT_SYMBOLS[card?.suit] || "♠";
  const value = String(card?.value || "?");
  const isRed = suit === "♥" || suit === "♦";

  return `
    <div class="casino-bj-card ${isRed ? "is-red" : ""}">
      <div class="casino-bj-card-corner">${escapePhoneAppHtml(value)}<span>${suit}</span></div>
      <div class="casino-bj-card-center">${suit}</div>
      <div class="casino-bj-card-corner is-bottom">${escapePhoneAppHtml(value)}<span>${suit}</span></div>
    </div>
  `;
}

function buildCasinoBlackjackHandMarkup(hand, { hideSecond = false, placeholder = "카드를 기다리는 중" } = {}) {
  const cards = Array.isArray(hand) ? hand : [];
  if (!cards.length) {
    return `<div class="casino-bj-empty">${escapePhoneAppHtml(placeholder)}</div>`;
  }

  return cards
    .map((card, index) => buildCasinoBlackjackCardMarkup(card, { hidden: hideSecond && index === 1 }))
    .join("");
}

function addCasinoBlackjackBet(amount, targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;
  const normalizedAmount = Math.max(0, Math.floor(Number(amount) || 0));

  if (casinoState.usedToday || blackjackState.phase !== "betting") {
    return false;
  }

  if (normalizedAmount < CASINO_BLACKJACK_MIN_BET || normalizedAmount > casinoState.chips) {
    return false;
  }

  casinoState.chips -= normalizedAmount;
  blackjackState.bet += normalizedAmount;
  renderGame();
  return true;
}

function resetCasinoBlackjackBet(targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;

  if (blackjackState.phase !== "betting" || blackjackState.bet <= 0) {
    return false;
  }

  casinoState.chips += blackjackState.bet;
  blackjackState.bet = 0;
  renderGame();
  return true;
}

function setCasinoBlackjackAcePreference(value, targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  blackjackState.playerAcePreference = value === 1 ? 1 : 11;
  renderGame();
  return true;
}

function startCasinoBlackjackRound(targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;

  if (casinoState.usedToday) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("casino", {
        kicker: "BLACKJACK",
        title: "오늘의 판 종료",
        body: "블랙잭은 하루에 한 판만 진행할 수 있습니다.",
        tone: "fail",
      }, targetState);
    }
    renderGame();
    return false;
  }

  if (blackjackState.bet < CASINO_BLACKJACK_MIN_BET) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("casino", {
        kicker: "BLACKJACK",
        title: "베팅 필요",
        body: `최소 ${formatMoney(CASINO_BLACKJACK_MIN_BET)} 이상 베팅해야 테이블을 시작할 수 있습니다.`,
        tone: "fail",
      }, targetState);
    }
    renderGame();
    return false;
  }

  blackjackState.phase = "player-turn";
  blackjackState.dealerHidden = true;
  blackjackState.playerAcePreference = 11;
  blackjackState.playerHand = [];
  blackjackState.dealerHand = [];
  blackjackState.messageTitle = "";
  blackjackState.messageBody = "";
  blackjackState.outcome = "";
  blackjackState.resultTone = "accent";
  ensureCasinoBlackjackShoe(targetState, blackjackState);

  blackjackState.playerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));
  blackjackState.dealerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));
  blackjackState.playerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));
  blackjackState.dealerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));

  const playerScore = calculateCasinoBlackjackScore(blackjackState.playerHand, {
    isPlayer: true,
    acePreference: blackjackState.playerAcePreference,
  });
  if (playerScore === 21) {
    resolveCasinoBlackjackNatural(targetState);
  } else {
    renderGame();
  }

  return true;
}

function resolveCasinoBlackjackNatural(targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  blackjackState.dealerHidden = false;
  const dealerScore = calculateCasinoBlackjackScore(blackjackState.dealerHand);

  if (dealerScore === 21) {
    finishCasinoBlackjackRound("push", "양쪽 모두 블랙잭이다. 무승부로 판돈만 돌아온다.", {
      title: "블랙잭 푸시",
      tone: "accent",
      blackjack: false,
    }, targetState);
    return;
  }

  finishCasinoBlackjackRound("player", "첫 패가 완벽하게 들어왔다. 블랙잭으로 3:2 배당을 받았다.", {
    title: "블랙잭 승리",
    tone: "success",
    blackjack: true,
  }, targetState);
}

function casinoBlackjackHit(targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  if (blackjackState.phase !== "player-turn") {
    return false;
  }

  blackjackState.playerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));
  const playerScore = calculateCasinoBlackjackScore(blackjackState.playerHand, {
    isPlayer: true,
    acePreference: blackjackState.playerAcePreference,
  });

  if (playerScore > 21) {
    finishCasinoBlackjackRound("dealer", "21을 넘겨 버스트가 났다. 판돈을 잃었다.", {
      title: "버스트",
      tone: "fail",
    }, targetState);
    return true;
  }

  renderGame();
  return true;
}

function casinoBlackjackDoubleDown(targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;

  if (blackjackState.phase !== "player-turn" || blackjackState.playerHand.length !== 2) {
    return false;
  }

  if (casinoState.chips < blackjackState.bet) {
    if (typeof setPhoneAppStatus === "function") {
      setPhoneAppStatus("casino", {
        kicker: "BLACKJACK",
        title: "칩 부족",
        body: "더블 다운을 하려면 현재 베팅만큼 칩이 더 필요합니다.",
        tone: "fail",
      }, targetState);
    }
    renderGame();
    return false;
  }

  casinoState.chips -= blackjackState.bet;
  blackjackState.bet *= 2;
  blackjackState.playerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));

  const playerScore = calculateCasinoBlackjackScore(blackjackState.playerHand, {
    isPlayer: true,
    acePreference: blackjackState.playerAcePreference,
  });

  if (playerScore > 21) {
    finishCasinoBlackjackRound("dealer", "더블 다운 직후 버스트가 났다. 판돈을 모두 잃었다.", {
      title: "더블 다운 실패",
      tone: "fail",
    }, targetState);
    return true;
  }

  return casinoBlackjackStand(targetState);
}

function casinoBlackjackStand(targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  if (blackjackState.phase !== "player-turn") {
    return false;
  }

  blackjackState.phase = "dealer-turn";
  blackjackState.dealerHidden = false;

  while (calculateCasinoBlackjackScore(blackjackState.dealerHand) < 17) {
    blackjackState.dealerHand.push(drawCasinoBlackjackCard(targetState, blackjackState));
  }

  const playerScore = calculateCasinoBlackjackScore(blackjackState.playerHand, {
    isPlayer: true,
    acePreference: blackjackState.playerAcePreference,
  });
  const dealerScore = calculateCasinoBlackjackScore(blackjackState.dealerHand);

  if (dealerScore > 21) {
    finishCasinoBlackjackRound("player", "딜러가 버스트했다. 침착하게 판을 가져왔다.", {
      title: "딜러 버스트",
      tone: "success",
    }, targetState);
    return true;
  }

  if (playerScore > dealerScore) {
    finishCasinoBlackjackRound("player", "점수 싸움에서 이겼다. 칩 더미가 손앞으로 밀려온다.", {
      title: "승리",
      tone: "success",
    }, targetState);
    return true;
  }

  if (dealerScore > playerScore) {
    finishCasinoBlackjackRound("dealer", "딜러 쪽 점수가 더 높다. 이번 판은 잃었다.", {
      title: "패배",
      tone: "fail",
    }, targetState);
    return true;
  }

  finishCasinoBlackjackRound("push", "동점이 나왔다. 판돈만 그대로 돌려받는다.", {
    title: "푸시",
    tone: "accent",
  }, targetState);
  return true;
}

function finishCasinoBlackjackRound(winner, body, {
  title = "결과",
  tone = "accent",
  blackjack = false,
} = {}, targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;
  const bet = blackjackState.bet;
  let payout = 0;
  let wealthDelta = 0;

  if (winner === "player") {
    payout = blackjack
      ? bet + Math.floor(bet * 1.5)
      : bet * 2;
    casinoState.chips += payout;
    wealthDelta = blackjack ? Math.floor(bet * 1.5) : bet;
  } else if (winner === "push") {
    payout = bet;
    casinoState.chips += payout;
  } else {
    wealthDelta = -bet;
  }

  blackjackState.phase = "result";
  blackjackState.dealerHidden = false;
  blackjackState.messageTitle = title;
  blackjackState.messageBody = body;
  blackjackState.resultTone = tone;
  blackjackState.outcome = winner;
  blackjackState.bet = 0;

  setCasinoUsedToday(true, targetState);

  const finalMessage = winner === "player"
    ? `${body} 순이익 ${formatMoney(wealthDelta)}.`
    : winner === "dealer"
      ? `${body} 손실 ${formatMoney(Math.abs(wealthDelta))}.`
      : body;

  const refreshedCasinoState = syncCasinoState(targetState);
  refreshedCasinoState.lastResult = {
    title,
    body: finalMessage,
    tone,
    delta: wealthDelta,
  };

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("casino", {
      kicker: "BLACKJACK",
      title,
      body: finalMessage,
      tone,
    }, targetState);
  }

  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("casino", "BLACKJACK", title, finalMessage);
  }

  if (typeof setHeadline === "function") {
    setHeadline("카지노 블랙잭", finalMessage);
  }

  if (typeof showMoneyEffect === "function" && wealthDelta !== 0) {
    showMoneyEffect(wealthDelta);
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory("카지노 블랙잭 한 판을 마쳤다", finalMessage, {
      type: "finance",
      source: "카지노 블랙잭",
      tags: ["카지노", "블랙잭", winner === "player" ? "승리" : winner === "dealer" ? "패배" : "무승부"],
    });
  }

  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
    return true;
  }

  renderGame();
  return true;
}

function buildCasinoBlackjackControls(targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;

  if (blackjackState.phase === "betting") {
    if (casinoState.usedToday) {
      return `
        <div class="casino-note is-lock">
          오늘 블랙잭은 이미 끝났습니다. 다음 턴 다시 테이블이 열립니다.
        </div>
      `;
    }

    const quickBets = getCasinoBlackjackQuickBets(targetState);
    if (!quickBets.length) {
      return `
        <div class="casino-note is-lock">
          베팅할 칩이 없습니다. 먼저 환전소에서 칩을 준비하세요.
        </div>
        <div class="casino-action-row">
          <button class="casino-action-btn is-emerald" type="button" data-phone-route="casino/exchange">환전소로 이동</button>
        </div>
      `;
    }

    return `
      <div class="casino-bj-betting">
        <div class="casino-chip-row">
          ${quickBets.map((amount) => `
            <button
              class="casino-chip-btn"
              type="button"
              data-phone-action="casino-add-bet"
              data-amount="${amount}"
            >${escapePhoneAppHtml(formatMoney(amount))}</button>
          `).join("")}
        </div>
        <div class="casino-action-row">
          <button
            class="casino-action-btn is-muted"
            type="button"
            data-phone-action="casino-reset-bet"
            ${blackjackState.bet > 0 ? "" : "disabled"}
          >베팅 취소</button>
          <button
            class="casino-action-btn is-gold"
            type="button"
            data-phone-action="casino-start-blackjack"
            ${blackjackState.bet >= CASINO_BLACKJACK_MIN_BET ? "" : "disabled"}
          >게임 시작</button>
        </div>
      </div>
    `;
  }

  if (blackjackState.phase === "player-turn") {
    const canDouble = casinoState.chips >= blackjackState.bet && blackjackState.playerHand.length === 2;
    return `
      <div class="casino-action-row">
        <button class="casino-action-btn is-blue" type="button" data-phone-action="casino-hit">히트</button>
        <button class="casino-action-btn is-red" type="button" data-phone-action="casino-stand">스탠드</button>
        <button
          class="casino-action-btn is-gold"
          type="button"
          data-phone-action="casino-double"
          ${canDouble ? "" : "disabled"}
        >더블 다운</button>
      </div>
    `;
  }

  return `
    <div class="casino-action-row">
      <button class="casino-action-btn is-muted" type="button" data-phone-route="casino/home">홈으로</button>
      <button class="casino-action-btn is-emerald" type="button" data-phone-route="casino/exchange">환전소로</button>
    </div>
  `;
}

function buildCasinoAceControls(targetState = state) {
  const blackjackState = syncCasinoState(targetState).blackjack;
  if (blackjackState.phase !== "player-turn" || !hasCasinoBlackjackAce(blackjackState.playerHand)) {
    return "";
  }

  return `
    <div class="casino-ace-controls">
      <button
        class="casino-ace-btn ${blackjackState.playerAcePreference === 1 ? "is-active" : ""}"
        type="button"
        data-phone-action="casino-set-ace"
        data-ace="1"
      >A = 1</button>
      <button
        class="casino-ace-btn ${blackjackState.playerAcePreference === 11 ? "is-active" : ""}"
        type="button"
        data-phone-action="casino-set-ace"
        data-ace="11"
      >A = 11</button>
    </div>
  `;
}

function buildCasinoBlackjackScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const casinoState = syncCasinoState(targetState);
  const blackjackState = casinoState.blackjack;
  const playerScore = calculateCasinoBlackjackScore(blackjackState.playerHand, {
    isPlayer: true,
    acePreference: blackjackState.playerAcePreference,
  });
  const dealerScore = blackjackState.dealerHidden
    ? calculateCasinoDealerVisibleScore(blackjackState.dealerHand)
    : calculateCasinoBlackjackScore(blackjackState.dealerHand);
  const tableTitle = blackjackState.phase === "result"
    ? blackjackState.messageTitle || "결과"
    : casinoState.usedToday
      ? "오늘의 테이블 종료"
      : "블랙잭 테이블";
  const tableBody = blackjackState.phase === "result"
    ? blackjackState.messageBody
    : casinoState.usedToday
      ? "환전소에서 칩을 정리하고 다음 턴 다시 도전할 수 있습니다."
      : "A는 손패 상황에 맞게 1 또는 11로 조정할 수 있습니다.";

  return `
    <div class="casino-app casino-blackjack-screen ${stageMode ? "is-stage" : ""}">
      <div class="casino-app-top">
        <div class="casino-app-copy">
          <span class="casino-app-kicker">BLACKJACK</span>
          <div class="casino-app-title">전략 블랙잭 테이블</div>
          <div class="casino-app-note">칩을 걸고 한 판을 진행합니다. 하루에 한 번만 결과가 정산됩니다.</div>
        </div>
        <div class="casino-app-top-actions">
          ${!stageMode ? '<button class="casino-mini-btn" type="button" data-phone-route="casino/home">홈</button>' : ""}
          <button class="casino-mini-btn" type="button" data-phone-route="casino/exchange">환전소</button>
          <button class="casino-mini-btn" type="button" data-phone-route="casino/slots">슬롯</button>
        </div>
      </div>

      <div class="casino-wallet-strip">
        <div class="casino-wallet-card">
          <span class="casino-wallet-label">보유 칩</span>
          <strong class="casino-wallet-value">${escapePhoneAppHtml(formatMoney(casinoState.chips))}</strong>
        </div>
        <div class="casino-wallet-card">
          <span class="casino-wallet-label">현재 베팅</span>
          <strong class="casino-wallet-value">${escapePhoneAppHtml(formatMoney(blackjackState.bet))}</strong>
        </div>
      </div>

      <div class="casino-bj-table">
        <section class="casino-bj-seat dealer">
          <div class="casino-bj-seat-head">
            <span class="casino-bj-seat-label">DEALER</span>
            <span class="casino-bj-score">${dealerScore}</span>
          </div>
          <div class="casino-bj-hand">
            ${buildCasinoBlackjackHandMarkup(blackjackState.dealerHand, {
              hideSecond: blackjackState.dealerHidden,
              placeholder: "딜러가 카드를 준비하는 중",
            })}
          </div>
        </section>

        <section class="casino-bj-center ${blackjackState.phase === "result" ? `tone-${blackjackState.resultTone}` : ""}">
          <div class="casino-bj-center-kicker">TABLE STATUS</div>
          <div class="casino-bj-center-title">${escapePhoneAppHtml(tableTitle)}</div>
          <div class="casino-bj-center-body">${escapePhoneAppHtml(tableBody)}</div>
        </section>

        <section class="casino-bj-seat player">
          <div class="casino-bj-seat-head">
            <span class="casino-bj-seat-label">PLAYER</span>
            <span class="casino-bj-score">${playerScore}</span>
          </div>
          <div class="casino-bj-hand">
            ${buildCasinoBlackjackHandMarkup(blackjackState.playerHand, {
              placeholder: casinoState.usedToday
                ? "오늘 판은 이미 끝났습니다."
                : "칩을 올리고 첫 패를 기다리세요.",
            })}
          </div>
          ${buildCasinoAceControls(targetState)}
        </section>
      </div>

      ${buildCasinoBlackjackControls(targetState)}
    </div>
  `;
}
