const { it } = require('mocha');
const { expect } = require('chai');

const testHuman = getResponse => {
    it('returns the no-index header', done => {
        const response = getResponse();
        expect(response).to.have.header('X-Robots-Tag', 'noindex');
        done();
    });
    it('returns a HTML body', done => {
        const response = getResponse();
        expect(response).to.be.html;
        done();
    });
    it('returns the no-index meta tag', done => {
        const response = getResponse();
        expect(response.text).to.match(/<meta\s+name=["']robots["']\s+content=["']noindex["']\s*\/?>/);
        done();
    });
};

module.exports = testHuman;
