// Local imports
const run = require('./run');

module.exports = (app, localMode) => {
    // Start the updater, every 10 mins, if not in local mode
    if (!localMode) {
        setInterval(() => {
            run(app).then(() => {});
        }, 10 * 60 * 1000);
    }
};
