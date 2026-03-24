function getCasinoExchangeInputId(direction) {
  return direction === "sell"
    ? "casino-exchange-sell-input"
    : "casino-exchange-buy-input";
}

function isCasinoExchangeInputVisible(input) {
  if (!input) {
    return false;
  }

  return Boolean(input.offsetParent || input.getClientRects().length);
}

function getCasinoExchangeInputElement(direction, targetState = state) {
  const inputId = getCasinoExchangeInputId(direction);
  const selector = `[id="${inputId}"]`;
  const candidates = [...document.querySelectorAll(selector)];

  if (!candidates.length) {
    return null;
  }

  if (String(targetState?.scene || "").trim().toLowerCase() === "casino-floor") {
    return candidates.find((input) => input.closest(".casino-venue-shell"))
      || candidates.find((input) => isCasinoExchangeInputVisible(input))
      || candidates[candidates.length - 1];
  }

  if (Boolean(targetState?.phoneStageExpanded)) {
    return candidates.find((input) => input.closest(".phone-stage-app-screen"))
      || candidates.find((input) => isCasinoExchangeInputVisible(input))
      || candidates[0];
  }

  return candidates.find((input) => input.closest("#phone-app-screen"))
    || candidates.find((input) => isCasinoExchangeInputVisible(input))
    || candidates[0];
}

function updateCasinoExchangeDraft(direction, amount, targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const normalized = Math.max(0, Math.floor(Number(amount) || 0));
  casinoState.exchangeDraft[direction] = normalized > 0 ? String(normalized) : "";
  return casinoState.exchangeDraft[direction];
}

function fillCasinoExchangeDraft(direction, amount, targetState = state) {
  const value = updateCasinoExchangeDraft(direction, amount, targetState);
  const input = getCasinoExchangeInputElement(direction, targetState);
  if (input) {
    input.value = value;
  }
}

function readCasinoExchangeAmount(direction, targetState = state) {
  const input = getCasinoExchangeInputElement(direction, targetState);
  if (input) {
    updateCasinoExchangeDraft(direction, input.value, targetState);
  }

  const casinoState = syncCasinoState(targetState);
  return Math.max(0, Math.floor(Number(casinoState.exchangeDraft[direction]) || 0));
}

function setCasinoExchangeStatus(
  title,
  body,
  tone = "accent",
  targetState = state,
  { previewKicker = "EXCHANGE", previewTitle = title } = {},
) {
  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("casino", {
      kicker: "EXCHANGE",
      title,
      body,
      tone,
    }, targetState);
  }

  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview("casino", previewKicker, previewTitle, body);
  }
}

function buildCasinoExchangeQuickButtons(direction, balance, { disabled = false } = {}) {
  if (disabled) {
    return '<div class="casino-note is-lock">먹튀 이후 출금이 막혀 빠른 금액 선택을 사용할 수 없습니다.</div>';
  }

  const options = [
    Math.min(balance, 10000),
    Math.min(balance, 50000),
    Math.min(balance, 100000),
    balance,
  ].filter((amount, index, list) => amount >= CASINO_EXCHANGE_MIN_AMOUNT && list.indexOf(amount) === index);

  if (!options.length) {
    return '<div class="casino-note">환전 가능한 금액이 없습니다.</div>';
  }

  return `
    <div class="casino-quick-row">
      ${options.map((amount) => `
        <button
          class="casino-quick-btn"
          type="button"
          data-phone-action="casino-fill-exchange"
          data-direction="${direction}"
          data-amount="${amount}"
        >${escapePhoneAppHtml(formatMoney(amount))}</button>
      `).join("")}
    </div>
  `;
}

function buildCasinoExchangePane({
  title,
  body,
  direction,
  balance,
  actionLabel,
  actionId,
  draftValue,
  disabled = false,
  warningMarkup = "",
}) {
  const inputId = getCasinoExchangeInputId(direction);
  const actionToneClass = disabled
    ? "is-muted"
    : (direction === "buy" ? "is-gold" : "is-emerald");
  const disabledAttr = disabled ? "disabled" : "";
  const inputLabel = direction === "buy" ? "입금 금액" : "출금 금액";

  return `
    <section class="casino-panel casino-exchange-pane">
      <div class="casino-panel-header">
        <div>
          <div class="casino-panel-kicker">${direction === "buy" ? "CASH IN" : "CASH OUT"}</div>
          <div class="casino-panel-title">${escapePhoneAppHtml(title)}</div>
        </div>
        <div class="casino-panel-badge">${escapePhoneAppHtml(formatMoney(balance))}</div>
      </div>
      ${warningMarkup}
      <label class="casino-input-wrap" for="${inputId}">
        <span class="casino-input-label">${inputLabel}</span>
        <input
          id="${inputId}"
          class="casino-input"
          type="number"
          min="${CASINO_EXCHANGE_MIN_AMOUNT}"
          step="1000"
          value="${escapePhoneAppHtml(draftValue || "")}"
          placeholder="금액 입력"
          ${disabledAttr}
        />
      </label>
      ${buildCasinoExchangeQuickButtons(direction, balance, { disabled })}
      <button
        class="casino-action-btn ${actionToneClass}"
        type="button"
        data-phone-action="${actionId}"
        ${disabledAttr}
      >${escapePhoneAppHtml(actionLabel)}</button>
    </section>
  `;
}

function buildCasinoExchangeScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const casinoState = syncCasinoState(targetState);
  const showHomeButton = !stageMode;
  const cashBalance = getCasinoCashBalance(targetState);
  const chipBalance = getCasinoChipBalance(targetState);
  const scamState = casinoState.scam || {};
  const scamActive = Boolean(scamState.active);
  const scamWarningMarkup = scamActive
    ? `
      <div class="casino-note is-lock">
        천만 원 이상 출금을 시도한 뒤 환전소가 잠적했습니다. 잃은 칩은 ${escapePhoneAppHtml(formatMoney(scamState.lostAmount || 0))}이고, 현재 모든 출금이 중단되었습니다.
      </div>
    `
    : "";

  return `
    <div class="casino-app ${stageMode ? "is-stage" : ""}">
      <div class="casino-app-top">
        <div class="casino-app-copy">
          <span class="casino-app-kicker">EXCHANGE</span>
          <div class="casino-app-title">카지노 환전소</div>
        </div>
        <div class="casino-app-top-actions">
          ${showHomeButton ? '<button class="casino-mini-btn" type="button" data-phone-route="casino/home">홈</button>' : ""}
          <button class="casino-mini-btn" type="button" data-phone-route="casino/blackjack">블랙잭</button>
          <button class="casino-mini-btn" type="button" data-phone-route="casino/slots">슬롯</button>
        </div>
      </div>

      <div class="casino-wallet-strip">
        <div class="casino-wallet-card">
          <span class="casino-wallet-label">보유 현금</span>
          <strong class="casino-wallet-value">${escapePhoneAppHtml(formatMoney(cashBalance))}</strong>
        </div>
        <div class="casino-wallet-card">
          <span class="casino-wallet-label">보유 칩</span>
          <strong class="casino-wallet-value">${escapePhoneAppHtml(formatMoney(chipBalance))}</strong>
        </div>
      </div>

      ${scamWarningMarkup}

      <div class="casino-exchange-grid">
        ${buildCasinoExchangePane({
          title: "현금을 칩으로 교환",
          body: "테이블에서 쓸 자금을 미리 준비합니다.",
          direction: "buy",
          balance: cashBalance,
          actionLabel: "칩으로 환전",
          actionId: "casino-exchange-in",
          draftValue: casinoState.exchangeDraft.buy,
        })}
        ${buildCasinoExchangePane({
          title: "칩을 다시 현금으로",
          body: scamActive
            ? "천만 원 이상 출금 시도 이후 환전소가 잠적했습니다. 더 이상 칩을 현금으로 바꿀 수 없습니다."
            : "테이블을 마친 뒤 칩을 다시 현금으로 정리합니다.",
          direction: "sell",
          balance: chipBalance,
          actionLabel: scamActive ? "출금 중단" : "현금으로 출금",
          actionId: "casino-exchange-out",
          draftValue: casinoState.exchangeDraft.sell,
          disabled: scamActive,
          warningMarkup: scamActive
            ? '<div class="casino-note is-lock">먹튀 상태가 유지되는 동안은 어떤 금액도 출금되지 않습니다.</div>'
            : "",
        })}
      </div>
    </div>
  `;
}

function runCasinoExchange(direction, targetState = state) {
  const casinoState = syncCasinoState(targetState);

  if (!canUseCasinoExchange(targetState)) {
    setCasinoExchangeStatus(
      "테이블 진행 중",
      "블랙잭 라운드가 열려 있는 동안에는 환전소를 사용할 수 없습니다.",
      "fail",
      targetState,
    );
    renderGame();
    return false;
  }

  const amount = readCasinoExchangeAmount(direction, targetState);
  if (amount < CASINO_EXCHANGE_MIN_AMOUNT) {
    setCasinoExchangeStatus(
      "금액 오류",
      `최소 ${formatMoney(CASINO_EXCHANGE_MIN_AMOUNT)} 이상 입력해 주세요.`,
      "fail",
      targetState,
    );
    renderGame();
    return false;
  }

  if (direction === "sell" && isCasinoScamActive(targetState)) {
    const casinoScamState = syncCasinoState(targetState).scam || {};
    const message = `환전소가 이미 잠적해 출금이 막혔습니다. 잃은 칩 ${formatMoney(casinoScamState.lostAmount || 0)}은 회수되지 않습니다.`;
    casinoState.lastResult = { title: "먹튀 발생", body: message, tone: "fail", delta: 0 };
    setCasinoExchangeStatus("먹튀 발생", message, "fail", targetState, {
      previewKicker: "SCAM",
      previewTitle: "먹튀 발생",
    });
    if (typeof setHeadline === "function") {
      setHeadline("카지노 환전소", message);
    }
    renderGame();
    return false;
  }

  if (direction === "buy") {
    const cashBalance = getCasinoCashBalance(targetState);
    if (amount > cashBalance) {
      setCasinoExchangeStatus(
        "현금 부족",
        "보유 현금보다 많은 금액은 환전할 수 없습니다.",
        "fail",
        targetState,
      );
      renderGame();
      return false;
    }

    if (typeof spendCash === "function") {
      spendCash(amount, targetState);
    } else {
      targetState.money = Math.max(0, getCasinoCashBalance(targetState) - amount);
    }

    casinoState.chips += amount;
    updateCasinoExchangeDraft("buy", "", targetState);
    updateCasinoExchangeDraft("sell", "", targetState);

    const message = `${formatMoney(amount)}을 칩으로 환전했습니다. 이제 테이블에 앉을 수 있습니다.`;
    casinoState.lastResult = { title: "환전 완료", body: message, tone: "accent", delta: 0 };
    setCasinoExchangeStatus("환전 완료", message, "accent", targetState);
    if (typeof setHeadline === "function") {
      setHeadline("카지노 환전소", message);
    }
    if (typeof recordActionMemory === "function") {
      recordActionMemory("카지노에서 칩으로 환전했다", message, {
        type: "finance",
        source: "카지노 환전소",
        tags: ["카지노", "환전", "칩"],
      });
    }
    renderGame();
    return true;
  }

  if (amount > casinoState.chips) {
    setCasinoExchangeStatus(
      "칩 부족",
      "보유 칩보다 많은 금액은 출금할 수 없습니다.",
      "fail",
      targetState,
    );
    renderGame();
    return false;
  }

  if (amount >= CASINO_EXIT_SCAM_THRESHOLD) {
    const scamState = activateCasinoExitScam(targetState);
    updateCasinoExchangeDraft("buy", "", targetState);
    updateCasinoExchangeDraft("sell", "", targetState);

    const lostAmount = Math.max(0, Math.round(Number(scamState.lostAmount) || 0));
    const message = `출금 요청액이 ${formatMoney(CASINO_EXIT_SCAM_THRESHOLD)}을 넘자 환전소가 잠적했습니다. 보유 칩 ${formatMoney(lostAmount)}이 전부 증발했고 출금은 영구 중단되었습니다.`;
    casinoState.lastResult = { title: "먹튀 발생", body: message, tone: "fail", delta: -lostAmount };
    setCasinoExchangeStatus("먹튀 발생", message, "fail", targetState, {
      previewKicker: "SCAM",
      previewTitle: "먹튀 발생",
    });
    if (typeof setHeadline === "function") {
      setHeadline("카지노 환전소", message);
    }
    if (typeof recordActionMemory === "function") {
      recordActionMemory("카지노 환전소가 먹튀했다", message, {
        type: "finance",
        source: "카지노 환전소",
        tags: ["카지노", "먹튀", "출금"],
      });
    }
    renderGame();
    return false;
  }

  casinoState.chips = Math.max(0, casinoState.chips - amount);
  if (typeof earnCash === "function") {
    earnCash(amount, targetState);
  } else {
    targetState.money = getCasinoCashBalance(targetState) + amount;
  }
  updateCasinoExchangeDraft("buy", "", targetState);
  updateCasinoExchangeDraft("sell", "", targetState);

  const message = `${formatMoney(amount)}어치 칩을 현금으로 출금했습니다. 환전 자금이 다시 손에 들어왔습니다.`;
  casinoState.lastResult = { title: "출금 완료", body: message, tone: "success", delta: 0 };
  setCasinoExchangeStatus("출금 완료", message, "success", targetState);
  if (typeof setHeadline === "function") {
    setHeadline("카지노 환전소", message);
  }
  if (typeof recordActionMemory === "function") {
    recordActionMemory("카지노 칩을 현금으로 출금했다", message, {
      type: "finance",
      source: "카지노 환전소",
      tags: ["카지노", "출금", "칩"],
    });
  }
  renderGame();
  return true;
}

function runCasinoExchangeIn(targetState = state) {
  return runCasinoExchange("buy", targetState);
}

function runCasinoExchangeOut(targetState = state) {
  return runCasinoExchange("sell", targetState);
}
