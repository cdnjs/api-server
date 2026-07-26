import { css } from '@emotion/css';
import { type ComponentType, useEffect, useRef, useState } from 'react';

import theme from '../theme.ts';

import IconCheck from './icons/check.tsx';
import IconCode from './icons/code.tsx';
import IconLink from './icons/link.tsx';
import IconShield from './icons/shield.tsx';

const styles = {
    buttons: css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(0.5)};
        margin: 0 0 0 auto;
    `,
    button: css`
        background: none;
        border: none;
        cursor: pointer;
        padding: ${theme.spacing(0.5)};
        line-height: 0;
        color: ${theme.text.primary};
        transition: color ${theme.transition};

        &:hover {
            color: ${theme.text.brand};
        }
    `,
    icon: css`
        width: ${theme.spacing(2.5)};
        height: ${theme.spacing(2.5)};
    `,
};

const Button = ({
    text,
    label,
    icon: Icon,
}: {
    text: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
}) => {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 2000);
    };

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    return (
        <button onClick={copy} title={label} className={styles.button}>
            {copied ? (
                <IconCheck className={styles.icon} />
            ) : (
                <Icon className={styles.icon} />
            )}
        </button>
    );
};

const Copy = ({
    name,
    version,
    file,
    sri,
}: {
    name: string;
    version: string;
    file: string;
    sri?: string;
}) => {
    const integrity = sri ? ` integrity="${sri}" crossorigin="anonymous"` : '';

    return (
        <div className={styles.buttons}>
            <Button
                text={`https://cdnjs.cloudflare.com/ajax/libs/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${file}`}
                label="Copy URL"
                icon={IconLink}
            />

            {file.endsWith('.js') && (
                <Button
                    text={`<script src="https://cdnjs.cloudflare.com/ajax/libs/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${file}"${integrity} referrerpolicy="no-referrer"></script>`}
                    label="Copy <script> HTML"
                    icon={IconCode}
                />
            )}

            {file.endsWith('.mjs') && (
                <Button
                    text={`<script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${file}"${integrity} referrerpolicy="no-referrer"></script>`}
                    label="Copy <script type='module'> HTML"
                    icon={IconCode}
                />
            )}

            {file.endsWith('.css') && (
                <Button
                    text={`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/${encodeURIComponent(name)}/${encodeURIComponent(version)}/${file}"${integrity} referrerpolicy="no-referrer">`}
                    label="Copy <link> HTML"
                    icon={IconCode}
                />
            )}

            {sri && (
                <Button text={sri} label="Copy SRI hash" icon={IconShield} />
            )}
        </div>
    );
};

export default Copy;
