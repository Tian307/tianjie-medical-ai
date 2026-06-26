const canvas = document.querySelector("#signalCanvas");
const ctx = canvas.getContext("2d");
const cursor = document.querySelector("#cursorLight");
const bootScreen = document.querySelector("#bootScreen");
const scrollProgress = document.querySelector("#scrollProgress");
const storyline = document.querySelector("#storyline");
const storylinePath = document.querySelector(".storyline-path-fill");

let width = 0;
let height = 0;
let nodes = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.floor((width * height) / 24000);
  nodes = Array.from({ length: Math.max(24, count) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
  }));
}

function drawSignals() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
  }

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 145) {
        const alpha = (1 - distance / 145) * 0.22;
        ctx.strokeStyle = `rgba(88, 216, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    const mouseDistance = Math.hypot(a.x - mouse.x, a.y - mouse.y);
    if (mouseDistance < 190) {
      ctx.strokeStyle = `rgba(37, 224, 147, ${(1 - mouseDistance / 190) * 0.26})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(37, 224, 147, 0.32)";
    ctx.fillRect(a.x - 1.2, a.y - 1.2, 2.4, 2.4);
  }

  requestAnimationFrame(drawSignals);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.18 },
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  updateStoryline(progress);
  updateProcessFlow();
  updateNavState();
}

function setupTilt() {
  const cards = document.querySelectorAll("[data-tilt]");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rx = (y / rect.height - 0.5) * -5;
      const ry = (x / rect.width - 0.5) * 5;

      card.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--my", `${(y / rect.height) * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupHeroParallax() {
  const hero = document.querySelector(".hero");
  const layers = document.querySelectorAll(".parallax-layer");
  const insightLabel = document.querySelector("#insightLabel");
  const insightTitle = document.querySelector("#insightTitle");
  const insightText = document.querySelector("#insightText");
  const insightPanel = document.querySelector(".hero-insight");
  const caption = document.querySelector("#heroCaption");
  const zoneItems = document.querySelectorAll(".zone-item");
  const sceneItems = document.querySelectorAll(".scene-building");
  const metaLeft = document.querySelector(".hero-meta-left strong");
  const metaRight = document.querySelector(".hero-meta-right strong");
  if (!hero || layers.length === 0) return;

  const signals = [
    {
      label: "SIGNAL 01",
      title: "Clinical Depth",
      text: "从临床一线和真实医疗流程里理解 AI 该解决什么。",
      status: "clinical context detected",
      caption: "left layer · real clinical workflow",
      accent: "#25e093",
      left: "Clinical Workflow",
      right: "Prototype Builder",
    },
    {
      label: "SIGNAL 02",
      title: "Teaching Context",
      text: "教学经验让我更关注人如何理解、执行和反馈一个系统。",
      status: "teaching context activated",
      caption: "upper layer · people and feedback",
      accent: "#78bce8",
      left: "Student Management",
      right: "Human Feedback",
    },
    {
      label: "SIGNAL 03",
      title: "Data Layer",
      text: "SFT、RAG、质控和医学术语体系，是医疗大模型可用性的底座。",
      status: "data layer in focus",
      caption: "right layer · terminology and quality",
      accent: "#58d8ff",
      left: "Medical Data",
      right: "RAG / SFT / QA",
    },
    {
      label: "SIGNAL 04",
      title: "Prototype Builder",
      text: "用 Vibe Coding 快速把场景做成能点击、能讨论、能迭代的原型。",
      status: "prototype route opened",
      caption: "lower layer · make it clickable",
      accent: "#65c8d0",
      left: "Vibe Coding",
      right: "Interactive Demo",
    },
    {
      label: "SIGNAL 05",
      title: "Human Confirmation",
      text: "医疗 AI 应该保留人工确认、权限边界和异常拦截。",
      status: "human confirmation first",
      caption: "center layer · safety before automation",
      accent: "#25e093",
      left: "Safety Boundary",
      right: "Human Confirmation",
    },
  ];

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let activeSignal = 0;

  function setSignal(index) {
    if (index === activeSignal) return;
    activeSignal = index;
    const signal = signals[index];
    if (!signal || !insightLabel || !insightTitle || !insightText) return;
    insightLabel.textContent = signal.label;
    insightTitle.textContent = signal.title;
    insightText.textContent = signal.text;
    hero.style.setProperty("--hero-accent", signal.accent);
    zoneItems.forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.zone) === index);
    });
    sceneItems.forEach((item) => {
      item.classList.toggle("active", Number(item.dataset.sceneIndex) === index);
    });
    if (caption) caption.textContent = signal.caption;
    if (metaLeft) metaLeft.textContent = signal.left;
    if (metaRight) metaRight.textContent = signal.right;
    if (insightPanel) {
      insightPanel.classList.add("updating");
      window.setTimeout(() => insightPanel.classList.remove("updating"), 180);
    }
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width;
    const normalizedY = (event.clientY - rect.top) / rect.height;
    targetX = normalizedX - 0.5;
    targetY = normalizedY - 0.5;
    hero.classList.add("scanning");
    hero.style.setProperty("--scan-x", `${normalizedX * 100}%`);
    hero.style.setProperty("--scan-y", `${normalizedY * 100}%`);

    if (normalizedX < 0.28) setSignal(0);
    else if (normalizedY < 0.34) setSignal(1);
    else if (normalizedX > 0.68) setSignal(2);
    else if (normalizedY > 0.62) setSignal(3);
    else setSignal(4);
  });

  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    hero.classList.remove("scanning");
  });

  sceneItems.forEach((item) => {
    const index = Number(item.dataset.sceneIndex);
    item.addEventListener("pointerenter", () => setSignal(index));
    item.addEventListener("focus", () => setSignal(index));
    item.addEventListener("click", () => setSignal(index));
  });

  window.addEventListener("worldstagechange", (event) => {
    const detail = event.detail || {};
    if (detail.accent) hero.style.setProperty("--hero-accent", detail.accent);
    if (Number.isFinite(detail.index)) {
      zoneItems.forEach((item) => {
        item.classList.toggle("active", Number(item.dataset.zone) === detail.index);
      });
    }
  });

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth || 0);
      const x = currentX * depth * 70;
      const y = currentY * depth * 44;
      layer.style.translate = `${x}px ${y}px`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

function setupStoryRail() {
  const nodes = document.querySelectorAll(".story-node");
  const sections = [
    document.querySelector(".scenario-walk"),
    document.querySelector(".depth-section"),
    document.querySelector(".work-section"),
    document.querySelector(".lab-section"),
  ].filter(Boolean);

  if (!nodes.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = sections.indexOf(visible.target);
      nodes.forEach((node, nodeIndex) => {
        node.classList.toggle("active", nodeIndex === index);
      });
    },
    { threshold: [0.28, 0.48, 0.68] },
  );

  sections.forEach((section) => observer.observe(section));
}

const processSteps = [...document.querySelectorAll(".process-step")];
const processFlow = document.querySelector(".process-flow");

function updateProcessFlow() {
  if (!processFlow || processSteps.length === 0) return;
  const rect = processFlow.getBoundingClientRect();
  const viewportAnchor = window.innerHeight * 0.68;
  const raw = (viewportAnchor - rect.top) / Math.max(rect.height + 220, 1);
  const progress = Math.min(1, Math.max(0, raw));
  const activeIndex = Math.min(processSteps.length - 1, Math.floor(progress * processSteps.length));
  const lineProgress = 25 + activeIndex * 25;
  processFlow.style.setProperty("--flow-progress", `${lineProgress}%`);
  processSteps.forEach((step, index) => {
    step.classList.toggle("active", index <= activeIndex);
  });
}

const navLinks = [...document.querySelectorAll(".site-header nav a")];
const navSections = [
  { id: "work", el: document.querySelector("#depth") },
  { id: "data-lab", el: document.querySelector("#data-lab") },
  { id: "evaluation", el: document.querySelector("#evaluation") },
  { id: "work", el: document.querySelector("#work") },
  { id: "lab", el: document.querySelector("#lab") },
  { id: "thinking", el: document.querySelector("#thinking") },
  { id: "contact", el: document.querySelector("#contact") },
].filter((item) => item.el);

function updateNavState() {
  if (!navLinks.length || !navSections.length) return;
  const line = window.innerHeight * 0.38;
  let activeId = "";
  navSections.forEach((item) => {
    const rect = item.el.getBoundingClientRect();
    if (rect.top <= line && rect.bottom >= line) activeId = item.id;
  });
  if (!activeId && window.scrollY < window.innerHeight * 0.7) activeId = "";
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    link.classList.toggle("active", href === `#${activeId}`);
  });
}

const storySections = [
  { id: "hero", el: document.querySelector(".hero") },
  { id: "depth", el: document.querySelector("#depth") },
  { id: "data-lab", el: document.querySelector("#data-lab") },
  { id: "evaluation", el: document.querySelector("#evaluation") },
  { id: "work", el: document.querySelector("#work") },
  { id: "lab", el: document.querySelector("#lab") },
  { id: "thinking", el: document.querySelector("#thinking") },
  { id: "contact", el: document.querySelector("#contact") },
].filter((item) => item.el);

let activeStorySection = "";

function activateStorySection(active) {
  if (!active || activeStorySection === active.id) return;
  document.body.dataset.storySection = active.id;
  storySections.forEach((item) => {
    item.el.classList.toggle("signal-current", item === active);
    item.el.classList.remove("signal-enter");
  });
  void active.el.offsetWidth;
  active.el.classList.add("signal-enter");
  storyline.classList.remove("section-hit");
  void storyline.offsetWidth;
  storyline.classList.add("section-hit");
  activeStorySection = active.id;
}

function setupSectionSignals() {
  const observer = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries
        .filter(
          (entry) =>
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.24,
        )
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!activeEntry) return;
      activateStorySection(
        storySections.find((item) => item.el === activeEntry.target),
      );
    },
    {
      threshold: [0.24, 0.38, 0.56],
    },
  );

  storySections.forEach((item) => observer.observe(item.el));
}

function updateStoryline(progress) {
  if (!storyline) return;
  const clamped = Math.min(100, Math.max(0, progress));
  storyline.style.setProperty("--story-progress", `${clamped}%`);
  storyline.style.setProperty("--story-progress-value", clamped.toFixed(2));
  const pathLength = storylinePath?.getTotalLength() || 0;
  const wavePoint = pathLength
    ? storylinePath.getPointAtLength((clamped / 100) * pathLength)
    : { x: 14 };
  const waveX = wavePoint.x;
  storyline.style.setProperty("--story-x", `${waveX.toFixed(2)}px`);

  const anchor = window.innerHeight * 0.5;
  const ranked = storySections.map((item) => {
    const rect = item.el.getBoundingClientRect();
    const edgeDistance =
      anchor < rect.top
        ? rect.top - anchor
        : anchor > rect.bottom
          ? anchor - rect.bottom
          : 0;
    const centerDistance = Math.abs((rect.top + rect.bottom) / 2 - anchor);
    return { item, edgeDistance, centerDistance };
  });
  ranked.sort(
    (a, b) =>
      a.edgeDistance - b.edgeDistance ||
      a.centerDistance - b.centerDistance,
  );
  activateStorySection(ranked[0]?.item);
}

const medicalSamples = {
  record: {
    text: "患者，女，67岁。诉头晕2小时，既往高血压病史10年，青霉素过敏。测血压168/96mmHg，心率88次/分，已协助卧床休息并继续观察。",
    summary: "已完成医疗记录结构化，发现血压升高与过敏史。",
    hint: "请核对生命体征、护理措施与记录时间后写入。",
    quality: 92,
    review: 1,
    entities: [
      ["symptom", "头晕"],
      ["history", "高血压"],
      ["allergy", "青霉素"],
      ["vital", "168/96mmHg"],
      ["vital", "心率88次/分"],
    ],
    output: {
      demographics: { sex: "女", age: 67 },
      symptom: "头晕2小时",
      history: ["高血压病史10年"],
      allergy: ["青霉素"],
      vitals: { blood_pressure: "168/96mmHg", heart_rate: "88次/分" },
      nursing_action: ["协助卧床休息", "继续观察"],
      human_review: true,
    },
  },
  medication: {
    text: "患者，男，42岁。既往头孢类药物严重过敏。本次记录拟使用头孢呋辛，请在执行前核对过敏史与医嘱。",
    summary: "检测到药物与过敏史潜在冲突，已进入安全拦截。",
    hint: "高风险结果：禁止自动写入，必须由临床人员核对。",
    quality: 96,
    review: 2,
    risk: true,
    entities: [
      ["allergy", "头孢类药物"],
      ["severity", "严重过敏"],
      ["medication", "头孢呋辛"],
      ["safety", "潜在冲突"],
    ],
    output: {
      allergy: ["头孢类药物", "严重"],
      proposed_medication: "头孢呋辛",
      conflict: true,
      safety_action: "BLOCK_AND_REVIEW",
      human_review: true,
    },
  },
  followup: {
    text: "患者糖尿病随访。近一周空腹血糖7.8至9.2mmol/L，偶有漏服二甲双胍。计划加强用药提醒，记录饮食并于两周后复查。",
    summary: "已提取随访趋势、依从性问题与复查计划。",
    hint: "当前结果用于整理随访信息，不生成诊疗建议。",
    quality: 89,
    review: 1,
    entities: [
      ["condition", "糖尿病"],
      ["lab", "空腹血糖7.8–9.2"],
      ["medication", "二甲双胍"],
      ["adherence", "偶有漏服"],
      ["follow-up", "两周后复查"],
    ],
    output: {
      condition: "糖尿病",
      glucose_range: "7.8-9.2mmol/L",
      medication: "二甲双胍",
      adherence_issue: "偶有漏服",
      follow_up: "两周后复查",
      human_review: true,
    },
  },
};

const medicalUi = {
  input: document.querySelector("#medicalInput"),
  run: document.querySelector("#runMedicalAI"),
  mic: document.querySelector("#startRoundMic"),
  micLabel: document.querySelector("#roundMicLabel"),
  micStatus: document.querySelector("#roundMicStatus"),
  voiceCapture: document.querySelector("#voiceCapture"),
  samples: [...document.querySelectorAll(".sample-btn")],
  steps: [...document.querySelectorAll("[data-medical-step]")],
  state: document.querySelector("#medicalState"),
  summary: document.querySelector("#medicalSummary"),
  hint: document.querySelector("#medicalHint"),
  entityCount: document.querySelector("#entityCount"),
  quality: document.querySelector("#qualityScore"),
  review: document.querySelector("#reviewCount"),
  board: document.querySelector("#entityBoard"),
  json: document.querySelector("#medicalJson"),
  targets: [...document.querySelectorAll(".output-target-btn")],
};

let activeMedicalSample = "record";
let activeOutputTarget = "护理记录单";
let medicalRunToken = 0;
let roundRecognition = null;
let roundMicActive = false;
let roundTranscriptBase = "";
let simulatedTranscriptTimer = 0;

function setRoundMicState(active, status) {
  roundMicActive = active;
  medicalUi.mic?.setAttribute("aria-pressed", String(active));
  medicalUi.voiceCapture?.classList.toggle("recording", active);
  if (medicalUi.micLabel) {
    medicalUi.micLabel.textContent = active ? "停止转写" : "开始查房转写";
  }
  if (medicalUi.micStatus) medicalUi.micStatus.textContent = status;
}

function stopRoundTranscription(status = "转写已停止 · 可继续整理") {
  window.clearInterval(simulatedTranscriptTimer);
  simulatedTranscriptTimer = 0;
  if (roundRecognition) {
    roundRecognition.onend = null;
    roundRecognition.stop();
    roundRecognition = null;
  }
  setRoundMicState(false, status);
}

function simulateRoundTranscription() {
  const text = medicalSamples[activeMedicalSample].text;
  let index = 0;
  if (medicalUi.input) medicalUi.input.value = "";
  setRoundMicState(true, "模拟实时转写中");
  simulatedTranscriptTimer = window.setInterval(() => {
    if (!medicalUi.input) return;
    index = Math.min(text.length, index + 2);
    medicalUi.input.value = text.slice(0, index);
    medicalUi.input.scrollTop = medicalUi.input.scrollHeight;
    if (index >= text.length) {
      window.clearInterval(simulatedTranscriptTimer);
      simulatedTranscriptTimer = 0;
      setRoundMicState(false, "模拟转写完成 · 可整理记录");
    }
  }, 42);
}

function startRoundTranscription() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    simulateRoundTranscription();
    return;
  }

  roundTranscriptBase = "";
  roundRecognition = new Recognition();
  roundRecognition.lang = "zh-CN";
  roundRecognition.continuous = true;
  roundRecognition.interimResults = true;

  roundRecognition.onstart = () => {
    if (medicalUi.input) medicalUi.input.value = "";
    setRoundMicState(true, "正在聆听查房语音 · 本页面不保存音频");
  };
  roundRecognition.onresult = (event) => {
    let interim = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript;
      if (event.results[index].isFinal) {
        roundTranscriptBase += transcript;
      } else {
        interim += transcript;
      }
    }
    if (medicalUi.input) {
      medicalUi.input.value = `${roundTranscriptBase}${interim}`;
      medicalUi.input.scrollTop = medicalUi.input.scrollHeight;
    }
  };
  roundRecognition.onerror = (event) => {
    roundRecognition = null;
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setRoundMicState(false, "未获得麦克风权限 · 可使用预设记录");
      return;
    }
    setRoundMicState(false, "语音识别暂不可用 · 已切换模拟演示");
    window.setTimeout(simulateRoundTranscription, 500);
  };
  roundRecognition.onend = () => {
    roundRecognition = null;
    if (roundMicActive) setRoundMicState(false, "转写已结束 · 可整理记录");
  };

  try {
    roundRecognition.start();
  } catch {
    roundRecognition = null;
    simulateRoundTranscription();
  }
}

function renderEntityChips(entities) {
  if (!medicalUi.board) return;
  medicalUi.board.replaceChildren();
  entities.forEach(([type, value], index) => {
    const chip = document.createElement("span");
    const label = document.createElement("em");
    chip.className = "entity-chip";
    chip.style.animationDelay = `${index * 70}ms`;
    label.textContent = type;
    chip.append(label, document.createTextNode(value));
    medicalUi.board.append(chip);
  });
}

function inferMedicalResult() {
  const selected = medicalSamples[activeMedicalSample];
  if (medicalUi.input?.value.trim() === selected.text) return selected;
  const text = medicalUi.input?.value || "";
  const entities = [];
  const add = (type, match) => {
    if (match) entities.push([type, match]);
  };
  add("allergy", text.match(/[\u4e00-\u9fa5]{2,8}过敏/)?.[0]);
  add("vital", text.match(/\d{2,3}\/\d{2,3}mmHg/i)?.[0]);
  add("lab", text.match(/\d+(?:\.\d+)?(?:至|-)\d+(?:\.\d+)?mmol\/L/i)?.[0]);
  add("time", text.match(/\d+(?:小时|分钟|天|周)/)?.[0]);
  const risk = /过敏/.test(text) && /(给予|使用|拟用|准备)/.test(text);
  return {
    summary: risk ? "检测到可能的用药与过敏信息冲突。" : "已完成自定义文本的基础结构化。",
    hint: risk ? "原型将该结果标记为必须人工复核。" : "自定义文本使用规则模拟，结果仅用于展示处理链路。",
    quality: Math.min(94, 72 + entities.length * 5),
    review: risk ? 2 : 1,
    risk,
    entities: entities.length ? entities : [["text", "未匹配到预设医学实体"]],
    output: {
      extracted_entities: Object.fromEntries(entities),
      risk_detected: risk,
      human_review: true,
    },
  };
}

function runMedicalAnalysis() {
  if (!medicalUi.run) return;
  if (roundMicActive) stopRoundTranscription();
  const token = ++medicalRunToken;
  const result = inferMedicalResult();
  medicalUi.run.classList.add("running");
  medicalUi.run.lastChild.textContent = " 分析中";
  medicalUi.steps.forEach((step) => step.classList.remove("active", "done"));
  medicalUi.state.className = "result-state";
  medicalUi.state.textContent = "RUNNING";
  medicalUi.summary.textContent = "正在整理查房语音转写";
  medicalUi.hint.textContent = "语音转写、实体识别、结构化整理与人工复核正在依次执行。";
  medicalUi.board.innerHTML = '<span class="empty-result">processing clinical text...</span>';

  medicalUi.steps.forEach((step, index) => {
    window.setTimeout(() => {
      if (token !== medicalRunToken) return;
      step.classList.add("active");
      if (index > 0) medicalUi.steps[index - 1].classList.add("done");
    }, 220 + index * 360);
  });

  window.setTimeout(() => {
    if (token !== medicalRunToken) return;
    medicalUi.steps.forEach((step) => step.classList.add("active", "done"));
    medicalUi.state.className = `result-state ${result.risk ? "risk" : "complete"}`;
    medicalUi.state.textContent = result.risk ? "REVIEW REQUIRED" : "COMPLETE";
    medicalUi.summary.textContent = result.risk
      ? result.summary
      : `已生成${activeOutputTarget}结构化草稿`;
    medicalUi.hint.textContent = result.risk
      ? result.hint
      : `${result.summary} ${result.hint}`;
    medicalUi.entityCount.textContent = String(result.entities.length);
    medicalUi.quality.textContent = `${result.quality}%`;
    medicalUi.review.textContent = String(result.review);
    renderEntityChips(result.entities);
    medicalUi.json.textContent = JSON.stringify(
      { output_target: activeOutputTarget, ...result.output },
      null,
      2,
    );
    medicalUi.run.classList.remove("running");
    medicalUi.run.lastChild.textContent = " 重新运行";
  }, 1700);
}

medicalUi.samples.forEach((button) => {
  button.addEventListener("click", () => {
    if (roundMicActive) stopRoundTranscription("已切换记录样例");
    activeMedicalSample = button.dataset.medicalSample;
    medicalUi.samples.forEach((item) => item.classList.toggle("active", item === button));
    medicalUi.input.value = medicalSamples[activeMedicalSample].text;
  });
});
medicalUi.mic?.addEventListener("click", () => {
  if (roundMicActive) {
    stopRoundTranscription();
  } else {
    startRoundTranscription();
  }
});
medicalUi.targets.forEach((button) => {
  button.addEventListener("click", () => {
    activeOutputTarget = button.dataset.outputTarget;
    medicalUi.targets.forEach((item) => item.classList.toggle("active", item === button));
  });
});
medicalUi.run?.addEventListener("click", runMedicalAnalysis);

const pdaSamples = {
  routine: "2分钟后为1床测血糖，结果记录后提醒30分钟复测。",
  risk: "3床患者青霉素过敏，准备给予阿莫西林，请核对后再执行。",
};

const pdaUi = {
  input: document.querySelector("#pdaInput"),
  run: document.querySelector("#runPdaAI"),
  samples: [...document.querySelectorAll(".pda-sample")],
  steps: [...document.querySelectorAll("[data-pda-step]")],
  state: document.querySelector("#pdaState"),
  title: document.querySelector("#pdaResultTitle"),
  bed: document.querySelector("#pdaBed"),
  task: document.querySelector("#pdaTask"),
  time: document.querySelector("#pdaTime"),
  reminder: document.querySelector("#pdaReminder"),
  safety: document.querySelector("#pdaSafety"),
  confirm: document.querySelector("#confirmPda"),
};

let pdaRunToken = 0;

function parsePdaInput() {
  const text = pdaUi.input?.value || "";
  const risk = /过敏/.test(text) && /(给予|使用|执行)/.test(text);
  return {
    risk,
    bed: text.match(/(\d+)床/)?.[1] ? `${text.match(/(\d+)床/)[1]}床` : "待确认",
    task: /血糖/.test(text)
      ? "测量并记录血糖"
      : risk
        ? "拟执行药物任务"
        : "护理任务待确认",
    time: text.match(/(\d+分钟后)/)?.[1] || "当前",
    reminder: text.match(/提醒(\d+分钟)/)?.[1] || (risk ? "人工核对后" : "未设置"),
  };
}

function runPdaAnalysis() {
  if (!pdaUi.run) return;
  const token = ++pdaRunToken;
  const result = parsePdaInput();
  pdaUi.run.classList.add("running");
  pdaUi.steps.forEach((step) => step.classList.remove("active", "done"));
  pdaUi.state.className = "result-state";
  pdaUi.state.textContent = "LISTENING";
  pdaUi.title.textContent = "正在解析护士口述";
  pdaUi.confirm.disabled = true;
  pdaUi.safety.className = "safety-message";
  pdaUi.safety.textContent = "正在执行实体抽取与安全检查。";

  pdaUi.steps.forEach((step, index) => {
    window.setTimeout(() => {
      if (token !== pdaRunToken) return;
      step.classList.add("active");
      if (index > 0) pdaUi.steps[index - 1].classList.add("done");
    }, 180 + index * 390);
  });

  window.setTimeout(() => {
    if (token !== pdaRunToken) return;
    pdaUi.steps.forEach((step) => step.classList.add("active", "done"));
    pdaUi.bed.textContent = result.bed;
    pdaUi.task.textContent = result.task;
    pdaUi.time.textContent = result.time;
    pdaUi.reminder.textContent = result.reminder;
    pdaUi.state.className = `result-state ${result.risk ? "risk" : "complete"}`;
    pdaUi.state.textContent = result.risk ? "BLOCKED" : "STRUCTURED";
    pdaUi.title.textContent = result.risk ? "发现潜在用药冲突" : "结构化护理任务已生成";
    pdaUi.safety.className = `safety-message${result.risk ? " risk" : ""}`;
    pdaUi.safety.textContent = result.risk
      ? "过敏信息与拟执行药物存在潜在冲突。系统阻止自动写入，要求护士与医生人工复核。"
      : "未发现预设冲突。仍需护士确认床位、任务和时间后才能进入待办。";
    pdaUi.confirm.disabled = result.risk;
    pdaUi.confirm.textContent = result.risk ? "已拦截 · 等待人工复核" : "人工确认并写入待办";
    pdaUi.run.classList.remove("running");
  }, 1800);
}

pdaUi.samples.forEach((button) => {
  button.addEventListener("click", () => {
    const sample = button.dataset.pdaSample;
    pdaUi.samples.forEach((item) => item.classList.toggle("active", item === button));
    pdaUi.input.value = pdaSamples[sample];
  });
});
pdaUi.run?.addEventListener("click", runPdaAnalysis);
pdaUi.confirm?.addEventListener("click", () => {
  pdaUi.state.className = "result-state complete";
  pdaUi.state.textContent = "CONFIRMED";
  pdaUi.title.textContent = "护理任务已进入待办队列";
  pdaUi.confirm.textContent = "已由护士确认";
  pdaUi.confirm.disabled = true;
});

const evalUi = {
  run: document.querySelector("#runEvalReport"),
  steps: [...document.querySelectorAll("[data-eval-step]")],
  rows: document.querySelector("#evalRows"),
  passRate: document.querySelector("#evalPassRate"),
  badCase: document.querySelector("#evalBadCase"),
  modules: document.querySelector("#evalModules"),
  state: document.querySelector("#evalState"),
  title: document.querySelector("#evalTitle"),
  summary: document.querySelector("#evalSummary"),
  list: document.querySelector("#evalReportList"),
};

let evalRunToken = 0;

function runEvalReport() {
  if (!evalUi.run) return;
  const token = ++evalRunToken;
  evalUi.run.classList.add("running");
  evalUi.steps.forEach((step) => step.classList.remove("active", "done"));
  evalUi.state.className = "result-state";
  evalUi.state.textContent = "ANALYSING";
  evalUi.title.textContent = "正在识别字段与规则";
  evalUi.summary.textContent = "模拟读取标注主表、规则文档与多 Sheet 数据，生成可复核的评测结果。";
  evalUi.rows.textContent = "--";
  evalUi.passRate.textContent = "--";
  evalUi.badCase.textContent = "--";
  evalUi.modules.textContent = "--";
  evalUi.list.innerHTML = `
    <li>字段映射：识别中</li>
    <li>结果分析：等待字段确认</li>
    <li>报告正文：等待生成</li>
  `;

  evalUi.steps.forEach((step, index) => {
    window.setTimeout(() => {
      if (token !== evalRunToken) return;
      step.classList.add("active");
      if (index > 0) evalUi.steps[index - 1].classList.add("done");
    }, 160 + index * 360);
  });

  window.setTimeout(() => {
    if (token !== evalRunToken) return;
    evalUi.steps.forEach((step) => step.classList.add("active", "done"));
    evalUi.rows.textContent = "4,820";
    evalUi.passRate.textContent = "91.6%";
    evalUi.badCase.textContent = "128";
    evalUi.modules.textContent = "5";
    evalUi.state.className = "result-state complete";
    evalUi.state.textContent = "REPORT READY";
    evalUi.title.textContent = "评测报告已生成";
    evalUi.summary.textContent = "已完成字段映射、规则对齐、错误类型统计与典型 Bad Case 提取，可导出 PDF、Word、Markdown 和结果表。";
    evalUi.list.innerHTML = `
      <li>字段映射：原始输出、标准答案、模型名称、评分结果</li>
      <li>Bad Case：术语错误、遗漏字段、格式异常、规则冲突</li>
      <li>报告模块：数据概况、指标表现、问题归因、样例分析、优化建议</li>
    `;
    evalUi.run.classList.remove("running");
  }, 1680);
}

evalUi.run?.addEventListener("click", runEvalReport);

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("pointermove", (event) => {
  mouse = { x: event.clientX, y: event.clientY };
  cursor.style.transform = `translate(${event.clientX - 110}px, ${event.clientY - 110}px)`;
});

window.addEventListener("load", () => {
  window.setTimeout(() => bootScreen.classList.add("done"), 850);
});

resizeCanvas();
drawSignals();
setupReveal();
setupTilt();
setupHeroParallax();
setupStoryRail();
setupSectionSignals();
updateScrollProgress();
