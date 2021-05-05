module.exports = (res, age, immutable = false) => {
    if (age === -1 || process.env.DISABLE_CACHING === '1') {
        res.setHeader('Expires', '0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return;
    }

    res.setHeader('Expires',
        new Date(Date.now() + age * 1000).toUTCString());
    res.setHeader('Cache-Control',
        ['public', `max-age=${age}`, immutable ? 'immutable' : null].filter(x => !!x).join(', '));
};
