import { test, expect } from '@playwright/test'

test.describe('Tarefas', () => {

  // --- Teste de Leitura (Read) ---
  test('navega para Tarefas e lista itens do backend', async ({ page }) => {
    await page.goto('/tasks') // Assumindo rota direta para tarefas
    
    // 1. Verifica se o título da seção está visível
    await expect(page.getByRole('heading', { name: /Tarefas|Tasks/i })).toBeVisible()
    
    // 2. Verifica se a lista não está vazia
    // Teste genérico: verifica se a tabela contém linhas de dados
    const rows = page.locator('.table tbody tr')
    await expect(rows.first()).toBeVisible()
  })
  
  // --- Teste de Criação (Create) ---
  test('cria tarefa e aparece na lista', async ({ page }) => {
    await page.goto('/tasks')
    
    // 1. Clica no botão para mostrar o formulário
    await page.getByRole('button', { name: /Adicionar Tarefa|Nova Tarefa/i }).click()  
    
    // 2. Preenche os dados
    const uniqueTitle = `Tarefa Teste ${Date.now()}`
    const description = 'Descrição da tarefa de teste E2E'
    
    // Usamos Regex no label para aceitar "Título", "Nome" ou "Title"
    await page.getByLabel(/Título:/).fill(uniqueTitle)
    await page.getByLabel(/Descrição/i).fill(description)  
    
    // 3. Submete o formulário de criação
    await page.getByRole('button', { name: /Criar|Salvar/i }).click()
    
    // 4. Aguarda recarga da lista e verifica se a nova tarefa está visível
    await expect(page.getByText(uniqueTitle)).toBeVisible()
    // Verifica a descrição (opcional, dependendo se ela aparece na listagem)
    await expect(page.getByText(description)).toBeVisible()
  })

  // --- Teste de Atualização (Update) ---
  test('atualiza tarefa existente', async ({ page }) => {
    await page.goto('/tasks')
    
    // 1. Setup: Cria uma tarefa para ser atualizada (isolamento de teste)
    await page.getByRole('button', { name: /Adicionar Tarefa/i }).click()
    const originalTitle = `Tarefa Original ${Date.now()}`
    const originalDescription = 'Desc. Original'
    
    await page.getByLabel(/Título:/).fill(originalTitle)
    await page.getByLabel(/Descrição/i).fill(originalDescription)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(originalTitle)).toBeVisible()

    // 2. Localiza a linha da tarefa e clica em 'Editar'
    const taskRow = page.locator('tr', { hasText: originalTitle })
    await taskRow.getByRole('button', { name: /Editar/i }).click()

    // 3. Verifica se o formulário está no modo de edição (botão muda para Atualizar/Salvar)
    await expect(page.getByRole('button', { name: /Atualizar|Salvar/i })).toBeVisible()
    
    // 4. Preenche os novos dados
    const updatedTitle = `Tarefa Atualizada E2E ${Date.now()}`
    const updatedDescription = 'Descrição Atualizada E2E'

    await page.getByLabel(/Título|Nome/i).fill(updatedTitle)
    await page.getByLabel(/Descrição/i).fill(updatedDescription)

    // 5. Submete a atualização
    await page.getByRole('button', { name: /Atualizar|Salvar/i }).click()

    // 6. Verifica se os novos dados estão visíveis e os antigos não
    await expect(page.getByText(updatedTitle)).toBeVisible()
    await expect(page.getByText(updatedDescription)).toBeVisible()

    await expect(page.getByText(originalTitle)).not.toBeVisible()
  })

  // --- Teste de Exclusão (Delete) ---
  test('exclui tarefa existente e confirma exclusão', async ({ page }) => {
    await page.goto('/tasks')
    
    // 1. Setup: Cria uma tarefa para ser excluída
    await page.getByRole('button', { name: /Adicionar Tarefa/i }).click()
    const taskToDeleteTitle = `Deletar Tarefa ${Date.now()}`
    
    await page.getByLabel(/Título|Nome/i).fill(taskToDeleteTitle)
    await page.getByRole('button', { name: /Criar/i }).click()

    await expect(page.getByText(taskToDeleteTitle)).toBeVisible()

    // 2. Configura a escuta do diálogo de confirmação
    page.on('dialog', async (dialog) => {
        // Verifica se a mensagem faz sentido (opcional)
        // expect(dialog.message()).toContain('excluir')
        
        // Aceita a exclusão
        await dialog.accept()
    })
    
    // 3. Localiza a linha da tarefa e clica em 'Excluir'
    const taskRow = page.locator('tr', { hasText: taskToDeleteTitle })
    await taskRow.getByRole('button', { name: /Excluir|Deletar|Remover/i }).click()

    // 4. Verifica se a tarefa foi removida da lista
    await expect(page.getByText(taskToDeleteTitle)).not.toBeVisible()
  })

});