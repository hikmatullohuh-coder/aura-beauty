import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

export default function TicketDetail() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const [ticket, setTicket] = useState(null)
  const [message, setMessage] = useState('')

  const fetchTicket = async () => {
    if (!id) return
    try {
      const res = await axios.get(`/api/admin/support/${id}`)
      setTicket(res.data)
    } catch (e) {
      if (e.response && e.response.status === 401) {
        router.push('/admin/login')
        return
      }
      console.error(e)
    }
  }

  useEffect(() => { fetchTicket() }, [id])

  const sendReply = async () => {
    if (!message) return
    await axios.post(`/api/admin/support/${id}/reply`, { message })
    setMessage('')
    // show toast via client socket listener or refresh
    fetchTicket()
  }

  const changeStatus = async (status) => {
    await axios.patch(`/api/admin/support/${id}`, { status })
    fetchTicket()
  }

  if (!ticket) return <div>{t('system.loading')}</div>

  return (
    <div style={{padding:20}}>
      <h1>{t('ticket.title')} #{ticket.id}</h1>
      <p><strong>{t('list.headers.name')}:</strong> {ticket.name}</p>
      <p><strong>{t('list.headers.email')}:</strong> {ticket.email}</p>
      <p><strong>{t('list.headers.topic')}:</strong> {ticket.topic}</p>
      <p><strong>{t('list.headers.status')}:</strong> {ticket.status}</p>

      <div style={{marginTop:20}}>
        <h3>{t('ticket.history')}</h3>
        <div style={{border:'1px solid #eee', padding:12}}>
          {ticket.messages.map(m => (
            <div key={m.id} style={{marginBottom:10}}>
              <div><strong>{m.sender}</strong> — <small>{new Date(m.createdAt).toLocaleString()}</small></div>
              <div>{m.message}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:20}}>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{width:'100%'}} placeholder={t('ticket.reply_placeholder')} />
        <button onClick={sendReply} style={{marginTop:8}}>{t('ticket.reply_button')}</button>
      </div>

      <div style={{marginTop:12}}>
        <button onClick={() => changeStatus('processing')}>{t('ticket.mark_processing')}</button>
        <button onClick={() => changeStatus('closed')} style={{marginLeft:8}}>{t('ticket.mark_closed')}</button>
      </div>
    </div>
  )
}
