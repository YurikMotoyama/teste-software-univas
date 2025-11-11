/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Define o arquivo de setup (executado antes dos testes)
        setupFiles: ['./vitest.setup.ts'],

        // Usa ambiente Node (padrão pra API)
        environment: 'node',

        // Define diretórios de teste
        include: ['tests/**/*.test.ts'],

        // Ativa isolamento real de cada teste (importante p/ múltiplos DBs)
        isolate: true,

        // Timeout razoável pra testes de integração
        testTimeout: 10000,
    },
})