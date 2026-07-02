import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

export default function AdminSupportList() {
  const { t } = useTranslation()
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
      toast.error(t('toast.save_error'))
    }
  }

  useEffect(() => {
    axios.get('/api/admin/me').then(() => {
      fetchTickets()
      fetch('/api/socket')
      if (typeof window !== 'undefined' && window.__SOCKET__) {
        window.__SOCKET__.on('support:new', data => {
          toast.info(t('toast.new_ticket', { name: data.name || '—' }))
          fetchTickets()
        })
        window.__SOCKET__.on('support:updated', data => {
          toast.info(t('toast.ticket_updated', { id: data.ticketId, status: data.status }))
          fetchTickets()
        })
      }
    }).catch(() => router.push('/admin/login'))
  }, [])

  const filtered = tickets.filter(ti => {
    if (!search) return true
    const s = search.toLowerCase()
    return (ti.name || '').toLowerCase().includes(s) || (ti.email || '').toLowerCase().includes(s)
  })

  return (
    <div className="container">
      <h1>{t('admin.support_section')}</h1>
      <input placeholder={t('admin.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
      <table>
        <thead>
          <tr><th>{t('list.headers.id')}</th><th>{t('list.headers.name')}</th><th>{t('list.headers.email')}</th><th>{t('list.headers.topic')}</th><th>{t('list.headers.status')}</th><th>{t('list.headers.date')}</th></tr>
        </thead>
        <tbody>
          {filtered.map(tk => (
            <tr key={tk.id}>
              <td><a href={`/admin/support/${tk.id}`}>{tk.id}</a></td>
              <td>{tk.name}</td>
              <td>{tk.email}</td>
              <td>{tk.topic}</td>
              <td>{tk.status}</td>
              <td>{new Date(tk.createdAt).toLocaleString()}</td>
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
