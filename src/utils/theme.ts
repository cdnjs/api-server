const breakpoint = (value: number) =>
    `@media screen and (max-width: ${value * 8}px)`;

export default {
    text: {
        primary: '#ebebeb',
        secondary: '#a6a6a6',
        brand: '#d9643a',
    },
    background: {
        body: '#454647',
        footer: '#242525',
    },
    spacing: (value: number) => `${value * 8}px`,
    breakpoints: {
        medium: breakpoint(96),
    },
    font: {
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
