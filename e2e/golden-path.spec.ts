import { test, expect } from '@playwright/test';

test('öğretmen profili -> sınıf -> öğrenci -> arşivleme altın yolu', async ({ page }) => {
  await page.goto('/ayarlar');

  await page.getByLabel('Ad Soyad *').fill('Ayşe Yılmaz');
  await page.getByLabel('Branş *').fill('Matematik');
  await page.getByLabel('Okul Adı').fill('Atatürk Ortaokulu');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByText('Kaydedildi.')).toBeVisible();

  await page.getByRole('link', { name: 'Sınıflar' }).click();
  await page.getByRole('button', { name: 'Yeni Sınıf' }).click();
  await page.getByLabel('Sınıf Adı *').fill('7/A');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByRole('cell', { name: '7/A' })).toBeVisible();

  // Aynı isimde ikinci sınıf oluşturulamaz (AC-002)
  await page.getByRole('button', { name: 'Yeni Sınıf' }).click();
  await page.getByLabel('Sınıf Adı *').fill('7/A');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByText('"7/A" adında aktif bir sınıf zaten var.')).toBeVisible();
  await page.getByRole('button', { name: 'Vazgeç' }).click();

  await page.getByRole('cell', { name: '7/A' }).click();
  await expect(page.getByRole('heading', { name: '7/A — Öğrenciler' })).toBeVisible();

  await page.getByRole('button', { name: 'Yeni Öğrenci' }).click();
  await page.getByLabel('Okul No *').fill('101');
  await page.getByLabel('Ad Soyad *').fill('Ali Kaya');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByRole('cell', { name: 'Ali Kaya' })).toBeVisible();

  await page.getByRole('button', { name: 'Sınıflara Dön' }).click();
  await page.getByRole('button', { name: 'arşivle' }).click();
  await page.getByRole('button', { name: 'Onayla' }).click();
  await expect(page.getByText('Henüz sınıf oluşturulmadı.')).toBeVisible();
});
