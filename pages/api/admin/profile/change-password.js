export default async function handler(req, res) {
  const admin = await getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'auth.unauthorized' })

  if (req.method === 'POST') {
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (!oldPassword || !newPassword || !confirmPassword) return res.status(400).json({ error: 'validation.required_fields' })
    if (newPassword !== confirmPassword) return res.status(400).json({ error: 'profile.password_mismatch' })
    if (newPassword.length < 8) return res.status(400).json({ error: 'profile.password_too_short' })

    const ok = await bcrypt.compare(oldPassword, admin.password)
    if (!ok) return res.status(401).json({ error: 'profile.old_password_invalid' })
    if (oldPassword === newPassword) return res.status(400).json({ error: 'profile.password_same_as_old' })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed, passwordChangedAt: new Date() } })

    // clear cookie to force logout from this session; token invalidation handled by passwordChangedAt check
    clearCookie(res)

    return res.json({ success: true })
  }

  return res.status(405).json({ error: 'system.method_not_allowed' })
}
