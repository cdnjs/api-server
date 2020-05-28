const cors = require('cors');

const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version'],
    optionsSuccessStatus: 204,
};

module.exports = (app) => app.use(cors(corsOptions));

// exported for testing
module.exports.corsOptions = corsOptions;
