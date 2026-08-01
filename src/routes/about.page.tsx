import { css } from '@emotion/css';

import Header from '../utils/jsx/header.tsx';
import sponsors from '../utils/sponsors.ts';
import theme from '../utils/theme.ts';

declare module 'csstype' {
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    interface Properties {
        [index: `--${string}`]: string;
    }
}

const styles = {
    container: css`
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        max-width: ${theme.spacing(128)};
        margin: 0 auto;
        padding: ${theme.spacing(0, 0, 2)};
    `,
    stats: css`
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: ${theme.spacing(4)};
        padding: ${theme.spacing(4, 0)};
        margin: 0;
        list-style: none;
        position: relative;
        isolation: isolate;
        z-index: 1;

        ${theme.breakpoints.medium} {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
    stat: css`
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing(0.5)};
        color: ${theme.text.secondary};
        font-family: ${theme.font.families.mono};
        font-size: ${theme.font.tiny.size};
        font-weight: ${theme.font.tiny.weight};
        text-align: center;
        text-transform: uppercase;

        strong {
            display: block;
            color: ${theme.text.primary};
            font-family: ${theme.font.families.home};
            font-size: ${theme.font.large.size};
            font-weight: ${theme.font.large.weight};
        }
    `,
    heading: css`
        font-size: ${theme.font.large.size};
        font-weight: ${theme.font.large.weight};
        display: flex;
        align-items: center;
        gap: ${theme.spacing(2)};
        margin: 0;

        &::after {
            content: '';
            flex-grow: 1;
            height: ${theme.spacing(0.125)};
            background: ${theme.text.primary};
            margin: ${theme.spacing(0.25, 0, 0)};
            opacity: 0.125;
        }
    `,
    section: css`
        margin: ${theme.spacing(4, 0, 0)};

        p {
            color: ${theme.text.secondary};
            font-size: ${theme.font.body.size};
            font-weight: ${theme.font.body.weight};
            margin: ${theme.spacing(2, 0, 0)};

            a {
                color: ${theme.text.brand};
                text-decoration: underline;

                &:hover,
                &:focus {
                    text-decoration: none;
                }
            }
        }
    `,
    split: css`
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: ${theme.spacing(4)};

        ${theme.breakpoints.medium} {
            grid-template-columns: 1fr;
        }
    `,
    package: css`
        background: ${theme.background.footer};
        border-radius: ${theme.radius};
        padding: ${theme.spacing(2)};
        margin: ${theme.spacing(2, 0, 0)};
        color: ${theme.text.secondary};
        font-family: ${theme.font.families.mono};
        font-size: ${theme.font.tiny.size};
        font-weight: ${theme.font.tiny.weight};
    `,
    code: {
        primary: css`
            color: ${theme.text.brand};
        `,
        secondary: css`
            color: rgb(from ${theme.text.brand} r g b / 0.5);
        `,
        hint: css`
            color: rgb(from ${theme.text.secondary} r g b / 0.5);
        `,
    },
    team: css`
        background: ${theme.background.footer};
        border-radius: ${theme.radius};
        display: flex;
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        gap: ${theme.spacing(1)};
        padding: ${theme.spacing(2)};
        margin: ${theme.spacing(2, 0, 0)};

        p {
            color: ${theme.text.secondary};
            font-family: ${theme.font.families.mono};
            font-size: ${theme.font.tiny.size};
            font-weight: ${theme.font.tiny.weight};
            margin: 0;
        }

        ul {
            display: contents;
            margin: 0;
            padding: 0;
            list-style: none;

            a {
                color: ${theme.text.brand};
                text-decoration: underline;

                &:hover,
                &:focus {
                    text-decoration: none;
                }
            }

            div {
                width: ${theme.spacing(0.5)};
                height: ${theme.spacing(0.5)};
                border-radius: 50%;
                background: ${theme.background.body};
            }
        }
    `,
    sponsors: css`
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${theme.spacing(2)};
        margin: ${theme.spacing(4, 0, 0)};
        padding: 0;
        list-style: none;

        ${theme.breakpoints.medium} {
            grid-template-columns: 1fr;
        }

        li {
            display: flex;
            flex-direction: column;
            gap: ${theme.spacing(1)};
            padding: ${theme.spacing(2)};
            background: ${theme.background.footer};
            border-radius: ${theme.radius};
            position: relative;
            isolation: isolate;
            transition: background ${theme.transition};

            &:has(a:hover, a:focus) {
                background: rgb(from ${theme.background.footer} r g b / 0.75);
            }

            p {
                margin: 0;

                &,
                small {
                    font-size: ${theme.font.small.size};
                    font-weight: ${theme.font.small.weight};
                }

                small {
                    color: rgb(from ${theme.text.secondary} r g b / 0.5);
                }
            }

            a {
                color: ${theme.text.brand};
                font-size: ${theme.font.large.size};
                font-weight: ${theme.font.large.weight};
                text-decoration: underline;

                &:hover {
                    text-decoration: none;
                }

                &::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                }
            }
        }
    `,
};

const pkg = [
    <>
        <span className={styles.code.hint}>packages/m/my-library.json</span>
    </>,
    '',
    '{',
    <>
        {'  '}
        <span className={styles.code.primary}>"name"</span>:{' '}
        <span className={styles.code.secondary}>"my-library"</span>,
    </>,
    <>
        {'  '}
        <span className={styles.code.primary}>"filename"</span>:{' '}
        <span className={styles.code.secondary}>"my-library.min.js"</span>,
    </>,
    <>
        {'  '}
        <span className={styles.code.hint}>...</span>
    </>,
    <>
        {'  '}
        <span className={styles.code.primary}>"autoupdate"</span>:{' {'}
    </>,
    <>
        {'    '}
        <span className={styles.code.primary}>"source"</span>:{' '}
        <span className={styles.code.secondary}>"npm"</span>,
    </>,
    <>
        {'    '}
        <span className={styles.code.primary}>"target"</span>:{' '}
        <span className={styles.code.secondary}>"my-library"</span>,
    </>,
    <>
        {'    '}
        <span className={styles.code.primary}>"fileMap"</span>: {'[{'}
    </>,
    <>
        {'      '}
        <span className={styles.code.primary}>"basePath"</span>:{' '}
        <span className={styles.code.secondary}>"dist"</span>,
    </>,
    <>
        {'      '}
        <span className={styles.code.primary}>"files"</span>: [
        <span className={styles.code.secondary}>"*.js"</span>]
    </>,
    <>
        {'    '}
        {'}]'}
    </>,
    <>
        {'  '}
        {'},'}
    </>,
    <>
        {'  '}
        <span className={styles.code.hint}>...</span>
    </>,
    '}',
].flatMap((line, i) => (i === 0 ? [line] : ['\n', line]));

/**
 * /about page component.
 */
export default () => {
    return (
        <div className={styles.container}>
            <Header
                title={
                    <>
                        About <strong>cdnjs</strong>
                    </>
                }
                prose={
                    <>
                        A free, open-source CDN for the web's most popular
                        JavaScript, CSS, and font resources &mdash; globally
                        cached on Cloudflare's network since 2011.
                    </>
                }
            />

            <ul className={styles.stats}>
                <li className={styles.stat}>
                    <strong>12.5%</strong> of all websites
                </li>

                <li className={styles.stat}>
                    <strong>250B+</strong> Requests per month
                </li>

                <li className={styles.stat}>
                    <strong>330+</strong> Edge locations
                </li>

                <li className={styles.stat}>
                    <strong>2011</strong> Founded
                </li>
            </ul>

            <div className={styles.section}>
                <h2 className={styles.heading} id="what-is-cdnjs">
                    What is cdnjs?
                </h2>

                <div className={styles.split}>
                    <div>
                        <p>
                            cdnjs is a free, open-source, and community-driven
                            CDN that makes it easy to include popular web
                            libraries in any project &mdash; no build step, no
                            npm install, just a single script or link tag.
                        </p>

                        <p>
                            Launched in 2011, it is one of the longest-running
                            public CDNs on the web. cdnjs believes in the power
                            of open source, with all the package configurations
                            and code behind the service available on GitHub.
                        </p>

                        <p>
                            While a CDN isn't the right tool for every occasion,
                            when it is, we're here for you (and your agent).
                        </p>
                    </div>

                    <div>
                        <p>
                            Every file is served directly from Cloudflare's
                            global network, ensuring fast response times for any
                            assets included on your website, with full support
                            for HTTP/3, HTTP/2, QUIC, and Brotli + GZIP
                            compression.
                        </p>

                        <p>
                            cdnjs is HSTS preloaded, ensuring all requests are
                            securely served over HTTPS, and Subresource
                            Integrity (SRI) hashes are provided for all script
                            and link tags to provide an additional layer of
                            security.
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading} id="adding-a-library">
                    Adding a library
                </h2>

                <div className={styles.split}>
                    <div>
                        <p>
                            cdnjs is different from some other public CDNs that
                            support on-demand pull-through access to libraries.
                            Instead, cdnjs is a curated CDN that only serves
                            libraries that have been added to the service to by
                            the community.
                        </p>

                        <p>
                            Adding a library to cdnjs is straightforward: open a
                            pull request to the{' '}
                            <a
                                href="https://github.com/cdnjs/packages"
                                rel="noopener"
                            >
                                cdnjs/packages repository
                            </a>{' '}
                            with a small JSON file describing the library. Once
                            approved and merged, cdnjs automation takes over —
                            new versions are picked up automatically as they are
                            published to npm or GitHub.
                        </p>

                        <p>
                            No manual uploads for each version, no waiting for a
                            maintainer to cut a release. The ingestion pipeline
                            checks for updates regularly and handles
                            minification, compression, SRI hash generation, and
                            publishing to the CDN automatically.
                        </p>
                    </div>

                    <div>
                        <pre className={styles.package}>
                            <code>{pkg}</code>
                        </pre>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading} id="team">
                    Team
                </h2>

                <div className={styles.team}>
                    <p>Maintained by</p>
                    <div />
                    <ul>
                        <li>
                            <a
                                href="https://github.com/MattIPv4"
                                rel="noopener"
                                title="@MattIPv4"
                            >
                                Matt Cowley
                            </a>
                        </li>
                        <div />
                        <li>
                            <a
                                href="https://blog.cloudflare.com/tag/cdnjs"
                                rel="noopener"
                            >
                                Cloudflare Engineering
                            </a>
                        </li>
                        <div />
                        <li>
                            <a href="https://github.com/cdnjs" rel="noopener">
                                You?
                            </a>
                        </li>
                    </ul>
                </div>

                <div className={styles.team}>
                    <p>Founded by</p>
                    <div />
                    <ul>
                        <li>
                            <a
                                href="https://github.com/ryankirkman"
                                rel="noopener"
                                title="@ryankirkman"
                            >
                                Ryan Kirkman
                            </a>
                        </li>
                        <div />
                        <li>
                            <a
                                href="https://github.com/thomasdavis"
                                rel="noopener"
                                title="@thomasdavis"
                            >
                                Thomas Davis
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.heading} id="sponsors">
                    Sponsors
                </h2>

                <p>
                    cdnjs is free to use because of the generosity of these
                    organisations. Their support covers infrastructure, tooling,
                    and monitoring.
                </p>

                <ul className={styles.sponsors}>
                    {sponsors.map((sponsor) => (
                        <li key={sponsor.name}>
                            <p>
                                <a href={sponsor.url('about')} rel="noopener">
                                    {sponsor.name}
                                </a>
                            </p>

                            {sponsor.message ? (
                                <p>{sponsor.message}</p>
                            ) : (
                                <p>
                                    <small>{sponsor.service}</small>
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
