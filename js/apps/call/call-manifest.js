function buildCallContactActions(contact = {}, { compact = false } = {}) {
  const baseContactId = contact.contactId ? { contactId: contact.contactId } : {};
  const actions = [
    buildPhoneAppActionButtonMarkup({
      action: contact.action || "call-home-contact",
      label: "통화",
      data: baseContactId,
      className: "phone-job-apply",
    }),
  ];

  if (!compact && contact.kind === "romance") {
    actions.push(buildPhoneAppActionButtonMarkup({
      action: "schedule-romance-date",
      label: "약속",
      disabled: !contact.canDate,
      data: baseContactId,
      className: "phone-job-apply",
    }));
    actions.push(buildPhoneAppActionButtonMarkup({
      action: "invite-romance-home",
      label: "집초대",
      disabled: !contact.canHomeInvite,
      data: baseContactId,
      className: "phone-job-apply",
    }));
  }

  return actions.join("");
}

function buildCallContactCard(contact = {}, { compact = false } = {}) {
  const note = compact ? "" : (contact.note || "");

  return buildPhoneAppCardMarkup({
    label: contact.kind === "romance" ? (contact.rosterLabel || "연락처") : "",
    title: contact.label || "연락처",
    body: note,
    tone: contact.kind === "romance" ? "accent" : "",
    footerHtml: compact
      ? ""
      : `<span>${escapePhoneAppHtml(contact.stageLabel || "")}</span>`,
    actionsHtml: buildCallContactActions(contact, { compact }),
  });
}

function buildCallEmptyCard() {
  return buildPhoneAppCardMarkup({
    title: "저장된 연락처 없음",
    body: "길거리나 편의점에서 인연을 만들면 새 번호가 전화 앱에 추가됩니다.",
    tone: "muted",
  });
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
    buildScreenMarkup: ({ stageMode = false } = {}) => {
      const contacts = getCallAppContacts(targetState);
      const compact = !stageMode;
      const listMarkup = contacts.length
        ? contacts.map((contact) => buildCallContactCard(contact, { compact })).join("")
        : "";
      const romanceEmptyMarkup = contacts.length <= 1
        ? buildCallEmptyCard()
        : "";

      return `
        ${buildPhoneAppScreenHeaderMarkup({
          title: "전화",
          note: compact ? "저장된 번호만 간단히 보여줍니다." : "통화, 약속, 집 초대까지 여기서 관리합니다.",
          showHomeButton: !stageMode,
        })}
        ${buildPhoneAppStatusMarkup("call", buildPhoneAppCardMarkup({
          title: compact ? "최근 연락" : "최근 통화",
          body: compact ? "엄마" : "최근 통화와 약속 상태가 여기에 표시됩니다.",
        }))}
        ${listMarkup}
        ${romanceEmptyMarkup}
      `;
    },
  };
}
