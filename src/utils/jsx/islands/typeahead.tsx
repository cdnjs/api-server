import { css, cx } from '@emotion/css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as z from 'zod/mini';

import theme from '../../theme.ts';
import createIsland from '../island.tsx';
import Search from '../search.tsx';

const resultSchema = z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
});
type Result = z.infer<typeof resultSchema>;

const getResults = async (search: string, signal?: AbortSignal, limit = 6) => {
    const res = await fetch(
        `https://api.cdnjs.com/libraries?search=${encodeURIComponent(search)}&fields=name,version,description&limit=${limit}`,
        { signal },
    );
    if (!res.ok) {
        throw new Error(
            `Failed to fetch status: ${res.status} ${res.statusText}`,
            { cause: await res.text() },
        );
    }

    const data = await res.json();
    return z
        .object({ results: z.array(resultSchema), available: z.number() })
        .parse(data);
};

const styles = {
    container: css`
        position: relative;
    `,
    popover: css`
        position: absolute;
        background: ${theme.background.footer};
        border-radius: ${theme.radius};
        box-shadow: 0 0 ${theme.spacing(2)} ${theme.background.footer};
        outline: ${theme.spacing(0.125)} solid ${theme.background.body};
        padding: ${theme.spacing(1, 0)};
        margin: ${theme.spacing(1, 0, 0)};
        overflow: hidden;
        z-index: 1;
    `,
    bar: css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${theme.spacing(1, 2)};

        p,
        a {
            font-size: ${theme.font.tiny.size};
            font-weight: ${theme.font.tiny.weight};
            line-height: 1;
        }

        p {
            color: rgb(from ${theme.text.secondary} r g b / 0.75);
            font-family: monospace;
            text-transform: uppercase;
            margin: 0;
        }

        a {
            color: ${theme.text.brand};
            text-decoration: none;

            &:hover,
            &:focus {
                text-decoration: underline;
            }
        }
    `,
    results: css`
        list-style: none;
        margin: 0;
        padding: 0;
    `,
    result: css`
        padding: ${theme.spacing(0, 1)};

        a {
            background: transparent;
            border-radius: ${theme.radius};
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing(0.5)};
            text-decoration: none;
            padding: ${theme.spacing(1)};
            transition: background ${theme.transition};

            &:hover,
            &:focus {
                background: rgb(from ${theme.background.brand} r g b / 0.1);

                p {
                    strong {
                        color: ${theme.text.brand};
                    }
                }
            }

            p {
                color: ${theme.text.secondary};
                font-size: ${theme.font.small.size};
                font-weight: ${theme.font.small.weight};
                margin: 0;

                strong {
                    color: ${theme.text.primary};
                    font-size: ${theme.font.body.size};
                    font-weight: ${theme.font.body.weight};
                    transition: color ${theme.transition};
                }

                small {
                    color: rgb(from ${theme.text.secondary} r g b / 0.75);
                    font-family: monospace;
                    font-size: ${theme.font.tiny.size};
                    font-weight: ${theme.font.tiny.weight};
                }
            }
        }
    `,
    empty: css`
        color: rgb(from ${theme.text.secondary} r g b / 0.75);
        margin: ${theme.spacing(1, 0, 1.5)};
        text-align: center;

        &,
        strong {
            font-size: ${theme.font.small.size};
            font-weight: ${theme.font.small.weight};
        }

        strong {
            color: ${theme.text.primary};
        }
    `,
};

const Typeahead = ({ className }: { className?: string }) => {
    const [state, setState] = useState<'idle' | 'loading' | 'failed'>(
        'loading',
    );
    const [results, setResults] = useState<Result[]>([]);
    const [total, setTotal] = useState('0');
    const [queried, setQueried] = useState('');
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const runSearch = useCallback(async (search: string) => {
        const controller = new AbortController();
        abortRef.current?.abort();
        abortRef.current = controller;

        try {
            setState('loading');
            const { results, available } = await getResults(
                search,
                controller.signal,
            );
            setResults(results);
            setTotal(available.toLocaleString());
            setQueried(search);
            setState('idle');
        } catch (err) {
            if (!controller.signal.aborted) {
                console.error(err);
                setState('failed');
            }
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => runSearch(query), 300);
        return () => clearTimeout(timer);
    }, [runSearch, query]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);

    const popover = useCallback(() => {
        if (!containerRef.current || !popoverRef.current) return;
        const { bottom, left, width } =
            containerRef.current.getBoundingClientRect();
        popoverRef.current.style.top = `${bottom + window.scrollY}px`;
        popoverRef.current.style.left = `${left + window.scrollX}px`;
        popoverRef.current.style.width = `${width}px`;
    }, []);

    useEffect(() => {
        if (!active) return;
        window.addEventListener('resize', popover);
        return () => window.removeEventListener('resize', popover);
    }, [active, popover]);

    return (
        <div ref={containerRef} className={cx(styles.container, className)}>
            <Search
                value={query}
                onChange={setQuery}
                onFocus={() => {
                    setActive(true);
                    runSearch(query);
                    popover();
                }}
                onBlur={() => setActive(false)}
                onSubmit={() => {
                    window.location.href = `/libraries?search=${encodeURIComponent(query)}&output=human`;
                }}
                state={state}
            />

            {active &&
                createPortal(
                    <div
                        ref={(el) => {
                            popoverRef.current = el;
                            if (el) popover();
                        }}
                        className={styles.popover}
                    >
                        <div className={styles.bar}>
                            <p>
                                {state === 'loading' && 'Searching...'}
                                {state === 'failed' &&
                                    'Failed to fetch results'}
                                {state === 'idle' &&
                                    queried === '' &&
                                    'Popular libraries'}
                                {state === 'idle' &&
                                    queried !== '' &&
                                    `${total} results`}
                            </p>

                            {state === 'idle' && results.length > 0 && (
                                <a
                                    href={`/libraries?search=${encodeURIComponent(queried)}&output=human`}
                                >
                                    View all
                                </a>
                            )}
                        </div>

                        {state === 'idle' && results.length === 0 && (
                            <p className={styles.empty}>
                                No results found for "<strong>{queried}</strong>
                                "
                            </p>
                        )}

                        {state === 'idle' && results.length > 0 && (
                            <ul className={styles.results}>
                                {results.map(
                                    ({ name, version, description }) => (
                                        <li
                                            key={name}
                                            className={styles.result}
                                        >
                                            <a
                                                href={`/libraries/${encodeURIComponent(name)}/${encodeURIComponent(version)}?output=human`}
                                            >
                                                <p>
                                                    <strong>{name}</strong>{' '}
                                                    <small>{version}</small>
                                                </p>
                                                <p>{description}</p>
                                            </a>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default createIsland(Typeahead, 'typeahead.tsx');
