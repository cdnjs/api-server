/**
 * Generate an HTML response with pretty-printed data.
 *
 * @param {import('hono').Context} ctx Request context.
 * @param {*} data Data to be included in the response.
 * @return {Response}
 */
const human = (ctx, data) => {
    ctx.header('Content-Type', 'text/html');
    ctx.header('X-Robots-Tag', 'noindex');
    return ctx.html('<!doctype><html>' +
        '<head><meta name="robots" content="noindex"/><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css" integrity="sha256-Zd1icfZ72UBmsId/mUcagrmN7IN5Qkrvh75ICHIQVTk=" crossorigin="anonymous"/></head><body>' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js" integrity="sha256-/BfiIkHlHoVihZdc6TFuj7MmJ0TWcWsMXkeDFwhi0zw=" crossorigin="anonymous"></script>' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/languages/json.min.js" integrity="sha256-KPdGtw3AdDen/v6+9ue/V3m+9C2lpNiuirroLsHrJZM=" crossorigin="anonymous" defer></script>' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/json2/20160511/json2.min.js" integrity="sha256-Fsw5X9ZUnlJb302irkG8pKCRwerGfxSArAw22uG/QkQ=" crossorigin="anonymous"></script>' +
        '<script defer>hljs.initHighlightingOnLoad();</script>' +
        '<script defer>var output=' + JSON.stringify(data) + '; ' +
        'document.write("<pre><code class=\'json\'>" + JSON.stringify(output,null,2) + "</code></pre>");</script>' +
        '<script defer>console.log("%cThanks for using cdnjs! 😊", "font: 5em roboto; color: #e95420;");</script>' +
        '</body></html>');
};

/**
 * Respond to a request with data, handling if it should be returned as JSON or pretty-printed in HTML.
 *
 * @param {import('hono').Context} ctx Request context.
 * @param {*} data Data to be included in the response.
 * @return {Response}
 */
export default (ctx, data) => ctx.req.query('output') === 'human' ? human(ctx, data) : ctx.json(data);
