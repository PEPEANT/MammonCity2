(function () {
  const params = new URLSearchParams(location.search);
  if (!params.has("dev")) return;

  const DEV_LAYOUT_KEY = "mammon-city-dev-layout-v1";
  const DEV_LAYOUT_VERSION = 1;
  const DEV_TEXT_KEY = "mammon-city-dev-text-v1";
  const DEV_TEXT_VERSION = 1;
  const DEV_SECTION_KEY = "mammon-city-dev-sections-v1";
  const DEV_SECTION_VERSION = 1;
  const DRAG_ROUND_DIGITS = 1;
  const ACTOR_DRAG_OVERFLOW_X = 0.18;
  const ACTOR_DRAG_OVERFLOW_Y = 140;
  const TRASH_DRAG_OVERFLOW_X = 0.12;
  const TRASH_DRAG_OVERFLOW_Y = 84;
  const DEV_WINDOW_BASE_Z = 12000;

  const editor = {
    enabled: false,
    store: loadLayoutStore(),
    textStore: loadTextStore(),
    sectionStore: loadSectionStore(),
    contextKey: "",
    formSelectionKey: "",
    selection: null,
    drag: null,
    windowDrag: null,
    windowZ: DEV_WINDOW_BASE_Z,
    panel: null,
    sections: {},
    elements: {},
    textFormContextKey: "",
    replayBaseState: null,
    replayBaseShowTitle: false,
    replayActive: false,
    replayDay: 0,
    replayPresetId: "",
    replayOptionSignature: "",
  };

  document.addEventListener("DOMContentLoaded", initDevPanel);

  function initDevPanel() {
    const panel = document.getElementById("dev-panel");
    if (!panel) return;

    editor.panel = panel;
    panel.style.display = "flex";

    setupDevSections(panel);
    buildDayButtons(editor.sections.days.body);
    buildStatControls(editor.sections.stats.body);
    buildEventReplayEditor(panel);
    buildPositionEditor(panel);
    buildNarrationEditor(panel);
    buildStateDisplay(editor.sections.state.body);
    detachDevWindows();
    hookRenderGame();
    bindEditorGlobals();
    refreshEventReplayEditor();
    refreshPositionEditor();
    refreshNarrationEditor();

    setInterval(() => {
      refreshStateDisplay(panel);
      if (!editor.drag) {
        refreshPositionEditor();
      }
      refreshEventReplayEditor();
      refreshNarrationEditor();
    }, 100);
  }

  function setupDevSections(panel) {
    registerExistingSection(panel.querySelector(".dev-section.days"), "days", "일차 이동");
    registerExistingSection(panel.querySelector(".dev-section.stats"), "stats", "행동 / 스탯");
    registerExistingSection(panel.querySelector(".dev-section.state-dump"), "state", "현재 상태", true);
  }

  function registerExistingSection(section, key, title, defaultCollapsed = false) {
    if (!section) {
      return null;
    }

    return mountSectionChrome(section, key, title, defaultCollapsed);
  }

  function createEditorSection(panel, className, key, title, defaultCollapsed = false) {
    const section = document.createElement("div");
    section.className = `dev-section ${className}`;
    const stateSection = panel.querySelector(".dev-section.state-dump");
    panel.insertBefore(section, stateSection);
    return mountSectionChrome(section, key, title, defaultCollapsed);
  }

  function mountSectionChrome(section, key, title, defaultCollapsed = false) {
    const existingChildren = [...section.childNodes];
    const fragment = document.createDocumentFragment();

    existingChildren.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("dev-section-label")) {
        return;
      }
      fragment.appendChild(node);
    });

    section.textContent = "";
    section.dataset.sectionKey = key;
    section.classList.add("dev-floating-window");

    const header = document.createElement("div");
    header.className = "dev-window-bar";

    const handle = document.createElement("div");
    handle.className = "dev-window-handle";
    handle.textContent = title;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "dev-window-toggle";

    const titleNode = document.createElement("span");
    titleNode.className = "dev-section-title";
    titleNode.textContent = title;

    const metaNode = document.createElement("span");
    metaNode.className = "dev-window-toggle-meta";

    const chevronNode = document.createElement("span");
    chevronNode.className = "dev-section-chevron";
    chevronNode.textContent = "▾";

    toggle.append(metaNode);

    const body = document.createElement("div");
    body.className = "dev-section-body";
    body.appendChild(fragment);

    header.append(handle, toggle);
    section.append(header, body);

    const entry = {
      key,
      section,
      body,
      header,
      handle,
      toggle,
      metaNode,
      defaultCollapsed,
    };

    editor.sections[key] = entry;
    applySectionState(entry, getSectionCollapsed(key, defaultCollapsed));
    bindSectionWindowDrag(entry);

    toggle.addEventListener("click", () => {
      setSectionCollapsed(key, !section.classList.contains("is-collapsed"));
    });

    return entry;
  }

  function getSectionCollapsed(key, defaultCollapsed = false) {
    const saved = editor.sectionStore.sections?.[key];
    if (typeof saved === "boolean") {
      return saved;
    }
    return defaultCollapsed;
  }

  function setSectionCollapsed(key, collapsed) {
    const entry = editor.sections[key];
    if (!entry) {
      return;
    }

    editor.sectionStore.sections = editor.sectionStore.sections || {};
    editor.sectionStore.sections[key] = collapsed;
    saveSectionStore();
    applySectionState(entry, collapsed);
  }

  function applySectionState(entry, collapsed) {
    entry.section.classList.toggle("is-collapsed", collapsed);
    entry.body.hidden = collapsed;
    entry.toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    entry.metaNode.textContent = collapsed ? "열기" : "닫기";
    entry.metaNode.textContent = collapsed ? "열기" : "닫기";
  }

  function getDefaultWindowPosition(key) {
    const defaults = {
      days: { left: 18, top: 56 },
      stats: { left: 264, top: 56 },
      events: { left: 510, top: 56 },
      position: { left: 18, top: 246 },
      narration: { left: 314, top: 246 },
      state: { left: 806, top: 56 },
    };

    return defaults[key] || { left: 18, top: 56 };
  }

  function detachDevWindows() {
    Object.values(editor.sections).forEach((entry) => {
      if (!entry?.section) {
        return;
      }

      document.body.appendChild(entry.section);
      applyWindowPosition(entry, getSavedWindowPosition(entry.key));
      focusSectionWindow(entry);
    });
  }

  function getSavedWindowPosition(key) {
    const saved = editor.sectionStore.positions?.[key];
    if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
      return saved;
    }
    return getDefaultWindowPosition(key);
  }

  function saveWindowPosition(key, left, top) {
    editor.sectionStore.positions = editor.sectionStore.positions || {};
    editor.sectionStore.positions[key] = {
      left: Math.round(left),
      top: Math.round(top),
    };
    saveSectionStore();
  }

  function applyWindowPosition(entry, position) {
    const width = entry.section.offsetWidth || 240;
    const height = entry.section.offsetHeight || 180;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const maxTop = Math.max(8, window.innerHeight - height - 8);
    const left = Math.max(8, Math.min(maxLeft, Math.round(position?.left ?? 18)));
    const top = Math.max(8, Math.min(maxTop, Math.round(position?.top ?? 56)));
    entry.section.style.left = `${left}px`;
    entry.section.style.top = `${top}px`;
  }

  function focusSectionWindow(entry) {
    editor.windowZ += 1;
    entry.section.style.zIndex = String(editor.windowZ);
  }

  function bindSectionWindowDrag(entry) {
    if (!entry?.handle) {
      return;
    }

    entry.handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }

      const rect = entry.section.getBoundingClientRect();
      editor.windowDrag = {
        key: entry.key,
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };

      focusSectionWindow(entry);
      entry.section.classList.add("is-window-dragging");
      event.preventDefault();
    });

    entry.section.addEventListener("pointerdown", () => {
      focusSectionWindow(entry);
    });
  }

  function refreshDetachedWindowPositions() {
    Object.values(editor.sections).forEach((entry) => {
      if (!entry?.section?.isConnected) {
        return;
      }

      applyWindowPosition(entry, {
        left: parseFloat(entry.section.style.left) || getSavedWindowPosition(entry.key).left,
        top: parseFloat(entry.section.style.top) || getSavedWindowPosition(entry.key).top,
      });
    });
  }

  function buildDayButtons(section) {
    for (let d = 1; d <= 30; d++) {
      const btn = document.createElement("button");
      btn.className = "dev-day-btn";
      btn.textContent = d;
      btn.dataset.day = d;
      btn.title = `${d}일차로 이동`;
      btn.addEventListener("click", () => jumpToDay(d));
      section.appendChild(btn);
    }
  }

  function buildStatControls(section) {

    const stats = [
      { label: "현금", id: "dev-money", min: 0, max: 9999999, step: 10000, get: () => state.money, set: (v) => { state.money = v; } },
      { label: "체력", id: "dev-stamina", min: 0, max: 200, step: 10, get: () => state.stamina, set: (v) => { state.stamina = v; } },
      { label: "에너지", id: "dev-energy", min: 0, max: 200, step: 10, get: () => state.energy, set: (v) => { state.energy = v; } },
    ];

    stats.forEach(({ label, id, min, max, step, get, set }) => {
      const row = document.createElement("div");
      row.className = "dev-stat-row";

      const lbl = document.createElement("span");
      lbl.textContent = label;

      const input = document.createElement("input");
      input.type = "number";
      input.id = id;
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = get();

      const btn = document.createElement("button");
      btn.textContent = "적용";
      btn.addEventListener("click", () => {
        const val = parseInt(input.value, 10);
        if (!isNaN(val)) {
          set(Math.max(min, Math.min(max, val)));
          if (typeof renderGame === "function") renderGame();
        }
      });

      row.appendChild(lbl);
      row.appendChild(input);
      row.appendChild(btn);
      section.appendChild(row);
    });

    const phoneRow = document.createElement("div");
    phoneRow.className = "dev-stat-row";
    const phoneBtn = document.createElement("button");
    phoneBtn.id = "dev-phone-toggle";
    phoneBtn.textContent = "폰 토글";
    phoneBtn.addEventListener("click", () => {
      state.hasPhone = !state.hasPhone;
      if (typeof renderGame === "function") renderGame();
    });
    phoneRow.appendChild(phoneBtn);
    section.appendChild(phoneRow);
  }

  function buildEventReplayEditor(panel) {
    const sectionEntry = createEditorSection(panel, "event-replay", "events", "이벤트 재생");
    const section = sectionEntry.body;

    const sceneLine = document.createElement("div");
    sceneLine.className = "dev-editor-line";
    sceneLine.id = "dev-replay-scene";

    const dayField = buildSelectEditorField("일차", "dev-replay-day");
    const totalDays = Math.max(typeof MAX_DAYS === "number" ? MAX_DAYS : 0, 30);
    for (let day = 1; day <= totalDays; day += 1) {
      const option = document.createElement("option");
      option.value = String(day);
      option.textContent = `${day}일차`;
      dayField.input.appendChild(option);
    }

    const presetField = buildSelectEditorField("이벤트", "dev-replay-preset");

    const actions = document.createElement("div");
    actions.className = "dev-position-actions";

    const replayButton = buildEditorButton("재생");
    const restoreButton = buildEditorButton("원래 상태");

    replayButton.addEventListener("click", replaySelectedEventPreset);
    restoreButton.addEventListener("click", restoreReplayBaseState);

    actions.append(replayButton, restoreButton);

    const note = document.createElement("div");
    note.className = "dev-editor-note";
    note.textContent = "이벤트 재생은 저장되지 않고, 원래 상태 복구 전까지 DEV 미리보기로만 유지됩니다.";

    const status = document.createElement("div");
    status.className = "dev-editor-status";
    status.id = "dev-replay-status";
    status.textContent = "이벤트를 선택한 뒤 재생하면 깨끗한 상태로 장면이 열립니다.";

    dayField.input.addEventListener("change", () => {
      editor.replayDay = Number(dayField.input.value) || 1;
      syncReplayPresetOptions(true);
    });

    presetField.input.addEventListener("change", () => {
      editor.replayPresetId = presetField.input.value || "";
      refreshEventReplayEditor();
    });

    section.append(sceneLine, dayField, presetField, actions, note, status);

    editor.elements.replaySection = sectionEntry.section;
    editor.elements.replaySceneLine = sceneLine;
    editor.elements.replayDaySelect = dayField.input;
    editor.elements.replayPresetSelect = presetField.input;
    editor.elements.replayButton = replayButton;
    editor.elements.replayRestoreButton = restoreButton;
    editor.elements.replayStatus = status;

    editor.replayDay = state?.day || 1;
    dayField.input.value = String(editor.replayDay);
    syncReplayPresetOptions(true);
  }

  function buildPositionEditor(panel) {
    const sectionEntry = createEditorSection(panel, "position-editor", "position", "위치 편집");
    const section = sectionEntry.body;

    const label = document.createElement("div");
    label.className = "dev-section-label";
    label.textContent = "위치 편집";

    const actions = document.createElement("div");
    actions.className = "dev-position-actions";

    const toggleButton = buildEditorButton("위치 편집 켜기");
    const saveButton = buildEditorButton("로컬 저장");
    const copyButton = buildEditorButton("복사");
    const resetButton = buildEditorButton("초기화");

    toggleButton.addEventListener("click", () => setEditorEnabled(!editor.enabled));
    saveButton.addEventListener("click", () => persistCurrentLayout("현재 배치를 브라우저에 저장했습니다."));
    copyButton.addEventListener("click", copyCurrentLayout);
    resetButton.addEventListener("click", resetCurrentLayout);

    actions.append(toggleButton, saveButton, copyButton, resetButton);

    const sceneLine = document.createElement("div");
    sceneLine.className = "dev-editor-line";
    sceneLine.id = "dev-position-scene";

    const selectionLine = document.createElement("div");
    selectionLine.className = "dev-editor-line";
    selectionLine.id = "dev-position-selection";

    const readout = document.createElement("pre");
    readout.className = "dev-editor-readout";
    readout.id = "dev-position-readout";

    const actorFields = document.createElement("div");
    actorFields.className = "dev-editor-inputs";

    const heightLabel = document.createElement("label");
    heightLabel.className = "dev-editor-field";
    const heightSpan = document.createElement("span");
    heightSpan.textContent = "height";
    const heightInput = document.createElement("input");
    heightInput.type = "number";
    heightInput.id = "dev-actor-height";
    heightInput.min = "1";
    heightInput.max = "100";
    heightInput.step = "0.5";
    heightInput.disabled = true;
    heightInput.addEventListener("input", () => {
      heightInput.dataset.dirty = "1";
    });
    heightLabel.append(heightSpan, heightInput);

    const zLabel = document.createElement("label");
    zLabel.className = "dev-editor-field";
    const zSpan = document.createElement("span");
    zSpan.textContent = "z";
    const zInput = document.createElement("input");
    zInput.type = "number";
    zInput.id = "dev-actor-z";
    zInput.min = "0";
    zInput.max = "99";
    zInput.step = "1";
    zInput.disabled = true;
    zInput.addEventListener("input", () => {
      zInput.dataset.dirty = "1";
    });
    zLabel.append(zSpan, zInput);

    const rotateField = buildPositionField("rotate", "dev-actor-rotate", {
      min: "-180",
      max: "180",
      step: "1",
    });

    const facingField = document.createElement("label");
    facingField.className = "dev-editor-field";
    const facingSpan = document.createElement("span");
    facingSpan.textContent = "flip";
    const facingSelect = document.createElement("select");
    facingSelect.id = "dev-actor-facing";
    facingSelect.disabled = true;
    facingSelect.innerHTML = `
      <option value="1">normal</option>
      <option value="-1">mirror</option>
    `;
    facingSelect.addEventListener("change", () => {
      facingSelect.dataset.dirty = "1";
    });
    facingField.append(facingSpan, facingSelect);

    const cropTopField = buildPositionField("crop top", "dev-crop-top", {
      min: "0",
      max: "90",
      step: "1",
    });
    const cropRightField = buildPositionField("crop right", "dev-crop-right", {
      min: "0",
      max: "90",
      step: "1",
    });
    const cropBottomField = buildPositionField("crop bottom", "dev-crop-bottom", {
      min: "0",
      max: "90",
      step: "1",
    });
    const cropLeftField = buildPositionField("crop left", "dev-crop-left", {
      min: "0",
      max: "90",
      step: "1",
    });

    const applyButton = buildEditorButton("배우 적용");
    applyButton.classList.add("single");
    applyButton.disabled = true;
    applyButton.addEventListener("click", applySelectedTransformSettings);

    actorFields.append(
      heightLabel,
      zLabel,
      rotateField.wrapper,
      facingField,
      cropTopField.wrapper,
      cropRightField.wrapper,
      cropBottomField.wrapper,
      cropLeftField.wrapper,
      applyButton,
    );

    const note = document.createElement("div");
    note.className = "dev-editor-note";
    note.textContent = "드래그 배치는 코드 파일이 아니라 현재 브라우저의 localStorage에만 저장됩니다.";

    const status = document.createElement("div");
    status.className = "dev-editor-status";
    status.id = "dev-position-status";
    status.textContent = "편집 꺼짐";

    section.append(actions, note, status);

    editor.elements = {
      section: sectionEntry.section,
      toggleButton,
      saveButton,
      copyButton,
      resetButton,
      sceneLine,
      selectionLine,
      readout,
      sizeLabel: heightSpan,
      heightInput,
      zInput,
      rotateInput: rotateField.input,
      facingSelect,
      cropTopInput: cropTopField.input,
      cropRightInput: cropRightField.input,
      cropBottomInput: cropBottomField.input,
      cropLeftInput: cropLeftField.input,
      applyButton,
      status,
    };
  }

  function buildNarrationEditor(panel) {
    const sectionEntry = createEditorSection(panel, "narration-editor", "narration", "나레이션 편집");
    const section = sectionEntry.body;

    const label = document.createElement("div");
    label.className = "dev-section-label";
    label.textContent = "나레이션 편집";

    const sceneLine = document.createElement("div");
    sceneLine.className = "dev-editor-line";
    sceneLine.id = "dev-text-scene";

    const speakerField = buildNarrationField("화자", "dev-text-speaker");
    const titleField = buildNarrationField("제목", "dev-text-title");

    const linesField = document.createElement("label");
    linesField.className = "dev-editor-field full";
    const linesSpan = document.createElement("span");
    linesSpan.textContent = "본문";
    const linesInput = document.createElement("textarea");
    linesInput.id = "dev-text-lines";
    linesInput.rows = 5;
    linesField.append(linesSpan, linesInput);

    const actions = document.createElement("div");
    actions.className = "dev-position-actions";

    const saveButton = buildEditorButton("저장/적용");
    const copyButton = buildEditorButton("복사");
    const reloadButton = buildEditorButton("다시 불러오기");
    const resetButton = buildEditorButton("초기화");

    saveButton.addEventListener("click", saveNarrationOverride);
    copyButton.addEventListener("click", copyNarrationOverride);
    reloadButton.addEventListener("click", reloadNarrationInputs);
    resetButton.addEventListener("click", resetNarrationOverride);

    actions.append(saveButton, copyButton, reloadButton, resetButton);

    const status = document.createElement("div");
    status.className = "dev-editor-status";
    status.id = "dev-text-status";
    status.textContent = "현재 씬 텍스트를 편집할 수 있습니다.";

    section.append(sceneLine, speakerField, titleField, linesField, actions, status);

    [speakerField.input, titleField.input, linesInput].forEach((input) => {
      input.addEventListener("input", () => {
        input.dataset.dirty = "1";
      });
    });

    editor.elements.textSection = sectionEntry.section;
    editor.elements.textSceneLine = sceneLine;
    editor.elements.textSpeakerInput = speakerField.input;
    editor.elements.textTitleInput = titleField.input;
    editor.elements.textLinesInput = linesInput;
    editor.elements.textSaveButton = saveButton;
    editor.elements.textCopyButton = copyButton;
    editor.elements.textReloadButton = reloadButton;
    editor.elements.textResetButton = resetButton;
    editor.elements.textStatus = status;
  }

  function buildNarrationField(labelText, id) {
    const wrapper = document.createElement("label");
    wrapper.className = "dev-editor-field full";

    const label = document.createElement("span");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = "text";
    input.id = id;

    wrapper.append(label, input);
    wrapper.input = input;
    return wrapper;
  }

  function buildSelectEditorField(labelText, id) {
    const wrapper = document.createElement("label");
    wrapper.className = "dev-editor-field full";

    const label = document.createElement("span");
    label.textContent = labelText;

    const input = document.createElement("select");
    input.id = id;

    wrapper.append(label, input);
    wrapper.input = input;
    return wrapper;
  }

  function buildPositionField(labelText, id, attributes = {}) {
    const wrapper = document.createElement("label");
    wrapper.className = "dev-editor-field";

    const label = document.createElement("span");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.disabled = true;

    Object.entries(attributes).forEach(([key, value]) => {
      input.setAttribute(key, value);
    });

    input.addEventListener("input", () => {
      input.dataset.dirty = "1";
    });

    wrapper.append(label, input);
    return {
      wrapper,
      label,
      input,
    };
  }

  function buildEditorButton(text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dev-editor-btn";
    button.textContent = text;
    return button;
  }

  function buildStateDisplay(section) {
    const pre = document.createElement("pre");
    pre.id = "dev-state-dump";
    section.appendChild(pre);
  }

  function cloneLiveStateSnapshot(sourceState = state) {
    if (typeof hydrateState === "function" && typeof serializeState === "function") {
      return hydrateState(serializeState(sourceState).state);
    }

    return JSON.parse(JSON.stringify(sourceState));
  }

  function getSelectedReplayDay() {
    const value = Number(editor.elements.replayDaySelect?.value || editor.replayDay || state?.day || 1);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function getReplayPresetsForDay(day) {
    if (typeof getDayDevPresets !== "function") {
      return [];
    }

    return getDayDevPresets(day) || [];
  }

  function syncReplayPresetOptions(forceReset = false) {
    const select = editor.elements.replayPresetSelect;
    if (!select) {
      return;
    }

    const day = getSelectedReplayDay();
    const presets = getReplayPresetsForDay(day);
    const previousValue = forceReset ? "" : (select.value || editor.replayPresetId);
    const signature = `${day}:${presets.map((preset) => `${preset.id}:${preset.label || preset.id}`).join("|")}`;

    if (!forceReset && signature === editor.replayOptionSignature) {
      if (!editor.replayPresetId && presets[0]) {
        editor.replayPresetId = presets[0].id;
      }
      if (document.activeElement !== select && select.value !== editor.replayPresetId) {
        select.value = editor.replayPresetId || "";
      }
      return;
    }

    select.innerHTML = "";

    presets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.label || preset.id;
      select.appendChild(option);
    });

    const nextValue = presets.some((preset) => preset.id === previousValue)
      ? previousValue
      : (presets[0]?.id || "");

    select.value = nextValue;
    editor.replayPresetId = nextValue;
    editor.replayOptionSignature = signature;
  }

  function setReplayStatus(message) {
    if (editor.elements.replayStatus) {
      editor.elements.replayStatus.textContent = message;
    }
  }

  function replaySelectedEventPreset() {
    const day = getSelectedReplayDay();
    const presetId = editor.replayPresetId || editor.elements.replayPresetSelect?.value;
    const presets = getReplayPresetsForDay(day);
    const preset = presets.find((entry) => entry.id === presetId);

    if (!preset || typeof createDevReplayState !== "function") {
      setReplayStatus("재생할 이벤트를 먼저 선택해주세요.");
      return;
    }

    if (!editor.replayActive) {
      editor.replayBaseState = cloneLiveStateSnapshot(state);
      editor.replayBaseShowTitle = !document.getElementById("start-screen")?.classList.contains("is-hidden");
      editor.replayActive = true;
    }

    const playerName = editor.replayBaseState?.playerName || state.playerName;
    const replayState = createDevReplayState(day, preset.id, playerName);

    if (!replayState) {
      setReplayStatus("이벤트 재생 상태를 만들지 못했습니다.");
      return;
    }

    state = replayState;
    if (typeof hideStartScreen === "function") {
      hideStartScreen();
    }
    if (typeof renderGame === "function") {
      renderGame();
    }

    setReplayStatus(`${day}일차 "${preset.label || preset.id}" 재생 중`);
    refreshEventReplayEditor();
  }

  function restoreReplayBaseState() {
    if (!editor.replayBaseState) {
      setReplayStatus("복구할 원래 상태가 없습니다.");
      return;
    }

    state = cloneLiveStateSnapshot(editor.replayBaseState);
    state.devPreviewMode = false;
    editor.replayBaseState = null;
    editor.replayActive = false;

    if (editor.replayBaseShowTitle) {
      editor.replayBaseShowTitle = false;
      if (typeof showStartScreen === "function") {
        showStartScreen(Boolean(typeof loadSavedState === "function" && loadSavedState()));
      }
      return;
    }

    editor.replayBaseShowTitle = false;
    if (typeof hideStartScreen === "function") {
      hideStartScreen();
    }
    if (typeof renderGame === "function") {
      renderGame();
    }

    setReplayStatus("원래 상태로 복구했습니다.");
    refreshEventReplayEditor();
  }

  function refreshStateDisplay(panel) {
    const pre = panel.querySelector("#dev-state-dump");
    if (!pre || typeof state === "undefined") return;

    panel.querySelectorAll(".dev-day-btn").forEach((btn) => {
      btn.classList.toggle("active", parseInt(btn.dataset.day, 10) === state.day);
    });

    pre.textContent = [
      `day: ${state.day}`,
      `scene: ${state.scene}`,
      `story: ${state.storyKey} / ${state.storyStep}`,
      `time: ${typeof formatClockTime === "function" ? formatClockTime(state.timeSlot) : state.timeSlot}`,
      `money: ${state.money?.toLocaleString("ko-KR")}원`,
      `stamina: ${state.stamina}`,
      `energy: ${state.energy}`,
      `hasPhone: ${state.hasPhone}`,
      `day1Done: ${state.day1CleanupDone}`,
      `devPreview: ${Boolean(state.devPreviewMode)}`,
    ].join("\n");

    syncInput("dev-money", state.money);
    syncInput("dev-stamina", state.stamina);
    syncInput("dev-energy", state.energy);
  }

  function refreshEventReplayEditor() {
    const daySelect = editor.elements.replayDaySelect;
    const presetSelect = editor.elements.replayPresetSelect;
    const sceneLine = editor.elements.replaySceneLine;
    const replayButton = editor.elements.replayButton;
    const restoreButton = editor.elements.replayRestoreButton;

    if (!daySelect || !presetSelect || !sceneLine) {
      return;
    }

    if (editor.replayActive && state?.devPreviewMode !== true) {
      editor.replayActive = false;
      editor.replayBaseState = null;
      editor.replayBaseShowTitle = false;
    }

    if (!editor.replayActive && state?.devPreviewMode !== true) {
      if (!editor.replayDay) {
        editor.replayDay = state?.day || 1;
      }
    }

    if (document.activeElement !== daySelect) {
      daySelect.value = String(editor.replayDay || state?.day || 1);
    } else {
      editor.replayDay = Number(daySelect.value) || editor.replayDay || 1;
    }

    syncReplayPresetOptions(false);

    sceneLine.textContent = [
      `current: day${String(state.day).padStart(2, "0")}`,
      state.scene,
      state.devPreviewMode ? "DEV preview" : "live state",
    ].join(" / ");

    replayButton.disabled = !editor.replayPresetId;
    restoreButton.disabled = !editor.replayBaseState;

    if (editor.replayBaseState && state.devPreviewMode) {
      setReplayStatus("DEV 미리보기 중입니다. 이 상태는 저장되지 않습니다.");
    } else if (!editor.replayBaseState) {
      setReplayStatus("이벤트를 선택한 뒤 재생하면 깨끗한 테스트 상태로 열립니다.");
    }
  }

  function refreshPositionEditor() {
    if (!editor.panel || typeof state === "undefined") {
      return;
    }

    const context = getEditorContext();
    applyStoredLayout(context);
    decorateEditableElements(context);
    syncPositionEditorDisplay(context);
  }

  function refreshNarrationEditor() {
    const context = getTextContext();
    applyStoredNarrationOverride(context);
    syncNarrationEditor(context);
  }

  function getTextContext() {
    if (typeof state === "undefined" || !editor.elements.textSceneLine) {
      return null;
    }

    const segments = [`day${padDay(state.day)}`, state.scene];

    if (state.scene === "prologue") {
      segments.push(state.storyKey || "intro", `step${state.storyStep}`);
    } else if (state.scene === "cleanup") {
      segments.push(state.cleaningGame?.eventId || "default");
    } else if (state.scene === "incident") {
      segments.push(state.currentOffer?.jobId || "job", state.currentIncident?.id || "incident");
    } else if (state.scene === "result") {
      segments.push(state.currentOffer?.jobId || "job", state.currentIncident?.id || "result");
    } else if (state.scene === "ending") {
      segments.push("ending");
    }

    return {
      key: segments.join(":"),
      label: segments.join(" / "),
    };
  }

  function getEditorContext() {
    if (state.scene === "cleanup" && state.cleaningGame) {
      const visibleItems = state.cleaningGame.items.filter((item) => !item.collected);
      return {
        kind: "trash",
        key: `day${padDay(state.day)}:cleanup:${state.cleaningGame.eventId || "default"}`,
        label: `${state.day}일차 cleanup`,
        itemIds: visibleItems.map((item) => item.id),
        sourceItems: visibleItems.map((item) => ({ id: item.id, image: item.image })),
      };
    }

    const actorSource = getActorSourceData();
    if (actorSource.length && getActorElements().length) {
      const segments = [`day${padDay(state.day)}`, state.scene];
      if (state.scene === "prologue") {
        segments.push(state.storyKey || "intro", `step${state.storyStep}`);
      }

      return {
        kind: "actors",
        key: segments.join(":"),
        label: segments.join(" / "),
        sourceItems: actorSource.map((actor) => ({ ...actor })),
      };
    }

    return null;
  }

  function getActorSourceData() {
    if (state.scene === "prologue") {
      const steps = typeof getActiveStorySteps === "function" ? getActiveStorySteps() : [];
      return steps[state.storyStep]?.actors || [];
    }

    if (state.scene === "outside" && typeof getCurrentOutsideSceneConfig === "function") {
      return getCurrentOutsideSceneConfig()?.actors || [];
    }

    return [];
  }

  function applyStoredLayout(context) {
    if (!context) {
      return;
    }

    const saved = editor.store[context.key];
    if (!saved?.items) {
      return;
    }

    if (context.kind === "actors") {
      getActorElements().forEach((element, index) => {
        const item = saved.items[index];
        if (!item) return;
        applyActorLayout(element, item);
      });
      return;
    }

    if (context.kind === "trash") {
      const itemMap = new Map(saved.items.map((item) => [item.id, item]));
      getTrashElements().forEach((element, index) => {
        const itemId = context.itemIds[index];
        const item = itemMap.get(itemId);
        if (!item) return;
        applyTrashLayout(element, item);
      });
    }
  }

  function decorateEditableElements(context) {
    const actorsLayer = document.getElementById("actors-layer");
    const trashLayer = document.getElementById("trash-items");

    actorsLayer?.classList.toggle("dev-position-active", Boolean(editor.enabled && context?.kind === "actors"));
    trashLayer?.classList.toggle("dev-position-active", Boolean(editor.enabled && context?.kind === "trash"));

    getActorElements().forEach((element, index) => {
      prepareEditableElement(element, context, String(index));
    });

    getTrashElements().forEach((element, index) => {
      const itemId = context?.kind === "trash" ? context.itemIds[index] : `trash-${index}`;
      prepareEditableElement(element, context, itemId);
    });
  }

  function syncNarrationEditor(context) {
    const {
      textSceneLine,
      textSpeakerInput,
      textTitleInput,
      textLinesInput,
      textSaveButton,
      textCopyButton,
      textReloadButton,
      textResetButton,
      textStatus,
    } = editor.elements;

    if (!textSceneLine) {
      return;
    }

    if (!context) {
      editor.textFormContextKey = "";
      textSceneLine.textContent = "scene: 텍스트 대상 없음";
      textSpeakerInput.value = "";
      textTitleInput.value = "";
      textLinesInput.value = "";
      textSaveButton.disabled = true;
      textCopyButton.disabled = true;
      textReloadButton.disabled = true;
      textResetButton.disabled = true;
      textStatus.textContent = "편집할 텍스트가 없습니다.";
      return;
    }

    textSceneLine.textContent = `scene: ${context.label}`;
    textSaveButton.disabled = false;
    textCopyButton.disabled = false;
    textReloadButton.disabled = false;
    textResetButton.disabled = false;

    if (editor.textFormContextKey !== context.key) {
      const source = editor.textStore[context.key] || readNarrationFromDom();
      fillNarrationInputs(source);
      editor.textFormContextKey = context.key;
      textStatus.textContent = editor.textStore[context.key]
        ? "로컬 저장된 텍스트를 불러왔습니다."
        : "현재 화면 텍스트를 불러왔습니다.";
    }
  }

  function prepareEditableElement(element, context, itemId) {
    const isActive = Boolean(editor.enabled && context);
    const matchesContext = Boolean(context && ((context.kind === "actors" && element.classList.contains("scene-actor")) || (context.kind === "trash" && element.classList.contains("trash-item"))));
    const selected = Boolean(
      editor.selection
      && context
      && editor.selection.contextKey === context.key
      && editor.selection.itemId === itemId,
    );

    element.dataset.devItemId = itemId;
    element.dataset.devContextKey = context?.key || "";
    element.dataset.devKind = matchesContext ? context.kind : "";
    element.classList.toggle("dev-position-target", isActive && matchesContext);
    element.classList.toggle("is-selected", selected);
    element.classList.toggle("is-dragging", Boolean(editor.drag && editor.drag.element === element));

    if (element.dataset.devBound === "1") {
      return;
    }

    element.dataset.devBound = "1";
    element.addEventListener("pointerdown", handleEditablePointerDown);
    element.addEventListener("mousedown", handleEditableMouseDown);
    element.addEventListener("click", suppressEditableClick, true);
  }

  function handleEditablePointerDown(event) {
    if (!editor.enabled) {
      return;
    }

    const element = event.currentTarget;
    const context = getEditorContext();

    if (!context || element.dataset.devContextKey !== context.key || element.dataset.devKind !== context.kind) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    selectEditable(context, element.dataset.devItemId);
    startDrag(context, element, event);
  }

  function suppressEditableClick(event) {
    if (!editor.enabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function readNarrationFromDom() {
    const speaker = document.getElementById("speaker")?.textContent?.trim() || "";
    const title = document.querySelector("#message .message-title")?.textContent?.trim() || "";
    const lines = [...document.querySelectorAll("#message .message-copy > div")]
      .map((node) => node.textContent?.trim() || "")
      .filter(Boolean);

    return { speaker, title, lines };
  }

  function fillNarrationInputs(data = {}) {
    const speakerInput = editor.elements.textSpeakerInput;
    const titleInput = editor.elements.textTitleInput;
    const linesInput = editor.elements.textLinesInput;

    speakerInput.value = data.speaker || "";
    titleInput.value = data.title || "";
    linesInput.value = Array.isArray(data.lines) ? data.lines.join("\n") : "";

    delete speakerInput.dataset.dirty;
    delete titleInput.dataset.dirty;
    delete linesInput.dataset.dirty;
  }

  function getNarrationInputData() {
    return {
      speaker: editor.elements.textSpeakerInput.value.trim(),
      title: editor.elements.textTitleInput.value.trim(),
      lines: editor.elements.textLinesInput.value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    };
  }

  function applyNarrationToDom(data = {}) {
    if (typeof setSceneSpeaker === "function") {
      setSceneSpeaker(data.speaker || "");
    } else {
      const speakerNode = document.getElementById("speaker");
      if (speakerNode) {
        speakerNode.textContent = data.speaker || "";
      }
    }

    if (typeof renderMessage === "function") {
      renderMessage(data.title || "", data.lines || []);
      return;
    }

    const messageNode = document.getElementById("message");
    if (!messageNode) {
      return;
    }

    const titleMarkup = data.title ? `<div class="message-title">${escapeHtml(data.title)}</div>` : "";
    const bodyMarkup = (data.lines || []).length
      ? `<div class="message-copy">${data.lines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>`
      : "";

    messageNode.innerHTML = `${titleMarkup}${bodyMarkup}`;
  }

  function applyStoredNarrationOverride(context) {
    if (!context) {
      return;
    }

    const saved = editor.textStore[context.key];
    if (!saved) {
      return;
    }

    applyNarrationToDom(saved);
  }

  function handleEditableMouseDown(event) {
    if (!editor.enabled || event.button !== 0) {
      return;
    }

    const element = event.currentTarget;
    const context = getEditorContext();

    if (!context || element.dataset.devContextKey !== context.key || element.dataset.devKind !== context.kind) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    selectEditable(context, element.dataset.devItemId);
    startDrag(context, element, event);
  }

  function startDrag(context, element, event) {
    if (editor.drag) {
      return;
    }

    const layer = getLayoutLayer(context.kind);
    if (!layer) {
      return;
    }

    const layerRect = layer.getBoundingClientRect();
    const anchor = getElementAnchor(element, context.kind);

    editor.drag = {
      pointerId: event.pointerId ?? "mouse",
      contextKey: context.key,
      kind: context.kind,
      element,
      layer,
      layerRect,
      offsetX: event.clientX - anchor.x,
      offsetY: event.clientY - anchor.y,
    };

    element.classList.add("is-dragging");

    if (typeof element.setPointerCapture === "function") {
      try {
        element.setPointerCapture(event.pointerId);
      } catch (error) {
        console.warn("Failed to capture pointer", error);
      }
    }
  }

  function bindEditorGlobals() {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", finishDrag);
    window.addEventListener("resize", refreshDetachedWindowPositions);
  }

  function handlePointerMove(event) {
    if (editor.windowDrag) {
      handleWindowDragMove(event);
      return;
    }

    if (!editor.drag) {
      return;
    }

    if (event.pointerId != null && editor.drag.pointerId != null && event.pointerId !== editor.drag.pointerId) {
      return;
    }

    event.preventDefault();

    const overflowX = editor.drag.kind === "actors"
      ? editor.drag.layerRect.width * ACTOR_DRAG_OVERFLOW_X
      : editor.drag.layerRect.width * TRASH_DRAG_OVERFLOW_X;
    const overflowY = editor.drag.kind === "actors"
      ? ACTOR_DRAG_OVERFLOW_Y
      : TRASH_DRAG_OVERFLOW_Y;

    const nextX = clamp(
      event.clientX - editor.drag.offsetX,
      editor.drag.layerRect.left - overflowX,
      editor.drag.layerRect.right + overflowX,
    );
    const nextY = clamp(
      event.clientY - editor.drag.offsetY,
      editor.drag.layerRect.top - overflowY,
      editor.drag.layerRect.bottom + overflowY,
    );

    if (editor.drag.kind === "actors") {
      const layout = {
        left: roundTo(((nextX - editor.drag.layerRect.left) / editor.drag.layerRect.width) * 100),
        bottom: Math.round(editor.drag.layerRect.bottom - nextY),
      };
      applyActorLayout(editor.drag.element, layout);
    } else {
      const layout = {
        x: roundTo(((nextX - editor.drag.layerRect.left) / editor.drag.layerRect.width) * 100),
        y: roundTo(((nextY - editor.drag.layerRect.top) / editor.drag.layerRect.height) * 100),
      };
      applyTrashLayout(editor.drag.element, layout);
    }

    syncPositionEditorDisplay(getEditorContext());
  }

  function finishDrag(event) {
    if (editor.windowDrag) {
      finishWindowDrag(event);
      return;
    }

    if (!editor.drag) {
      return;
    }

    if (event.pointerId != null && editor.drag.pointerId != null && event.pointerId !== editor.drag.pointerId) {
      return;
    }

    editor.drag.element.classList.remove("is-dragging");
    editor.drag = null;
    persistCurrentLayout("드래그 결과를 브라우저에 저장했습니다.");
  }

  function handleWindowDragMove(event) {
    if (!editor.windowDrag) {
      return;
    }

    if (event.pointerId != null && editor.windowDrag.pointerId != null && event.pointerId !== editor.windowDrag.pointerId) {
      return;
    }

    event.preventDefault();

    const entry = editor.sections[editor.windowDrag.key];
    if (!entry) {
      return;
    }

    const maxLeft = Math.max(8, window.innerWidth - entry.section.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - entry.section.offsetHeight - 8);
    const left = Math.max(8, Math.min(maxLeft, event.clientX - editor.windowDrag.offsetX));
    const top = Math.max(8, Math.min(maxTop, event.clientY - editor.windowDrag.offsetY));

    applyWindowPosition(entry, { left, top });
  }

  function finishWindowDrag(event) {
    if (!editor.windowDrag) {
      return;
    }

    if (event.pointerId != null && editor.windowDrag.pointerId != null && event.pointerId !== editor.windowDrag.pointerId) {
      return;
    }

    const entry = editor.sections[editor.windowDrag.key];
    if (entry) {
      entry.section.classList.remove("is-window-dragging");
      saveWindowPosition(editor.windowDrag.key, parseFloat(entry.section.style.left) || 18, parseFloat(entry.section.style.top) || 56);
    }

    editor.windowDrag = null;
  }

  function applyActorLayout(element, layout) {
    if (typeof applySceneActorLayout === "function") {
      applySceneActorLayout(element, layout);
      return;
    }

    if (layout.left != null) {
      element.style.left = `${layout.left}%`;
    }
    if (layout.bottom != null) {
      element.style.bottom = `${layout.bottom}px`;
    }
    if (layout.height != null) {
      element.style.height = `${layout.height}%`;
    }
    if (layout.zIndex != null) {
      element.style.zIndex = String(layout.zIndex);
    }
  }

  function applyTrashLayout(element, layout) {
    if (typeof applyTrashItemLayout === "function") {
      applyTrashItemLayout(element, layout);
      return;
    }

    if (layout.x != null) {
      element.style.left = `${layout.x}%`;
    }
    if (layout.y != null) {
      element.style.top = `${layout.y}%`;
    }
  }

  function syncEditorDisplay(context) {
    const {
      toggleButton,
      saveButton,
      copyButton,
      resetButton,
      sceneLine,
      selectionLine,
      readout,
      sizeLabel,
      heightInput,
      zInput,
      rotateInput,
      facingSelect,
      cropTopInput,
      cropRightInput,
      cropBottomInput,
      cropLeftInput,
      applyButton,
      status,
    } = editor.elements;

    if (!toggleButton) {
      return;
    }

    toggleButton.textContent = editor.enabled ? "위치 편집 끄기" : "위치 편집 켜기";
    toggleButton.classList.toggle("is-active", editor.enabled);

    if (!context) {
      editor.contextKey = "";
      editor.selection = null;
      saveButton.disabled = true;
      copyButton.disabled = true;
      resetButton.disabled = true;
      applyButton.disabled = true;
      heightInput.disabled = true;
      zInput.disabled = true;
      editor.formSelectionKey = "";
      sceneLine.textContent = "scene: 편집 대상 없음";
      selectionLine.textContent = "selection: 없음";
      readout.textContent = "좌표 없음";
      return;
    }

    editor.contextKey = context.key;
    saveButton.disabled = false;
    copyButton.disabled = false;
    resetButton.disabled = false;
    sceneLine.textContent = `scene: ${context.label}`;

    const selected = getSelectedElement(context);
    if (!selected) {
      selectionLine.textContent = "selection: 없음";
      readout.textContent = context.kind === "actors"
        ? "left: -\nbottom: -\nheight: -\nzIndex: -"
        : "x: -\ny: -";
      applyButton.disabled = true;
      heightInput.disabled = true;
      zInput.disabled = true;
      editor.formSelectionKey = "";
      return;
    }

    if (context.kind === "actors") {
      const layout = readActorLayout(selected);
      selectionLine.textContent = `selection: actor ${editor.selection.itemId}`;
      readout.textContent = [
        `left: ${formatNumber(layout.left)}%`,
        `bottom: ${formatNumber(layout.bottom)}px`,
        `height: ${formatNumber(layout.height)}%`,
        `zIndex: ${layout.zIndex}`,
      ].join("\n");

      heightInput.disabled = false;
      zInput.disabled = false;
      applyButton.disabled = false;

      const formSelectionKey = `${context.key}:${editor.selection.itemId}`;
      if (editor.formSelectionKey !== formSelectionKey) {
        heightInput.value = formatNumber(layout.height);
        zInput.value = String(layout.zIndex);
        editor.formSelectionKey = formSelectionKey;
      }
      return;
    }

    const trashLayout = readTrashLayout(selected);
    selectionLine.textContent = `selection: ${editor.selection.itemId}`;
    readout.textContent = [
      `x: ${formatNumber(trashLayout.x)}%`,
      `y: ${formatNumber(trashLayout.y)}%`,
    ].join("\n");
    heightInput.disabled = true;
    zInput.disabled = true;
    applyButton.disabled = true;
    editor.formSelectionKey = "";
  }

  function syncPositionEditorDisplay(context) {
    const {
      toggleButton,
      saveButton,
      copyButton,
      resetButton,
      sceneLine,
      selectionLine,
      readout,
      sizeLabel,
      heightInput,
      zInput,
      rotateInput,
      facingSelect,
      cropTopInput,
      cropRightInput,
      cropBottomInput,
      cropLeftInput,
      applyButton,
    } = editor.elements;

    if (!toggleButton) {
      return;
    }

    toggleButton.textContent = editor.enabled ? "위치 편집 끄기" : "위치 편집 켜기";
    toggleButton.classList.toggle("is-active", editor.enabled);

    if (!context) {
      editor.contextKey = "";
      editor.selection = null;
      saveButton.disabled = true;
      copyButton.disabled = true;
      resetButton.disabled = true;
      applyButton.disabled = true;
      heightInput.disabled = true;
      zInput.disabled = true;
      rotateInput.disabled = true;
      facingSelect.disabled = true;
      cropTopInput.disabled = true;
      cropRightInput.disabled = true;
      cropBottomInput.disabled = true;
      cropLeftInput.disabled = true;
      editor.formSelectionKey = "";
      sceneLine.textContent = "scene: editable target 없음";
      selectionLine.textContent = "selection: none";
      readout.textContent = "좌표 없음";
      return;
    }

    editor.contextKey = context.key;
    saveButton.disabled = false;
    copyButton.disabled = false;
    resetButton.disabled = false;
    sceneLine.textContent = `scene: ${context.label}`;

    const selected = getSelectedElement(context);
    if (!selected) {
      selectionLine.textContent = "selection: none";
      readout.textContent = context.kind === "actors"
        ? "left: -\nbottom: -\nsize: -\nzIndex: -\nrotate: -\nflip: -"
        : "x: -\ny: -\nsize: -\nzIndex: -\nrotate: -\nflip: -";
      applyButton.disabled = true;
      heightInput.disabled = true;
      zInput.disabled = true;
      rotateInput.disabled = true;
      facingSelect.disabled = true;
      cropTopInput.disabled = true;
      cropRightInput.disabled = true;
      cropBottomInput.disabled = true;
      cropLeftInput.disabled = true;
      editor.formSelectionKey = "";
      return;
    }

    const isActor = context.kind === "actors";
    const layout = isActor ? readActorLayout(selected) : readTrashLayout(selected);
    selectionLine.textContent = isActor
      ? `selection: actor ${editor.selection.itemId}`
      : `selection: ${editor.selection.itemId}`;

    readout.textContent = isActor
      ? [
          `left: ${formatNumber(layout.left)}%`,
          `bottom: ${formatNumber(layout.bottom)}px`,
          `size: ${formatNumber(layout.height)}%`,
          `zIndex: ${layout.zIndex}`,
          `rotate: ${formatNumber(layout.rotation)}deg`,
          `flip: ${layout.facing === -1 ? "mirror" : "normal"}`,
          `crop: ${formatNumber(layout.cropTop)} / ${formatNumber(layout.cropRight)} / ${formatNumber(layout.cropBottom)} / ${formatNumber(layout.cropLeft)}`,
        ].join("\n")
      : [
          `x: ${formatNumber(layout.x)}%`,
          `y: ${formatNumber(layout.y)}%`,
          `size: ${formatNumber(layout.size)}px`,
          `zIndex: ${layout.zIndex}`,
          `rotate: ${formatNumber(layout.rotation)}deg`,
          `flip: ${layout.facing === -1 ? "mirror" : "normal"}`,
          `crop: ${formatNumber(layout.cropTop)} / ${formatNumber(layout.cropRight)} / ${formatNumber(layout.cropBottom)} / ${formatNumber(layout.cropLeft)}`,
        ].join("\n");

    sizeLabel.textContent = isActor ? "size (%)" : "size (px)";
    heightInput.max = isActor ? "180" : "240";
    heightInput.step = isActor ? "0.5" : "1";
    heightInput.disabled = false;
    zInput.disabled = false;
    rotateInput.disabled = false;
    facingSelect.disabled = false;
    cropTopInput.disabled = false;
    cropRightInput.disabled = false;
    cropBottomInput.disabled = false;
    cropLeftInput.disabled = false;
    applyButton.disabled = false;

    const formSelectionKey = `${context.key}:${editor.selection.itemId}`;
    if (editor.formSelectionKey !== formSelectionKey) {
      heightInput.value = formatNumber(isActor ? layout.height : layout.size);
      zInput.value = String(layout.zIndex);
      rotateInput.value = formatNumber(layout.rotation);
      facingSelect.value = String(layout.facing);
      cropTopInput.value = formatNumber(layout.cropTop);
      cropRightInput.value = formatNumber(layout.cropRight);
      cropBottomInput.value = formatNumber(layout.cropBottom);
      cropLeftInput.value = formatNumber(layout.cropLeft);
      editor.formSelectionKey = formSelectionKey;
    }
  }

  function selectEditable(context, itemId) {
    editor.selection = {
      contextKey: context.key,
      kind: context.kind,
      itemId,
    };

    editor.formSelectionKey = "";
    decorateEditableElements(context);
    syncPositionEditorDisplay(context);
  }

  function getSelectedElement(context) {
    if (!editor.selection || editor.selection.contextKey !== context.key) {
      return null;
    }

    const selector = `[data-dev-item-id="${editor.selection.itemId}"][data-dev-context-key="${context.key}"]`;
    return document.querySelector(selector);
  }

  function applySelectedTransformSettings() {
    const context = getEditorContext();
    if (!context) {
      return;
    }

    const selected = getSelectedElement(context);
    if (!selected) {
      setStatus("선택된 대상이 없습니다.");
      return;
    }

    if (context.kind === "actors") {
      const current = readActorLayout(selected);
      const height = clampNumber(parseFloat(editor.elements.heightInput.value), 1, 180, current.height);
      const zIndex = clampNumber(parseInt(editor.elements.zInput.value, 10), 0, 99, current.zIndex);
      const rotation = clampNumber(parseFloat(editor.elements.rotateInput.value), -180, 180, current.rotation);
      const facing = parseInt(editor.elements.facingSelect.value, 10) === -1 ? -1 : 1;
      const cropTop = clampNumber(parseFloat(editor.elements.cropTopInput.value), 0, 90, current.cropTop);
      const cropRight = clampNumber(parseFloat(editor.elements.cropRightInput.value), 0, 90, current.cropRight);
      const cropBottom = clampNumber(parseFloat(editor.elements.cropBottomInput.value), 0, 90, current.cropBottom);
      const cropLeft = clampNumber(parseFloat(editor.elements.cropLeftInput.value), 0, 90, current.cropLeft);

      applyActorLayout(selected, {
        height: roundTo(height),
        zIndex: Math.round(zIndex),
        facing,
        rotation: roundTo(rotation),
        cropTop: roundTo(cropTop),
        cropRight: roundTo(cropRight),
        cropBottom: roundTo(cropBottom),
        cropLeft: roundTo(cropLeft),
      });

      editor.formSelectionKey = "";
      persistCurrentLayout("배우 변형값을 저장했습니다.");
      return;
    }

    const current = readTrashLayout(selected);
    const size = clampNumber(parseFloat(editor.elements.heightInput.value), 24, 240, current.size);
    const zIndex = clampNumber(parseInt(editor.elements.zInput.value, 10), 0, 99, current.zIndex);
    const rotation = clampNumber(parseFloat(editor.elements.rotateInput.value), -180, 180, current.rotation);
    const facing = parseInt(editor.elements.facingSelect.value, 10) === -1 ? -1 : 1;
    const cropTop = clampNumber(parseFloat(editor.elements.cropTopInput.value), 0, 90, current.cropTop);
    const cropRight = clampNumber(parseFloat(editor.elements.cropRightInput.value), 0, 90, current.cropRight);
    const cropBottom = clampNumber(parseFloat(editor.elements.cropBottomInput.value), 0, 90, current.cropBottom);
    const cropLeft = clampNumber(parseFloat(editor.elements.cropLeftInput.value), 0, 90, current.cropLeft);

    applyTrashLayout(selected, {
      size: Math.round(size),
      zIndex: Math.round(zIndex),
      facing,
      rotation: roundTo(rotation),
      cropTop: roundTo(cropTop),
      cropRight: roundTo(cropRight),
      cropBottom: roundTo(cropBottom),
      cropLeft: roundTo(cropLeft),
    });

    editor.formSelectionKey = "";
    persistCurrentLayout("아이템 변형값을 저장했습니다.");
  }

  function applySelectedActorSettings() {
    const context = getEditorContext();
    if (!context || context.kind !== "actors") {
      return;
    }

    const selected = getSelectedElement(context);
    if (!selected) {
      setStatus("선택한 배우가 없습니다.");
      return;
    }

    const height = clampNumber(parseFloat(editor.elements.heightInput.value), 1, 100, readActorLayout(selected).height);
    const zIndex = clampNumber(parseInt(editor.elements.zInput.value, 10), 0, 99, readActorLayout(selected).zIndex);

    applyActorLayout(selected, {
      height: roundTo(height),
      zIndex: Math.round(zIndex),
    });

    editor.formSelectionKey = "";
    persistCurrentLayout("배우 크기와 zIndex를 저장했습니다.");
  }

  function saveNarrationOverride() {
    const context = getTextContext();
    if (!context) {
      setTextStatus("저장할 텍스트가 없습니다.");
      return;
    }

    const payload = getNarrationInputData();
    editor.textStore[context.key] = {
      ...payload,
      savedAt: Date.now(),
    };
    saveTextStore();
    applyNarrationToDom(payload);
    delete editor.elements.textSpeakerInput.dataset.dirty;
    delete editor.elements.textTitleInput.dataset.dirty;
    delete editor.elements.textLinesInput.dataset.dirty;
    setTextStatus("현재 씬 텍스트를 브라우저에 저장하고 바로 반영했습니다.");
  }

  function reloadNarrationInputs() {
    const context = getTextContext();
    if (!context) {
      setTextStatus("불러올 텍스트가 없습니다.");
      return;
    }

    fillNarrationInputs(editor.textStore[context.key] || readNarrationFromDom());
    editor.textFormContextKey = context.key;
    setTextStatus("현재 씬 텍스트를 다시 불러왔습니다.");
  }

  function resetNarrationOverride() {
    const context = getTextContext();
    if (!context) {
      setTextStatus("초기화할 텍스트가 없습니다.");
      return;
    }

    delete editor.textStore[context.key];
    saveTextStore();
    editor.textFormContextKey = "";
    setTextStatus("현재 씬 텍스트 로컬 저장을 지웠습니다.");

    if (typeof renderGame === "function") {
      renderGame();
    }
  }

  async function copyNarrationOverride() {
    const context = getTextContext();
    if (!context) {
      setTextStatus("복사할 텍스트가 없습니다.");
      return;
    }

    const payload = getNarrationInputData();
    const text = [
      "{",
      `  speaker: ${quoteString(payload.speaker)},`,
      `  title: ${quoteString(payload.title)},`,
      "  lines: [",
      ...payload.lines.map((line) => `    ${quoteString(line)},`),
      "  ]",
      "}",
    ].join("\n");

    const copied = await copyText(text);
    setTextStatus(copied ? "현재 씬 텍스트를 클립보드에 복사했습니다." : "텍스트 복사에 실패했습니다.");
  }

  function persistCurrentLayout(message = "브라우저 저장 완료") {
    const context = getEditorContext();
    if (!context) {
      setStatus("저장할 위치 데이터가 없습니다.");
      return false;
    }

    const captured = captureCurrentLayout(context);
    if (!captured.length) {
      setStatus("저장할 위치 데이터가 없습니다.");
      return false;
    }

    editor.store[context.key] = {
      version: DEV_LAYOUT_VERSION,
      kind: context.kind,
      label: context.label,
      savedAt: Date.now(),
      items: captured,
    };
    saveLayoutStore();
    setStatus(message);
    return true;
  }

  function resetCurrentLayout() {
    const context = getEditorContext();
    if (!context) {
      setStatus("초기화할 위치 데이터가 없습니다.");
      return;
    }

    delete editor.store[context.key];
    saveLayoutStore();
    setStatus("현재 씬의 로컬 위치 저장을 지웠습니다.");

    if (typeof renderGame === "function") {
      renderGame();
    } else {
      refreshPositionEditor();
    }
  }

  async function copyCurrentLayout() {
    const context = getEditorContext();
    if (!context) {
      setStatus("복사할 위치 데이터가 없습니다.");
      return;
    }

    const payload = formatLayoutForCopy(context, captureCurrentLayout(context));
    const copied = await copyText(payload);
    setStatus(copied ? "클립보드에 복사했습니다." : "복사에 실패했습니다.");
  }

  function captureCurrentLayout(context) {
    if (context.kind === "actors") {
      const source = context.sourceItems || [];
      return getActorElements().map((element, index) => {
        const base = source[index] || {};
        const layout = readActorLayout(element);
        return {
          ...base,
          left: layout.left,
          bottom: layout.bottom,
          height: layout.height,
          zIndex: layout.zIndex,
          facing: layout.facing,
          rotation: layout.rotation,
          cropTop: layout.cropTop,
          cropRight: layout.cropRight,
          cropBottom: layout.cropBottom,
          cropLeft: layout.cropLeft,
        };
      });
    }

    return getTrashElements().map((element, index) => {
      const base = context.sourceItems[index] || { id: context.itemIds[index] };
      const layout = readTrashLayout(element);
      return {
        ...base,
        x: layout.x,
        y: layout.y,
        size: layout.size,
        zIndex: layout.zIndex,
        facing: layout.facing,
        rotation: layout.rotation,
        cropTop: layout.cropTop,
        cropRight: layout.cropRight,
        cropBottom: layout.cropBottom,
        cropLeft: layout.cropLeft,
      };
    });
  }

  function readActorLayout(element) {
    return {
      left: roundTo(parseFloat(element.style.left) || 0),
      bottom: Math.round(parseFloat(element.style.bottom) || 0),
      height: roundTo(parseFloat(element.style.height) || 0),
      zIndex: parseInt(element.style.zIndex || "1", 10) || 1,
      facing: parseInt(element.dataset.facing || "1", 10) === -1 ? -1 : 1,
      rotation: roundTo(parseFloat(element.dataset.rotation || "0") || 0),
      cropTop: roundTo(parseFloat(element.dataset.cropTop || "0") || 0),
      cropRight: roundTo(parseFloat(element.dataset.cropRight || "0") || 0),
      cropBottom: roundTo(parseFloat(element.dataset.cropBottom || "0") || 0),
      cropLeft: roundTo(parseFloat(element.dataset.cropLeft || "0") || 0),
    };
  }

  function readTrashLayout(element) {
    return {
      x: roundTo(parseFloat(element.style.left) || 0),
      y: roundTo(parseFloat(element.style.top) || 0),
      size: Math.round(parseFloat(element.dataset.size || "96") || 96),
      zIndex: parseInt(element.style.zIndex || element.dataset.zIndex || "1", 10) || 1,
      facing: parseInt(element.dataset.facing || "1", 10) === -1 ? -1 : 1,
      rotation: roundTo(parseFloat(element.dataset.rotation || "0") || 0),
      cropTop: roundTo(parseFloat(element.dataset.cropTop || "0") || 0),
      cropRight: roundTo(parseFloat(element.dataset.cropRight || "0") || 0),
      cropBottom: roundTo(parseFloat(element.dataset.cropBottom || "0") || 0),
      cropLeft: roundTo(parseFloat(element.dataset.cropLeft || "0") || 0),
    };
  }

  function formatLayoutForCopy(context, items) {
    if (!items.length) {
      return "[]";
    }

    if (context.kind === "actors") {
      const lines = items.map((item) => {
        const parts = [
          `src: ${quoteString(item.src || "")}`,
          `alt: ${quoteString(item.alt || "")}`,
          `left: ${formatNumber(item.left)}`,
          `bottom: ${formatNumber(item.bottom)}`,
          `height: ${formatNumber(item.height)}`,
          `zIndex: ${item.zIndex}`,
        ];

        if (item.facing != null && item.facing !== 1) {
          parts.push(`facing: ${item.facing}`);
        }
        if (item.rotation != null && item.rotation !== 0) {
          parts.push(`rotation: ${formatNumber(item.rotation)}`);
        }
        if (item.cropTop || item.cropRight || item.cropBottom || item.cropLeft) {
          parts.push(`cropTop: ${formatNumber(item.cropTop || 0)}`);
          parts.push(`cropRight: ${formatNumber(item.cropRight || 0)}`);
          parts.push(`cropBottom: ${formatNumber(item.cropBottom || 0)}`);
          parts.push(`cropLeft: ${formatNumber(item.cropLeft || 0)}`);
        }

        return `  {\n    ${parts.join(",\n    ")}\n  }`;
      });

      return `[\n${lines.join(",\n")}\n]`;
    }

    const trashLines = items.map((item) => {
      const parts = [
        `id: ${quoteString(item.id || "")}`,
        `image: ${quoteString(item.image || "")}`,
        `x: ${formatNumber(item.x)}`,
        `y: ${formatNumber(item.y)}`,
      ];

      if (item.size != null && item.size !== 96) {
        parts.push(`size: ${Math.round(item.size)}`);
      }
      if (item.zIndex != null && item.zIndex !== 1) {
        parts.push(`zIndex: ${item.zIndex}`);
      }
      if (item.facing != null && item.facing !== 1) {
        parts.push(`facing: ${item.facing}`);
      }
      if (item.rotation != null && item.rotation !== 0) {
        parts.push(`rotation: ${formatNumber(item.rotation)}`);
      }
      if (item.cropTop || item.cropRight || item.cropBottom || item.cropLeft) {
        parts.push(`cropTop: ${formatNumber(item.cropTop || 0)}`);
        parts.push(`cropRight: ${formatNumber(item.cropRight || 0)}`);
        parts.push(`cropBottom: ${formatNumber(item.cropBottom || 0)}`);
        parts.push(`cropLeft: ${formatNumber(item.cropLeft || 0)}`);
      }

      return `  {\n    ${parts.join(",\n    ")}\n  }`;
    });
    return `[\n${trashLines.join(",\n")}\n]`;
  }

  function quoteString(value) {
    return JSON.stringify(String(value));
  }

  function getElementAnchor(element, kind) {
    const rect = element.getBoundingClientRect();

    if (kind === "actors") {
      return {
        x: rect.left + (rect.width / 2),
        y: rect.bottom,
      };
    }

    return {
      x: rect.left + (rect.width / 2),
      y: rect.top + (rect.height / 2),
    };
  }

  function getLayoutLayer(kind) {
    if (kind === "actors") {
      return document.getElementById("actors-layer");
    }

    return document.getElementById("trash-items");
  }

  function getActorElements() {
    return [...document.querySelectorAll("#actors-layer .scene-actor")];
  }

  function getTrashElements() {
    return [...document.querySelectorAll("#trash-items .trash-item")];
  }

  function hookRenderGame() {
    if (typeof window.renderGame !== "function" || window.renderGame.__devWrapped) {
      return;
    }

    const originalRenderGame = window.renderGame;
    const wrappedRenderGame = function wrappedRenderGame(...args) {
      const result = originalRenderGame.apply(this, args);
      if (!editor.drag) {
        refreshPositionEditor();
      }
      refreshEventReplayEditor();
      refreshNarrationEditor();
      return result;
    };

    wrappedRenderGame.__devWrapped = true;
    window.renderGame = wrappedRenderGame;

    if (typeof renderGame === "function") {
      renderGame = wrappedRenderGame;
    }
  }

  function setEditorEnabled(enabled) {
    editor.enabled = enabled;
    refreshPositionEditor();
    setStatus(enabled ? "위치 편집을 켰습니다." : "위치 편집을 껐습니다.");
  }

  function setStatus(message) {
    if (editor.elements.status) {
      editor.elements.status.textContent = message;
    }
  }

  function setTextStatus(message) {
    if (editor.elements.textStatus) {
      editor.elements.textStatus.textContent = message;
    }
  }

  function syncInput(id, value) {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) {
      el.value = value;
    }
  }

  function jumpToDay(n) {
    if (typeof state === "undefined" || typeof prepareDay !== "function") return;
    state.day = n;
    state.day1CleanupDone = n > 1;
    state.hasPhone = true;
    state.phoneMinimized = true;
    state.phoneUsedToday = false;
    if (typeof createPhoneHomePreview === "function") {
      state.phonePreview = createPhoneHomePreview(n);
    }
    state.scene = "room";
    state.currentOffer = null;
    state.currentIncident = null;
    state.lastResult = null;
    state.endingSummary = null;
    state.cleaningGame = null;
    if (typeof hideStartScreen === "function") hideStartScreen();
    prepareDay();
  }

  function loadLayoutStore() {
    try {
      const raw = localStorage.getItem(DEV_LAYOUT_KEY);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== DEV_LAYOUT_VERSION || typeof parsed.layouts !== "object") {
        return {};
      }

      return parsed.layouts;
    } catch (error) {
      console.warn("Failed to load dev layout store", error);
      return {};
    }
  }

  function loadTextStore() {
    try {
      const raw = localStorage.getItem(DEV_TEXT_KEY);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== DEV_TEXT_VERSION || typeof parsed.texts !== "object") {
        return {};
      }

      return parsed.texts;
    } catch (error) {
      console.warn("Failed to load dev text store", error);
      return {};
    }
  }

  function loadSectionStore() {
    try {
      const raw = localStorage.getItem(DEV_SECTION_KEY);
      if (!raw) {
        return { version: DEV_SECTION_VERSION, sections: {}, positions: {} };
      }

      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== DEV_SECTION_VERSION || typeof parsed.sections !== "object") {
        return { version: DEV_SECTION_VERSION, sections: {}, positions: {} };
      }

      return {
        version: DEV_SECTION_VERSION,
        sections: { ...parsed.sections },
        positions: typeof parsed.positions === "object" && parsed.positions ? { ...parsed.positions } : {},
      };
    } catch (error) {
      console.warn("Failed to load dev section store", error);
      return { version: DEV_SECTION_VERSION, sections: {}, positions: {} };
    }
  }

  function saveLayoutStore() {
    try {
      localStorage.setItem(DEV_LAYOUT_KEY, JSON.stringify({
        version: DEV_LAYOUT_VERSION,
        savedAt: Date.now(),
        layouts: editor.store,
      }));
    } catch (error) {
      console.warn("Failed to save dev layout store", error);
    }
  }

  function saveTextStore() {
    try {
      localStorage.setItem(DEV_TEXT_KEY, JSON.stringify({
        version: DEV_TEXT_VERSION,
        savedAt: Date.now(),
        texts: editor.textStore,
      }));
    } catch (error) {
      console.warn("Failed to save dev text store", error);
    }
  }

  function saveSectionStore() {
    try {
      localStorage.setItem(DEV_SECTION_KEY, JSON.stringify({
        version: DEV_SECTION_VERSION,
        savedAt: Date.now(),
        sections: editor.sectionStore.sections || {},
        positions: editor.sectionStore.positions || {},
      }));
    } catch (error) {
      console.warn("Failed to save dev section store", error);
    }
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn("Clipboard API copy failed", error);
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      console.warn("execCommand copy failed", error);
    }

    textarea.remove();
    return copied;
  }

  function padDay(day) {
    return String(day).padStart(2, "0");
  }

  function roundTo(value) {
    const scale = 10 ** DRAG_ROUND_DIGITS;
    return Math.round(value * scale) / scale;
  }

  function formatNumber(value) {
    const rounded = roundTo(Number(value) || 0);
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(DRAG_ROUND_DIGITS);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampNumber(value, min, max, fallback) {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    return clamp(value, min, max);
  }
})();
