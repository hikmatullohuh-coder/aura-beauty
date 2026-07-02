import { clearCookie, getAdminFromReq } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // logout
  clearCookie(res)
  return res.json({ success: true })
}
