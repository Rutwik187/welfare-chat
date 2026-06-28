import type { FinalTriage, TriageResult } from "./schemas";
import {
  CRISIS_PATTERNS,
  HARASSMENT_PATTERNS,
  IMMEDIATE_DANGER_PATTERNS,
  IMMIGRATION_PERSONAL_PATTERNS,
  LEGAL_ADVICE_PATTERNS,
  matchesAny,
  SPAM_JAILBREAK_PATTERNS,
  VAGUE_PATTERNS,
} from "./signals";

type ApplyHouseRulesInput = {
  triage: TriageResult;
  message: string;
  clarifyingRounds: number;
  kbCanAnswer: boolean;
};

export function applyHouseRules({
  triage,
  message,
  clarifyingRounds,
  kbCanAnswer,
}: ApplyHouseRulesInput): FinalTriage {
  const result: FinalTriage = {
    ...triage,
    showEmergencyBanner: false,
    showCrisisSupport: false,
  };

  const immediateDanger = matchesAny(message, IMMEDIATE_DANGER_PATTERNS);
  const crisis = matchesAny(message, CRISIS_PATTERNS);
  const immigrationPersonal = matchesAny(message, IMMIGRATION_PERSONAL_PATTERNS);
  const legalAdvice = matchesAny(message, LEGAL_ADVICE_PATTERNS);
  const harassment = matchesAny(message, HARASSMENT_PATTERNS);
  const spamOrJailbreak =
    triage.isSpamOrAbuse || matchesAny(message, SPAM_JAILBREAK_PATTERNS);
  const isVague = matchesAny(message.trim(), VAGUE_PATTERNS);

  if (immediateDanger) {
    return {
      category: "health_wellbeing",
      urgency: "critical",
      safeguarding: true,
      disposition: "escalate",
      showEmergencyBanner: true,
      showCrisisSupport: true,
      forceEscalateReason: "immediate_danger",
    };
  }

  if (crisis || triage.safeguarding) {
    result.safeguarding = true;
    result.disposition = "escalate";
    result.urgency =
      result.urgency === "low" || result.urgency === "medium"
        ? "high"
        : result.urgency;
    result.showCrisisSupport = true;
    result.forceEscalateReason = "safeguarding";
  }

  if (immigrationPersonal || triage.category === "visa_immigration") {
    result.category = "visa_immigration";
    result.disposition = "escalate";
    result.urgency =
      result.urgency === "low" ? "high" : result.urgency;
    result.forceEscalateReason = "immigration";
  }

  if (legalAdvice) {
    result.disposition = "escalate";
    result.forceEscalateReason = "legal";
  }

  if (harassment) {
    result.safeguarding = true;
    result.disposition = "escalate";
    result.category = "health_wellbeing";
    result.showCrisisSupport = true;
    result.forceEscalateReason = "harassment";
  }

  if (result.safeguarding && result.disposition === "handle_now") {
    result.disposition = "escalate";
    result.showCrisisSupport = true;
  }

  if (spamOrJailbreak) {
    result.category = "other";
    result.urgency = "low";
    result.safeguarding = false;
    result.disposition = "escalate";
    result.isSpamOrAbuse = true;
    result.showCrisisSupport = false;
    result.forceEscalateReason = "spam_or_jailbreak";
  }

  if (
    isVague &&
    !result.safeguarding &&
    !immediateDanger &&
    !spamOrJailbreak
  ) {
    result.disposition = "ask_clarifying";
    result.urgency = "medium";
  }

  if (
    result.disposition === "handle_now" &&
    !kbCanAnswer &&
    !spamOrJailbreak
  ) {
    result.disposition = "escalate";
    result.forceEscalateReason = "kb_gap";
  }

  if (
    result.disposition === "ask_clarifying" &&
    clarifyingRounds >= 2
  ) {
    result.disposition = "escalate";
    result.forceEscalateReason = "max_clarifying_rounds";
  }

  if (
    result.disposition !== "ask_clarifying" &&
    result.urgency === "critical"
  ) {
    result.showEmergencyBanner = true;
    result.showCrisisSupport = true;
  }

  return result;
}

export function shouldCreateCase(triage: FinalTriage): boolean {
  if (triage.isSpamOrAbuse) {
    return false;
  }
  return triage.disposition === "escalate";
}
