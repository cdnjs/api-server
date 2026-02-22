import { describe, it, expect } from 'vitest';

import sortVersions from './sort.ts';

describe('utils/sort', () => {
    it('does not mutate the input array', () => {
        const versions = [ '1.0.0', '2.1.3', '0.5.0' ];
        const input = [ ...versions ];
        sortVersions(input);
        expect(input).toEqual(versions);
    });

    it('sorts semver versions in descending order', () => {
        const versions = [ '1.0.0', '2.1.3', '0.5.0' ];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([ '2.1.3', '1.0.0', '0.5.0' ]);
    });

    it('sorts pre-release versions correctly', () => {
        const versions = [ '1.0.0', '1.0.0-beta', '1.0.0-alpha' ];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([ '1.0.0', '1.0.0-beta', '1.0.0-alpha' ]);
    });

    it('sorts complex pre-release versions correctly', () => {
        // This relies on string comparison for pre-release tags like "beta2" vs "beta1".
        // "beta10" would incorrectly come before "beta2" because it's a string compare.
        const versions = [ '11.0.1', '11.0.0', '11.0.0-beta2', '11.0.0-beta1' ];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([ '11.0.1', '11.0.0', '11.0.0-beta2', '11.0.0-beta1' ]);
    });


    it('sorts non-semver versions gracefully', () => {
        const versions = [ '1.0.0a', '2.0rc1', '1.0.0' ];
        const sorted = sortVersions([ ...versions ]);
        // 1.0.0 is valid semver. The others are not.
        // Logic: Valid semver > Coerced semver.
        // 1.0.0 comes first (valid).
        // 2.0rc1 (coerces to 2.0.0) comes before 1.0.0a (coerces to 1.0.0).
        expect(sorted).toEqual([ '1.0.0', '2.0rc1', '1.0.0a' ]);
    });

    it('sorts mixed semver and non-semver versions', () => {
        const versions = [ '1.0.0', 'not-a-version', '2.0.0' ];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([ '2.0.0', '1.0.0', 'not-a-version' ]); // Assuming valid semver takes precedence or falls back safely
    });

    it('handles empty arrays', () => {
        const versions = [];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([]);
    });

    it('handles single item arrays', () => {
        const versions = [ '1.0.0' ];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([ '1.0.0' ]);
    });
    it('sorts numeric-like strings that are not strict semver', () => {
        // These strings are coerced to valid semver (1.9.0, 1.10.0)
        // so they are sorted by semver.rcompare, NOT localeCompare.
        const versions = [ '1.9', '1.10' ];
        const sorted = sortVersions([ ...versions ]);
        expect(sorted).toEqual([ '1.10', '1.9' ]);
    });

    it('sorts truly non-semver strings using numeric localeCompare', () => {
        // These strings cannot be coerced to semver, so they strictly use localeCompare
        const versions = [ 'release-1.9', 'release-1.10' ];
        const sorted = sortVersions([ ...versions ]);
        // numeric: true should make release-1.10 > release-1.9
        expect(sorted).toEqual([ 'release-1.10', 'release-1.9' ]);
    });
});
