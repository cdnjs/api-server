import { css, cx } from '@emotion/css';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {
    type HTMLAttributes,
    type RefAttributes,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import semver from 'semver';

import fileTypes from '../../files.ts';
import theme from '../../theme.ts';
import Copy from '../copy.tsx';
import createIsland from '../island.tsx';

const isPre = (version: string) => semver.prerelease(version) !== null;

const styles = {
    toolbar: css`
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing(1, 2)};
        margin: ${theme.spacing(2, 0)};
    `,
    count: css`
        color: ${theme.text.secondary};
        font-size: ${theme.font.small.size};
        font-weight: ${theme.font.small.weight};
        margin: 0 auto 0 0;
    `,
    dropdown: css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(0.5)};

        label {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        select {
            background: ${theme.background.elevated};
            color: ${theme.text.primary};
            cursor: pointer;
            padding: ${theme.spacing(0.5, 1)};
            font-size: ${theme.font.body.size};
            font-weight: ${theme.font.body.weight};
            border: none;
            border-radius: ${theme.radius};
            flex-shrink: 1;
            min-width: ${theme.spacing(20)};
            transition: color ${theme.transition};

            &:hover {
                color: ${theme.text.brand};
            }
        }
    `,
    list: css`
        list-style: none;
        padding: 0;
        margin: 0;
        transition: opacity ${theme.transition};

        @starting-style {
            opacity: 0;
        }
    `,
    file: css`
        width: 100%;
        display: flex;
        align-items: center;
        gap: ${theme.spacing(0.5)};
        padding: ${theme.spacing(0.5, 1)};
        background: ${theme.background.elevated};
        border-radius: ${theme.radius};

        a {
            font-size: ${theme.font.body.size};
            font-weight: ${theme.font.body.weight};
            color: ${theme.text.brand};
            text-decoration: underline;

            &:hover {
                text-decoration: none;
            }
        }
    `,
};

const Versions = ({
    name,
    version,
    versions,
}: {
    name: string;
    version: string;
    versions: string[];
}) => {
    const [selected, setSelected] = useState(version);
    const grouped = useMemo(
        () =>
            versions.reduce<{ rel: string[]; pre: string[] }>(
                (groups, ver) => {
                    groups[isPre(ver) ? 'pre' : 'rel'].push(ver);
                    return groups;
                },
                { rel: [], pre: [] },
            ),
        [versions],
    );

    return (
        <div className={styles.dropdown}>
            <label htmlFor="version">Version:</label>
            <select
                id="version"
                value={selected}
                disabled={selected !== version}
                onChange={(e) => {
                    const changed = e.target.value;
                    if (changed === selected) return;
                    setSelected(changed);
                    window.location.href = `/libraries/${encodeURIComponent(name)}/${encodeURIComponent(changed)}`;
                }}
            >
                {!!grouped.rel.length && (
                    <optgroup label="Versions">
                        {grouped.rel.map((ver) => (
                            <option key={ver} value={ver}>
                                {ver}
                            </option>
                        ))}
                    </optgroup>
                )}
                {!!grouped.pre.length && (
                    <optgroup label="Prereleases">
                        {grouped.pre.map((ver) => (
                            <option key={ver} value={ver}>
                                {ver}
                            </option>
                        ))}
                    </optgroup>
                )}
            </select>
        </div>
    );
};

const Filter = ({
    files,
    onChange,
}: {
    files: string[];
    onChange: (files: string[]) => void;
}) => {
    const [selected, setSelected] = useState<string>('');

    const [types, mapped] = useMemo(() => {
        const found = new Set<string>();
        return [
            found,
            files.map((file) => {
                const ext = file.split('.').slice(-1)[0] || '';
                const type =
                    ext in fileTypes
                        ? fileTypes[ext as keyof typeof fileTypes]
                        : 'Other';
                found.add(type);
                return { file, type };
            }),
        ];
    }, [files]);

    useEffect(() => {
        if (!types.has(selected) || types.size <= 1) {
            setSelected('');
        }
    }, [types, selected]);

    useEffect(() => {
        onChange(
            selected === ''
                ? mapped.map((x) => x.file)
                : mapped.filter((x) => x.type === selected).map((x) => x.file),
        );
    }, [selected, mapped, onChange]);

    if (types.size <= 1) return null;

    return (
        <div className={styles.dropdown}>
            <label htmlFor="filter">Filter:</label>
            <select
                id="filter"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
            >
                <option value="">All assets</option>
                {[...types].map((type) => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </select>
        </div>
    );
};

const File = ({
    name,
    version,
    file,
    sri,
    ...props
}: {
    name: string;
    version: string;
    file: string;
    sri?: string;
} & HTMLAttributes<HTMLLIElement> &
    RefAttributes<HTMLLIElement>) => {
    return (
        <li {...props} className={cx(styles.file, props.className)}>
            <a
                href={`https://cdnjs.cloudflare.com/ajax/libs/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${file}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {file}
            </a>

            <Copy name={name} version={version} file={file} sri={sri} />
        </li>
    );
};

/**
 * Library version files island component to render all files on the CDN for a library version.
 *
 * @param props Component props.
 * @param props.name Library name.
 * @param props.version Library version.
 * @param props.files List of files for the library version.
 * @param props.sri Map of file names to SRI hashes for the library version.
 * @param props.versions List of all versions for the library.
 */
const Files = ({
    name,
    version,
    files,
    sri,
    versions,
}: {
    name: string;
    version: string;
    files: string[];
    sri: Record<string, string>;
    versions: string[];
}) => {
    const sortedFiles = useMemo(
        () =>
            [...files].sort((a, b) => {
                const aDepth = a.split('/').length;
                const bDepth = b.split('/').length;
                if (aDepth !== bDepth) return aDepth - bDepth;
                return a.localeCompare(b);
            }),
        [files],
    );

    const [listFiles, setListFiles] = useState(sortedFiles);
    const listRef = useRef<HTMLUListElement | null>(null);
    const listOffsetRef = useRef(0);

    useLayoutEffect(() => {
        listOffsetRef.current = listRef.current?.offsetTop ?? 0;
    }, []);

    const virtualizer = useWindowVirtualizer({
        count: listFiles.length,
        estimateSize: () => Number(theme.spacing(5).replace('px', '')),
        gap: Number(theme.spacing(1).replace('px', '')),
        overscan: 5,
        scrollMargin: listOffsetRef.current,
        initialRect: { width: 0, height: 1000 },
    });

    useEffect(() => {
        virtualizer.measure();
    }, [listFiles, virtualizer]);

    const [total, setTotal] = useState(
        listFiles.length.toLocaleString('en-US'),
    );
    useEffect(() => {
        setTotal(listFiles.length.toLocaleString());
    }, [listFiles.length]);

    return (
        <>
            <div className={styles.toolbar}>
                <p className={styles.count}>
                    {total} file{listFiles.length !== 1 ? 's' : ''}
                </p>
                <Versions name={name} version={version} versions={versions} />
                <Filter files={sortedFiles} onChange={setListFiles} />
            </div>
            <ul
                ref={listRef}
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                }}
                className={styles.list}
            >
                {virtualizer.getVirtualItems().map((item) => {
                    const file = listFiles[item.index];
                    if (!file) return null;

                    return (
                        <File
                            key={file}
                            name={name}
                            version={version}
                            file={file}
                            sri={sri[file]}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
                            }}
                            data-index={item.index}
                            ref={virtualizer.measureElement}
                        />
                    );
                })}
            </ul>
        </>
    );
};

export default createIsland(Files, 'files.tsx');
