const fs = require('fs');

const main = () => {
    const [,,file] = process.argv;
    const libraries = JSON.parse(fs.readFileSync(file, 'utf8')).packages;
    assert(Array.isArray(libraries));
};

main();
