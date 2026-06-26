const students = [
  {
    name: "张晨",
    state: "present",
    label: "已到岗",
    detail: "院区内到岗",
    update: "07:42",
    monthRisk: 0,
  },
  {
    name: "李思雨",
    state: "risk",
    label: "未到岗异常",
    detail: "应上班，已超过1小时",
    update: "10:12",
    monthRisk: 2,
  },
  {
    name: "周子涵",
    state: "night",
    label: "下夜班",
    detail: "由排班自动判断",
    update: "08:05",
    monthRisk: 0,
  },
  {
    name: "王嘉宁",
    state: "risk",
    label: "排班异常",
    detail: "今日无排班数据",
    update: "09:30",
    monthRisk: 3,
  },
  {
    name: "陈一诺",
    state: "present",
    label: "已到岗",
    detail: "院区内到岗",
    update: "07:51",
    monthRisk: 1,
  },
  {
    name: "赵明远",
    state: "leave",
    label: "请假/调休",
    detail: "学生自报",
    update: "06:55",
    monthRisk: 1,
  },
  {
    name: "孙可",
    state: "present",
    label: "已到岗",
    detail: "院区内到岗",
    update: "07:58",
    monthRisk: 0,
  },
  {
    name: "何予安",
    state: "night",
    label: "下夜班",
    detail: "由排班自动判断",
    update: "08:11",
    monthRisk: 0,
  },
  {
    name: "林亦然",
    state: "risk",
    label: "未到岗异常",
    detail: "应上班，已超过1小时",
    update: "10:12",
    monthRisk: 2,
  },
];

const els = {
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  chips: document.querySelectorAll(".chip"),
  studentList: document.querySelector("#studentList"),
  toast: document.querySelector("#toast"),
  refreshBtn: document.querySelector("#refreshBtn"),
  notifyBtn: document.querySelector("#notifyBtn"),
  summaryBtn: document.querySelector("#summaryBtn"),
  summaryBox: document.querySelector("#summaryBox"),
  scheduleFile: document.querySelector("#scheduleFile"),
  fileName: document.querySelector("#fileName"),
  scanBtn: document.querySelector("#scanBtn"),
  scheduleResult: document.querySelector("#scheduleResult"),
  confirmScheduleBtn: document.querySelector("#confirmScheduleBtn"),
  toggleGeoBtn: document.querySelector("#toggleGeoBtn"),
  checkInBtn: document.querySelector("#checkInBtn"),
  geoTag: document.querySelector("#geoTag"),
  locationCard: document.querySelector("#locationCard"),
  locationTitle: document.querySelector("#locationTitle"),
  studentStatusTitle: document.querySelector("#studentStatusTitle"),
  studentStatusPill: document.querySelector("#studentStatusPill"),
};

let currentFilter = "all";
let inHospital = false;
let scanToken = 0;

function showToast(text) {
  els.toast.textContent = text;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("visible");
  }, 2500);
}

function statusClass(state) {
  if (state === "present") return "present";
  if (state === "night") return "night";
  if (state === "risk") return "danger";
  return "neutral";
}

function shouldShow(student) {
  if (currentFilter === "all") return true;
  if (currentFilter === "risk") return student.state === "risk";
  if (currentFilter === "night") return student.state === "night";
  if (currentFilter === "present") return student.state === "present";
  return true;
}

function renderStudents() {
  els.studentList.innerHTML = students
    .filter(shouldShow)
    .map(
      (student) => `
        <article class="student-card">
          <div class="student-main">
            <strong>${student.name}</strong>
            <span>${student.detail}</span>
          </div>
          <div class="student-meta">
            <span class="status-pill ${statusClass(student.state)}">${student.label}</span>
            <div>${student.update} 更新</div>
          </div>
        </article>
      `,
    )
    .join("");
}

function setRole(role) {
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.role === role));
  els.views.forEach((view) => {
    const isTeacher = role === "teacher" && view.id === "teacherView";
    const isStudent = role === "student" && view.id === "studentView";
    view.classList.toggle("active", isTeacher || isStudent);
  });
}

function updateGeoState(nextState) {
  inHospital = nextState;
  els.geoTag.textContent = inHospital ? "院区内" : "院区外";
  els.locationCard.classList.toggle("in", inHospital);
  els.locationTitle.textContent = inHospital
    ? "当前位置在院区范围内"
    : "当前位置未在院区范围内";
  els.toggleGeoBtn.textContent = inHospital ? "离开院区" : "进入院区";
  els.checkInBtn.disabled = !inHospital;
  els.checkInBtn.classList.toggle("disabled", !inHospital);
}

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setRole(tab.dataset.role));
});

els.chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    currentFilter = chip.dataset.filter;
    els.chips.forEach((item) => item.classList.toggle("active", item === chip));
    renderStudents();
  });
});

els.refreshBtn.addEventListener("click", () => {
  showToast("今日状态已刷新，3名学生仍需跟进。");
});

els.notifyBtn.addEventListener("click", () => {
  showToast("未到岗提醒已同时发送给学生和指导老师。");
});

els.summaryBtn.addEventListener("click", () => {
  els.summaryBox.innerHTML = `
    <p>本月未确认到岗集中在两类：排班未上传、应上班超时未到岗。建议优先提升排班上传确认率。</p>
    <dl>
      <div><dt>涉及学生</dt><dd>6 人</dd></div>
      <div><dt>提醒次数</dt><dd>9 次</dd></div>
    </dl>
  `;
  showToast("已生成本月未确认到岗总结。");
});

els.scheduleFile.addEventListener("change", () => {
  const file = els.scheduleFile.files[0];
  els.fileName.textContent = file ? file.name : "上传本周排班照片";
});

els.scanBtn.addEventListener("click", () => {
  const token = ++scanToken;
  const steps = [...document.querySelectorAll("[data-ocr-step]")];
  els.scanBtn.disabled = true;
  els.scanBtn.textContent = "AI识别中…";
  els.scheduleResult.classList.remove("visible");
  document.querySelector("#ocrPipeline").classList.add("visible");
  steps.forEach((step) => step.classList.remove("active", "done"));

  steps.forEach((step, index) => {
    window.setTimeout(() => {
      if (token !== scanToken) return;
      step.classList.add("active");
      if (index > 0) steps[index - 1].classList.add("done");
    }, 180 + index * 360);
  });

  window.setTimeout(() => {
    if (token !== scanToken) return;
    steps.forEach((step) => step.classList.add("active", "done"));
    els.scheduleResult.classList.add("visible");
    els.scanBtn.disabled = false;
    els.scanBtn.textContent = "重新识别";
    showToast("识别完成：4个班次，1项需人工确认。");
  }, 1650);
});

els.confirmScheduleBtn.addEventListener("click", () => {
  showToast("排班已确认，老师端将按排班判断应到岗和下夜班。");
});

els.toggleGeoBtn.addEventListener("click", () => {
  updateGeoState(!inHospital);
});

els.checkInBtn.addEventListener("click", () => {
  if (!inHospital) return;
  els.studentStatusTitle.textContent = "已完成到岗";
  els.studentStatusPill.textContent = "已到岗";
  els.studentStatusPill.className = "status-pill present";
  showToast("到岗成功，仅保存本次院区内确认结果。");
});

document.querySelectorAll("[data-student-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.studentAction;
    if (action === "reset") {
      els.studentStatusTitle.textContent = "今日应上班";
      els.studentStatusPill.textContent = "未到岗异常";
      els.studentStatusPill.className = "status-pill danger";
      updateGeoState(false);
      showToast("已重置学生端演示状态。");
      return;
    }

    els.studentStatusTitle.textContent = action === "leave" ? "今日请假" : "今日调休";
    els.studentStatusPill.textContent = "请假/调休";
    els.studentStatusPill.className = "status-pill neutral";
    showToast("已提交学生自报状态。");
  });
});

renderStudents();
updateGeoState(false);
