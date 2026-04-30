import { css, cx } from '@emotion/css';

import theme from '../theme.ts';

const styles = {
    pre: css`
        margin: 0;
    `,
    code: css`
        border-radius: ${theme.radius};
    `,
};

/**
 * Standard cdnjs HTML layout for pretty-printing JSON data.
 *
 * @param props Component props.
 * @param props.json Data to be pretty-printed on the page.
 */
export default ({ json }: { json: unknown }) => (
    <>
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css"
            integrity="sha512-hasIneQUHlh06VNBe7f6ZcHmeRTLIaQWFd43YriJ0UND19bvYRauxthDg8E4eVNPm9bRUhr5JGeqH7FRFXQu5g=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
        />

        <pre className={styles.pre}>
            <code className={cx(styles.code, 'language-json')}>
                {JSON.stringify(json, null, 2)}
            </code>
        </pre>

        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"
            integrity="sha512-EBLzUL8XLl+va/zAsmXwS7Z2B1F9HUHkZwyS/VKwh3S7T/U0nF4BaU29EP/ZSf6zgiIxYAnKLu6bJ8dqpmX5uw=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
        />
        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/json.min.js"
            integrity="sha512-f2/ljYb/tG4fTHu6672tyNdoyhTIpt4N1bGrBE8ZjwIgrjDCd+rljLpWCZ2Vym9PBWQy2Tl9O22Pp2rMOMvH4g=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
        />
        <script
            defer
            dangerouslySetInnerHTML={{
                __html: 'hljs.highlightAll();',
            }}
        />
    </>
);
