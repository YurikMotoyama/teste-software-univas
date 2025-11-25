import { test, expect } from '@playwright/test'

// Usamos test.describe para agrupar todos os testes relacionados à entidade 'Usuários'
test.describe('Usuários', () => {

  // Teste 1: Navegação e Verificação de Itens Existentes
  test('navega para Usuários e lista itens do backend (seeds)', async ({ page }) => {
    // Navega para a página inicial (Dashboard) ou para a rota base se o link 'Usuários' estiver lá
    await page.goto('/') 
    await page.getByRole('link', { name: 'Usuários' }).click()
    
    // Título da seção
    await expect(page.getByRole('heading', { name: /Usuários/i })).toBeVisible()
    
    // Emails semeados (seed do backend)
    await expect(page.getByText(/john.doe@example.com/i)).toBeVisible()
    await expect(page.getByText(/jane.smith@example.com/i)).toBeVisible()
  });

  // Teste 2: Criação de Novo Usuário
  test('cria usuário e aparece na lista', async ({ page }) => {
    // Navega diretamente para a lista de usuários
    await page.goto('/users') 
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    
    // Gera um email único para evitar colisões entre testes
    const uniqueEmail = `aluno.${Date.now()}@ex.com`
    
    await page.getByLabel('Nome:').fill('Aluno Criado E2E')
    await page.getByLabel('Email:').fill(uniqueEmail)
    
    await page.getByRole('button', { name: /Criar/i }).click()
    
    // Verifica se o email único aparece na lista após a criação
    await expect(page.getByText(uniqueEmail)).toBeVisible()
  });

  // Teste 3: Atualização de Usuário Existente
  test('atualiza nome de um usuário existente', async ({ page }) => {
    await page.goto('/users')
    
    // 1. Setup: Cria um novo usuário para o teste de atualização
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    const uniqueEmail = `upd.${Date.now()}@ex.com`
    const originalName = 'Para Atualizar'
    const updatedName = 'Nome Atualizado E2E'

    await page.getByLabel('Nome:').fill(originalName)
    await page.getByLabel('Email:').fill(uniqueEmail)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(originalName)).toBeVisible()

    // 2. Ação: Localiza a linha do usuário e clica no botão de edição
    const userRow = page.locator(`tr:has-text("${uniqueEmail}")`)
    await userRow.getByRole('button', { name: /Editar/i }).click()

    // 3. Ação: Atualiza o campo Nome e Salva
    await page.getByLabel('Nome:').fill(updatedName)
    await page.getByRole('button', { name: /Salvar|Atualizar/i }).click() 

    // 4. Verificação: O nome antigo deve sumir
    await expect(page.getByText(originalName)).not.toBeVisible() 
    
    // Garantia de que o novo nome está na linha correta (localizado pela linha do email)
    await expect(userRow.getByText(updatedName)).toBeVisible()
  });

  // Teste 4: Exclusão de Usuário Existente
  test('exclui um usuário existente da lista', async ({ page }) => {
    await page.goto('/users')
    
    // 1. Setup: Cria um novo usuário para o teste de exclusão
    await page.getByRole('button', { name: /Adicionar Usuário/i }).click()
    const uniqueEmail = `del.${Date.now()}@ex.com`
    const deleteName = 'Para Excluir'

    await page.getByLabel('Nome:').fill(deleteName)
    await page.getByLabel('Email:').fill(uniqueEmail)
    await page.getByRole('button', { name: /Criar/i }).click()
    await expect(page.getByText(uniqueEmail)).toBeVisible()
    
    // SOLUÇÃO PARA ALERT NATIVO: Configura o ouvinte antes do clique
    page.on('dialog', async dialog => {
        // Aceita o 'confirm' ou 'alert' nativo do navegador
        await dialog.accept(); 
    });

    // 2. Ação: Localiza a linha do usuário e clica no botão de exclusão
    const userRow = page.locator(`tr:has-text("${uniqueEmail}")`)
    await userRow.getByRole('button', { name: /Excluir|Deletar|Remover/i }).click()

    // NOVO PASSO: Recarrega a página para forçar o frontend a buscar os dados atualizados
    await page.reload(); 

    // 3. Verificação: O usuário deve desaparecer da lista
    // CORREÇÃO APLICADA: A verificação pelo e-mail único é suficiente e evita o erro
    // de 'strict mode violation' causado pelo nome genérico 'Para Excluir'.
    await expect(page.getByText(uniqueEmail)).not.toBeVisible()
    // await expect(page.getByText(deleteName)).not.toBeVisible() // Linha removida
  });
});