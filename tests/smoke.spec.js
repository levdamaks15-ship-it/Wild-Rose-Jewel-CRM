const { test, expect } = require('@playwright/test');
const path = require('path');

test('Catalog should load products from Supabase', async ({ page }) => {
  // Путь к вашему файлу каталога
  const filePath = `file://${path.resolve(__dirname, '../catalog.html')}`;
  
  console.log('🚀 Открываем каталог:', filePath);
  await page.goto(filePath);

  // 1. Проверяем заголовок
  await expect(page).toHaveTitle(/Каталог/);

  // 2. Ждем, пока сработает наш загрузчик из Supabase
  // (мы ищем элемент .product-card, который создается динамически)
  console.log('⏳ Ждем загрузки товаров из базы...');
  const productCard = page.locator('.product-card').first();
  
  // Даем базе до 10 секунд на ответ (обычно это 1-2 сек)
  await expect(productCard).toBeVisible({ timeout: 10000 });

  // 3. Проверяем количество (что их больше 0)
  const count = await page.locator('.product-card').count();
  console.log(`✅ Успех! Найдено товаров: ${count}`);
  
  expect(count).toBeGreaterThan(0);

  // 4. Сверх-проверка: пробуем переключить сезон
  await page.click('button[data-season="summer"]');
  await page.waitForTimeout(500); // небольшая пауза на анимацию
  
  const summerCount = await page.locator('.product-card').count();
  console.log(`🌞 В летней коллекции найдено товаров: ${summerCount}`);
});
