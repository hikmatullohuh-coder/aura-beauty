async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'system.method_not_allowed' })
  const { name, email, phone, topic, message, recaptchaToken } = req.body
  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'validation.required_fields' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const ok = await verifyRecaptcha(recaptchaToken, ip)
  if (!ok) return res.status(400).json({ error: 'support.recaptcha_failed' })

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        name,
        email,
        phone: phone || null,
        topic,
        status: 'new',
        messages: {
          create: [{ sender: 'user', message }]
        }
      },
      include: { messages: true }
    })

    // send email to support inbox
    const supportEmail = process.env.SUPPORT_EMAIL || 'mashxurakhon800@gmail.com'
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
        from: `${name} <${email}>`,
        to: supportEmail,
        subject: `Новый запрос поддержки — ${topic}`,
        text: `Новый запрос\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone || '-'}\nТема: ${topic}\n\nСообщение:\n${message}`
      }

      transporter.sendMail(mailOptions).catch(err => console.error('sendMail error', err))
    }

    // Emit socket notification for admins
    try {
      const io = global.io
      if (io) {
        io.emit('support:new', { id: ticket.id, name: ticket.name, email: ticket.email, topic: ticket.topic, createdAt: ticket.createdAt })
      }
    } catch (e) {
      console.error('socket emit error', e)
    }

    return res.status(201).json({ success: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'system.server_error' })
  }
}
