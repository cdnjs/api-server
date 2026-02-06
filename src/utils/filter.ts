/**
 * Filter an object based on a provided filter function, returning a new object with only the allowed fields.
 *
 * @param {Object} source Source object to filter keys in.
 * @param {function(string): boolean} filter Function to determine if a key should be included in the output.
 * @return {Object}
 */
export default (source, filter) => Object.fromEntries(Object.entries(source).filter(([ key ]) => filter(key)));
