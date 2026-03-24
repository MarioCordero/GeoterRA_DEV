import { test, expect } from '@playwright/test';

test('Debe hacer login como admin y almacenar la cookie en el browser', async ({ page }) => {
  // 1. Va a tu web local
  await page.goto('http://localhost:5173/Login');

  // 2. Llena credenciales
  await page.fill('input[name="email"]', 'mario@gmail.com');
  await page.fill('input[name="password"]', 'Mario2003*');

  // 3. Hace clic en Acceder
  await page.click('button[type="submit"]');

  // 4. Se asegura que hayamos navegado al dashboard
  await expect(page).toHaveURL(/.*Dashboard/);

  // 5. Opcional: validar que el contexto guardó una cookie generada por la API
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'PHPSESSID' || c.name === 'geoterra_session_token');
  expect(sessionCookie).toBeDefined();

  // 6. Ahora hacemos logout - Click en el botón de logout
  await page.click('button:has-text("Cerrar sesión")');

  // 7. Confirmamos el logout en el modal
  await page.click('button:has-text("Sí, cerrar sesión")');

  // 8. Verificamos que fuimos redirigidos a la página principal
  await expect(page).toHaveURL('http://localhost:5173/Login');

  // 9. Verificamos que la cookie de sesión fue eliminada
  const cookiesAfterLogout = await page.context().cookies();
  const sessionCookieAfterLogout = cookiesAfterLogout.find(c => c.name === 'PHPSESSID' || c.name === 'geoterra_session_token');
  expect(sessionCookieAfterLogout).toBeUndefined();
});

test('Debe mostrar Mi Perfil en el header del home cuando hay sesión activa', async ({ page }) => {
  // 1. Va a tu web local (login)
  await page.goto('http://localhost:5173/Login');

  // 2. Hace login
  await page.fill('input[name="email"]', 'mario@gmail.com');
  await page.fill('input[name="password"]', 'Mario2003*');
  await page.click('button[type="submit"]');

  // 3. Espera a que estemos en el dashboard
  await expect(page).toHaveURL(/.*Dashboard/);

  // 4. Navegamos al home ('/') de vuelta para ver el common Header
  await page.goto('http://localhost:5173/');

  // 5. Verificamos que ahora el botón superior diga "Mi Perfil" y NO "Iniciar Sesión"
  const headerLocator = page.locator('header'); // nuestro tag del common Header
  await expect(headerLocator).toContainText('Mi Perfil');
  await expect(headerLocator).not.toContainText('Iniciar Sesión');

  // 6. Navegamos al perfil del usuario
  await page.click('a:has-text("Mi Perfil"), button:has-text("Mi Perfil"), [data-testid="profile-link"]');
  
  // 7. Esperamos a que estemos en la página de perfil
  await expect(page).toHaveURL(/.*Dashboard/);

  // 8. Click en el botón de logout
  await page.click('button:has-text("Cerrar sesión")');

  // 9. Confirmamos el logout en el modal
  await page.click('button:has-text("Sí, cerrar sesión")');

  // 10. Verificamos que fuimos redirigidos a la página principal
  await expect(page).toHaveURL('http://localhost:5173/Login');

  // 11. Verificamos que la cookie de sesión fue eliminada
  const cookiesAfterLogout = await page.context().cookies();
  const sessionCookieAfterLogout = cookiesAfterLogout.find(c => c.name === 'PHPSESSID' || c.name === 'geoterra_session_token');
  expect(sessionCookieAfterLogout).toBeUndefined();
});