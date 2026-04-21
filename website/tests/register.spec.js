import { test, expect } from '@playwright/test';

test('Debe registrar un nuevo usuario exitosamente', async ({ page }) => {
  const testEmail = `test_${Date.now()}@example.com`;
  
  // 1. Ir a la página de registro
  await page.goto('http://localhost:5173/Register');

  // 2. Llenar el formulario
  await page.fill('input[placeholder="Ingrese su(s) nombre(s)"]', 'Usuario');
  await page.fill('input[placeholder="Ingrese su(s) apellido(s)"]', 'Prueba');
  await page.fill('input[type="email"]', testEmail);
  
  // Llenar el teléfono (usando el placeholder del componente PhoneInput para Costa Rica)
  await page.fill('input[placeholder="8888 8888"]', '88888888');

  await page.fill('input[placeholder="Ingrese una contraseña"]', 'Password123!');
  await page.fill('input[placeholder="Confirme su contraseña"]', 'Password123!');

  // 3. Hacer clic en el botón de registrarse
  // El botón tiene el texto "Registrarse"
  await page.click('button:has-text("Registrarse")');

  // 4. Verificar que aparezca el modal de éxito
  // Buscamos el texto del modal
  await expect(page.getByText('¡Registro Exitoso!')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Gracias por registrarse, ahora inicie sesión')).toBeVisible();

  // 5. Cerrar el modal y verificar redirección a login
  await page.click('button:has-text("Ir a Iniciar Sesión")');
  await expect(page).toHaveURL(/.*login/);
});
