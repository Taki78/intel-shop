const CODES = {
  INTEL10: { percent: 10, label: '۱۰٪ تخفیف' },
  SHOP20: { percent: 20, label: '۲۰٪ تخفیف' },
  WELCOME5: { percent: 5, label: '۵٪ تخفیف خوش‌آمدگویی' },
}

export function validateDiscount(code) {
  const entry = CODES[code?.toUpperCase()]
  if (entry) return { valid: true, ...entry }
  return { valid: false }
}
