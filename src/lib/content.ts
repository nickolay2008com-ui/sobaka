export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Техническое партнёрство",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  allyUrl: process.env.NEXT_PUBLIC_ALLY_URL || "https://www.allyai.ru",
};

export const BUSINESS = {
  launchContribution: 100_000,
  firstPayment: 20_000,
  remainingPayment: 80_000,
  revenueSharePercent: 20,
};

export const FIT_LABELS: Record<string, string> = {
  qualified: "Высокая совместимость",
  conditional: "Нужна короткая сверка",
  not_fit: "Пока рано входить в партнёрство",
};

export const LEAD_STATUSES = ["new", "contacted", "fit", "declined", "partner"] as const;

export const STATUS_LABELS: Record<(typeof LEAD_STATUSES)[number], string> = {
  new: "Новая",
  contacted: "Связались",
  fit: "Подходит",
  declined: "Отказ",
  partner: "Партнёр",
};
