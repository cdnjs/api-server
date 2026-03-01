import { it, expect } from 'vitest';

/**
 * Run tests to ensure a response is a valid pretty-printed HTML "human" response.
 *
 * @param response Response from the API worker to test as a "human" response.
 */
export default (response: Response) => {
    it('returns the no-index header', () => {
        expect(response.headers.get('X-Robots-Tag')).to.eq('noindex');
    });
    it('returns a HTML body', async () => {
        expect(response.headers.get('Content-Type')).to.match(/text\/html/);
        expect(await response.text()).to.match(/<html[^>]*>/);
    });
    it('returns the no-index meta tag', async () => {
        expect(await response.text()).to.match(/<meta\s+name=["']robots["']\s+content=["']noindex["']\s*\/?>/);
    });
};
