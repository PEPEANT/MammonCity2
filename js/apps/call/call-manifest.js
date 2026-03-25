function buildCallIncomingScreenMarkup(targetState = state) {
  const pending = targetState?.callPending || {};
  const label = pending.label || "알 수 없음";
  const kind = pending.kind || "family";
  const contactId = pending.contactId || "";
  const initial = label.charAt(0);
  const avatarColorClass = kind === "romance" ? " is-romance" : " is-family";

  return `
    <div class="call-incoming-shell">
      <div class="call-incoming-top">
        <div class="call-incoming-status">전화 연결 중...</div>
        <div class="call-incoming-avatar${avatarColorClass}">${escapePhoneAppHtml(initial)}</div>
        <div class="call-incoming-name">${escapePhoneAppHtml(label)}</div>
        <div class="call-incoming-tag">${kind === "romance" ? "연락처" : "가족"}</div>
      </div>

      <div class="call-incoming-actions">
        <div class="call-incoming-action-wrap">
          ${buildPhoneAppActionButtonMarkup({
            action: "call-reject-incoming",
            label: "📵",
            className: "call-incoming-btn is-reject",
          })}
          <span class="call-incoming-btn-label">거절</span>
        </div>
        <div class="call-incoming-action-wrap">
          ${buildPhoneAppActionButtonMarkup({
            action: "call-confirm-incoming",
            label: "📞",
            data: { contactId, kind },
            className: "call-incoming-btn is-answer",
          })}
          <span class="call-incoming-btn-label">통화</span>
        </div>
      </div>
    </div>
  `;
}

function buildCallAvatarMarkup(label = "", kind = "") {
  const initial = (label || "?").charAt(0);
  const colorClass = kind === "romance" ? " is-romance" : kind === "family" ? " is-family" : " is-default";
  return `<div class="call-avatar${colorClass}">${escapePhoneAppHtml(initial)}</div>`;
}

function buildCallContactRow(contact = {}, { compact = false } = {}) {
  const baseContactId = contact.contactId ? { contactId: contact.contactId } : {};
  const isRomance = contact.kind === "romance";

  const callBtn = buildPhoneAppActionButtonMarkup({
    action: "call-show-incoming",
    label: "📞",
    data: {
      contactId: contact.contactId || contact.id || "",
      label: contact.label || "",
      kind: contact.kind || "family",
    },
    className: "call-action-btn is-call",
  });

  const secondaryBtns = !compact && isRomance
    ? `
      ${buildPhoneAppActionButtonMarkup({
        action: "schedule-romance-date",
        label: "약속",
        disabled: !contact.canDate,
        data: baseContactId,
        className: "call-action-btn is-secondary" + (!contact.canDate ? " is-disabled" : ""),
      })}
      ${buildPhoneAppActionButtonMarkup({
        action: "invite-romance-home",
        label: "집초대",
        disabled: !contact.canHomeInvite,
        data: baseContactId,
        className: "call-action-btn is-secondary" + (!contact.canHomeInvite ? " is-disabled" : ""),
      })}
    `
    : "";

  return `
    <div class="call-contact-row">
      ${buildCallAvatarMarkup(contact.label, isRomance ? "romance" : "family")}
      <div class="call-contact-info">
        <div class="call-contact-name">${escapePhoneAppHtml(contact.label || "연락처")}</div>
        <div class="call-contact-tag">${escapePhoneAppHtml(contact.stageLabel || "")}</div>
      </div>
      <div class="call-contact-actions">
        ${secondaryBtns}
        ${callBtn}
      </div>
    </div>
  `;
}

function buildCallEmptyRow() {
  return `
    <div class="call-empty-row">
      <div class="call-empty-icon">👤</div>
      <div class="call-empty-text">인연을 만나면 번호가 저장됩니다</div>
    </div>
  `;
}

function getCallAppContacts(targetState = state) {
  const contacts = [
    {
      id: "mom",
      label: "엄마",
      note: "기본 연락처다. 늦게 들어오지 말라는 말도 항상 같이 따라온다.",
      action: "call-home-contact",
      stageLabel: "가족",
      canDate: false,
      canHomeInvite: false,
    },
  ];

  if (typeof getRomancePhoneContacts === "function") {
    getRomancePhoneContacts(targetState).forEach((contact) => {
      const normalizedContactId = contact.contactId || contact.id || "";
      contacts.push({
        id: normalizedContactId,
        contactId: normalizedContactId,
        label: contact.label || "연락처",
        note: contact.note || "",
        action: "call-romance-contact",
        kind: "romance",
        stageLabel: contact.stageLabel || "연락 가능",
        canDate: typeof canScheduleRomanceDate === "function"
          ? canScheduleRomanceDate(normalizedContactId, targetState)
          : false,
        canHomeInvite: typeof canInviteRomanceHome === "function"
          ? canInviteRomanceHome(normalizedContactId, targetState)
          : false,
      });
    });
  }

  return contacts;
}

function getCallAppManifest(targetState = state) {
  return {
    id: "call",
    label: "전화",
    icon: "📞",
    openRoute: "call/home",
    installable: false,
    isAvailable: () => (
      typeof canUsePhoneApps === "function"
        ? canUsePhoneApps(targetState)
        : true
    ),
    buildScreenMarkup: ({ stageMode = false, screenId = "home" } = {}) => {
      if (screenId === "incoming") {
        return buildCallIncomingScreenMarkup(targetState);
      }

      const contacts = getCallAppContacts(targetState);
      const compact = !stageMode;
      const romanceContacts = contacts.filter((c) => c.kind === "romance");
      const familyContacts = contacts.filter((c) => c.kind !== "romance");

      const appStatus = typeof getPhoneAppStatus === "function"
        ? getPhoneAppStatus("call", targetState)
        : null;

      const statusMarkup = appStatus
        ? `<div class="call-status-bar">${escapePhoneAppHtml(appStatus.title || "")}</div>`
        : "";

      return `
        <div class="call-app-shell">
          <div class="call-app-topbar">
            <span class="call-app-topbar-title">전화</span>
          </div>

          ${statusMarkup}

          <div class="call-contact-list">
            <div class="call-section-header">가족</div>
            ${familyContacts.map((c) => buildCallContactRow(c, { compact })).join("")}

            ${romanceContacts.length > 0
              ? `
                <div class="call-section-header">연락처</div>
                ${romanceContacts.map((c) => buildCallContactRow(c, { compact })).join("")}
              `
              : (!compact ? buildCallEmptyRow() : "")}
          </div>
        </div>
      `;
    },
  };
}
