import { getAdminFromReq } from '../../../lib/auth'

export default async function handler(req, res) {
  const admin = await getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })
  return res.json({ id: admin.id, email: admin.email, name: admin.name })
}
