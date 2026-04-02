// AIBUILD AGENTS – Applications catalog
// Add/remove applications and plans here

export type Plan = {
  key: string;
  name: string;
  price: number;
  currency: string;
  priceEnvKey: string; // env var name for Stripe Price ID
  features: string[];
  recommended?: boolean;
};

export type Application = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  badge?: string; // e.g. "НОВО", "BETA", "СКОРО"
  available: boolean; // false = coming soon
  plans: Plan[];
};

export const APPLICATIONS: Application[] = [
  {
    slug: "document-analyzer",
    name: "Document Analyzer",
    description: "Анализирай PDF, DOCX и XLSX файлове с AI. Извлечи ключова информация, таблици и технически данни автоматично.",
    icon: "📄",
    available: true,
    plans: [
      {
        key: "STARTER",
        name: "Starter",
        price: 199,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_DA_STARTER",
        features: [
          "До 20 документа / месец",
          "PDF, DOCX, XLSX анализ",
          "Технически предложения",
          "Email поддръжка",
        ],
      },
      {
        key: "PRO",
        name: "Pro",
        price: 399,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_DA_PRO",
        recommended: true,
        features: [
          "Неограничени документи",
          "Приоритетна обработка",
          "Team workspace (до 5 потребители)",
          "API достъп",
          "Приоритетна поддръжка",
        ],
      },
      {
        key: "ENTERPRISE",
        name: "Enterprise",
        price: 899,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_DA_ENTERPRISE",
        features: [
          "Всичко от Pro",
          "Неограничени потребители",
          "Dedicated инфраструктура",
          "SLA 99.9%",
          "Персонален мениджър",
        ],
      },
    ],
  },
  {
    slug: "email-agent",
    name: "Email Agent",
    description: "AI агент, който чете, сортира и отговаря на имейли от твое име. Спести часове работа всеки ден.",
    icon: "✉️",
    badge: "НОВО",
    available: true,
    plans: [
      {
        key: "STARTER",
        name: "Starter",
        price: 149,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_EA_STARTER",
        features: [
          "До 500 имейла / месец",
          "Автоматични отговори",
          "Категоризация",
          "Email поддръжка",
        ],
      },
      {
        key: "PRO",
        name: "Pro",
        price: 299,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_EA_PRO",
        recommended: true,
        features: [
          "Неограничени имейли",
          "Персонализиран тон",
          "CRM интеграция",
          "Приоритетна поддръжка",
        ],
      },
    ],
  },
  {
    slug: "tender-agent",
    name: "Tender Agent",
    description: "Намирай и анализирай обществени поръчки автоматично. Получавай известия за релевантни търгове.",
    icon: "🏛️",
    badge: "BETA",
    available: true,
    plans: [
      {
        key: "STARTER",
        name: "Starter",
        price: 249,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_TA_STARTER",
        features: [
          "До 50 тенdera / месец",
          "Автоматичен анализ",
          "Email известия",
          "Базов филтър",
        ],
      },
      {
        key: "PRO",
        name: "Pro",
        price: 499,
        currency: "BGN",
        priceEnvKey: "STRIPE_PRICE_TA_PRO",
        recommended: true,
        features: [
          "Неограничени търгове",
          "AI оценка на шанса за спечелване",
          "Автоматично попълване на документи",
          "API достъп",
          "Приоритетна поддръжка",
        ],
      },
    ],
  },
  {
    slug: "invoice-agent",
    name: "Invoice Agent",
    description: "Генерирай, изпращай и следи фактури с AI. Автоматично напомняне при просрочени плащания.",
    icon: "🧾",
    badge: "СКОРО",
    available: false,
    plans: [],
  },
  {
    slug: "hr-agent",
    name: "HR Agent",
    description: "AI асистент за подбор на персонал. Анализира CV-та, провежда първоначален скрининг и класира кандидати.",
    icon: "👥",
    badge: "СКОРО",
    available: false,
    plans: [],
  },
];

export function getApplication(slug: string): Application | undefined {
  return APPLICATIONS.find((app) => app.slug === slug);
}

export function getPriceId(priceEnvKey: string): string {
  return process.env[priceEnvKey] ?? "";
}
