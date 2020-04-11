module.exports = app => {
    // 404
    app.use((req, res) => {
        res.status(404).json({
            error: true,
            status: 404,
            message: 'Endpoint not found',
        });
    });

    // 500
    app.use((err, req, res) => {
        console.error(err.stack);
        res.status(500).json({
            error: true,
            status: 500,
            message: err.message,
        });
    });
};
