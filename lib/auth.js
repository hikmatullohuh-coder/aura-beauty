import jwt from 'jsonwebtoken'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'change_me'
const TOKEN_NAME = 'aura_admin_token'

export function signAdmin(admin) {
  const payload = { id: admin.id, email: admin.email }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}

export async function getAdminFromReq(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(TOKEN_NAME + '='))
  if (!match) return null
  const token = match.split('=')[1]
  const payload = verifyToken(token)
  if (!payload) return null
  const admin = await prisma.admin.findUnique({ where: { id: payload.id } })
  return admin
}

export function createCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${TOKEN_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}; SameSite=Lax; ${isProd ? 'Secure' : ''}`
  res.setHeader('Set-Cookie', cookie)
}

export function clearCookie(res) {
  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${TOKEN_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; ${isProd ? 'Secure' : ''}`
  res.setHeader('Set-Cookie', cookie)
}
