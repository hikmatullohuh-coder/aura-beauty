import prisma from '../../../../lib/prisma'
import { getAdminFromReq } from '../../../../lib/auth'

export default async function handler(req, res) {
  // GET: list tickets
  const admin = await getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json(tickets)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
