import jalaali from 'jalaali-js'

export function toJalali(date) {
  const d = new Date(date)
  const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return { jy, jm, jd }
}

export function formatJalaliDate(date) {
  if (!date) return ''
  if (typeof date === 'string' && date.includes('/')) return date
  const { jy, jm, jd } = toJalali(date)
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
}

export function formatJalaliDateFull(date) {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ]
  if (!date) return ''
  if (typeof date === 'string' && date.includes('/')) {
    const parts = date.split('/')
    return `${toPersianNum(parseInt(parts[2]))} ${months[parseInt(parts[1]) - 1]} ${toPersianNum(parseInt(parts[0]))}`
  }
  const { jy, jm, jd } = toJalali(date)
  return `${toPersianNum(jd)} ${months[jm - 1]} ${toPersianNum(jy)}`
}

export function toPersianNum(num) {
  return String(num).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

export function getCurrentJalaliDate() {
  return formatJalaliDate(new Date())
}
