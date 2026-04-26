import { css, cx } from '@emotion/css';
import { useEffect, useState } from 'react';
import * as z from 'zod/mini';

import theme from '../../theme.ts';
import withIsland from '../island.tsx';

const indicatorSchema = z.literal(['none', 'minor', 'major', 'critical']);
type Indicator = z.infer<typeof indicatorSchema>;

const statusSchema = z.object({
    status: z.object({
        indicator: indicatorSchema,
        description: z.string(),
    }),
});

const getStatus = async () => {
    const res = await fetch('https://status.cdnjs.com/api/v2/status.json');
    if (!res.ok) {
        throw new Error(
            `Failed to fetch status: ${res.status} ${res.statusText}`,
        );
    }

    const data = await res.json();
    return statusSchema.parse(data).status;
};

const styles: Record<Indicator | 'dot', string> = {
    dot: css`
        width: ${theme.spacing(1.25)};
        height: ${theme.spacing(1.25)};
        border-radius: 50%;
        opacity: 0;
        transition: opacity ${theme.transition};
    `,
    none: css`
        background-color: ${theme.status.none};
        opacity: 1;
    `,
    minor: css`
        background-color: ${theme.status.minor};
        opacity: 1;
    `,
    major: css`
        background-color: ${theme.status.major};
        opacity: 1;
    `,
    critical: css`
        background-color: ${theme.status.critical};
        opacity: 1;
    `,
};

const Status = () => {
    const [status, setStatus] = useState<{
        indicator: Indicator;
        description: string;
    } | null>(null);

    useEffect(() => {
        getStatus()
            .then(setStatus)
            .catch((err) => {
                console.error('Error fetching status:', err);
            });
    }, []);

    return (
        <div
            className={cx(
                styles.dot,
                status?.indicator && styles[status.indicator],
            )}
            title={status?.description}
        />
    );
};

export default withIsland(Status, 'status.tsx');
