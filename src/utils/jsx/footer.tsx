import { css, cx } from 'hono/css';

import theme from '../theme.ts';

const styles = {
    outer: css`
        background: ${theme.background.footer};
    `,
    inner: css`
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: ${theme.spacing(4)};
    `,
    list: css`
        flex-grow: 1;
    `,
    title: css`
        color: ${theme.text.secondary};
        text-transform: uppercase;
        margin: 0 0 ${theme.spacing(2)};

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

        &:hover {
            color: ${theme.text.brand};
            text-decoration: underline;
        }
    `,
};

interface Section {
    title: string;
    links: {
        label: string;
        href: string;
    }[];
}

const sections: Section[][] = [
    [
        {
            title: 'About',
            links: [
                { label: 'About Us', href: 'https://cdnjs.com/about' },
                { label: 'Swag Store', href: 'https://swag.cdnjs.com' },
                {
                    label: 'Community Discussions',
                    href: 'https://github.com/cdnjs/cdnjs/discussions',
                },
                {
                    label: 'OpenCollective',
                    href: 'https://opencollective.com/cdnjs',
                },
                { label: 'Patreon', href: 'https://www.patreon.com/cdnjs' },
                {
                    label: 'CDN Network Map',
                    href: 'https://www.cloudflare.com/network',
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
                    label: 'cdnjsStatus on Twitter',
                    href: 'https://twitter.com/cdnjsStatus',
                },
            ],
        },
    ],
    [
        {
            title: 'Sponsors',
            links: [],
        },
    ],
];

/**
 * Standard cdnjs HTML layout for the page footer.
 *
 * @param props Component props.
 * @param props.class Optional additional class name(s) to apply to the footer's inner container.
 */
export default ({ class: className }: { class?: string | Promise<string> }) => (
    <footer class={styles.outer}>
        <div class={cx(styles.inner, className)}>
            <dl class={styles.list}>
                <dt>
                    <a href="https://cdnjs.com" rel="noopener">
                        cdnjs
                    </a>
                </dt>
                <dd class={styles.item}>
                    <span>&copy; {new Date().getFullYear()} cdnjs.</span>
                    <a
                        href="https://github.com/cdnjs"
                        rel="noopener"
                        class={styles.link}
                    >
                        GitHub
                    </a>
                </dd>
            </dl>

            {sections.map((group, i) => (
                <dl key={i} class={styles.list}>
                    {group.map((section) => (
                        <>
                            <dt key={section.title} class={styles.title}>
                                {section.title}
                            </dt>
                            {section.links.map((link) => (
                                <dd key={link.href} class={styles.item}>
                                    <a
                                        href={link.href}
                                        rel="noopener"
                                        class={styles.link}
                                    >
                                        {link.label}
                                    </a>
                                </dd>
                            ))}
                        </>
                    ))}
                </dl>
            ))}
        </div>
    </footer>
);
