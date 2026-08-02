import { css, cx } from '@emotion/css';
import { env } from 'cloudflare:workers';
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
        background: ${theme.background.elevated};
        color: ${theme.text.primary};
    `,
    main: css`
        background: ${theme.background.primary};
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

export interface Meta {
    title: string;
    description: string;
    keywords: string[];
}

/**
 * Standard cdnjs HTML layout.
 *
 * @param props Component props.
 * @param props.path Path of the page being rendered (used for canonical link).
 * @param props.meta Metadata for the page being rendered (used for meta tags).
 * @param props.children Content to be included in the body of the page.
 */
export default ({
    path,
    meta,
    children,
}: {
    path: string;
    meta: Meta;
    children?: ReactNode;
}) => (
    <html lang="en" className={styles.background}>
        <head>
            <title>{meta.title}</title>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <meta name="theme-color" content={theme.background.elevated} />
            <meta name="title" content={meta.title} />
            <meta name="description" content={meta.description} />
            <meta name="keywords" content={meta.keywords.join(', ')} />

            {/* Always set the canonical to production site at cdnjs.com */}
            <link rel="canonical" href={`https://cdnjs.com${path}`} />
            {/* Only allow indexing of the production site at cdnjs.com */}
            {env.WEBSITE_BASE !== 'https://cdnjs.com' && (
                <meta name="robots" content="noindex" />
            )}

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:url" content={`${env.WEBSITE_BASE}${path}`} />
            <meta name="twitter:site" content="@cdnjs" />
            <meta name="twitter:creator" content="@MattIPv4" />
            {/* <meta name="twitter:image" content="" /> */}
            {/* <meta name="twitter:image:alt" content="cdnjs banner image" /> */}

            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:url" content={`${env.WEBSITE_BASE}${path}`} />
            <meta property="og:site_name" content="cdnjs" />
            <meta property="og:type" content="website" />
            <meta property="og:locale" content="en_US" />
            {/* <meta property="og:image" content="" /> */}
            {/* <meta property="og:image:url" content="" /> */}

            {/* <link rel="icon" type="image/png" href="/favicon.png" /> */}
            {/* <link rel="shortcut-icon" type="image/png" href="/favicon.png" /> */}
            {/* <link rel="apple-touch-icon" type="image/png" href="/favicon.png" /> */}

            <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
            <link
                rel="preconnect"
                href="https://cdnjs.cloudflare.com"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
            />

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

            <script defer src="https://api.radar.cloudflare.com/beacon.js" />
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
                    __html: `console.log("%cThanks for using cdnjs! 😊", "font-family: ${theme.font.families.home.replace(/"/g, '\\"')}; font-size: 5em; color: ${theme.text.brand};");`,
                }}
            />
        </body>
    </html>
);
