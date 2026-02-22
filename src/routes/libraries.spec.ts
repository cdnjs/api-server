import { createHash } from 'crypto';

import { env } from 'cloudflare:test';
import { describe, it, expect, vi } from 'vitest';

import testCors from '../utils/spec/cors.ts';
import testHuman from '../utils/spec/human.ts';
import { beforeRequest, externalApiUrl, request } from '../utils/spec/request.ts';

const kvExpectEmpty = async () => {
    expect(await env.CACHE.list()).to.have.property('keys').that.is.an('array').that.is.empty;
};

const kvExpectNonEmpty = async () => {
    await vi.waitFor(async () => {
        expect(await env.CACHE.list()).to.have.property('keys').that.is.an('array').that.is.not.empty;
    });
};

describe('/libraries', () => {
    describe('No query params', () => {
        // Fetch the endpoint
        const path = '/libraries';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.have.property('results').that.is.an('array');
            expect(body).to.have.property('total').that.is.a('number');
            expect(body).to.have.property('available').that.is.a('number');
        });
        it('returns all available hits', async () => {
            const body = await response.json();
            expect(body.results).to.have.lengthOf(body.total);
            expect(body.results).to.have.lengthOf(body.available);
        });
        describe('Library object', () => {
            it('is an object with \'name\' and \'latest\' properties', async () => {
                const body = await response.json();
                for (const result of body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    try {
                        expect(result).to.have.property('latest').that.is.a('string');
                    } catch (_) {
                        expect(result).to.have.property('latest').that.is.null;
                    }
                }
            });
            it('has a CDN url for the \'latest\' property', async () => {
                const body = await response.json();
                for (const result of body.results) {
                    try {
                        expect(result.latest).to.match(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/.+\/.+\/.*/);
                    } catch (_) {
                        expect(result.latest).to.be.null;
                    }
                }
            });
            it('has no other properties', async () => {
                const body = await response.json();
                for (const result of body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(2);
                }
            });
        });

        // Test with a trailing slash
        it('responds to requests with a trailing slash', async () => {
            const res = await request(path + '/');
            expect(res.status).to.eq(200);
            expect(await res.json()).to.deep.equal(await response.json());
        });
    });

    describe('Requesting human response (?output=human)', () => {
        // Fetch the endpoint
        const path = '/libraries?output=human';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
        });
        testHuman(response);
    });

    describe('Limiting number of results (?limit=10)', () => {
        // Fetch the endpoint
        const path = '/libraries?limit=10';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.have.property('results').that.is.an('array');
            expect(body).to.have.property('total').that.is.a('number');
            expect(body).to.have.property('available').that.is.a('number');
        });
        it('returns only the requested number of hits', async () => {
            const body = await response.json();
            expect(body.results).to.have.lengthOf(10);
            expect(body.total).to.equal(10);
            expect(body.available).to.be.above(10);
        });
    });

    describe('Requesting a field (?fields=version)', () => {
        // Fetch the endpoint
        const path = '/libraries?fields=version';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.have.property('results').that.is.an('array');
            expect(body).to.have.property('total').that.is.a('number');
            expect(body).to.have.property('available').that.is.a('number');
        });
        it('returns all available hits', async () => {
            const body = await response.json();
            expect(body.results).to.have.lengthOf(body.total);
            expect(body.results).to.have.lengthOf(body.available);
        });
        describe('Library object', () => {
            it('is an object with \'name\', \'latest\' and requested \'version\' properties', async () => {
                const body = await response.json();
                for (const result of body.results) {
                    expect(result).to.have.property('name').that.is.a('string');
                    try {
                        expect(result).to.have.property('latest').that.is.a('string');
                    } catch (_) {
                        expect(result).to.have.property('latest').that.is.null;
                    }
                    expect(result).to.have.property('version').that.is.a('string');
                }
            });
            it('has no other properties', async () => {
                const body = await response.json();
                for (const result of body.results) {
                    expect(Object.keys(result)).to.have.lengthOf(3);
                }
            });
        });
    });

    describe('Requesting a case-sensitive field', () => {
        describe('with the correct casing (?fields=fileType)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=fileType';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'fileType\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        try {
                            expect(result).to.have.property('latest').that.is.a('string');
                        } catch (_) {
                            expect(result).to.have.property('latest').that.is.null;
                        }
                        expect(result).to.have.property('fileType').that.is.a('string');
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(3);
                    }
                });
            });
        });

        describe('with incorrect casing (?fields=filetype)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filetype';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'fileType\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        try {
                            expect(result).to.have.property('latest').that.is.a('string');
                        } catch (_) {
                            expect(result).to.have.property('latest').that.is.null;
                        }
                        expect(result).to.have.property('fileType').that.is.a('string');
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
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
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'filename\' & \'version\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name');
                        expect(result).to.have.property('latest');
                        expect(result).to.have.property('filename');
                        expect(result).to.have.property('version');
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(4);
                    }
                });
            });
        });

        describe('through space-separated string (?fields=filename version)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filename version';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'filename\' & \'version\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name');
                        expect(result).to.have.property('latest');
                        expect(result).to.have.property('filename');
                        expect(result).to.have.property('version');
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(4);
                    }
                });
            });
        });

        describe('through multiple query parameters (?fields=filename&fields=version)', () => {
            // Fetch the endpoint
            const path = '/libraries?fields=filename&fields=version';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\', \'latest\' and requested \'filename\' & \'version\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name');
                        expect(result).to.have.property('latest');
                        expect(result).to.have.property('filename');
                        expect(result).to.have.property('version');
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(4);
                    }
                });
            });
        });
    });

    describe('Requesting all fields (?fields=*)', () => {
        // Fetch the endpoint
        const path = '/libraries?fields=*';
        const response = beforeRequest(path);

        // Test the endpoint
        testCors(path, response);
        it('returns the correct Cache headers', () => {
            expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
        });
        it('returns the correct status code', () => {
            expect(response.status).to.eq(200);
        });
        it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.have.property('results').that.is.an('array');
            expect(body).to.have.property('total').that.is.a('number');
            expect(body).to.have.property('available').that.is.a('number');
        });
        it('returns all available hits', async () => {
            const body = await response.json();
            expect(body.results).to.have.lengthOf(body.total);
            expect(body.results).to.have.lengthOf(body.available);
        });
        describe('Library object', () => {
            it('is an object with the full set of library properties', async () => {
                const body = await response.json();
                for (const result of body.results) {
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
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', async () => {
                it('returns the \'twitter-bootstrap\' package as the first object', async () => {
                    const body = await response.json();
                    expect(body.results[0]).to.have.property('name', 'font-awesome');
                });
                it('is an object with \'name\' and \'latest\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        expect(result).to.have.property('latest').that.is.a('string');
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(2);
                    }
                });
            });
        });

        describe('Providing a plain-text query that is longer than max that Algolia allows (?search=...)', () => {
            // Fetch the endpoint
            const path = `/libraries?search=${encodeURIComponent('a'.repeat(1024))}`;
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            // No library object as it's rather likely this won't match anything
            // But this test is just to ensure it doesn't return an error
        });

        describe('Providing a unicode query that is longer than max that Algolia allows (?search=...)', () => {
            // Fetch the endpoint
            const path = `/libraries?search=${encodeURIComponent('à'.repeat(1024))}`;
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
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
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
                });
                it('returns the correct status code', () => {
                    expect(response.status).to.eq(200);
                });
                it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                    expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                    const body = await response.json();
                    expect(body).to.have.property('results').that.is.an('array');
                    expect(body).to.have.property('total').that.is.a('number');
                    expect(body).to.have.property('available').that.is.a('number');
                });
                it('returns all available hits', async () => {
                    const body = await response.json();
                    expect(body.results).to.have.lengthOf(body.total);
                    expect(body.results).to.have.lengthOf(body.available);
                });
                describe('Library object', () => {
                    it('is an object with \'name\' and \'latest\' properties', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('latest').that.is.a('string');
                        }
                    });
                    // This is fragile!
                    // backbone.js doesn't have a keyword for itself and is owned by a user so we shouldn't see it
                    it('doesn\'t return the \'backbone.js\' package', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(result.name).to.not.equal('backbone.js');
                        }
                    });
                    it('has no other properties', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(Object.keys(result)).to.have.lengthOf(2);
                        }
                    });
                });
            });

            describe('through space-separated string (?search=backbone.js&search_fields=keywords github.user)', () => {
                // Fetch the endpoint
                const path = '/libraries?search=backbone.js&search_fields=keywords github.user';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
                });
                it('returns the correct status code', () => {
                    expect(response.status).to.eq(200);
                });
                it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                    expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                    const body = await response.json();
                    expect(body).to.have.property('results').that.is.an('array');
                    expect(body).to.have.property('total').that.is.a('number');
                    expect(body).to.have.property('available').that.is.a('number');
                });
                it('returns all available hits', async () => {
                    const body = await response.json();
                    expect(body.results).to.have.lengthOf(body.total);
                    expect(body.results).to.have.lengthOf(body.available);
                });
                describe('Library object', () => {
                    it('is an object with \'name\' and \'latest\' properties', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('latest').that.is.a('string');
                        }
                    });
                    // This is fragile!
                    // backbone.js doesn't have a keyword for itself and is owned by a user so we shouldn't see it
                    it('doesn\'t return the \'backbone.js\' package', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(result.name).to.not.equal('backbone.js');
                        }
                    });
                    it('has no other properties', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(Object.keys(result)).to.have.lengthOf(2);
                        }
                    });
                });
            });

            describe('through multiple query parameters (?search=backbone.js&search_fields=keywords&search_fields=github.user)', () => {
                // Fetch the endpoint
                const path = '/libraries?search=backbone.js&search_fields=keywords&search_fields=github.user';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
                });
                it('returns the correct status code', () => {
                    expect(response.status).to.eq(200);
                });
                it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                    expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                    const body = await response.json();
                    expect(body).to.have.property('results').that.is.an('array');
                    expect(body).to.have.property('total').that.is.a('number');
                    expect(body).to.have.property('available').that.is.a('number');
                });
                it('returns all available hits', async () => {
                    const body = await response.json();
                    expect(body.results).to.have.lengthOf(body.total);
                    expect(body.results).to.have.lengthOf(body.available);
                });
                describe('Library object', () => {
                    it('is an object with \'name\' and \'latest\' properties', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(result).to.have.property('name').that.is.a('string');
                            expect(result).to.have.property('latest').that.is.a('string');
                        }
                    });
                    // This is fragile!
                    // backbone.js doesn't have a keyword for itself and is owned by a user so we shouldn't see it
                    it('doesn\'t return the \'backbone.js\' package', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
                            expect(result.name).to.not.equal('backbone.js');
                        }
                    });
                    it('has no other properties', async () => {
                        const body = await response.json();
                        for (const result of body.results) {
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
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response.headers.get('Cache-Control')).to.eq('public, max-age=21600'); // Six hours
            });
            it('returns the correct status code', () => {
                expect(response.status).to.eq(200);
            });
            it('returns a JSON body with \'results\', \'total\' and \'available\' properties', async () => {
                expect(response.headers.get('Content-Type')).to.match(/application\/json/);

                const body = await response.json();
                expect(body).to.have.property('results').that.is.an('array');
                expect(body).to.have.property('total').that.is.a('number');
                expect(body).to.have.property('available').that.is.a('number');
            });
            it('returns all available hits', async () => {
                const body = await response.json();
                expect(body.results).to.have.lengthOf(body.total);
                expect(body.results).to.have.lengthOf(body.available);
            });
            describe('Library object', () => {
                it('is an object with \'name\' and \'latest\' properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(result).to.have.property('name').that.is.a('string');
                        try {
                            expect(result).to.have.property('latest').that.is.a('string');
                        } catch (_) {
                            expect(result).to.have.property('latest').that.is.null;
                        }
                    }
                });
                it('has no other properties', async () => {
                    const body = await response.json();
                    for (const result of body.results) {
                        expect(Object.keys(result)).to.have.lengthOf(2);
                    }
                });
            });
        });
    });

    // Don't run these tests against an external API Worker as we won't have KV access
    describe.skipIf(externalApiUrl)('Caching Algolia data with KV', () => {
        it('writes the results from Algolia to KV', async () => {
            await kvExpectEmpty();
            await request('/libraries');
            await kvExpectNonEmpty();

            // Check that the results were stored under the `:` key (no query, no fields)
            const key = `libraries:${createHash('sha512').update(':').digest('hex')}`;
            const { keys } = await env.CACHE.list();
            expect(keys).to.have.lengthOf(1);
            expect(keys[0]).to.have.property('name').that.equals(key);
            expect(await env.CACHE.get(key, { type: 'json' })).to.be.an('array');
        });

        it('reuses existing Algolia values from KV', async () => {
            // Create a stub set of Algolia results under the `:` key (no query, no fields)
            const key = `libraries:${createHash('sha512').update(':').digest('hex')}`;
            await env.CACHE.put(key, JSON.stringify([ { name: 'testing' } ]));

            // Check the response was generated from KV
            const response = await request('/libraries');
            expect(response.headers.get('Content-Type')).to.match(/application\/json/);

            const body = await response.json();
            expect(body).to.have.property('results').that.is.an('array');
            expect(body.results).to.have.lengthOf(1);
            expect(body.results[0]).to.have.property('name').that.equals('testing');
        });

        it('reuses the same KV cache no matter the query parameter order', async () => {
            const key = `libraries:${createHash('sha512').update('test:name').digest('hex')}`;

            // Run the request with the `name` parameter first
            await kvExpectEmpty();
            await request('/libraries?search=test&search_fields=name');
            await kvExpectNonEmpty();

            // Check that the results were stored under the expected key
            const { keys } = await env.CACHE.list();
            expect(keys).to.have.lengthOf(1);
            expect(keys[0]).to.have.property('name').that.equals(key);
            expect(await env.CACHE.get(key, { type: 'json' })).to.be.an('array');

            // Remove the key in KV to allow the next request to write to it again
            await env.CACHE.delete(key);

            // Run the request with the `search_fields` parameter first
            await kvExpectEmpty();
            await request('/libraries?search_fields=name&search=test');
            await kvExpectNonEmpty();

            // Check that the results were stored under the expected key
            const { keys: keysTwo } = await env.CACHE.list();
            expect(keysTwo).to.have.lengthOf(1);
            expect(keysTwo[0]).to.have.property('name').that.equals(key);
            expect(await env.CACHE.get(key, { type: 'json' })).to.be.an('array');
        });

        it('reuses the same KV cache no matter the search fields order', async () => {
            const key = `libraries:${createHash('sha512').update('test:keywords,name').digest('hex')}`;

            // Run the request with the `name` search field first
            await kvExpectEmpty();
            await request('/libraries?search=test&search_fields=name,keywords');
            await kvExpectNonEmpty();

            // Check that the results were stored under the expected key
            const { keys } = await env.CACHE.list();
            expect(keys).to.have.lengthOf(1);
            expect(keys[0]).to.have.property('name').that.equals(key);
            expect(await env.CACHE.get(key, { type: 'json' })).to.be.an('array');

            // Remove the key in KV to allow the next request to write to it again
            await env.CACHE.delete(key);

            // Run the request with the `keywords` search field first
            await kvExpectEmpty();
            await request('/libraries?search=test&search_fields=keywords,name');
            await kvExpectNonEmpty();

            // Check that the results were stored under the expected key
            const { keys: keysTwo } = await env.CACHE.list();
            expect(keysTwo).to.have.lengthOf(1);
            expect(keysTwo[0]).to.have.property('name').that.equals(key);
            expect(await env.CACHE.get(key, { type: 'json' })).to.be.an('array');
        });
    });
});
