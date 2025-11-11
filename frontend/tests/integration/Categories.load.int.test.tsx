import { render, screen, waitFor } from '@testing-library/react'
import Categories from '../../src/components/Categories'
import { server, apiGet, json } from '../setup'

describe('Categories integration - carga de lista', () => {
  it('renderiza categorias retornadas pela API', async () => {
    // Configura a simulação da API
    server.use(
      apiGet('/categories', (_req) =>
        json({
          data: [
            { 
              id: '1', 
              name: 'Trabalho', 
              description: 'Tarefas relacionadas ao trabalho', 
              createdAt: new Date().toISOString(), 
              tasks: [{ id: 't1', title: 'Reunião', user: { id: 'u1', name: 'Ana' } }]
            },
          ],
        })
      )
    )

    render(<Categories />)

    // Aguarda a renderização dos dados
    await waitFor(() => {
      expect(screen.getByText('Trabalho')).toBeInTheDocument()
      expect(screen.getByText('Tarefas relacionadas ao trabalho')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // número de tarefas
      expect(screen.getByText('Categorias')).toBeInTheDocument()
    })
  })
})
