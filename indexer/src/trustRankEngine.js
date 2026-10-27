// ==============================================================================
// SOLHIRE: TRUSTRANK ENGINE & AGENT ORCHESTRATION ARCHITECTURE
// Mathematical models, confidence weighting, low-sample priors, and scoring formulas
// ==============================================================================

/**
 * TrustRank Ranking Dimensions (Total = 1.00 / 100%)
 */
const TRUSTRANK_CONFIG = {
  version: "1.0.0",
  weights: {
    quality: 0.35,           // 35% - Accuracy, schema conformity, test suite pass rate
    reliability: 0.25,       // 25% - Success rate, timeout rate, failure attribution
    efficiency: 0.15,        // 15% - Actual vs expected duration, rework frequency
    costEfficiency: 0.15,    // 15% - Budget utilization, unspent budget refunded
    verifiedFeedback: 0.10   // 10% - Non-self reviewer scores from settled tasks
  },
  confidence: {
    priorScore: 65.0,        // Neutral prior score for zero/low-evidence entities
    threshold: 10,           // Number of eligible verified tasks to reach 100% confidence
    minEligibleTasks: 3      // Minimum verified tasks before granting public tier (else 'Unrated')
  },
  tiers: [
    { name: "Platinum", minScore: 90.0, color: "#00F0FF", badge: "PLATINUM TIER" },
    { name: "Gold",     minScore: 80.0, color: "#14F195", badge: "GOLD TIER" },
    { name: "Silver",   minScore: 70.0, color: "#9945FF", badge: "SILVER TIER" },
    { name: "Bronze",   minScore: 60.0, color: "#FF9F43", badge: "BRONZE TIER" },
    { name: "Unrated",  minScore: 0.0,  color: "#94A3B8", badge: "INSUFFICIENT DATA" }
  ]
};

/**
 * Clamp a number between min and max
 */
function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Validate that weights sum to exactly 1.0 (with floating point tolerance)
 */
function validateWeights(weights = TRUSTRANK_CONFIG.weights) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.0001;
}

/**
 * Calculate Base TrustRank before confidence shrinkage
 * TrustRankBase = 0.35*Q + 0.25*R + 0.15*E + 0.15*C + 0.10*F
 */
function calculateBaseTrustRank(scores, weights = TRUSTRANK_CONFIG.weights) {
  const q = clamp(scores.quality ?? TRUSTRANK_CONFIG.confidence.priorScore);
  const r = clamp(scores.reliability ?? TRUSTRANK_CONFIG.confidence.priorScore);
  const e = clamp(scores.efficiency ?? TRUSTRANK_CONFIG.confidence.priorScore);
  const c = clamp(scores.costEfficiency ?? TRUSTRANK_CONFIG.confidence.priorScore);
  const f = clamp(scores.verifiedFeedback ?? TRUSTRANK_CONFIG.confidence.priorScore);

  const base = (
    weights.quality * q +
    weights.reliability * r +
    weights.efficiency * e +
    weights.costEfficiency * c +
    weights.verifiedFeedback * f
  );

  return parseFloat(base.toFixed(2));
}

/**
 * Calculate Confidence Level based on verified eligible evidence count
 * Confidence = min(1.0, eligibleTasks / threshold)
 */
function calculateConfidence(eligibleCount, threshold = TRUSTRANK_CONFIG.confidence.threshold) {
  if (!eligibleCount || eligibleCount <= 0) return 0.0;
  return parseFloat(Math.min(1.0, eligibleCount / threshold).toFixed(3));
}

/**
 * Calculate Adjusted TrustRank with Bayesian shrinkage towards prior
 * Adjusted = Confidence * Base + (1 - Confidence) * Prior
 */
function calculateAdjustedTrustRank(baseScore, confidence, prior = TRUSTRANK_CONFIG.confidence.priorScore) {
  const adjusted = (confidence * baseScore) + ((1.0 - confidence) * prior);
  return parseFloat(adjusted.toFixed(2));
}

/**
 * Determine Ranking Tier from Adjusted Score & Evidence Eligibility
 */
function determineTier(adjustedScore, eligibleCount, minEligible = TRUSTRANK_CONFIG.confidence.minEligibleTasks) {
  if (eligibleCount < minEligible) {
    return TRUSTRANK_CONFIG.tiers.find(t => t.name === "Unrated");
  }
  for (const tier of TRUSTRANK_CONFIG.tiers) {
    if (adjustedScore >= tier.minScore) {
      return tier;
    }
  }
  return TRUSTRANK_CONFIG.tiers[TRUSTRANK_CONFIG.tiers.length - 1];
}

/**
 * Compute Complete TrustRank Profile
 */
function evaluateTrustRank(scores, eligibleTasks = 0, options = {}) {
  const weights = options.weights || TRUSTRANK_CONFIG.weights;
  const prior = options.prior ?? TRUSTRANK_CONFIG.confidence.priorScore;
  const threshold = options.threshold || TRUSTRANK_CONFIG.confidence.threshold;
  const minEligible = options.minEligible ?? TRUSTRANK_CONFIG.confidence.minEligibleTasks;

  if (!validateWeights(weights)) {
    throw new Error("Invalid TrustRank weights: sum must equal 1.00");
  }

  const baseScore = calculateBaseTrustRank(scores, weights);
  const confidence = calculateConfidence(eligibleTasks, threshold);
  const adjustedScore = calculateAdjustedTrustRank(baseScore, confidence, prior);
  const tier = determineTier(adjustedScore, eligibleTasks, minEligible);

  return {
    version: TRUSTRANK_CONFIG.version,
    baseScore,
    confidence,
    adjustedScore,
    eligibleTasks,
    tier: tier.name,
    tierBadge: tier.badge,
    tierColor: tier.color,
    componentScores: {
      quality: clamp(scores.quality ?? prior),
      reliability: clamp(scores.reliability ?? prior),
      efficiency: clamp(scores.efficiency ?? prior),
      costEfficiency: clamp(scores.costEfficiency ?? prior),
      verifiedFeedback: clamp(scores.verifiedFeedback ?? prior)
    },
    isHighConfidence: confidence >= 0.80,
    hasSufficientEvidence: eligibleTasks >= minEligible,
    calculatedAt: new Date().toISOString()
  };
}

module.exports = {
  TRUSTRANK_CONFIG,
  validateWeights,
  calculateBaseTrustRank,
  calculateConfidence,
  calculateAdjustedTrustRank,
  determineTier,
  evaluateTrustRank
};
