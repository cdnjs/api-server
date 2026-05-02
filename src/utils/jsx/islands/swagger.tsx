import { css } from '@emotion/css';
import SwaggerUI from 'swagger-ui-react';
import swaggerStyles from 'swagger-ui-react/swagger-ui.css';

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
const Swagger = ({ spec }: { spec: object }) => (
    <>
        <style
            dangerouslySetInnerHTML={{
                __html: `@layer { ${scopedSwaggerStyles} }`,
            }}
        />
        <div className={styles.container}>
            <SwaggerUI
                spec={spec}
                supportedSubmitMethods={['get']}
                tryItOutEnabled
                displayRequestDuration
            />
        </div>
    </>
);

export default createIsland(Swagger, 'swagger.tsx');
