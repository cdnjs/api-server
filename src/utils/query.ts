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
export const queryArray = query => {
    if (query) {
        return (Array.isArray(query) ? query : [ query ])
            .flatMap(part => part.toString().split(/[ ,]/))
            .map(item => item.toLowerCase().trim());
    }
    return [];
};

/**
 * Get a function to check if a value is included in the query value.
 *
 * @param {string|string[]|undefined} query Query param value to extract values from.
 * @param {boolean} [allByDefault=true] Whether to consider all values included if the query is empty.
 * @return {function(string): boolean}
 */
export const queryCheck = (query, allByDefault = true) => {
    const values = queryArray(query);
    const all = values.includes('*') || (allByDefault && values.length === 0);
    return value => all || values.includes(value.toLowerCase());
};
