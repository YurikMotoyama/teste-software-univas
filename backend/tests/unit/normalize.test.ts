import { describe, it, expect } from 'vitest'
import { normalizeName } from '../../src/utils/normalize'

describe('normalizeName', () =>{
    it('Altera nome para LowerCase', () =>{
        expect(normalizeName('YURIK')).toBe('yurik')
    })
})

