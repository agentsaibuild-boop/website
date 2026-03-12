import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
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
