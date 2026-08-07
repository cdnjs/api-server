import { css } from '@emotion/css';
import { env } from 'cloudflare:workers';

import Header from '../utils/jsx/header.tsx';
import Typeahead from '../utils/jsx/islands/typeahead.tsx';
import theme from '../utils/theme.ts';

const styles = {
    search: css`
        width: ${theme.spacing(80)};
        max-width: 100%;
    `,
};

const jsonld = {
    name: 'cdnjs',
    alternateName: 'CDNJS',
    description:
        "cdnjs is the free, open-source CDN for the web's most popular libraries. JavaScript, CSS, and font resources, globally cached on Cloudflare's network. Trusted by 12.5% of all websites, serving 250 billion requests per month.",
    url: 'https://cdnjs.com',
    sameAs: [
        'https://github.com/cdnjs',
        'https://twitter.com/cdnjs',
        'https://linkedin.com/company/cdnjs',
        'https://en.wikipedia.org/wiki/cdnjs',
    ],
    image: `${env.WEBSITE_BASE}/favicon.png`,
};

/**
 * / page component.
 */
export default () => {
    return (
        <>
            <Header
                title={
                    <>
                        The free CDN for
                        <br /> <strong>open source libraries.</strong>
                    </>
                }
                prose={
                    <>
                        JavaScript, CSS, and font resources, globally cached on
                        Cloudflare's network.
                        <br /> Trusted by <strong>12.5% of all websites</strong>
                        , serving{' '}
                        <strong>250 billion requests per month</strong>.
                    </>
                }
                fill
                extra={<Typeahead className={styles.search} />}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        '@id': '#website',
                        ...jsonld,
                        thumbnailUrl: `${env.WEBSITE_BASE}/banner.png`,
                        owner: {
                            '@context': 'http://schema.org',
                            '@type': 'Organization',
                            '@id': '#organization',
                            ...jsonld,
                            logo: `${env.WEBSITE_BASE}/favicon.png`,
                            foundingDate: '2011-02-25',
                        },
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: `${env.WEBSITE_BASE}/libraries?search={search_term_string}`,
                            'query-input': 'required name=search_term_string',
                        },
                    }),
                }}
            />
        </>
    );
};
