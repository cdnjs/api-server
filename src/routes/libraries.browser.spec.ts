import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/libraries', () => {
    test('renders page', async ({ page }) => {
        const response = await page.goto('/libraries');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=0, must-revalidate',
        );

        await expect(page).toHaveTitle('Libraries - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/libraries',
        );

        await expect(
            page.getByRole('heading', { name: 'Browse cdnjs' }),
        ).toBeVisible();

        const initial = page.getByRole('link', { name: /^.+ @/ }).first();
        await expect(initial).toBeVisible();
        await expect(initial).toHaveAttribute(
            'href',
            `/libraries/${(await initial.innerText()).match(/^(.+) @/)?.[1]}`,
        );

        const input = page.getByRole('textbox', {
            name: 'Search libraries on cdnjs...',
        });
        await expect(input).toBeVisible();
        await input.fill('backbone.js');

        const result = page.getByRole('link', { name: /^backbone\.js @/ });
        await expect(result).toBeVisible();
        await result.click();
        await expect(page).toHaveURL('/libraries/backbone.js');
    });
});
