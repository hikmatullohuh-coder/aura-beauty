import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

export default function AdminSupportList() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')
  const router = useRouter()

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/admin/support')
      setTickets(res.data || [])
    } catch (e) {
      console.error(e)
      if (e.response && e.response.status === 401) {
        router.push('/admin/login')
        return
      }
      toast.error('Не удалось загрузить обращения')
    }
  }

  useEffect(() => {
    // check auth
    axios.get('/api/admin/me').then(() => {
      fetchTickets()
      // init socket endpoint
      fetch('/api/socket')
      if (typeof window !== 'undefined' && window.__SOCKET__) {
        window.__SOCKET__.on('support:new', data => {
          toast.info('Новый запрос поддержки: ' + (data.name || '—'))
          fetchTickets()
        })
        window.__SOCKET__.on('support:updated', data => {
          toast.info(`Обращение #${data.ticketId} обновлено: ${data.status}`)
          fetchTickets()
        })
      }
    }).catch(() => router.push('/admin/login'))
  }, [])

  const filtered = tickets.filter(t => {
    if (!search) return true
    const s = search.toLowerCase()
    return (t.name || '').toLowerCase().includes(s) || (t.email || '').toLowerCase().includes(s) || (t.orderNumber || '').toLowerCase().includes(s)
  })

  return (
    <div className="container">
      <h1>Админ — Поддержка</h1>
      <input placeholder="Поиск по имени, email, номеру заказа" value={search} onChange={e => setSearch(e.target.value)} />
      <table>
        <thead>
          <tr><th>ID</th><th>Имя</th><th>Email</th><th>Заказ</th><th>Тема</th><th>Статус</th><th>Дата</th></tr>
        </thead>
        <tbody>
          {filtered.map(t => (
            <tr key={t.id}>
              <td><a href={`/admin/support/${t.id}`}>{t.id}</a></td>
              <td>{t.name}</td>
              <td>{t.email}</td>
              <td>{t.orderNumber || '-'}</td>
              <td>{t.topic}</td>
              <td>{t.status}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .container { padding:20px }
        table { width:100%; border-collapse:collapse; margin-top:12px }
        th, td { padding:8px; border-bottom:1px solid #eee; text-align:left }
        input { padding:8px; width:100%; max-width:600px }
      `}</style>
    </div>
  )
}
