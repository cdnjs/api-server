import { css } from '@emotion/css';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as z from 'zod/mini';

import theme from '../../theme.ts';
import Copy from '../copy.tsx';
import Header from '../header.tsx';
import createIsland from '../island.tsx';
import Search from '../search.tsx';

const resultSchema = z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    latest: z.nullable(z.string()),
    sri: z.string(),
});
type Result = z.infer<typeof resultSchema>;

const getResults = async (search: string, signal?: AbortSignal) => {
    const res = await fetch(
        `https://api.cdnjs.com/libraries?search=${encodeURIComponent(search)}&fields=name,latest,version,description,sri`,
        { signal },
    );
    if (!res.ok) {
        throw new Error(
            `Failed to fetch status: ${res.status} ${res.statusText}`,
            { cause: await res.text() },
        );
    }

    const data = await res.json();
    return z.object({ results: z.array(resultSchema) }).parse(data).results;
};

const styles = {
    header: css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(2, 0)};
    `,
    found: css`
        color: ${theme.text.secondary};
        margin: 0;

        &,
        strong {
            font-size: ${theme.font.small.size};
            font-weight: ${theme.font.small.weight};
        }

        strong {
            color: ${theme.text.brand};
        }
    `,
    results: css`
        padding: 0;
        margin: ${theme.spacing(2, 0, 0)};
        list-style: none;
        transition: opacity ${theme.transition};

        @starting-style {
            opacity: 0;
        }
    `,
    row: css`
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${theme.spacing(2)};

        ${theme.breakpoints.medium} {
            grid-template-columns: 1fr;
        }
    `,
    card: css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(1)};
        padding: ${theme.spacing(2)};
        background: ${theme.background.elevated};
        border-radius: ${theme.radius};
        position: relative;
        isolation: isolate;
        transition: background ${theme.transition};

        &:has(a:hover, a:focus) {
            background: rgb(from ${theme.background.elevated} r g b / 0.75);
        }
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
        results: Result[];
        search: string;
    };
}) => {
    const [state, setState] = useState<'idle' | 'loading' | 'failed'>('idle');
    const [results, setResults] = useState(initial.results);
    const [search, setSearch] = useState(initial.search);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const controller = new AbortController();
            abortRef.current?.abort();
            abortRef.current = controller;

            try {
                setState('loading');
                setResults(
                    search === initial.search
                        ? initial.results
                        : await getResults(search, controller.signal),
                );
                setState('idle');

                const url = new URL(window.location.href);
                if (search === '') {
                    url.searchParams.delete('search');
                } else {
                    url.searchParams.set('search', search);
                }
                window.history.replaceState({}, '', url.toString());
            } catch (err) {
                if (!controller.signal.aborted) {
                    console.error(err);
                    setState('failed');
                }
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search, initial.search, initial.results]);

    const [total, setTotal] = useState(results.length.toLocaleString('en-US'));
    useEffect(() => {
        setTotal(results.length.toLocaleString());
    }, [results.length]);

    const [columns, setColumns] = useState(2);
    const listRef = useRef<HTMLUListElement | null>(null);
    const listOffsetRef = useRef(0);

    useLayoutEffect(() => {
        listOffsetRef.current = listRef.current?.offsetTop ?? 0;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(
            theme.breakpoints.medium.replace('@media ', ''),
        );
        const updateColumns = () => setColumns(media.matches ? 1 : 2);
        updateColumns();

        media.addEventListener('change', updateColumns);
        return () => media.removeEventListener('change', updateColumns);
    }, []);

    const rows = useMemo(() => {
        const count = Math.ceil(results.length / columns);
        return Array.from({ length: count }, (_, index) => {
            const values = results.slice(
                index * columns,
                index * columns + columns,
            );

            return {
                key: values
                    .map((result) =>
                        JSON.stringify([
                            result.name,
                            result.version,
                            result.description,
                            result.latest,
                            result.sri,
                        ]),
                    )
                    .join('|'),
                values,
            };
        });
    }, [columns, results]);

    const virtualizer = useWindowVirtualizer({
        count: rows.length,
        estimateSize: () => Number(theme.spacing(12).replace('px', '')),
        gap: Number(theme.spacing(2).replace('px', '')),
        overscan: 5,
        scrollMargin: listOffsetRef.current,
        getItemKey: (index) => rows[index]?.key ?? index,
        initialRect: { width: 0, height: 1000 },
    });

    return (
        <>
            <Header
                title={
                    <>
                        Browse <strong>cdnjs</strong>
                    </>
                }
            >
                <div className={styles.header}>
                    <Search value={search} onChange={setSearch} state={state} />

                    <p className={styles.found}>
                        Found <strong>{total}</strong> libraries available on
                        cdnjs.
                    </p>
                </div>
            </Header>

            <ul
                ref={listRef}
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                }}
                className={styles.results}
            >
                {virtualizer.getVirtualItems().map((item) => {
                    const row = rows[item.index];
                    if (!row) return null;

                    return (
                        <div
                            key={item.key}
                            className={styles.row}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
                            }}
                            data-index={item.index}
                            ref={virtualizer.measureElement}
                        >
                            {row.values.map((result) => (
                                <Result
                                    key={`${result.name}:${result.version}`}
                                    {...result}
                                />
                            ))}
                        </div>
                    );
                })}
            </ul>
        </>
    );
};

export default createIsland(Libraries, 'libraries.tsx');
