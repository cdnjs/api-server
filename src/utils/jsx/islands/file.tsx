import { css } from '@emotion/css';
import { useMemo } from 'react';

import theme from '../../theme.ts';
import Copy from '../copy.tsx';
import createIsland from '../island.tsx';

const styles = {
    container: css`
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${theme.spacing(1)};
    `,
    url: css`
        background: ${theme.background.primary};
        border-radius: ${theme.radius};
        color: ${theme.text.primary};
        font-family: ${theme.font.families.mono};
        font-size: ${theme.font.small.size};
        font-weight: ${theme.font.small.weight};
        padding: ${theme.spacing(0.5, 1)};
        flex: 1;
    `,
};

/**
 * Library version file island component to render the default file on the CDN for a library version.
 *
 * @param props Component props.
 * @param props.name Library name.
 * @param props.version Library version.
 * @param props.filename Library default filename.
 * @param props.files List of files for the library version.
 * @param props.sri Map of file names to SRI hashes for the library version.
 */
const File = ({
    name,
    version,
    filename,
    files,
    sri,
}: {
    name: string;
    version: string;
    filename?: string;
    files: string[];
    sri: Record<string, string>;
}) => {
    const file = useMemo(
        () => files.find((f) => f === filename),
        [files, filename],
    );
    return (
        <div className={styles.container}>
            <code className={styles.url}>
                {`https://cdnjs.cloudflare.com/ajax/libs/${name}/${version}/${file ?? '...'}`}
            </code>

            <Copy
                name={name}
                version={version}
                file={file ?? '...'}
                sri={file ? sri[file] : undefined}
            />
        </div>
    );
};

export default createIsland(File, 'file.tsx');
