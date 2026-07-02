import prisma from '../../../../../lib/prisma'
import { getAdminFromReq } from '../../../../../lib/auth'

export default async function handler(req, res) {
  const admin = await getAdminFromReq(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  if (req.method === 'GET') {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: parseInt(id, 10) }, include: { messages: true } })
    if (!ticket) return res.status(404).json({ error: 'Not found' })
    return res.json(ticket)
  }

  if (req.method === 'PATCH') {
    const { status } = req.body
    if (!['new','processing','closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
    const updated = await prisma.supportTicket.update({ where: { id: parseInt(id, 10) }, data: { status } })
    // emit socket
    try { global.io?.emit('support:updated', { ticketId: updated.id, status: updated.status }) } catch(e){console.error(e)}
    return res.json(updated)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
