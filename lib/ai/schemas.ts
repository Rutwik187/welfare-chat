import { z } from "zod";

export const triageSchema = z.object({
  category: z.enum([
    "academic",
    "financial",
    "visa_immigration",
    "housing",
    "health_wellbeing",
    "other",
  ]),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  safeguarding: z.boolean(),
  disposition: z.enum(["handle_now", "ask_clarifying", "escalate"]),
  reasoning: z.string().optional(),
  isSpamOrAbuse: z.boolean().optional(),
});

export type TriageResult = z.infer<typeof triageSchema>;

export type FinalTriage = TriageResult & {
  showEmergencyBanner: boolean;
  forceEscalateReason?: string;
};
