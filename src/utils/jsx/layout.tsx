import type { Child } from 'hono/jsx';

/**
 * Standard cdnjs HTML layout.
 *
 * @param props Component props.
 * @param props.children Content to be included in the body of the page.
 */
export default ({ children }: { children?: Child }) => (
    <html>
        <head>
            <meta name="robots" content="noindex" />
        </head>
        <body>
            {children}
            <script
                defer
                dangerouslySetInnerHTML={{
                    __html: 'console.log("%cThanks for using cdnjs! 😊", "font-size: 5em; font-family: ui-sans-serif, system-ui, sans-serif; color: #e95420;");',
                }}
            />
        </body>
    </html>
);
