import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { type CSSProperties, useLayoutEffect, useRef } from 'react';

import createIsland from '../island.tsx';

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
 */
const Files = ({
    name,
    version,
    files,
    sri,
}: {
    name: string;
    version: string;
    files: string[];
    sri: Record<string, string>;
}) => {
    const listRef = useRef<HTMLUListElement | null>(null);
    const listOffsetRef = useRef(0);

    useLayoutEffect(() => {
        listOffsetRef.current = listRef.current?.offsetTop ?? 0;
    }, []);

    const virtualizer = useWindowVirtualizer({
        count: files.length,
        estimateSize: () => 35,
        overscan: 5,
        scrollMargin: listOffsetRef.current,
    });

    return (
        <ul
            ref={listRef}
            style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: 'relative',
            }}
        >
            {virtualizer.getVirtualItems().map((item) => {
                const file = files[item.index];
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
    );
};

export default createIsland(Files, 'files.tsx');
