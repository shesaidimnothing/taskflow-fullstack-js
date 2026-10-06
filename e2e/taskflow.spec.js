import { test, expect } from '@playwright/test';
test('parcours navigateur complet, rechargement, mobile et deuxième compte', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Heureux de vous revoir' })).toBeVisible();
  await page.screenshot({ path: '.local/screenshots/connexion.png', fullPage: true });
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse email').fill('browser-a@example.test');
  await page.getByLabel('Mot de passe').fill('Navigateur123!');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('heading', { name: 'Une chose à la fois.' })).toBeVisible();
  await page.getByRole('button', { name: 'Nouvelle tâche' }).click();
  await page.getByLabel('Titre', { exact: true }).fill('Préparer la soutenance');
  await page.getByLabel('Statut').selectOption('doing');
  await page.getByLabel('Échéance').fill('2026-10-12');
  await page.getByLabel('Description').fill('Revoir le parcours React → Express → MongoDB.');
  await page.getByRole('button', { name: 'Créer la tâche', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('créée');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Consulter Préparer la soutenance' })).toBeVisible();
  await page.screenshot({ path: '.local/screenshots/taches-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Consulter Préparer la soutenance' }).click();
  await expect(page.getByText('Revoir le parcours React → Express → MongoDB.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Modifier', exact: true }).click();
  await page.getByLabel('Statut').selectOption('done');
  await page.getByLabel('Titre', { exact: true }).fill('Soutenance prête');
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expect(page.getByRole('button', { name: 'Consulter Soutenance prête' })).toContainText('Terminée');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.local/screenshots/taches-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Consulter Soutenance prête' }).click();
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Soutenance prête', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmer la suppression' }).click();
  await expect(page.getByRole('status')).toContainText('supprimée');
  await page.getByRole('button', { name: 'Nouvelle tâche' }).click();
  await page.getByLabel('Titre', { exact: true }).fill('Tâche privée A');
  await page.getByRole('button', { name: 'Créer la tâche', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Consulter Tâche privée A' })).toBeVisible();
  await page.getByRole('button', { name: 'Menu utilisateur' }).click();
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse email').fill('browser-b@example.test');
  await page.getByLabel('Mot de passe').fill('Navigateur123!');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('heading', { name: 'Faites de la place à vos projets.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Consulter Tâche privée A' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Menu utilisateur' }).click();
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await page.getByLabel('Adresse email').fill('browser-a@example.test');
  await page.getByLabel('Mot de passe').fill('wrong-password');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Mot de passe').fill('Navigateur123!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Consulter Tâche privée A' })).toBeVisible();
});

test('navigation clavier, formulaire mobile et documentation Swagger', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'TaskFlow, accueil' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Adresse email')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Mot de passe')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Se connecter', exact: true })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/api/docs/');
  await expect(page.getByRole('heading', { name: /TaskFlow API/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Authorize/ }).first()).toBeVisible();
});

test('page mon compte : consultation, modification du mot de passe et retour', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Adresse email').fill('account-test@example.test');
  await page.getByLabel('Mot de passe').fill('Navigateur123!');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('button', { name: 'Menu utilisateur' })).toBeVisible();

  // Ouvrir la page Mon compte via le menu déroulant
  await page.getByRole('button', { name: 'Menu utilisateur' }).click();
  await page.getByRole('button', { name: 'Mon compte' }).click();

  await expect(page.getByRole('heading', { name: 'Votre espace.' })).toBeVisible();
  await expect(page.getByText('account-test@example.test')).toBeVisible();

  // Modification du mot de passe
  await page.getByLabel('Mot de passe actuel').fill('Navigateur123!');
  await page.getByLabel('Nouveau mot de passe', { exact: true }).fill('NouveauPass123!');
  await page.getByLabel('Confirmer le nouveau mot de passe').fill('NouveauPass123!');
  await page.getByRole('button', { name: 'Modifier le mot de passe' }).click();
  await expect(page.getByRole('status')).toContainText('modifié');

  // Retour aux tâches
  await page.getByRole('button', { name: '← Mes tâches' }).click();
  await expect(page.getByRole('heading', { name: 'Une chose à la fois.' })).toBeVisible();

  // Déconnexion et reconnexion avec le nouveau mot de passe
  await page.getByRole('button', { name: 'Menu utilisateur' }).click();
  await page.getByRole('button', { name: 'Se déconnecter' }).click();

  await page.getByLabel('Adresse email').fill('account-test@example.test');
  await page.getByLabel('Mot de passe').fill('NouveauPass123!');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Menu utilisateur' })).toBeVisible();
});

