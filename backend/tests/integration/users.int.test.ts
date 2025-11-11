import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb } from './testDb'

describe('Users API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })
  beforeEach(async () => {
    await resetDb()
  })
  it('POST /api/users cria usuário válido', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Ana', email: 'ana@ex.com' })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: 'Ana', email: 'ana@ex.com' })
  })
  it('GET /api/users lista usuários', async () => {
    await prisma.user.create({ data: { name: 'Ana', email: 'ana@ex.com' } })
    const res = await request(app).get('/api/users')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((u: any) => u.email === 'ana@ex.com')).toBe(true)
  })
it('PUT /api/users/:id atualiza usuário existente', async () => {
    const user = await prisma.user.create({
      data: { name: 'Ana', email: 'ana@ex.com' },
    })

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ name: 'Ana Maria', email: 'ana.maria@ex.com' })

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: user.id,
      name: 'Ana Maria',
      email: 'ana.maria@ex.com',
    })

    // Confirma no banco
    const updated = await prisma.user.findUnique({ where: { id: user.id } })
    expect(updated?.name).toBe('Ana Maria')
    expect(updated?.email).toBe('ana.maria@ex.com')
  })

  it('DELETE /api/users/:id remove usuário existente', async () => {
    const user = await prisma.user.create({
      data: { name: 'Carlos', email: 'carlos@ex.com' },
    })

    const res = await request(app).delete(`/api/users/${user.id}`)
    expect(res.status).toBe(200) // Sem conteúdo, comum para DELETE

    // Verifica que foi removido
    const deleted = await prisma.user.findUnique({ where: { id: user.id } })
    expect(deleted).toBeNull()
  })
})