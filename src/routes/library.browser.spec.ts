import { describe, expect, it } from 'vitest';

import openHumanRoute from '../utils/spec/browser.ts';

describe('/libraries/:library/:version human output', () => {
    it('renders an immutable version and hydrates its file filter', async () => {
        const frame = await openHumanRoute(
            '/libraries/backbone.js/1.1.0?output=human',
        );

        await expect
            .element(
                frame.getByRole('heading', {
                    name: /^backbone\.js /,
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
