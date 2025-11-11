// vitest.setup.ts
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { afterAll } from 'vitest'

const workerId = process.env.VITEST_WORKER_ID ?? '0'
const baseUrl =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres123@postgres:5432/teste_software_db'

const schema = `test_schema_${workerId}`

// Ajusta a DATABASE_URL para incluir o schema
process.env.DATABASE_URL = `${baseUrl}?schema=${schema}`
// console.log(`[Vitest] Worker ${workerId} usando DB: ${process.env.DATABASE_URL}`)

const prisma = new PrismaClient()

async function setupSchemaAndPush() {
    try {
        // 1) cria o schema
        await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}";`)

        // 2) usa prisma db push para criar as tabelas no schema recém-criado
        //    -> db push utiliza a DATABASE_URL atual (com ?schema=...), então vai aplicar no schema correto
        // console.log(`[Vitest] Aplicando prisma db push no schema ${schema}...`)
        execSync('npx prisma db push --accept-data-loss --skip-generate', {
            stdio: 'pipe',
            env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: 'true' }
        })
        // console.log(`[Vitest] db push concluído para ${schema}`)
    } catch (err) {
        // console.error(`[Vitest] Erro ao preparar schema ${schema}:`, err)
        // não throw: queremos que o teste continue para coletar logs, mas provavelmente falhará se as tabelas não existirem
    } finally {
        await prisma.$disconnect()
    }
}

await setupSchemaAndPush()

// limpa o schema após os testes do worker
afterAll(async () => {
    const prismaDrop = new PrismaClient()
    try {
        await prismaDrop.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`)
        // console.log(`[Vitest] Schema ${schema} removido.`)
    } catch (err) {
        // console.warn(`[Vitest] Falha ao remover schema ${schema}:`, err)
    } finally {
        await prismaDrop.$disconnect()
    }
})