export default async function handler(req, res) {
  const admin = await getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'auth.unauthorized' })

  const { id } = req.query
  if (req.method !== 'POST') return res.status(405).json({ error: 'system.method_not_allowed' })
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'validation.required_fields' })

  try {
    const ticketId = parseInt(id, 10)
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } })
    if (!ticket) return res.status(404).json({ error: 'system.not_found' })

    const msg = await prisma.supportMessage.create({
      data: { ticketId, sender: 'admin', message }
    })

    // Optionally update status to processing
    await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'processing' } })

    // send email to user
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      const mailOptions = {
        from: `${admin.name || 'Aura Beauty'} <${process.env.SMTP_USER}>`,
        to: ticket.email,
        subject: `Ответ по вашему обращению #${ticket.id}`,
        text: `Здравствуйте ${ticket.name},\n\nНаш ответ: \n${message}\n\nС уважением, Aura Beauty`
      }

      transporter.sendMail(mailOptions).catch(err => console.error('sendMail error', err))
    }

    // notify admin clients (update)
    try {
      const io = global.io
      if (io) io.emit('support:updated', { ticketId, status: 'processing' })
    } catch (e) { console.error(e) }

    return res.status(201).json({ success: true, message: msg })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'system.server_error' })
  }
}
