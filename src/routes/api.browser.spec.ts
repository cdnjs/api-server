import { describe, expect, it } from 'vitest';

import openWebsiteRoute from '../utils/spec/browser.ts';

describe('/api website output', () => {
    it('renders accessible navigation and documentation', async () => {
        const frame = await openWebsiteRoute('/api');

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
