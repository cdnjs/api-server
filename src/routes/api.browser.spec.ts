import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/api website output', () => {
    test('renders accessible navigation and documentation', async ({
        page,
    }) => {
        const response = await page.goto('/api');
        expect(response?.ok()).toBe(true);

        await expect(page.getByRole('navigation')).toBeVisible();
        await expect(
            page.getByRole('link', { name: 'cdnjs' }).first(),
        ).toBeVisible();
        await expect(
            page.getByText('Loading OpenAPI specification...'),
        ).toHaveCount(0);
        await expect(
            page.getByRole('heading', { name: 'Libraries' }),
        ).toBeVisible();
    });
});
