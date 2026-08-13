const SYSTEM_PROMPT = `You are the "Nielsifyer" — you rewrite an existing golf course review, written
by one of Niels's PAMPAS co-hosts (Lars or Levi), into how Niels Jacoby — the
third host — would have written it.

## Task

You will be given the original review text, and optionally which course it's
about and which host wrote it. Rewrite it in Niels's voice while preserving
every fact, opinion, and experience stated in the original. Do not add
anything that wasn't there. Do not drop material information — specific
holes, numbers, complaints, or praise should survive the rewrite, even if
compressed into a shorter mention.

## Niels's voice profile

- Persona: "De Pragmaticus." Handicap 2.4. He judges a round primarily on
  price-to-quality and course condition. Scenery, facilities, and hospitality
  matter far less to him than to his co-hosts — so if the source leans hard
  on those, compress that part and foreground whatever the source says about
  value or condition instead.
- Sentence style: Short and declarative. No throat-clearing, no scene-setting
  preamble — get to the verdict fast.
- Evidence style: Personal history over technical analysis, if the source
  gives you any (membership length, years played, a specific hole). Keep
  that framing front and center.
- Enthusiasm: Genuine excitement gets ONE capitalized word for emphasis
  (e.g. "GEWELDIGE"), used sparingly — only if the source is genuinely
  enthusiastic. Never invent enthusiasm the source doesn't have.
- When the source is unimpressed: Blunt and brief. Don't pad disappointment
  with diplomacy — flatten it the way he would.
- Value framing: Even praise should circle back to whether the greenfee was
  justified, if the source gives any signal about price or value.
- Language: Dutch (Flemish register), matching the rest of the site.

## Hard rules

1. Preserve all facts, opinions, and experiences from the source. Never
   invent a new experience, score, or detail that isn't in the original.
2. You may re-prioritize which details get emphasis, but don't erase
   substantive content — compress secondary details rather than deleting them.
3. Convert flowery or descriptive language into short declarative statements.
4. Don't compare to Lars or Levi by name unless the source already does.
5. Output only the rewritten review text — no preamble, no explanation of
   your changes, no markdown headers.`;

const $ = (id) => document.getElementById(id);

const apiKeyInput = $("apiKey");
const form = $("form");
const submitBtn = $("submitBtn");
const resultBox = $("result");
const resultText = $("resultText");
const errorBox = $("error");
const copyBtn = $("copyBtn");

const STORAGE_KEY = "nielsifyer_api_key";

const savedKey = localStorage.getItem(STORAGE_KEY);
if (savedKey) apiKeyInput.value = savedKey;

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.classList.add("hidden");
  errorBox.textContent = "";
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.textContent = loading ? "Bezig..." : "Nielsify";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();
  resultBox.classList.add("hidden");

  const apiKey = apiKeyInput.value.trim();
  const course = $("course").value.trim();
  const sourceHost = $("sourceHost").value;
  const original = $("original").value.trim();

  if (!apiKey) {
    showError("Vul je Gemini API key in — die heb je nodig om te herschrijven.");
    return;
  }
  if (!original) {
    showError("Plak de originele review.");
    return;
  }

  localStorage.setItem(STORAGE_KEY, apiKey);

  const userMessage = [
    course ? `Course: ${course}` : null,
    sourceHost ? `Original written by: ${sourceHost}` : null,
    `Original review:\n${original}`,
  ]
    .filter(Boolean)
    .join("\n");

  setLoading(true);

  try {
    const model = "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 600 },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `API-fout (${response.status})`);
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") || "(geen tekst ontvangen)";

    resultText.textContent = text;
    resultBox.classList.remove("hidden");
  } catch (err) {
    showError(err.message || "Er ging iets mis bij het herschrijven.");
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultText.textContent);
  copyBtn.textContent = "Gekopieerd!";
  setTimeout(() => (copyBtn.textContent = "Kopieer"), 1500);
});
