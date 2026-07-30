import { css } from '@emotion/css';

import Grid from '../utils/jsx/grid.tsx';
import Typeahead from '../utils/jsx/islands/typeahead.tsx';
import theme from '../utils/theme.ts';

const styles = {
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
            rgb(from ${theme.background.body} r g b / 0.9) 0%,
            rgb(from ${theme.background.body} r g b / 0) 100%
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
    search: css`
        width: ${theme.spacing(80)};
        max-width: 100%;
        border-radius: ${theme.radius};
        box-shadow: 0 0 ${theme.spacing(2)} ${theme.background.footer};
    `,
};

/**
 * / page component.
 */
export default () => {
    return (
        <>
            <Grid className={styles.background} />

            <div className={styles.content}>
                <p className={styles.badge}>Powered by Cloudflare</p>

                <h1 className={styles.title}>
                    The free CDN for
                    <br /> <strong>open source libraries.</strong>
                </h1>

                <p className={styles.prose}>
                    JavaScript, CSS, and font resources, globally cached on
                    Cloudflare's network.
                    <br /> Trusted by <strong>12.5% of all websites</strong>,
                    serving <strong>250 billion requests per month</strong>.
                </p>

                <Typeahead className={styles.search} />
            </div>
        </>
    );
};
