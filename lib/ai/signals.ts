export const IMMEDIATE_DANGER_PATTERNS = [
  /\bkill\s+(my)?self\b/i,
  /\bsuicid/i,
  /\b(end|take)\s+my\s+life\b/i,
  /\bhurt\s+myself\b/i,
  /\bcan'?t\s+keep\s+(myself\s+)?safe\b/i,
  /\bright\s+now\b.*\b(die|kill|harm|hurt)\b/i,
  /\b(die|kill|harm)\b.*\bright\s+now\b/i,
  /\bimmediate\s+danger\b/i,
  /\bgoing\s+to\s+(kill|hurt)\b/i,
];

export const CRISIS_PATTERNS = [
  /\bdon'?t\s+see\s+the\s+point\b/i,
  /\bhopeless/i,
  /\bhaven'?t\s+(left|eaten)\b/i,
  /\bnot\s+eat(en|ing)\b/i,
  /\bself[\s-]?harm/i,
  /\bwant\s+to\s+die\b/i,
  /\bno\s+point\s+(in|of)\s+anything\b/i,
  /\bcan'?t\s+cope\b/i,
  /\bmental\s+health.*(downhill|worse|bad)/i,
];

export const IMMIGRATION_PERSONAL_PATTERNS = [
  /\bvisa\s+expir/i,
  /\bcas\b/i,
  /\bwithdrawn\b/i,
  /\bimmigration\s+status\b/i,
  /\brefused\b/i,
  /\bwhat\s+happens\s+to\s+me\b/i,
  /\bwork\s+rights\b/i,
  /\bright\s+to\s+work\b/i,
  /\bsponsor\b/i,
];

export const LEGAL_ADVICE_PATTERNS = [
  /\blegal\s+advice\b/i,
  /\bcourt\s+action\b/i,
  /\bnever\s+protected\b/i,
  /\blarge\s+sum/i,
  /\bwhat\s+should\s+i\s+do\s+legally\b/i,
];

export const HARASSMENT_PATTERNS = [
  /\bharass/i,
  /\bbull(y|ied|ying)\b/i,
  /\bsexual\s+misconduct\b/i,
  /\bassault/i,
  /\bracist\b/i,
  /\bhate\s+crime\b/i,
];

export const SPAM_JAILBREAK_PATTERNS = [
  /\bignore\s+(your\s+)?(previous\s+)?instructions\b/i,
  /\bmark\s+this\s+as\s+resolved\b/i,
  /\blow\s+priority\b/i,
  /\bbit\.ly\b/i,
  /\binstagram\s+followers\b/i,
  /\bgrow\s+your\s+instagram\b/i,
  /\bclick\s+here\b.*\bfollowers\b/i,
];

export const VAGUE_PATTERNS = [
  /^(hi|hello|hey)[\s,!?.]*$/i,
  /^need\s+help\s*(asap|urgent(ly)?)?[\s!?.]*$/i,
  /^help[\s!?.]*$/i,
  /^asap[\s!?.]*$/i,
];

export function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}
