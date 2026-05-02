import { css } from '@emotion/css';
import { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import swaggerStyles from 'swagger-ui-react/swagger-ui.css';

import theme from '../../theme.ts';
import createIsland from '../island.tsx';

const styles = {
    container: css`
        .swagger-ui {
            .scheme-container {
                display: none;
            }

            button {
                color: inherit;

                svg {
                    fill: currentColor;
                }
            }
        }
    `,
    loader: css`
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity ${theme.transition};
        transition-delay: 0.5s;

        @starting-style {
            opacity: 0;
        }
    `,
};

const scopedSwaggerStyles = swaggerStyles
    .replace(/(?<=[{;]\s*)color:\s*[^;]+;/g, '')
    .replace(/\.swagger-ui(?![\w-])/g, `.${styles.container} .swagger-ui`);

/**
 * Custom Swagger UI island component to render the OpenAPI spec for the API documentation page.
 *
 * @param props Component props.
 * @param props.spec OpenAPI specification to render.
 */
const Swagger = ({ spec }: { spec: object }) => {
    const [loading, setLoading] = useState(true);

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `@layer { ${scopedSwaggerStyles} }`,
                }}
            />
            <div className={styles.container}>
                <SwaggerUI
                    spec={spec}
                    onComplete={() => setLoading(false)}
                    supportedSubmitMethods={['get']}
                    tryItOutEnabled
                    displayRequestDuration
                />
            </div>
            {loading && (
                <div className={styles.loader}>
                    Loading OpenAPI specification...
                </div>
            )}
        </>
    );
};

export default createIsland(Swagger, 'swagger.tsx');
