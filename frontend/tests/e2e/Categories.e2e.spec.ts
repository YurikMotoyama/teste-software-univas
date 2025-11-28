import { test, expect } from '@playwright/test'

// O endpoint '/categories' deve ser acessado por uma navegação ou diretamente
// Assumindo que o link 'Categorias' existe na dashboard ou a rota direta é '/categories'

test.describe('Categorias', () => {

  // --- Teste de Leitura (Read) ---
  test('navega para Categorias e lista itens do backend', async ({ page }) => {
    await page.goto('/categories') // Assumindo rota direta para categorias
    
    // 1. Verifica se o título da seção está visível
    await expect(page.getByRole('heading', { name: /Categorias/i })).toBeVisible()
    
    // 2. Verifica se a lista não está vazia (assumindo que há dados semeados)
    // Aqui verificamos se pelo menos uma linha da tabela é carregada.
    // Se houver dados semeados, você pode testar um nome de categoria específico.
    // Exemplo: await expect(page.getByText(/Desenvolvimento Web/i)).toBeVisible()
    
    // Teste genérico: verifica se a tabela contém linhas de dados (excluindo o cabeçalho)
    // Se o backend retornar uma lista vazia, este teste falhará a menos que ajustado.
    // Para um teste mais robusto, um mock do backend é o ideal.
    const rows = page.locator('.table tbody tr')
    await expect(rows.first()).toBeVisible()
  })
  
  // --- Teste de Criação (Create) ---
  test('cria categoria e aparece na lista', async ({ page }) => {
    await page.goto('/categories')
    
    // 1. Clica no botão para mostrar o formulário
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click()  
    
    // 2. Preenche os dados
    const uniqueName = `Categoria Teste ${Date.now()}`
    const description = 'Descrição de teste para nova categoria'
    
    await page.getByLabel('Nome:').fill(uniqueName)
    await page.getByLabel('Descrição:').fill(description)  
    
    // 3. Submete o formulário de criação
    await page.getByRole('button', { name: /Criar/i }).click()
    
    // 4. Aguarda recarga da lista e verifica se a nova categoria está visível
    await expect(page.getByText(uniqueName)).toBeVisible()
    await expect(page.getByText(description)).toBeVisible()
  })

  // --- Teste de Atualização (Update) ---
  test('atualiza categoria existente', async ({ page }) => {
    await page.goto('/categories')
    
    // 1. Cria uma categoria para ser atualizada
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
    const originalName = 'Categoria Original'
    const originalDescription = 'Desc. Original'
    await page.getByLabel('Nome:').fill(originalName)
    await page.getByLabel('Descrição:').fill(originalDescription)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(originalName)).toBeVisible()

    // 2. Localiza a linha da categoria e clica em 'Editar'
    const categoryRow = page.locator('tr', { hasText: originalName })
    await categoryRow.getByRole('button', { name: /Editar/i }).click()

    // 3. Verifica se o formulário está no modo de edição
    await expect(page.getByRole('button', { name: 'Atualizar' })).toBeVisible()
    
    // 4. Preenche os novos dados
    const updatedName = 'Nome Atualizado E2E'
    const updatedDescription = 'Descrição Atualizada E2E'

    await page.getByLabel('Nome:').fill(updatedName)
    await page.getByLabel('Descrição:').fill(updatedDescription)

    // 5. Submete a atualização
    await page.getByRole('button', { name: /Atualizar/i }).click()

    // 6. Verifica se os novos dados estão visíveis e os antigos não
    await expect(page.getByText(updatedName)).toBeVisible()
    await expect(page.getByText(updatedDescription)).toBeVisible()

    await expect(page.getByText(originalName)).not.toBeVisible()
    await expect(page.getByText(originalDescription)).not.toBeVisible()
  })

  // --- Teste de Exclusão (Delete) ---
  test('exclui categoria existente e confirma exclusão', async ({ page }) => {
    await page.goto('/categories')
    
    // 1. Cria uma categoria para ser excluída
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
    const categoryToDeleteName = `Deletar Categoria ${Date.now()}`
    await page.getByLabel('Nome:').fill(categoryToDeleteName)
    await page.getByRole('button', { name: /Criar/i }).click()

    await expect(page.getByText(categoryToDeleteName)).toBeVisible()

    // 2. Configura a escuta do diálogo de confirmação (window.confirm)
    page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Tem certeza que deseja excluir esta categoria?')
        
        // Aceita a exclusão
        await dialog.accept()
    })
    
    // 3. Localiza a linha da categoria e clica em 'Excluir'
    const categoryRow = page.locator('tr', { hasText: categoryToDeleteName })
    await categoryRow.getByRole('button', { name: /Excluir/i }).click()

    // 4. Verifica se a categoria foi removida da lista
    await expect(page.getByText(categoryToDeleteName)).not.toBeVisible()
  })

});