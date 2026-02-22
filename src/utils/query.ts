/**
 * Get an array based on a given query value.
 * Splits strings on commas and spaces, casting them to lowercase and trimming each item.
 *
 * If given an array, the splitting operation will be applied to each item,
 *  and the result flattened into a single-level array.
 *
 * @param query Query param value to extract to an array.
 */
export const queryArray = (query?: string | string[]) => {
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
 * @param query Query param value to extract values from.
 * @param allByDefault Whether to consider all values included if the query is empty.
 */
export const queryCheck = (query?: string | string[], allByDefault = true) => {
    const values = queryArray(query);
    const all = values.includes('*') || (allByDefault && values.length === 0);
    return (value: string) => all || values.includes(value.toLowerCase());
};
