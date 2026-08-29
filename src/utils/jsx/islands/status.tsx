import { css, cx } from '@emotion/css';
import { useCallback, useEffect, useState } from 'react';
import * as z from 'zod/mini';

import theme from '../../theme.ts';
import createIsland from '../island.tsx';

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
        background-color: ${theme.background.primary};
        transition: background-color ${theme.transition};
    `,
    none: css`
        background-color: ${theme.status.none};
    `,
    minor: css`
        background-color: ${theme.status.minor};
    `,
    major: css`
        background-color: ${theme.status.major};
    `,
    critical: css`
        background-color: ${theme.status.critical};
    `,
};

const Status = () => {
    const [status, setStatus] = useState<{
        indicator: Indicator;
        description: string;
    } | null>(null);

    const [visible, setVisible] = useState(false);
    const ref = useCallback((node: HTMLDivElement) => {
        const observer = new IntersectionObserver(([entry]) =>
            setVisible(entry?.isIntersecting ?? false),
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;

        const update = () =>
            getStatus()
                .then(setStatus)
                .catch((err) => {
                    console.error('Error fetching status:', err);
                });

        update();
        const interval = setInterval(update, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [visible]);

    return (
        <div
            className={cx(
                styles.dot,
                status?.indicator && styles[status.indicator],
            )}
            title={status?.description}
            ref={ref}
        />
    );
};

export default createIsland(Status, 'status.tsx');
