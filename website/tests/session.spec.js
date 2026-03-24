import { test, expect } from '@playwright/test';

test('Debe hacer login y almacenar la cookie en el browser', async ({ page }) => {
  // 1. Va a tu web local
  await page.goto('http://localhost:5173/Login');

  // 2. Llena credenciales
  await page.fill('input[name="email"]', 'admin@geoterra.com');
  await page.fill('input[name="password"]', 'MiPasswordSeguro123');

  // 3. Hace clic en Acceder
  await page.click('button[type="submit"]');

  // 4. Se asegura que hayamos navegado al dashboard
  await expect(page).toHaveURL(/.*Dashboard/);

  // 5. Opcional: validar que el contexto guardó una cookie generada por la API
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'PHPSESSID' || c.name === 'geoterra_session_token');
  expect(sessionCookie).toBeDefined();
});

test('Debe mostrar Mi Perfil en el header del home cuando hay sesión activa', async ({ page }) => {
  // 1. Va a tu web local (login)
  await page.goto('http://localhost:5173/Login');

  // 2. Hace login
  await page.fill('input[name="email"]', 'admin@geoterra.com');
  await page.fill('input[name="password"]', 'MiPasswordSeguro123');
  await page.click('button[type="submit"]');

  // 3. Espera a que estemos en el dashboard
  await expect(page).toHaveURL(/.*Dashboard/);

  // 4. Navegamos al home ('/') de vuelta para ver el common Header
  await page.goto('http://localhost:5173/');

  // 5. Verificamos que ahora el botón superior diga "Mi Perfil" y NO "Iniciar Sesión"
  const headerLocator = page.locator('header'); // nuestro tag del common Header
  await expect(headerLocator).toContainText('Mi Perfil');
  await expect(headerLocator).not.toContainText('Iniciar Sesión');
});