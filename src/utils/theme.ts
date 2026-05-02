const breakpoint = (value: number) =>
    `@media screen and (max-width: ${value * 8}px)`;

export default {
    text: {
        primary: '#ebebeb',
        inverted: '#141515',
        secondary: '#a6a6a6',
        brand: '#d9643a',
    },
    background: {
        body: '#454647',
        navigation: '#343535',
        footer: '#242525',
        brand: '#d9643a',
    },
    status: {
        none: '#2ecc71',
        minor: '#f1c40f',
        major: '#e67e22',
        critical: '#e74c3c',
    },
    spacing: (...values: number[]) =>
        values.map((value) => `${value * 8}px`).join(' '),
    breakpoints: {
        medium: breakpoint(96),
    },
    font: {
        large: {
            size: '1.25rem',
            weight: 400,
        },
        body: {
            size: '1rem',
            weight: 400,
        },
        small: {
            size: '0.875rem',
            weight: 400,
        },
    },
    radius: '4px',
    transition: '0.2s ease-in-out',
};
