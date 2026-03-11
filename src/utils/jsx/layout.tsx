import { Style, css, cx } from 'hono/css';
import type { Child } from 'hono/jsx';

import theme from '../theme.ts';

const styles = {
    body: css`
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};
    `,
    background: css`
        background: ${theme.background.body};
        color: ${theme.text.primary};
    `,
    main: css`
        flex: 1;
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
export default ({ children }: { children?: Child }) => (
    <html lang="en" class={styles.background}>
        <head>
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/modern-normalize/3.0.1/modern-normalize.min.css"
                integrity="sha512-q6WgHqiHlKyOqslT/lgBgodhd03Wp4BEqKeW6nNtlOY4quzyG3VoQKFrieaCeSnuVseNKRGpGeDU3qPmabCANg=="
                crossorigin="anonymous"
                referrerpolicy="no-referrer"
            />
            <Style />
            <meta name="robots" content="noindex" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
        </head>
        <body class={cx(styles.body, styles.background)}>
            <main class={cx(styles.main, styles.container)}>{children}</main>
            <script
                defer
                dangerouslySetInnerHTML={{
                    __html: 'console.log("%cThanks for using cdnjs! 😊", "font-size: 5em; color: #e95420;");',
                }}
            />
        </body>
    </html>
);
