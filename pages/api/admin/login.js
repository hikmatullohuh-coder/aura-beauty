import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import { signAdmin, createCookie, clearCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, admin.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signAdmin(admin)
    createCookie(res, token)
    return res.json({ success: true })
  }

  if (req.method === 'DELETE') {
    clearCookie(res)
    return res.json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
