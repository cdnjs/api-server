import { css, cx } from '@emotion/css';

import theme from '../theme.ts';

const styles = {
    banner: css`
        color: ${theme.text.inverted};
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        position: relative;
        isolation: isolate;
        padding-top: ${theme.spacing(1)};
        padding-bottom: ${theme.spacing(1)};

        &::before {
            content: '';
            position: absolute;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.background.brand};
            top: 0;
            bottom: 0;
            z-index: -1;
        }
    `,
    intro: css`
        border-right: ${theme.spacing(0.25)} solid currentColor;
        margin: 0 ${theme.spacing(1)} 0 0;
        padding: 0 ${theme.spacing(1)} 0 0;
        font-size: ${theme.font.large.size};
        font-weight: ${theme.font.large.weight};
    `,
    text: css`
        margin: 0;
    `,
    link: css`
        color: currentColor;
        text-decoration: underline;

        &:hover {
            text-decoration: none;
        }
    `,
};

/**
 * Standard cdnjs HTML layout for the page pre-footer banner.
 *
 * @param props Component props.
 * @param props.class Optional additional class name(s) to apply to the banner.
 */
export default ({ class: className }: { class?: string }) => (
    <div class={cx(styles.banner, className)}>
        <p class={styles.intro}>Help support cdnjs</p>
        <p class={styles.text}>
            You can{' '}
            <a
                href="https://github.com/cdnjs/packages/issues"
                rel="noopener"
                class={styles.link}
            >
                contribute on GitHub
            </a>{' '}
            to get involved with cdnjs! Or, help fund the maintenance of cdnjs
            via{' '}
            <a
                href="https://github.com/cdnjs/packages?sponsor"
                rel="noopener"
                class={styles.link}
            >
                GitHub Sponsors
            </a>
            ,{' '}
            <a
                href="https://opencollective.com/cdnjs"
                rel="noopener"
                class={styles.link}
            >
                Open Collective
            </a>
            , or{' '}
            <a
                href="https://www.patreon.com/cdnjs"
                rel="noopener"
                class={styles.link}
            >
                Patreon
            </a>
            .
        </p>
    </div>
);
