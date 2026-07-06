import { test, expect } from '@playwright/test';

// Not: Auth (Supabase e-posta+şifre) eklendiğinden beri, sınıf/öğrenci
// oluşturma gibi korumalı ekranları uçtan uca test etmek gerçek bir
// Supabase oturumu gerektiriyor. Bu, henüz kurulmamış bir mock/stub
// altyapısı ister (bkz. proje planı Faz 6). O altyapı kurulana kadar bu
// test, route guard'ın (oturumsuz erişimde /giris'e yönlendirme) doğru
// çalıştığını doğrulayan daha dar bir kapsamla sınırlı tutuluyor.
test('oturum açılmadan korumalı bir sayfaya gidilirse giriş ekranına yönlendirilir', async ({
  page,
}) => {
  await page.goto('/#/ayarlar');

  await expect(page).toHaveURL(/#\/giris$/);
  await expect(page.getByRole('heading', { name: 'YAP — Giriş' })).toBeVisible();
});

test('giriş ekranından kayıt ekranına geçilebilir', async ({ page }) => {
  await page.goto('/#/giris');

  await page.getByRole('link', { name: 'Kayıt olun' }).click();

  await expect(page).toHaveURL(/#\/kayit$/);
  await expect(page.getByRole('heading', { name: 'YAP — Kayıt Ol' })).toBeVisible();
});
