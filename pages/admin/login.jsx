import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function AdminLogin() {
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
      setError(err?.response?.data?.error || 'Ошибка входа')
    }
  }

  return (
    <div style={{maxWidth:400, margin:'40px auto', padding:20}}>
      <h1>Вход — админ</h1>
      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:8}}>
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" placeholder="Пароль" type="password" value={form.password} onChange={onChange} required />
        {error && <div style={{color:'red'}}>{error}</div>}
        <button type="submit">Войти</button>
      </form>
    </div>
  )
}
