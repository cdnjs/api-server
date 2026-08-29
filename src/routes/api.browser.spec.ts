import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/api', () => {
    test('renders page', async ({ page }) => {
        const response = await page.goto('/api');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=0, must-revalidate',
        );

        await expect(page).toHaveTitle('API - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/api',
        );

        await expect(
            page.getByText('Loading OpenAPI specification...'),
        ).toHaveCount(0);

        await expect(
            page.getByRole('heading', { name: 'Query cdnjs' }),
        ).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Libraries' }),
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Meta' })).toBeVisible();
        await expect(
            page.getByRole('heading', { name: 'Schemas' }),
        ).toBeVisible();

        await expect(page.getByRole('button', { name: 'Execute' })).toHaveCount(
            0,
        );

        await page
            .getByRole('code')
            .filter({ hasText: /^\/libraries$/ })
            .click();
        await expect(
            page.getByRole('button', { name: 'Execute' }),
        ).toBeVisible();
    });
});
