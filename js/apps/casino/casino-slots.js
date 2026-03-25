const CASINO_SLOT_SYMBOLS = Object.freeze([
  { id: "bar",    char: "BAR", color: "#ffd35a", payout: 80 },
  { id: "seven",  char: "7",   color: "#ff4d6a", payout: 40 },
  { id: "star",   char: "★",   color: "#c8d8ff", payout: 20 },
  { id: "bell",   char: "🔔",  color: "#ffc44d", payout: 10 },
  { id: "clover", char: "♣",   color: "#4affaa", payout: 5  },
  { id: "cherry", char: "🍒",  color: "#ff6b7a", payout: 2  },
]);

const CASINO_SLOT_SYMBOL_LOOKUP = Object.freeze(
  Object.fromEntries(CASINO_SLOT_SYMBOLS.map((symbol) => [symbol.id, symbol]))
);

function getCasinoSlotSymbol(symbolId) {
  return CASINO_SLOT_SYMBOL_LOOKUP[symbolId] || CASINO_SLOT_SYMBOLS[0];
}

function getCasinoSlotsState(targetState = state) {
  return syncCasinoState(targetState).slots;
}

function setCasinoSlotBet(amount, targetState = state) {
  const slotsState = getCasinoSlotsState(targetState);
  if (slotsState.phase === "spinning") {
    return false;
  }
  const normalizedAmount = Math.max(CASINO_SLOT_MIN_BET, Math.floor(Number(amount) || 0));
  slotsState.bet = normalizedAmount;
  slotsState.lastMessage = `배팅: ${formatMoney(normalizedAmount)}`;
  slotsState.resultTone = "accent";
  renderGame();
  return true;
}

function chooseCasinoSlotRandomSymbol() {
  return CASINO_SLOT_SYMBOLS[Math.floor(Math.random() * CASINO_SLOT_SYMBOLS.length)];
}

function evaluateCasinoSlotResult(resultSymbols, betAmount) {
  const [first, second, third] = resultSymbols;
  let winAmount = 0;
  let message = "다음 기회에...";
  let tone = "fail";

  if (first.id === second.id && second.id === third.id) {
    winAmount = betAmount * first.payout;
    message = `잭팟! ${first.char} 3개로 ${formatMoney(winAmount)}을 획득했다.`;
    tone = "success";
    return { winAmount, message, tone };
  }

  const cherryCount = resultSymbols.filter((symbol) => symbol.id === "cherry").length;
  if (cherryCount >= 2) {
    winAmount = betAmount * 2;
    message = `체리 보너스! ${formatMoney(winAmount)}이 지급됐다.`;
    tone = "success";
    return { winAmount, message, tone };
  }

  if (cherryCount === 1) {
    winAmount = Math.floor(betAmount * 0.5);
    message = `체리 환급으로 ${formatMoney(winAmount)}을 돌려받았다.`;
    tone = "accent";
    return { winAmount, message, tone };
  }

  return { winAmount, message, tone };
}

function finalizeCasinoSlotSpin(resultSymbols, targetState = state) {
  const casinoState = syncCasinoState(targetState);
  const slotsState = casinoState.slots;
  const betAmount = Math.max(
    CASINO_SLOT_MIN_BET,
    Math.round(Number(slotsState.spinBet || slotsState.bet) || CASINO_SLOT_MIN_BET)
  );
  const evaluation = evaluateCasinoSlotResult(resultSymbols, betAmount);

  if (evaluation.winAmount > 0) {
    casinoState.chips += evaluation.winAmount;
  }

  slotsState.phase = "idle";
  slotsState.spinBet = 0;
  slotsState.lastWin = evaluation.winAmount;
  slotsState.lastMessage = evaluation.message;
  slotsState.resultTone = evaluation.tone;
  slotsState.reelSymbolIds = resultSymbols.map((symbol) => symbol.id);

  const delta = evaluation.winAmount - betAmount;
  const summary = delta >= 0
    ? `${evaluation.message} 순손익 ${formatMoney(delta)}.`
    : `${evaluation.message} 손실 ${formatMoney(Math.abs(delta))}.`;

  casinoState.lastResult = {
    title: "슬롯 결과",
    body: summary,
    tone: evaluation.tone,
    delta,
  };

  if (typeof setPhoneAppStatus === "function") {
    setPhoneAppStatus("casino", {
      kicker: "SLOTS",
      title: evaluation.winAmount > 0 ? "슬롯 적중" : "슬롯 실패",
      body: summary,
      tone: evaluation.tone,
    }, targetState);
  }

  if (typeof createPhoneResultPreview === "function") {
    targetState.phonePreview = createPhoneResultPreview(
      "casino",
      "SLOTS",
      evaluation.winAmount > 0 ? "슬롯 적중" : "슬롯 실패",
      summary
    );
  }

  if (typeof setHeadline === "function") {
    setHeadline("카지노 슬롯", summary);
  }

  if (typeof recordActionMemory === "function") {
    recordActionMemory("카지노 슬롯을 돌렸다", summary, {
      type: "finance",
      source: "카지노 슬롯",
      tags: ["카지노", "슬롯", evaluation.winAmount > 0 ? "당첨" : "실패"],
    });
  }

  if (typeof finishPhoneAppTimeSpend === "function") {
    finishPhoneAppTimeSpend({ type: "slot", amount: TIME_COSTS.phoneApp });
    return true;
  }

  renderGame();
  return true;
}

function buildCasinoSlotsScreenMarkup({ stageMode = false, targetState = state } = {}) {
  const casinoState = syncCasinoState(targetState);
  const slotsState = casinoState.slots;
  const chipBalance = getCasinoChipBalance(targetState);
  const winValue = Math.max(0, Math.round(Number(slotsState.lastWin) || 0));

  return `
    <div class="casino-app casino-slots-screen ${stageMode ? "is-stage" : ""}">
      <div class="casino-app-top">
        <div class="casino-app-copy">
          ${stageMode ? "" : '<span class="casino-app-kicker">SLOTS</span>'}
          <div class="casino-app-title">골든 다이스 슬롯</div>
          ${stageMode ? "" : '<div class="casino-app-note">레버를 직접 당겨 슬롯을 돌립니다. 배팅은 칩으로 처리됩니다.</div>'}
        </div>
        <div class="casino-app-top-actions">
          ${!stageMode ? '<button class="casino-mini-btn" type="button" data-phone-route="casino/home">홈</button>' : ""}
          <button class="casino-mini-btn" type="button" data-phone-route="casino/exchange">환전소</button>
          <button class="casino-mini-btn" type="button" data-phone-route="casino/blackjack">블랙잭</button>
        </div>
      </div>

      <div
        class="casino-slot-machine"
        data-casino-slot-machine
        data-stage-mode="${stageMode ? "true" : "false"}"
      >
        <canvas
          class="casino-slot-canvas"
          data-casino-slot-canvas
          width="400"
          height="240"
        ></canvas>

        <div class="casino-slot-panel">
          <div class="casino-slot-status">
            <div class="casino-slot-display">
              <span class="casino-slot-display-label">CHIPS</span>
              <span class="casino-slot-display-value" data-casino-slot-credit>${escapePhoneAppHtml(formatMoney(chipBalance))}</span>
            </div>
            <div class="casino-slot-display">
              <span class="casino-slot-display-label">WIN</span>
              <span class="casino-slot-display-value" data-casino-slot-win>${escapePhoneAppHtml(formatMoney(winValue))}</span>
            </div>
          </div>

          <div class="casino-slot-message" data-casino-slot-message>${escapePhoneAppHtml(slotsState.lastMessage)}</div>

          <div class="casino-slot-bets">
            ${[10000, 50000, 100000].map((amount) => `
              <button
                class="casino-slot-bet-btn ${slotsState.bet === amount ? "is-active" : ""}"
                type="button"
                data-phone-action="casino-slot-set-bet"
                data-amount="${amount}"
                ${slotsState.phase === "spinning" ? "disabled" : ""}
              >${escapePhoneAppHtml(formatMoney(amount))}</button>
            `).join("")}
            <button
              class="casino-slot-bet-btn is-max"
              type="button"
              data-phone-action="casino-slot-set-bet"
              data-amount="${Math.min(chipBalance, 500000)}"
              ${slotsState.phase === "spinning" ? "disabled" : ""}
            >MAX</button>
          </div>

          <div class="casino-slot-paytable">
            <span class="casino-slot-pay-row"><span class="is-bar">BAR</span> × 3 → 80배</span>
            <span class="casino-slot-pay-row"><span class="is-seven">7</span> × 3 → 40배</span>
            <span class="casino-slot-pay-row"><span class="is-star">★</span> × 3 → 20배</span>
            <span class="casino-slot-pay-row"><span class="is-bell">🔔</span> × 3 → 10배</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

class CasinoSlotMachineController {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector("[data-casino-slot-canvas]");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.creditEl = root.querySelector("[data-casino-slot-credit]");
    this.winEl = root.querySelector("[data-casino-slot-win]");
    this.messageEl = root.querySelector("[data-casino-slot-message]");
    this.dragPointerId = null;
    this.lastFrameAt = 0;
    this.destroyed = false;

    const slotsState = getCasinoSlotsState();
    this.reels = slotsState.reelSymbolIds.map((symbolId) => ({
      symbol: getCasinoSlotSymbol(symbolId),
      speed: 0,
      offset: 0,
    }));
    this.visualState = "idle";
    this.finalResult = [];
    this.lever = {
      angle: 0,
      isDragging: false,
      dragStartY: 0,
    };

    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handlePointerUp = this.onPointerUp.bind(this);

    if (this.canvas && this.ctx) {
      this.bindEvents();
      this.updateHudFromState();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }
  }

  bindEvents() {
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.handlePointerUp);
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    }
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerUp);
  }

  updateHudFromState() {
    const casinoState = syncCasinoState();
    const slotsState = casinoState.slots;
    if (this.creditEl) {
      this.creditEl.textContent = formatMoney(casinoState.chips);
    }
    if (this.winEl) {
      this.winEl.textContent = formatMoney(slotsState.lastWin);
    }
    if (this.messageEl) {
      this.messageEl.textContent = slotsState.lastMessage;
    }
  }

  getPointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * this.canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * this.canvas.height,
    };
  }

  onPointerDown(event) {
    if (!this.canvas || this.visualState !== "idle" || getCasinoSlotsState().phase === "spinning") {
      return;
    }

    const { x, y } = this.getPointerPosition(event);
    if (x < 310 || y > 180) {
      return;
    }

    this.dragPointerId = event.pointerId;
    this.lever.isDragging = true;
    this.lever.dragStartY = y;
    this.visualState = "dragging";
    this.canvas.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (!this.lever.isDragging || event.pointerId !== this.dragPointerId) {
      return;
    }

    const { y } = this.getPointerPosition(event);
    const delta = (y - this.lever.dragStartY) * 0.01;
    this.lever.angle = Math.max(0, Math.min(1, delta));
  }

  onPointerUp(event) {
    if (!this.lever.isDragging || event.pointerId !== this.dragPointerId) {
      return;
    }

    this.lever.isDragging = false;
    this.dragPointerId = null;
    if (this.lever.angle > 0.6) {
      this.pullLeverAction();
      return;
    }

    this.visualState = "releasing";
  }

  pullLeverAction() {
    const casinoState = syncCasinoState();
    const slotsState = casinoState.slots;

    if (casinoState.chips < slotsState.bet) {
      slotsState.lastMessage = "칩이 부족합니다!";
      slotsState.lastWin = 0;
      this.updateHudFromState();
      this.visualState = "releasing";
      return;
    }

    casinoState.chips = Math.max(0, casinoState.chips - slotsState.bet);
    slotsState.phase = "spinning";
    slotsState.spinBet = slotsState.bet;
    slotsState.lastWin = 0;
    slotsState.lastMessage = "행운을 빕니다!";
    this.updateHudFromState();
    this.visualState = "releasing-spin";

    this.reels.forEach((reel, index) => {
      reel.speed = 30 + (index * 10);
    });
    this.finalResult = [chooseCasinoSlotRandomSymbol(), chooseCasinoSlotRandomSymbol(), chooseCasinoSlotRandomSymbol()];

    window.setTimeout(() => this.stopReel(0), 1000);
    window.setTimeout(() => this.stopReel(1), 1800);
    window.setTimeout(() => this.stopReel(2), 2600);
  }

  stopReel(index) {
    if (!this.reels[index]) {
      return;
    }

    this.reels[index].speed = 0;
    this.reels[index].symbol = this.finalResult[index];

    if (index === 2) {
      finalizeCasinoSlotSpin(this.finalResult);
      this.visualState = "idle";
    }
  }

  updatePhysics() {
    if (["releasing", "releasing-spin", "idle"].includes(this.visualState) && this.lever.angle > 0) {
      this.lever.angle = Math.max(0, this.lever.angle - 0.1);
    }

    this.reels.forEach((reel) => {
      if (reel.speed <= 0) {
        reel.offset = 0;
        return;
      }

      reel.offset += reel.speed;
      if (Math.random() > 0.5) {
        reel.symbol = chooseCasinoSlotRandomSymbol();
      }
    });
  }

  draw() {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const machineX = 10;
    const machineY = 15;
    const machineWidth = 300;
    const machineHeight = 200;

    const bodyGrad = ctx.createLinearGradient(machineX, machineY, machineX, machineY + machineHeight);
    bodyGrad.addColorStop(0, "#b91c1c");
    bodyGrad.addColorStop(1, "#450a0a");
    this.roundRect(machineX, machineY, machineWidth, machineHeight, 15, bodyGrad, "#fbbf24");

    this.roundRect(machineX + 15, machineY + 10, machineWidth - 30, 35, 8, "#222", "#eab308");
    ctx.fillStyle = "#ffd700";
    ctx.font = 'bold 18px "Georgia", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GOLDEN DICE", machineX + machineWidth / 2, machineY + 28);

    const screenX = machineX + 20;
    const screenY = machineY + 55;
    const screenWidth = machineWidth - 40;
    const screenHeight = 100;
    this.roundRect(screenX, screenY, screenWidth, screenHeight, 5, "#000", "#555");

    const reelWidth = screenWidth / 3;
    ctx.save();
    ctx.beginPath();
    ctx.rect(screenX, screenY, screenWidth, screenHeight);
    ctx.clip();

    this.reels.forEach((reel, index) => {
      const reelX = screenX + (index * reelWidth);
      const reelGrad = ctx.createLinearGradient(reelX, screenY, reelX + reelWidth, screenY);
      reelGrad.addColorStop(0, "#ccc");
      reelGrad.addColorStop(0.5, "#fff");
      reelGrad.addColorStop(1, "#ccc");
      ctx.fillStyle = reelGrad;
      ctx.fillRect(reelX + 1, screenY, reelWidth - 2, screenHeight);

      if (index > 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(reelX, screenY, 1, screenHeight);
      }

      const wobble = reel.speed > 0 ? (Math.random() * 6) - 3 : 0;
      ctx.font = "36px serif";
      ctx.fillStyle = "#000";
      ctx.fillText(reel.symbol.char, reelX + (reelWidth / 2), screenY + (screenHeight / 2) + wobble);
    });
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY + (screenHeight / 2));
    ctx.lineTo(screenX + screenWidth, screenY + (screenHeight / 2));
    ctx.stroke();

    this.drawLever(machineX + machineWidth, machineY + 70);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "9px sans-serif";
    ctx.fillText("🎲x50  💎x30  🔔x15  🍇x10  🍒x2", machineX + (machineWidth / 2), machineY + machineHeight - 12);
  }

  drawLever(baseX, baseY) {
    const ctx = this.ctx;
    const length = 60;

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.stroke();

    const radians = ((Math.PI / 2) * this.lever.angle) - (Math.PI / 6);
    ctx.rotate(radians);

    const grad = ctx.createLinearGradient(0, -3, length, 3);
    grad.addColorStop(0, "#ddd");
    grad.addColorStop(1, "#555");
    ctx.fillStyle = grad;
    ctx.fillRect(0, -3, length, 6);

    ctx.translate(length, 0);
    ctx.fillStyle = "#d00";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  roundRect(x, y, width, height, radius, fill, stroke) {
    const ctx = this.ctx;
    let safeRadius = radius;
    if (width < 2 * safeRadius) {
      safeRadius = width / 2;
    }
    if (height < 2 * safeRadius) {
      safeRadius = height / 2;
    }

    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  loop(timestamp) {
    if (this.destroyed || !this.root.isConnected) {
      this.destroy();
      return;
    }

    if (!this.lastFrameAt) {
      this.lastFrameAt = timestamp;
    }

    this.updatePhysics();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

function syncCasinoSlotMachineMounts() {
  if (typeof document === "undefined") {
    return;
  }

  document.querySelectorAll("[data-casino-slot-machine]").forEach((root) => {
    if (root.__casinoSlotController) {
      root.__casinoSlotController.updateHudFromState();
      return;
    }

    root.__casinoSlotController = new CasinoSlotMachineController(root);
  });
}
