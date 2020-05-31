module.exports = (query, field) => {
    if (field in query) {
        if (query[field]) {
            if (Array.isArray(query[field])) return query[field];
            return query[field].toString().split(',');
        }
    }
    return [];
};
