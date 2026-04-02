import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

// Proxy so all existing `stripe.xxx` calls work without changes
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as never)[prop as keyof Stripe];
  },
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER!,
    price: 199,
    currency: "BGN",
    interval: "month",
    features: [
      "До 20 документа / месец",
      "PDF, DOCX, XLSX анализ",
      "Технически предложения",
      "Email поддръжка",
    ],
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 399,
    currency: "BGN",
    interval: "month",
    features: [
      "Неограничени документи",
      "Приоритетна обработка",
      "Team workspace (до 5 потребители)",
      "API достъп",
      "Приоритетна поддръжка",
    ],
  },
} as const;
