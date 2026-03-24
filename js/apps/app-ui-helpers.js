function escapePhoneAppHtml(text) {
  if (typeof escapeHtml === "function") {
    return escapeHtml(String(text ?? ""));
  }

  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildPhoneAppScreenHeaderMarkup({
  kicker = "",
  title = "",
  note = "",
  showHomeButton = true,
  homeButtonLabel = "홈",
  actionsHtml = "",
} = {}) {
  const shouldShowActions = Boolean(actionsHtml || showHomeButton);
  const actionMarkup = shouldShowActions
    ? `
      <div class="phone-app-screen-actions">
        ${actionsHtml || ""}
        ${showHomeButton ? `<button class="phone-app-mini-btn" type="button" data-phone-action="close-phone-view">${escapePhoneAppHtml(homeButtonLabel)}</button>` : ""}
      </div>
    `
    : "";

  return `
    <div class="phone-app-screen-top">
      <div class="phone-app-screen-copy">
        ${kicker ? `<span class="phone-app-screen-kicker">${escapePhoneAppHtml(kicker)}</span>` : ""}
        <div class="phone-app-screen-title">${escapePhoneAppHtml(title)}</div>
        ${note ? `<div class="phone-app-screen-note">${escapePhoneAppHtml(note)}</div>` : ""}
      </div>
      ${actionMarkup}
    </div>
  `;
}

function buildPhoneAppActionButtonMarkup({
  action,
  label,
  disabled = false,
  data = {},
  className = "phone-job-apply",
} = {}) {
  const attrs = Object.entries(data)
    .map(([key, value]) => {
      const attrName = String(key || "")
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase();
      return `data-${attrName}="${escapePhoneAppHtml(value)}"`;
    })
    .join(" ");

  return `
    <button
      class="${escapePhoneAppHtml(className)}"
      type="button"
      data-phone-action="${escapePhoneAppHtml(action)}"
      ${attrs}
      ${disabled ? "disabled" : ""}
    >
      ${escapePhoneAppHtml(label)}
    </button>
  `;
}

function buildPhoneRouteButtonMarkup({
  route,
  label,
  disabled = false,
  data = {},
  className = "phone-job-apply",
} = {}) {
  const attrs = Object.entries(data)
    .map(([key, value]) => `data-${key}="${escapePhoneAppHtml(value)}"`)
    .join(" ");

  return `
    <button
      class="${escapePhoneAppHtml(className)}"
      type="button"
      data-phone-route="${escapePhoneAppHtml(route)}"
      ${attrs}
      ${disabled ? "disabled" : ""}
    >
      ${escapePhoneAppHtml(label)}
    </button>
  `;
}

function buildPhoneAppCardMarkup({
  label = "",
  title = "",
  body = "",
  tone = "",
  footerHtml = "",
  actionsHtml = "",
} = {}) {
  const toneClass = tone ? ` is-${escapePhoneAppHtml(tone)}` : "";
  const hasFooter = footerHtml || actionsHtml;

  return `
    <section class="phone-app-card${toneClass}">
      ${label ? `<div class="phone-app-card-label">${escapePhoneAppHtml(label)}</div>` : ""}
      ${title ? `<div class="phone-app-card-title">${escapePhoneAppHtml(title)}</div>` : ""}
      ${body ? `<div class="phone-app-card-body">${escapePhoneAppHtml(body)}</div>` : ""}
      ${hasFooter ? `
        <div class="phone-app-card-footer">
          ${footerHtml ? `<div class="phone-app-card-footer-copy">${footerHtml}</div>` : "<span></span>"}
          ${actionsHtml || ""}
        </div>
      ` : ""}
    </section>
  `;
}

function buildPhoneAppStatusMarkup(appId, fallbackMarkup = "") {
  const status = typeof getPhoneAppStatus === "function"
    ? getPhoneAppStatus(appId)
    : null;

  if (!status) {
    return fallbackMarkup;
  }

  return buildPhoneAppCardMarkup({
    label: "",
    title: status.title || "",
    body: status.body || "",
    tone: status.tone || "",
  });
}
