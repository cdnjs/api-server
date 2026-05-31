import { required } from '../utils/filter.ts';
import Files from '../utils/jsx/islands/files.tsx';

import type {
    LibraryResponse,
    LibraryVersionResponse,
} from './library.schema.ts';

/**
 * /library/:version page component.
 *
 * @param props Page props.
 * @param props.library Library data.
 * @param props.version Library version data.
 */
export default ({
    library,
    version,
}: {
    library: LibraryResponse;
    version: LibraryVersionResponse;
}) => {
    if (!required(library, 'name', 'description', 'version')) {
        throw new Error('Library data is missing required fields');
    }

    if (!required(version, 'version', 'files', 'sri')) {
        throw new Error('Library version data is missing required fields');
    }

    return (
        <div>
            <h1>{library.name}</h1>
            <p>{library.description}</p>

            <h2>Version {version.version}</h2>
            <Files
                name={library.name}
                version={version.version}
                files={version.files}
                sri={version.sri}
            />
        </div>
    );
};
