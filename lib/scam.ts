/**
 * Off-platform contact and payment detection for buyer–seller chat.
 *
 * Scammers rarely type a clean phone number, so we normalise first: spelled-out
 * digits ("zero eight zero"), letter look-alikes (O→0, l→1), "at"/"dot"
 * spellings and spacing tricks are folded before matching. Every message is
 * checked on send and again on the server before storage.
 */

export type ScamFlagKind = "phone" | "email" | "whatsapp" | "social" | "link" | "bank_account" | "off_platform_payment";

export type ScamFlag = { kind: ScamFlagKind; match: string; severity: "block" | "warn" };

export type ScamResult = {
  flags: ScamFlag[];
  /** Text safe to show the other party, with contact details masked. */
  safeText: string;
  /** True when anything must be masked or the message held for review. */
  blocked: boolean;
};

const wordDigits: Record<string, string> = {
  zero: "0", oh: "0", o: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
};

/** Fold obfuscations into plain digits so "o8o-three 1two..." is caught. */
export function normaliseDigits(text: string) {
  return text
    .toLowerCase()
    .replace(/\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g, (w) => wordDigits[w]!)
    // Letter look-alikes only when sandwiched by digits or separators.
    .replace(/(?<=[\d\s.\-_/])[o](?=[\d\s.\-_/])/g, "0")
    .replace(/(?<=[\d\s.\-_/])[il|](?=[\d\s.\-_/])/g, "1");
}

const NG_BANKS = [
  "access", "gtb", "gtbank", "guaranty", "zenith", "uba", "first bank", "firstbank", "fcmb", "fidelity", "union bank",
  "sterling", "wema", "alat", "stanbic", "ecobank", "polaris", "keystone", "providus", "kuda", "opay", "palmpay",
  "moniepoint", "carbon", "vfd", "jaiz", "taj", "lotus", "globus", "titan", "premiumtrust", "parallex", "unity bank", "heritage",
];

const PAY_PHRASES = [
  /\b(pay|send|transfer|deposit)\b.{0,25}\b(direct(ly)?|to me|my account|my acct|my number|outside|cash)\b/,
  /\b(account|acct|acc)\s*(no|number|num|details?)?\b.{0,12}\d/,
  /\bbank\s*transfer\b/,
  /\b(don'?t|do not|no need to)\b.{0,20}\b(pay|use|order)\b.{0,20}\b(alaba|the app|the site|platform)\b/,
  /\b(cheaper|discount|less|reduce)\b.{0,30}\b(outside|off|direct(ly)?|without)\b.{0,15}\b(alaba|app|platform|site)?\b/,
  /\b(usdt|crypto|bitcoin|btc|binance|gift ?card)\b/,
  /\bpay\s*on\s*delivery\b.{0,20}\b(to me|direct)\b/,
];

const SOCIAL = /\b(telegram|t\.me|instagram dm|ig dm|dm me|snapchat|signal|facebook|fb\.com|messenger)\b/;
const WHATSAPP_LINK = /(wa\.me\/?\S*|chat\.whatsapp\.com\/?\S*|api\.whatsapp\.com\S*)/;
const WHATSAPP_WORD = /(\bwhats\s*app\b|\bwatsapp\b|\bwasap\b|\bwhatsap\b|\bw\/app\b|\bwa\s+(me|number)\b)/;
const LINK = /\b((?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|ng|net|org|io|me|link|ly|co|shop|store)(?:\/\S*)?)/;
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/;
/** "john dot doe at gmail dot com", "john(at)gmail(dot)com" */
const EMAIL_SPELLED = /[a-z0-9._%+-]+(?:\s*(?:\(dot\)|\[dot\]|\s+dot\s+)\s*[a-z0-9]+)*\s*(?:\(at\)|\[at\]|\s+at\s+)\s*[a-z0-9-]+(?:\s*(?:\(dot\)|\[dot\]|\s+dot\s+)\s*[a-z]{2,})+/;

// Nigerian mobile numbers: 0 or +234 prefix, then 7/8/9, then 0/1, then 8 digits.
// Separators between digits are allowed.
const SEP = "[\\s.\\-_/()]*";
const PHONE = new RegExp(`(?:\\+?2${SEP}3${SEP}4|0)${SEP}[789]${SEP}[01](?:${SEP}\\d){8}`);
// Any run of 10+ digits with separators (NUBAN account numbers or other phone formats).
const LONG_DIGITS = new RegExp(`\\d(?:${SEP}\\d){9,}`);

/** Domains that are fine to share: Alaba links and allowed video hosts. */
const ALLOWED_LINK = /^(?:https?:\/\/)?(?:www\.)?(?:alaba\.ng|tiktok\.com|instagram\.com\/(?:reel|p)\/)/;

export function scanMessage(text: string): ScamResult {
  const raw = text.slice(0, 2000);
  const lower = raw.toLowerCase();
  const norm = normaliseDigits(raw);
  const flags: ScamFlag[] = [];
  const add = (kind: ScamFlagKind, match: string | undefined, severity: ScamFlag["severity"] = "block") => {
    if (match && !flags.some((f) => f.kind === kind && f.match === match)) flags.push({ kind, match: match.trim(), severity });
  };

  add("email", lower.match(EMAIL)?.[0] ?? lower.match(EMAIL_SPELLED)?.[0]);
  add("whatsapp", lower.match(WHATSAPP_LINK)?.[0]);
  if (!flags.some((f) => f.kind === "whatsapp")) add("whatsapp", lower.match(WHATSAPP_WORD)?.[0], "warn");
  add("social", lower.match(SOCIAL)?.[0], "warn");

  const link = lower.replace(new RegExp(EMAIL.source, "g"), " ").replace(new RegExp(WHATSAPP_LINK.source, "g"), " ").match(LINK)?.[0];
  if (link && !ALLOWED_LINK.test(link)) add("link", link);

  const phone = norm.match(PHONE)?.[0];
  if (phone) add("phone", phone);
  else {
    const long = norm.match(LONG_DIGITS)?.[0];
    if (long) {
      const digits = long.replace(/\D/g, "");
      // 10 digits next to a bank word is an account number; otherwise likely a phone.
      const bankNear = NG_BANKS.some((b) => lower.includes(b)) || /\b(acct|account|acc)\b/.test(lower);
      add(bankNear || digits.length === 10 ? "bank_account" : "phone", long);
    }
  }

  const bank = NG_BANKS.find((b) => new RegExp(`\\b${b}\\b`).test(lower));
  for (const re of PAY_PHRASES) {
    const m = lower.match(re)?.[0];
    if (m && !flags.some((f) => f.kind === "off_platform_payment")) add("off_platform_payment", m, bank || /\d{6,}/.test(norm) ? "block" : "warn");
  }
  if (bank && /\b(pay|send|transfer|account|acct)\b/.test(lower) && !flags.some((f) => f.kind === "off_platform_payment")) add("off_platform_payment", bank, "block");

  const blocked = flags.some((f) => f.severity === "block");
  return { flags, safeText: blocked ? mask(raw) : raw, blocked };
}

/** Replace contact details with bullets, keeping the rest of the message readable. */
export function mask(text: string) {
  return text
    .replace(new RegExp(EMAIL.source, "gi"), "[email hidden]")
    .replace(new RegExp(EMAIL_SPELLED.source, "gi"), "[email hidden]")
    .replace(/(wa\.me\/?\S*|chat\.whatsapp\.com\/?\S*)/gi, "[link hidden]")
    .replace(new RegExp(LINK.source, "gi"), (m) => (ALLOWED_LINK.test(m) ? m : "[link hidden]"))
    .replace(/(?:\+?\d|\b(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)\b)(?:[\s.\-_/()]*(?:\d|\b(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)\b|[oOlI](?=[\d\s]))){6,}/gi, "[number hidden]");
}

export const flagCopy: Record<ScamFlagKind, string> = {
  phone: "a phone number",
  email: "an email address",
  whatsapp: "a WhatsApp contact",
  social: "another messaging app",
  link: "an outside link",
  bank_account: "a bank account number",
  off_platform_payment: "a request to pay outside Alaba",
};

/**
 * Trust-building pattern: a seller who has completed a few orders with a buyer
 * is the most likely to ask for "direct" payment next. We raise the warning
 * level once the pair has 2+ completed orders.
 */
export function trustRisk(completedOrdersWithSeller: number) {
  return completedOrdersWithSeller >= 2 ? "elevated" : "normal";
}
