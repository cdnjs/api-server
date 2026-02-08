import { createHash } from 'crypto';

import { expect } from 'chai';
import { describe, it, before } from 'mocha';

import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';
import request from '../utils/spec/request.js';

describe('/libraries', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/libraries';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
        });
        it('returns all available hits', () => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
        });
        describe('Library object', () => {
            it('is an object with \'name\' and \'latest\' properties', () => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    try {
                        expect(result).to.have.property('latest').that.is.a('string');
                    } catch (_) {
                        expect(result).to.have.property('latest').that.is.null;
                    }
                }
            });
            it('has a CDN url for the \'latest\' property', () => {
                for (const result of response.body.results) {
                    try {
                        expect(result.latest).to.match(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/.+\/.+\/.*/);
                    } catch (_) {
                        expect(result.latest).to.be.null;
                    }
                }
            });
            it('has no other properties', () => {
                for (const result of response.body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(2);
                }
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res).to.have.status(200);
            expect(res.body).to.deep.equal(response.body);
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/libraries?output=human';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
        });
        testHuman(() => response);
    });

    describe('Limiting number of results (?limit=10)', () => {
        // Fetch the endpoint
        const path = '/libraries?limit=10';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
        });
        it('returns only the requested number of hits', () => {
            expect(response.body.results).to.have.lengthOf(10);
            expect(response.body.total).to.equal(10);
            expect(response.body.available).to.be.above(10);
        });
    });

    describe('Requesting a field (?fields=version)', () => {
        // Fetch the endpoint
        const path = '/libraries?fields=version';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
        });
        it('returns all available hits', () => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
        });
        describe('Library object', () => {
            it('is an object with \'name\', \'latest\' and requested \'version\' properties', () => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    try {
                        expect(result).to.have.property('latest').that.is.a('string');
                    } catch (_) {
                        expect(result).to.have.property('latest').that.is.null;
                    }
                    expect(result).to.have.property('version').that.is.a('string');
                }
            });
            it('has no other properties', () => {
                for (const result of response.body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(3);
                }
            });
        });
    });

    describe('Requesting a case-sensitive field', () => {
        describe('with the correct casing (?fields=fileType)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=fileType';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'fileType\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        try {
                            expect(result).to.have.property('latest').that.is.a('string');
                        } catch (_) {
                            expect(result).to.have.property('latest').that.is.null;
                        }
                        expect(result).to.have.property('fileType').that.is.a('string');
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(3);
                    }
                });
            });
        });

        describe('with incorrect casing (?fields=filetype)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filetype';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'fileType\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        try {
                            expect(result).to.have.property('latest').that.is.a('string');
                        } catch (_) {
                            expect(result).to.have.property('latest').that.is.null;
                        }
                        expect(result).to.have.property('fileType').that.is.a('string');
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(3);
                    }
                });
            });
        });
    });

    describe('Requesting multiple fields', () => {
        describe('through comma-separated string (?fields=filename,version)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filename,version';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'filename\' & \'version\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name');
                        expect(result).to.have.property('latest');
                        expect(result).to.have.property('filename');
                        expect(result).to.have.property('version');
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(4);
                    }
                });
            });
        });

        describe('through space-separated string (?fields=filename version)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filename version';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'filename\' & \'version\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name');
                        expect(result).to.have.property('latest');
                        expect(result).to.have.property('filename');
                        expect(result).to.have.property('version');
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(4);
                    }
                });
            });
        });

        describe('through multiple query parameters (?fields=filename&fields=version)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filename&fields=version';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'filename\' & \'version\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name');
                        expect(result).to.have.property('latest');
                        expect(result).to.have.property('filename');
                        expect(result).to.have.property('version');
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(4);
                    }
                });
            });
        });
    });

    describe('Requesting all fields (?fields=*)', () => {
        // Fetch the endpoint
        const path = '/libraries?fields=*';
        let response;
        before('fetch endpoint', () => request(path).then(res => { response = res; }));

        // Test the endpoint
        testCors(path, () => response);
        it('returns the correct Cache headers', () => {
            expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response).to.have.status(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body).to.have.property('total').that.is.a('number');
            expect(response.body).to.have.property('available').that.is.a('number');
        });
        it('returns all available hits', () => {
            expect(response.body.results).to.have.lengthOf(response.body.total);
            expect(response.body.results).to.have.lengthOf(response.body.available);
        });
        describe('Library object', () => {
            it('is an object with the full set of library properties', () => {
                for (const result of response.body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    try {
                        expect(result).to.have.property('latest').that.is.a('string');
                    } catch (_) {
                        expect(result).to.have.property('latest').that.is.null;
                    }
                    expect(result).to.have.property('filename').that.is.a('string');
                    expect(result).to.have.property('description').that.is.a('string');
                    expect(result).to.have.property('version').that.is.a('string');
                    try {
                        expect(result).to.have.property('keywords').that.is.an('array');
                    } catch (_) {
                        expect(result).to.have.property('keywords').that.is.null;
                    }
                    expect(result).to.have.property('alternativeNames').that.is.an('array');
                    expect(result).to.have.property('fileType').that.is.a('string');
                    try {
                        expect(result).to.have.property('github').that.is.an('object');
                    } catch (_) {
                        expect(result).to.have.property('github').that.is.null;
                    }
                    expect(result).to.have.property('license').that.is.a('string');
                    expect(result).to.have.property('homepage').that.is.a('string');
                    try {
                        expect(result).to.have.property('repository').that.is.an('object');
                    } catch (_) {
                        expect(result).to.have.property('repository').that.is.null;
                    }
                    expect(result).to.have.property('author').that.is.a('string');
                    expect(result).to.have.property('originalName').that.is.a('string');
                    expect(result).to.have.property('sri').that.is.a('string');
                    expect(result).to.have.property('objectID').that.is.a('string');
                }
            });
        });
    });

    describe('Searching for libraries', () => {
        // This set of tests is incredibly fragile
        // Testing of the searching functionality should be done by hand
        // TODO: Make this set of tests more robust

        describe('Providing a short query (?search=font-awesome)', () => {
            // Fetch the endpoint
            const path = '/libraries?search=font-awesome';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('returns the \'twitter-bootstrap\' package as the first object', () => {
                    expect(response.body.results[0]).to.have.property('name', 'font-awesome');
                });
                it('is an object with \'name\' and \'latest\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        expect(result).to.have.property('latest').that.is.a('string');
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(2);
                    }
                });
            });
        });

        describe('Providing a plain-text query that is longer than max that Algolia allows (?search=...)', () => {
            // Fetch the endpoint
            const path = `/libraries?search=${encodeURIComponent('a'.repeat(1024))}`;
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            // No library object as it's rather likely this won't match anything
            // But this test is just to ensure it doesn't return an error
        });

        describe('Providing a unicode query that is longer than max that Algolia allows (?search=...)', () => {
            // Fetch the endpoint
            const path = `/libraries?search=${encodeURIComponent('à'.repeat(1024))}`;
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            // No library object as it's rather likely this won't match anything
            // But this test is just to ensure it doesn't return an error
        });
    });

    describe('Searching for libraries with specific fields', () => {
        // This set of tests is incredibly fragile
        // Testing of the searching functionality should be done by hand
        // TODO: Make this set of tests more robust

        describe('Providing search fields that are valid', () => {
            describe('through comma-separated string (?search=backbone.js&search_fields=keywords,github.user)', () => {
                // Fetch the endpoint
                const path = '/libraries?search=backbone.js&search_fields=keywords,github.user';
                let response;
                before('fetch endpoint', () => request(path).then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.have.property('results').that.is.an('array');
                    expect(response.body).to.have.property('total').that.is.a('number');
                    expect(response.body).to.have.property('available').that.is.a('number');
                });
                it('returns all available hits', () => {
                    expect(response.body.results).to.have.lengthOf(response.body.total);
                    expect(response.body.results).to.have.lengthOf(response.body.available);
                });
                describe('Library object', () => {
                    it('is an object with \'name\' and \'latest\' properties', () => {
                        for (const result of response.body.results) {
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('latest').that.is.a('string');
                        }
                    });
                    // This is fragile!
                    // backbone.js doesn't have a keyword for itself and is owned by a user so we shouldn't see it
                    it('doesn\'t return the \'backbone.js\' package', () => {
                        for (const result of response.body.results) {
                            expect(result.name).to.not.equal('backbone.js');
                        }
                    });
                    it('has no other properties', () => {
                        for (const result of response.body.results) {
                            expect(Object.keys(result)).to.have.lengthOf(2);
                        }
                    });
                });
            });

            describe('through space-separated string (?search=backbone.js&search_fields=keywords github.user)', () => {
                // Fetch the endpoint
                const path = '/libraries?search=backbone.js&search_fields=keywords github.user';
                let response;
                before('fetch endpoint', () => request(path).then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.have.property('results').that.is.an('array');
                    expect(response.body).to.have.property('total').that.is.a('number');
                    expect(response.body).to.have.property('available').that.is.a('number');
                });
                it('returns all available hits', () => {
                    expect(response.body.results).to.have.lengthOf(response.body.total);
                    expect(response.body.results).to.have.lengthOf(response.body.available);
                });
                describe('Library object', () => {
                    it('is an object with \'name\' and \'latest\' properties', () => {
                        for (const result of response.body.results) {
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('latest').that.is.a('string');
                        }
                    });
                    // This is fragile!
                    // backbone.js doesn't have a keyword for itself and is owned by a user so we shouldn't see it
                    it('doesn\'t return the \'backbone.js\' package', () => {
                        for (const result of response.body.results) {
                            expect(result.name).to.not.equal('backbone.js');
                        }
                    });
                    it('has no other properties', () => {
                        for (const result of response.body.results) {
                            expect(Object.keys(result)).to.have.lengthOf(2);
                        }
                    });
                });
            });

            describe('through multiple query parameters (?search=backbone.js&search_fields=keywords&search_fields=github.user)', () => {
                // Fetch the endpoint
                const path = '/libraries?search=backbone.js&search_fields=keywords&search_fields=github.user';
                let response;
                before('fetch endpoint', () => request(path).then(res => { response = res; }));

                // Test the endpoint
                testCors(path, () => response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.have.property('results').that.is.an('array');
                    expect(response.body).to.have.property('total').that.is.a('number');
                    expect(response.body).to.have.property('available').that.is.a('number');
                });
                it('returns all available hits', () => {
                    expect(response.body.results).to.have.lengthOf(response.body.total);
                    expect(response.body.results).to.have.lengthOf(response.body.available);
                });
                describe('Library object', () => {
                    it('is an object with \'name\' and \'latest\' properties', () => {
                        for (const result of response.body.results) {
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('latest').that.is.a('string');
                        }
                    });
                    // This is fragile!
                    // backbone.js doesn't have a keyword for itself and is owned by a user so we shouldn't see it
                    it('doesn\'t return the \'backbone.js\' package', () => {
                        for (const result of response.body.results) {
                            expect(result.name).to.not.equal('backbone.js');
                        }
                    });
                    it('has no other properties', () => {
                        for (const result of response.body.results) {
                            expect(Object.keys(result)).to.have.lengthOf(2);
                        }
                    });
                });
            });
        });

        // If invalid fields make it to Aloglia, it will error, so this tests that we're filtering them first
        describe('Providing search fields that are invalid (?search_fields=this-field-doesnt-exist)', () => {
            // Fetch the endpoint
            const path = '/libraries?search_fields=this-field-doesnt-exist';
            let response;
            before('fetch endpoint', () => request(path).then(res => { response = res; }));

            // Test the endpoint
            testCors(path, () => response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', () => {
                expect(response).to.be.json;
                expect(response.body).to.have.property('results').that.is.an('array');
                expect(response.body).to.have.property('total').that.is.a('number');
                expect(response.body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', () => {
                expect(response.body.results).to.have.lengthOf(response.body.total);
                expect(response.body.results).to.have.lengthOf(response.body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\' and \'latest\' properties', () => {
                    for (const result of response.body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        try {
                            expect(result).to.have.property('latest').that.is.a('string');
                        } catch (_) {
                            expect(result).to.have.property('latest').that.is.null;
                        }
                    }
                });
                it('has no other properties', () => {
                    for (const result of response.body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(2);
                    }
                });
            });
        });
    });

    describe('Caching Algolia data with KV', () => {
        it('writes the results from Algolia to KV', async () => {
            await request('/libraries', {}, undefined, async mf => {
                // Check that the results were stored under the `:` key (no query, no fields)
                const cache = await mf.getKVNamespace('CACHE');
                const key = `libraries:${createHash('sha512').update(':').digest('hex')}`;
                const { keys } = await cache.list();
                expect(keys).to.be.an('array');
                expect(keys).to.have.lengthOf(1);
                expect(keys[0].name).to.equal(key);
                expect(await cache.get(key, { type: 'json' })).to.be.an('array');
            });
        });

        it('reuses existing Algolia values from KV', async () => {
            const response = await request('/libraries', {}, async mf => {
                // Create a stub set of Algolia results under the `:` key (no query, no fields)
                const cache = await mf.getKVNamespace('CACHE');
                const key = `libraries:${createHash('sha512').update(':').digest('hex')}`;
                await cache.put(key, JSON.stringify([ { name: 'testing' } ]));
            });

            // Check the response was generated from KV
            expect(response).to.be.json;
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.have.lengthOf(1);
            expect(response.body.results[0]).to.have.property('name').that.is.a('string');
            expect(response.body.results[0].name).to.equal('testing');
        });

        it('reuses the same KV cache no matter the query parameter order', async () => {
            const key = `libraries:${createHash('sha512').update('test:name').digest('hex')}`;

            // Run the request with the `name` parameter first, check consistent key was used
            await request('/libraries?search=test&search_fields=name', {}, undefined, async mf => {
                const cache = await mf.getKVNamespace('CACHE');
                const { keys } = await cache.list();
                expect(keys).to.be.an('array');
                expect(keys).to.have.lengthOf(1);
                expect(keys[0].name).to.equal(key);
                expect(await cache.get(key, { type: 'json' })).to.be.an('array');
            });

            // Run the request with the `search_fields` parameter first, check consistent key was used
            await request('/libraries?search_fields=name&search=test', {}, undefined, async mf => {
                const cache = await mf.getKVNamespace('CACHE');
                const { keys } = await cache.list();
                expect(keys).to.be.an('array');
                expect(keys).to.have.lengthOf(1);
                expect(keys[0].name).to.equal(key);
                expect(await cache.get(key, { type: 'json' })).to.be.an('array');
            });
        });

        it('reuses the same KV cache no matter the search fields order', async () => {
            const key = `libraries:${createHash('sha512').update('test:keywords,name').digest('hex')}`;

            // Run the request with the `name` search field first, check consistent key was used
            await request('/libraries?search=test&search_fields=name,keywords', {}, undefined, async mf => {
                const cache = await mf.getKVNamespace('CACHE');
                const { keys } = await cache.list();
                expect(keys).to.be.an('array');
                expect(keys).to.have.lengthOf(1);
                expect(keys[0].name).to.equal(key);
                expect(await cache.get(key, { type: 'json' })).to.be.an('array');
            });

            // Run the request with the `keywords` search field first, check consistent key was used
            await request('/libraries?search=test&search_fields=keywords,name', {}, undefined, async mf => {
                const cache = await mf.getKVNamespace('CACHE');
                const { keys } = await cache.list();
                expect(keys).to.be.an('array');
                expect(keys).to.have.lengthOf(1);
                expect(keys[0].name).to.equal(key);
                expect(await cache.get(key, { type: 'json' })).to.be.an('array');
            });
        });
    });
});
