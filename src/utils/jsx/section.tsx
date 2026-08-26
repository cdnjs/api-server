import { css } from '@emotion/css';
import type { ReactNode } from 'react';

import theme from '../theme.ts';

const styles = {
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
};

/**
 * Styled section component with heading and underline.
 *
 * @param props Section props.
 * @param props.id Optional ID for the heading.
 * @param props.title Section title.
 * @param props.children Section content.
 */
export default ({
    id,
    title,
    children,
}: {
    id?: string;
    title: string;
    children: ReactNode;
}) => (
    <div className={styles.section}>
        <h2 className={styles.heading} id={id}>
            {title}
        </h2>

        {children}
    </div>
);
