import { useState } from 'react'
import axios from 'axios'

const TOPICS = [
  { value: 'order_question', label: 'Вопрос по заказу' },
  { value: 'delivery_question', label: 'Вопрос по доставке' },
  { value: 'complaint', label: 'Жалоба' },
  { value: 'suggestion', label: 'Предложение' },
  { value: 'review', label: 'Отзыв о работе магазина' },
  { value: 'other', label: 'Другое' }
]

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', orderNumber: '', topic: 'order_question', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // If recaptcha site key present, get token from grecaptcha (v3)
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
      setForm({ name: '', email: '', phone: '', orderNumber: '', topic: 'order_question', message: '' })
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.error || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Поддержка и обратная связь</h1>
      {success ? (
        <div className="success">
          Спасибо за обращение! Команда Aura Beauty получила ваше сообщение и ответит вам в ближайшее время.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="support-form">
          <label>Имя*</label>
          <input name="name" value={form.name} onChange={onChange} required />

          <label>Email*</label>
          <input name="email" type="email" value={form.email} onChange={onChange} required />

          <label>Номер телефона</label>
          <input name="phone" value={form.phone} onChange={onChange} />

          <label>Номер заказа</label>
          <input name="orderNumber" value={form.orderNumber} onChange={onChange} />

          <label>Тема обращения</label>
          <select name="topic" value={form.topic} onChange={onChange}>
            {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <label>Сообщение*</label>
          <textarea name="message" value={form.message} onChange={onChange} required />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>{loading ? 'Отправка...' : 'Отправить'}</button>
        </form>
      )}

      <style jsx>{`
        .container { max-width:700px; margin:40px auto; padding:20px }
        .support-form { display:flex; flex-direction:column; gap:12px }
        input, select, textarea { padding:10px; border:1px solid #ddd; border-radius:6px }
        button { background:#b94f9b; color:white; padding:10px 16px; border:none; border-radius:6px }
        .success { background:#e6ffef; padding:12px; border-radius:6px }
      `}</style>
    </div>
  )
}
