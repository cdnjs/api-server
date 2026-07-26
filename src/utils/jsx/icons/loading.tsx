import theme from '../../theme.ts';

const IconLoading = ({
    color,
    className,
}: {
    color?: string;
    className?: string;
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <g>
            <circle cx="12" cy="12" r="9" strokeWidth={1.5} opacity={0.25} />
            <path
                stroke={color || theme.text.brand}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3a9 9 0 0 1 9 9"
            />

            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
            />
        </g>
    </svg>
);

export default IconLoading;
