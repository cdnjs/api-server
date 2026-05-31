/**
 * Filter an object based on a provided filter function, returning a new object with only the allowed fields.
 *
 * @param source Source object to filter keys in.
 * @param filter Function to determine if a key should be included in the output.
 */
export default <T extends Record<string, unknown>>(
    source: T,
    filter: (key: string) => boolean,
) =>
    Object.fromEntries(
        Object.entries(source).filter(([key]) => filter(key)),
    ) as Partial<T>;

/**
 * Check that an object has the specified keys, and that they are not undefined. Useful for checking a filtered object has fields before accessing them.
 *
 * @param source Source object to check for required keys.
 * @param keys Keys to check for in the source object.
 */
export const required = <
    T extends object,
    const K extends readonly Extract<keyof T, string>[],
>(
    source: T,
    ...keys: K
): source is T & Required<Pick<T, K[number]>> => {
    for (const key of keys) {
        if (source[key] === undefined) return false;
    }
    return true;
};
