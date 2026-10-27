// ==============================================================================
// SOLHIRE AGENT TEAM ORCHESTRATOR
// Dependency graph resolution, topological sorting, parallel/sequential dispatch,
// state transitions, retry policies, output aggregation, and verification
// ==============================================================================

const crypto = require('crypto');

/**
 * Valid Orchestration States
 */
const BUNDLE_STATES = {
  DRAFT: "DRAFT",
  AWAITING_FUNDING: "AWAITING_FUNDING",
  FUNDED: "FUNDED",
  QUEUED: "QUEUED",
  RUNNING: "RUNNING",
  VERIFYING: "VERIFYING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED"
};

/**
 * Valid Child Task States
 */
const CHILD_STATES = {
  PENDING: "PENDING",
  WAITING_DEPS: "WAITING_DEPS",
  RUNNING: "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  RETRYING: "RETRYING"
};

/**
 * Valid state transitions mapping
 */
const STATE_TRANSITIONS = {
  [BUNDLE_STATES.DRAFT]: [BUNDLE_STATES.AWAITING_FUNDING, BUNDLE_STATES.CANCELLED],
  [BUNDLE_STATES.AWAITING_FUNDING]: [BUNDLE_STATES.FUNDED, BUNDLE_STATES.CANCELLED],
  [BUNDLE_STATES.FUNDED]: [BUNDLE_STATES.QUEUED, BUNDLE_STATES.CANCELLED],
  [BUNDLE_STATES.QUEUED]: [BUNDLE_STATES.RUNNING, BUNDLE_STATES.CANCELLED],
  [BUNDLE_STATES.RUNNING]: [BUNDLE_STATES.VERIFYING, BUNDLE_STATES.FAILED, BUNDLE_STATES.CANCELLED],
  [BUNDLE_STATES.VERIFYING]: [BUNDLE_STATES.COMPLETED, BUNDLE_STATES.FAILED],
  [BUNDLE_STATES.FAILED]: [BUNDLE_STATES.REFUND_PENDING],
  [BUNDLE_STATES.CANCELLED]: [BUNDLE_STATES.REFUND_PENDING],
  [BUNDLE_STATES.REFUND_PENDING]: [BUNDLE_STATES.REFUNDED],
  [BUNDLE_STATES.COMPLETED]: [],
  [BUNDLE_STATES.REFUNDED]: []
};

/**
 * Validate that a state transition is legal
 */
function isValidTransition(currentState, nextState) {
  const allowed = STATE_TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

/**
 * Validate team configuration:
 * 1. Must contain at least 3 agents
 * 2. No duplicate agent assignments unless explicitly allowed
 * 3. Every agent has defined roles and valid non-negative pricing
 */
function validateTeamConfig(team) {
  const errors = [];

  if (!team || !Array.isArray(team.agents)) {
    return { valid: false, errors: ["Team definition must include an agents array"] };
  }

  if (team.agents.length < 3) {
    errors.push(`Team must contain at least 3 agents. Current count: ${team.agents.length}`);
  }

  const seenIds = new Set();
  team.agents.forEach((agent, idx) => {
    if (!agent.agentId) {
      errors.push(`Agent at index ${idx} is missing an agentId`);
    } else if (seenIds.has(agent.agentId)) {
      errors.push(`Duplicate agent in team: ${agent.agentId}. Duplicate assignments not permitted.`);
    } else {
      seenIds.add(agent.agentId);
    }

    if (!agent.role) {
      errors.push(`Agent ${agent.agentId || idx} has no assigned role`);
    }

    if (agent.laborSol == null || Number(agent.laborSol) < 0) {
      errors.push(`Agent ${agent.agentId || idx} has invalid labor cost`);
    }

    if (agent.computeSol == null || Number(agent.computeSol) < 0) {
      errors.push(`Agent ${agent.agentId || idx} has invalid compute budget`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Detect circular dependencies in a team's DAG (Kahn's Algorithm / Cycle Detection)
 */
function detectCircularDependencies(agents) {
  const adj = new Map();
  const inDegree = new Map();
  const agentMap = new Map();

  agents.forEach(a => {
    adj.set(a.agentId, []);
    inDegree.set(a.agentId, 0);
    agentMap.set(a.agentId, a);
  });

  // Build edges: if B depends on A, edge is A -> B
  agents.forEach(b => {
    const deps = b.dependencies || [];
    deps.forEach(depId => {
      if (!adj.has(depId)) {
        // Dependency refers to an agent not in the team!
        throw new Error(`Agent '${b.agentId}' depends on '${depId}' which is not in the team.`);
      }
      adj.get(depId).push(b.agentId);
      inDegree.set(b.agentId, (inDegree.get(b.agentId) || 0) + 1);
    });
  });

  // Kahn's algorithm
  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  let visitedCount = 0;
  const executionOrder = [];

  while (queue.length > 0) {
    const current = queue.shift();
    executionOrder.push(current);
    visitedCount++;

    const neighbors = adj.get(current) || [];
    neighbors.forEach(neighbor => {
      const newDeg = inDegree.get(neighbor) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    });
  }

  if (visitedCount !== agents.length) {
    return {
      hasCycle: true,
      error: "Circular dependency detected in agent team workflow!"
    };
  }

  return {
    hasCycle: false,
    executionOrder
  };
}

/**
 * Calculate Financial Allocations in integer Lamports (1 SOL = 1,000,000,000 Lamports)
 */
const LAMPORTS_PER_SOL = 1000000000;

function calculateTeamFinancials(agents, userMaxBudgetSol = null, marketplaceFeePercent = 0) {
  let totalLaborLamports = 0n;
  let totalComputeLamports = 0n;

  const perAgentBreakdown = agents.map(a => {
    const laborLamports = BigInt(Math.round(Number(a.laborSol || 0) * LAMPORTS_PER_SOL));
    const computeLamports = BigInt(Math.round(Number(a.computeSol || 0) * LAMPORTS_PER_SOL));
    const totalLamports = laborLamports + computeLamports;

    totalLaborLamports += laborLamports;
    totalComputeLamports += computeLamports;

    return {
      agentId: a.agentId,
      name: a.name || a.agentId,
      role: a.role,
      laborSol: Number(a.laborSol || 0),
      computeSol: Number(a.computeSol || 0),
      totalSol: Number((Number(a.laborSol || 0) + Number(a.computeSol || 0)).toFixed(4)),
      laborLamports: laborLamports.toString(),
      computeLamports: computeLamports.toString(),
      totalLamports: totalLamports.toString()
    };
  });

  let feeLamports = 0n;
  if (marketplaceFeePercent > 0) {
    const subtotal = totalLaborLamports + totalComputeLamports;
    feeLamports = (subtotal * BigInt(Math.round(marketplaceFeePercent * 100))) / 10000n;
  }

  const grandTotalLamports = totalLaborLamports + totalComputeLamports + feeLamports;
  const grandTotalSol = Number(grandTotalLamports) / LAMPORTS_PER_SOL;

  let isWithinBudget = true;
  let budgetWarning = null;

  if (userMaxBudgetSol != null) {
    const userMaxLamports = BigInt(Math.round(Number(userMaxBudgetSol) * LAMPORTS_PER_SOL));
    if (grandTotalLamports > userMaxLamports) {
      isWithinBudget = false;
      const excessSol = (Number(grandTotalLamports - userMaxLamports) / LAMPORTS_PER_SOL).toFixed(3);
      budgetWarning = `Configured team total (${grandTotalSol.toFixed(3)} SOL) exceeds your maximum budget of ${Number(userMaxBudgetSol).toFixed(3)} SOL by ${excessSol} SOL.`;
    }
  }

  return {
    laborSubtotalSol: Number(totalLaborLamports) / LAMPORTS_PER_SOL,
    computeSubtotalSol: Number(totalComputeLamports) / LAMPORTS_PER_SOL,
    marketplaceFeeSol: Number(feeLamports) / LAMPORTS_PER_SOL,
    grandTotalSol,
    laborSubtotalLamports: totalLaborLamports.toString(),
    computeSubtotalLamports: totalComputeLamports.toString(),
    feeLamports: feeLamports.toString(),
    grandTotalLamports: grandTotalLamports.toString(),
    isWithinBudget,
    budgetWarning,
    perAgentBreakdown
  };
}

module.exports = {
  BUNDLE_STATES,
  CHILD_STATES,
  STATE_TRANSITIONS,
  LAMPORTS_PER_SOL,
  isValidTransition,
  validateTeamConfig,
  detectCircularDependencies,
  calculateTeamFinancials
};
