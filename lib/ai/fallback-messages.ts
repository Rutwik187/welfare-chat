import type { FinalTriage } from "./schemas";

export function getFallbackAssistantMessage(options: {
  triage: FinalTriage;
  studentName: string;
  studentEmail: string;
}): string {
  const { triage, studentName, studentEmail } = options;

  if (triage.showEmergencyBanner) {
    return `Thank you for reaching out, ${studentName}. I'm having a brief technical issue, but this has been flagged as urgent. Please call 999 if you are in immediate danger, or Samaritans on 116 123 if you need to talk to someone now. A member of our team will contact you at ${studentEmail} as a priority.`;
  }

  if (triage.disposition === "ask_clarifying") {
    return `Hi ${studentName}, I'm having a brief technical issue right now. Could you tell me a bit more about what you need help with — for example, is it about money, housing, wellbeing, or something academic? That way we can make sure you get the right support.`;
  }

  if (triage.disposition === "handle_now") {
    return `Hi ${studentName}, I'm having a brief technical issue generating a full reply. A member of our team will follow up with you at ${studentEmail} shortly. In the meantime, you can browse the student support pages on the university portal for general guidance.`;
  }

  return `Thank you, ${studentName}. I'm having a brief technical issue, but your message has been received and a member of our team will follow up with you at ${studentEmail} soon.`;
}
