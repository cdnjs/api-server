import { expect, test } from '../utils/spec/playwright.ts';

test.describe('/libraries/:library/:version', () => {
    test('renders page', async ({ page }) => {
        await page.addInitScript(() => {
            let copiedText = '';
            Object.defineProperty(navigator, 'clipboard', {
                configurable: true,
                value: {
                    writeText: async (text: string) => {
                        copiedText = text;
                    },
                    readText: async () => copiedText,
                },
            });
        });

        const response = await page.goto('/libraries/backbone.js/1.1.0');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=21600',
        ); // 6 hours

        await expect(page).toHaveTitle(
            'backbone.js @ 1.1.0 - Libraries - cdnjs',
        );
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/libraries/backbone.js',
        );

        await expect(
            page.getByRole('heading', {
                name: 'backbone.js @ 1.1.0',
            }),
        ).toBeVisible();

        const script = page.getByRole('listitem').filter({
            has: page.getByRole('link', {
                name: 'backbone-min.js',
                exact: true,
            }),
        });
        await expect(script).toBeVisible();

        const copyUrl = script.getByRole('button', {
            name: 'Copy URL',
        });
        await expect(copyUrl).toBeVisible();
        await copyUrl.click();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
            'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min.js',
        );

        const copyHtml = script.getByRole('button', {
            name: 'Copy <script> HTML',
        });
        await expect(copyHtml).toBeVisible();
        await copyHtml.click();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min.js" integrity="sha512-dAueYph4qw2X+fGTTIqLhRgFNnMyt824QYRi6wx3r7ju87XWoJK9QqA0oVlYeit/mKUd6l+2xmdKRnv/HedgfQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
        );

        const copySri = script.getByRole('button', {
            name: 'Copy SRI Hash',
        });
        await expect(copySri).toBeVisible();
        await copySri.click();
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
            'sha512-dAueYph4qw2X+fGTTIqLhRgFNnMyt824QYRi6wx3r7ju87XWoJK9QqA0oVlYeit/mKUd6l+2xmdKRnv/HedgfQ==',
        );

        const filter = page.getByRole('combobox', { name: 'Filter:' });
        await expect(filter).toHaveValue('');
        const sourceMap = page.getByRole('link', {
            name: 'backbone-min.map',
            exact: true,
        });
        await expect(sourceMap).toBeVisible();

        await filter.selectOption({ label: 'Source Maps' });

        await expect(filter).toHaveValue('Source Maps');
        await expect(sourceMap).toBeVisible();
        await expect(script).toHaveCount(0);

        const version = page.getByRole('combobox', { name: 'Version:' });
        await expect(version).toHaveValue('1.1.0');
        await version.selectOption({ label: '1.0.0' });
        await expect(page).toHaveURL('/libraries/backbone.js/1.0.0');
    });

    test('error response', async ({ page }) => {
        const response = await page.goto(
            '/libraries/backbone.js/this-version-doesnt-exist',
        );
        expect(response?.ok()).toBe(false);
        expect(response?.status()).toBe(404);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=3600',
        ); // 1 hour

        await expect(page).toHaveTitle('Version Not Found - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/libraries/backbone.js/this-version-doesnt-exist',
        );
    });
});

test.describe('/libraries/:library', () => {
    test('renders page', async ({ page }) => {
        const response = await page.goto('/libraries/backbone.js');
        expect(response?.ok()).toBe(true);
        expect(response?.status()).toBe(200);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=21600',
        ); // 6 hours

        await expect(page).toHaveTitle(
            /^backbone\.js @ .+ - Libraries - cdnjs$/,
        );
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/libraries/backbone.js',
        );

        await expect(
            page.getByRole('heading', {
                name: /^backbone\.js @ .+$/,
            }),
        ).toBeVisible();

        await expect(
            page.getByRole('combobox', { name: 'Version:' }),
        ).toBeVisible();

        // Look for any CDN link by href to avoid being fragile to asset changes in new versions
        await expect(
            page
                .getByRole('listitem')
                .filter({
                    has: page.locator('a[href*="cdnjs.cloudflare.com"]'),
                })
                .filter({
                    has: page.getByRole('button', { name: 'Copy URL' }),
                })
                .first(),
        ).toBeVisible();
    });

    test('error response', async ({ page }) => {
        const response = await page.goto(
            '/libraries/this-library-doesnt-exist',
        );
        expect(response?.ok()).toBe(false);
        expect(response?.status()).toBe(404);
        expect(response?.headers()['cache-control']).toBe(
            'public, max-age=3600',
        ); // 1 hour

        await expect(page).toHaveTitle('Library Not Found - cdnjs');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://cdnjs.com/libraries/this-library-doesnt-exist',
        );
    });
});
