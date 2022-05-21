import cache from '../utils/cache';

export default app => {
    // Redirect root the API docs
    app.get('/', ctx => {
        // Set a 355 day (same as CDN) life on this response
        // This is also immutable
        cache(ctx, 355 * 24 * 60 * 60, true);

        // Redirect to the API docs
        return ctx.redirect('https://cdnjs.com/api', 301);
    });

    // Respond that the API is up
    app.get('/health', ctx => {
        // Don't cache health, ensure its always live
        cache(ctx, -1);

        // Respond
        return ctx.text('OK');
    });

    // Don't ever index anything on the API
    app.get('/robots.txt', ctx => {
        // Set a 355 day (same as CDN) life on this response
        // This is also immutable
        cache(ctx, 355 * 24 * 60 * 60, true);

        // Disallow all robots
        return ctx.text('User-agent: *\nDisallow: /');
    });
};
