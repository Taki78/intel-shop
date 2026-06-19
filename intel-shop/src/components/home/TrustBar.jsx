import { Shield, Truck, Headphones, RefreshCw } from 'lucide-react'

const items = [
  { icon: Shield, title: 'گارانتی اصالت', desc: 'تضمین اصل بودن کالا', color: 'text-emerald-600 bg-emerald-50' },
  { icon: Truck, title: 'ارسال سریع', desc: 'تحویل در کمترین زمان', color: 'text-primary-600 bg-primary-50' },
  { icon: Headphones, title: 'پشتیبانی ۲۴/۷', desc: 'همیشه کنار شما هستیم', color: 'text-violet-600 bg-violet-50' },
  { icon: RefreshCw, title: 'بازگشت کالا', desc: '۷ روز ضمانت بازگشت', color: 'text-amber-600 bg-amber-50' },
]

export default function TrustBar() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="container-custom py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:divide-x lg:divide-x-reverse lg:divide-gray-100">
          {items.map((item) => (
            <div
              key={item.title}
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
