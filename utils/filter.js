const escape = unsafe => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const safe = unsafe => {
    return Array.isArray(unsafe) ? unsafe.map(escape) : escape(unsafe);
};

module.exports = (obj, fields, all = false) => {
    if (all || !Array.isArray(fields) || !fields.length) return obj;

    const newObj = {};
    safe(fields).forEach(field => {
        newObj[field] = obj[field] || null;
    });
    return newObj;
};
