import { css } from '@emotion/css';

import Header from '../utils/jsx/header.tsx';
import Swagger from '../utils/jsx/islands/swagger.tsx';
import Section from '../utils/jsx/section.tsx';
import theme from '../utils/theme.ts';

import type { OpenApiResponse } from './api.schema.ts';

const styles = {
    container: css`
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: ${theme.spacing(0, 0, 2)};
    `,
    header: css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing(2)};
        padding: ${theme.spacing(2, 0)};

        p {
            color: ${theme.text.secondary};
            font-family: ${theme.font.families.mono};
            font-size: ${theme.font.tiny.size};
            font-weight: ${theme.font.tiny.weight};
            text-transform: uppercase;
            margin: 0;
        }

        code {
            background: ${theme.background.primary};
            border-radius: ${theme.radius};
            color: ${theme.text.primary};
            font-family: ${theme.font.families.mono};
            font-size: ${theme.font.small.size};
            font-weight: ${theme.font.small.weight};
            text-transform: none;
            padding: ${theme.spacing(0.5, 1)};
            margin: ${theme.spacing(0, 0.25)};
        }
    `,
    swagger: css`
        min-height: ${theme.spacing(90)};
    `,
};

/**
 * /api page component.
 *
 * @param props Page props.
 * @param props.data OpenAPI response data.
 */
export default ({ data }: { data: OpenApiResponse }) => {
    return (
        <div className={styles.container}>
            <Header
                title={
                    <>
                        Query <strong>cdnjs</strong>
                    </>
                }
            >
                <div className={styles.header}>
                    <p>
                        Base URL <code>https://api.cdnjs.com</code>
                    </p>
                    <p>No authentication required</p>
                </div>
            </Header>

            <Swagger spec={data} className={styles.swagger} />

            <Section id="operating-a-mirror" title="Operating a mirror?">
                <p>
                    If you run a mirror of cdnjs and would like read-only S3
                    credentials to our Cloudflare R2 bucket for faster syncing,
                    please open an issue in the{' '}
                    <a href="https://github.com/cdnjs/cdnjs" rel="noopener">
                        cdnjs/cdnjs repository
                    </a>{' '}
                    and we'll be happy to help.
                </p>
            </Section>
        </div>
    );
};
