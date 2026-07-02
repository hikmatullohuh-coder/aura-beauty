import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

export default function AdminLogin() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const router = useRouter()

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await axios.post('/api/admin/login', form)
      router.push('/admin/support')
    } catch (err) {
      const errKey = err?.response?.data?.error
      setError(errKey ? t(errKey) : t('system.server_error'))
    }
  }

  return (
    <div style={{maxWidth:400, margin:'40px auto', padding:20}}>
      <h1>{t('auth.admin.login_title')}</h1>
      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:8}}>
        <input name="email" placeholder={t('auth.admin.email')} value={form.email} onChange={onChange} required />
        <input name="password" placeholder={t('auth.admin.password')} type="password" value={form.password} onChange={onChange} required />
        {error && <div style={{color:'red'}}>{error}</div>}
        <button type="submit">{t('auth.admin.login_button')}</button>
      </form>
    </div>
  )
}
