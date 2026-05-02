import { css, cx } from '@emotion/css';
import type { ReactNode } from 'react';

import theme from '../theme.ts';

import Banner from './banner.tsx';
import Footer from './footer.tsx';
import Navigation from './navigation.tsx';

const styles = {
    body: css`
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};
        overflow-x: hidden;
    `,
    background: css`
        background: ${theme.background.body};
        color: ${theme.text.primary};
    `,
    main: css`
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    `,
    content: css`
        flex-grow: 1;
        isolation: isolate;
        position: relative;
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

/**
 * Standard cdnjs HTML layout.
 *
 * @param props Component props.
 * @param props.children Content to be included in the body of the page.
 */
export default ({ children }: { children?: ReactNode }) => (
    <html lang="en" className={styles.background}>
        <head>
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/3.0.1/modern-normalize.min.css"
                integrity="sha512-q6WgHqiHlKyOqslT/lgBgodhd03Wp4BEqKeW6nNtlOY4quzyG3VoQKFrieaCeSnuVseNKRGpGeDU3qPmabCANg=="
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
            />
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
