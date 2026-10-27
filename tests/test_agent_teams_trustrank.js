// ==============================================================================
// SOLHIRE: AUTOMATED TESTS FOR AGENT TEAMS, PRICING, & TRUSTRANK
// Covers:
// 1. Team configuration rules (>=3 agents, no duplicates, valid roles)
// 2. DAG dependencies and cycle detection (Kahn's algorithm)
// 3. Financial math (Integer lamports, user budget ceiling enforcement)
// 4. TrustRank formulas (Base weighted score, Bayesian confidence adjustment, tiers)
// 5. State transitions & security invariants
// ==============================================================================

const assert = require('assert');
const { PREBUILT_BUNDLES } = require('../indexer/src/bundleCatalog');
const {
  TRUSTRANK_CONFIG,
  validateWeights,
  calculateBaseTrustRank,
  calculateConfidence,
  calculateAdjustedTrustRank,
  determineTier,
  evaluateTrustRank
} = require('../indexer/src/trustRankEngine');
const {
  BUNDLE_STATES,
  CHILD_STATES,
  LAMPORTS_PER_SOL,
  isValidTransition,
  validateTeamConfig,
  detectCircularDependencies,
  calculateTeamFinancials
} = require('../indexer/src/agentTeamOrchestrator');

describe('SolHire: Agent Teams, Pricing & TrustRank Suite', () => {

  // ── 1. Team Builder & Configuration Invariants ─────────────────────────────
  describe('1. Team Builder & Configuration Rules', () => {
    it('should reject teams with fewer than 3 agents', () => {
      const invalidTeam = {
        agents: [
          { agentId: "ag_1", role: "Frontend", laborSol: 1.0, computeSol: 0.1 },
          { agentId: "ag_2", role: "Backend", laborSol: 1.0, computeSol: 0.1 }
        ]
      };
      const res = validateTeamConfig(invalidTeam);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('at least 3 agents')));
    });

    it('should accept valid teams with 3, 4, 5, or more agents', () => {
      const validTeam = {
        agents: [
          { agentId: "ag_1", role: "Frontend", laborSol: 1.0, computeSol: 0.1 },
          { agentId: "ag_2", role: "Backend", laborSol: 1.0, computeSol: 0.1 },
          { agentId: "ag_3", role: "DB", laborSol: 0.8, computeSol: 0.08 }
        ]
      };
      const res = validateTeamConfig(validTeam);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.errors.length, 0);
    });

    it('should reject duplicate agent assignments within the same team', () => {
      const duplicateTeam = {
        agents: [
          { agentId: "agent_webdev_00", role: "Frontend", laborSol: 1.0, computeSol: 0.1 },
          { agentId: "agent_code_01", role: "Backend", laborSol: 1.0, computeSol: 0.1 },
          { agentId: "agent_webdev_00", role: "QA Engineer", laborSol: 0.5, computeSol: 0.05 }
        ]
      };
      const res = validateTeamConfig(duplicateTeam);
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('Duplicate agent in team')));
    });

    it('should verify all prebuilt bundles have >= 3 agents and unique roles', () => {
      PREBUILT_BUNDLES.forEach(bundle => {
        assert.ok(bundle.agents.length >= 3, `${bundle.name} must have at least 3 agents`);
        const res = validateTeamConfig(bundle);
        assert.strictEqual(res.valid, true, `${bundle.name} failed config validation`);
      });
    });
  });

  // ── 2. DAG Dependency Resolution & Cycle Detection ────────────────────────
  describe('2. DAG Dependency Resolution & Circular Checks', () => {
    it('should correctly topologically sort valid independent & sequential tasks', () => {
      const agents = [
        { agentId: "db", dependencies: [] },
        { agentId: "api", dependencies: ["db"] },
        { agentId: "ui", dependencies: ["api"] }
      ];
      const res = detectCircularDependencies(agents);
      assert.strictEqual(res.hasCycle, false);
      assert.deepStrictEqual(res.executionOrder, ["db", "api", "ui"]);
    });

    it('should detect direct circular dependencies (A -> B -> A)', () => {
      const agents = [
        { agentId: "agent_A", dependencies: ["agent_B"] },
        { agentId: "agent_B", dependencies: ["agent_A"] },
        { agentId: "agent_C", dependencies: [] }
      ];
      const res = detectCircularDependencies(agents);
      assert.strictEqual(res.hasCycle, true);
      assert.ok(res.error.includes('Circular dependency detected'));
    });

    it('should detect indirect circular dependencies (A -> B -> C -> A)', () => {
      const agents = [
        { agentId: "agent_A", dependencies: ["agent_C"] },
        { agentId: "agent_B", dependencies: ["agent_A"] },
        { agentId: "agent_C", dependencies: ["agent_B"] }
      ];
      const res = detectCircularDependencies(agents);
      assert.strictEqual(res.hasCycle, true);
    });

    it('should ensure all prebuilt bundles have valid, non-circular DAGs', () => {
      PREBUILT_BUNDLES.forEach(bundle => {
        const res = detectCircularDependencies(bundle.agents);
        assert.strictEqual(res.hasCycle, false, `${bundle.name} has circular dependencies!`);
      });
    });
  });

  // ── 3. Exact SOL & Lamport Financial Math ──────────────────────────────────
  describe('3. Financial Math & User Budget Controls', () => {
    it('should calculate integer Lamports accurately without floating point drift', () => {
      const agents = [
        { agentId: "a1", laborSol: 1.25, computeSol: 0.15 },
        { agentId: "a2", laborSol: 0.75, computeSol: 0.05 },
        { agentId: "a3", laborSol: 2.00, computeSol: 0.20 }
      ];

      const financials = calculateTeamFinancials(agents);
      assert.strictEqual(financials.laborSubtotalSol, 4.00);
      assert.strictEqual(financials.computeSubtotalSol, 0.40);
      assert.strictEqual(financials.grandTotalSol, 4.40);

      // Verify exact Lamport BigInt strings
      assert.strictEqual(financials.laborSubtotalLamports, "4000000000");
      assert.strictEqual(financials.computeSubtotalLamports, "400000000");
      assert.strictEqual(financials.grandTotalLamports, "4400000000");
    });

    it('should enforce user configured maximum budget ceiling in SOL', () => {
      const agents = [
        { agentId: "a1", laborSol: 2.0, computeSol: 0.2 },
        { agentId: "a2", laborSol: 1.5, computeSol: 0.1 },
        { agentId: "a3", laborSol: 1.0, computeSol: 0.1 }
      ]; // Total = 4.90 SOL

      const allowed = calculateTeamFinancials(agents, 5.00);
      assert.strictEqual(allowed.isWithinBudget, true);
      assert.strictEqual(allowed.budgetWarning, null);

      const exceeded = calculateTeamFinancials(agents, 3.50);
      assert.strictEqual(exceeded.isWithinBudget, false);
      assert.ok(exceeded.budgetWarning.includes('exceeds your maximum budget'));
    });

    it('should prevent negative monetary amounts and over-allocations', () => {
      const invalidAgents = [
        { agentId: "a1", laborSol: -1.0, computeSol: 0.1 },
        { agentId: "a2", laborSol: 1.0, computeSol: 0.1 },
        { agentId: "a3", laborSol: 1.0, computeSol: 0.1 }
      ];
      const validation = validateTeamConfig({ agents: invalidAgents });
      assert.strictEqual(validation.valid, false);
    });
  });

  // ── 4. TrustRank Mathematical Scoring & Bayesian Prior ────────────────────
  describe('4. TrustRank Mathematical Model & Confidence Adjustment', () => {
    it('should validate that dimension weights sum to exactly 1.00', () => {
      assert.strictEqual(validateWeights(TRUSTRANK_CONFIG.weights), true);
    });

    it('should compute weighted base TrustRank correctly: 0.35Q + 0.25R + 0.15E + 0.15C + 0.10F', () => {
      const scores = {
        quality: 100,
        reliability: 100,
        efficiency: 100,
        costEfficiency: 100,
        verifiedFeedback: 100
      };
      const base = calculateBaseTrustRank(scores);
      assert.strictEqual(base, 100.0);

      const mixedScores = {
        quality: 90,           // 0.35 * 90 = 31.5
        reliability: 80,       // 0.25 * 80 = 20.0
        efficiency: 70,        // 0.15 * 70 = 10.5
        costEfficiency: 80,    // 0.15 * 80 = 12.0
        verifiedFeedback: 90   // 0.10 * 90 = 9.0
      };                       // Total = 83.0
      assert.strictEqual(calculateBaseTrustRank(mixedScores), 83.0);
    });

    it('should pull low-evidence scores toward neutral prior (65.0) via Bayesian shrinkage', () => {
      // 1 task = 10% confidence (threshold = 10)
      const conf1 = calculateConfidence(1);
      assert.strictEqual(conf1, 0.1);

      // Raw 100% on 1 task should shrink towards 65.0:
      // Adjusted = 0.1 * 100 + 0.9 * 65.0 = 10.0 + 58.5 = 68.5
      const adjusted1 = calculateAdjustedTrustRank(100.0, conf1, 65.0);
      assert.strictEqual(adjusted1, 68.5);

      // 10 tasks = 100% confidence
      const conf10 = calculateConfidence(10);
      assert.strictEqual(conf10, 1.0);
      const adjusted10 = calculateAdjustedTrustRank(100.0, conf10, 65.0);
      assert.strictEqual(adjusted10, 100.0);
    });

    it('should assign Unrated tier for entities with fewer than 3 verified tasks', () => {
      const evaluation = evaluateTrustRank({ quality: 99, reliability: 99, efficiency: 99, costEfficiency: 99, verifiedFeedback: 99 }, 1);
      assert.strictEqual(evaluation.tier, "Unrated");
      assert.strictEqual(evaluation.hasSufficientEvidence, false);

      const rated = evaluateTrustRank({ quality: 95, reliability: 95, efficiency: 95, costEfficiency: 95, verifiedFeedback: 95 }, 15);
      assert.strictEqual(rated.tier, "Platinum");
      assert.strictEqual(rated.hasSufficientEvidence, true);
    });
  });

  // ── 5. State Machine & Transition Invariants ──────────────────────────────
  describe('5. Orchestrator State Transitions', () => {
    it('should allow valid sequential transitions: FUNDED -> QUEUED -> RUNNING -> VERIFYING -> COMPLETED', () => {
      assert.strictEqual(isValidTransition(BUNDLE_STATES.DRAFT, BUNDLE_STATES.AWAITING_FUNDING), true);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.AWAITING_FUNDING, BUNDLE_STATES.FUNDED), true);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.FUNDED, BUNDLE_STATES.QUEUED), true);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.QUEUED, BUNDLE_STATES.RUNNING), true);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.RUNNING, BUNDLE_STATES.VERIFYING), true);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.VERIFYING, BUNDLE_STATES.COMPLETED), true);
    });

    it('should disallow illegal transitions (e.g., DRAFT -> COMPLETED or COMPLETED -> RUNNING)', () => {
      assert.strictEqual(isValidTransition(BUNDLE_STATES.DRAFT, BUNDLE_STATES.COMPLETED), false);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.COMPLETED, BUNDLE_STATES.RUNNING), false);
      assert.strictEqual(isValidTransition(BUNDLE_STATES.REFUNDED, BUNDLE_STATES.RUNNING), false);
    });
  });

});
