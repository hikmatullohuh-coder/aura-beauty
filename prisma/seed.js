const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@aura-beauty.test'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123'
  const existing = await prisma.admin.findUnique({ where: { email: adminEmail } })
  if (existing) {
    console.log('Admin already exists:', adminEmail)
    return
  }
  const hashed = await bcrypt.hash(adminPassword, 10)
  const admin = await prisma.admin.create({ data: { email: adminEmail, password: hashed, name: 'Administrator' } })
  console.log('Created admin:', admin.email)
  console.log('Seed admin credentials -> email:', adminEmail, 'password:', adminPassword)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
