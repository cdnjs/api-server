module.exports = req => new Promise((resolve, reject) => {
    const before = Date.now();
    req().then(data => {
        const diff = Date.now() - before;
        if (diff > 2000)
            console.error(`Request to ${data.req.method} ${data.req.path} took ${diff}ms`);

        resolve(data);
    }).catch(reject);
});
