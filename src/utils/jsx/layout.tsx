import { css, cx } from '@emotion/css';
import { Fragment, type ReactNode } from 'react';

import theme from '../theme.ts';

import Banner from './banner.tsx';
import Footer from './footer.tsx';
import Navigation from './navigation.tsx';

const styles = {
    body: css`
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};
        font-family: ${theme.font.families.body};
        overflow-x: hidden;

        *:focus-visible {
            outline: ${theme.spacing(0.25)} solid ${theme.text.brand};
            border-radius: ${theme.radius};
        }
    `,
    background: css`
        background: linear-gradient(
                ${theme.background.navigation} 45%,
                ${theme.background.footer} 55%
            )
            fixed;
        color: ${theme.text.primary};
    `,
    main: css`
        background: ${theme.background.body};
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    `,
    content: css`
        flex-grow: 1;
        isolation: isolate;
        position: relative;
        display: flex;
        flex-direction: column;
    `,
    container: css`
        margin: 0 auto;
        width: 100%;
        max-width: ${theme.spacing(192)};
        padding: ${theme.spacing(2)};

        ${theme.breakpoints.medium} {
            padding: ${theme.spacing(1)};
        }
    `,
};

const stylesheets = [
    {
        href: 'https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/3.0.1/modern-normalize.min.css',
        integrity:
            'sha512-q6WgHqiHlKyOqslT/lgBgodhd03Wp4BEqKeW6nNtlOY4quzyG3VoQKFrieaCeSnuVseNKRGpGeDU3qPmabCANg==',
    },
    {
        href: 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-inter/5.2.8/index.min.css',
        integrity:
            'sha512-6arWMnMEofnjQzuSHcwFlEMCPRJLWifo5SNG8mG46UaPdY9dwR+eRYwNKv+c/jQwFrSE56Pox98ubnJuALLjzA==',
        preload: [
            {
                href: 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-inter/5.2.8/files/inter-latin-400-normal.woff2',
                as: 'font',
                type: 'font/woff2',
            },
        ],
    },
    {
        href: 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-jetbrains-mono/5.2.8/index.min.css',
        integrity:
            'sha512-wy9HCEuMc2WciAissjPymKPuomtDPAqHxed+9+led70ajmRqU1AD8dcFQW6FbTkgPeAaUmUq1mzfBjJ2hMxJ3w==',
        preload: [
            {
                href: 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-jetbrains-mono/5.2.8/files/jetbrains-mono-latin-400-normal.woff2',
                as: 'font',
                type: 'font/woff2',
            },
        ],
    },
    {
        href: 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-space-grotesk/5.2.8/index.min.css',
        integrity:
            'sha512-FT7MJI83N9vNo9hTY75CYSWvGhs8EJUrgb2cqLlJrBbG99yJW9Vm7FYbYsB4xDYVFfD7FjnERyaU/MdDuxTGQg==',
        preload: [
            {
                href: 'https://cdnjs.cloudflare.com/ajax/libs/fontsource-space-grotesk/5.2.8/files/space-grotesk-latin-400-normal.woff2',
                as: 'font',
                type: 'font/woff2',
            },
        ],
    },
];

/**
 * Standard cdnjs HTML layout.
 *
 * @param props Component props.
 * @param props.path Path of the page being rendered (used for canonical link).
 * @param props.children Content to be included in the body of the page.
 */
export default ({ path, children }: { path: string; children?: ReactNode }) => (
    <html lang="en" className={styles.background}>
        <head>
            {stylesheets.map((sheet) => (
                <Fragment key={sheet.href}>
                    <link
                        rel="preload"
                        href={sheet.href}
                        as="style"
                        integrity={sheet.integrity}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                    />
                    {sheet.preload?.map((preload) => (
                        <link
                            key={preload.href}
                            rel="preload"
                            href={preload.href}
                            as={preload.as}
                            type={preload.type}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                        />
                    ))}
                    <link
                        rel="stylesheet"
                        href={sheet.href}
                        integrity={sheet.integrity}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                    />
                </Fragment>
            ))}
            <link rel="canonical" href={`https://cdnjs.com${path}`} />
            <meta name="robots" content="noindex" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
        </head>
        <body className={cx(styles.body, styles.background)}>
            <main className={styles.main}>
                <Navigation className={styles.container} />
                <div className={cx(styles.content, styles.container)}>
                    {children}
                </div>
                <Banner className={styles.container} />
            </main>
            <Footer className={styles.container} />
            <script
                defer
                dangerouslySetInnerHTML={{
                    __html: 'console.log("%cThanks for using cdnjs! 😊", "font-size: 5em; color: #e95420;");',
                }}
            />
        </body>
    </html>
);
