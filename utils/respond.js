const human = (res, data) => {
    res.header('Content-Type', 'text/html');
    res.header('X-Robots-Tag', 'noindex');
    res.send('<!doctype><html>' +
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

module.exports = (req, res, data) => {
    if (req.query.output && req.query.output === 'human') {
        human(res, data);
    } else {
        res.json(data);
    }
};
