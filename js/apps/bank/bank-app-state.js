const BANK_QUICK_CONTACTS = ["엄마", "김철수", "박지민", "관리비 센터"];
const BANK_QUICK_DEPOSIT_AMOUNTS = [10000, 30000];
const BANK_QUICK_WITHDRAW_AMOUNTS = [10000, 30000];
const BANK_QUICK_TRANSFER_AMOUNTS = [5000, 10000, 30000, 50000];

function cloneBankTransactionSnapshot(transaction) {
  if (!transaction || typeof transaction !== "object") {
    return null;
  }

  const amount = Number.isFinite(transaction.amount)
    ? Math.round(transaction.amount)
    : 0;

  return {
    id: transaction.id || `bank-${Date.now()}`,
    title: String(transaction.title || "거래 내역"),
    amount,
    direction: String(transaction.direction || (amount < 0 ? "out" : "in")),
    type: String(transaction.type || "general"),
    dateLabel: String(transaction.dateLabel || ""),
    note: String(transaction.note || ""),
    displayAmountLabel: String(transaction.displayAmountLabel || ""),
  };
}

function cloneBankLoanSnapshot(loan) {
  if (!loan || typeof loan !== "object") {
    return null;
  }

  return {
    id: String(loan.id || ""),
    type: String(loan.type || "personal"),
    label: String(loan.label || "대출"),
    lender: String(loan.lender || "배금은행"),
    collateralKind: String(loan.collateralKind || ""),
    collateralId: String(loan.collateralId || ""),
    collateralLabel: String(loan.collateralLabel || ""),
    principal: Math.max(0, Math.round(Number(loan.principal) || 0)),
    remainingPrincipal: Math.max(0, Math.round(Number(loan.remainingPrincipal) || 0)),
    interestRate: Math.max(0, Number(loan.interestRate) || 0),
    installmentAmount: Math.max(0, Math.round(Number(loan.installmentAmount) || 0)),
    originatedTurn: Math.max(1, Math.round(Number(loan.originatedTurn) || 1)),
    nextDueTurn: Math.max(1, Math.round(Number(loan.nextDueTurn) || 1)),
    termTurns: Math.max(1, Math.round(Number(loan.termTurns) || 1)),
    overdueCount: Math.max(0, Math.round(Number(loan.overdueCount) || 0)),
    status: String(loan.status || "active"),
  };
}

function normalizeBankTransferDraft(draft = {}) {
  return {
    recipient: typeof draft.recipient === "string" ? draft.recipient : "",
    amount: draft.amount == null ? "" : String(draft.amount),
  };
}

function normalizeBankLoanDraft(draft = {}) {
  return {
    selectedType: typeof draft.selectedType === "string" ? draft.selectedType : "personal",
  };
}

function cloneBankLoanResolution(resolution) {
  if (!resolution || typeof resolution !== "object") {
    return null;
  }

  return {
    title: String(resolution.title || ""),
    body: String(resolution.body || ""),
    tone: String(resolution.tone || "accent"),
    kicker: String(resolution.kicker || "BANK"),
    lines: Array.isArray(resolution.lines) ? [...resolution.lines] : [],
    overdueCount: Math.max(0, Math.round(Number(resolution.overdueCount) || 0)),
    seizureTriggered: Boolean(resolution.seizureTriggered),
  };
}

function createDefaultBankState() {
  return {
    balance: 0,
    transactions: [],
    transferDraft: {
      recipient: "",
      amount: "",
    },
    loans: [],
    loanDraft: {
      selectedType: "personal",
    },
    lastLoanResolution: null,
  };
}

function syncBankDomainState(targetState = state) {
  if (!targetState) {
    return createDefaultBankState();
  }

  const defaults = createDefaultBankState();
  const nested = targetState.bank && typeof targetState.bank === "object"
    ? targetState.bank
    : {};

  const resolved = {
    balance: Number.isFinite(nested.balance)
      ? Math.max(0, Math.round(nested.balance))
      : defaults.balance,
    transactions: Array.isArray(nested.transactions)
      ? nested.transactions.map(cloneBankTransactionSnapshot).filter(Boolean)
      : defaults.transactions,
    transferDraft: normalizeBankTransferDraft(nested.transferDraft),
    loans: Array.isArray(nested.loans)
      ? nested.loans.map(cloneBankLoanSnapshot).filter(Boolean)
      : defaults.loans,
    loanDraft: normalizeBankLoanDraft(nested.loanDraft),
    lastLoanResolution: cloneBankLoanResolution(nested.lastLoanResolution),
  };

  targetState.bank = resolved;
  return resolved;
}

function getBankDomainState(targetState = state) {
  return syncBankDomainState(targetState);
}

function getBankBalance(targetState = state) {
  return syncBankDomainState(targetState).balance;
}

function patchBankDomainState(targetState = state, patch = {}) {
  if (!targetState) {
    return createDefaultBankState();
  }

  const current = syncBankDomainState(targetState);
  const next = {
    ...current,
    ...patch,
    balance: Object.prototype.hasOwnProperty.call(patch, "balance")
      ? Math.max(0, Math.round(Number(patch.balance) || 0))
      : current.balance,
    transactions: Array.isArray(patch.transactions)
      ? patch.transactions.map(cloneBankTransactionSnapshot).filter(Boolean)
      : current.transactions.map(cloneBankTransactionSnapshot).filter(Boolean),
    transferDraft: Object.prototype.hasOwnProperty.call(patch, "transferDraft")
      ? normalizeBankTransferDraft({
          ...current.transferDraft,
          ...(patch.transferDraft || {}),
        })
      : normalizeBankTransferDraft(current.transferDraft),
    loans: Array.isArray(patch.loans)
      ? patch.loans.map(cloneBankLoanSnapshot).filter(Boolean)
      : current.loans.map(cloneBankLoanSnapshot).filter(Boolean),
    loanDraft: Object.prototype.hasOwnProperty.call(patch, "loanDraft")
      ? normalizeBankLoanDraft({
          ...current.loanDraft,
          ...(patch.loanDraft || {}),
        })
      : normalizeBankLoanDraft(current.loanDraft),
    lastLoanResolution: Object.prototype.hasOwnProperty.call(patch, "lastLoanResolution")
      ? cloneBankLoanResolution(patch.lastLoanResolution)
      : cloneBankLoanResolution(current.lastLoanResolution),
  };

  targetState.bank = next;
  return next;
}

function setBankBalance(nextAmount, targetState = state) {
  const nextState = patchBankDomainState(targetState, {
    balance: Math.max(0, Math.round(Number(nextAmount) || 0)),
  });
  return nextState.balance;
}

function createBankTransactionDateLabel(targetState = state) {
  const dayText = typeof formatTurnLabel === "function"
    ? formatTurnLabel(targetState?.day || 1)
    : `${targetState?.day || 1}턴`;
  const timeText = typeof formatClockTime === "function"
    ? formatClockTime(targetState?.timeSlot || DAY_START_TIME_SLOT, targetState?.timeMinuteOffset || 0)
    : "08:00";

  return `${dayText} ${timeText}`;
}

function recordBankTransaction({
  title = "거래 내역",
  amount = 0,
  direction = "",
  type = "general",
  note = "",
  dateLabel = "",
  displayAmountLabel = "",
} = {}, targetState = state) {
  const bankState = syncBankDomainState(targetState);
  const normalizedAmount = Math.round(Number(amount) || 0);
  const transaction = {
    id: `bank-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(title || "거래 내역"),
    amount: normalizedAmount,
    direction: String(direction || (normalizedAmount < 0 ? "out" : "in")),
    type: String(type || "general"),
    note: String(note || ""),
    dateLabel: String(dateLabel || createBankTransactionDateLabel(targetState)),
    displayAmountLabel: String(displayAmountLabel || ""),
  };

  patchBankDomainState(targetState, {
    transactions: [transaction, ...bankState.transactions].slice(0, 18),
  });

  return transaction;
}

function earnBankBalance(amount, meta = {}, targetState = state) {
  const delta = Math.max(0, Math.round(Number(amount) || 0));
  if (!delta) {
    return getBankBalance(targetState);
  }

  const nextBalance = setBankBalance(getBankBalance(targetState) + delta, targetState);
  if (meta?.record !== false) {
    recordBankTransaction({
      title: meta.title || "입금",
      amount: delta,
      direction: meta.direction || "in",
      type: meta.type || "general",
      note: meta.note || "",
      dateLabel: meta.dateLabel || "",
      displayAmountLabel: meta.displayAmountLabel || "",
    }, targetState);
  }
  return nextBalance;
}

function spendBankBalance(amount, meta = {}, targetState = state) {
  const delta = Math.max(0, Math.round(Number(amount) || 0));
  if (!delta) {
    return true;
  }

  const currentBalance = getBankBalance(targetState);
  if (currentBalance < delta) {
    return false;
  }

  setBankBalance(currentBalance - delta, targetState);
  if (meta?.record !== false) {
    recordBankTransaction({
      title: meta.title || "출금",
      amount: -delta,
      direction: meta.direction || "out",
      type: meta.type || "general",
      note: meta.note || "",
      dateLabel: meta.dateLabel || "",
      displayAmountLabel: meta.displayAmountLabel || "",
    }, targetState);
  }
  return true;
}

function createBankAppViewModel(targetState = state) {
  const bankState = syncBankDomainState(targetState);
  const cashOnHand = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);
  const totalAssetValue = typeof getOwnershipTotalAssetValue === "function"
    ? getOwnershipTotalAssetValue(targetState)
    : 0;
  const netWorth = typeof getOwnershipNetWorth === "function"
    ? getOwnershipNetWorth(targetState)
    : (cashOnHand + bankState.balance + totalAssetValue);
  const totals = bankState.transactions.reduce((summary, transaction) => {
    if (transaction.amount >= 0) {
      summary.inflow += transaction.amount;
    } else {
      summary.outflow += Math.abs(transaction.amount);
    }
    return summary;
  }, { inflow: 0, outflow: 0 });

  return {
    balance: bankState.balance,
    cashOnHand,
    transactions: bankState.transactions.map(cloneBankTransactionSnapshot).filter(Boolean),
    transferDraft: normalizeBankTransferDraft(bankState.transferDraft),
    loans: bankState.loans.map(cloneBankLoanSnapshot).filter(Boolean),
    loanDraft: normalizeBankLoanDraft(bankState.loanDraft),
    lastLoanResolution: cloneBankLoanResolution(bankState.lastLoanResolution),
    transactionCount: bankState.transactions.length,
    totalInflow: totals.inflow,
    totalOutflow: totals.outflow,
    quickContacts: [...BANK_QUICK_CONTACTS],
    depositAmounts: [...BANK_QUICK_DEPOSIT_AMOUNTS],
    withdrawAmounts: [...BANK_QUICK_WITHDRAW_AMOUNTS],
    transferAmounts: [...BANK_QUICK_TRANSFER_AMOUNTS],
    totalAssetValue,
    netWorth,
    ownedHomeAsset: typeof getOwnedHomeAssetRecord === "function"
      ? getOwnedHomeAssetRecord(targetState)
      : null,
    ownedVehicleAsset: typeof getOwnedVehicleAssetRecord === "function"
      ? getOwnedVehicleAssetRecord(targetState)
      : null,
    loanSummary: typeof getBankLoanSummary === "function"
      ? getBankLoanSummary(targetState)
      : {
          activeCount: bankState.loans.filter((loan) => loan.status === "active").length,
          totalOutstanding: bankState.loans.reduce((sum, loan) => sum + Math.max(0, Number(loan.remainingPrincipal) || 0), 0),
          dueThisTurn: 0,
          overdueCount: bankState.loans.reduce((sum, loan) => sum + Math.max(0, Number(loan.overdueCount) || 0), 0),
        },
    loanProducts: typeof getAvailableBankLoanProducts === "function"
      ? getAvailableBankLoanProducts(targetState)
      : [],
  };
}
