import { describe, it, expect } from 'vitest';

import testCors from '../utils/spec/cors.js';
import testHuman from '../utils/spec/human.js';
import { beforeRequest, request } from '../utils/spec/request.js';

describe('/libraries/:library/:version', () => {
    describe('Requesting a valid library (:library = backbone.js)', () => {
        describe('Requesting a valid version (:version = 1.1.0)', () => {
            describe('No query params', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js/1.1.0';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body that is a library version object', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                });
                describe('Library version object', () => {
                    it('is an object with \'name\', \'version\', \'files\', \'rawFiles\' and \'sri\' properties', () => {
                        expect(response.body).to.have.property('name', 'backbone.js');
                        expect(response.body).to.have.property('version', '1.1.0');
                        expect(response.body).to.have.property('files').that.is.an('array');
                        expect(response.body).to.have.property('rawFiles').that.is.an('array');
                        expect(response.body).to.have.property('sri').that.is.an('object');
                    });
                    it('has no other properties', () => {
                        expect(Object.keys(response.body)).to.have.lengthOf(5);
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
                const path = '/libraries/backbone.js/1.1.0?output=human';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                });
                testHuman(response);
            });

            describe('Requesting a field (?fields=files)', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js/1.1.0?fields=files';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body that is a library version object', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                });
                describe('Library version object', () => {
                    it('is an object with only the \'files\' property', () => {
                        expect(response.body).to.have.property('files').that.is.an('array');
                    });
                    it('has no other properties', () => {
                        expect(Object.keys(response.body)).to.have.lengthOf(1);
                    });
                });
            });

            describe('Requesting multiple fields', () => {
                describe('through comma-separated string (?fields=files,sri)', () => {
                    // Fetch the endpoint
                    const path = '/libraries/backbone.js/1.1.0?fields=files,sri';
                    const response = beforeRequest(path);

                    // Test the endpoint
                    testCors(path, response);
                    it('returns the correct Cache headers', () => {
                        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                    });
                    it('returns the correct status code', () => {
                        expect(response).to.have.status(200);
                    });
                    it('returns a JSON body that is a library object', () => {
                        expect(response).to.be.json;
                        expect(response.body).to.be.an('object');
                    });
                    describe('Library version object', () => {
                        it('is an object with only the \'files\' and \'sri\' properties', () => {
                            expect(response.body).to.have.property('files').that.is.an('array');
                            expect(response.body).to.have.property('sri').that.is.an('object');
                        });
                        it('has no other properties', () => {
                            expect(Object.keys(response.body)).to.have.lengthOf(2);
                        });
                    });
                });

                describe('through space-separated string (?fields=files sri)', () => {
                    // Fetch the endpoint
                    const path = '/libraries/backbone.js/1.1.0?fields=files sri';
                    const response = beforeRequest(path);

                    // Test the endpoint
                    testCors(path, response);
                    it('returns the correct Cache headers', () => {
                        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                    });
                    it('returns the correct status code', () => {
                        expect(response).to.have.status(200);
                    });
                    it('returns a JSON body that is a library object', () => {
                        expect(response).to.be.json;
                        expect(response.body).to.be.an('object');
                    });
                    describe('Library version object', () => {
                        it('is an object with only the \'files\' and \'sri\' properties', () => {
                            expect(response.body).to.have.property('files').that.is.an('array');
                            expect(response.body).to.have.property('sri').that.is.an('object');
                        });
                        it('has no other properties', () => {
                            expect(Object.keys(response.body)).to.have.lengthOf(2);
                        });
                    });
                });

                describe('through multiple query parameters (?fields=files&fields=sri)', () => {
                    // Fetch the endpoint
                    const path = '/libraries/backbone.js/1.1.0?fields=files&fields=sri';
                    const response = beforeRequest(path);

                    // Test the endpoint
                    testCors(path, response);
                    it('returns the correct Cache headers', () => {
                        expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                    });
                    it('returns the correct status code', () => {
                        expect(response).to.have.status(200);
                    });
                    it('returns a JSON body that is a library object', () => {
                        expect(response).to.be.json;
                        expect(response.body).to.be.an('object');
                    });
                    describe('Library version object', () => {
                        it('is an object with only the \'files\' and \'sri\' properties', () => {
                            expect(response.body).to.have.property('files').that.is.an('array');
                            expect(response.body).to.have.property('sri').that.is.an('object');
                        });
                        it('has no other properties', () => {
                            expect(Object.keys(response.body)).to.have.lengthOf(2);
                        });
                    });
                });
            });

            describe('Requesting all fields (?fields=*)', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js/1.1.0?fields=*';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=30672000, immutable'); // 355 days
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body that is a library version object', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                });
                describe('Library version object', () => {
                    it('is an object with \'name\', \'version\', \'files\', \'rawFiles\' and \'sri\' properties', () => {
                        expect(response.body).to.have.property('name', 'backbone.js');
                        expect(response.body).to.have.property('version', '1.1.0');
                        expect(response.body).to.have.property('files').that.is.an('array');
                        expect(response.body).to.have.property('rawFiles').that.is.an('array');
                        expect(response.body).to.have.property('sri').that.is.an('object');
                    });
                    it('has no other properties', () => {
                        expect(Object.keys(response.body)).to.have.lengthOf(5);
                    });
                });
            });
        });

        describe('Requesting a non-existent version (:version = this-version-doesnt-exist)', () => {
            describe('No query params', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js/this-version-doesnt-exist';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(404);
                });
                it('returns a JSON body that is a valid error response', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                    expect(response.body).to.have.property('error', true);
                    expect(response.body).to.have.property('status', 404);
                    expect(response.body).to.have.property('message', 'Version not found');
                });
            });

            describe('Requesting human response (?output=human)', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js/this-version-doesnt-exist?output=human';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
                });
                testHuman(response);
            });
        });
    });

    describe('Requesting a non-existent library (:library = this-library-doesnt-exist, :version = this-version-doesnt-exist)', () => {
        describe('No query params', () => {
            // Fetch the endpoint
            const path = '/libraries/this-library-doesnt-exist/this-version-doesnt-exist';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(404);
            });
            it('returns a JSON body that is a valid error response', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('error', true);
                expect(response.body).to.have.property('status', 404);
                expect(response.body).to.have.property('message', 'Library not found');
            });
        });

        describe('Requesting human response (?output=human)', () => {
            // Fetch the endpoint
            const path = '/libraries/this-library-doesnt-exist/this-version-doesnt-exist?output=human';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            });
            testHuman(response);
        });
    });
});

describe('/libraries/:library', () => {
    describe('Requesting a valid library (:library = backbone.js)', () => {
        describe('No query params', () => {
            // Fetch the endpoint
            const path = '/libraries/backbone.js';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body that is a library object', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
            });
            describe('Library object', () => {
                it('is an object with the full set of library properties', () => {
                    expect(response.body).to.have.property('name', 'backbone.js');
                    expect(response.body).to.have.property('latest').that.is.a('string');
                    expect(response.body).to.have.property('sri').that.is.a('string');
                    expect(response.body).to.have.property('filename').that.is.a('string');
                    expect(response.body).to.have.property('version').that.is.a('string');
                    expect(response.body).to.have.property('description').that.is.a('string');
                    expect(response.body).to.have.property('homepage').that.is.a('string');
                    expect(response.body).to.have.property('keywords').that.is.an('array');
                    expect(response.body).to.have.property('repository').that.is.an('object');
                    expect(response.body).to.have.property('license').that.is.a('string');
                    expect(response.body).to.have.property('author').that.is.a('string');
                    expect(response.body).to.have.property('autoupdate').that.is.an('object');
                    expect(response.body).to.have.property('assets').that.is.an('array');
                    expect(response.body).to.have.property('versions').that.is.an('array');
                });
                it('has a CDN url for the \'latest\' property', () => {
                    expect(response.body.latest).to.match(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/.+\/.+\/.*/);
                });
                it('has a \'type\' and \'url\' property for \'repository\'', () => {
                    expect(response.body.repository).to.have.property('type').that.is.a('string');
                    expect(response.body.repository).to.have.property('url').that.is.a('string');
                });
                it('has a \'type\'/\'source\' and \'target\' property for \'autoupdate\'', () => {
                    try {
                        expect(response.body.autoupdate).to.have.property('type').that.is.a('string');
                    } catch (_) {
                        expect(response.body.autoupdate).to.have.property('source').that.is.a('string');
                    }
                    expect(response.body.autoupdate).to.have.property('target').that.is.a('string');
                });
                describe('Assets array', () => {
                    it('has \'version\', \'files\', \'rawFiles\' and \'sri\' properties for each entry', () => {
                        for (const result of response.body.assets) {
                            expect(result).to.have.property('version').that.is.a('string');
                            expect(result).to.have.property('files').that.is.an('array');
                            expect(result).to.have.property('rawFiles').that.is.an('array');
                            expect(result).to.have.property('sri').that.is.an('object');
                        }
                    });
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
            const path = '/libraries/backbone.js?output=human';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            testHuman(response);
        });

        describe('Requesting a field (?fields=assets)', () => {
            // Fetch the endpoint
            const path = '/libraries/backbone.js?fields=assets';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body that is a library object', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
            });
            describe('Library object', () => {
                it('is an object with only the \'assets\' property', () => {
                    expect(response.body).to.have.property('assets').that.is.an('array');
                });
                it('has no other properties', () => {
                    expect(Object.keys(response.body)).to.have.lengthOf(1);
                });
            });
        });

        describe('Requesting multiple fields', () => {
            describe('through comma-separated string (?fields=name,assets)', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js?fields=name,assets';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body that is a library object', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                });
                describe('Library object', () => {
                    it('is an object with only the \'name\' and \'assets\' properties', () => {
                        expect(response.body).to.have.property('name').that.is.a('string');
                        expect(response.body).to.have.property('assets').that.is.an('array');
                    });
                    it('has no other properties', () => {
                        expect(Object.keys(response.body)).to.have.lengthOf(2);
                    });
                });
            });

            describe('through space-separated string (?fields=name assets)', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js?fields=name assets';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body that is a library object', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                });
                describe('Library object', () => {
                    it('is an object with only the \'name\' and \'assets\' properties', () => {
                        expect(response.body).to.have.property('name').that.is.a('string');
                        expect(response.body).to.have.property('assets').that.is.an('array');
                    });
                    it('has no other properties', () => {
                        expect(Object.keys(response.body)).to.have.lengthOf(2);
                    });
                });
            });

            describe('through multiple query parameters (?fields=name&fields=assets)', () => {
                // Fetch the endpoint
                const path = '/libraries/backbone.js?fields=name&fields=assets';
                const response = beforeRequest(path);

                // Test the endpoint
                testCors(path, response);
                it('returns the correct Cache headers', () => {
                    expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
                });
                it('returns the correct status code', () => {
                    expect(response).to.have.status(200);
                });
                it('returns a JSON body that is a library object', () => {
                    expect(response).to.be.json;
                    expect(response.body).to.be.an('object');
                });
                describe('Library object', () => {
                    it('is an object with only the \'name\' and \'assets\' properties', () => {
                        expect(response.body).to.have.property('name').that.is.a('string');
                        expect(response.body).to.have.property('assets').that.is.an('array');
                    });
                    it('has no other properties', () => {
                        expect(Object.keys(response.body)).to.have.lengthOf(2);
                    });
                });
            });
        });

        describe('Requesting all fields (?fields=*)', () => {
            // Fetch the endpoint
            const path = '/libraries/backbone.js?fields=*';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=21600'); // 6 hours
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(200);
            });
            it('returns a JSON body that is a library object', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
            });
            describe('Library object', () => {
                // Behaves the same as not including the fields query param
                it('is an object with the full set of library properties', () => {
                    expect(response.body).to.have.property('name', 'backbone.js');
                    expect(response.body).to.have.property('latest').that.is.a('string');
                    expect(response.body).to.have.property('sri').that.is.a('string');
                    expect(response.body).to.have.property('filename').that.is.a('string');
                    expect(response.body).to.have.property('version').that.is.a('string');
                    expect(response.body).to.have.property('description').that.is.a('string');
                    expect(response.body).to.have.property('homepage').that.is.a('string');
                    expect(response.body).to.have.property('keywords').that.is.an('array');
                    expect(response.body).to.have.property('repository').that.is.an('object');
                    expect(response.body).to.have.property('license').that.is.a('string');
                    expect(response.body).to.have.property('author').that.is.a('string');
                    expect(response.body).to.have.property('autoupdate').that.is.an('object');
                    expect(response.body).to.have.property('assets').that.is.an('array');
                    expect(response.body).to.have.property('versions').that.is.an('array');
                });
            });
        });
    });

    describe('Requesting a non-existent library (:library = this-library-doesnt-exist)', () => {
        describe('No query params', () => {
            // Fetch the endpoint
            const path = '/libraries/this-library-doesnt-exist';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            });
            it('returns the correct status code', () => {
                expect(response).to.have.status(404);
            });
            it('returns a JSON body that is a valid error response', () => {
                expect(response).to.be.json;
                expect(response.body).to.be.an('object');
                expect(response.body).to.have.property('error', true);
                expect(response.body).to.have.property('status', 404);
                expect(response.body).to.have.property('message', 'Library not found');
            });
        });

        describe('Requesting human response (?output=human)', () => {
            // Fetch the endpoint
            const path = '/libraries/this-library-doesnt-exist?output=human';
            const response = beforeRequest(path);

            // Test the endpoint
            testCors(path, response);
            it('returns the correct Cache headers', () => {
                expect(response).to.have.header('Cache-Control', 'public, max-age=3600'); // 1 hour
            });
            testHuman(response);
        });
    });
});
