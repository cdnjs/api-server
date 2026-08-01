import { css } from '@emotion/css';

import Header from '../utils/jsx/header.tsx';
import Typeahead from '../utils/jsx/islands/typeahead.tsx';
import theme from '../utils/theme.ts';

const styles = {
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
                    <br /> Trusted by <strong>12.5% of all websites</strong>,
                    serving <strong>250 billion requests per month</strong>.
                </>
            }
            fill
        >
            <Typeahead className={styles.search} />
        </Header>
    );
};
