import nodemailer from 'nodemailer'
import prisma from '../../../lib/prisma'

async function verifyRecaptcha(token, ip) {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return true // allow if not configured
  try {
    const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip })
    })
    const json = await res.json()
    // For v3, check score threshold
    return json.success && (json.score ? json.score >= 0.5 : true)
  } catch (e) {
    console.error('recaptcha verify error', e)
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, email, phone, orderNumber, topic, message, recaptchaToken } = req.body
  if (!name || !email || !topic || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const ok = await verifyRecaptcha(recaptchaToken, ip)
  if (!ok) return res.status(400).json({ error: 'reCAPTCHA verification failed' })

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        name,
        email,
        phone: phone || null,
        orderNumber: orderNumber || null,
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
        text: `Новый запрос\n\nИмя: ${name}\nEmail: ${email}\nТелефон: ${phone || '-'}\nНомер заказа: ${orderNumber || '-'}\nТема: ${topic}\n\nСообщение:\n${message}`
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
    return res.status(500).json({ error: 'Server error' })
  }
}
