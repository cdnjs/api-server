module.exports = (res, age, immutable = false) => {
    res.setHeader('Expires',
        new Date(Date.now() + age * 1000).toUTCString());
    res.setHeader('Cache-Control',
        ['public', `max-age=${age}`, immutable ? 'immutable' : null].filter(x => !!x).join(', '));
};
