import { required } from '../utils/filter.ts';
import Libraries from '../utils/jsx/islands/libraries.tsx';

import type { LibrariesResponse } from './libraries.schema.ts';

type Result = LibrariesResponse['results'][number];

const requiredResults = (
    results: Result[],
): results is (Result &
    Required<
        Pick<Result, 'name' | 'latest' | 'version' | 'description' | 'sri'>
    >)[] =>
    results.every((result) =>
        required(result, 'name', 'latest', 'version', 'description', 'sri'),
    );

/**
 * /libraries page component.
 *
 * @param props Page props.
 * @param props.data Initial libraries data.
 * @param props.search Initial search query.
 */
export default ({
    data,
    search,
}: {
    data: LibrariesResponse;
    search: string;
}) => {
    if (!requiredResults(data.results)) {
        throw new Error('Results data is missing required fields');
    }

    return (
        <>
            <Libraries initial={{ results: data.results, search }} />
        </>
    );
};
