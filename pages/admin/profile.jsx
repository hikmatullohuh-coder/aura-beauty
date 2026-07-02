import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

export default function AdminProfile() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error(t('validation.password_mismatch'))
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/admin/profile/change-password', form)
      toast.success(t('profile.success_password_changed'))
      if (typeof window !== 'undefined' && window.__SOCKET__) {
        window.__SOCKET__.disconnect()
      }
      setTimeout(() => { router.push('/admin/login') }, 1200)
    } catch (err) {
      console.error(err)
      const errKey = err?.response?.data?.error
      toast.error(errKey ? t(errKey) : t('system.server_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:600, margin:'40px auto', padding:20}}>
      <h1>{t('profile.title')}</h1>
      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:10}}>
        <label>{t('profile.fields.old_password')}</label>
        <input type="password" name="oldPassword" value={form.oldPassword} onChange={onChange} required />

        <label>{t('profile.fields.new_password')}</label>
        <input type="password" name="newPassword" value={form.newPassword} onChange={onChange} required />

        <label>{t('profile.fields.confirm_password')}</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} required />

        <button type="submit" disabled={loading}>{loading ? t('form.sending') : t('profile.change_button')}</button>
      </form>

      <style jsx>{`
        input { padding:8px; border-radius:6px; border:1px solid #ddd }
        button { background:var(--brand); color:white; padding:8px 12px; border:none; border-radius:6px }
      `}</style>
    </div>
  )
}
