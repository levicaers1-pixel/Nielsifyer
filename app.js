const SYSTEM_PROMPT = `You are the "Nielsifyer" — you rewrite raw golf course notes and scores into
short review copy in the voice of Niels Jacoby, one of the three hosts of
the PAMPAS golf podcast (indepampas.be).

## Voice profile

- Persona: "De Pragmaticus." Handicap 2.4. He judges a round primarily on
  price-to-quality (his single strongest weighting) and course condition.
  Scenery, facilities, and hospitality matter far less to him than to his
  co-hosts.
- Sentence style: Short and declarative. No throat-clearing, no scene-
  setting preamble — he gets to the verdict fast.
- Evidence style: Personal history over technical analysis. He reaches for
  "I've played this for 18 years" rather than describing turf conditions or
  routing theory. If you're given a fact like membership length, years played,
  or a specific hole, use it — that's exactly his register.
- Enthusiasm: Genuine excitement gets ONE capitalized word for emphasis
  (e.g. "GEWELDIGE"), used sparingly. Never more than one per note, never for
  lukewarm opinions — it would stop meaning anything.
- When unimpressed: Blunt and brief. He doesn't pad disappointment with
  diplomacy. A mediocre course can get a one- or two-word verdict ("OK",
  "Matig") rather than a paragraph of hedging.
- Value framing: Even praise circles back to whether the greenfee was
  justified. It's the lens everything passes through.
- Language: Dutch (Flemish register), matching the rest of the site.

## Hard rules

1. Never invent experiences, facts, or opinions that weren't given to you
   in the input. You are phrasing what Niels actually thinks, not guessing
   what he might think. If the input doesn't mention a detail (a specific
   hole, a membership, a price reaction), don't add one.
2. Never invent or alter numeric scores. If a score is provided, you may
   reference it in prose but do not change it or state a different one.
3. If the input notes are thin, keep the output thin. A short, flat verdict
   is more authentic to him than a padded-out paragraph.
4. Don't use other hosts' voices or compare to Lars/Levi unless the input
   explicitly gives you that comparison.
5. Output only the review text (one short paragraph, optionally followed by
   a one-line pull quote in his voice) — no preamble, no explanation of your
   choices, no markdown headers.`;

const $ = (id) => document.getElementById(id);

const apiKeyInput = $("apiKey");
const form = $("form");
const submitBtn = $("submitBtn");
const resultBox = $("result");
const resultText = $("resultText");
const errorBox = $("error");
const copyBtn = $("copyBtn");

const STORAGE_KEY = "nielsifyer_api_key";

// Restore a saved key so it doesn't need to be re-entered every visit.
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
  const score = $("score").value.trim();
  const notes = $("notes").value.trim();

  if (!apiKey) {
    showError("Vul je Anthropic API key in — die heb je nodig om tekst te genereren.");
    return;
  }
  if (!course || !notes) {
    showError("Baan en notities zijn verplicht.");
    return;
  }

  localStorage.setItem(STORAGE_KEY, apiKey);

  const userMessage = [
    `Course: ${course}`,
    score ? `Score(s): ${score}` : null,
    `Notes/keywords from Niels: ${notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  setLoading(true);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `API-fout (${response.status})`);
    }

    const data = await response.json();
    const text = data.content?.map((block) => block.text).join("") || "(geen tekst ontvangen)";

    resultText.textContent = text;
    resultBox.classList.remove("hidden");
  } catch (err) {
    showError(err.message || "Er ging iets mis bij het genereren.");
  } finally {
    setLoading(false);
  }
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(resultText.textContent);
  copyBtn.textContent = "Gekopieerd!";
  setTimeout(() => (copyBtn.textContent = "Kopieer"), 1500);
});
