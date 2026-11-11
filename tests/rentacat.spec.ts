import { test, expect, type Page } from '@playwright/test';

// test fixture
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/');
  // await page.goto('https://cs1632-buggier.appspot.com/');
  await page.evaluate(() => {
    document.cookie = '1=false';
    document.cookie = '2=false';
    document.cookie = '3=false';
  });
});

const catNames = (page: Page) => page.locator('ul li').filter({ hasNot: page.getByRole('link') });
const catPhotos = (page: Page) => page.locator('ol li img');

test('TEST-1-RESET', async ({ page }) => {
    // rent out all cats
    await page.evaluate(() => {
        document.cookie = '1=true';
        document.cookie = '2=true';
        document.cookie = '3=true';
    });
    // get and click the reset link
    await page.getByRole('link', { name: 'Reset' }).click();

    // check that all cats are available again
    await expect(catNames(page).nth(0)).toHaveText('ID 1. Jennyanydots');
    await expect(catNames(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(catNames(page).nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-2-CATALOG', async ({ page }) => {
    // get and click the catalog link
    await page.getByRole('link', { name: 'Catalog' }).click();
    // check that the cat2 image is correct
    await expect(catPhotos(page).nth(1)).toHaveAttribute('src', '/images/cat2.jpg');
});

test('TEST-3-LISTING', async ({ page }) => {
    // get and click the catalog link
    await page.getByRole('link', { name: 'Catalog' }).click();
    // check that the cat names and photos are correct
    await expect(catNames(page)).toHaveCount(3);
    await expect(catNames(page).nth(2)).toHaveText('ID 3. Mistoffelees');
});

test('TEST-4-RENT-A-CAT', async ({ page }) => {
    // click rent-a-cat link
    await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
    // expect rent and return buttons to be visible
    await expect(page.getByRole('button', { name: 'Rent', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return', exact: true })).toBeVisible();
});

test('TEST-5-RENT', async ({ page }) => {
    // click rent-a-cat link
    await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
    // fill in the rent ID
    await page.locator('#rentID').fill('1');
    // click the rent button
    await page.getByRole('button', { name: 'Rent', exact: true }).click();
    // check that the cat is rented out
    await expect(catNames(page).nth(0)).toHaveText('Rented out');
    await expect(catNames(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(catNames(page).nth(2)).toHaveText('ID 3. Mistoffelees');
    await expect(page.getByText('Success!')).toBeVisible();
});

test('TEST-6-RETURN', async ({ page }) => {
    // rent out cat 2 and 3
    await page.evaluate(() => {
        document.cookie = '2=true';
        document.cookie = '3=true';
    });
    // click rent-a-cat link
    await page.getByRole('link', { name: 'Rent-A-Cat' }).click();
    // return cat 2 (if a return button exists)
    await page.locator('#returnID').fill('2');
    await page.getByRole('button', { name: 'Return', exact: true }).click();
    // check that the cat is returned
    await expect(catNames(page).nth(0)).toHaveText('ID 1. Jennyanydots');
    await expect(catNames(page).nth(1)).toHaveText('ID 2. Old Deuteronomy');
    await expect(catNames(page).nth(2)).toHaveText('Rented out');
    await expect(page.getByText('Success!', { exact: true })).toBeVisible();
});

test('TEST-7-FEED-A-CAT', async ({ page }) => {
    // click feed-a-cat link
    await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
    // feed button is visible
    await expect(page.getByRole('button', { name: 'Feed' })).toBeVisible();
});

test('TEST-8-FEED', async ({ page }) => {
    // click feed-a-cat link
    await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
    // fill in the catnips
    await page.locator('#catnips').fill('6');
    // click the feed button
    await page.getByRole('button', { name: 'Feed' }).click();
    // check that the cat is fed
    await expect(page.getByText('Nom, nom, nom.', { exact: true })).toBeVisible({ timeout: 10000 });
});

test('TEST-9-GREET-A-CAT', async ({ page }) => {
    // click greet-a-cat link
    await page.getByRole('link', { name: 'Greet-A-Cat' }).click();
    // meow reponse is visible
    await expect(page.getByText('Meow!Meow!Meow!', { exact: true })).toBeVisible();
});

test('TEST-10-GREET-A-CAT-WITH-NAME', async ({ page }) => {
    // navigate to cat 1's greet page
    await page.goto('http://localhost:8080/greet-a-cat/Jennyanydots');
    // check that the meow response is visible
    await expect(page.getByText('Meow! from Jennyanydots.', { exact: true })).toBeVisible();
});

test('TEST-11-FEED-A-CAT-SCREENSHOT', async ({ page }) => {
    // rent out all cats
    await page.evaluate(() => {
        document.cookie = '1=true';
        document.cookie = '2=true';
        document.cookie = '3=true';
    });
    // click feed-a-cat link
    await page.getByRole('link', { name: 'Feed-A-Cat' }).click();
    // has screenshot of the feed-a-cat page body
    await expect(page.locator('body')).toHaveScreenshot();
});