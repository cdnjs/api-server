/**
 * Filter a given object by a set of field names, or all fields.
 *
 * @param source Source object to extract safe fields from.
 * @param fields Field names to include in generated object.
 * @param all Generate object with all fields from source object (ignores fields param).
 */
export default <T extends Record<string, unknown>>(source: T, fields: string[], all = false): Partial<T> => {
    if (all) return source;

    return fields.reduce((obj, field) => field in source ? { ...obj, [field]: source[field] } : obj, {} as Partial<T>);
};
