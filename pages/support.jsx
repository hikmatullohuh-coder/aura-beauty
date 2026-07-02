import { useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

const TOPICS = [
  { value: 'general', labelKey: 'form.topics.general' },
  { value: 'complaint', labelKey: 'form.topics.complaint' },
  { value: 'suggestion', labelKey: 'form.topics.suggestion' },
  { value: 'review', labelKey: 'form.topics.review' },
  { value: 'partnership', labelKey: 'form.topics.partnership' },
  { value: 'other', labelKey: 'form.topics.other' }
]

export default function SupportPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: 'general', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let recaptchaToken = null
    if (typeof window !== 'undefined' && window.grecaptcha && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      try {
        recaptchaToken = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'submit' })
      } catch (err) {
        console.warn('recaptcha execute failed', err)
      }
    }

    try {
      await axios.post('/api/support', { ...form, recaptchaToken })
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', topic: 'general', message: '' })
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.error || t('form.errors.server_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>{t('support.title')}</h1>
      {success ? (
        <div className="success">
          {t('form.success')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="support-form">
          <label>{t('form.labels.name')}*</label>
          <input name="name" value={form.name} onChange={onChange} required placeholder={t('form.placeholders.name')} />

          <label>{t('form.labels.email')}*</label>
          <input name="email" type="email" value={form.email} onChange={onChange} required placeholder={t('form.placeholders.email')} />

          <label>{t('form.labels.phone')}</label>
          <input name="phone" value={form.phone} onChange={onChange} placeholder={t('form.placeholders.phone')} />

          <label>{t('form.labels.topic')}</label>
          <select name="topic" value={form.topic} onChange={onChange}>
            {TOPICS.map(ti => <option key={ti.value} value={ti.value}>{t(ti.labelKey)}</option>)}
          </select>

          <label>{t('form.labels.message')}*</label>
          <textarea name="message" value={form.message} onChange={onChange} required placeholder={t('form.placeholders.message')} />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>{loading ? t('form.sending') : t('form.submit')}</button>
        </form>
      )}

      <style jsx>{`
        .container { max-width:700px; margin:40px auto; padding:20px }
        .support-form { display:flex; flex-direction:column; gap:12px }
        input, select, textarea { padding:10px; border:1px solid #ddd; border-radius:6px }
        button { background:var(--brand); color:white; padding:10px 16px; border:none; border-radius:6px }
        .success { background:#e6ffef; padding:12px; border-radius:6px }
      `}</style>
    </div>
  )
}
