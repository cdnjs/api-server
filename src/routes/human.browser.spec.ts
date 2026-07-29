import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

const openHumanRoute = (path: string) => {
    const title = `Human output: ${path}`;
    const frame = document.createElement('iframe');
    frame.title = title;
    frame.src = `/__worker${path}`;
    document.body.appendChild(frame);

    return page.frameLocator(page.getByTitle(title));
};

afterEach(() => {
    document.body.replaceChildren();
});

describe('human-readable routes', () => {
    it('renders the API documentation with accessible navigation', async () => {
        const frame = openHumanRoute('/api?output=human');

        await expect.element(frame.getByRole('navigation')).toBeInTheDocument();
        await expect
            .element(frame.getByRole('link', { name: 'cdnjs' }).first())
            .toBeInTheDocument();
        await expect
            .element(frame.getByText('Loading OpenAPI specification...'))
            .not.toBeInTheDocument();
        await expect
            .element(frame.getByRole('heading', { name: 'Libraries' }))
            .toBeInTheDocument();
    });

    it('renders an immutable library version and hydrates its file filter', async () => {
        const frame = openHumanRoute(
            '/libraries/backbone.js/1.1.0?output=human',
        );

        await expect
            .element(
                frame.getByRole('heading', {
                    name: 'backbone.js',
                    exact: true,
                }),
            )
            .toBeInTheDocument();

        const version = frame.getByRole('combobox', { name: 'Version:' });
        const filter = frame.getByRole('combobox', { name: 'Filter:' });
        await expect.element(version).toHaveValue('1.1.0');
        await expect.element(filter).toHaveDisplayValue('All assets');

        const script = frame.getByRole('link', {
            name: 'backbone-min.js',
            exact: true,
        });
        const sourceMap = frame.getByRole('link', {
            name: 'backbone-min.map',
            exact: true,
        });
        await expect.element(script).toBeInTheDocument();
        await expect.element(sourceMap).toBeInTheDocument();

        await filter.selectOptions('Source Maps');

        await expect.element(filter).toHaveDisplayValue('Source Maps');
        await expect.element(sourceMap).toBeInTheDocument();
        await expect.element(script).not.toBeInTheDocument();
    });
});
