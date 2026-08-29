import { expect, test, wait } from '../utils/spec/playwright.ts';

test.describe('/libraries', () => {
    test('renders page', async ({ page }) => {
        const apiQueue: (() => void)[] = [];
        const apiNext = () => apiQueue.shift()?.();

        await page.route(
            'https://api.cdnjs.com/libraries?**',
            async (route) => {
                await new Promise<void>((resolve) => {
                    apiQueue.push(() => resolve());
                });
                await route.continue();
            },
        );

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

        const props = JSON.parse(
            (await page
                .locator('script[id^="island-props-libraries-"]')
                .textContent()) ?? '{}',
        ) as { initial: { results: unknown[] } };
        expect(props.initial.results).toHaveLength(100);

        const libraries = page.getByText(/Found [0-9,]+ libraries/);
        await expect(libraries).toBeVisible();
        await expect(libraries).not.toHaveText(' 100 libraries');

        await wait(() => expect(apiQueue).toHaveLength(1));
        apiNext();

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

        await wait(() => expect(apiQueue).toHaveLength(1));
        apiNext();

        const result = page.getByRole('link', { name: /^backbone\.js @/ });
        await expect(result).toBeVisible();
        await result.click();
        await expect(page).toHaveURL('/libraries/backbone.js');
    });
});
