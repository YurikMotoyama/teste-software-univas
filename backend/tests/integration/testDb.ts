import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function resetDb() {
  await prisma.task.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
}

export async function seedMinimal() {
  const user = await prisma.user.create({
    data: { name: 'Ana', email: 'ana@ex.com' },
  })

  const category = await prisma.category.create({
    data: { name: 'Work' },
  })

  return { user, category }
}

export async function createTestUser(data?: { name?: string; email?: string }) {
  const user = await prisma.user.create({
    data: {
      name: data?.name ?? 'Usuário Teste',
      email: data?.email ?? 'user@teste.com',
    },
  })
  return user
}

export async function updateTestUser(id: number, data: { name?: string; email?: string }) {
  const user = await prisma.user.update({
    where: { id },
    data,
  })
  return user
}

export async function deleteTestUser(id: number) {
  await prisma.user.delete({ where: { id } })
}
