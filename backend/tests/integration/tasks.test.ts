import { describe, it, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb, seedMinimal } from './testDb'

describe('Tasks API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('POST /api/tasks cria tarefa válida', async () => {
    const { user, category } = await seedMinimal()

    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Estudar Vitest',
        description: 'Revisar documentação e exemplos',
        userId: user.id,
        categoryId: category.id,
      })

    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({
      title: 'Estudar Vitest',
      description: 'Revisar documentação e exemplos',
      userId: user.id,
      categoryId: category.id,
    })

    const task = await prisma.task.findUnique({ where: { id: res.body.data.id } })
    expect(task).not.toBeNull()
  })

  it('GET /api/tasks lista tarefas', async () => {
    const { user, category } = await seedMinimal()

    await prisma.task.create({
      data: {
        title: 'Tarefa 1',
        description: 'Primeira tarefa',
        userId: user.id,
        categoryId: category.id,
      },
    })

    const res = await request(app).get('/api/tasks')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThanOrEqual(1)
    expect(res.body.data[0]).toHaveProperty('title')
  })

  it('GET /api/tasks/:id retorna tarefa específica', async () => {
    const { user, category } = await seedMinimal()

    const task = await prisma.task.create({
      data: {
        title: 'Estudar Express',
        description: 'Rever middlewares',
        userId: user.id,
        categoryId: category.id,
      },
    })

    const res = await request(app).get(`/api/tasks/${task.id}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: task.id,
      title: 'Estudar Express',
    })
  })

  it('PUT /api/tasks/:id atualiza tarefa existente', async () => {
    const { user, category } = await seedMinimal()

    const task = await prisma.task.create({
      data: {
        title: 'Aprender Prisma',
        description: 'Estudar ORM do Prisma',
        userId: user.id,
        categoryId: category.id,
      },
    })

    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({
        title: 'Aprender Prisma ORM',
        description: 'Atualizado com mais detalhes',
      })

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: task.id,
      title: 'Aprender Prisma ORM',
    })

    const updated = await prisma.task.findUnique({ where: { id: task.id } })
    expect(updated?.title).toBe('Aprender Prisma ORM')
  })

  it('DELETE /api/tasks/:id remove tarefa existente', async () => {
    const { user, category } = await seedMinimal()

    const task = await prisma.task.create({
      data: {
        title: 'Tarefa para deletar',
        description: 'Será removida no teste',
        userId: user.id,
        categoryId: category.id,
      },
    })

    const res = await request(app).delete(`/api/tasks/${task.id}`)

    expect([200, 204]).toContain(res.status)
    const deleted = await prisma.task.findUnique({ where: { id: task.id } })
    expect(deleted).toBeNull()
  })
})
