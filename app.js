// Purely local text assembly — no network calls, no AI. Every sentence is
// either a fixed pattern derived from Niels's real quotes, or text the user
// typed in verbatim. Nothing is invented.

const PRICE_PHRASES = {
  great: "Wat je betaalt tegenover wat je krijgt, klopt hier volledig.",
  fair: "De greenfee is niet goedkoop, maar wel eerlijk voor wat je ervoor terugkrijgt.",
  expensive: "Voor die prijs verwacht je meer terug.",
};

const DEFAULT_VERDICT_WORD = {
  gemiddeld: "OK",
  laag: "Matig",
};

function trimSentence(text) {
  const t = text.trim();
  if (!t) return "";
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function generateReview({ course, score, enthusiasm, capsWord, price, personal, detail, verdictWord }) {
  const sentences = [];

  if (enthusiasm === "gemiddeld" || enthusiasm === "laag") {
    const word = (verdictWord && verdictWord.trim()) || DEFAULT_VERDICT_WORD[enthusiasm];
    sentences.push(`${word}.`);
    sentences.push(PRICE_PHRASES[price]);
    if (personal) sentences.push(trimSentence(personal));
    if (detail) sentences.push(trimSentence(detail));
  } else if (enthusiasm === "hoog") {
    if (capsWord && capsWord.trim()) {
      sentences.push(`${course} is door de jaren heen een ${capsWord.trim().toUpperCase()} baan geworden.`);
    } else {
      sentences.push(`${course} is voor Niels een van de sterkere banen op de lijst.`);
    }
    if (personal) sentences.push(trimSentence(personal));
    if (detail) sentences.push(trimSentence(detail));
    sentences.push(PRICE_PHRASES[price]);
  } else {
    // positief
    sentences.push(`${course} kan op flink wat waardering van Niels rekenen.`);
    if (personal) sentences.push(trimSentence(personal));
    if (detail) sentences.push(trimSentence(detail));
    sentences.push(PRICE_PHRASES[price]);
  }

  let output = sentences.filter(Boolean).join(" ");
  if (score && score.trim()) {
    output += `\n\nScore: ${score.trim()}`;
  }
  return output;
}

const $ = (id) => document.getElementById(id);

const form = $("form");
const submitBtn = $("submitBtn");
const resultBox = $("result");
const resultText = $("resultText");
const errorBox = $("error");
const copyBtn = $("copyBtn");
const enthusiasmSelect = $("enthusiasm");
const capsWordField = $("capsWordField");
const verdictWordField = $("verdictWordField");

function updateConditionalFields() {
  const value = enthusiasmSelect.value;
  capsWordField.classList.toggle("hidden", value !== "hoog");
  verdictWordField.classList.toggle("hidden", value !== "gemiddeld" && value !== "laag");
}

enthusiasmSelect.addEventListener("change", updateConditionalFields);
updateConditionalFields();

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearError();
  resultBox.classList.add("hidden");

  const course = $("course").value.trim();
  const score = $("score").value.trim();
  const enthusiasm = enthusiasmSelect.value;
  const capsWord = $("capsWord").value.trim();
  const price = $("price").value;
  const personal = $("personal").value.trim();
  const detail = $("detail").value.trim();
  const verdictWord = $("verdictWord").value.trim();

  if (!course) {
    showError("Vul een baan in.");
    return;
  }
  if (!enthusiasm) {
    showError("Kies een niveau van enthousiasme.");
    return;
  }
  if (!price) {
    showError("Kies een prijs-kwaliteit oordeel.");
    return;
  }

  const text = generateReview({ course, score, enthusiasm, capsWord, price, personal, detail, verdictWord });
  resultText.textContent = text;
  resultBox.classList.remove("hidden");
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultText.textContent);
  copyBtn.textContent = "Gekopieerd!";
  setTimeout(() => (copyBtn.textContent = "Kopieer"), 1500);
});
