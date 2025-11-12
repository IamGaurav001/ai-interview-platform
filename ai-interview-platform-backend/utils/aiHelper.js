// utils/aiHelper.js
export const parseFeedbackSafely = (text = "") => {
  if (!text || typeof text !== "string") {
    return { parsingFailed: true, raw: text || "" };
  }

  const original = text.trim();

  // Remove code fences and markdown
  let cleaned = original.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1").trim();

  // Find JSON substring
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    const jsonText = cleaned.substring(jsonStart, jsonEnd + 1);
    try {
      const parsed = JSON.parse(jsonText);
      ["correctness", "clarity", "confidence"].forEach((k) => {
        if (parsed[k] !== undefined) parsed[k] = Number(parsed[k]);
      });
      parsed.parsingFailed = false;
      return parsed;
    } catch (e) {
      // Fall through to heuristics
    }
  }

  // Fallback: Extract numeric scores heuristically
  const nums = cleaned.match(/(\d+(?:\.\d+)?)/g) || [];
  const fb = {
    correctness: Number(nums[0]) || 0,
    clarity: Number(nums[1]) || 0,
    confidence: Number(nums[2]) || 0,
    overall_feedback:
      cleaned.slice(0, 300) || "Could not parse structured feedback",
    parsingFailed: true,
    raw: original,
  };

  return fb;
};

export const calculateSafeScore = (fb) => {
  const nums = [fb.correctness, fb.clarity, fb.confidence]
    .filter(n => typeof n === "number" && !isNaN(n) && n >= 0 && n <= 10)
    .map(n => Math.min(10, Math.max(0, n))); // Clamp 0-10
  
  if (!nums.length) return 0;
  
  let avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  
  avg = avg * 0.85;
  
  return Number(Math.max(0, avg).toFixed(2));
};
