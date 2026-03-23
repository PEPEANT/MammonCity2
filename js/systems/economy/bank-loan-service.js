const BANK_LOAN_PRODUCT_CONFIG = Object.freeze({
  personal: Object.freeze({
    type: "personal",
    label: "일반 대출",
    description: "담보 없이 급한 자금을 메우는 단기 대출이다.",
    principal: 600000,
    interestRate: 0.1,
    termTurns: 4,
    lender: "배금은행",
    collateralKind: "",
  }),
  "vehicle-secured": Object.freeze({
    type: "vehicle-secured",
    label: "차량 담보 대출",
    description: "보유 차량을 담보로 잡고 은행 잔고를 당겨 쓴다.",
    collateralKind: "vehicle",
    loanToValue: 0.6,
    interestRate: 0.06,
    termTurns: 6,
    lender: "배금은행",
  }),
  "home-secured": Object.freeze({
    type: "home-secured",
    label: "집 담보 대출",
    description: "보유 주거 자산을 담보로 잡는 장기 대출이다.",
    collateralKind: "home",
    loanToValue: 0.55,
    interestRate: 0.04,
    termTurns: 8,
    lender: "배금은행",
  }),
});

function formatBankLoanMoney(amount = 0) {
  if (typeof formatCash === "function") {
    return formatCash(amount);
  }
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));
  return `${safeAmount.toLocaleString("ko-KR")}원`;
}

function attachSubjectParticle(label = "") {
  const text = String(label || "").trim();
  if (!text) {
    return "담보가";
  }

  const lastChar = text.charCodeAt(text.length - 1);
  const isHangulSyllable = lastChar >= 0xac00 && lastChar <= 0xd7a3;
  if (!isHangulSyllable) {
    return `${text}가`;
  }

  const hasBatchim = (lastChar - 0xac00) % 28 !== 0;
  return `${text}${hasBatchim ? "이" : "가"}`;
}

function roundBankLoanAmount(amount = 0) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  return Math.max(0, Math.round(safeAmount / 100) * 100);
}

function cloneBankLoans(targetState = state) {
  const bankState = typeof syncBankDomainState === "function"
    ? syncBankDomainState(targetState)
    : (targetState?.bank || {});
  return Array.isArray(bankState.loans)
    ? bankState.loans.map((loan) => ({ ...(loan || {}) }))
    : [];
}

function setBankLoans(nextLoans = [], targetState = state) {
  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(targetState, {
      loans: nextLoans,
    });
    return;
  }

  if (!targetState.bank || typeof targetState.bank !== "object") {
    targetState.bank = {};
  }
  targetState.bank.loans = nextLoans.map((loan) => ({ ...(loan || {}) }));
}

function setBankLoanResolution(resolution = null, targetState = state) {
  if (typeof patchBankDomainState === "function") {
    patchBankDomainState(targetState, {
      lastLoanResolution: resolution ? { ...resolution, lines: [...(resolution.lines || [])] } : null,
    });
    return;
  }

  if (!targetState.bank || typeof targetState.bank !== "object") {
    targetState.bank = {};
  }
  targetState.bank.lastLoanResolution = resolution ? { ...resolution, lines: [...(resolution.lines || [])] } : null;
}

function updateBankLoanDraft(patch = {}, targetState = state) {
  if (typeof patchBankDomainState === "function") {
    const bankState = typeof syncBankDomainState === "function"
      ? syncBankDomainState(targetState)
      : (targetState?.bank || {});
    patchBankDomainState(targetState, {
      loanDraft: {
        ...(bankState.loanDraft || {}),
        ...(patch || {}),
      },
    });
    return;
  }

  if (!targetState.bank || typeof targetState.bank !== "object") {
    targetState.bank = {};
  }
  targetState.bank.loanDraft = {
    ...(targetState.bank.loanDraft || {}),
    ...(patch || {}),
  };
}

function refreshDebtRiskState(targetState = state) {
  const totalOutstanding = cloneBankLoans(targetState).reduce((sum, loan) => {
    if (loan.status === "paid" || loan.status === "seized") {
      return sum;
    }
    return sum + Math.max(0, Number(loan.remainingPrincipal) || 0);
  }, 0);

  if (!targetState.risk || typeof targetState.risk !== "object") {
    targetState.risk = typeof createDefaultRiskState === "function"
      ? createDefaultRiskState()
      : { crime: 0, heat: 0, debt: 0, gambling: 0 };
  }
  targetState.risk.debt = roundBankLoanAmount(totalOutstanding);
  return targetState.risk.debt;
}

function createBankLoanId(type = "personal") {
  return `loan-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getBankLoanProductConfig(type = "") {
  return BANK_LOAN_PRODUCT_CONFIG[String(type || "").trim()] || null;
}

function findMarketListingForCollateral(kind = "", collateralId = "") {
  if (typeof getMarketListingCatalog !== "function") {
    return null;
  }

  const normalizedKind = String(kind || "").trim();
  const normalizedCollateralId = String(collateralId || "").trim();
  if (!normalizedKind || !normalizedCollateralId) {
    return null;
  }

  return getMarketListingCatalog().find((listing) => (
    normalizedKind === "vehicle"
      ? listing.vehicleId === normalizedCollateralId
      : listing.homeId === normalizedCollateralId
  )) || null;
}

function getBankLoanCollateralDefinition(kind = "", collateralId = "") {
  const normalizedKind = String(kind || "").trim();
  if (normalizedKind === "vehicle" && typeof getOwnedVehicleDefinition === "function") {
    return getOwnedVehicleDefinition(collateralId);
  }
  if (normalizedKind === "home" && typeof getOwnedHomeDefinition === "function") {
    return getOwnedHomeDefinition(collateralId);
  }
  return null;
}

function getBankLoanCollateralLabel(kind = "", collateralId = "") {
  const definition = getBankLoanCollateralDefinition(kind, collateralId);
  return definition?.label || "담보 자산";
}

function getBankLoanCollateralValue(kind = "", collateralId = "", targetState = state) {
  const normalizedKind = String(kind || "").trim().toLowerCase();
  const normalizedCollateralId = String(collateralId || "").trim();
  const ownedAssetRecord = normalizedKind === "vehicle" && typeof getOwnedVehicleAssetRecord === "function"
    ? getOwnedVehicleAssetRecord(targetState)
    : normalizedKind === "home" && typeof getOwnedHomeAssetRecord === "function"
      ? getOwnedHomeAssetRecord(targetState)
      : null;
  if (ownedAssetRecord?.assetId === normalizedCollateralId && Number.isFinite(ownedAssetRecord?.estimatedValue)) {
    return roundBankLoanAmount(ownedAssetRecord.estimatedValue);
  }

  const listing = findMarketListingForCollateral(normalizedKind, normalizedCollateralId);
  if (Number.isFinite(listing?.resalePrice)) {
    return roundBankLoanAmount(listing.resalePrice);
  }
  if (Number.isFinite(listing?.price)) {
    return roundBankLoanAmount((Number(listing.price) || 0) * (normalizedKind === "home" ? 0.6 : 0.65));
  }
  return 0;
}

function hasBlockingBankLoan(type = "", targetState = state) {
  const normalizedType = String(type || "").trim();
  return cloneBankLoans(targetState).some((loan) => (
    loan.type === normalizedType && loan.status !== "paid" && loan.status !== "seized"
  ));
}

function hasCollateralLoan(kind = "", collateralId = "", targetState = state) {
  const normalizedKind = String(kind || "").trim();
  const normalizedCollateralId = String(collateralId || "").trim();
  return cloneBankLoans(targetState).some((loan) => (
    loan.collateralKind === normalizedKind
      && loan.collateralId === normalizedCollateralId
      && loan.status !== "paid"
      && loan.status !== "seized"
  ));
}

function buildBankLoanTerms(config, principal = 0) {
  const safePrincipal = roundBankLoanAmount(principal);
  const termTurns = Math.max(1, Math.round(Number(config?.termTurns) || 1));
  const interestRate = Math.max(0, Number(config?.interestRate) || 0);
  const totalRepay = roundBankLoanAmount(safePrincipal * (1 + (interestRate * termTurns)));
  const installmentAmount = roundBankLoanAmount(Math.ceil(totalRepay / termTurns));

  return {
    principal: safePrincipal,
    totalRepay,
    installmentAmount,
    termTurns,
    interestRate,
  };
}

function buildPersonalLoanProduct(targetState = state) {
  const config = getBankLoanProductConfig("personal");
  const terms = buildBankLoanTerms(config, config.principal);
  const unavailableReason = hasBlockingBankLoan(config.type, targetState)
    ? "이미 진행 중인 일반 대출이 있다"
    : "";

  return {
    type: config.type,
    label: config.label,
    description: config.description,
    available: !unavailableReason,
    unavailableReason,
    principal: terms.principal,
    interestRate: terms.interestRate,
    termTurns: terms.termTurns,
    installmentAmount: terms.installmentAmount,
    collateralKind: "",
    collateralId: "",
    collateralLabel: "",
  };
}

function buildSecuredLoanProduct(type = "", targetState = state) {
  const config = getBankLoanProductConfig(type);
  if (!config) {
    return null;
  }

  const ownershipState = typeof syncOwnershipState === "function"
    ? syncOwnershipState(targetState)
    : (targetState?.ownership || {});
  const collateralId = config.collateralKind === "vehicle"
    ? String(ownershipState?.vehicle || "").trim()
    : String(ownershipState?.home || "").trim();
  const collateralLabel = collateralId
    ? getBankLoanCollateralLabel(config.collateralKind, collateralId)
    : "";
  const collateralValue = collateralId
    ? getBankLoanCollateralValue(config.collateralKind, collateralId, targetState)
    : 0;
  const principal = roundBankLoanAmount(collateralValue * (config.loanToValue || 0));
  const terms = buildBankLoanTerms(config, principal);

  let unavailableReason = "";
  if (!collateralId) {
    unavailableReason = config.collateralKind === "vehicle"
      ? "담보로 잡을 차량이 없다"
      : "담보로 잡을 집이 없다";
  } else if (hasCollateralLoan(config.collateralKind, collateralId, targetState)) {
    unavailableReason = "이미 담보로 잡힌 자산이다";
  } else if (terms.principal <= 0) {
    unavailableReason = "담보 평가액이 부족하다";
  }

  return {
    type: config.type,
    label: config.label,
    description: config.description,
    available: !unavailableReason,
    unavailableReason,
    principal: terms.principal,
    interestRate: terms.interestRate,
    termTurns: terms.termTurns,
    installmentAmount: terms.installmentAmount,
    collateralKind: config.collateralKind,
    collateralId,
    collateralLabel,
    collateralValue,
  };
}

function getAvailableBankLoanProducts(targetState = state) {
  return [
    buildPersonalLoanProduct(targetState),
    buildSecuredLoanProduct("vehicle-secured", targetState),
    buildSecuredLoanProduct("home-secured", targetState),
  ].filter(Boolean);
}

function getBankLoanSummary(targetState = state) {
  const currentTurn = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const activeLoans = cloneBankLoans(targetState).filter((loan) => loan.status !== "paid" && loan.status !== "seized");

  return {
    activeCount: activeLoans.length,
    totalOutstanding: activeLoans.reduce((sum, loan) => sum + Math.max(0, Number(loan.remainingPrincipal) || 0), 0),
    dueThisTurn: activeLoans.reduce((sum, loan) => (
      sum + ((loan.nextDueTurn || 0) <= currentTurn ? Math.max(0, Number(loan.installmentAmount) || 0) : 0)
    ), 0),
    overdueCount: activeLoans.reduce((sum, loan) => sum + Math.max(0, Number(loan.overdueCount) || 0), 0),
  };
}

function findBankLoanById(loanId = "", targetState = state) {
  const normalizedLoanId = String(loanId || "").trim();
  return cloneBankLoans(targetState).find((loan) => loan.id === normalizedLoanId) || null;
}

function applyBankLoanTransaction({
  title = "대출 상환",
  bankPaid = 0,
  totalPaid = 0,
  note = "",
  type = "loan-payment",
}, targetState = state) {
  if (typeof recordBankTransaction !== "function") {
    return;
  }

  recordBankTransaction({
    title,
    amount: -Math.max(0, Math.round(Number(bankPaid) || 0)),
    direction: "out",
    type,
    note,
    displayAmountLabel: totalPaid > 0 ? `-${formatBankLoanMoney(totalPaid)}` : "",
  }, targetState);
}

function spendFundsForBankLoan(amount = 0, targetState = state, {
  transactionTitle = "대출 상환",
  transactionNote = "",
} = {}) {
  const paymentAmount = roundBankLoanAmount(amount);
  const bankBalance = typeof getBankBalance === "function"
    ? getBankBalance(targetState)
    : Math.max(0, Number(targetState?.bank?.balance) || 0);
  const cashBalance = typeof getWalletBalance === "function"
    ? getWalletBalance(targetState)
    : Math.max(0, Number(targetState?.money) || 0);

  if ((bankBalance + cashBalance) < paymentAmount) {
    return { ok: false, bankPaid: 0, cashPaid: 0 };
  }

  const bankPaid = Math.min(paymentAmount, bankBalance);
  const cashPaid = Math.max(0, paymentAmount - bankPaid);

  if (bankPaid > 0) {
    if (typeof spendBankBalance === "function") {
      spendBankBalance(bankPaid, { record: false }, targetState);
    } else if (typeof setBankBalance === "function") {
      setBankBalance(bankBalance - bankPaid, targetState);
    } else if (targetState?.bank) {
      targetState.bank.balance = Math.max(0, bankBalance - bankPaid);
    }
  }

  if (cashPaid > 0) {
    if (typeof spendCash === "function") {
      spendCash(cashPaid, targetState);
    } else if (targetState) {
      targetState.money = Math.max(0, Number(targetState.money) - cashPaid);
    }
  }

  applyBankLoanTransaction({
    title: transactionTitle,
    bankPaid,
    totalPaid: paymentAmount,
    note: cashPaid > 0
      ? `${transactionNote}${transactionNote ? " · " : ""}현금 ${formatBankLoanMoney(cashPaid)} 보충`
      : transactionNote,
  }, targetState);

  return {
    ok: true,
    bankPaid,
    cashPaid,
    totalPaid: paymentAmount,
  };
}

function buildBankLoanCreatedResult(loan, targetState = state) {
  const body = `${formatBankLoanMoney(loan.principal)}이 계좌로 입금됐다. 다음 턴부터 ${formatBankLoanMoney(loan.installmentAmount)}씩 상환한다.`;
  const result = {
    ok: true,
    title: `${loan.label} 실행`,
    body,
    tone: "success",
    kicker: "LOAN",
    lines: [
      `${loan.label}을 실행했다.`,
      `대출금 ${formatBankLoanMoney(loan.principal)}이 계좌에 들어왔다.`,
      `다음 턴 상환 예정액 ${formatBankLoanMoney(loan.installmentAmount)}`,
    ],
  };
  setBankLoanResolution(result, targetState);
  return result;
}

function createBankLoan(type = "", targetState = state) {
  const product = getAvailableBankLoanProducts(targetState).find((entry) => entry.type === String(type || "").trim());
  if (!product) {
    const result = {
      ok: false,
      title: "대출 상품 없음",
      body: "지금 실행할 수 있는 대출 상품을 찾지 못했다.",
      tone: "fail",
      kicker: "BANK",
      lines: ["실행 가능한 대출 상품이 없다."],
    };
    setBankLoanResolution(result, targetState);
    return result;
  }

  if (!product.available) {
    const result = {
      ok: false,
      title: "대출 실행 불가",
      body: product.unavailableReason || "현재 조건으로는 대출을 실행할 수 없다.",
      tone: "fail",
      kicker: "BANK",
      lines: [product.unavailableReason || "현재 조건으로는 대출을 실행할 수 없다."],
    };
    setBankLoanResolution(result, targetState);
    return result;
  }

  const nextLoans = cloneBankLoans(targetState);
  const loan = {
    id: createBankLoanId(product.type),
    type: product.type,
    label: product.label,
    lender: "배금은행",
    collateralKind: product.collateralKind || "",
    collateralId: product.collateralId || "",
    collateralLabel: product.collateralLabel || "",
    principal: product.principal,
    remainingPrincipal: product.principal,
    interestRate: product.interestRate,
    installmentAmount: product.installmentAmount,
    originatedTurn: Math.max(1, Math.round(Number(targetState?.day) || 1)),
    nextDueTurn: Math.max(1, Math.round(Number(targetState?.day) || 1)) + 1,
    termTurns: product.termTurns,
    overdueCount: 0,
    status: "active",
  };

  nextLoans.push(loan);
  setBankLoans(nextLoans, targetState);
  if (typeof earnBankBalance === "function") {
    earnBankBalance(loan.principal, {
      title: `${loan.label} 실행`,
      type: "loan-origination",
      direction: "in",
      note: loan.collateralLabel
        ? `${loan.collateralLabel} 담보`
        : "무담보 실행",
      displayAmountLabel: `+${formatBankLoanMoney(loan.principal)}`,
    }, targetState);
  }
  refreshDebtRiskState(targetState);
  return buildBankLoanCreatedResult(loan, targetState);
}

function finalizeBankLoanPayment(loanId = "", mode = "minimum", targetState = state) {
  const normalizedLoanId = String(loanId || "").trim();
  const normalizedMode = String(mode || "minimum").trim().toLowerCase();
  const loans = cloneBankLoans(targetState);
  const loan = loans.find((entry) => entry.id === normalizedLoanId);

  if (!loan || loan.status === "paid" || loan.status === "seized") {
    const result = {
      ok: false,
      title: "상환 대상 없음",
      body: "이미 정리된 대출이거나 찾을 수 없는 대출이다.",
      tone: "fail",
      kicker: "BANK",
      lines: ["상환할 대출을 찾지 못했다."],
    };
    setBankLoanResolution(result, targetState);
    return result;
  }

  const payAmount = normalizedMode === "full"
    ? Math.max(0, Number(loan.remainingPrincipal) || 0)
    : Math.min(
      Math.max(0, Number(loan.installmentAmount) || 0),
      Math.max(0, Number(loan.remainingPrincipal) || 0)
    );

  const payment = spendFundsForBankLoan(payAmount, targetState, {
    transactionTitle: normalizedMode === "full"
      ? `${loan.label} 전액 상환`
      : `${loan.label} 상환`,
    transactionNote: loan.collateralLabel
      ? `${loan.collateralLabel} 담보 대출`
      : "일반 대출 상환",
  });

  if (!payment.ok) {
    const result = {
      ok: false,
      title: "상환 실패",
      body: "계좌와 현금을 모두 모아도 이번 상환액이 부족했다.",
      tone: "fail",
      kicker: "BANK",
      lines: [
        `${loan.label} 상환에 필요한 ${formatBankLoanMoney(payAmount)}이 부족하다.`,
      ],
    };
    setBankLoanResolution(result, targetState);
    return result;
  }

  loan.remainingPrincipal = Math.max(0, loan.remainingPrincipal - payAmount);
  loan.overdueCount = 0;
  loan.nextDueTurn = Math.max(1, Math.round(Number(targetState?.day) || 1)) + 1;
  loan.status = loan.remainingPrincipal <= 0 ? "paid" : "active";
  setBankLoans(loans, targetState);
  refreshDebtRiskState(targetState);

  const isClosed = loan.status === "paid";
  const result = {
    ok: true,
    title: isClosed ? `${loan.label} 정리 완료` : `${loan.label} 상환 완료`,
    body: isClosed
      ? `${loan.label} 잔액을 모두 정리했다.`
      : `${formatBankLoanMoney(payAmount)}을 상환해 남은 잔액이 ${formatBankLoanMoney(loan.remainingPrincipal)}이 됐다.`,
    tone: "success",
    kicker: "REPAY",
    lines: [
      `${formatBankLoanMoney(payAmount)}을 상환했다.`,
      isClosed
        ? `${loan.label}을 모두 정리했다.`
        : `남은 잔액 ${formatBankLoanMoney(loan.remainingPrincipal)}`,
    ],
    cashDelta: payment.cashPaid > 0 ? -payment.cashPaid : 0,
  };
  setBankLoanResolution(result, targetState);
  return result;
}

function createLoanOverdueResolution(loan, targetState = state) {
  const result = {
    ok: false,
    title: `${loan.label} 연체`,
    body: `이번 턴 상환액 ${formatBankLoanMoney(loan.installmentAmount)}을 마련하지 못했다.`,
    tone: "warning",
    kicker: "OVERDUE",
    lines: [
      `${loan.label} 상환에 실패했다.`,
      `연체 ${loan.overdueCount}회`,
    ],
    overdueCount: loan.overdueCount,
    seizureTriggered: false,
  };
  setBankLoanResolution(result, targetState);
  return result;
}

function seizeBankLoanCollateral(loan, targetState = state) {
  const lines = [];
  let title = `${loan.label} 압류`;
  let body = "연체 누적으로 담보 자산이 회수됐다.";
  const collateralWithParticle = attachSubjectParticle(loan.collateralLabel || "담보 자산");

  if (loan.collateralKind === "vehicle" && typeof setOwnedVehicle === "function") {
    setOwnedVehicle(null, targetState);
    lines.push(`${collateralWithParticle} 압류됐다.`);
    body = `${collateralWithParticle} 압류되어 이동 보정과 차량 기반 공고가 사라졌다.`;
  } else if (loan.collateralKind === "home" && typeof setOwnedHome === "function") {
    setOwnedHome(null, targetState);
    lines.push(`${collateralWithParticle} 압류됐다.`);
    body = `${collateralWithParticle} 압류되어 기본 거처로 밀려났다.`;
  } else {
    lines.push("은행이 담보 회수를 집행했다.");
  }

  loan.status = "seized";
  loan.remainingPrincipal = 0;
  loan.nextDueTurn = 999;
  loan.overdueCount = 0;

  if (typeof recordBankTransaction === "function") {
    recordBankTransaction({
      title,
      amount: 0,
      direction: "out",
      type: "loan-seizure",
      note: loan.collateralLabel || "담보 압류",
      displayAmountLabel: "압류",
    }, targetState);
  }

  const result = {
    ok: false,
    title,
    body,
    tone: "fail",
    kicker: "SEIZURE",
    lines,
    seizureTriggered: true,
  };
  setBankLoanResolution(result, targetState);
  refreshDebtRiskState(targetState);
  return result;
}

function resolveBankLoanOverdueConsequences(loan, targetState = state) {
  if (loan.type === "vehicle-secured" && loan.overdueCount >= 2) {
    return seizeBankLoanCollateral(loan, targetState);
  }
  if (loan.type === "home-secured" && loan.overdueCount >= 3) {
    return seizeBankLoanCollateral(loan, targetState);
  }
  return createLoanOverdueResolution(loan, targetState);
}

function processBankLoansForTurn(targetState = state) {
  const currentTurn = Math.max(1, Math.round(Number(targetState?.day) || 1));
  const loans = cloneBankLoans(targetState);
  const dueLoans = loans.filter((loan) => (
    loan.status !== "paid"
      && loan.status !== "seized"
      && Math.max(1, Number(loan.nextDueTurn) || 1) <= currentTurn
  ));

  if (!dueLoans.length) {
    setBankLoanResolution(null, targetState);
    refreshDebtRiskState(targetState);
    return null;
  }

  const lines = [];
  let latestResolution = null;

  dueLoans.forEach((loan) => {
    const payment = spendFundsForBankLoan(loan.installmentAmount, targetState, {
      transactionTitle: `${loan.label} 자동 상환`,
      transactionNote: "턴 시작 자동 상환",
    });

    if (payment.ok) {
      loan.remainingPrincipal = Math.max(0, loan.remainingPrincipal - payment.totalPaid);
      loan.overdueCount = 0;
      loan.nextDueTurn = currentTurn + 1;
      loan.status = loan.remainingPrincipal <= 0 ? "paid" : "active";
      lines.push(`${loan.label} ${formatBankLoanMoney(payment.totalPaid)} 자동 상환`);
      latestResolution = {
        ok: true,
        title: `${loan.label} 자동 상환`,
        body: loan.status === "paid"
          ? `${loan.label}을 모두 정리했다.`
          : `${formatBankLoanMoney(payment.totalPaid)}이 자동 상환됐다.`,
        tone: "accent",
        kicker: "AUTO PAY",
        lines: [...lines],
        cashDelta: payment.cashPaid > 0 ? -payment.cashPaid : 0,
      };
      return;
    }

    loan.overdueCount = Math.max(0, Number(loan.overdueCount) || 0) + 1;
    if (typeof recordBankTransaction === "function") {
      recordBankTransaction({
        title: `${loan.label} 연체`,
        amount: 0,
        direction: "out",
        type: "loan-overdue",
        note: `이번 턴 상환액 ${formatBankLoanMoney(loan.installmentAmount)}`,
        displayAmountLabel: "연체",
      }, targetState);
    }
    latestResolution = resolveBankLoanOverdueConsequences(loan, targetState);
    lines.push(...(latestResolution?.lines || []));
  });

  setBankLoans(loans, targetState);
  refreshDebtRiskState(targetState);

  const summary = latestResolution
    ? {
        ...latestResolution,
        lines: lines.length ? lines : [...(latestResolution.lines || [])],
      }
    : null;
  setBankLoanResolution(summary, targetState);
  return summary;
}
