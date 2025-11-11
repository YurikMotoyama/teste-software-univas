import { describe, it, expect } from 'vitest'
import { normalizeName } from '../../src/utils/normalize'

describe('normalizeName', () => {
    it('testar nome tudo minusculo', () => {
        expect(normalizeName("LUIZ")).toBe("luiz")
    })
})