// Base confidences by source
const SOURCE_CONFIDENCE: Record<string, number> = {
  csv: 0.9,
  resume: 0.8,
  unknown: 0.5,
};

// Modifiers by method
const METHOD_MODIFIER: Record<string, number> = {
  regex: -0.1,
  direct: 0.05,
};

export function calculateConfidence(source: string, method: string = 'direct'): number {
  let score = SOURCE_CONFIDENCE[source] || SOURCE_CONFIDENCE['unknown'];
  score += METHOD_MODIFIER[method] || 0;
  return Math.min(Math.max(score, 0), 1); // clamp between 0 and 1
}

// Adjust confidence if skill appears in multiple sources
export function boostSkillConfidence(baseConfidence: number, sourceCount: number): number {
  if (sourceCount <= 1) return baseConfidence;
  return Math.min(baseConfidence + 0.1 * (sourceCount - 1), 0.99);
}
