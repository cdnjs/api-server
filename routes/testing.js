module.exports = (app) => {
    // eslint-disable-next-line no-unused-vars
    app.get('/test-error', (req, res, next) => {
        throw new Error('this is a test');
    });

    app.get('/test-async-error', async (req, res, next) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 250));
            throw new Error('this is a test');
        } catch (e) {
            next(e);
        }
    });
};
