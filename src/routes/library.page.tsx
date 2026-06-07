import { css } from '@emotion/css';
import spdxLicenseIds from 'spdx-license-ids';

import { required } from '../utils/filter.ts';
import Files from '../utils/jsx/islands/files.tsx';
import theme from '../utils/theme.ts';

import type {
    LibraryResponse,
    LibraryVersionResponse,
} from './library.schema.ts';

const libraryRepo = (library: LibraryResponse) => {
    const raw =
        library.repository?.url ||
        (library.autoupdate?.source === 'git'
            ? library.autoupdate.target
            : undefined);
    if (!raw) return null;

    const parsed = raw.match(
        /^(?:https:\/\/|git@)?(?:www\.)?github\.com[:/]([^/]+)\/([^/]+)$/,
    );
    if (!parsed) return null;

    const [, owner, name] = parsed;
    if (!owner || !name) return null;

    return {
        owner,
        name: name.replace(/\.git$/, ''),
    };
};

const styles = {
    header: css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(2)};
        margin: ${theme.spacing(-2, 0, 2)};
        padding: ${theme.spacing(2, 0)};
        position: relative;
        isolation: isolate;
        z-index: 1;

        &::before {
            content: '';
            position: absolute;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.background.header};
            top: 0;
            bottom: 0;
            z-index: -1;
        }
    `,
    row: css`
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: ${theme.spacing(1, 2)};
    `,
    name: css`
        margin: 0;
        font-size: ${theme.font.heading.size};
        font-weight: ${theme.font.heading.weight};
    `,
    description: css`
        margin: 0;
        font-size: ${theme.font.large.size};
        font-weight: ${theme.font.large.weight};
    `,
    link: css`
        margin: 0;
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};

        a {
            color: ${theme.text.brand};
            text-decoration: underline;

            &:hover {
                text-decoration: none;
            }
        }
    `,
    keywords: css`
        margin: 0;
        font-size: ${theme.font.small.size};
        font-weight: ${theme.font.small.weight};
        color: ${theme.text.secondary};
    `,
};

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
    if (!required(library, 'name', 'description', 'versions')) {
        throw new Error('Library data is missing required fields');
    }

    if (!required(version, 'version', 'files', 'sri')) {
        throw new Error('Library version data is missing required fields');
    }

    const repo = libraryRepo(library);

    return (
        <>
            <div className={styles.header}>
                <div className={styles.row}>
                    <h1 className={styles.name}>{library.name}</h1>
                    <p className={styles.description}>{library.description}</p>
                </div>

                <div className={styles.row}>
                    {library.license && (
                        <p className={styles.link}>
                            {spdxLicenseIds.includes(library.license) ? (
                                <a
                                    href={`https://spdx.org/licenses/${encodeURIComponent(library.license)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {library.license}
                                </a>
                            ) : (
                                library.license
                            )}{' '}
                            licensed
                        </p>
                    )}

                    {library.autoupdate?.source === 'npm' && (
                        <p className={styles.link}>
                            <a
                                href={`https://www.npmjs.com/package/${encodeURIComponent(library.autoupdate?.target)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                npm package
                            </a>
                        </p>
                    )}

                    {repo && (
                        <p className={styles.link}>
                            <a
                                href={`https://github.com/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub repository
                            </a>
                        </p>
                    )}

                    {library.homepage && (
                        <p className={styles.link}>
                            <a
                                href={library.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {library.homepage}
                            </a>
                        </p>
                    )}
                </div>

                {!!library.keywords?.length && (
                    <p className={styles.keywords}>
                        Keywords:{' '}
                        {library.keywords.map((keyword, index, arr) => (
                            <span key={index}>
                                {keyword}
                                {index < arr.length - 1 && ', '}
                            </span>
                        ))}
                    </p>
                )}
            </div>

            <Files
                name={library.name}
                version={version.version}
                files={version.files}
                sri={version.sri}
                versions={library.versions}
            />
        </>
    );
};
