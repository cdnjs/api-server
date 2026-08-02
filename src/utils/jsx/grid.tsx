import { css, keyframes } from '@emotion/css';

const size = 75;
const cols = 16;
const rows = 9;

const random = (min: number, max: number) => min + Math.random() * (max - min);

const dp = (val: number, places: number) =>
    Math.round((val + Number.EPSILON) * 10 ** places) / 10 ** places;

const path = (points: number[]) =>
    `M ${points
        .map((point) => {
            const col = point % cols;
            const row = Math.floor(point / cols);
            return `${col * size} ${row * size}`;
        })
        .join(' L ')}`;

// Decide which points are active and will be connected to their neighbours.
const active = Array.from({ length: cols * rows }, (_, point) => {
    const col = point % cols;
    const row = Math.floor(point / cols);

    const edge = col === 0 || col === cols - 1 || row === 0 || row === rows - 1;
    return Math.random() < (edge ? 0.3 : 0.5);
});

// Connect the active points to their neighbours (right, down + neighbours below).
const connections = active.reduce((acc, val, point) => {
    if (!val) return acc;

    const col = point % cols;
    const row = Math.floor(point / cols);

    // Connect to the right neighbour if it's active.
    if (col < cols - 1 && active[point + 1]) {
        acc.push([point, point + 1]);
    }

    // Connect to the bottom neighbour if it's active.
    if (row < rows - 1 && active[point + cols]) {
        acc.push([point, point + cols]);
    }

    // Only sometimes connect to the diagonal neighbours, when immediately below is not active.
    if (Math.random() < 0.5 && row < rows - 1 && !active[point + cols]) {
        // Connect to the bottom-right neighbour if it's active,
        if (col < cols - 1 && active[point + cols + 1]) {
            acc.push([point, point + cols, point + cols + 1]);
        }

        // Connect to the bottom-left neighbour if it's active.
        if (col > 0 && active[point + cols - 1]) {
            acc.push([point, point + cols, point + cols - 1]);
        }
    }

    return acc;
}, [] as number[][]);

// Assign animated requests to move along the connections
const requests = connections.reduce(
    (acc, points) => {
        // Only sometimes send a request from the start of the connection to the end.
        if (Math.random() < 0.5) {
            const duration = dp(random(2, 5), 2) * (points.length - 1);
            const delay = dp(random(-duration, 0), 2);
            acc.push([points, duration, delay]);

            // Only sometimes also send a request from the end of the connection to the start.
            if (Math.random() < 0.3) {
                const duration = dp(random(2, 5), 2) * (points.length - 1);
                const delay = dp(random(-duration, 0), 2);
                acc.push([[...points].reverse(), duration, delay]);
            }
        }

        return acc;
    },
    [] as [number[], number, number][],
);

// Check how many connections each active point has
const vias = connections.reduce(
    (acc, points) => {
        const start = points[0];
        if (start === undefined) return acc;
        acc[start] = (acc[start] ?? 0) + 1;

        const end = points[points.length - 1];
        if (end === undefined) return acc;
        acc[end] = (acc[end] ?? 0) + 1;

        return acc;
    },
    Array.from({ length: cols * rows }, () => 0),
);

const anims = {
    hub: keyframes`
        0% {
            transform: scale(1);
            opacity: 0.7;
        }

        50%, 100% {
            transform: scale(4);
            opacity: 0;
        }
    `,
    dot: keyframes`
        0% {
            opacity: 0.35;
        }

        50% {
            opacity: 0.7;
        }

        100% {
            opacity: 0.35;
        }
    `,
    request: keyframes`
        0% {
            offset-distance: 0%;
            opacity: 0;
        }

        5%, 95% {
            opacity: 1;
        }

        100% {
            offset-distance: 100%;
            opacity: 0;
        }
    `,
};

const styles = {
    grid: css`
        fill: currentColor;
        opacity: 0.2;
    `,
    connection: css`
        fill: none;
        stroke: currentColor;
        stroke-width: 1;
        opacity: 0.1;
    `,
    hub: css`
        fill: color-mix(in oklab, currentColor, transparent 80%);
        transform-box: fill-box;
        transform-origin: center;
        animation: ${anims.hub} linear infinite;
        will-change: transform, opacity;
    `,
    dot: css`
        animation: ${anims.dot} linear infinite;
        will-change: opacity;

        &:nth-child(1) {
            fill: currentColor;
        }

        &:nth-child(2) {
            fill: color-mix(in oklab, currentColor, white 35%);
        }
    `,
    request: css`
        animation: ${anims.request} linear infinite;
        will-change: offset-distance, opacity;

        &:nth-child(1) {
            fill: color-mix(in oklab, currentColor, transparent 65%);
            filter: blur(2.5px);
        }

        &:nth-child(2) {
            fill: color-mix(in oklab, currentColor, white 55%);
        }
    `,
};

/**
 * Homepage grid background
 *
 * @param props Component props.
 * @param props.width The number of columns to display in the grid.
 * @param props.height The number of rows to display in the grid.
 * @param props.className Optional additional class name(s) to apply to the logo.
 */
export default ({
    width = cols,
    height = rows,
    className,
}: {
    width?: number;
    height?: number;
    className?: string;
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        // The base viewBox would be `0 0 ${cols * size} ${rows * size}`
        // But, we want to center that around whatever width and height are passed in
        viewBox={`${(cols * size - width * size) / 2} ${(rows * size - height * size) / 2} ${width * size} ${height * size}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className={className}
    >
        <g>
            {Array.from({ length: cols * rows }, (_, point) => {
                const col = point % cols;
                const row = Math.floor(point / cols);

                return (
                    <circle
                        key={point}
                        cx={col * size}
                        cy={row * size}
                        r={1}
                        className={styles.grid}
                    />
                );
            })}
        </g>

        <g>
            {connections.map((points, idx) => (
                <path
                    key={idx}
                    d={path(points)}
                    className={styles.connection}
                />
            ))}
        </g>

        <g>
            {vias.map((via, point) => {
                if (!via) return null;

                const col = point % cols;
                const row = Math.floor(point / cols);
                const hub = via > 2;
                const duration = hub ? 2 : 4;
                const stagger = -dp((point * 0.4) % duration, 2);

                return (
                    <g key={point}>
                        {hub && (
                            <circle
                                cx={col * size}
                                cy={row * size}
                                r={8}
                                className={styles.hub}
                                style={{
                                    animationDuration: '3.5s',
                                    animationDelay: `${stagger}s`,
                                }}
                            />
                        )}
                        <circle
                            cx={col * size}
                            cy={row * size}
                            r={hub ? 4 : 2}
                            className={styles.dot}
                            style={{
                                animationDuration: `${duration}s`,
                                animationDelay: `${stagger}s`,
                            }}
                        />
                    </g>
                );
            })}
        </g>

        <g>
            {requests.map(([points, duration, delay], idx) => (
                <g key={idx}>
                    <circle
                        cx={0}
                        cy={0}
                        r={5}
                        className={styles.request}
                        style={{
                            offsetPath: `path('${path(points)}')`,
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                        }}
                    />
                    <circle
                        cx={0}
                        cy={0}
                        r={2}
                        className={styles.request}
                        style={{
                            offsetPath: `path('${path(points)}')`,
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                        }}
                    />
                </g>
            ))}
        </g>
    </svg>
);
