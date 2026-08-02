import { css, cx } from '@emotion/css';
import type { ReactNode } from 'react';

import theme from '../theme.ts';

import Grid from './grid.tsx';

const styles = {
    header: css`
        position: relative;
        isolation: isolate;
        display: flex;
        flex-direction: column;
    `,
    fill: css`
        flex-grow: 1;
    `,
    background: css`
        color: ${theme.background.brand};
        position: absolute;
        width: 100vw;
        height: 100%;
        left: 50%;
        transform: translateX(-50%);
        top: 0;
        bottom: 0;
        z-index: -1;
    `,
    content: css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: ${theme.spacing(4)};
        margin: auto;
        max-width: 100%;
        background: radial-gradient(
            ellipse at center,
            rgb(from ${theme.background.primary} r g b / 0.9) 0%,
            rgb(from ${theme.background.primary} r g b / 0) 100%
        );
        padding: ${theme.spacing(4, 2)};
    `,
    badge: css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(1.5)};
        background: rgb(from ${theme.background.brand} r g b / 0.125);
        border: ${theme.spacing(0.125)} solid
            rgb(from ${theme.background.brand} r g b / 0.75);
        border-radius: ${theme.spacing(4)};
        color: ${theme.text.brand};
        font-family: ${theme.font.families.mono};
        font-size: ${theme.font.tiny.size};
        font-weight: ${theme.font.tiny.weight};
        line-height: 1;
        text-transform: uppercase;
        padding: ${theme.spacing(1, 1.75)};
        margin: 0;
        opacity: 0.875;

        &::before {
            content: ' ';
            display: block;
            width: ${theme.spacing(0.75)};
            height: ${theme.spacing(0.75)};
            margin: 0 ${theme.spacing(-0.25)};
            border-radius: 50%;
            background: ${theme.text.brand};
            box-shadow: 0 0 ${theme.spacing(0.75)} ${theme.text.brand};
        }
    `,
    title: css`
        font-family: ${theme.font.families.home};
        line-height: 1.125;
        margin: 0;

        &,
        strong {
            font-size: ${theme.font.heading.size};
            font-weight: ${theme.font.heading.weight};
        }

        strong {
            color: ${theme.text.brand};
        }

        small {
            color: ${theme.text.secondary};
            font-family: ${theme.font.families.mono};
            font-size: ${theme.font.body.size};
            font-weight: ${theme.font.body.weight};
        }
    `,
    prose: css`
        color: ${theme.text.secondary};
        line-height: 1.5;
        margin: 0;

        &,
        strong {
            font-size: ${theme.font.small.size};
            font-weight: ${theme.font.small.weight};
        }

        strong {
            color: ${theme.text.primary};
        }
    `,
    after: css`
        position: relative;
        isolation: isolate;
        padding: ${theme.spacing(2, 0)};

        &::before {
            content: '';
            position: absolute;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.background.elevated};
            top: 0;
            bottom: 0;
            z-index: -1;
        }
    `,
};

/**
 * Standard cdnjs HTML layout for the page header.
 *
 * @param props Component props.
 * @param props.title The title of the page.
 * @param props.prose The prose content of the page.
 * @param props.fill If the header should grow to fill the parent.
 * @param props.extra Optional additional content to render inside the header.
 * @param props.children Optional additional content to render after the header.
 */
export default ({
    title,
    prose = "A free, open-source CDN for the web's most popular JavaScript, CSS, and font resources.",
    fill,
    extra,
    children,
}: {
    title: ReactNode;
    prose?: ReactNode;
    fill?: boolean;
    extra?: ReactNode;
    children?: ReactNode;
}) => {
    return (
        <>
            <div className={cx(styles.header, fill && styles.fill)}>
                <Grid
                    className={styles.background}
                    height={fill ? undefined : 3}
                />

                <div className={styles.content}>
                    <p className={styles.badge}>Powered by Cloudflare</p>

                    <h1 className={styles.title}>{title}</h1>

                    <p className={styles.prose}>{prose}</p>

                    {extra}
                </div>
            </div>

            {children && <div className={styles.after}>{children}</div>}
        </>
    );
};
