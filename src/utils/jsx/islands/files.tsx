import { css } from '@emotion/css';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {
    type CSSProperties,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import fileTypes from '../../files.ts';
import theme from '../../theme.ts';
import createIsland from '../island.tsx';

const styles = {
    toolbar: css`
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: ${theme.spacing(1, 2)};
    `,
    url: css`
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
            background: ${theme.background.navigation};
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
                    window.location.href = `/libraries/${encodeURIComponent(name)}/${encodeURIComponent(changed)}?output=human`;
                }}
            >
                {versions.map((ver) => (
                    <option key={ver} value={ver}>
                        {ver}
                    </option>
                ))}
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
    style,
}: {
    name: string;
    version: string;
    file: string;
    sri?: string;
    style?: CSSProperties;
}) => {
    return (
        <li style={style}>
            <a
                href={`https://cdnjs.cloudflare.com/ajax/libs/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${file}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {file}
            </a>

            {sri && <code style={{ marginLeft: '0.5em' }}>(SRI: {sri})</code>}
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
    const [listFiles, setListFiles] = useState(files);
    const listRef = useRef<HTMLUListElement | null>(null);
    const listOffsetRef = useRef(0);

    useLayoutEffect(() => {
        listOffsetRef.current = listRef.current?.offsetTop ?? 0;
    }, []);

    const virtualizer = useWindowVirtualizer({
        count: listFiles.length,
        estimateSize: () => 35,
        overscan: 5,
        scrollMargin: listOffsetRef.current,
    });

    return (
        <>
            <div className={styles.toolbar}>
                <code className={styles.url}>
                    {`https://cdnjs.cloudflare.com/ajax/libs/${name}/${version}/...`}
                </code>
                <Versions name={name} version={version} versions={versions} />
                <Filter files={files} onChange={setListFiles} />
            </div>
            <ul
                ref={listRef}
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    position: 'relative',
                }}
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
                                height: `${item.size}px`,
                                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
                            }}
                        />
                    );
                })}
            </ul>
        </>
    );
};

export default createIsland(Files, 'files.tsx');
