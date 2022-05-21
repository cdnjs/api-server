import { it } from 'mocha';
import { expect } from'chai';

/**
 * Run Mocha tests to ensure a response is a valid pretty-printed HTML "human" response.
 *
 * @param {function(): import('./request.js').ExtendedResponse} getResponse Method that returns main path response.
 */
export default getResponse => {
    it('returns the no-index header', () => {
        const response = getResponse();
        expect(response).to.have.header('X-Robots-Tag', 'noindex');
    });
    it('returns a HTML body', () => {
        const response = getResponse();
        expect(response).to.be.html;
    });
    it('returns the no-index meta tag', () => {
        const response = getResponse();
        expect(response.text).to.match(/<meta\s+name=["']robots["']\s+content=["']noindex["']\s*\/?>/);
    });
};
