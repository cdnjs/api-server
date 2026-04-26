import { css, cx } from '@emotion/css';

import theme from '../theme.ts';

import Logo from './logo.tsx';

const styles = {
    navigation: css`
        position: relative;
        isolation: isolate;

        &::before {
            content: '';
            position: absolute;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.background.navigation};
            top: 0;
            bottom: 0;
            z-index: -1;
        }
    `,
    list: css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(2)};
        list-style: none;
        margin: 0;
        padding: 0;

        > li:first-child {
            margin-right: auto;
        }

        > li:last-child {
            display: none;
        }

        ${theme.breakpoints.medium} {
            > li:not(:first-child):not(:last-child) {
                display: none;
            }

            > li:last-child {
                display: block;
            }
        }
    `,
    link: css`
        display: block;
        padding: ${theme.spacing(1)};
        color: ${theme.text.primary};
        text-decoration: none;
        transition: color ${theme.transition};

        &:hover {
            color: ${theme.text.brand};
            text-decoration: underline;
        }
    `,
    logo: css`
        display: block;
        max-width: 100%;
        height: ${theme.spacing(4)};
        object-fit: contain;
    `,
    toggle: css`
        font-size: ${theme.font.large.size};
        font-weight: ${theme.font.large.weight};
        list-style: none;

        &:hover {
            text-decoration: none;
        }

        &::-webkit-details-marker {
            display: none;
        }

        [open] > & {
            color: ${theme.text.brand};
        }
    `,
    mobile: css`
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: ${theme.background.navigation};
        border-top: ${theme.spacing(0.25)} solid ${theme.background.brand};
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(0.5)};
        list-style: none;
        margin: 0;
        padding: ${theme.spacing(1)} 0;
    `,
};

interface Link {
    label: string;
    href: string;
}

const links: Link[] = [
    { label: 'About', href: 'https://cdnjs.com/about' },
    { label: 'Libraries', href: 'https://cdnjs.com/libraries' },
    { label: 'API', href: 'https://cdnjs.com/api' },
    { label: 'GitHub', href: 'https://github.com/cdnjs' },
    { label: 'Status', href: 'https://status.cdnjs.com' },
];

/**
 * Standard cdnjs HTML layout for the page navigation.
 *
 * @param props Component props.
 * @param props.class Optional additional class name(s) to apply to the navigation.
 */
export default ({ class: className }: { class?: string }) => (
    <nav class={cx(styles.navigation, className)}>
        <ul class={styles.list}>
            <li>
                <a href="https://cdnjs.com" rel="noopener" aria-label="cdnjs">
                    <Logo class={styles.logo} />
                </a>
            </li>

            {links.map((link) => (
                <li key={link.href}>
                    <a href={link.href} rel="noopener" class={styles.link}>
                        {link.label}
                    </a>
                </li>
            ))}

            <li>
                <details>
                    <summary
                        class={cx(styles.link, styles.toggle)}
                        aria-label="Navigation links"
                    >
                        &equiv;
                    </summary>

                    <ul class={styles.mobile}>
                        {links.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    rel="noopener"
                                    class={styles.link}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </details>
            </li>
        </ul>
    </nav>
);
