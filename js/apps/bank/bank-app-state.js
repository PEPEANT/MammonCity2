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
  };
}

function normalizeBankTransferDraft(draft = {}) {
  return {
    recipient: typeof draft.recipient === "string" ? draft.recipient : "",
    amount: draft.amount == null ? "" : String(draft.amount),
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
  };

  targetState.bank = resolved;
  return resolved;
}

function getBankDomainState(targetState = state) {
  return syncBankDomainState(targetState);
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
  };

  targetState.bank = next;
  return next;
}

function createBankTransactionDateLabel(targetState = state) {
  const dayText = `${targetState?.day || 1}일차`;
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
  };

  patchBankDomainState(targetState, {
    transactions: [transaction, ...bankState.transactions].slice(0, 18),
  });

  return transaction;
}

function createBankAppViewModel(targetState = state) {
  const bankState = syncBankDomainState(targetState);
  const cashOnHand = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);
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
    transactionCount: bankState.transactions.length,
    totalInflow: totals.inflow,
    totalOutflow: totals.outflow,
    quickContacts: [...BANK_QUICK_CONTACTS],
    depositAmounts: [...BANK_QUICK_DEPOSIT_AMOUNTS],
    withdrawAmounts: [...BANK_QUICK_WITHDRAW_AMOUNTS],
    transferAmounts: [...BANK_QUICK_TRANSFER_AMOUNTS],
  };
}
