/**
 * Get an array based on a given query value.
 * If the query is an array, it will be returned directly.
 * If not, the query will be forced to a string, and split on commas and spaces.
 *
 * @param {string|string[]|undefined} query Query param value to extract to an array.
 * @return {string[]}
 */
export default query => {
    if (query) {
        return (Array.isArray(query) ? query : [ query ])
            .flatMap(part => part.toString().split(/[ ,]/))
            .map(item => item.toLowerCase().trim());
    }
    return [];
};
