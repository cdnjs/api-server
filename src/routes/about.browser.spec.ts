import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/about', () => {
    test('renders page', async ({ page }) => {
        const response = await page.goto('/about');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=21600',
        ); // 6 hours

        await expect(page).toHaveTitle('About - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/about',
        );

        await expect(
            page.getByRole('heading', { name: 'About cdnjs' }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'What is cdnjs?' }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Adding a library' }),
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Sponsors' }),
        ).toBeVisible();
    });
});
