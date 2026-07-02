import { getAdminFromReq, clearCookie } from '../../../lib/auth'
import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const admin = await getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({ error: 'All fields required' })
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'New password and confirmation do not match' })
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' })

    const ok = await bcrypt.compare(oldPassword, admin.password)
    if (!ok) return res.status(401).json({ error: 'Old password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed, passwordChangedAt: new Date() } })

    // clear cookie to force logout from this session; token invalidation handled by passwordChangedAt check
    clearCookie(res)

    return res.json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
