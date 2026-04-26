import { css, cx } from '@emotion/css';
import { Fragment } from 'react';

import theme from '../theme.ts';

import Logo from './logo.tsx';

const styles = {
    footer: css`
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: ${theme.spacing(4)};
        position: relative;
        isolation: isolate;

        ${theme.breakpoints.medium} {
            grid-template-columns: repeat(2, 1fr);
        }

        &::before {
            content: '';
            position: absolute;
            width: 100vw;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.background.footer};
            top: 0;
            bottom: 0;
            z-index: -1;
        }
    `,
    list: css`
        flex-grow: 1;
        margin: ${theme.spacing(2)} 0;
    `,
    copyright: css`
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        dd {
            color: ${theme.text.secondary};
            font-size: ${theme.font.small.size};
            font-weight: ${theme.font.small.weight};
            margin-top: ${theme.spacing(2)};
        }
    `,
    title: css`
        color: ${theme.text.secondary};
        text-transform: uppercase;
        margin: 0 0 ${theme.spacing(2)};
        font-size: ${theme.font.small.size};
        font-weight: ${theme.font.small.weight};

        &:not(:first-of-type) {
            margin-top: ${theme.spacing(4)};
        }
    `,
    item: css`
        margin: 0 0 ${theme.spacing(1)};

        &:last-child {
            margin-bottom: 0;
        }
    `,
    link: css`
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
        width: ${theme.spacing(32)};
        margin: 0 0 ${theme.spacing(2)};
    `,
};

interface Link {
    label: string;
    href: string;
}

interface Section {
    title: string;
    links: Link[];
}

const sections: Section[][] = [
    [
        {
            title: 'Info',
            links: [
                { label: 'About Us', href: 'https://cdnjs.com/about' },
                {
                    label: 'Privacy Policy',
                    href: 'https://www.cloudflare.com/privacypolicy',
                },
            ],
        },
        {
            title: 'Community',
            links: [
                {
                    label: 'OSS on GitHub',
                    href: 'https://github.com/cdnjs',
                },
                {
                    label: 'Discussions',
                    href: 'https://github.com/cdnjs/cdnjs/discussions',
                },
            ],
        },
    ],
    [
        {
            title: 'Libraries',
            links: [
                {
                    label: 'Search Libraries',
                    href: 'https://cdnjs.com/libraries',
                },
                { label: 'API Documentation', href: 'https://cdnjs.com/api' },
            ],
        },
        {
            title: 'Status',
            links: [
                { label: 'Status Page', href: 'https://status.cdnjs.com' },
                {
                    label: 'CDN Network Map',
                    href: 'https://www.cloudflare.com/network',
                },
            ],
        },
    ],
    [
        {
            title: 'Sponsors',
            links: [
                { label: 'Cloudflare', href: 'https://www.cloudflare.com' },
                { label: 'Algolia', href: 'https://www.algolia.com' },
                { label: 'DigitalOcean', href: 'https://www.digitalocean.com' },
                { label: 'Statuspage', href: 'https://www.statuspage.io' },
                { label: 'Sentry', href: 'https://sentry.io' },
                { label: 'UptimeRobot', href: 'https://uptimerobot.com' },
            ],
        },
    ],
];

/**
 * Standard cdnjs HTML layout for the page footer.
 *
 * @param props Component props.
 * @param props.className Optional additional class name(s) to apply to the footer.
 */
export default ({ className }: { className?: string }) => (
    <footer className={cx(styles.footer, className)}>
        <dl className={cx(styles.list, styles.copyright)}>
            <dt>
                <a href="https://cdnjs.com" rel="noopener" aria-label="cdnjs">
                    <Logo className={styles.logo} />
                </a>
            </dt>
            <dd className={styles.item}>
                &copy; {new Date().getFullYear()} cdnjs.
            </dd>
        </dl>

        {sections.map((group, i) => (
            <dl key={i} className={styles.list}>
                {group.map((section) => (
                    <Fragment key={section.title}>
                        <dt className={styles.title}>{section.title}</dt>
                        {section.links.map((link) => (
                            <dd key={link.href} className={styles.item}>
                                <a
                                    href={link.href}
                                    rel="noopener"
                                    className={styles.link}
                                >
                                    {link.label}
                                </a>
                            </dd>
                        ))}
                    </Fragment>
                ))}
            </dl>
        ))}
    </footer>
);
