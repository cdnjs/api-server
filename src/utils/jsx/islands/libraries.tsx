import { css } from '@emotion/css';
import { useEffect, useState } from 'react';

import theme from '../../theme.ts';
import Copy from '../copy.tsx';
import IconSearch from '../icons/search.tsx';
import createIsland from '../island.tsx';

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
    search: css`
        position: relative;
        color: ${theme.text.inverted};

        input {
            width: 100%;
            padding: ${theme.spacing(1, 6, 1, 1)};
            font-size: ${theme.font.large.size};
            font-weight: ${theme.font.large.weight};
            border: ${theme.spacing(0.125)} solid ${theme.background.body};
            border-radius: ${theme.radius};
        }

        svg {
            position: absolute;
            right: ${theme.spacing(2)};
            top: 50%;
            transform: translateY(-50%);
            width: ${theme.spacing(3)};
            height: ${theme.spacing(3)};
            pointer-events: none;
        }
    `,
    found: css`
        color: ${theme.text.secondary};
        font-size: ${theme.font.small.size};
        font-weight: ${theme.font.small.weight};
        margin: 0;

        strong {
            color: ${theme.text.brand};
        }
    `,
    results: css`
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: ${theme.spacing(2)};
        padding: 0;
        margin: 0;
        list-style: none;

        ${theme.breakpoints.medium} {
            grid-template-columns: 1fr;
        }
    `,
    card: css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(1)};
        padding: ${theme.spacing(2)};
        background: ${theme.background.footer};
        border-radius: ${theme.radius};
        position: relative;
        isolation: isolate;
    `,
    name: css`
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing(1)};

        a {
            color: ${theme.text.brand};
            font-size: ${theme.font.large.size};
            font-weight: ${theme.font.large.weight};
            text-decoration: underline;

            &:hover {
                text-decoration: none;
            }

            &::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
            }

            small {
                font-size: ${theme.font.small.size};
                font-weight: ${theme.font.small.weight};
            }
        }

        button {
            z-index: 1;
        }
    `,
    description: css`
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};
        margin: 0;
    `,
};

const Result = ({
    name,
    version,
    description,
    latest,
    sri,
}: {
    name: string;
    version: string;
    description: string;
    latest: string | null;
    sri: string;
}) => {
    return (
        <li className={styles.card}>
            <div className={styles.name}>
                <a
                    href={`/libraries/${encodeURIComponent(name)}/${encodeURIComponent(version)}?output=human`}
                >
                    {name} <small>@ {version}</small>
                </a>

                {latest && (
                    <Copy
                        name={name}
                        version={version}
                        file={latest}
                        sri={sri}
                    />
                )}
            </div>
            <p className={styles.description}>{description}</p>
        </li>
    );
};

const Libraries = ({
    initial,
}: {
    initial: {
        results: {
            name: string;
            version: string;
            description: string;
            latest: string | null;
            sri: string;
        }[];
        search: string;
    };
}) => {
    const [results, setResults] = useState(initial.results);
    const [search, setSearch] = useState(initial.search);

    const [total, setTotal] = useState(results.length.toLocaleString('en-US'));
    useEffect(() => {
        setTotal(results.length.toLocaleString());
    }, [results.length]);

    return (
        <>
            <div className={styles.header}>
                <form
                    className={styles.search}
                    action="/libraries"
                    method="get"
                >
                    <input type="hidden" name="output" value="human" />
                    <input
                        type="text"
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search libraries on cdnjs..."
                    />
                    <IconSearch />
                </form>

                <p className={styles.found}>
                    Found <strong>{total}</strong> libraries available on cdnjs.
                </p>
            </div>

            <ul className={styles.results}>
                {results.map((result) => (
                    <Result key={result.name} {...result} />
                ))}
            </ul>
        </>
    );
};

export default createIsland(Libraries, 'libraries.tsx');
