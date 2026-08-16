import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/this-route-doesnt-exist', () => {
    test('error response', async ({ page }) => {
        const response = await page.goto('/this-route-doesnt-exist');
        expect(response?.ok()).toBe(false);
        expect(response?.status()).toBe(404);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=3600',
        ); // 1 hour

        await expect(page).toHaveTitle('Endpoint Not Found - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/this-route-doesnt-exist',
        );
    });
});

test.describe('/error', () => {
    test('error response', async ({ page, server }) => {
        test.skip(
            !server,
            'Running against an external API Worker, skipping to avoid creating noise',
        );

        const response = await page.goto('/error');
        expect(response?.ok()).toBe(false);
        expect(response?.status()).toBe(500);
        expect(response?.headers()['cache-control']).toBe(
            'no-cache, no-store, must-revalidate',
        );
        expect(response?.headers()['expires']).toBe('0');
        expect(response?.headers()['pragma']).toBe('no-cache');

        await expect(page).toHaveTitle('Unexpected Error - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/error',
        );
    });
});
