import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/libraries/:library/:version website output', () => {
    test('renders an immutable version and hydrates its file filter', async ({
        page,
    }) => {
        const response = await page.goto('/libraries/backbone.js/1.1.0');
        expect(response?.ok()).toBe(true);

        await expect(
            page.getByRole('heading', {
                name: /^backbone\.js /,
            }),
        ).toBeVisible();

        const version = page.getByRole('combobox', { name: 'Version:' });
        const filter = page.getByRole('combobox', { name: 'Filter:' });
        await expect(version).toHaveValue('1.1.0');
        await expect(filter).toHaveValue('');

        const script = page.getByRole('link', {
            name: 'backbone-min.js',
            exact: true,
        });
        const sourceMap = page.getByRole('link', {
            name: 'backbone-min.map',
            exact: true,
        });
        await expect(script).toBeVisible();
        await expect(sourceMap).toBeVisible();

        await filter.selectOption({ label: 'Source Maps' });

        await expect(filter).toHaveValue('Source Maps');
        await expect(sourceMap).toBeVisible();
        await expect(script).toHaveCount(0);
    });
});
