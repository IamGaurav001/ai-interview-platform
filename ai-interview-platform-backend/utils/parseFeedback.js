// utils/parseFeedback.js
export function parseFeedbackSafely(text) {
  if (!text || typeof text !== "string") {
    return { parsingFailed: true, raw: text || "" };
  }

  const original = text;

  // 1) Remove common wrappers (markdown fences, triple backticks, leading commentary)
  // Remove ```json ... ``` or ``` ... ```
  let cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/i, "$1");

  // Remove single backtick quoted code blocks `...`
  cleaned = cleaned.replace(/`([^`]*)`/g, "$1");

  // Remove lines that look like an instruction block (heuristic)
  // e.g. lines that start with "You are" or "Please provide" etc. Keep rest.
  const lines = cleaned.split("\n").map(l => l.trim());
  const usefulLines = lines.filter(l => {
    if (!l) return false;
    const lower = l.toLowerCase();
    if (lower.startsWith("you are")) return false;
    if (lower.startsWith("please provide")) return false;
    if (lower.startsWith("once you")) return false;
    if (lower.startsWith("the job description")) return false;
    return true;
  });
  cleaned = usefulLines.join(" ").trim();

  // 2) Try to find a JSON substring
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    const jsonText = cleaned.substring(jsonStart, jsonEnd + 1);
    try {
      const parsed = JSON.parse(jsonText);
      // ensure numeric fields are numbers
      const correctness = Number(parsed.correctness);
      const clarity = Number(parsed.clarity);
      const confidence = Number(parsed.confidence);
      return {
        correctness: isFinite(correctness) ? correctness : undefined,
        clarity: isFinite(clarity) ? clarity : undefined,
        confidence: isFinite(confidence) ? confidence : undefined,
        overall_feedback: parsed.overall_feedback || parsed.overallFeedback || parsed.feedback || "",
        parsingFailed: false,
        raw: original
      };
    } catch (e) {
      // continue to heuristic extraction
    }
  }

  // 3) Heuristic extraction of numeric fields if JSON not available
  const numRegex = /("?)?(correctness|clarity|confidence)("?)\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/ig;
  const found = {};
  let m;
  while ((m = numRegex.exec(cleaned)) !== null) {
    const key = m[2].toLowerCase();
    const val = Number(m[4]);
    if (isFinite(val)) found[key] = val;
  }

  // Also try to pick the first short sentence/line as overall_feedback
  const sentences = cleaned.split(/[\.\n]+/).map(s => s.trim()).filter(Boolean);
  const overall = sentences.length ? sentences[0] : "";

  const result = {
    correctness: found.correctness,
    clarity: found.clarity,
    confidence: found.confidence,
    overall_feedback: overall,
    parsingFailed: !(found.correctness || found.clarity || found.confidence),
    raw: original
  };

  return result;
}
