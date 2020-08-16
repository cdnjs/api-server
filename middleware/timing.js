// Library imports
const onHeaders = require('on-headers');
const onFinished = require('on-finished');
const Sentry = require('@sentry/node');

module.exports = (req, res, next) => {
    // Record processing start & response start
    req.start = Date.now();
    onHeaders(res, () => req.startResp = Date.now());

    // Log once request is done
    onFinished(res, () => {
        req.end = Date.now();
        const total = req.end - req.start;
        if (total >= 1500) {
            console.error(`Request to ${req.originalUrl} took longer than 1.5s:`, total.toLocaleString());
            if (process.env.SENTRY_DSN) {
                Sentry.withScope(scope => {
                    scope.setTag('originalUrl', req.originalUrl);
                    scope.setTag('time.total', total.toLocaleString());
                    scope.setTag('time.process', (req.startResp - req.start).toLocaleString());
                    scope.setTag('time.response', (req.end - req.startResp).toLocaleString());
                    Sentry.captureException(new Error('Request took longer than 1.5s'));
                });
            }
        }
    });

    next();
};
