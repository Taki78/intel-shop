import { useState, useEffect } from 'react'
import { Save, Plus, X, Loader2, Check } from 'lucide-react'
import { adminApi } from '../../utils/adminApi'
import { SectionCard } from '../../components/admin/ui'

const ICON_OPTIONS = ['users', 'award', 'thumbs-up', 'shield', 'trophy', 'star', 'truck', 'package']

const EMPTY = {
  hero_title: '', hero_subtitle: '',
  story_title: '', story_body: '',
  why_title: '', why_items: [],
  stats: [],
}

export default function AdminAboutPage() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [itemInput, setItemInput] = useState('')

  useEffect(() => {
    adminApi.getAbout()
      .then(({ data }) => setForm({ ...EMPTY, ...data }))
      .catch(() => setError('خطا در بارگذاری'))
      .finally(() => setLoading(false))
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function addItem() {
    const v = itemInput.trim()
    if (v && !form.why_items.includes(v)) {
      setForm(f => ({ ...f, why_items: [...f.why_items, v] }))
      setItemInput('')
    }
  }
  function removeItem(v) {
    setForm(f => ({ ...f, why_items: f.why_items.filter(x => x !== v) }))
  }

  function updateStat(i, patch) {
    setForm(f => ({ ...f, stats: f.stats.map((s, idx) => idx === i ? { ...s, ...patch } : s) }))
  }
  function addStat() {
    setForm(f => ({ ...f, stats: [...f.stats, { label: '', value: '', icon: 'star' }] }))
  }
  function removeStat(i) {
    setForm(f => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    try {
      const { data } = await adminApi.updateAbout(form)
      setForm({ ...EMPTY, ...data })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در ذخیره تغییرات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-4xl">
      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
      {saved && (
        <p className="text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check size={16} /> تغییرات ذخیره شد
        </p>
      )}

      {/* Hero */}
      <SectionCard title="باکس بالا (Hero)">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان</label>
            <input value={form.hero_title} onChange={set('hero_title')} className="input" placeholder="درباره اینتل شاپ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">توضیح</label>
            <textarea value={form.hero_subtitle} onChange={set('hero_subtitle')} className="input resize-none" rows={2} />
          </div>
        </div>
      </SectionCard>

      {/* Stats */}
      <SectionCard title="آمارها">
        <div className="p-5 space-y-3">
          {form.stats.length === 0 && <p className="text-sm text-gray-400 text-center py-3">آماری اضافه نشده است</p>}
          {form.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input value={s.value} onChange={e => updateStat(i, { value: e.target.value })}
                className="input col-span-3" placeholder="+۵۰۰۰" />
              <input value={s.label} onChange={e => updateStat(i, { label: e.target.value })}
                className="input col-span-5" placeholder="مشتری راضی" />
              <select value={s.icon} onChange={e => updateStat(i, { icon: e.target.value })} className="input col-span-3">
                {ICON_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <button type="button" onClick={() => removeStat(i)}
                className="col-span-1 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                <X size={15} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addStat} className="btn-outline text-sm gap-1.5">
            <Plus size={14} /> افزودن آمار
          </button>
        </div>
      </SectionCard>

      {/* Story */}
      <SectionCard title="داستان ما">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان بخش</label>
            <input value={form.story_title} onChange={set('story_title')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">متن (می‌توانید با خط خالی پاراگراف جدا کنید)</label>
            <textarea value={form.story_body} onChange={set('story_body')} className="input resize-none" rows={6} />
          </div>
        </div>
      </SectionCard>

      {/* Why */}
      <SectionCard title="چرا ما؟">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان بخش</label>
            <input value={form.why_title} onChange={set('why_title')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">موارد</label>
            <div className="flex gap-2 mb-2">
              <input value={itemInput} onChange={e => setItemInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                className="input flex-1" placeholder="یک مزیت اضافه کنید..." />
              <button type="button" onClick={addItem} className="btn-outline shrink-0 px-4">
                <Plus size={15} />
              </button>
            </div>
            {form.why_items.length > 0 && (
              <ul className="space-y-1.5">
                {form.why_items.map(item => (
                  <li key={item} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    <span className="text-sm text-gray-700 flex-1">{item}</span>
                    <button type="button" onClick={() => removeItem(item)} className="text-gray-400 hover:text-red-600">
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SectionCard>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary gap-2 shadow-lg shadow-primary-600/30">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          ذخیره تغییرات
        </button>
      </div>
    </form>
  )
}
