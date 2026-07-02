import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminSupportList() {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')

  const fetchTickets = async () => {
    const res = await axios.get('/api/admin/support')
    setTickets(res.data || [])
  }

  useEffect(() => {
    fetchTickets()
    // init socket endpoint
    fetch('/api/socket')
    if (typeof window !== 'undefined' && window.__SOCKET__) {
      window.__SOCKET__.on('support:new', data => {
        // show simple notification and refresh list
        alert('Новый запрос поддержки: ' + data.name)
        fetchTickets()
      })
    }
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
