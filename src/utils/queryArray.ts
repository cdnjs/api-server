/**
 * Get an array based on a given query value.
 * Splits strings on commas and spaces, casting them to lowercase and trimming each item.
 *
 * If given an array, the splitting operation will be applied to each item,
 *  and the result flattened into a single-level array.
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
