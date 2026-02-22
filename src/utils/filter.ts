/**
 * Escape a string for rendering in HTML.
 *
 * @param unsafe Unsafe string to escape.
 */
const escape = (unsafe: string) => unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Generate an object containing the given fields, with values from the given source object or null.
 *
 * Field names will be escaped to be made safe for HTML.
 * This is a legacy behaviour for custom fields being requests.
 * No standard fields have characters that would require escaping.
 *
 * @param source Source object to extract safe fields from.
 * @param fields Field names to include in generated object.
 * @param all Generate object with all fields from source object (ignores fields param).
 */
export default (source: Record<string, unknown>, fields: string[], all = false) => {
    if (all) {
        return Object.entries(source).reduce((obj, [ key, value ]) => ({
            ...obj,
            [escape(key)]: value,
        }), {});
    }

    return fields.reduce((obj, field) => ({
        ...obj,
        [escape(field)]: source[field] ?? null,
    }), {});
};
