import { describe, expect, it } from 'vitest';

import openHumanRoute from '../utils/spec/browser.ts';

describe('/api human output', () => {
    it('renders accessible navigation and documentation', async () => {
        const frame = await openHumanRoute('/api?output=human');

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
});
