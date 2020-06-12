const fs = require('fs');
const assert = require('assert');

const isObject = n => Object.prototype.toString.call(n) === '[object Object]';

const main = () => {
    const [,, file] = process.argv;
    const libraries = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert(isObject(libraries));
    assert('packages' in libraries);
    assert(Array.isArray(libraries.packages));
};

main();
