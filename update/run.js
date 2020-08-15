// Library imports
const path = require('path');
const { Worker } = require('worker_threads');

// Local imports
const load = require('./load');

module.exports = (app) => new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'));
    worker.on('error', reject);
    worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        load(app);
        resolve();
    });
});
