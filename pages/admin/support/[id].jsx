import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

export default function TicketDetail() {
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
    fetchTicket()
  }

  const changeStatus = async (status) => {
    await axios.patch(`/api/admin/support/${id}`, { status })
    fetchTicket()
  }

  if (!ticket) return <div>Загрузка...</div>

  return (
    <div style={{padding:20}}>
      <h1>Обращение #{ticket.id}</h1>
      <p><strong>Имя:</strong> {ticket.name}</p>
      <p><strong>Email:</strong> {ticket.email}</p>
      <p><strong>Телефон:</strong> {ticket.phone || '-'}</p>
      <p><strong>Тема:</strong> {ticket.topic}</p>
      <p><strong>Статус:</strong> {ticket.status}</p>

      <div style={{marginTop:20}}>
        <h3>История переписки</h3>
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
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{width:'100%'}} />
        <button onClick={sendReply} style={{marginTop:8}}>Отправить ответ</button>
      </div>

      <div style={{marginTop:12}}>
        <button onClick={() => changeStatus('processing')}>Пометить: В обработке</button>
        <button onClick={() => changeStatus('closed')} style={{marginLeft:8}}>Пометить: Закрыто</button>
      </div>
    </div>
  )
}
