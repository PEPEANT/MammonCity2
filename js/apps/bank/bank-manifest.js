function getBankTransactionIcon(amount = 0, type = "general") {
  if (type === "deposit") {
    return "↓";
  }
  if (type === "withdraw") {
    return "↑";
  }
  if (type === "transfer") {
    return "↗";
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
        const isInflow = transaction.amount >= 0;
        const icon = getBankTransactionIcon(transaction.amount, transaction.type);
        const amountText = `${isInflow ? "+" : "-"}${formatCash(Math.abs(transaction.amount))}`;

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

      return buildBankHomeScreenMarkup(viewModel, { stageMode });
    },
  };
}
