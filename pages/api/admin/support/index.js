import prisma from '../../../../lib/prisma'

export default async function handler(req, res) {
  // GET: list tickets
  if (req.method === 'GET') {
    const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json(tickets)
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
