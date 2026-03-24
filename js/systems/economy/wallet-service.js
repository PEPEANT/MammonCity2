function getWalletBalance(targetState = state) {
  if (!targetState || !Number.isFinite(targetState.money)) {
    return 0;
  }

  return targetState.money;
}

function formatCash(amount = 0) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${safeAmount.toLocaleString("ko-KR")}원`;
}

// HUD 전용: 긴 금액을 만/억 단위로 압축해서 표시
function formatCashHud(amount = 0) {
  const n = Number.isFinite(amount) ? amount : 0;
  if (n >= 100_000_000) {
    const val = n / 100_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(1)}억원`;
  }
  if (n >= 10_000) {
    const man = Math.floor(n / 10_000);
    return `${man.toLocaleString("ko-KR")}만원`;
  }
  return `${n.toLocaleString("ko-KR")}원`;
}

function canAfford(amount, targetState = state) {
  const cost = Math.max(0, Number(amount) || 0);
  return getWalletBalance(targetState) >= cost;
}

function setCashBalance(nextAmount, targetState = state) {
  if (!targetState) {
    return 0;
  }

  targetState.money = Math.max(0, Number(nextAmount) || 0);
  return targetState.money;
}

function earnCash(amount, targetState = state) {
  const delta = Math.max(0, Number(amount) || 0);
  return setCashBalance(getWalletBalance(targetState) + delta, targetState);
}

function spendCash(amount, targetState = state) {
  const delta = Math.max(0, Number(amount) || 0);

  if (!canAfford(delta, targetState)) {
    return false;
  }

  setCashBalance(getWalletBalance(targetState) - delta, targetState);
  return true;
}
