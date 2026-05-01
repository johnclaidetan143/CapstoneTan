export type PromoCode = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt?: string; // ISO date string or empty
};

const DEFAULT_PROMOS: PromoCode[] = [
  { code: "CHENNI10", type: "percent", value: 10, minOrder: 0,   active: true, expiresAt: "" },
  { code: "SAVE50",   type: "fixed",   value: 50, minOrder: 200, active: true, expiresAt: "" },
  { code: "WELCOME",  type: "percent", value: 15, minOrder: 0,   active: true, expiresAt: "" },
];

export function getPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return DEFAULT_PROMOS;
  const stored = localStorage.getItem("promoCodes");
  if (!stored) {
    localStorage.setItem("promoCodes", JSON.stringify(DEFAULT_PROMOS));
    return DEFAULT_PROMOS;
  }
  return JSON.parse(stored);
}

export function savePromoCodes(codes: PromoCode[]) {
  localStorage.setItem("promoCodes", JSON.stringify(codes));
}

export type PromoResult =
  | { valid: true; discount: number; message: string; code: PromoCode }
  | { valid: false; error: string };

export function applyPromo(code: string, subtotal: number): PromoResult {
  const promos = getPromoCodes();
  const promo = promos.find((p) => p.code.toUpperCase() === code.toUpperCase().trim());
  if (!promo) return { valid: false, error: "Invalid promo code." };
  if (!promo.active) return { valid: false, error: "This promo code is no longer active." };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date())
    return { valid: false, error: "This promo code has expired." };
  if (subtotal < promo.minOrder)
    return { valid: false, error: `Minimum order of ₱${promo.minOrder}.00 required.` };
  const discount = promo.type === "percent" ? Math.floor(subtotal * promo.value / 100) : promo.value;
  const message = promo.type === "percent" ? `${promo.value}% off applied!` : `₱${promo.value}.00 off applied!`;
  return { valid: true, discount, message, code: promo };
}
