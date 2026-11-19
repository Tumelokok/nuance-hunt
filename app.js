const STORAGE_KEY = "nuance-hunt:evaluations:v1";
const form = document.querySelector("#evaluation-form");
const savedList = document.querySelector("#saved-list");
const savedCount = document.querySelector("#saved-count");
const formMessage = document.querySelector("#form-message");

let evaluations = loadEvaluations();
renderEvaluations();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const blankRequired = [...form.querySelectorAll("[required]")].find((field) => clean(field.value) === "");
  if (blankRequired) {
    formMessage.textContent = "Please fill in each required field with more than spaces.";
    blankRequired.focus();
    return;
  }
  const values = Object.fromEntries(new FormData(form).entries());
  const comparison = buildEvaluation(values);
  evaluations.unshift(comparison);
  const persisted = persist();
  renderEvaluations();
  form.reset();
  formMessage.textContent = persisted
    ? "Saved in this browser. Nothing was uploaded."
    : "This browser could not save the card. Export it before closing this page.";
  document.querySelector("#task-title").focus();
});

document.querySelector("#clear-form").addEventListener("click", () => {
  form.reset();
  formMessage.textContent = "Form cleared.";
  document.querySelector("#task-title").focus();
});

document.querySelector("#export-all").addEventListener("click", () => {
  if (evaluations.length === 0) {
    formMessage.textContent = "Add a comparison before exporting.";
    return;
  }
  downloadJson({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    notice: "Review for personal or confidential information before sharing.",
    evaluations,
  }, "nuance-hunt-evaluations.json");
});

document.querySelector("#delete-all").addEventListener("click", () => {
  if (evaluations.length === 0) return;
  if (!window.confirm("Delete all comparisons saved in this browser? This cannot be undone.")) return;
  evaluations = [];
  const persisted = persist();
  renderEvaluations();
  formMessage.textContent = persisted
    ? "Saved comparisons deleted from this browser."
    : "Comparisons were removed from this page, but browser storage could not be updated.";
});

function buildEvaluation(values) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `eval-${Date.now()}`,
    createdAt: new Date().toISOString(),
    task: compactObject({
      title: clean(values.taskTitle),
      type: clean(values.taskType),
      promptRelationship: clean(values.promptRelationship),
      promptNote: clean(values.promptNote),
      languageVariety: clean(values.reviewVariety),
      evidenceUrl: clean(values.evidence),
      reviewerNote: clean(values.reviewNote),
    }),
    pair: [
      compactObject({
        language: clean(values.languageA),
        prompt: clean(values.promptA),
        model: clean(values.modelA),
        generationSettings: clean(values.settingsA),
        response: clean(values.responseA),
        ratings: {
          meaningPreserved: rating(values.meaningA),
          factualAccuracy: rating(values.accuracyA),
          naturalness: rating(values.naturalnessA),
        },
      }),
      compactObject({
        language: clean(values.languageB),
        prompt: clean(values.promptB),
        model: clean(values.modelB),
        generationSettings: clean(values.settingsB),
        response: clean(values.responseB),
        ratings: {
          meaningPreserved: rating(values.meaningB),
          factualAccuracy: rating(values.accuracyB),
          naturalness: rating(values.naturalnessB),
        },
      }),
    ],
  };
}

function rating(value) {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== ""));
}

function loadEvaluations() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter(isEvaluation) : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
    return true;
  } catch {
    return false;
  }
}

function isEvaluation(value) {
  return value && typeof value === "object" && typeof value.id === "string" && Array.isArray(value.pair) && value.pair.length === 2;
}

function renderEvaluations() {
  savedCount.textContent = String(evaluations.length);
  savedList.replaceChildren();
  if (evaluations.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No comparisons yet. Your first saved card will appear here.";
    savedList.append(empty);
    return;
  }

  for (const evaluation of evaluations) savedList.append(renderEvaluation(evaluation));
}

function renderEvaluation(evaluation) {
  const article = document.createElement("article");
  article.className = "saved-card";

  const head = document.createElement("div");
  head.className = "saved-card-head";
  const title = document.createElement("h3");
  title.textContent = evaluation.task.title;
  const deleteButton = document.createElement("button");
  deleteButton.className = "text-action delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete comparison: ${evaluation.task.title}`);
  deleteButton.addEventListener("click", () => deleteEvaluation(evaluation.id));
  head.append(title, deleteButton);

  const meta = document.createElement("p");
  meta.className = "saved-card-meta";
  const date = new Date(evaluation.createdAt);
  meta.textContent = `${evaluation.task.type.replaceAll("-", " ")} · ${date.toLocaleDateString()}`;

  const pair = document.createElement("div");
  pair.className = "saved-card-pair";
  for (const side of evaluation.pair) {
    const language = document.createElement("div");
    language.className = "saved-language";
    const label = document.createElement("strong");
    label.textContent = `${side.language} · ${side.model}${side.generationSettings ? ` · ${side.generationSettings}` : ""}`;
    const response = document.createElement("p");
    response.textContent = side.response;
    const review = document.createElement("small");
    review.className = "saved-review";
    review.textContent = `Meaning ${ratingLabel(side.ratings.meaningPreserved)} · Accuracy ${ratingLabel(side.ratings.factualAccuracy)} · Naturalness ${ratingLabel(side.ratings.naturalness)}`;
    language.append(label, response, review);
    pair.append(language);
  }

  const actions = document.createElement("div");
  actions.className = "saved-card-actions";
  const exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "text-action";
  exportButton.textContent = "Export this card";
  exportButton.addEventListener("click", () => downloadJson({ schemaVersion: 1, evaluations: [evaluation] }, `nuance-hunt-${safeFilename(evaluation.task.title)}.json`));

  const ratings = document.createElement("span");
  ratings.className = "saved-card-meta";
  ratings.textContent = `Ratings recorded: ${evaluation.pair.reduce((count, side) => count + Object.values(side.ratings).filter((item) => item !== null).length, 0)} / 6`;
  actions.append(ratings, exportButton);

  article.append(head, meta, pair, actions);
  return article;
}

function deleteEvaluation(id) {
  evaluations = evaluations.filter((evaluation) => evaluation.id !== id);
  const persisted = persist();
  renderEvaluations();
  formMessage.textContent = persisted
    ? "Comparison deleted from this browser."
    : "Comparison removed from this page, but browser storage could not be updated.";
}

function downloadJson(value, filename) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "comparison";
}

function ratingLabel(value) {
  return value === null ? "—" : `${value}/5`;
}
