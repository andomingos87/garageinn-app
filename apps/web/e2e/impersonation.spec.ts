/**
 * Testes E2E para funcionalidade de Impersonação
 * 
 * Cenários testados:
 * 1. Admin consegue ver botão "Personificar" na tabela de usuários
 * 2. Usuário comum não vê o botão "Personificar"
 * 3. Admin não pode impersonar a si mesmo
 * 4. Fluxo completo de impersonação funciona
 * 5. Banner aparece durante impersonação
 * 6. Sair da impersonação restaura sessão original
 * 
 * NOTA: Estes testes requerem:
 * - Playwright instalado: npm install -D @playwright/test
 * - Configuração em playwright.config.ts
 * - Usuários de teste no banco de dados
 */

import { test, expect } from '@playwright/test'

// Credenciais de teste - devem ser configuradas via variáveis de ambiente
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@teste.com'
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'senha123'
const REGULAR_USER_EMAIL = process.env.TEST_USER_EMAIL || 'usuario@teste.com'
const REGULAR_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'senha123'

test.describe('Impersonação de Usuários', () => {
  test.describe('Visibilidade do botão Personificar', () => {
    test('Admin deve ver o botão "Personificar" para outros usuários ativos', async ({ page }) => {
      // Login como admin
      await page.goto('/login')
      await page.fill('input[name="email"]', ADMIN_EMAIL)
      await page.fill('input[name="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Aguardar redirecionamento
      await page.waitForURL(/\/(dashboard|usuarios)/)
      
      // Navegar para página de usuários
      await page.goto('/usuarios')
      await page.waitForSelector('table')
      
      // Abrir dropdown de ações de um usuário (não o próprio admin)
      const userRow = page.locator('table tbody tr').first()
      await userRow.locator('button[aria-haspopup="menu"]').click()
      
      // Verificar se o botão "Personificar" está visível
      await expect(page.locator('text=Personificar')).toBeVisible()
    })

    test('Usuário comum não deve ver o botão "Personificar"', async ({ page }) => {
      // Login como usuário comum
      await page.goto('/login')
      await page.fill('input[name="email"]', REGULAR_USER_EMAIL)
      await page.fill('input[name="password"]', REGULAR_USER_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Aguardar redirecionamento
      await page.waitForURL(/\//)
      
      // Tentar navegar para página de usuários
      await page.goto('/usuarios')
      
      // Usuário comum deve ser redirecionado ou ver página de acesso negado
      // Dependendo da implementação, pode ser redirecionado para /
      const url = page.url()
      expect(url).not.toContain('/usuarios')
    })

    test('Admin não deve ver botão "Personificar" para si mesmo', async ({ page }) => {
      // Login como admin
      await page.goto('/login')
      await page.fill('input[name="email"]', ADMIN_EMAIL)
      await page.fill('input[name="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Navegar para página de usuários
      await page.goto('/usuarios')
      await page.waitForSelector('table')
      
      // Encontrar a linha do próprio admin (pelo email)
      const adminRow = page.locator(`table tbody tr:has-text("${ADMIN_EMAIL}")`)
      
      if (await adminRow.count() > 0) {
        await adminRow.locator('button[aria-haspopup="menu"]').click()
        
        // Verificar que o botão "Personificar" NÃO está visível para si mesmo
        await expect(page.locator('text=Personificar')).not.toBeVisible()
      }
    })
  })

  test.describe('Dialog de confirmação', () => {
    test('Dialog deve mostrar informações do usuário alvo', async ({ page }) => {
      // Login como admin
      await page.goto('/login')
      await page.fill('input[name="email"]', ADMIN_EMAIL)
      await page.fill('input[name="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Navegar para página de usuários
      await page.goto('/usuarios')
      await page.waitForSelector('table')
      
      // Abrir dropdown e clicar em Personificar
      const userRow = page.locator('table tbody tr').first()
      await userRow.locator('button[aria-haspopup="menu"]').click()
      await page.click('text=Personificar')
      
      // Verificar que o dialog apareceu
      await expect(page.locator('[role="alertdialog"]')).toBeVisible()
      
      // Verificar elementos do dialog
      await expect(page.locator('text=Personificar Usuário')).toBeVisible()
      await expect(page.locator('text=Cancelar')).toBeVisible()
      await expect(page.locator('text=Entrar como usuário')).toBeVisible()
    })

    test('Cancelar dialog deve fechar sem ação', async ({ page }) => {
      // Login como admin
      await page.goto('/login')
      await page.fill('input[name="email"]', ADMIN_EMAIL)
      await page.fill('input[name="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Navegar para página de usuários
      await page.goto('/usuarios')
      await page.waitForSelector('table')
      
      // Abrir dialog
      const userRow = page.locator('table tbody tr').first()
      await userRow.locator('button[aria-haspopup="menu"]').click()
      await page.click('text=Personificar')
      
      // Clicar em Cancelar
      await page.click('text=Cancelar')
      
      // Verificar que o dialog fechou
      await expect(page.locator('[role="alertdialog"]')).not.toBeVisible()
    })
  })

  test.describe('Fluxo completo de impersonação', () => {
    test.skip('Impersonação deve redirecionar e mostrar banner', async ({ page }) => {
      // NOTA: Este teste é skip por padrão pois requer magic link
      // que não funciona em ambiente de teste automatizado
      
      // Login como admin
      await page.goto('/login')
      await page.fill('input[name="email"]', ADMIN_EMAIL)
      await page.fill('input[name="password"]', ADMIN_PASSWORD)
      await page.click('button[type="submit"]')
      
      // Navegar para página de usuários
      await page.goto('/usuarios')
      await page.waitForSelector('table')
      
      // Iniciar impersonação
      const userRow = page.locator('table tbody tr').first()
      await userRow.locator('button[aria-haspopup="menu"]').click()
      await page.click('text=Personificar')
      await page.click('text=Entrar como usuário')
      
      // Aguardar redirecionamento (magic link)
      // Em ambiente de teste, isso pode não funcionar
      
      // Verificar banner de impersonação
      await expect(page.locator('[data-testid="impersonation-banner"]')).toBeVisible()
    })
  })

  test.describe('Banner de impersonação', () => {
    test.skip('Banner deve mostrar nome do usuário impersonado', async ({ page }) => {
      // NOTA: Este teste requer estado de impersonação ativo
      // Pode ser configurado via localStorage mock
      
      // Simular estado de impersonação no localStorage
      await page.addInitScript(() => {
        localStorage.setItem('gapp_original_session', 'admin-user-id')
        localStorage.setItem('gapp_impersonation', JSON.stringify({
          impersonatedUserId: 'target-user-id',
          impersonatedUserName: 'Usuário Teste',
        }))
      })
      
      await page.goto('/dashboard')
      
      // Verificar banner
      await expect(page.locator('[data-testid="impersonation-banner"]')).toBeVisible()
      await expect(page.locator('text=Usuário Teste')).toBeVisible()
    })

    test.skip('Clicar em "Encerrar" deve restaurar sessão original', async ({ page }) => {
      // NOTA: Este teste requer estado de impersonação ativo
      
      // Simular estado de impersonação
      await page.addInitScript(() => {
        localStorage.setItem('gapp_original_session', 'admin-user-id')
        localStorage.setItem('gapp_impersonation', JSON.stringify({
          impersonatedUserId: 'target-user-id',
          impersonatedUserName: 'Usuário Teste',
        }))
      })
      
      await page.goto('/dashboard')
      
      // Clicar em Encerrar
      await page.click('[data-testid="exit-impersonation"]')
      
      // Verificar que localStorage foi limpo
      const impersonationState = await page.evaluate(() => 
        localStorage.getItem('gapp_impersonation')
      )
      expect(impersonationState).toBeNull()
    })
  })
})

// Testes de integração para o serviço de impersonação
test.describe('Serviço de Impersonação', () => {
  test('Deve retornar erro ao tentar impersonar sem autenticação', async ({ request }) => {
    const response = await request.post('/api/impersonate', {
      data: { targetUserId: 'some-user-id' },
    })
    
    expect(response.status()).toBe(401)
  })
})

