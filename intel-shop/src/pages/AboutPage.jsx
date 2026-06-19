import { Shield, Award, Users, ThumbsUp } from 'lucide-react'

const stats = [
  { label: 'مشتری راضی', value: '+۵۰۰۰', icon: Users },
  { label: 'محصول متنوع', value: '+۲۰۰', icon: Award },
  { label: 'سال تجربه', value: '۸', icon: ThumbsUp },
  { label: 'گارانتی معتبر', value: '۱۰۰٪', icon: Shield },
]

export default function AboutPage() {
  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Hero */}
        <div className="bg-gradient-to-l from-primary-700 to-primary-500 rounded-3xl p-10 text-white text-center mb-12">
          <h1 className="text-3xl font-black mb-3">درباره اینتل شاپ</h1>
          <p className="text-white/80 max-w-xl mx-auto">
            فروشگاه تخصصی لپ‌تاپ و قطعات کامپیوتر با بیش از ۸ سال سابقه، خدمت‌رسانی به مشتریان سراسر ایران
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="card p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <s.icon size={22} className="text-primary-600" />
              </div>
              <p className="text-3xl font-black text-primary-700 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-4">داستان ما</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              اینتل شاپ در سال ۱۳۹۵ با هدف ارائه بهترین لپ‌تاپ‌ها و قطعات کامپیوتر با مناسب‌ترین قیمت شروع به کار کرد.
              ما معتقدیم که هر کسی باید به تکنولوژی با کیفیت دسترسی داشته باشد.
            </p>
            <p className="text-gray-600 leading-relaxed">
              تیم متخصص ما با دقت هر محصول را بررسی می‌کند تا مطمئن شود که بهترین انتخاب برای مشتریان ارائه می‌دهد.
              از لپ‌تاپ‌های نو گرفته تا کارکرده‌های باکیفیت، همه چیز با گارانتی و پشتیبانی همراه است.
            </p>
          </div>
          <div className="bg-primary-50 rounded-2xl p-8">
            <h3 className="font-bold text-gray-800 mb-4">چرا اینتل شاپ؟</h3>
            <ul className="space-y-3">
              {[
                'تضمین اصالت تمام محصولات',
                'قیمت‌های رقابتی و شفاف',
                'پشتیبانی تخصصی قبل و بعد از خرید',
                'ارسال سریع به سراسر ایران',
                'گارانتی بازگشت ۷ روزه',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
