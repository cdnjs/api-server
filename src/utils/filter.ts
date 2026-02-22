/**
 * Filter an object based on a provided filter function, returning a new object with only the allowed fields.
 *
 * @param source Source object to filter keys in.
 * @param filter Function to determine if a key should be included in the output.
 */
export default <T extends Record<string, unknown>>(source: T, filter: (key: string) => boolean) =>
    Object.fromEntries(Object.entries(source).filter(([ key ]) => filter(key))) as Partial<T>;
