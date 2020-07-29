module.exports = (req, threshold = 2000) => new Promise((resolve, reject) => {
    const before = Date.now();
    req().then(data => {
        const diff = Date.now() - before;
        if (diff > threshold)
            console.error(`Request to ${data.req.method} ${data.req.path} took ${diff}ms`);

        resolve(data);
    }).catch(reject);
});
