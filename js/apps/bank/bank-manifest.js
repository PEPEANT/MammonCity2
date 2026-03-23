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

function buildBankTransactionsMarkup(viewModel) {
  if (!viewModel.transactions.length) {
    return '<div class="bank-empty-state">아직 계좌 거래 내역이 없습니다.</div>';
  }

  return `
    <div class="bank-tx-list">
      ${viewModel.transactions.slice(0, 6).map((transaction) => {
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
        <div class="bank-stat-label">진행 중 대출</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(String(summary.activeCount || 0))}</div>
      </div>
      <div class="bank-loan-summary-card">
        <div class="bank-stat-label">남은 원금</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(formatCash(summary.totalOutstanding || 0))}</div>
      </div>
      <div class="bank-loan-summary-card">
        <div class="bank-stat-label">이번 턴 예정</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(formatCash(summary.dueThisTurn || 0))}</div>
      </div>
      <div class="bank-loan-summary-card">
        <div class="bank-stat-label">연체 횟수</div>
        <div class="bank-stat-value${summary.overdueCount ? " is-out" : ""}">${escapePhoneAppHtml(String(summary.overdueCount || 0))}</div>
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
        <div class="bank-loan-badge">${escapePhoneAppHtml(disabled ? "잠김" : "실행 가능")}</div>
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
        <span>남은 잔액 ${escapePhoneAppHtml(formatCash(loan.remainingPrincipal || 0))}</span>
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
    <section class="phone-app-card bank-loan-resolution is-${escapePhoneAppHtml(viewModel.lastLoanResolution.tone || "accent")}">
      <div class="phone-app-card-title">${escapePhoneAppHtml(viewModel.lastLoanResolution.title || "대출 상태")}</div>
      <div class="bank-loan-desc">${escapePhoneAppHtml(viewModel.lastLoanResolution.body || "")}</div>
    </section>
  `;
}

function buildBankQuickAmountButtons(action, amounts = [], allowAll = false, allLabel = "", disabled = false) {
  const amountButtons = amounts.map((amount) => buildPhoneAppActionButtonMarkup({
    action,
    label: formatCash(amount),
    data: { amount },
    disabled,
    className: "bank-chip-btn",
  })).join("");

  const allButton = allowAll
    ? buildPhoneAppActionButtonMarkup({
        action,
        label: allLabel,
        data: { amount: "all" },
        disabled,
        className: "bank-chip-btn",
      })
    : "";

  return `<div class="bank-chip-row">${amountButtons}${allButton}</div>`;
}

function buildBankQuickContactButtons(contacts = []) {
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

function buildBankHomeScreenMarkup(viewModel, { stageMode = false } = {}) {
  const depositDisabled = viewModel.cashOnHand <= 0;
  const withdrawDisabled = viewModel.balance <= 0;
  const statusMarkup = buildPhoneAppStatusMarkup("bank");

  return `
    ${buildPhoneAppScreenHeaderMarkup({
      title: "은행",
      showHomeButton: !stageMode,
    })}
    ${statusMarkup}
    <section class="bank-hero">
      <div class="bank-hero-top">
        <div>
          <div class="bank-hero-label">잔액</div>
          <div class="bank-hero-balance">${escapePhoneAppHtml(formatCash(viewModel.balance))}</div>
        </div>
        <div class="bank-hero-emblem">🏦</div>
      </div>
      <div class="bank-hero-sub">
        현금 ${escapePhoneAppHtml(formatCash(viewModel.cashOnHand))}
      </div>
      <div class="bank-hero-actions">
        ${buildPhoneRouteButtonMarkup({
          route: "bank/transfer",
          label: "송금하기",
          className: "bank-hero-btn is-primary",
        })}
        ${buildPhoneRouteButtonMarkup({
          route: "bank/loans",
          label: "대출 / 상환",
          className: "bank-hero-btn",
        })}
        ${buildPhoneAppActionButtonMarkup({
          action: "bank-deposit-cash",
          label: "전액 입금",
          disabled: depositDisabled,
          data: { amount: "all" },
          className: "bank-hero-btn",
        })}
      </div>
    </section>
    <div class="bank-stat-grid">
      <section class="bank-stat-card">
        <div class="bank-stat-label">현금 보유</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(formatCash(viewModel.cashOnHand))}</div>
      </section>
      <section class="bank-stat-card">
        <div class="bank-stat-label">거래 횟수</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(String(viewModel.transactionCount))}</div>
      </section>
      <section class="bank-stat-card">
        <div class="bank-stat-label">자산 가치</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(formatCash(viewModel.totalAssetValue || 0))}</div>
      </section>
      <section class="bank-stat-card">
        <div class="bank-stat-label">순자산</div>
        <div class="bank-stat-value">${escapePhoneAppHtml(formatCash(viewModel.netWorth || 0))}</div>
      </section>
      <section class="bank-stat-card">
        <div class="bank-stat-label">누적 입금</div>
        <div class="bank-stat-value is-in">+${escapePhoneAppHtml(formatCash(viewModel.totalInflow))}</div>
      </section>
      <section class="bank-stat-card">
        <div class="bank-stat-label">누적 출금</div>
        <div class="bank-stat-value is-out">-${escapePhoneAppHtml(formatCash(viewModel.totalOutflow))}</div>
      </section>
    </div>
    <section class="phone-app-card">
      <div class="phone-app-card-title">입출금</div>
      ${buildBankQuickAmountButtons("bank-deposit-cash", viewModel.depositAmounts, true, "전액 입금", depositDisabled)}
      ${buildBankQuickAmountButtons("bank-withdraw-cash", viewModel.withdrawAmounts, true, "전액 출금", withdrawDisabled)}
    </section>
    <section class="phone-app-card">
      <div class="phone-app-card-title">대출 현황</div>
      ${buildBankLoanSummaryMarkup(viewModel)}
      <div class="bank-loan-actions">
        ${buildPhoneRouteButtonMarkup({
          route: "bank/loans",
          label: "대출 화면 열기",
          className: "bank-secondary-btn",
        })}
      </div>
    </section>
    ${buildBankLoanResolutionMarkup(viewModel)}
    <section class="phone-app-card">
      <div class="phone-app-card-title">거래</div>
      ${buildBankTransactionsMarkup(viewModel)}
    </section>
  `;
}

function buildBankTransferScreenMarkup(viewModel, { stageMode = false } = {}) {
  const sendDisabled = viewModel.balance <= 0;
  const recipientValue = escapePhoneAppHtml(viewModel.transferDraft.recipient || "");
  const amountValue = escapePhoneAppHtml(viewModel.transferDraft.amount || "");

  return `
    <div class="bank-transfer-screen" data-bank-transfer-root>
      ${buildPhoneAppScreenHeaderMarkup({
        title: "송금",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      <section class="phone-app-card bank-transfer-form" data-bank-transfer-form>
        <div class="bank-field">
          <label class="bank-field-label">받는 분</label>
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
        ${buildBankQuickAmountButtons("bank-fill-amount", viewModel.transferAmounts, false, "", false)}
        <div class="bank-form-hint">
          가능 ${escapePhoneAppHtml(formatCash(viewModel.balance))}
        </div>
        <div class="bank-form-actions">
          ${buildPhoneAppActionButtonMarkup({
            action: "bank-transfer-money",
            label: "송금 완료",
            disabled: sendDisabled,
            className: "bank-submit-btn",
          })}
          ${buildPhoneRouteButtonMarkup({
            route: "bank/home",
            label: "대시보드",
            className: "bank-secondary-btn",
          })}
        </div>
      </section>
      <section class="phone-app-card">
        <div class="phone-app-card-title">최근 대상</div>
        ${buildBankQuickContactButtons(viewModel.quickContacts)}
      </section>
    </div>
  `;
}

function buildBankLoansScreenMarkup(viewModel, { stageMode = false } = {}) {
  const activeLoans = viewModel.loans.filter((loan) => loan.status !== "paid" && loan.status !== "seized");
  return `
    <div class="bank-transfer-screen">
      ${buildPhoneAppScreenHeaderMarkup({
        title: "대출 / 상환",
        showHomeButton: !stageMode,
      })}
      ${buildPhoneAppStatusMarkup("bank")}
      <section class="phone-app-card">
        <div class="phone-app-card-title">대출 요약</div>
        ${buildBankLoanSummaryMarkup(viewModel)}
      </section>
      ${buildBankLoanResolutionMarkup(viewModel)}
      <section class="phone-app-card">
        <div class="phone-app-card-title">대출 상품</div>
        <div class="bank-loan-list">
          ${viewModel.loanProducts.map((product) => buildBankLoanProductCardMarkup(product)).join("")}
        </div>
      </section>
      <section class="phone-app-card">
        <div class="phone-app-card-title">진행 중 대출</div>
        <div class="bank-loan-list">
          ${activeLoans.length
            ? activeLoans.map((loan) => buildBankActiveLoanCardMarkup(loan)).join("")
            : '<div class="bank-empty-state">진행 중인 대출이 없습니다.</div>'}
        </div>
      </section>
      <section class="phone-app-card">
        <div class="phone-app-card-title">빠른 이동</div>
        <div class="bank-loan-actions">
          ${buildPhoneRouteButtonMarkup({
            route: "bank/home",
            label: "대시보드",
            className: "bank-secondary-btn",
          })}
          ${buildPhoneRouteButtonMarkup({
            route: "bank/transfer",
            label: "송금",
            className: "bank-secondary-btn",
          })}
        </div>
      </section>
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
    installable: true,
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

      if (screenId === "transfer") {
        return buildBankTransferScreenMarkup(viewModel, { stageMode });
      }

      if (screenId === "loans") {
        return buildBankLoansScreenMarkup(viewModel, { stageMode });
      }

      return buildBankHomeScreenMarkup(viewModel, { stageMode });
    },
  };
}
