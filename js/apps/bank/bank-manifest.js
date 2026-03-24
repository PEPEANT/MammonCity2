function getBankTransactionIcon(amount = 0, type = "general") {
  if (type === "loan-origination") {
    return "₩";
  }
  if (type === "loan-payment") {
    return "⇣";
  }
  if (type === "loan-overdue") {
    return "!";
  }
  if (type === "loan-seizure") {
    return "⚠";
  }
  if (type === "deposit") {
    return "↓";
  }
  if (type === "withdraw") {
    return "↑";
  }
  if (type === "transfer") {
    return "↗";
  }
  if (type === "asset-purchase") {
    return "▣";
  }
  if (type === "asset-sale") {
    return "◫";
  }
  return amount >= 0 ? "↓" : "↑";
}

function buildBankTransactionsMarkup(viewModel, { limit = 4 } = {}) {
  const items = viewModel.transactions.slice(0, limit);

  if (!items.length) {
    return '<div class="bank-empty-state">아직 계좌 거래 내역이 없습니다.</div>';
  }

  return `
    <div class="bank-tx-list">
      ${items.map((transaction) => {
        const isInflow = transaction.direction === "in"
          || (transaction.direction !== "out" && transaction.amount >= 0);
        const icon = getBankTransactionIcon(transaction.amount, transaction.type);
        const amountText = transaction.displayAmountLabel
          || `${isInflow ? "+" : "-"}${formatCash(Math.abs(transaction.amount))}`;

        return `
          <article class="bank-tx-item">
            <div class="bank-tx-main">
              <div class="bank-tx-icon${isInflow ? " is-in" : " is-out"}">${escapePhoneAppHtml(icon)}</div>
              <div class="bank-tx-copy">
                <div class="bank-tx-title">${escapePhoneAppHtml(transaction.title)}</div>
                <div class="bank-tx-date">${escapePhoneAppHtml(transaction.dateLabel)}</div>
              </div>
            </div>
            <div class="bank-tx-amount${isInflow ? " is-in" : " is-out"}">${escapePhoneAppHtml(amountText)}</div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function buildBankLoanSummaryMarkup(viewModel) {
  const summary = viewModel.loanSummary || {
    activeCount: 0,
    totalOutstanding: 0,
    dueThisTurn: 0,
    overdueCount: 0,
  };

  return `
    <div class="bank-loan-summary-grid">
      <div class="bank-loan-summary-card">
        <div class="bank-summary-label">진행 중 대출</div>
        <div class="bank-summary-value">${escapePhoneAppHtml(String(summary.activeCount || 0))}</div>
      </div>
      <div class="bank-loan-summary-card">
        <div class="bank-summary-label">남은 원금</div>
        <div class="bank-summary-value">${escapePhoneAppHtml(formatCash(summary.totalOutstanding || 0))}</div>
      </div>
      <div class="bank-loan-summary-card">
        <div class="bank-summary-label">이번 턴 상환</div>
        <div class="bank-summary-value">${escapePhoneAppHtml(formatCash(summary.dueThisTurn || 0))}</div>
      </div>
      <div class="bank-loan-summary-card">
        <div class="bank-summary-label">연체 횟수</div>
        <div class="bank-summary-value${summary.overdueCount ? " is-out" : ""}">${escapePhoneAppHtml(String(summary.overdueCount || 0))}</div>
      </div>
    </div>
  `;
}

function buildBankLoanProductCardMarkup(product) {
  const disabled = !product.available;
  const rateText = `${Math.round((Number(product.interestRate) || 0) * 100)}%`;

  return `
    <article class="bank-loan-card${disabled ? " is-disabled" : ""}">
      <div class="bank-loan-top">
        <div>
          <div class="bank-loan-title">${escapePhoneAppHtml(product.label)}</div>
          <div class="bank-loan-desc">${escapePhoneAppHtml(product.description)}</div>
        </div>
        <div class="bank-loan-badge">${escapePhoneAppHtml(disabled ? "잠김" : "가능")}</div>
      </div>
      <div class="bank-loan-meta">
        <span>한도 ${escapePhoneAppHtml(formatCash(product.principal || 0))}</span>
        <span>금리 ${escapePhoneAppHtml(rateText)}</span>
        <span>${escapePhoneAppHtml(String(product.termTurns || 0))}턴</span>
      </div>
      <div class="bank-loan-meta">
        <span>예상 상환 ${escapePhoneAppHtml(formatCash(product.installmentAmount || 0))}</span>
        <span>${escapePhoneAppHtml(product.collateralLabel || "무담보")}</span>
      </div>
      <div class="bank-loan-desc${disabled ? " is-out" : ""}">
        ${escapePhoneAppHtml(product.unavailableReason || "이번 턴에 바로 실행할 수 있다.")}
      </div>
      <div class="bank-loan-actions">
        ${buildPhoneAppActionButtonMarkup({
          action: "bank-take-loan",
          label: "대출 실행",
          disabled,
          data: { loanType: product.type },
          className: "bank-submit-btn",
        })}
      </div>
    </article>
  `;
}

function buildBankActiveLoanCardMarkup(loan) {
  const closed = loan.status === "paid" || loan.status === "seized";
  const rateText = `${Math.round((Number(loan.interestRate) || 0) * 100)}%`;
  const badgeText = loan.status === "paid"
    ? "상환 완료"
    : (loan.status === "seized" ? "압류 종료" : (loan.overdueCount > 0 ? `연체 ${loan.overdueCount}` : "진행 중"));

  return `
    <article class="bank-loan-card${closed ? " is-disabled" : ""}">
      <div class="bank-loan-top">
        <div>
          <div class="bank-loan-title">${escapePhoneAppHtml(loan.label)}</div>
          <div class="bank-loan-desc">${escapePhoneAppHtml(loan.collateralLabel || "무담보")}</div>
        </div>
        <div class="bank-loan-badge">${escapePhoneAppHtml(badgeText)}</div>
      </div>
      <div class="bank-loan-meta">
        <span>남은 원금 ${escapePhoneAppHtml(formatCash(loan.remainingPrincipal || 0))}</span>
        <span>금리 ${escapePhoneAppHtml(rateText)}</span>
      </div>
      <div class="bank-loan-meta">
        <span>다음 상환 ${escapePhoneAppHtml(formatCash(loan.installmentAmount || 0))}</span>
        <span>${escapePhoneAppHtml(String(loan.nextDueTurn || 0))}턴 납부</span>
      </div>
      <div class="bank-loan-actions">
        ${buildPhoneAppActionButtonMarkup({
          action: "bank-repay-loan-minimum",
          label: "최소 상환",
          disabled: closed,
          data: { loanId: loan.id },
          className: "bank-secondary-btn",
        })}
        ${buildPhoneAppActionButtonMarkup({
          action: "bank-repay-loan-full",
          label: "전액 상환",
          disabled: closed,
          data: { loanId: loan.id },
          className: "bank-submit-btn",
        })}
      </div>
    </article>
  `;
}

function buildBankLoanResolutionMarkup(viewModel) {
  if (!viewModel.lastLoanResolution) {
    return "";
  }

  return `
    <section class="phone-app-card bank-surface-card bank-loan-resolution is-${escapePhoneAppHtml(viewModel.lastLoanResolution.tone || "accent")}">
      <div class="phone-app-card-title">${escapePhoneAppHtml(viewModel.lastLoanResolution.title || "대출 상태")}</div>
      <div class="bank-loan-desc">${escapePhoneAppHtml(viewModel.lastLoanResolution.body || "")}</div>
    </section>
  `;
}

function buildBankQuickAmountButtons(action, amounts = [], {
  allowAll = false,
  allLabel = "",
  disabled = false,
  className = "bank-chip-btn",
} = {}) {
  const amountButtons = amounts.map((amount) => buildPhoneAppActionButtonMarkup({
    action,
    label: formatCash(amount),
    data: { amount },
    disabled,
    className,
  })).join("");

  const allButton = allowAll
    ? buildPhoneAppActionButtonMarkup({
        action,
        label: allLabel,
        data: { amount: "all" },
        disabled,
        className,
      })
    : "";

  return `${amountButtons}${allButton}`;
}

function buildBankQuickContactButtons(contacts = []) {
  if (!contacts.length) {
    return "";
  }

  return `
    <div class="bank-contact-row">
      ${contacts.map((contact) => buildPhoneAppActionButtonMarkup({
        action: "bank-fill-recipient",
        label: contact,
        data: { recipient: contact },
        className: "bank-contact-btn",
      })).join("")}
    </div>
  `;
}

function buildBankHeaderMarkup({
  kicker = "BANK",
  title = "",
  note = "",
}) {
  return buildPhoneAppScreenHeaderMarkup({
    kicker,
    title,
    note,
    showHomeButton: false,
  });
}

function buildBankBalanceCardMarkup(viewModel, { compact = false } = {}) {
  const metaItems = [
    `보유 현금 ${formatCash(viewModel.cashOnHand)}`,
    compact ? "" : `거래 ${viewModel.transactionCount}건`,
  ].filter(Boolean);

  return `
    <section class="bank-balance-card${compact ? " is-compact" : ""}">
      <div class="bank-balance-top">
        <div>
          <div class="bank-balance-label">배금은행 입출금</div>
          ${compact ? "" : `<div class="bank-balance-account">배금은행 주거래 계좌</div>`}
        </div>
        <div class="bank-balance-badge">BANK</div>
      </div>
      <div class="bank-balance-amount">${escapePhoneAppHtml(formatCash(viewModel.balance))}</div>
      <div class="bank-balance-meta">
        ${metaItems.map((item) => `<span>${escapePhoneAppHtml(item)}</span>`).join("")}
      </div>
    </section>
  `;
}

function buildBankPanelHomeScreenMarkup(viewModel) {
  return `
    <div class="bank-layout is-panel bank-screen-home">
      ${buildBankHeaderMarkup({
        kicker: "",
        title: "배금은행",
        note: "",
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      ${buildBankBalanceCardMarkup(viewModel, { compact: true })}
      <div class="bank-panel-actions">
        ${buildPhoneRouteButtonMarkup({
          route: "bank/deposit",
          label: "입금",
          className: "bank-action-btn is-dark",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: "bank/withdraw",
          label: "출금",
          disabled: viewModel.balance <= 0,
          className: "bank-action-btn is-light",
        })}
      </div>
    </div>
  `;
}

function buildBankHomeScreenMarkup(viewModel, { stageMode = false } = {}) {
  if (!stageMode) {
    return buildBankPanelHomeScreenMarkup(viewModel);
  }

  return `
    <div class="bank-layout is-stage bank-screen-home">
      ${buildBankHeaderMarkup({
        kicker: "BANK",
        title: "배금은행",
        note: "잔액과 주요 거래를 한 화면에서 정리",
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      ${buildBankBalanceCardMarkup(viewModel)}
      <div class="bank-primary-actions">
        ${buildPhoneRouteButtonMarkup({
          route: "bank/deposit",
          label: "입금",
          className: "bank-action-btn is-dark",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: "bank/withdraw",
          label: "출금",
          disabled: viewModel.balance <= 0,
          className: "bank-action-btn is-light",
        })}
      </div>
      <div class="bank-secondary-actions">
        ${buildPhoneRouteButtonMarkup({
          route: "bank/transfer",
          label: "송금",
          className: "bank-nav-btn",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: "bank/history",
          label: "거래내역",
          className: "bank-nav-btn",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: "bank/loans",
          label: "대출/상환",
          className: "bank-nav-btn",
        })}
      </div>
    </div>
  `;
}

function buildBankCashFlowScreenMarkup(viewModel, mode, { stageMode = false } = {}) {
  const isDeposit = mode === "deposit";
  const availableAmount = isDeposit ? viewModel.cashOnHand : viewModel.balance;
  const disabled = availableAmount <= 0;
  const quickAmounts = isDeposit ? viewModel.depositAmounts : viewModel.withdrawAmounts;
  const action = isDeposit ? "bank-deposit-cash" : "bank-withdraw-cash";

  return `
    <div class="bank-layout ${stageMode ? "is-stage" : "is-panel"} bank-screen-flow">
      ${buildBankHeaderMarkup({
        kicker: isDeposit ? "DEPOSIT" : "WITHDRAW",
        title: isDeposit ? "입금" : "출금",
        note: isDeposit ? "현금을 계좌로 넣습니다." : "계좌 잔액을 현금으로 찾습니다.",
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      <section class="phone-app-card bank-surface-card bank-flow-card">
        <div class="bank-flow-top">
          <div>
            <div class="bank-section-eyebrow">${escapePhoneAppHtml(isDeposit ? "입금 가능 현금" : "출금 가능 잔액")}</div>
            <div class="bank-flow-amount">${escapePhoneAppHtml(formatCash(availableAmount))}</div>
          </div>
          <div class="bank-flow-badge">${escapePhoneAppHtml(isDeposit ? "현금 > 계좌" : "계좌 > 현금")}</div>
        </div>
        <div class="bank-flow-copy">
          ${escapePhoneAppHtml(isDeposit ? "지금 손에 든 돈만 계좌로 옮길 수 있습니다." : "계좌에 있는 돈만 현금으로 뺄 수 있습니다.")}
        </div>
        <div class="bank-amount-grid">
          ${buildBankQuickAmountButtons(action, quickAmounts, {
            disabled,
            className: "bank-amount-btn",
          })}
          ${buildBankQuickAmountButtons(action, [], {
            allowAll: true,
            allLabel: isDeposit ? "전액 입금" : "전액 출금",
            disabled,
            className: "bank-amount-btn is-dark",
          })}
        </div>
        <div class="bank-footer-actions">
          ${buildPhoneRouteButtonMarkup({
            route: "bank/home",
            label: "대시보드",
            className: "bank-inline-btn",
          })}
        </div>
      </section>
    </div>
  `;
}

function buildBankTransferScreenMarkup(viewModel, { stageMode = false } = {}) {
  const sendDisabled = viewModel.balance <= 0;
  const recipientValue = escapePhoneAppHtml(viewModel.transferDraft.recipient || "");
  const amountValue = escapePhoneAppHtml(viewModel.transferDraft.amount || "");

  return `
    <div class="bank-layout ${stageMode ? "is-stage" : "is-panel"} bank-screen-transfer" data-bank-transfer-root>
      ${buildBankHeaderMarkup({
        kicker: "TRANSFER",
        title: "송금",
        note: "이체할 대상과 금액만 간단하게 입력",
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      <section class="phone-app-card bank-surface-card bank-transfer-form" data-bank-transfer-form>
        <div class="bank-transfer-balance">
          <span>출금 가능</span>
          <strong>${escapePhoneAppHtml(formatCash(viewModel.balance))}</strong>
        </div>
        <div class="bank-field">
          <label class="bank-field-label">받는 사람</label>
          <input
            class="bank-input"
            type="text"
            placeholder="이름 또는 계좌명"
            value="${recipientValue}"
            data-bank-transfer-input="recipient"
          >
        </div>
        ${buildBankQuickContactButtons(viewModel.quickContacts)}
        <div class="bank-field">
          <label class="bank-field-label">송금 금액</label>
          <input
            class="bank-input is-money"
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value="${amountValue}"
            data-bank-transfer-input="amount"
          >
        </div>
        <div class="bank-chip-row">
          ${buildBankQuickAmountButtons("bank-fill-amount", viewModel.transferAmounts)}
        </div>
        <div class="bank-form-footer">
          <div class="bank-form-hint">가능 금액 ${escapePhoneAppHtml(formatCash(viewModel.balance))}</div>
          <div class="bank-footer-actions">
            ${buildPhoneAppActionButtonMarkup({
              action: "bank-transfer-money",
              label: "송금 완료",
              disabled: sendDisabled,
              className: "bank-action-btn is-dark",
            })}
            ${buildPhoneRouteButtonMarkup({
              route: "bank/home",
              label: "대시보드",
              className: "bank-inline-btn",
            })}
          </div>
        </div>
      </section>
    </div>
  `;
}

function buildBankHistoryScreenMarkup(viewModel, { stageMode = false } = {}) {
  return `
    <div class="bank-layout ${stageMode ? "is-stage" : "is-panel"} bank-screen-history">
      ${buildBankHeaderMarkup({
        kicker: "HISTORY",
        title: "거래내역",
        note: "계좌에서 오간 흐름을 한 번에 확인",
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      <section class="phone-app-card bank-surface-card">
        <div class="bank-section-head">
          <div>
            <div class="bank-section-eyebrow">전체 거래</div>
            <div class="bank-section-title">${escapePhoneAppHtml(`${viewModel.transactionCount}건`)}</div>
          </div>
          ${buildPhoneRouteButtonMarkup({
            route: "bank/home",
            label: "대시보드",
            className: "bank-inline-btn",
          })}
        </div>
        ${buildBankTransactionsMarkup(viewModel, {
          limit: Math.max(1, viewModel.transactions.length),
        })}
      </section>
    </div>
  `;
}

function buildBankLoansScreenMarkup(viewModel, { stageMode = false } = {}) {
  const activeLoans = viewModel.loans.filter((loan) => loan.status !== "paid" && loan.status !== "seized");

  return `
    <div class="bank-layout ${stageMode ? "is-stage" : "is-panel"} bank-screen-loans">
      ${buildBankHeaderMarkup({
        kicker: "LOANS",
        title: "대출 / 상환",
        note: "필요한 자금과 상환 일정을 정리",
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      <section class="phone-app-card bank-surface-card">
        <div class="bank-section-head">
          <div>
            <div class="bank-section-eyebrow">대출 요약</div>
            <div class="bank-section-title">현재 상태</div>
          </div>
        </div>
        ${buildBankLoanSummaryMarkup(viewModel)}
      </section>
      ${buildBankLoanResolutionMarkup(viewModel)}
      <section class="phone-app-card bank-surface-card">
        <div class="bank-section-head">
          <div>
            <div class="bank-section-eyebrow">상품</div>
            <div class="bank-section-title">실행 가능한 대출</div>
          </div>
        </div>
        <div class="bank-loan-list">
          ${viewModel.loanProducts.map((product) => buildBankLoanProductCardMarkup(product)).join("")}
        </div>
      </section>
      <section class="phone-app-card bank-surface-card">
        <div class="bank-section-head">
          <div>
            <div class="bank-section-eyebrow">상환</div>
            <div class="bank-section-title">진행 중 대출</div>
          </div>
        </div>
        <div class="bank-loan-list">
          ${activeLoans.length
            ? activeLoans.map((loan) => buildBankActiveLoanCardMarkup(loan)).join("")
            : '<div class="bank-empty-state">진행 중인 대출이 없습니다.</div>'}
        </div>
      </section>
      <div class="bank-secondary-actions">
        ${buildPhoneRouteButtonMarkup({
          route: "bank/home",
          label: "대시보드",
          className: "bank-nav-btn",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: "bank/transfer",
          label: "송금",
          className: "bank-nav-btn",
        })}
      </div>
    </div>
  `;
}

function getBankAppManifest(targetState = state) {
  const viewModel = typeof createBankAppViewModel === "function"
    ? createBankAppViewModel(targetState)
    : null;

  return {
    id: "bank",
    label: "은행",
    icon: "🏦",
    openRoute: "bank/home",
    installable: false,
    storeCategory: "금융",
    storeDescription: "은행 앱",
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => {
      if (!viewModel) {
        return '<div class="phone-job-empty">은행 앱을 불러오지 못했습니다.</div>';
      }

      if (screenId === "deposit") {
        return buildBankCashFlowScreenMarkup(viewModel, "deposit", { stageMode });
      }

      if (screenId === "withdraw") {
        return buildBankCashFlowScreenMarkup(viewModel, "withdraw", { stageMode });
      }

      if (screenId === "transfer") {
        return buildBankTransferScreenMarkup(viewModel, { stageMode });
      }

      if (screenId === "history") {
        return buildBankHistoryScreenMarkup(viewModel, { stageMode });
      }

      if (screenId === "loans") {
        return buildBankLoansScreenMarkup(viewModel, { stageMode });
      }

      return buildBankHomeScreenMarkup(viewModel, { stageMode });
    },
  };
}
