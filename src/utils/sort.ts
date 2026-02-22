import semver from 'semver';

/**
 * Sort a list of versions in descending order (newest first).
 * Handles both valid semver and non-semver version strings.
 *
 * @param versions Array of version strings.
 */
export default (versions: string[]) => [ ...versions ].sort((a, b) => {
    // Attempt to parse properly as semver
    // semver.coerce returns a SemVer object or null. semver.clean expects a string.
    // We need to be careful.
    // Check if original strings are valid semver
    const aValid = semver.valid(a);
    const bValid = semver.valid(b);

    // If both are valid semver, compare them
    if (aValid && bValid) {
        return semver.rcompare(a, b);
    }

    // If one is valid and the other isn't, valid wins
    if (aValid && !bValid) return -1;
    if (!aValid && bValid) return 1;

    // Both are invalid semver strings, but maybe they can be coerced?
    const aSem = semver.coerce(a);
    const bSem = semver.coerce(b);

    if (aSem && bSem) {
        // Both coerced successfully, compare coerced versions.
        // This allows "2.0rc1" (coerced to 2.0.0) to sort before "1.0.0a" (coerced to 1.0.0).
        // Note: We deliberately prioritize VALID semver over COERCED/INVALID semver above.
        // So '1.0.0' (valid) comes before '2.0rc1' (invalid/coerced), even though 2.0.0 > 1.0.0.
        return semver.rcompare(aSem, bSem);
    }

    // If one coerces and the other doesn't, prioritize the coerced one
    // e.g. 2.0rc1 vs "latest"
    if (aSem && !bSem) return -1;
    if (!aSem && bSem) return 1;

    // Fallback to string comparison for non-semver or mixed cases
    // Use numeric collation so 1.10 > 1.9
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
});
