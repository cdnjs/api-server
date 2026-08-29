import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/whitelist', () => {
    test('error response', async ({ page }) => {
        const response = await page.goto('/whitelist');
        expect(response?.ok()).toBe(false);
        expect(response?.status()).toBe(404);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=0, must-revalidate',
        );

        await expect(page).toHaveTitle('Endpoint Not Found - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/whitelist',
        );
    });
});
